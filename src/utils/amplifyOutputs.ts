import exampleOutputs from '../amplify_outputs.example.json';

export type AmplifyOutputs = {
  version?: string;
  auth?: Record<string, unknown>;
  data?: {
    url?: string;
    aws_region?: string;
    default_authorization_type?: string;
    authorization_types?: string[];
  };
  storage?: {
    aws_region?: string;
    bucket_name?: string;
  };
};

// Written by the Amplify Hosting build (see amplify.yml) and gitignored; absent locally unless copied in.
const generated = import.meta.glob<AmplifyOutputs>('../amplify_outputs.json', { eager: true, import: 'default' });

/**
 * The branch's deployed Gen 2 outputs when present, otherwise the committed staging outputs.
 * To develop against a sandbox, copy the root `amplify_outputs.json` from `npm run sandbox` to `src/`.
 */
export function loadAmplifyOutputs(): AmplifyOutputs {
  return Object.values(generated)[0] ?? (exampleOutputs as AmplifyOutputs);
}
