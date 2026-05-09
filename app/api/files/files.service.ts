import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default class FilesService {
  private static readonly client = new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });

  private static get defaultBucket(): string {
    const bucket = process.env.S3_BUCKET;
    if (!bucket) {
      throw new Error("S3_BUCKET is not configured");
    }
    return bucket;
  }

  /**
   * Uploads a file to the given bucket.
   *
   * @param file The file to upload
   * @param bucket The destination bucket
   * @returns The generated object key
   */
  static async upload(file: File, bucket: string): Promise<string> {
    const key = `${Date.now()}-${file.name}`;
    const body = Buffer.from(await file.arrayBuffer());

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    return key;
  }

  /**
   * Deletes a file from the default bucket using its key.
   *
   * @param key The object key to delete
   */
  static async deleteByKey(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.defaultBucket,
        Key: key,
      }),
    );
  }

  /**
   * Returns a direct download URL from an object key.
   * This URL is immediately usable when the bucket/object policy allows read access.
   *
   * @param key The object key
   * @returns The download URL
   */
  static async getDownloadUrl(key: string): Promise<string> {
    const endpoint = process.env.S3_PUBLIC_ENDPOINT ?? process.env.S3_ENDPOINT;
    if (!endpoint) {
      throw new Error("S3_ENDPOINT is not configured");
    }
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.defaultBucket, Key: key }));
  }
}
