/* external import */
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

/* MinIO client configuration */
const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT,
  forcePathStyle: true,
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
});

/* remove image from MinIO */
async function remove(bucketName, objectName) {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    await s3Client.send(deleteCommand);
    console.log(`رسانه ${objectName} با موفقیت حذف شد`);
  } catch (error) {
    console.error("خطا در حذف  از فضای ابری:", error);
  }
}

module.exports = remove;
