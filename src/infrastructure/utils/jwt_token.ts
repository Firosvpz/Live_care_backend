import jwt,{ JwtPayload } from 'jsonwebtoken';
import IJwtToken from '../../interfaces/utils/IJwt_token';
import { logger } from './combine_log';

class JwtToken implements IJwtToken {
  private secret_key:string
  constructor(secret_key:string){
    this.secret_key = secret_key
  }
  createJwtToken(id: string, role: string): string {
    const payload:JwtPayload = {id,role}
    const token=jwt.sign(payload,this.secret_key,{expiresIn:"1d"})
    logger.info("jwt token created")
    return token
  }
  verifyJwtToken(token: string): jwt.JwtPayload | null {
    try {
      const decodedToken = jwt.verify(token,this.secret_key) as JwtPayload
      logger.info("verfied jwt token")
      return decodedToken
    } catch (error) {
      logger.error("error occured in verify jwt token")
      throw new Error("")
    }
  }
  otpToken(info: jwt.JwtPayload, otp: string): string {
    try {
      const payload:JwtPayload= {info,otp}
      const token = jwt.sign(payload,this.secret_key,{expiresIn:"5m"})
      logger.info("created otp token")
      return token
    } catch (error) {
      logger.info("error occured while create otp token",error)
      throw new Error("")
    }
  }
}

export default JwtToken