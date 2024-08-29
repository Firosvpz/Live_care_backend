
import IUser from "../domain/entities/user";
import IUser_repository from "../interfaces/repositories/IUser_repository";
import IJwt_token from "../interfaces/utils/IJwt_token";
import IGenerate_otp from "../interfaces/utils/IGenerate_otp";
import IMail_service from "../interfaces/utils/IMail_service";
import IHash_password from "../interfaces/utils/IHash_password";
import { logger } from '../infrastructure/utils/combine_log'


class User_usecase {

    constructor(
        private iuser_repository: IUser_repository,
        private jwt_token: IJwt_token,
        private generate_otp: IGenerate_otp,
        private mail_service: IMail_service,
        private hash_password: IHash_password
    ) { }

    async get_user_info_by_token(token: string) {

        let decoded_token = await this.jwt_token.verify_jwt_token(token)
        if (!decoded_token) {
            throw new Error(" Failed to get user info ")
        }
        return decoded_token.info
    }

    async create_user(token: string, otp: string) {
        try {
            let decoded_token = await this.jwt_token.verify_jwt_token(token)
            if (!decoded_token) {
                throw new Error(" Failed to get user info ")
            }
            if (otp !== decoded_token.otp) {
                throw new Error(" Invalid otp ")
            }

            const { password } = decoded_token.info
            const hashed_password = await this.hash_password.hash(password)
            decoded_token.info.password = hashed_password

            const user_save = await this.iuser_repository.create_user(decoded_token.info)

            if (!user_save) {
                throw new Error(" Failed to create new user ")
            }

            let new_token = this.jwt_token.create_jwt_token(
                user_save.user_id as string, " user "
            )

            return {
                success: true,
                token: new_token
            }

        } catch (error) {
            logger.error('Error in create_user: ', error);
            throw error;
        }
    }

    async find_user(user_info: IUser) {
        try {
            const user = await this.iuser_repository.find_by_email(user_info.email)
            if (user) {
                return {
                    status: 200,
                    data: user,
                    message: 'user found by email'
                }
            } else {
                const OTP: string = this.generate_otp.generate_otp()
                logger.info('OTP generated for user:', { email: user_info.email })
                const token = this.jwt_token.otp_token(user_info, OTP)
                const { name, email } = user_info
                await this.mail_service.sendmail(name, email, OTP)
                return {
                    status: 201,
                    data: token,
                    message: ' OTP generated and send'
                }
            }

        } catch (error) {
            logger.error('Error in find_user: ', error);
            throw error;
        }
    }
}

export default User_usecase