import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RUGBY_PILOT, getPilotConfig, getAllPilots } from '../pilot/config';
import { runPilot } from '../pilot/runPilot';

describe('Second Geographic Pilot — Rugby Borough EUK-PILOT-002 (Phase 7)', () => {
  it('registers Rugby Borough pilot configuration in the registry', () => {
    const pilot = getPilotConfig('EUK-PILOT-002');
    assert.ok(pilot);
    assert.strictEqual(pilot.lpaCode, 'rugby');
    assert.strictEqual(pilot.geographyName, 'Rugby Borough');
    assert.strictEqual(pilot.screeningStrategy, 'RESIDENTIAL_DEVELOPMENT_V1');
  });

  it('provides multi-pilot enumeration via getAllPilots()', () => {
    const pilots = getAllPilots();
    assert.ok(pilots.length >= 2);
    assert.ok(pilots.some((p) => p.id === 'EUK-PILOT-001'));
    assert.ok(pilots.some((p) => p.id === 'EUK-PILOT-002'));
  });

  it('runs complete end-to-end screening for EUK-PILOT-002', async () => {
    const summary = await runPilot({
      pilotId: RUGBY_PILOT.id,
      dryRun: true,
    });

    assert.strictEqual(summary.pilotId, 'EUK-PILOT-002');
    assert.strictEqual(summary.geographyName, 'Rugby Borough');
    assert.strictEqual(summary.datasetsSucceeded.length, 10);
    assert.ok(summary.recordsIngested > 0);
    assert.ok(summary.sitesEvaluated > 0);
    assert.ok(summary.sitesPassedScreening > 0);
    assert.ok(summary.opportunitiesGenerated > 0);

    // Candidates in Rugby must have canonical references
    const sample = summary.sampleCandidates[0];
    assert.ok(sample.siteReference.startsWith('EUK-S-RUGBY-'));
    assert.ok(sample.priority);
    assert.ok(sample.priorityReasons && sample.priorityReasons.length > 0);
  });
});
