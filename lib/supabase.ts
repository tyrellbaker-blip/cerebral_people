import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Create a Supabase client with user authentication
 * Used for operations that require RLS policies
 */
export function createAuthenticatedSupabaseClient(accessToken: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user's ID (for organizing files)
 * @param accessToken - The user's access token for authentication
 * @param bucket - The storage bucket name (default: 'profile-images')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  userId: string,
  accessToken: string,
  bucket: string = 'profile-images'
): Promise<string> {
  // Create authenticated client
  const authClient = createAuthenticatedSupabaseClient(accessToken)

  // Create a unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`

  // Upload the file
  const { data, error } = await authClient.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image
 * @param bucket - The storage bucket name
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'profile-images'
): Promise<void> {
  // Extract the file path from the URL
  const urlParts = imageUrl.split(`${bucket}/`)
  if (urlParts.length < 2) {
    throw new Error('Invalid image URL')
  }
  const filePath = urlParts[1]

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}
