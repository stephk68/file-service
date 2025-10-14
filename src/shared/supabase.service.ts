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

  
  
 
  // List all buckets


 
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



  // Delete files
  async deleteFiles(bucketName: string, filePaths: string[]) {
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .remove(filePaths);

      if (error) {
        this.logger.error(`Error deleting files from ${bucketName}:`, error);
        throw new Error(error.message);
      }

    if (!data || data.length === 0) {
      this.logger.error(`No files were deleted from ${bucketName}.`, { filePaths });
      throw new Error(`No files were deleted from bucket "${bucketName}".`);
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
    const { data: deleteData, error: deleteError } = await this.supabase.storage
      .from(bucketName)
      .remove([filePath]);
    if (deleteError) {
      this.logger.error(`Error deleting old file ${filePath} in ${bucketName}:`, deleteError);
      throw new Error(deleteError.message);
    }
    // If none deleted, data will be empty or undefined (Supabase returns array of deleted files)
    if (!deleteData || !Array.isArray(deleteData) || deleteData.length === 0) {
      this.logger.error(`No file was deleted at path ${filePath} in bucket ${bucketName}.`);
      throw new Error(`No file was deleted at path ${filePath} in bucket ${bucketName}.`);
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

  


}