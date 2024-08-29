
import User_usecase from "../../usecases/user_usecase";
import { Request, Response, NextFunction } from 'express'
import validation from '../../infrastructure/middlewares/validation'

class User_controller {

    constructor(private user_case: User_usecase) { }

    async verify_user_email(req: Request, res: Response, next: NextFunction) {
        try {
           
            const { name, email } = req.body
            
            if (!name || !validation.validate_name(name)) {
                return res.status(400).json({ message: 'Invalid name format' });
            }
            if (!email || !validation.validate_email(email)) {
                return res.status(400).json({ message: 'Invalid email format' })
            }
            

            const user_info = req.body
            const response = await this.user_case.find_user(user_info)
            console.log('find_user',response);
            

            if (response?.status === 200) {
                return res.status(200).json({
                    success: true,
                    data: response.data,
                    message: "found user"
                })
            }

            if (response?.status === 201) {
                const token = response.data
                return res.status(201).json({
                    success: true,
                    data: token,
                    message: "OTP generated and send"
                })
            }


        } catch (error) {
            next(error)
        }
    }

    async verify_otp(req: Request, res: Response, next: NextFunction) {
        try {

            // Extract token from authorization header
            const auth_header = req.headers.authorization
            if (!auth_header) {
                return res.status(401).json({ success: false, message: " Authorization header missing" })
            }

            const token = auth_header.split(' ')[1]
            if (!token) {
                return res.status(401).json({ success: false, message: " Token missing from autherization header" })
            }

            // Extract OTP from request body
            const { otp } = req.body
            if (!otp) {
                return res.status(400).json({ success: false, message: " Otp is required " })
            }

            const save_user = await this.user_case.create_user(token, otp)

            if (save_user.success) {
                res.cookie("userToken", save_user.token, {
                    httpOnly: true, // Prevent JavaScript access to the cookie
                    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
                    sameSite: "strict"  // Prevent CSRF attacks
                })
            }

            return res.status(200).json({
                success: true,
                token: save_user.token,
                message: " OTP verified successfully"
            })
        } catch (error) {
            next(error)
        }
    }

}

export default User_controller