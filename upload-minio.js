const Minio = require('minio');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const BUCKET_NAME = process.env.MINIO_BUCKET;

async function uploadToMinio() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket "${BUCKET_NAME}" created.`);
    }

    // Set bucket policy to public read
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Action: ['s3:GetObject'],
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
        }
      ]
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    console.log(`Bucket "${BUCKET_NAME}" policy set to public read.`);

    const filesToUpload = [
      { localPath: path.join(__dirname, 'video web.mp4'), remoteName: 'videoweb.mp4', mimeType: 'video/mp4' },
      { localPath: path.join(__dirname, 'public', 'images', 'desain-grafis.png'), remoteName: 'images/desain-grafis.png', mimeType: 'image/png' },
      { localPath: path.join(__dirname, 'public', 'images', 'iklan-ads.png'), remoteName: 'images/iklan-ads.png', mimeType: 'image/png' },
      { localPath: path.join(__dirname, 'public', 'images', 'paket-starter.png'), remoteName: 'images/paket-starter.png', mimeType: 'image/png' },
      { localPath: path.join(__dirname, 'public', 'images', 'produksi-video.png'), remoteName: 'images/produksi-video.png', mimeType: 'image/png' },
      { localPath: path.join(__dirname, 'public', 'images', 'social-media.png'), remoteName: 'images/social-media.png', mimeType: 'image/png' },
      { localPath: path.join(__dirname, 'public', 'images', 'pembuatan-web.jpg'), remoteName: 'images/pembuatan-web.jpg', mimeType: 'image/jpeg' },
      { localPath: path.join(__dirname, 'public', 'images', 'paket-sultan.jpg'), remoteName: 'images/paket-sultan.jpg', mimeType: 'image/jpeg' }
    ];

    for (const file of filesToUpload) {
      if (fs.existsSync(file.localPath)) {
        console.log(`Uploading ${file.remoteName}...`);
        await minioClient.fPutObject(BUCKET_NAME, file.remoteName, file.localPath, { 'Content-Type': file.mimeType });
        console.log(`Successfully uploaded ${file.remoteName}`);
      } else {
        console.log(`File not found: ${file.localPath}`);
      }
    }

    console.log("All uploads completed.");
  } catch (error) {
    console.error('Error during upload:', error);
  }
}

uploadToMinio();
