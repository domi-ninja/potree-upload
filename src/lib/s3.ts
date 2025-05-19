import { S3Client } from '@aws-sdk/client-s3';
import { env } from '~/env';

// Create an S3 client for admin operations
// This client bypasses RLS policies and has full admin access

const garbo = 'cbldmuzrcmcicwmdguiu'
export const s3Client = new S3Client({
  forcePathStyle: true,
  region: 'auto', // Supabase uses 'auto' as the region
  endpoint: `https://${garbo}.supabase.co/storage/v1/s3`,
  credentials: {
    accessKeyId: env.S3_MASTER_KEY_ID,
    secretAccessKey: env.S3_MASTER_KEY_SECRET,
  }
}); 


export const BUCKET_NAME = `potree-upload-${env.NODE_ENV}`;
