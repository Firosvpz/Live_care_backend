import UserUsecase from "../../usecases/user_usecase";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../infrastructure/utils/combine_log";

class UserController {
  constructor(private user_usecase: UserUsecase) { }
  async verifyUserEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const userInfo = req.body;
      const response = await this.user_usecase.findUser(userInfo);
      if (response?.status === 200) {
        logger.error("user already exist");
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(200).json({
          success: true,
          token,
        });
      }
    } catch (error) {
      console.error("Server error:", error); // Log server errors for debugging
      res
        .status(500)
        .json({ success: false, message: "An error occurred during register" });
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      const { otp } = req.body;

      const save_user = await this.user_usecase.saveUser(token, otp);

      if (save_user?.success) {
        res.cookie("userToken", save_user.token);
        return res.status(200).json({
          success: true,
          token: save_user.token,
          message: "OTP verified",
        });
      } else {
        res.status(400).json({ success: false, message: "OTP not verified" });
      }
    } catch (error) {
      next(error);
    }
  }
  async resendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) logger.error("Unauthorised user", 401);

      const userInfo = await this.user_usecase.getUserInfoUsingToken(token);
      if (!userInfo) {
        logger.error("No user found", 400);
      }

      const response = await this.user_usecase.findUser(userInfo);
      if (response?.status === 200) {
        logger.error("User already exists", 400);
      }

      if (response?.status === 201) {
        const token = response.data;
        return res.status(201).json({ success: true, token });
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await this.user_usecase.userLogin(email, password);

      if (user?.success) {
        res.cookie("userToken", user.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: "none", // allows cross-site cookie usage
        });

        res.status(200).json(user);
      } else {
        res.status(400).json(user);

        // throw new Error(user.message);
      }
    } catch (error) {
      console.error("Server error:", error); // Log server errors for debugging
      res
        .status(500)
        .json({ success: false, message: "An error occurred during login" });
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    console.log("hello");

    try {
      res.cookie("userToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async home(req: Request, res: Response, next: NextFunction) {
    try {
      const welcomeMessage = "Welcome to the home page!";
      return res
        .status(200)
        .json({ success: true, data: { message: welcomeMessage } });
    } catch (error) {
      next(error);
    }
  }

  async getProfileDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId
      if (!userId) {
        throw new Error("User Not Fount")
      }

      const user = await this.user_usecase.getProfileDetails(userId)
      
      return res.status(200).json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone_number } = req.body
      const userId = req.userId
      if (!userId) {
        throw new Error("User id not found")
      }
      await this.user_usecase.editProfile(userId, name, phone_number)
      return res.status(200).json({ success: true, message: "Profile updated successfully" })

    } catch (error) {
      next(error)
    }
  }

  async editPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId){
         throw new Error("user id not found");
      }
      await this.user_usecase.editPassword(userId, currentPassword, newPassword)
      return res.status(200).json({
        success:true,
        message:"Password changed successfully"
      })
    } catch (error) {
       next(error)
    }
  }

  async getApprovedAndUnblockedProviders(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const providers = await this.user_usecase.getApprovedAndUnblockedProviders();
      res.json(providers);
    } catch (error) {
      next(error);
    }
  }

  async getServiceProviderDetails(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const serviceProvidersDetails =
        await this.user_usecase.ServiceProviderDetails(id);
      return res.status(200).json({
        success: true,
        data: serviceProvidersDetails,
        message: "ServiceProviders details fetched",
      });
    } catch (error) {
      next(error);
    }
  }
}



export default UserController;
