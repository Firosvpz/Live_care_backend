import { Request, Response, NextFunction } from "express";
import JwtToken from "../../infrastructure/utils/jwt_token";

const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  
  let token = req.cookies.adminToken;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized, No token provided" });
  }
  try {
    const decodedToken = jwt.verifyJwtToken(token);
    // console.log("tokenauth", decodedToken);

    if (decodedToken && decodedToken.role !== "admin") {
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized - Invalid Token" });
    }

    if (decodedToken && decodedToken.id) {
      req.adminId = decodedToken.id
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

export default adminAuth;
