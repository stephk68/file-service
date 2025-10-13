// src/supabase/supabase.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') ?? "URL";
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ROLE_SERVICE_KEY') ?? "AnonKey";

    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  // STORAGE METHODS

  
  
  async createBucket(
    bucketName: string,
    options: {
      public?: boolean;
      fileSizeLimit?: number;
    
    } = {}
  ) {
    const { data, error } = await this.supabase.storage.createBucket(bucketName, {
      public: options.public || false,
      fileSizeLimit: options.fileSizeLimit || 52428800, // 50MB default
  
    });

    if (error) {
      this.logger.error(`Error creating bucket ${bucketName}:`, error);
      throw new Error(error.message);
    }

    this.logger.log(`Bucket ${bucketName} created successfully`);
    return data;
  }
  // List all buckets
  async listBuckets() {
    try {
      console.log('Supabase client initialized:', !!this.supabase);
      console.log('Storage available:', !!this.supabase?.storage);
      
      const { data, error } = await this.supabase.storage.listBuckets();
      
      console.log('Raw response:', { data, error });
      
      if (error) {
        this.logger.error('Error listing buckets:', error);
        console.error('Supabase storage error:', error);
        throw new Error(error.message);
      }
      
      console.log('Buckets found:', data);
      return data;
    } catch (err) {
      console.error('Unexpected error in listBuckets:', err);
      throw err;
    }
  }

  async updateBucket(
    bucketName: string,
    options: {
      public?: boolean;
      fileSizeLimit?: number;
      allowedMimeTypes?: string[];
    }
  ) {
    const { data, error } = await this.supabase.storage.updateBucket(bucketName, {
      public: options.public ?? false,
      fileSizeLimit: options.fileSizeLimit,
      allowedMimeTypes: options.allowedMimeTypes,
    });

    if (error) {
      this.logger.error(`Error updating bucket ${bucketName}:`, error);
      throw new Error(error.message);
    }

    this.logger.log(`Bucket ${bucketName} updated successfully`);
    return data;
  }
  // Get a specific bucket
  async getBucket(bucketName: string) {
    const { data, error } = await this.supabase.storage.getBucket(bucketName);
    
    if (error) {
      this.logger.error(`Error getting bucket ${bucketName}:`, error);
      throw new Error(error.message);
    }
    
    return data;
  }

  async bucketExists(bucketName: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage.getBucket(bucketName);
  
      if (error || !data) {
        return false;
      }
  
      return true;
    } catch (err) {
      this.logger.error(`Error checking bucket existence: ${err.message}`);
      return false;
    }
  }
  

  // List files in a bucket
  async listFiles(bucketName: string, folderPath?: string) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(folderPath || '');

    if (error) {
      this.logger.error(`Error listing files in ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  // Upload a file
  async uploadFile(
    bucketName: string,
    filePath: string,
    file: Buffer | File,
    options: {
      upsert?: boolean;
      contentType: string;
    }
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        upsert: options?.upsert || false,
        contentType: options?.contentType,
      });

    if (error) {
      this.logger.error(`Error uploading file to ${bucketName}:`, error);
      throw new Error(error.message);
    }
 const URL = await this.getPublicUrl(bucketName,filePath);
    return {data, URL, options};
  }

  // Download a file
  async downloadFile(bucketName: string, filePath: string) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      this.logger.error(`Error downloading file from ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Checks if a file with the given file name exists in the specified bucket (optionally within a folder path).
   * @param bucketName The Supabase Storage bucket name.
   * @param fileName The name of the file to check for.
   * @param folderPath Optional folder path within the bucket.
   * @returns Promise<boolean> True if the file exists, otherwise false.
   */
  async fileExists(bucketName: string, fileName: string, folderPath?: string): Promise<boolean> {
    try {
      // List files inside the folder (or root if not specified)
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .list(folderPath || '');

      if (error) {
        this.logger.error(`Error checking file existence in ${bucketName}:`, error);
        throw new Error(error.message);
      }

      if (!data) return false;
      // Look for a file with the specified name (case-sensitive)
      return data.some((item: any) => item.name === fileName);
    } catch (err) {
      this.logger.error(`Unexpected error checking file existence:`, err);
      return false;
    }
  }

  // Get public URL for a file
  getPublicUrl(bucketName: string, filePath: string) {
    const { data } = this.supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  // Get signed URL (for private files)
  async createSignedUrl(
    bucketName: string,
    filePath: string,
    expiresIn: number = 60, // seconds
  ){
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      this.logger.error(`Error creating signed URL for ${filePath}:`, error);
      throw new Error(error.message);
    }

    return data.signedUrl;
  }

  // Delete files
  async deleteFiles(bucketName: string, filePaths: string[]) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (error) {
      this.logger.error(`Error deleting files from ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  // Move or rename file
  async moveFile(
    bucketName: string,
    fromPath: string,
    toPath: string,
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .move(fromPath, toPath);

    if (error) {
      this.logger.error(`Error moving file in ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  // Copy file
  async copyFile(
    bucketName: string,
    fromPath: string,
    toPath: string,
  ) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .copy(fromPath, toPath);

    if (error) {
      this.logger.error(`Error copying file in ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Replace a file in a bucket by deleting the old file and uploading the new one with the same path.
   * @param bucketName The name of the bucket.
   * @param filePath The path (including filename) of the file to replace.
   * @param fileBuffer The Buffer of the new file.
   * @param options (optional) Additional upload options.
   * @returns The upload response from Supabase storage.
   */
  async replaceFile(
    bucketName: string,
    filePath: string,
    fileBuffer: Buffer,
    options: any = {},
  ) {
    // Delete the old file first
    const { error: deleteError } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);
    if (deleteError) {
      this.logger.error(`Error deleting old file ${filePath} in ${bucketName}:`, deleteError);
      throw new Error(deleteError.message);
    }

    // Upload the new file content
    const { data, error: uploadError } = await this.supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, { upsert: true, ...options });

    if (uploadError) {
      this.logger.error(`Error uploading replacement file to ${bucketName}:`, uploadError);
      throw new Error(uploadError.message);
    }

    return data;
  }

  /**
   * Store a bucket name and its key into the "BucketKeys" table on Supabase
   * @param bucketName The name of the bucket
   * @param key The key to associate with the bucket
   */
  async saveBucketKey(bucketName: string, key: string) {
    // Insert into the table "BucketKeys" with columns: bucket_name, key
    const { data, error } = await this.supabase
      .from('BucketKeys')
      .insert([{ bucket_name: bucketName, key }]);
    if (error) {
      this.logger.error(`Error saving bucket key for ${bucketName}:`, error);
      throw new Error(error.message);
    }
    this.logger.log(`Saved bucket key for bucket "${bucketName}" successfully`);
    return data;
  }

  /**
   * Retrieve data from the "BucketKeys" table by bucket name
   * @param bucketName The name of the bucket to search for
   * @returns The first matching record or null if not found
   */
  async getBucketKeyByName(bucketName: string) {
    const { data, error } = await this.supabase
      .from('BucketKeys')
      .select('*')
      .eq('bucket_name', bucketName)
      .single();

    if (error && error.code !== 'PGRST116') { // not found error
      this.logger.error(`Error fetching bucket key for ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data ?? null;
  }
}