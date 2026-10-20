import { loadAmplifyOutputs } from './amplifyOutputs';

export function getAppSyncRealtimeEndpoints() {
  const outputs = loadAmplifyOutputs();
  const graphqlUrl = outputs.data?.url;
  if (!graphqlUrl) {
    throw new Error('Amplify data URL is not configured in amplify_outputs');
  }

  const host = graphqlUrl.replace('https://', '').replace('/graphql', '');
  const wsUrl = graphqlUrl
    .replace('https://', 'wss://')
    .replace('.appsync-api.', '.appsync-realtime-api.');

  return { wsUrl, host };
}
