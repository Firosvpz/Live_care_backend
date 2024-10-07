interface IGoogleAuthService {
  verifyGoogleToken(token: string): Promise<any>;
}

export default IGoogleAuthService;
