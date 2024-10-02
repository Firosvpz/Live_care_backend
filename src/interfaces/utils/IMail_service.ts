interface IMailService {
  sendMail(name: string, email: string, otp: string): Promise<void>;
  sendLeaveMail(
    name: string,
    email: string,
    cancelReason: string,
  ): Promise<void>;
}
export default IMailService;
