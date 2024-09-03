interface IService_provider extends Document {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  service?: string;
  qualification: string;
  specialization?: string;
  experience_crt?: string;
  profile_picture?: string;
  exp_year?: number;
  rate?: number;
  address?: string;
  is_approved: boolean;
  is_blocked: boolean;
}
export default IService_provider;
