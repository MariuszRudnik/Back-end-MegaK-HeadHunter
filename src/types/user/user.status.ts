export enum UserStatus {
  AVAILABLE = 'available',
  DURING = 'during',
  HIRED = 'hired',
}

export interface UserStatusType {
  id_student: string;
  student_status: UserStatus;
  atCurrent: Date;
}
