/**
 * Land Radar — Market Comparable Engine
 *
 * Deterministically identifies and tiers nearby residential property transactions
 * from HM Land Registry Price Paid Data.
 *
 * CRITICAL PRINCIPLES:
 * 1. Factual transaction evidence only.
 * 2. NO automated valuations, GDVs, or residual land values.
 * 3. Epistemic rule: Absence of transaction != Absence of market.
 * 4. Explicit relevance tiering: Directly Relevant (<=500m), Contextual (500m-1500m), Weak (>1500m).
 */

import {
  GeoJSON,
  PricePaidRecord,
  ComparableMatch,
  ComparableRelevanceTier,
  MarketEvidenceSummary,
  PropertyType,
} from '../types';
import { IngestedPricePaidRecord } from '../adapters/types';
import { classifyMarketStrength } from './marketClassifier';

export interface ComparableEngineOptions {
  searchRadiusM?: number;       // default 1500m
  maxMonths?: number;          // default 36 months
  coverageStatus?: 'known' | 'partial' | 'unknown';
}

function extractCentroid(geom: any): [number, number] {
  if (!geom) return [-1.5410, 52.2855]; // fallback center
  if (geom.type === 'Point' && Array.isArray(geom.coordinates)) {
    return [geom.coordinates[0], geom.coordinates[1]];
  }
  let sumX = 0, sumY = 0, count = 0;
  function traverse(coords: any) {
    if (typeof coords[0] === 'number') {
      sumX += coords[0];
      sumY += coords[1];
      count++;
    } else if (Array.isArray(coords)) {
      for (const item of coords) traverse(item);
    }
  }
  traverse(geom.coordinates);
  if (count === 0) return [-1.5410, 52.2855];
  return [sumX / count, sumY / count];
}

function calculateDistanceM(p1: [number, number], p2: [number, number]): number {
  // Approximate planar distance in metres for UK Midlands latitude (~52 deg N)
  // 1 deg lat ~ 111,000m, 1 deg lon ~ 68,000m
  const dLat = (p1[1] - p2[1]) * 111000;
  const dLon = (p1[0] - p2[0]) * 68000;
  return Math.round(Math.sqrt(dLat * dLat + dLon * dLon));
}

function calculateMonthsDiff(dateStr: string, referenceDate: Date = new Date()): number {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 999;
  return Math.max(0, (referenceDate.getFullYear() - d.getFullYear()) * 12 + (referenceDate.getMonth() - d.getMonth()));
}

function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
}

function normaliseRecord(r: PricePaidRecord | IngestedPricePaidRecord): PricePaidRecord {
  if ('dateOfTransfer' in r) {
    return {
      id: r.transactionId,
      transaction_id: r.transactionId,
      price: r.price,
      date_of_transfer: r.dateOfTransfer,
      postcode: r.postcode,
      property_type: r.propertyType,
      new_build: r.newBuild,
      tenure: r.tenure,
      paon: r.paon,
      saon: r.saon,
      street: r.street,
      locality: r.locality,
      town_city: r.townCity,
      district: r.district,
      county: r.county,
      geometry: r.geometry,
      source: r.sourceId,
      licence: 'OGL-v3.0',
      retrieval_mode: 'local_fixture',
    };
  }
  return r;
}

export function matchComparablesToSite(
  site: {
    id: string;
    internal_reference?: string;
    geometry?: GeoJSON.Geometry | null;
  },
  transactions: Array<PricePaidRecord | IngestedPricePaidRecord>,
  options: ComparableEngineOptions = {}
): MarketEvidenceSummary {
  const searchRadiusM = options.searchRadiusM ?? 1500;
  const maxMonths = options.maxMonths ?? 36;
  const coverageStatus = options.coverageStatus ?? (transactions.length > 0 ? 'known' : 'unknown');

  const siteCenter = extractCentroid(site.geometry);
  const matchedComparables: ComparableMatch[] = [];

  const propertyTypeDistribution: Record<PropertyType, number> = {
    detached: 0,
    semi_detached: 0,
    terraced: 0,
    flat: 0,
    other: 0,
  };

  const prices: number[] = [];
  let newBuildCount = 0;
  let directlyRelevantCount = 0;
  let contextualCount = 0;

  for (const rawTx of transactions) {
    const tx = normaliseRecord(rawTx);
    const txCoords = extractCentroid(tx.geometry);
    const distanceM = calculateDistanceM(siteCenter, txCoords);

    if (distanceM > searchRadiusM) continue;

    const ageMonths = calculateMonthsDiff(tx.date_of_transfer);
    if (ageMonths > maxMonths) continue;

    // Determine relevance tier
    let tier: ComparableRelevanceTier;
    let rationale: string;

    if (distanceM <= 500 && ageMonths <= 24) {
      tier = 'directly_relevant';
      rationale = `Within 500m (${distanceM}m) and sold within last 24 months (${tx.date_of_transfer}). Highly relevant local evidence.`;
      directlyRelevantCount++;
    } else if (distanceM <= 1500 && ageMonths <= 36) {
      tier = 'contextual';
      rationale = `Within wider corridor (${distanceM}m, ${ageMonths} mos old). Provides contextual pricing evidence for the micro-market.`;
      contextualCount++;
    } else {
      tier = 'weak';
      rationale = `Peripheral transaction (${distanceM}m, ${ageMonths} mos old). Weak direct applicability.`;
    }

    matchedComparables.push({
      id: `match-${site.id}-${tx.transaction_id}`,
      site_id: site.id,
      transaction: tx,
      distance_m: distanceM,
      relevance_tier: tier,
      relevance_rationale: rationale,
    });

    prices.push(tx.price);
    if (tx.new_build) newBuildCount++;
    if (propertyTypeDistribution[tx.property_type] !== undefined) {
      propertyTypeDistribution[tx.property_type]++;
    } else {
      propertyTypeDistribution.other++;
    }
  }

  // Sort comparables by distance ascending
  matchedComparables.sort((a, b) => a.distance_m - b.distance_m);

  // Calculate statistics
  prices.sort((a, b) => a - b);
  const sampleSize = prices.length;
  const medianPrice = sampleSize > 0 ? calculatePercentile(prices, 50) : null;
  const p25Price = sampleSize > 0 ? calculatePercentile(prices, 25) : null;
  const p75Price = sampleSize > 0 ? calculatePercentile(prices, 75) : null;
  const minPrice = sampleSize > 0 ? prices[0] : null;
  const maxPrice = sampleSize > 0 ? prices[sampleSize - 1] : null;
  const newBuildPercentage = sampleSize > 0 ? Math.round((newBuildCount / sampleSize) * 100) : null;

  // Transaction dates
  let earliestDate: string | null = null;
  let latestDate: string | null = null;
  if (matchedComparables.length > 0) {
    const dates = matchedComparables.map((c) => c.transaction.date_of_transfer).sort();
    earliestDate = dates[0];
    latestDate = dates[dates.length - 1];
  }

  // Market classification
  const classificationResult = classifyMarketStrength({
    sampleSize,
    directlyRelevantCount,
    contextualCount,
    medianPrice,
    minPrice,
    maxPrice,
    newBuildCount,
    coverageStatus,
  });

  return {
    sample_size: sampleSize,
    directly_relevant_count: directlyRelevantCount,
    contextual_count: contextualCount,
    median_price: medianPrice,
    p25_price: p25Price,
    p75_price: p75Price,
    min_price: minPrice,
    max_price: maxPrice,
    new_build_count: newBuildCount,
    new_build_percentage: newBuildPercentage,
    property_type_distribution: propertyTypeDistribution,
    search_radius_m: searchRadiusM,
    observation_period_months: maxMonths,
    earliest_transaction_date: earliestDate,
    latest_transaction_date: latestDate,
    market_strength: classificationResult.classification,
    rationale: classificationResult.rationale,
    comparables: matchedComparables,
  };
}
