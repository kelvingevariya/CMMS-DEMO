import { Audit } from './owns/audit';
import { Role } from './owns/role';
import File from './owns/file';

export type UserRole = 'admin' | 'customer' | 'subscriber';

export interface User {
  id: string;
  avatar: string;
  email: string;
  name: string;
  jobtitle: string;
  username: string;
  location: string;
  role: UserRole;
  posts: string;
  coverImg: string;
  followers: string;
  description: string;
  [key: string]: any;
}

export interface OwnUser extends Audit {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  rate: number;
  phone: string;
  ownsCompany: boolean;
  jobTitle: string;
  role: Role;
  companyId: number;
  image: File;
  lastLogin: string;
}
export interface UserMiniDTO {
  firstName: string;
  lastName: string;
  image: File;
  id: number;
}

export interface UserResponseDTO extends OwnUser {
  companySettingsId: number;
  userSettingsId: number;
}
