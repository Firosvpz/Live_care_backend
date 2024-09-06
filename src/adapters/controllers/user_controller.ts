import UserUsecase from "../../usecases/user_usecase";
import { Request, Response, NextFunction } from 'express';
import { logger } from "../../infrastructure/utils/combine_log";

class UserController {
  constructor(
    private user_usecase: UserUsecase
  ) { }
  async verifyUserEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const userInfo = req.body
      const response = await this.user_usecase.findUser(userInfo)
      if (response?.status === 200) {
        logger.error("user already exist")
      }

      if (response?.status === 201) {
        const token = response.data
        return res.status(200).json({
          success: true, token
        })
      }

    } catch (error) {
      next(error)
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string
      const { otp } = req.body

      const save_user = await this.user_usecase.saveUser(token, otp)

      if (save_user?.success) {
        res.cookie("userToken", save_user.token)
        return res.status(200).json({ success: true, token: save_user.token, message: "OTP verified" })
      } else {
        res.status(400).json({ success: false, message: "OTP not verified" })
      }
    } catch (error) {
      next(error)
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;
      if(!token) 
        logger.error("Unauthorised user", 401);

      const userInfo = await this.user_usecase.getUserInfoUsingToken(token);
      if(!userInfo){
       logger.error("No user found", 400);
      }

      const response = await this.user_usecase.findUser(userInfo)
      if (response?.status === 200) {
       logger.error("User already exists", 400);
      }
      
      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }

    } catch (error) {
      next(error)
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const user = await this.user_usecase.userLogin(email, password)
      if (user?.success) {
        res.cookie('userToken', user.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: 'none' // allows cross-site cookie usage
        })

        res.status(200).json(user)
      }
    } catch (error) {
      next(error)
    }
  }

  async home(req: Request, res: Response, next: NextFunction) {
    try {
      const welcomeMessage = "Welcome to the home page!";

      return res.status(200).json({ success: true, data: { message: welcomeMessage } });
    } catch (error) {
      next(error)
    }
  }
}

export default UserController