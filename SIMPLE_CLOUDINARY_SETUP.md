# Simple Cloudinary Setup

## Just 3 Steps to Make Profile Upload Work:

### Step 1: Create Upload Preset in Cloudinary
1. Go to https://cloudinary.com and sign up/login
2. Go to Settings → Upload
3. Click "Add upload preset"
4. Name it: `crime_saas_uploads` (or any name you want)
5. **IMPORTANT**: Set "Signing mode" to "Unsigned"
6. Click Save

### Step 2: Add to Your `.env` File
Add these 2 lines to your CRIMe-Server `.env`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=crime_saas_uploads
```

Your cloud name is shown on your Cloudinary dashboard homepage.

### Step 3: Restart Server
```bash
npm run dev
```

That's it! Profile uploads should now work.

## To Switch Back to S3:
Just change one line in `.env`:
```bash
STORAGE_PROVIDER=s3
```

## Troubleshooting:
- If you get "CLOUDINARY_CLOUD_NAME not set" → Add cloud name to .env
- If you get "CLOUDINARY_UPLOAD_PRESET not set" → Create upload preset in Cloudinary dashboard
- If upload fails → Make sure preset is set to "Unsigned" signing mode