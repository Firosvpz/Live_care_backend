import { Request, Response, NextFunction } from "express";
import ServiceProviderRepository from "../../infrastructure/repositories/sp_respository";
import { logger } from "../../infrastructure/utils/combine_log";
import JwtToken from "../../infrastructure/utils/jwt_token";
if (!process.env.JWT_SECRET_KEY) {
  logger.error("secret key not set in env");
  throw new Error("JWT_SECRET_KEY is not defined!");
}

const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);
const spRepository = new ServiceProviderRepository();

interface RequestModified extends Request {
  serviceProviderId?: string;
}

declare global {
  namespace Express {
    interface Request {
      serviceProviderId?: string;
    }
  }
}

const serviceProviderAuth = async (
  req: RequestModified,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.serviceProviderToken;

  if (!token) {
    logger.warn(
      `Unauthorized access attempt: No token provided, Path: ${req.path}`,
    );
    return res.status(401).json({
      success: false,
      message: "Unauthorized, No token provided",
    });
  }

  try {
    const decodedToken = jwt.verifyJwtToken(token);

    if (!decodedToken || decodedToken.role !== "serviceProvider") {
      logger.warn(
        `Unauthorized access attempt: Invalid token, Path: ${req.path}`,
      );
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized - Invalid Token" });
    }

    const serviceProvider = await spRepository.findById(decodedToken.id);

    if (serviceProvider?.is_blocked) {
      logger.warn(
        `Blocked service provider attempted access: ID ${decodedToken.id}, Path: ${req.path}`,
      );
      return res
        .status(401)
        .send({ success: false, message: "You are blocked!" });
    }

    req.serviceProviderId = serviceProvider?._id;
    // logger.info(`Token verified for service provider ID: ${decodedToken.id}, Path: ${req.path}`);
    next();
  } catch (error: any) {
    logger.error(`Authentication error: ${error.message}`, { error });
    return res
      .status(401)
      .send({ success: false, message: "Unauthorized - Invalid token" });
  }
};

export default serviceProviderAuth;
