import IFileStorageService from '../../interfaces/utils/IFile_storage_service';
// import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary'
import { logger } from './combine_log';
import fs from 'fs'

cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

class FileStorageService implements IFileStorageService {
    async uploadFile(file: any, keyPrefix: string): Promise<string> {
        try {
            if (!file || !file.path) {
                logger.error("File or file path is missing")
            }
            const filePath = file.path
            const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';
            console.log('Uploading file:', filePath);
            console.log('Resource type:', resourceType);
    
            // upload file to cloudinary
            const result = await cloudinaryV2.uploader.upload(filePath,{
                folder:keyPrefix,
                use_filename:true,
                unique_filename:false,
                resource_type:resourceType
            })
            console.log('result',result);
            
            // cleanup the local file
            fs.unlinkSync(filePath)
    
            return result.secure_url;
    
        } catch (error) {
            logger.error("error uploading fail to cloudinary",error)
            throw new Error("")
        }
    }
}

export default FileStorageService