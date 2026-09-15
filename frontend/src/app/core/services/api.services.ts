import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Acceptance, Company, Evaluation, Internship, Student, Supervisor, TaskApproval } from '../models/entities';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private get base(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('internship-api-url');
      if (stored && stored.startsWith('http://192.168.')) {
        return stored.replace(/\/+$/, '');
      }
      if (stored && stored.includes('localhost:8083')) {
        localStorage.removeItem('internship-api-url');
      }
    }
    return (environment.apiUrl || 'http://192.168.56.10:8083').replace(/\/+$/, '');
  }
  constructor(private http: HttpClient) {}
  students = { list: () => this.http.get<Student[]>(`${this.base}/student`), get: (id: number) => this.http.get<Student>(`${this.base}/student/${id}`), save: (item: Student) => (item.id != null && item.id > 0) ? this.http.put<Student>(`${this.base}/student/${item.id}`, item) : this.http.post<Student>(`${this.base}/student`, item), remove: (id: number) => this.http.delete(`${this.base}/student/${id}`) };
  companies = { list: () => this.http.get<Company[]>(`${this.base}/companies`), get: (id: number) => this.http.get<Company>(`${this.base}/companies/${id}`), save: (item: Company) => (item.id != null && item.id > 0) ? this.http.put<Company>(`${this.base}/companies/${item.id}`, item) : this.http.post<Company>(`${this.base}/companies`, item), remove: (id: number) => this.http.delete(`${this.base}/companies/${id}`) };
  internships = { list: () => this.http.get<Internship[]>(`${this.base}/internships`), byStudent: (id: number) => this.http.get<Internship[]>(`${this.base}/internships/student/${id}`), byStatus: (status: string) => this.http.get<Internship[]>(`${this.base}/internships/status/${status}`), get: (id: number) => this.http.get<Internship>(`${this.base}/internships/${id}`), save: (item: Internship) => (item.id != null && item.id > 0) ? this.http.put<Internship>(`${this.base}/internships/${item.id}`, item) : this.http.post<Internship>(`${this.base}/internships`, item), remove: (id: number) => this.http.delete(`${this.base}/internships/${id}`) };
  supervisors = { list: () => this.http.get<Supervisor[]>(`${this.base}/supervisors`), get: (id: number) => this.http.get<Supervisor>(`${this.base}/supervisors/${id}`), byCompany: (id: number) => this.http.get<Supervisor[]>(`${this.base}/supervisors/company/${id}`), save: (item: Supervisor) => (item.id != null && item.id > 0) ? this.http.put<Supervisor>(`${this.base}/supervisors/${item.id}`, item) : this.http.post<Supervisor>(`${this.base}/supervisors`, item), remove: (id: number) => this.http.delete(`${this.base}/supervisors/${id}`) };
  acceptances = { list: () => this.http.get<Acceptance[]>(`${this.base}/acceptances`), get: (id: number) => this.http.get<Acceptance>(`${this.base}/acceptances/${id}`), byCompany: (id: number) => this.http.get<Acceptance[]>(`${this.base}/acceptances/company/${id}`), save: (item: Acceptance) => (item.id != null && item.id > 0) ? this.http.put<Acceptance>(`${this.base}/acceptances/${item.id}`, item) : this.http.post<Acceptance>(`${this.base}/acceptances`, item), remove: (id: number) => this.http.delete(`${this.base}/acceptances/${id}`) };
  tasks = { list: () => this.http.get<TaskApproval[]>(`${this.base}/task-approvals`), get: (id: number) => this.http.get<TaskApproval>(`${this.base}/task-approvals/${id}`), byInternship: (id: number) => this.http.get<TaskApproval[]>(`${this.base}/task-approvals/internship/${id}`), save: (item: TaskApproval) => (item.id != null && item.id > 0) ? this.http.put<TaskApproval>(`${this.base}/task-approvals/${item.id}`, item) : this.http.post<TaskApproval>(`${this.base}/task-approvals`, item), remove: (id: number) => this.http.delete(`${this.base}/task-approvals/${id}`) };
  evaluations = { list: () => this.http.get<Evaluation[]>(`${this.base}/evaluations`), get: (id: number) => this.http.get<Evaluation>(`${this.base}/evaluations/${id}`), byInternship: (id: number) => this.http.get<Evaluation[]>(`${this.base}/evaluations/internship/${id}`), save: (item: Evaluation) => (item.id != null && item.id > 0) ? this.http.put<Evaluation>(`${this.base}/evaluations/${item.id}`, item) : this.http.post<Evaluation>(`${this.base}/evaluations`, item), remove: (id: number) => this.http.delete(`${this.base}/evaluations/${id}`) };
}
