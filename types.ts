export enum VisitorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
  CHECKED_OUT = 'CHECKED_OUT'
}

export interface Visitor {
  id: string;
  fullName: string;
  email: string; // Used for contact
  phoneNumber: string;
  company: string;
  purpose: string;
  hostName: string;
  hostDepartment: string;
  photoUrl?: string; // Base64 string
  idType: string;
  idNumber: string;
  checkInTime: string; // ISO String
  checkOutTime?: string; // ISO String
  approvalTime?: string; // ISO String
  badgeNumber?: string;
  inviteCode?: string;
  status: VisitorStatus;
  created_at?: string;
}

export interface DashboardStats {
  totalToday: number;
  currentlyOnSite: number;
  waitingApproval: number;
  declinedToday: number;
}


export interface User {
  id?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: 'admin' | 'staff' | 'reception';
  department?: string;
}

export type ViewState = 'check-in' | 'reception' | 'host-portal' | 'admin' | 'login' | 'staff-management';

export interface Notification {
  id: number;
  visitor_id: number;
  type: string;
  message: string;
  created_at: string;
  visitorName?: string;
  hostName?: string;
  isRead?: boolean;
}
