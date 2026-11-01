import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import Constants from 'expo-constants';
import { createPrototypeApi, type GraphQLTransport } from '@chip-sync/api';
import type { AppEnvironment, MobileOutputs } from '../../config/environment';

export interface MobileConfiguration {
  environment: AppEnvironment;
  outputs: MobileOutputs;
}

export function initializeRuntime() {
  const config = Constants.expoConfig?.extra?.chipSync as MobileConfiguration | undefined;
  if (!config?.outputs || !config.environment) throw new Error('Mobile AWS configuration is missing. See docs/expo-foundation.md.');
  // Runs before generateClient, including after a cold launch.
  Amplify.configure(config.outputs as Parameters<typeof Amplify.configure>[0]);
  const client = generateClient();
  const transport: GraphQLTransport = {
    async query<T>(query: string, variables: Record<string, unknown>) {
      const result = await client.graphql({ query, variables, authMode: 'userPool' });
      if ('errors' in result && result.errors?.length) throw new Error('The API could not complete the request. Please retry.');
      return ('data' in result ? result.data : undefined) as T;
    },
    subscribe<T>(query: string, variables: Record<string, unknown>, next: (data: T) => void, error: (error: unknown) => void) {
      // The string-operation API requires an explicit subscription result type.
      const observable = client.graphql({ query, variables, authMode: 'userPool' }) as unknown as {
        subscribe(observer: { next: (result: { data: T; errors?: unknown[] }) => void; error: (error: unknown) => void }): { unsubscribe(): void };
      };
      const subscription = observable.subscribe({
        next: result => result.errors?.length ? error(new Error('Subscription update failed. Please retry.')) : next(result.data),
        error,
      });
      return () => subscription.unsubscribe();
    },
  };
  return { config, api: createPrototypeApi(transport) };
}
export type Runtime = ReturnType<typeof initializeRuntime>;
