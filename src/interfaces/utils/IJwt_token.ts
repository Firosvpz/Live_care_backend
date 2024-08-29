
import { JwtPayload } from "jsonwebtoken";

interface IJwt_token {
    create_jwt_token(id: string, role: string): string
    verify_jwt_token(token: string): JwtPayload | null
    otp_token(info: JwtPayload, otp: string): string
    refresh_jwt_token(token: string): { status: number; token: string | null }
}

export default IJwt_token