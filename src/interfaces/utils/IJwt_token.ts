import { JwtPayload } from "jsonwebtoken";
interface IJwtToken {
  createJwtToken(id: string, role: string): string;
  verifyJwtToken(token: string): JwtPayload | null;
  otpToken(info: JwtPayload, otp: string): string;
}
export default IJwtToken;
