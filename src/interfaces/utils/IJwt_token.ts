import { JwtPayload } from "jsonwebtoken";

interface IJwt_token {
  create_access_token(id: string, role: string): string;
  verify_jwt_token(token: string): JwtPayload | null;
  otp_token(info: JwtPayload, otp: string): string;
  create_refresh_token(id: string, role: string): string;
}

export default IJwt_token;
