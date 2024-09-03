interface IUser {
  _id?: string;
  name: string;
  email: string;
  dob?: Date;
  phone_number: string;
  password: string;
  is_blocked: boolean;
  user_address?: string;
  record_date: Date;
  created_at: Date;
  updated_at: Date;
  emergency_contact?: string;
  medical_history?: string;
  profile_picture?: string;
  additional_notes?: string;
}

export default IUser;
