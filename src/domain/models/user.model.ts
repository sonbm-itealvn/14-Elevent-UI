export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'CUSTOMER' | 'ADMIN';
  provider: 'LOCAL' | 'GOOGLE' | 'FACEBOOK';
  active: boolean;
  emailVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPageResponse {
  content: User[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: 'CUSTOMER' | 'ADMIN';
  active?: boolean;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  role?: 'CUSTOMER' | 'ADMIN';
  active?: boolean;
}

export interface ToggleActiveRequest {
  active: boolean;
}

