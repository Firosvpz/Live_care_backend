import IService_provider_repository from "../interfaces/repositories/ISp_repository";
import IJwt_token from "interfaces/utils/IJwt_token";
import IGenerate_otp from "interfaces/utils/IGenerate_otp";
import IHash_password from "interfaces/utils/IHash_password";
import IMail_service from "interfaces/utils/IMail_service";
import IService_provider from "domain/entities/service_provider";
import { logger } from "../infrastructure/utils/combine_log";

class Service_provider_usecase {
  constructor(
    private sp_repository: IService_provider_repository,
    private generate_otp: IGenerate_otp,
    private jwt_token: IJwt_token,
    private mail_service: IMail_service,
    private hash_password: IHash_password,
  ) {}
  
  async create_sp(token: string, otp: string) {
    try {
      const decoded_token = this.jwt_token.verify_jwt_token(token);
      console.log('tokendecode:',decoded_token);
      
      if (!decoded_token || decoded_token.info) {
        throw new Error("Failed to get sp info");
      }
      if (otp !== decoded_token.otp) {
        throw new Error("invalid otp");
      }
      const { password } = decoded_token.info;
      const hashed_password = this.hash_password.hash(password);
      decoded_token.info.password = hashed_password;

      const save_sp = await this.sp_repository.create_service_provider(
        decoded_token.info,
      );

      if (!save_sp) {
        throw new Error("Failed to add new service provider");
      }
      const new_token = await this.jwt_token.create_access_token(
        save_sp._id as string,
        "service_provider",
      );
      return {
        success: true,
        token: new_token,
      };
    } catch (error) {
      console.log(error);
    }
  }
  async find_sp(sp_info: IService_provider) {
    try {
      const sp = await this.sp_repository.find_by_email(sp_info.email);
      if (sp) {
        return {
          status: 200,
          data: sp,
          message: "found service provider",
        };
      } else {
        const otp: string = this.generate_otp.generate_otp();
        logger.info("otp generated for service provider", {
          email: sp_info.email,
        });
        const token = this.jwt_token.otp_token(sp_info, otp);
        console.log("Otp Token created:", token);

        
        const { name, email } = sp_info;
        await this.mail_service.sendmail(name, email, otp);
        return {
          status: 201,
          data: token,
          message: "otp generated successfully",
        };
      }
    } catch (error) {
      logger.error("Error in find user");
      console.log(error);
    }
  }
}

export default Service_provider_usecase;
