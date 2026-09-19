export interface User {
  userId: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'admin' | 'staff' | 'audit' | 'customer';
  status?: 'active' | 'locked';
  dateOfBirth?: string;   
  gender?: 'Nam' | 'Nữ' | 'Khác';
  avatarUrl?: string;
  createdAt?: string;
}

