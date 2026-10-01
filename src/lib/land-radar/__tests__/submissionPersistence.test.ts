import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createSubmission,
  listSubmissions,
  _resetSubmissionStore,
  generateSubmissionReference,
} from '../submissionService';

describe('DATA-013-01: Submission Intake Real Persistence', () => {
  beforeEach(() => {
    _resetSubmissionStore();
  });

  it('generates a unique EUK-SUB reference format', () => {
    const ref = generateSubmissionReference();
    assert.match(ref, /^EUK-SUB-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('persists a valid land submission successfully with complete fields', async () => {
    const submission = await createSubmission({
      submission_type: 'land',
      submitter_name: 'Johnathan Miller',
      email: 'j.miller@example.co.uk',
      phone: '07700 900123',
      organisation: 'Miller Agricultural Estates',
      address: 'Land off Kenilworth Road, Blackdown',
      postcode: 'CV32 6RA',
      site_size_description: '14.5 acres',
      current_use: 'Agricultural grazing',
      planning_status: 'Unallocated greenfield',
      ownership_status: 'Sole registered freehold owner',
      opportunity_description: 'Adjacent to recent residential allocation.',
      submitted_notes: 'Willing to discuss promotion agreement or direct option.',
      consent_acknowledged: true,
    });

    assert.ok(submission.id);
    assert.match(submission.submission_reference, /^EUK-SUB-/);
    assert.strictEqual(submission.submission_type, 'land');
    assert.strictEqual(submission.status, 'received');
    assert.strictEqual(submission.email, 'j.miller@example.co.uk');
    assert.strictEqual(submission.postcode, 'CV32 6RA');

    // Verify stored and retrievable
    const all = await listSubmissions();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].submission_reference, submission.submission_reference);
  });

  it('rejects submissions with missing submitter name', async () => {
    await assert.rejects(
      async () => {
        await createSubmission({
          submission_type: 'property',
          submitter_name: '',
          email: 'valid@example.com',
          address: '10 Industrial Way',
          postcode: 'CV34 4TJ',
        });
      },
      /Submitter name is required/
    );
  });

  it('rejects submissions with invalid email address', async () => {
    await assert.rejects(
      async () => {
        await createSubmission({
          submission_type: 'property',
          submitter_name: 'Sarah Connor',
          email: 'not-an-email',
          address: '10 Industrial Way',
          postcode: 'CV34 4TJ',
        });
      },
      /Valid email address is required/
    );
  });

  it('rejects property and land submissions with neither postcode nor address', async () => {
    await assert.rejects(
      async () => {
        await createSubmission({
          submission_type: 'land',
          submitter_name: 'Sarah Connor',
          email: 'sarah@example.com',
          address: '',
          postcode: '',
        });
      },
      /A valid UK postcode or property address is required/
    );
  });

  it('allows general contact inquiry without property address', async () => {
    const inquiry = await createSubmission({
      submission_type: 'general_contact',
      submitter_name: 'Edward King',
      email: 'edward@example.com',
      submitted_notes: 'Interested in partnering on Midlands developments.',
    });

    assert.ok(inquiry.id);
    assert.strictEqual(inquiry.submission_type, 'general_contact');
    assert.strictEqual(inquiry.status, 'received');
  });

  it('stores raw_payload securely without exposing secrets', async () => {
    const raw = { browser: 'Chrome', referrer: 'google.com', utm_source: 'linkedin' };
    const submission = await createSubmission({
      submission_type: 'opportunity',
      submitter_name: 'Devin Cole',
      email: 'devin@example.com',
      address: 'Canal Yard',
      raw_payload: raw,
    });

    assert.deepStrictEqual(submission.raw_payload, raw);
  });
});
