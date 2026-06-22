export interface User {
  userId: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'customer';
  dateOfBirth?: string;   // dd/mm/yyyy
  gender?: 'Nam' | 'Nữ' | 'Khác';
  avatarUrl?: string;
  createdAt?: string;
}
