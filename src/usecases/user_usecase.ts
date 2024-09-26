import IUserRepository from "../interfaces/repositories/IUser_repository";
import IGenerateOtp from "../interfaces/utils/IGenerate_otp";
import IHashPassword from "../interfaces/utils/IHash_password";
import IJwtToken from "../interfaces/utils/IJwt_token";
import IMailService from "../interfaces/utils/IMail_service";
import IUser from "../domain/entities/user";
import { logger } from "../infrastructure/utils/combine_log";
import IService_provider from "../domain/entities/service_provider";

// type DecodedToken = {
//   info: { userId: string };
//   otp: string;
//   iat: number;
//   exp: number;
// }

class UserUsecase {
  constructor(
    private userRepository: IUserRepository,
    private generateOtp: IGenerateOtp,
    private hashPassword: IHashPassword,
    private jwtToken: IJwtToken,
    private mailService: IMailService,
  ) {}

  async findUser(userInfo: IUser) {
    const user = await this.userRepository.findUserByEmail(userInfo.email);
    if (user) {
      return {
        status: 200,
        data: user,
        message: "found user",
      };
    } else {
      const otp: string = this.generateOtp.generateOtp();
      const token = this.jwtToken.otpToken(userInfo, otp);
      const { name, email } = userInfo;
      await this.mailService.sendMail(name, email, otp);
      return {
        status: 201,
        data: token,
        message: "otp generated and send",
      };
    }
  }
  async getUserInfoUsingToken(token: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    if (!decodedToken) {
      logger.error("Invalid Token", 400);
      return;
    }
    return decodedToken.info;
  }

  async saveUser(token: string, otp: string) {
    const decodedToken = this.jwtToken.verifyJwtToken(token);
    if (!decodedToken) {
      logger.error("Invalid token");
      return;
    }
    if (otp !== decodedToken.otp) {
      logger.error("Invalid Otp");
      return;
    }

    const { password } = decodedToken.info;
    const hashedPassword = await this.hashPassword.hash(password);
    decodedToken.info.password = hashedPassword;

    const save_user = await this.userRepository.saveUser(decodedToken.info);
    if (!save_user) {
      logger.error("failed to save user");
    }

    const newToken = this.jwtToken.createJwtToken(
      save_user?._id as string,
      "user",
    );
    return {
      success: true,
      token: newToken,
    };
  }

  async userLogin(email: string, password: string) {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        logger.error("User not found", 404);
        return {
          success: false,
          message: "User not found",
        };
      }

      const passwordMatch = await this.hashPassword.compare(
        password,
        user.password,
      );
      if (!passwordMatch) {
        logger.error("Password does not match");
        return {
          success: false,
          message: "Incorrect password",
        };
      }

      if (user.is_blocked) {
        logger.error("User is blocked");
        return {
          success: false,
          message: "This user is blocked",
        };
      }

      const token = this.jwtToken.createJwtToken(user._id as string, "user");
      return {
        success: true,
        data: { token: token },
        message: "Login successful",
      };
    } catch (error) {
      logger.error("An error occurred during login", error);
      return {
        success: false,
        message: "An error occurred during login",
      };
    }
  }

  async getProfileDetails(userId: string) {
    const user = await this.userRepository.findUserById(userId);
    return user;
  }

  async editProfile(userId: string, name: string, phone_number: string) {
    await this.userRepository.editProfile(userId, name, phone_number);
  }

  async editPassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordMatch = await this.hashPassword.compare(
      oldPassword,
      user?.password,
    );
    if (!isPasswordMatch) {
      throw new Error(
        "Current password is incorrect. Please check and try again",
      );
    }
    const hashedPassword = await this.hashPassword.hash(newPassword);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async getApprovedAndUnblockedProviders(): Promise<IService_provider[]> {
    return this.userRepository.getApprovedAndUnblockedProviders();
  }

  async ServiceProviderDetails(id: string) {
    const serviceProviderDetails =
      await this.userRepository.getServiceProviderDetails(id);
    return serviceProviderDetails;
  }
}

export default UserUsecase;
