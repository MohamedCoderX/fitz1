const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || process.argv[2];
const API_KEY = process.env.CLOUDINARY_API_KEY || '633227375374137';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '7Kt1uiUNNN8bDZZqmPbfD7bTeLU';

if (!CLOUD_NAME) {
  console.error('\n❌ Please provide your Cloudinary Cloud Name!');
  console.log('Usage: node upload-to-cloudinary.js <YOUR_CLOUD_NAME>');
  console.log('Or set CLOUDINARY_CLOUD_NAME environment variable.\n');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
  secure: true,
});

const videos = [
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/how-its-made.mp4'),
    publicId: 'fitzone/videos/how-its-made',
    key: 'howItsMade',
  },
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/reviews/video-1.mp4'),
    publicId: 'fitzone/videos/video-1',
    key: 'video1',
  },
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/reviews/video-2.mp4'),
    publicId: 'fitzone/videos/video-2',
    key: 'video2',
  },
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/reviews/video-3.mp4'),
    publicId: 'fitzone/videos/video-3',
    key: 'video3',
  },
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/reviews/video-4.mp4'),
    publicId: 'fitzone/videos/video-4',
    key: 'video4',
  },
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/reviews/video-5.mp4'),
    publicId: 'fitzone/videos/video-5',
    key: 'video5',
  },
  {
    localPath: path.resolve(__dirname, '../../frontend/src/assets/reviews/video-6.mp4'),
    publicId: 'fitzone/videos/video-6',
    key: 'video6',
  },
];

async function run() {
  console.log(`\nTesting connection to Cloudinary account [${CLOUD_NAME}]...`);
  try {
    const pingRes = await cloudinary.api.ping();
    console.log('✓ Cloudinary connection verified successfully!\n', pingRes);
  } catch (err) {
    console.error('❌ Cloudinary connection failed:', err.message);
    process.exit(1);
  }

  const uploadedUrls = {};

  for (const item of videos) {
    if (!fs.existsSync(item.localPath)) {
      console.warn(`File not found: ${item.localPath}`);
      continue;
    }

    const sizeMB = (fs.statSync(item.localPath).size / 1024 / 1024).toFixed(2);
    console.log(`Uploading ${path.basename(item.localPath)} (${sizeMB} MB) to Cloudinary...`);

    try {
      const result = await cloudinary.uploader.upload(item.localPath, {
        resource_type: 'video',
        public_id: item.publicId,
        overwrite: true,
      });

      console.log(`✓ Uploaded ${path.basename(item.localPath)} -> ${result.secure_url}`);
      uploadedUrls[item.key] = result.secure_url;
    } catch (err) {
      console.error(`❌ Upload failed for ${item.key}:`, err.message);
    }
  }

  console.log('\n========================================');
  console.log('ALL VIDEOS UPLOADED TO CLOUDINARY:');
  console.log(JSON.stringify(uploadedUrls, null, 2));
  console.log('========================================\n');

  // Save urls to a json file
  const outPath = path.resolve(__dirname, '../../frontend/src/data/cloudinaryVideos.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(uploadedUrls, null, 2));
  console.log(`Saved video mapping to: ${outPath}`);
}

run();
