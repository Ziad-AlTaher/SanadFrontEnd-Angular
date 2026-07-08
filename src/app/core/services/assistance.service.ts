import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Assistance } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AssistanceService {
  private assistances: Assistance[] = [
    { id: 1, type: 'غذائية', description: 'سلة غذائية شهرية', amount: 500, beneficiaryId: 1, beneficiaryName: 'أحمد محمد علي', date: '2025-01-10', status: 'delivered' },
    { id: 2, type: 'مالية', description: 'مساعدة نقدية طارئة', amount: 1000, beneficiaryId: 2, beneficiaryName: 'فاطمة حسن سيد', date: '2025-02-15', status: 'approved' },
    { id: 3, type: 'طبية', description: 'تغطية فاتورة مستشفى', amount: 3000, beneficiaryId: 4, beneficiaryName: 'سمر عبد الرحمن', date: '2025-03-01', status: 'pending' },
    { id: 4, type: 'تعليمية', description: 'رسوم دراسية فصل دراسي', amount: 2000, beneficiaryId: 5, beneficiaryName: 'عمر خالد مصطفى', date: '2025-03-20', status: 'approved' },
    { id: 5, type: 'إيجار', description: 'مساعدة إيجار شهرية', amount: 800, beneficiaryId: 1, beneficiaryName: 'أحمد محمد علي', date: '2025-04-01', status: 'pending' },
  ];

  private nextId = 6;

  getAll(): Observable<Assistance[]> {
    return of([...this.assistances]);
  }

  getById(id: number): Observable<Assistance | undefined> {
    return of(this.assistances.find(a => a.id === id));
  }

  create(item: Omit<Assistance, 'id'>): Observable<Assistance> {
    const newItem: Assistance = { ...item, id: this.nextId++ };
    this.assistances.push(newItem);
    return of(newItem);
  }

  update(id: number, item: Partial<Assistance>): Observable<Assistance> {
    const index = this.assistances.findIndex(a => a.id === id);
    this.assistances[index] = { ...this.assistances[index], ...item };
    return of(this.assistances[index]);
  }

  toggleStatus(id: number): Observable<Assistance> {
    const item = this.assistances.find(a => a.id === id)!;
    // For assistance: toggle between pending and approved
    item.status = item.status === 'pending' ? 'approved' : 'pending';
    return of(item);
  }

  delete(id: number): Observable<void> {
    this.assistances = this.assistances.filter(a => a.id !== id);
    return of(void 0);
  }
}
