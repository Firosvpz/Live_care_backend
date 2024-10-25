import UserUsecase from "../../usecases/user_usecase";
import { Request, Response, NextFunction } from "express";
import { logger } from "../../infrastructure/utils/combine_log";
import path from "path";
import fs from "fs";
// import { OAuth2Client } from "google-auth-library";

class UserController {
  // private oauth2Client: OAuth2Client;

  constructor(private user_usecase: UserUsecase) {
    // this.oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
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
      const { email, password, idToken } = req.body;
      let user;

      if (idToken) {
        console.log("idtoken", idToken);

        user = await this.user_usecase.googleLogin(idToken);
        console.log("user", user);

        // Store the Google token in a cookie for later (e.g., for logout or token revocation)
        if (user?.success) {
          res.cookie("googleToken", idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600 * 1000, // Expire in 1 hour or set this according to your needs
          });
        }
      } else {
        user = await this.user_usecase.userLogin(email, password);
      }

      if (user?.success) {
        res.cookie("userToken", user.data?.token, {
          expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Expires in 2 days
          httpOnly: true,
          secure: true, // use true if you're serving over https
          sameSite: "none", // allows cross-site cookie usage
        });

        res.status(200).json(user);
      } else {
        // If login fails, return an error message
        res.status(400).json(user);
      }
    } catch (error) {
      console.error("Server error:", error); // Log server errors for debugging
      res
        .status(500)
        .json({ success: false, message: "An error occurred during login" });
      next(error);
    }
  }
  async verifyDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, dob, user_address, medical_history, blood_type } =
        req.body;
      console.log(
        "body",
        name,
        email,
        dob,
        user_address,
        medical_history,
        blood_type,
        req.body,
      );
      console.log("files", req.files);

      const { profile_picture } = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      if (!profile_picture) {
        logger.error("All files must be uploaded", 400);
      }

      const userDetails = {
        ...req.body,
        ...req.files,
        _id: req.userId,
      };

      const updatedUser = await this.user_usecase.saveUserDetails(userDetails);
      if (updatedUser?.success) {
        [profile_picture].forEach((files) => {
          files.forEach((file) => {
            const filepath = path.join(
              __dirname,
              "../../infrastructure/public/images",
              file.filename,
            );
            console.log("filepath", filepath);

            fs.unlink(filepath, (err) => {
              if (err) {
                logger.error("error while deleting files from server ", err);
              }
            });
          });
        });
        return res.status(200).json({
          success: true,
          message: "details verified successfully",
          data: updatedUser,
        });
      } else {
        logger.error("User not found", 404);
      }
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    console.log("User logging out");
    try {
      // Log the cookies to verify the presence of tokens
      console.log("goog", req.cookies);

      // Clear both Google token and user token cookies
      res.cookie("googleToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      res.cookie("userToken", "", {
        httpOnly: true,
        expires: new Date(0),
      });

      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
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
      const userId = req.userId;
      if (!userId) {
        throw new Error("User Not Fount");
      }

      const user = await this.user_usecase.getProfileDetails(userId);

      return res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone_number } = req.body;
      const userId = req.userId;
      if (!userId) {
        throw new Error("User id not found");
      }
      await this.user_usecase.editProfile(userId, name, phone_number);
      return res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  }

  async editPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId) {
        throw new Error("user id not found");
      }
      await this.user_usecase.editPassword(
        userId,
        currentPassword,
        newPassword,
      );
      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getApprovedAndUnblockedProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const providers =
        await this.user_usecase.getApprovedAndUnblockedProviders();
      res.json(providers);
    } catch (error) {
      next(error);
    }
  }

  async getServiceProviderDetails(
    req: Request,
    res: Response,
    next: NextFunction,
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

  async getBlogs(req: Request, res: Response, next: NextFunction) {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    try {
      const { blogs, total } = await this.user_usecase.getListedBlogs(
        page,
        limit,
      );
      res.json({ success: true, blogs, total });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch blogs" });
    }
  }

  async getProviderSlotsDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { serviceProviderId } = req.params;

      if (!serviceProviderId)
        throw new Error("Service provider ID is required");

      // Fetch details based on serviceProviderId
      const details =
        await this.user_usecase.getProviderSlotDetails(serviceProviderId);

      return res.status(200).json({ success: true, data: { details } });
    } catch (error) {
      next(error);
    }
  }
  async getScheduledBookingList(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.userId;

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      if (!userId) {
        throw new Error("Failed to get user id");
      }

      const { bookings, total } =
        await this.user_usecase.getScheduledBookingList(userId, page, limit);
      return res.status(200).json({ success: true, data: bookings, total });
    } catch (error) {
      next(error);
    }
  }

  async fileComplaint(req: Request, res: Response): Promise<void> {
    try {
      console.log("re", req.body);

      const { userId, subject, message } = req.body;

      if (!userId || !subject || !message) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Create a complaint object
      const complaint = {
        userId,
        subject,
        message,
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.user_usecase.fileComplaint(complaint);

      res.status(201).json(result);
    } catch (error) {
      console.error("Error filing complaint:", error);
      res.status(500).json({ error: "Failed to file complaint" });
    }
  }

  async getUserComplaints(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const complaints = await this.user_usecase.getUserComplaints(userId);
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ error: "Failed to get complaints" });
    }
  }

  async addReview(req: Request, res: Response) {
    console.log("pro", req.body);
    const { providerId, rating, comment } = req.body;
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    try {
      const updatedProvider = await this.user_usecase.addReview(
        providerId,
        userId,
        rating,
        comment,
      );
      res.status(200).json(updatedProvider);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default UserController;
