interface IMail_service {
  sendmail(name: string, email: string, otp: string): Promise<void>;
}

export default IMail_service;
