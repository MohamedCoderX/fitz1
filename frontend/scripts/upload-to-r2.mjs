import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudflare R2 Credentials
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '9a232dd06ea3fad5b46a0ae4ba8c4feb';
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'ce29ac863751c418213affe90b5eccfb';
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '7a1f23476ac1498f6640955edf3b02f1b6fd8b9face13291416f234694e55180';
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'fitzone-media';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

const videosToUpload = [
  {
    localPath: path.resolve(__dirname, '../src/assets/how-its-made.mp4'),
    remoteKey: 'how-its-made.mp4',
    contentType: 'video/mp4',
  },
  {
    localPath: path.resolve(__dirname, '../src/assets/reviews/video-1.mp4'),
    remoteKey: 'reviews/video-1.mp4',
    contentType: 'video/mp4',
  },
  {
    localPath: path.resolve(__dirname, '../src/assets/reviews/video-2.mp4'),
    remoteKey: 'reviews/video-2.mp4',
    contentType: 'video/mp4',
  },
  {
    localPath: path.resolve(__dirname, '../src/assets/reviews/video-3.mp4'),
    remoteKey: 'reviews/video-3.mp4',
    contentType: 'video/mp4',
  },
  {
    localPath: path.resolve(__dirname, '../src/assets/reviews/video-4.mp4'),
    remoteKey: 'reviews/video-4.mp4',
    contentType: 'video/mp4',
  },
  {
    localPath: path.resolve(__dirname, '../src/assets/reviews/video-5.mp4'),
    remoteKey: 'reviews/video-5.mp4',
    contentType: 'video/mp4',
  },
  {
    localPath: path.resolve(__dirname, '../src/assets/reviews/video-6.mp4'),
    remoteKey: 'reviews/video-6.mp4',
    contentType: 'video/mp4',
  },
];

async function uploadAll() {
  console.log(`Starting upload to R2 bucket: "${BUCKET_NAME}"...`);

  for (const item of videosToUpload) {
    if (!fs.existsSync(item.localPath)) {
      console.warn(`File not found: ${item.localPath}`);
      continue;
    }
    const fileStream = fs.createReadStream(item.localPath);
    const stats = fs.statSync(item.localPath);
    console.log(`Uploading ${item.remoteKey} (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: item.remoteKey,
          Body: fileStream,
          ContentType: item.contentType,
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      console.log(`✓ Uploaded ${item.remoteKey}`);
    } catch (err) {
      console.error(`✗ Failed to upload ${item.remoteKey}:`, err.message);
    }
  }

  console.log('\nUpload complete!');
}

uploadAll();
