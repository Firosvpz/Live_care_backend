import { OAuth2Client } from "google-auth-library";
import IGoogleAuthService from "../../interfaces/utils/IGoogleAuth";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class GoogleAuthService implements IGoogleAuthService {
  constructor() {}

  async verifyGoogleToken(token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      return payload; // Return the payload directly
    } catch (error) {
      console.error("Error verifying Google token:", error);
      return null;
    }
  }
}
