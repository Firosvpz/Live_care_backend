interface IMailService {
  sendMail(name: string, email: string, otp: string): Promise<void>;
}
export default IMailService;
