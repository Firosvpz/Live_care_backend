import IServiceProviderRepository from '../interfaces/repositories/ISp_repository';
import IMailService from '../interfaces/utils/IMail_service';
import IJwtToken from '../interfaces/utils/IJwt_token';
import IGenerateOtp from '../interfaces/utils/IGenerate_otp';
import IHashPassword from '../interfaces/utils/IHash_password';
import IFileStorageService from '../interfaces/utils/IFile_storage_service';
import { logger } from '../infrastructure/utils/combine_log';
import IService_provider from '../domain/entities/service_provider';

// type DecodedToken = {
//   info: { userId: string };
//   otp: string;
//   iat: number;
//   exp: number;
// }

class ServiceProviderUsecase {
    constructor(
        private spRepository: IServiceProviderRepository,
        private mailService: IMailService,
        private jwtToken: IJwtToken,
        private hashPassword: IHashPassword,
        private generateOtp: IGenerateOtp,
        private fileStorage: IFileStorageService
    ) { }

    async findServiceProvider(serviceProviderInfo: IService_provider) {
        const serviceProvider = await this.spRepository.findByEmail(serviceProviderInfo.email)
        if (serviceProvider) {
            return {
                status: 200,
                data: serviceProvider,
                message: "found service provider"
            }
        }
        else {
            const otp: string = this.generateOtp.generateOtp()
            const token = this.jwtToken.otpToken(serviceProviderInfo, otp)
            const { name, email } = serviceProviderInfo
            await this.mailService.sendMail(name, email, otp)
            return {
                status: 201,
                data: token,
                message: "otp generated succesfully"
            }
        }
    }

    async getServiceProviderByToken(token: string) {
        const decodedToken = this.jwtToken.verifyJwtToken(token)
        if (!decodedToken) {
            logger.error("Invalid token", 400)
            return
        }
        return decodedToken.info
    }

    async saveServiceProvider(token: string, otp: string) {
        const decodedToken = await this.jwtToken.verifyJwtToken(token)
        console.log('decodii',decodedToken);
        
        if (!decodedToken) {
            logger.error("Invalid token", 401)
            return
        }
        if (otp !== decodedToken.otp) {
            logger.error("Invalid Otp", 401)
        }
        

        const { password } = decodedToken.info
        const hashedPassword =await this.hashPassword.hash(password)
        console.log('hashed:',hashedPassword);
        
        decodedToken.info.password = hashedPassword
        console.log('infde:',decodedToken.info);
        
        const save_sp = await this.spRepository.saveServiceProvider(decodedToken.info)
        
        if (!save_sp) {
            logger.error("Failed to save service provider")
            return
        }

        const newToken = this.jwtToken.createJwtToken(save_sp._id as string, "serviceProvider")
        return {
            success: true,
            data: { token: newToken }
        }

    }

    async serviceProviderLogin(email: string, password: string) {
        const serviceProvier = await this.spRepository.findByEmail(email)
        if (!serviceProvier) {
            logger.error("User not found", 404)
            return
        }

        const passwordMatch = await this.hashPassword.compare(password, serviceProvier?.password)
        if (!passwordMatch) {
            logger.error("User not found", 404)
            return
        }

        if (serviceProvier.is_blocked) {
            logger.error("cannot login due to you are in blocked")
            return
        }

        const token = this.jwtToken.createJwtToken(serviceProvier._id as string, "serviceProvider")
        return {
            success: true,
            data: {
                token: token,
                hasCompletedDetails: serviceProvier.hasCompletedDetails,
                isApproved: serviceProvier.is_approved
            },
            message: "Found Service provider"
        }
    }

    async saveServiceProviderDetails(serviceProviderDetails: IService_provider) {
        const { _id, profile_picture, experience_crt } = serviceProviderDetails
        const serviceProvider = await this.spRepository.findById(_id as string)
        if (!serviceProvider) {
            logger.error("service provider not found", 404)
            return
        }
        const profilePictureUrl = await this.fileStorage.uploadFile(
            profile_picture, "profile_picture"
        )
        const experienceCrtUrl = await this.fileStorage.uploadFile(
            experience_crt, "experience_crt"
        )
        serviceProviderDetails.profile_picture = profilePictureUrl;
        serviceProviderDetails.experience_crt = experienceCrtUrl;
        serviceProviderDetails.hasCompletedDetails = true

        const updatedServiceProvider = await this.spRepository.saveServiceProviderDetails(serviceProviderDetails)
        if(!updatedServiceProvider){
            logger.error("failed to update service provider details",500)
        }

        return {
            success:true,
            message:"service provider details updated successfully",
            data:updatedServiceProvider
        }
    }


}

export default ServiceProviderUsecase