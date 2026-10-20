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

/** Committed staging outputs; after `npm run sandbox`, copy root `amplify_outputs.json` here or to `src/amplify_outputs.json` and point this import at it. */
export function loadAmplifyOutputs(): AmplifyOutputs {
  return exampleOutputs as AmplifyOutputs;
}
