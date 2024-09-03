import crypto from "crypto";
import IGenerate_otp from "interfaces/utils/IGenerate_otp";

// Generate OTP
class Otp_generate implements IGenerate_otp {
  private expiration_time: number;
  private otp_creation_time: { [otp: string]: number } = {};

  constructor(expiration_time: number = 5 * 60 * 1000) {
    this.expiration_time = expiration_time;
  }

  // OTP Generation
  generate_otp(length: number = 4): string {
    const digits = "0123456789";
    const otp = Array.from({ length }, () =>
      digits.charAt(crypto.randomInt(digits.length)),
    ).join("");
    this.otp_creation_time[otp] = Date.now();
    return otp;
  }

  // Set Expiration Time
  set_expiration(expiration_time: number): void {
    this.expiration_time = expiration_time;
  }

  // Check if OTP expired
  is_otp_expired(otp: string): boolean {
    const creation_time = this.otp_creation_time[otp];
    if (!creation_time) {
      return true;
    }
    return Date.now() - creation_time > this.expiration_time;
  }
}

export default Otp_generate;
