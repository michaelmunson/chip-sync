import { defineBackend } from '@aws-amplify/backend';
import { StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { notify } from './functions/notify/resource';
import { storage } from './storage/resource';

/** H2H API login used to send texts / emails (JSON with the H2H username + password). */
const H2H_SECRET_ARN = 'arn:aws:secretsmanager:us-east-1:611118723662:secret:chipsync/h2h_creds-XxNADo';

/**
 * Amplify Gen 2 backend. Deploy with `npm run sandbox`.
 * To migrate existing Gen 1 cloud resources in-place, use the Gen 1 CLI:
 * `amplify gen2-migration generate` (see amplify-gen1-backup/).
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  notify,
});

// Text / email notifications: every in-app Notification row is also a trigger for `notify`,
// which checks the recipient's settings before sending anything.
const { cfnResources, tables } = backend.data.resources;
cfnResources.amplifyDynamoDbTables['Notification'].streamSpecification = {
  streamViewType: StreamViewType.NEW_IMAGE,
};

const notifyLambda = backend.notify.resources.lambda;
notifyLambda.addEventSource(
  new DynamoEventSource(tables['Notification'], {
    startingPosition: StartingPosition.LATEST,
    batchSize: 10,
    retryAttempts: 2,
  }),
);
tables['User'].grantReadData(notifyLambda);
backend.notify.addEnvironment('USER_TABLE_NAME', tables['User'].tableName);
backend.notify.addEnvironment('H2H_SECRET_ARN', H2H_SECRET_ARN);
notifyLambda.addToRolePolicy(
  new PolicyStatement({ actions: ['secretsmanager:GetSecretValue'], resources: [H2H_SECRET_ARN] }),
);
