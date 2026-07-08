import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Donation } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class DonationService {
  private donations: Donation[] = [
    { id: 1, donorName: 'محمد العربي', donorPhone: '0111111111', amount: 5000, type: 'cash', description: 'تبرع عام لصندوق المساعدات', date: '2025-01-05', status: 'allocated' },
    { id: 2, donorName: 'شركة الخير للتجارة', donorPhone: '0222222222', amount: 20000, type: 'cash', description: 'رعاية شهرية للأيتام', date: '2025-02-01', status: 'received' },
    { id: 3, donorName: 'حنان سمير', donorPhone: '0333333333', amount: 1500, type: 'cash', description: 'تبرع رمضان', date: '2025-03-10', status: 'pending' },
    { id: 4, donorName: 'مصنع الغذاء الوطني', donorPhone: '0444444444', amount: 10000, type: 'in-kind', description: 'مواد غذائية متنوعة', date: '2025-03-15', status: 'received' },
    { id: 5, donorName: 'علي صالح العمري', donorPhone: '0555555555', amount: 3000, type: 'cash', description: 'مساعدة الأسر المحتاجة', date: '2025-04-02', status: 'allocated' },
  ];

  private nextId = 6;

  getAll(): Observable<Donation[]> {
    return of([...this.donations]);
  }

  getById(id: number): Observable<Donation | undefined> {
    return of(this.donations.find(d => d.id === id));
  }

  create(item: Omit<Donation, 'id'>): Observable<Donation> {
    const newItem: Donation = { ...item, id: this.nextId++ };
    this.donations.push(newItem);
    return of(newItem);
  }

  update(id: number, item: Partial<Donation>): Observable<Donation> {
    const index = this.donations.findIndex(d => d.id === id);
    this.donations[index] = { ...this.donations[index], ...item };
    return of(this.donations[index]);
  }

  toggleStatus(id: number): Observable<Donation> {
    const item = this.donations.find(d => d.id === id)!;
    // Toggle between pending and received
    item.status = item.status === 'pending' ? 'received' : 'pending';
    return of(item);
  }

  delete(id: number): Observable<void> {
    this.donations = this.donations.filter(d => d.id !== id);
    return of(void 0);
  }
}
