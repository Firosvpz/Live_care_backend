export interface IReview {
  userId: string ;
  userName?: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

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
  ratingAverage?: number;
  reviewCount?: number;
  reviews?: IReview[];
}
export default IService_provider;
