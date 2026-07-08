import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private employees: Employee[] = [
    { id: 1, name: 'مريم سالم الطيب', nationalId: '29901010100001', phone: '0111234567', email: 'mariam@sanad.org', role: 'admin', department: 'الإدارة', salary: 5000, status: 'active', joinDate: '2023-01-01' },
    { id: 2, name: 'يوسف عبد الله رمضان', nationalId: '29801020200002', phone: '0112345678', email: 'yousef@sanad.org', role: 'supervisor', department: 'المتابعة', salary: 4000, status: 'active', joinDate: '2023-06-15' },
    { id: 3, name: 'نورهان سعيد محمود', nationalId: '30001030300003', phone: '0113456789', email: 'nourhan@sanad.org', role: 'employee', department: 'التوزيع', salary: 3000, status: 'active', joinDate: '2024-01-10' },
    { id: 4, name: 'كريم محمد أحمد', nationalId: '29701040400004', phone: '0114567890', email: 'kareem@sanad.org', role: 'employee', department: 'التوثيق', salary: 3200, status: 'inactive', joinDate: '2023-09-01' },
  ];

  private nextId = 5;

  getAll(): Observable<Employee[]> {
    return of([...this.employees]);
  }

  getById(id: number): Observable<Employee | undefined> {
    return of(this.employees.find(e => e.id === id));
  }

  create(item: Omit<Employee, 'id'>): Observable<Employee> {
    const newItem: Employee = { ...item, id: this.nextId++ };
    this.employees.push(newItem);
    return of(newItem);
  }

  update(id: number, item: Partial<Employee>): Observable<Employee> {
    const index = this.employees.findIndex(e => e.id === id);
    this.employees[index] = { ...this.employees[index], ...item };
    return of(this.employees[index]);
  }

  toggleStatus(id: number): Observable<Employee> {
    const item = this.employees.find(e => e.id === id)!;
    item.status = item.status === 'active' ? 'inactive' : 'active';
    return of(item);
  }

  delete(id: number): Observable<void> {
    this.employees = this.employees.filter(e => e.id !== id);
    return of(void 0);
  }
}
