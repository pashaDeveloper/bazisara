const path = require("path");
const {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} = require("@aws-sdk/client-s3");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const shouldDelete = process.argv.includes("--delete");
const prefixArg = process.argv.find((arg) => arg.startsWith("--prefix="));
const prefix = prefixArg ? prefixArg.slice("--prefix=".length).replace(/^\/+/, "") : "";

const requiredEnv = [
  "ARVAN_S3_ENDPOINT",
  "ARVAN_S3_BUCKET",
  "ARVAN_S3_ACCESS_KEY",
  "ARVAN_S3_SECRET_KEY",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`Missing required env: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const s3Client = new S3Client({
  endpoint: process.env.ARVAN_S3_ENDPOINT,
  region: process.env.ARVAN_S3_REGION || "us-east-1",
  forcePathStyle: process.env.ARVAN_S3_FORCE_PATH_STYLE !== "false",
  credentials: {
    accessKeyId: process.env.ARVAN_S3_ACCESS_KEY,
    secretAccessKey: process.env.ARVAN_S3_SECRET_KEY,
  },
});

const chunk = (items, size) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

async function listBlurPreviewKeys() {
  const keys = [];
  let ContinuationToken;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.ARVAN_S3_BUCKET,
        ContinuationToken,
        Prefix: prefix || undefined,
      })
    );

    for (const item of response.Contents || []) {
      if (item.Key && item.Key.endsWith("-blur.webp")) {
        keys.push(item.Key);
      }
    }

    ContinuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (ContinuationToken);

  return keys;
}

async function deleteKeys(keys) {
  let deletedCount = 0;

  for (const batch of chunk(keys, 1000)) {
    const response = await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.ARVAN_S3_BUCKET,
        Delete: {
          Objects: batch.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );

    deletedCount += batch.length - (response.Errors?.length || 0);
    if (response.Errors?.length) {
      console.error("Delete errors:", response.Errors);
    }
  }

  return deletedCount;
}

async function main() {
  const keys = await listBlurPreviewKeys();
  console.log(`Found ${keys.length} blur preview file(s)${prefix ? ` under "${prefix}"` : ""}.`);

  keys.slice(0, 20).forEach((key) => console.log(key));
  if (keys.length > 20) {
    console.log(`...and ${keys.length - 20} more`);
  }

  if (!shouldDelete) {
    console.log("Dry run only. Run with --delete to remove these files.");
    return;
  }

  const deletedCount = await deleteKeys(keys);
  console.log(`Deleted ${deletedCount} blur preview file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
