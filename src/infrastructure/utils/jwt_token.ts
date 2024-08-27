import jwt, { JwtPayload } from 'jsonwebtoken';
import IJwt_token from 'interfaces/utils/IJwt_token';

// JWT Token
class Jwt_token implements IJwt_token {
    private secret: string
    constructor(secret: string) {
        this.secret = secret
    }

    // Create new Token
    create_jwt_token(id: string, role: string): string {
        const payload: JwtPayload = { id, role }
        const token = jwt.sign(payload, this.secret, { expiresIn: '1d' })
        return token
    }
    
    // Verify Jwt Token
    verify_jwt_token(token: string): { status: number; payload: JwtPayload | null } {
        try {
            const decodedToken = jwt.verify(token, this.secret) as JwtPayload;
            return { status: 200, payload: decodedToken }
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return { status: 401, payload: null };
            } else if (error instanceof jwt.JsonWebTokenError) {
                return { status: 400, payload: null };
            } else {
                return { status: 500, payload: null };
            }
        }
    }
    
    // Generate Jwt OTP
    otp_token(info: JwtPayload, otp: string): string {
        try {
            const payload: JwtPayload = { info: otp }
            const token = jwt.sign(payload, this.secret, { expiresIn: "5m" })
            return token
        } catch (error) {
            console.log(error);
            throw new Error(" Failed to generate new OTP token")
        }
    }

    // Refresh JWT Token
    refresh_jwt_token(token: string): { status : number; token:string | null}{
        const{status,payload}=this.verify_jwt_token(token)
        if(status === 200 && payload){
            const{id,role}=payload
            const new_token = this.create_jwt_token(id,role)
            return {status:200,token:new_token}
        }
        return {status,token:null}
        
    }
}

export default Jwt_token