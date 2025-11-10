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

  /**
   * Creates a new bucket with the given name.
   * @param bucketName The name of the bucket to create.
   * @returns The created bucket data.
   * @throws Error if the bucket creation fails.
   */
  async createBucket(bucketName: string): Promise<any> {
    try {
      const { data, error } = await this.supabase.storage.createBucket(bucketName);
      if (error) {
        this.logger.error(`Error creating bucket "${bucketName}":`, error);
        throw new Error(error.message);
      }
      return data;
    } catch (err) {
      this.logger.error(`Unexpected error creating bucket "${bucketName}":`, err);
      throw err;
    }
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

  /**
   * List all elements (files/objects) in a given bucket.
   * @param bucketName The name of the bucket.
   * @param options (optional) Options for listing files (e.g., path, limit, offset).
   * @returns An array of file objects in the bucket.
   */
  /**
   * List all elements (files and folders/objects) in a given bucket.
   * The returned array includes both file objects and folders (with type property).
   * @param bucketName The name of the bucket.
   * @param options (optional) Options for listing files (e.g., path, limit, offset, search).
   * @returns An array of file and folder objects in the bucket.
   */
  async listBucketElements(
    bucketName: string,
    options: {
      path?: string;
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ) {
    // Default to root path if none provided
    const path = options.path ?? '';
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(path, {
        limit: options.limit,
        offset: options.offset,
        search: options.search,
      });

    if (error) {
      this.logger.error(`Error listing elements in bucket ${bucketName}:`, error);
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * List all elements (files and folders) within a specific folder in a given bucket.
   * @param bucketName The name of the bucket.
   * @param folderPath The path of the folder inside the bucket.
   * @param options (optional) Options such as limit, offset, search.
   * @returns An array of file and folder objects inside the given folder.
   */
  async listElementsInFolder(
    bucketName: string,
    folderPath: string,
    options: {
      limit?: number;
      offset?: number;
      search?: string;
    } = {}
  ) {

    let normalizedPath = folderPath;
    if (normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath.slice(1);
    }
    
    const path = normalizedPath === '' ? '' : normalizedPath;

    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(path, {
        limit: options.limit,
        offset: options.offset,
        search: options.search,
      });

    if (error) {
      this.logger.error(
        `Error listing elements in folder "${folderPath}" of bucket "${bucketName}":`,
        error
      );
      throw new Error(error.message);
    }

    return data;
  }

  /**
   * Lists all available buckets in Supabase Storage.
   * @returns Promise<Array<any>> An array of bucket objects.
   */
  async listBuckets(): Promise<any[]> {
    const { data, error } = await this.supabase.storage.listBuckets();

    if (error) {
      this.logger.error('Error listing buckets:', error);
      throw new Error(error.message);
    }

    return data;
  }

  async deleteFolder(
    bucketName: string, 
    folderPath: string,
    preserveParents: boolean = false
  ): Promise<{ success: boolean, message: string }> {
    // Normalize the folder path: remove leading slash
    let normalizedPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath;
    
    // Ensure trailing slash for proper prefix matching
    const folderPrefix = normalizedPath === '' ? '' : 
      (normalizedPath.endsWith('/') ? normalizedPath : `${normalizedPath}/`);
  
    this.logger.log(`=== DELETE FOLDER DEBUG ===`);
    this.logger.log(`Input folderPath: "${folderPath}"`);
    this.logger.log(`Normalized path: "${normalizedPath}"`);
    this.logger.log(`Folder prefix for listing: "${folderPrefix}"`);
    this.logger.log(`Preserve parents: ${preserveParents}`);
  
    try {
      // Get all files with this exact prefix
      const allFilesToDelete = await this.getAllFilesInFolder(bucketName, folderPrefix);
  
      this.logger.log(`Total files to delete: ${allFilesToDelete.length}`);
  
      if (allFilesToDelete.length === 0) {
        return { 
          success: true, 
          message: `Folder "${folderPath}" is empty or already deleted.` 
        };
      }
  
      // Delete all files in batches
      const BATCH_SIZE = 100;
      let totalDeleted = 0;
  
      for (let i = 0; i < allFilesToDelete.length; i += BATCH_SIZE) {
        const batch = allFilesToDelete.slice(i, i + BATCH_SIZE);
        
        this.logger.log(`Deleting batch of ${batch.length} files`);
        
        const { error: deleteError } = await this.supabase.storage
          .from(bucketName)
          .remove(batch);
  
        if (deleteError) {
          this.logger.error(
            `Error deleting files batch in folder "${folderPath}":`,
            deleteError
          );
          throw new Error(`Failed to delete files: ${deleteError.message}`);
        }
  
        totalDeleted += batch.length;
      }
  
      // If preserveParents is true, recreate placeholder files in parent folders
      // BUT not in the folder we're deleting itself
      if (preserveParents && normalizedPath) {
        await this.preserveParentFoldersOnly(bucketName, normalizedPath);
      }
  
      
      return {
        success: true,
        message: `Folder "${folderPath}" and all its contents (${totalDeleted} files) were deleted.`
      };
  
    } catch (error) {
      this.logger.error(`Unexpected error deleting folder "${folderPath}":`, error);
      throw error;
    }
  }
  
  /**
   * Preserve parent folder structure by adding placeholder files
   * This preserves ONLY the ancestors, not the deleted folder itself
   */
  private async preserveParentFoldersOnly(bucketName: string, deletedFolderPath: string): Promise<void> {
    const parts = deletedFolderPath.split('/').filter(p => p);
    
    // Only process parent folders (exclude the last part which is the deleted folder)
    // For "1/2/3/4/5", we want to check "1/", "1/2/", "1/2/3/", "1/2/3/4/" but NOT "1/2/3/4/5/"
    for (let i = 0; i < parts.length - 1; i++) {
      const parentPath = parts.slice(0, i + 1).join('/') + '/';
      
      // Check if this parent folder is now empty
      const { data } = await this.supabase.storage
        .from(bucketName)
        .list(parentPath, { limit: 1 });
      
      if (!data || data.length === 0) {
        // Folder is empty, add placeholder
        this.logger.log(`Adding placeholder to preserve parent folder: "${parentPath}"`);
        
        const placeholderPath = parentPath + '.emptyFolderPlaceholder';
        const { error } = await this.supabase.storage
          .from(bucketName)
          .upload(placeholderPath, new Blob(['']), {
            contentType: 'application/octet-stream',
            upsert: false
          });
        
        if (error && !error.message.includes('already exists')) {
          this.logger.warn(`Failed to create placeholder in "${parentPath}":`, error);
        }
      }
    }
  }
  
  /**
   * Recursively get all files within a folder prefix
   */
  private async getAllFilesInFolder(bucketName: string, folderPrefix: string): Promise<string[]> {
    const allFiles: string[] = [];
    
    // List items at this level
    const { data, error } = await this.supabase.storage
      .from(bucketName)
      .list(folderPrefix, { 
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
  
    if (error) {
      throw new Error(`Failed to list folder contents: ${error.message}`);
    }
  
    if (!data || data.length === 0) {
      return allFiles;
    }
  
    // Process each item
    for (const item of data) {
      if (!item.name) continue;
  
      const fullPath = folderPrefix + item.name;
      const isFolder = (!item.metadata && item.id === null) || item.name.endsWith('/');
      
      if (isFolder) {
        const subfolderPath = item.name.endsWith('/') ? fullPath : fullPath + '/';
        const subfolderFiles = await this.getAllFilesInFolder(bucketName, subfolderPath);
        allFiles.push(...subfolderFiles);
      } else {
        allFiles.push(fullPath);
      }
    }
  
    return allFiles;
  }
}