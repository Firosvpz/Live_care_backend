import { Request, Response, NextFunction } from "express";
import UserRepository from "../../infrastructure/repositories/user_repository";
import JwtToken from "../../infrastructure/utils/jwt_token";

const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);
const userRepository = new UserRepository();

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  
  let token = req.cookies.userToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, No token provided" });
  }
  try {
    const decodedToken = jwt.verifyJwtToken(token);
    // console.log("tokenauth", decodedToken);

    if (decodedToken && decodedToken.role !== "user") {
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized - Invalid Token" });
    }

    if (decodedToken && decodedToken.id) {
      const user = await userRepository.findUserById(decodedToken.id);
      if (user?.is_blocked) {
        res.clearCookie("userToken");
        return res
          .status(403)
          .send({ success: false, message: "You are blocked!" });
      }
      req.userId = user?._id;
      next();
    } else {
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized - Invalid Token" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized - Invalid token" });
  }
};

export default userAuth;
