import { defineBackend } from '@aws-amplify/backend';
import { Stack } from 'aws-cdk-lib';
import { CfnEventSourceMapping } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
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
//
// Amplify already creates each model table with a NEW_AND_OLD_IMAGES stream, so there's no need
// to configure one. But don't use `tables['Notification'].tableStreamArn` (what DynamoEventSource
// reads): Amplify's table manager reports the stream ARN it saw *before* updating the stream, so
// after any stream change CloudFormation holds a disabled stream's ARN and the event source
// mapping fails with "Stream ... is Disabled". Instead, ask DynamoDB for the table's current
// stream on every deploy, after the table has been updated.
const { tables } = backend.data.resources;
const notificationTable = tables['Notification'];
const notifyLambda = backend.notify.resources.lambda;
const dataStack = Stack.of(notifyLambda);

const currentStream = new AwsCustomResource(dataStack, 'NotificationTableCurrentStream', {
  onUpdate: {
    service: 'DynamoDB',
    action: 'describeTable',
    parameters: { TableName: notificationTable.tableName },
    outputPaths: ['Table.LatestStreamArn'],
    // New id each synth, so the lookup re-runs on every deploy.
    physicalResourceId: PhysicalResourceId.of(`notification-stream-${Date.now()}`),
  },
  policy: AwsCustomResourcePolicy.fromStatements([
    new PolicyStatement({ actions: ['dynamodb:DescribeTable'], resources: [notificationTable.tableArn] }),
  ]),
  installLatestAwsSdk: false,
});

notifyLambda.addToRolePolicy(
  new PolicyStatement({
    actions: ['dynamodb:DescribeStream', 'dynamodb:GetRecords', 'dynamodb:GetShardIterator', 'dynamodb:ListStreams'],
    resources: [`${notificationTable.tableArn}/stream/*`],
  }),
);
const streamMapping = new CfnEventSourceMapping(dataStack, 'NotifyNotificationStreamMapping', {
  functionName: notifyLambda.functionName,
  eventSourceArn: currentStream.getResponseField('Table.LatestStreamArn'),
  startingPosition: 'LATEST',
  batchSize: 10,
  maximumRetryAttempts: 2,
});
// The role (and its stream-read policy) must exist before Lambda validates the mapping.
streamMapping.node.addDependency(notifyLambda.role!);

tables['User'].grantReadData(notifyLambda);
backend.notify.addEnvironment('USER_TABLE_NAME', tables['User'].tableName);
backend.notify.addEnvironment('H2H_SECRET_ARN', H2H_SECRET_ARN);
notifyLambda.addToRolePolicy(
  new PolicyStatement({ actions: ['secretsmanager:GetSecretValue'], resources: [H2H_SECRET_ARN] }),
);
