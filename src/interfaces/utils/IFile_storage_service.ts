interface IFileStorageService {
  uploadFile(file: any, keyPrefix: string): Promise<string>;
  uploadFiles(file: any, keyPrefix: string): Promise<string>;
}
export default IFileStorageService;
