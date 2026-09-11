export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN';

export interface Student { id?: number; firstName: string; lastName: string; email: string; phone: string; }
export interface Company { id?: number; name: string; email: string; phone: string; address: string; }
export interface Internship { id?: number; title: string; company: string; description: string; startDate: string; endDate: string; studentId: number; status: string; }
export interface Supervisor { id?: number; firstName: string; lastName: string; email: string; phone: string; companyId: number; }
export interface Acceptance { id?: number; internshipId: number; companyId: number; status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; reason?: string; }
export interface TaskApproval { id?: number; internshipId: number; supervisorId: number; taskDescription: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; comment?: string; }
export interface Evaluation { id?: number; internshipId: number; supervisorId: number; quality: number; punctuality: number; communication: number; overallGrade: number; appreciation?: string; remarks?: string; }
