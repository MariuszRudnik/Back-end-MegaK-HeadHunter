export enum Role {
  admin = 'admin',
  student = 'student',
  recruiter = 'recruiter',
}

export interface Code {
  coded: string;
  iv: string;
}

export interface UserResponse {
  actionStatus: boolean;
  message: any;
}
