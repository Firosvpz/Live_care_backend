import Service_provider_usecase from "usecases/service_provider_usecase";
import { Request, Response, NextFunction } from "express";

class Service_provider_controller {
  constructor(private sp_usecase: Service_provider_usecase) {}
  async verify_sp_email(req: Request, res: Response, next: NextFunction) {
    try {
      const sp_info = req.body;
      console.log('sp-info',sp_info);
      
      const response = await this.sp_usecase.find_sp(sp_info);
      console.log('res:',response);
      
      if (response?.status === 200) {
        throw new Error("User already exist");
      }
      if (response?.status === 201) {
        const token = response.data;
        return res.status(200).json({
          success: true,
          data: token,
          message: "otp generated and send",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async verify_otp(req: Request, res: Response, next: NextFunction) {
    try {
      const auth_header = req.headers.authorization;
      if (!auth_header) {
        return res
          .status(401)
          .json({ success: false, message: " Authorization header missing" });
      }
      const token = req.headers.authorization?.split(" ")[1] as string;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: " Token missing from autherization header",
        });
      }
      const { otp } = req.body;
      console.log(otp);
      if (!otp) {
        return res
          .status(400)
          .json({ success: false, message: " Otp is required " });
      }
      const save_sp = await this.sp_usecase.create_sp(token, otp);

      if (save_sp?.success) {
        res.cookie("spToken", save_sp.token, {
          httpOnly: true, // Prevent JavaScript access to the cookie
          secure: process.env.NODE_ENV === "production", // Use HTTPS in production
          sameSite: "strict", // Prevent CSRF attacks
        });
      } else {
        res.status(400).json({ success: false, message: "OTP not verified" });
      }

      return res.status(200).json({
        success: true,
        token: save_sp?.token,
        message: " OTP verified successfully",
      });
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
}

export default Service_provider_controller;
