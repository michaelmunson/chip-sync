import { describe, expect, it } from 'vitest';
import { addDaysISO, isJobSiteActive, markerKind, matchesMaterialFilter, materialFilterFromProduces } from './markers';

describe('shared map rules', () => {
  it('retains legacy site kinds and material behavior', () => {
    expect(markerKind({})).toBe('dropSite');
    expect(markerKind({ kind: 'future-kind' })).toBe('dropSite');
    expect(matchesMaterialFilter('both', 'chips')).toBe(true);
    expect(matchesMaterialFilter('chips', 'both')).toBe(false);
    expect(materialFilterFromProduces(['wood', 'chips'])).toBe('both');
  });
  it('includes the final job-site day and handles month boundaries', () => {
    expect(isJobSiteActive({ kind: 'jobSite', endDate: '2026-10-22' }, '2026-10-22')).toBe(true);
    expect(isJobSiteActive({ kind: 'jobSite', endDate: '2026-10-21' }, '2026-10-22')).toBe(false);
    expect(isJobSiteActive({ kind: 'facility', endDate: '2020-01-01' }, '2026-10-22')).toBe(true);
    expect(addDaysISO('2026-01-31', 1)).toBe('2026-02-01');
  });
});
