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
}

export default FileStorageService;
