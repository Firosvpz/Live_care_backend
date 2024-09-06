import crypto from 'crypto'
import IGenerateOtp  from '../../interfaces/utils/IGenerate_otp';

class GenerateOtp implements IGenerateOtp {
    private expirationTime:number
    private creationTime:{[otp:string]:number} = {}

    constructor(expirationTime:number = 5*60*1000){
      this.expirationTime=expirationTime
    }

    generateOtp(length: number = 4): string {
       const digits = "0123456789"
       const otp = Array.from({length},()=>
        digits.charAt(crypto.randomInt(digits.length)),
       ).join("")
       this.creationTime[otp]=Date.now()
       return otp
    }

    setExpiration(expirationTime: number): void {
      this.expirationTime=expirationTime
    }

    isOtpExpired(otp: string): boolean {
      const creationTime = this.creationTime[otp]
      if(!creationTime){
        return true
      }
      return Date.now() - creationTime > this.expirationTime
    }
}

export default GenerateOtp