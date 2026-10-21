/**
 * Copies Chip Sync data from the Gen 1 staging backend into a Gen 2 branch backend.
 *
 *   AWS_PROFILE=munson npx tsx scripts/migrate-gen1-to-gen2.ts --target-api <gen2 GraphQL API id> --target-bucket <gen2 bucket>
 *
 * Dry run unless --apply is passed. Items keep their ids, timestamps and relationship
 * keys, so they line up with the Cognito users that Gen 2 reuses via referenceAuth.
 *
 *   --apply      write to the Gen 2 tables / bucket
 *   --overwrite  replace items that already exist in Gen 2 (final sync before cutover;
 *                only safe while nobody is using the Gen 2 backend yet)
 *   --prune      delete Gen 2 items that no longer exist in Gen 1 (final sync)
 */
import {
  AttributeValue,
  ConditionalCheckFailedException,
  DeleteItemCommand,
  DescribeTableCommand,
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { CopyObjectCommand, HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";

const REGION = "us-east-1";
const SOURCE_TABLE_SUFFIX = "4a76hjs3yjd5ha5dxorhaggnbm-staging";
const SOURCE_BUCKET = "chip-sync-storage220138-staging";
const MODELS = ["Organization", "User", "Marker", "Notification", "GardnerMarker"] as const;
const IMAGE_PREFIX = "marker-images/";

type Item = Record<string, AttributeValue>;

function parseArgs() {
  const args = process.argv.slice(2);
  const value = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const targetApi = value("--target-api");
  const targetBucket = value("--target-bucket");
  if (!targetApi || !targetBucket) {
    console.error("Usage: migrate-gen1-to-gen2.ts --target-api <apiId> --target-bucket <bucket> [--apply] [--overwrite] [--prune]");
    process.exit(1);
  }
  return {
    targetApi,
    targetBucket,
    apply: args.includes("--apply"),
    overwrite: args.includes("--overwrite"),
    prune: args.includes("--prune"),
  };
}

const ddb = new DynamoDBClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

async function scanAll(table: string): Promise<Item[]> {
  const items: Item[] = [];
  let start: Item | undefined;
  do {
    const page = await ddb.send(new ScanCommand({ TableName: table, ExclusiveStartKey: start }));
    items.push(...(page.Items ?? []));
    start = page.LastEvaluatedKey;
  } while (start);
  return items;
}

/**
 * Gen 1 stored some marker photos as bare keys under the bucket's `public/` level;
 * Gen 2 reads them by full path under `marker-images/`.
 */
function migrateImageKey(key: string): { key: string; copyFrom?: string } {
  if (key.startsWith(IMAGE_PREFIX)) return { key, copyFrom: key };
  return { key: `${IMAGE_PREFIX}${key}`, copyFrom: `public/${key}` };
}

function transformMarker(item: Item, copies: Map<string, string>): Item {
  const images = item.images?.L;
  if (!images) return item;
  return {
    ...item,
    images: {
      L: images.map((entry) => {
        if (!entry.S) return entry;
        const { key, copyFrom } = migrateImageKey(entry.S);
        if (copyFrom) copies.set(key, copyFrom);
        return { S: key };
      }),
    },
  };
}

async function objectExists(bucket: string, key: string) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const { targetApi, targetBucket, apply, overwrite, prune } = parseArgs();
  console.log(apply ? "APPLYING changes" : "DRY RUN (pass --apply to write)");
  console.log(`Gen 1 *-${SOURCE_TABLE_SUFFIX} -> Gen 2 *-${targetApi}-NONE\n`);

  const copies = new Map<string, string>();
  let failures = 0;

  for (const model of MODELS) {
    const source = `${model}-${SOURCE_TABLE_SUFFIX}`;
    const target = `${model}-${targetApi}-NONE`;
    await ddb.send(new DescribeTableCommand({ TableName: target })); // fails fast on a wrong API id

    const sourceItems = (await scanAll(source)).map((item) =>
      model === "Marker" ? transformMarker(item, copies) : item,
    );
    const targetItems = await scanAll(target);
    const targetIds = new Set(targetItems.map((item) => item.id?.S));
    const sourceIds = new Set(sourceItems.map((item) => item.id?.S));
    const fresh = sourceItems.filter((item) => !targetIds.has(item.id?.S));
    const existing = sourceItems.length - fresh.length;
    const stale = targetItems.filter((item) => !sourceIds.has(item.id?.S));

    const toWrite = overwrite ? sourceItems : fresh;
    let written = 0;
    if (apply) {
      for (const item of toWrite) {
        try {
          await ddb.send(
            new PutItemCommand({
              TableName: target,
              Item: item,
              ...(overwrite ? {} : { ConditionExpression: "attribute_not_exists(id)" }),
            }),
          );
          written += 1;
        } catch (error) {
          if (error instanceof ConditionalCheckFailedException) continue;
          failures += 1;
          console.error(`  ${model} ${item.id?.S}: ${(error as Error).message}`);
        }
      }
      if (prune) {
        for (const item of stale) {
          await ddb.send(new DeleteItemCommand({ TableName: target, Key: { id: item.id } }));
        }
      }
    }

    console.log(
      `${model.padEnd(14)} source ${String(sourceItems.length).padStart(4)}  ` +
        `new ${String(fresh.length).padStart(4)}  already in Gen 2 ${String(existing).padStart(4)}  ` +
        `only in Gen 2 ${String(stale.length).padStart(3)}${prune ? " (pruned)" : ""}` +
        (apply ? `  -> wrote ${written}` : `  -> would write ${toWrite.length}`),
    );
  }

  console.log(`\nMarker photos to copy: ${copies.size}`);
  for (const [key, from] of copies) {
    const present = await objectExists(targetBucket, key);
    const available = await objectExists(SOURCE_BUCKET, from);
    const status = present ? "already copied" : !available ? "MISSING in Gen 1 bucket" : apply ? "copied" : "would copy";
    if (apply && !present && available) {
      await s3.send(
        new CopyObjectCommand({
          Bucket: targetBucket,
          Key: key,
          CopySource: encodeURI(`${SOURCE_BUCKET}/${from}`),
        }),
      );
    }
    console.log(`  ${from} -> ${key}: ${status}`);
  }

  if (failures) {
    console.error(`\n${failures} item(s) failed; re-run to retry.`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
