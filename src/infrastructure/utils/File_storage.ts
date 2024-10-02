import IFileStorageService from "../../interfaces/utils/IFile_storage_service";
// import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from "cloudinary";
import { logger } from "./combine_log";
import fs from "fs";

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class FileStorageService implements IFileStorageService {
  async uploadFile(file: any, keyPrefix: string): Promise<string> {
    try {
      const filePath = file[0].path;

      // upload file to cloudinary
      const result = await cloudinaryV2.uploader.upload(filePath, {
        folder: keyPrefix,
        use_filename: true,
        unique_filename: false,
      });
      console.log("result", result);

      // cleanup the local file
      fs.unlinkSync(filePath);

      return result.secure_url;
    } catch (error) {
      logger.error("error uploading fail to cloudinary", error);
      throw new Error("");
    }
  }
  async uploadFiles(file: any, keyPrefix: string): Promise<string> {
    try {
      // Check if file and file.path are available
      if (!file || !file.path) {
        throw new Error("File or file path is missing");
      }

      const filePath = file.path;
      const resourceType = file.mimetype.startsWith("video/")
        ? "video"
        : "image";

      console.log("Uploading file:", filePath);
      console.log("Resource type:", resourceType);

      // Upload the file to Cloudinary
      const result = await cloudinaryV2.uploader.upload(filePath, {
        folder: keyPrefix,
        use_filename: true,
        unique_filename: false,
        resource_type: resourceType, // Set resource type dynamically
      });

      console.log("Upload result:", result);

      // Clean up the local file if needed
      fs.unlinkSync(filePath);

      // Return the URL of the uploaded file
      return result.secure_url;
    } catch (error) {
      console.error("Error uploading file to Cloudinary:", error);
      throw new Error("Failed to upload file to Cloudinary");
    }
  }
}

export default FileStorageService;
