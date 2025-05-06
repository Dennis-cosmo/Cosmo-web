export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  status: UserStatus;
  companyName?: string;
  companySize?: string;
  industry?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserCreateDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
}

export interface UserUpdateDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface UserLoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: User;
} 