// =============================================
// Admin Feature Interfaces
// All admin-related data models live here
// =============================================


export interface Employee {
  id: number;
  name: string;
  nationalId: string;
  phone: string;
  email: string;
  role: 'admin' | 'supervisor' | 'employee';
  department: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

export interface Assistance {
  id: number;
  type: string;
  description: string;
  amount: number;
  beneficiaryId: number;
  beneficiaryName: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
}

export interface Donation {
  id: number;
  donorName: string;
  donorPhone: string;
  amount: number;
  type: 'cash' | 'in-kind';
  description: string;
  date: string;
  status: 'pending' | 'received' | 'allocated';
}

export interface DashboardStats {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  totalEmployees: number;
  totalDonations: number;
  totalAssistance: number;
  monthlyDonationsAmount: number;
}
