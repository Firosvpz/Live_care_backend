import { Request, Response, NextFunction } from "express"
import ServiceProviderRepository from "../../infrastructure/repositories/sp_respository"
import { logger } from "../../infrastructure/utils/combine_log"
import JwtToken from "../../infrastructure/utils/jwt_token"


const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string)
const spRepository = new ServiceProviderRepository()

interface RequestModified extends Request {
    serviceProviderId?: string
}

declare global {
    namespace Express {
        interface Request {
            serviceProviderId?: string
        }
    }
}

const serviceProviderAuth = async (req: RequestModified, res: Response, next: NextFunction) => {
    let token = req.cookies.serviceProviderToken

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unautherized,No token provide"
        })
    }
    try {
        const decodedToken = jwt.verifyJwtToken(token)
        if (decodedToken && decodedToken.role !== "serviceProvider") {
            return res.status(401).send({ success: false, message: "Unauthorized - Invalid Token" })
        }

        if (decodedToken && decodedToken.id) {
            logger.info('tokenn', decodedToken, decodedToken.id);
            const serviceProvider = await spRepository.findById(decodedToken.id)
            if (serviceProvider?.is_blocked) {
                return res.status(401).send({ success: false, message: "You are blocked!" })
            }
            req.serviceProviderId = serviceProvider?._id;
            next()
        }else{
            return res.status(401).send({success: false, message: "Unauthorized - Invalid Token"})
        }


    } catch (error) {
        return res.status(401).send({ success: false, message: "Unauthorized - Invalid token" })
    }
}
export default serviceProviderAuth