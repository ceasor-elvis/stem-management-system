export type UserRole = 'admin' | 'staff' | 'security';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  className: string;
  photo: string;
  devicePhotos: string[];
  deviceDescription: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked-in' | 'checked-out';
  recordId: string;
}

export interface CheckInData {
  studentName: string;
  className: string;
  studentId: string;
  deviceDescription: string;
  studentPhoto: string;
  devicePhotos: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
