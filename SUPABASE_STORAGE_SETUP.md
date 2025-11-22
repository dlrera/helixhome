# Supabase Storage Setup Guide

This guide will help you set up the required storage buckets for asset photo and manual uploads in your HelixIntel application.

## Prerequisites

- Supabase project created at https://supabase.com
- Environment variables configured in your `.env` file:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 1: Access Supabase Storage Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project: **tzkcaciqjjqrpujwnbqp**
3. Click on **Storage** in the left sidebar

## Step 2: Create Storage Buckets

You need to create two storage buckets:

### Bucket 1: asset-images

1. Click **"New bucket"** button
2. Configure the bucket:
   - **Name**: `asset-images`
   - **Public bucket**: ✅ **Enabled** (so images can be displayed publicly)
   - **File size limit**: 5 MB
   - **Allowed MIME types**:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`
3. Click **"Create bucket"**

### Bucket 2: asset-manuals

1. Click **"New bucket"** button
2. Configure the bucket:
   - **Name**: `asset-manuals`
   - **Public bucket**: ✅ **Enabled** (so manuals can be downloaded)
   - **File size limit**: 10 MB
   - **Allowed MIME types**:
     - `application/pdf`
     - `application/msword`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
3. Click **"Create bucket"**

## Step 3: Configure Storage Policies (Optional but Recommended)

For production security, you should set up Row Level Security (RLS) policies:

### For asset-images bucket:

1. Click on the `asset-images` bucket
2. Go to **Policies** tab
3. Click **"New Policy"**
4. Create the following policies:

#### Upload Policy (INSERT)
```sql
-- Name: Allow authenticated users to upload images
-- Operation: INSERT
-- Target roles: authenticated

CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-images');
```

#### Read Policy (SELECT)
```sql
-- Name: Allow public to view images
-- Operation: SELECT
-- Target roles: public

CREATE POLICY "Allow public to view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'asset-images');
```

#### Delete Policy (DELETE)
```sql
-- Name: Allow users to delete their own images
-- Operation: DELETE
-- Target roles: authenticated

CREATE POLICY "Allow users to delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'asset-images');
```

### For asset-manuals bucket:

Repeat the same process for `asset-manuals`:

#### Upload Policy (INSERT)
```sql
CREATE POLICY "Allow authenticated users to upload manuals"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'asset-manuals');
```

#### Read Policy (SELECT)
```sql
CREATE POLICY "Allow public to view manuals"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'asset-manuals');
```

#### Delete Policy (DELETE)
```sql
CREATE POLICY "Allow users to delete their own manuals"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'asset-manuals');
```

## Step 4: Verify Configuration

1. Go back to **Storage** dashboard
2. You should see both buckets listed:
   - ✅ `asset-images` (Public)
   - ✅ `asset-manuals` (Public)

## Step 5: Test Upload (Optional)

You can test uploads directly in the Supabase dashboard:

1. Click on a bucket
2. Click **"Upload file"**
3. Select a test file
4. Verify it uploads successfully

## File Path Structure

The application stores files with the following path structure:
```
{bucket_name}/{userId}/{assetId}/{timestamp}_{filename}
```

Example:
```
asset-images/cm3abcd1234/cm3xyz5678/1732012345678_kitchen-fridge.jpg
asset-manuals/cm3abcd1234/cm3xyz5678/1732012345678_user-manual.pdf
```

## Troubleshooting

### Issue: "Storage bucket not found"
- Verify bucket names are exactly: `asset-images` and `asset-manuals`
- Check that buckets are created in the correct Supabase project

### Issue: "Access denied" errors
- Verify buckets are set to **Public**
- Check RLS policies are configured correctly
- Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct in your `.env` file

### Issue: "File size too large"
- Check file size limits in bucket configuration
- Images must be ≤ 5MB
- Manuals must be ≤ 10MB

### Issue: "Invalid file type"
- Verify allowed MIME types in bucket configuration
- Only specified file types can be uploaded

## Next Steps

After completing this setup:

1. ✅ Fixed FileUpload component bug
2. ✅ Created Supabase storage buckets
3. ✅ Configured bucket permissions
4. 🔜 Deploy code to Vercel
5. 🔜 Test uploads on live site

## Related Files

- Storage client: `lib/supabase.ts`
- Upload utilities: `lib/utils/storage.ts`
- Upload component: `components/file-upload.tsx`
- Upload APIs: `app/api/assets/upload-image/route.ts`, `app/api/assets/upload-manual/route.ts`
- Asset form: `components/assets/asset-form.tsx`
