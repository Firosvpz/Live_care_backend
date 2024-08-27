
interface IGenerate_otp {
    generate_otp(length?: number): string
    set_expiration(expiration_time: number): void
    is_otp_expired(otp: string): boolean
}

export default IGenerate_otp