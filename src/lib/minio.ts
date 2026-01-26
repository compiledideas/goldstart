import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const minioEndpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const minioAccessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const minioSecretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const minioBucket = process.env.MINIO_BUCKET || 'uploads';
const minioUseSSL = process.env.MINIO_USE_SSL === 'true';

const s3Client = new S3Client({
  endpoint: minioEndpoint,
  region: 'us-east-1',
  credentials: {
    accessKeyId: minioAccessKey,
    secretAccessKey: minioSecretKey,
  },
  forcePathStyle: true,
  useSSL: minioUseSSL,
});

export async function uploadFileToMinio(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const key = `uploads/${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: minioBucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return `/api/images/${filename}`;
}

export async function getFileFromMinio(filename: string): Promise<{
  buffer: Buffer;
  contentType: string;
}> {
  const key = `uploads/${filename}`;

  const command = new GetObjectCommand({
    Bucket: minioBucket,
    Key: key,
  });

  const response = await s3Client.send(command);

  if (!response.Body) {
    throw new Error('No body in response');
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);

  return {
    buffer,
    contentType: response.ContentType || 'application/octet-stream',
  };
}

export async function getPresignedUrl(filename: string): Promise<string> {
  const key = `uploads/${filename}`;

  const command = new GetObjectCommand({
    Bucket: minioBucket,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function ensureBucketExists(): Promise<void> {
  const { HeadBucketCommand } = await import('@aws-sdk/client-s3');

  try {
    await s3Client.send(
      new HeadBucketCommand({
        Bucket: minioBucket,
      })
    );
  } catch (error: any) {
    if (error.$metadata?.httpStatusCode === 404) {
      const { CreateBucketCommand } = await import('@aws-sdk/client-s3');
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: minioBucket,
        })
      );
    } else {
      throw error;
    }
  }
}
