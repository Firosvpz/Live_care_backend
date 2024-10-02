interface IService_provider {
  _id?: string;
  name: string;
  email: string;
  password: string;
  phone_number: string;
  gender?: string;
  service?: string;
  qualification: string;
  specialization?: string;
  experience_crt?: string;
  profile_picture?: string;
  exp_year?: number;
  rate?: number;
  address?: string;
  is_approved: "Approved" | "Pending" | "Rejected";
  is_blocked: boolean;
  hasCompletedDetails: boolean;
}
export default IService_provider;
