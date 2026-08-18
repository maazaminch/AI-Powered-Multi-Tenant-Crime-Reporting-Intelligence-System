# Cloudinary Integration Setup Guide

## ✅ What Was Done

Your AWS S3 setup is **100% preserved**. I added Cloudinary as an alternative storage provider while keeping your existing S3 implementation intact.

## 📁 New Files Created

```
src/services/storage/
├── storage.service.js            # Storage abstraction layer
├── s3.storage.service.js         # Wrapper for your existing S3 code
└── cloudinary.storage.service.js # New Cloudinary implementation
```

## 🔧 Configuration Steps

### 1. Get Cloudinary Credentials
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier: 25GB storage, 25GB bandwidth)
2. Go to Dashboard → Settings → API Security
3. Copy your **Cloud name**

### 2. Create an Unsigned Upload Preset (IMPORTANT!)

This is required for client-side uploads:

1. Go to Cloudinary Dashboard → Settings → **Upload**
2. Scroll to **Upload presets** and click **"Add upload preset"**
3. Configure the preset:
   - **Name**: e.g., `crime_saas_uploads` (remember this name!)
   - **Signing mode**: Select **"Unsigned"** (this is critical!)
   - **Folder**: Optional - you can set `crime_saas/profiles` for profile pics
4. Click **Save**
5. Copy the **preset name** you created

### 3. Update Your `.env` File

Add these lines to your existing `.env`:

```bash
# Storage Provider (s3 or cloudinary)
STORAGE_PROVIDER=cloudinary

# Cloudinary Configuration (required)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_preset_name_from_step_2

# Optional: Only needed for server-side operations
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Keep your existing AWS credentials (for when you want to switch back)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
PROFILE_BUCKET=crime-saas-profiles
EVIDENCE_BUCKET=crime-saas-evidence
```

### 4. Switch Between Providers

**Use Cloudinary (Free):**
```bash
STORAGE_PROVIDER=cloudinary
```

**Use S3 (Your Original Setup):**
```bash
STORAGE_PROVIDER=s3
```

## 🔄 How It Works

The system now uses a storage abstraction layer:

```
Controller → storage.service.js → [s3.storage.service.js OR cloudinary.storage.service.js]
```

- **When `STORAGE_PROVIDER=s3`**: Uses your original S3 code via the wrapper
- **When `STORAGE_PROVIDER=cloudinary`**: Uses the new Cloudinary service with unsigned upload preset

## 📊 Database Changes

The Evidence model now supports both providers:

```javascript
{
  provider: 's3' | 'cloudinary',  // New field
  storageKey: '...',              // S3 key or Cloudinary public ID
  fileUrl: '...',                 // Public URL
  // S3 specific (optional)
  bucketName: '...',
  region: '...',
  // Cloudinary specific (optional)
  publicId: '...',
  folder: '...',
  resourceType: '...'
}
```

## 🧪 Testing

1. Create the unsigned upload preset in Cloudinary dashboard
2. Add `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` to `.env`
3. Set `STORAGE_PROVIDER=cloudinary` in your `.env`
4. Restart your server: `npm run dev`
5. Test uploading a profile picture or evidence
6. Check that files appear in your Cloudinary dashboard

## 🔄 Switching Back to S3

Simply change one line in your `.env`:
```bash
STORAGE_PROVIDER=s3
```

Restart the server and you're back to using S3. All your S3 credentials and configuration remain intact.

## 📝 Notes

- Your original `s3PreSignedUrl.service.js` file is unchanged and still exists
- Both storage systems can coexist in the same database (different records can use different providers)
- Cloudinary is optimized for images and videos (perfect for your use case)
- The free tier should be sufficient for development and small-scale production
- **Unsigned upload preset is required** for client-side uploads to work properly

## 🚀 Next Steps

1. Set up your Cloudinary account
2. **Create an unsigned upload preset** (critical step!)
3. Add `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` to `.env`
4. Set `STORAGE_PROVIDER=cloudinary`
5. Test the upload functionality
6. If needed, switch back to S3 anytime by changing the env var