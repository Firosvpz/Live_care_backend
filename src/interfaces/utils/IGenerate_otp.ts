 interface IGenerateOtp {
  generateOtp(length?: number): string
  setExpiration(expirationTime: number): void;
  isOtpExpired(otp:string):boolean
}
export default IGenerateOtp