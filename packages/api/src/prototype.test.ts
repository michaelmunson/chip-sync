import { describe, expect, it, vi } from 'vitest';
import { createPrototypeApi, type GraphQLTransport, type Site } from './prototype';

const transport = (query: GraphQLTransport['query']): GraphQLTransport => ({ query, subscribe: vi.fn() });

describe('native prototype API', () => {
  it('loads the existing Cognito subject without creating another account', async () => {
    const profile = { id: 'existing-sub', role: 'gardner', organization: null };
    const query = vi.fn().mockResolvedValue({ getUser: profile });
    expect(await createPrototypeApi(transport(query)).profile('existing-sub')).toBe(profile);
    expect(query.mock.calls[0][1]).toEqual({ id: 'existing-sub' });
  });
  it('reports incomplete registration and missing records', async () => {
    const api = createPrototypeApi(transport(vi.fn().mockResolvedValue({ getUser: null, getMarker: null })));
    await expect(api.profile('subject')).rejects.toThrow('no Chip Sync profile');
    await expect(api.site('missing')).rejects.toThrow('not found');
  });
  it('preserves legacy drop sites and normalizes missing images', async () => {
    const api = createPrototypeApi(transport(vi.fn().mockResolvedValue({ getMarker: { id: 'legacy' } })));
    expect(await api.site('legacy')).toMatchObject({ id: 'legacy', kind: 'dropSite', images: [] });
  });
  it('filters subscriptions to the selected record and returns the cleanup', () => {
    let deliver!: (value: { onUpdateMarker: Site | null }) => void;
    const stop = vi.fn();
    const subscribe = vi.fn((_document, variables, next) => {
      expect(variables).toEqual({ filter: { id: { eq: 'selected' } } });
      deliver = next;
      return stop;
    });
    const next = vi.fn();
    const api = createPrototypeApi({ query: vi.fn(), subscribe } as GraphQLTransport);
    const cleanup = api.watchSite('selected', next, vi.fn());
    deliver({ onUpdateMarker: null });
    deliver({ onUpdateMarker: { id: 'other' } as Site });
    expect(next).not.toHaveBeenCalled();
    deliver({ onUpdateMarker: { id: 'selected' } as Site });
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith({ id: 'selected', images: [], kind: 'dropSite' });
    cleanup();
    expect(stop).toHaveBeenCalledOnce();
  });
});
