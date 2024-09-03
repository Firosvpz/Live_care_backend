import jwt, { JwtPayload } from "jsonwebtoken";
import IJwt_token from "interfaces/utils/IJwt_token";

class Jwt_token implements IJwt_token {
  private secret: string;
  private refreshSecret: string;

  constructor(secret: string, refreshSecret: string) {
    this.secret = secret;
    this.refreshSecret = refreshSecret;
  }

  // Create new Access Token
  create_access_token(id: string, role: string): string {
    const payload: JwtPayload = { id, role };
    const token = jwt.sign(payload, this.secret, { expiresIn: "1d" }); // Access token expires in 1 day
    console.log("create token:", token);
    return token;
  }

  // Create new Refresh Token
  // Create new Refresh Token
  create_refresh_token(id: string, role: string): string {
    const payload: JwtPayload = { id, role };
    const token = jwt.sign(payload, this.secret, { expiresIn: "7d" }); // Refresh token expires in 7 days
    return token;
  }

  // Verify Jwt Token (Can be used for both Access and Refresh Tokens)
  verify_jwt_token(
    token: string,
    isRefreshToken: boolean = false,
  ): JwtPayload | null {
    try {
      const secret = isRefreshToken ? this.refreshSecret : this.secret;
      console.log('secret',secret);
      
      const decodedToken = jwt.verify(token, secret) as JwtPayload;
      console.log("secr:", secret);
      console.log("dec:", decodedToken);
      return decodedToken;
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return null;
    }
  }

  // Generate Jwt OTP
  otp_token(info: JwtPayload, otp: string): string {
    try {
      const payload: JwtPayload = { info, otp };
      const token = jwt.sign(payload, this.secret, { expiresIn: "5m" });
      return token;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to generate new OTP token");
    }
  }

  // Refresh Access Token using Refresh Token
  refresh_access_token(refreshToken: string): {
    status: number;
    token: string | null;
  } {
    const decodedToken = this.verify_jwt_token(refreshToken, true);
    if (decodedToken) {
      const { id, role } = decodedToken;
      const newToken = this.create_access_token(id, role);
      return { status: 200, token: newToken };
    }
    return { status: 401, token: null };
  }
}

export default Jwt_token;
