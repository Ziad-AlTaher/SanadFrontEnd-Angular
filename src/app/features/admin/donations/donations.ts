import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { DonationService } from '../../../core/services/donation.service';
import { Donation } from '../../../core/models/admin.models';

@Component({
  selector: 'app-donations',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule,
    TagModule, ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './donations.html',
  styleUrls: ['./donations.css'],
})
export class DonationsComponent implements OnInit {
  private service = inject(DonationService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  donations = signal<Donation[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);
  isLoading = signal(false);

  types = [
    { label: 'نقدي (Cash)', value: 'cash' },
    { label: 'عيني (In-kind)', value: 'in-kind' }
  ];

  form: FormGroup = this.fb.group({
    donorName:   ['', [Validators.required]],
    donorPhone:  ['', [Validators.required]],
    type:        ['cash', [Validators.required]],
    amount:      [0,  [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe(data => {
      this.donations.set(data);
      this.isLoading.set(false);
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.form.reset({ type: 'cash', amount: 0 });
    this.showDialog.set(true);
  }

  openEditDialog(item: Donation): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id);
    this.form.patchValue(item);
    this.showDialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    if (this.isEditMode() && this.selectedId()) {
      this.service.update(this.selectedId()!, value).subscribe(() => {
        this.loadData();
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل بيانات التبرع.' });
      });
    } else {
      const newItem = { 
        ...value, 
        status: 'pending' as const, 
        date: new Date().toISOString().split('T')[0]
      };
      this.service.create(newItem).subscribe(() => {
        this.loadData();
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة تبرع جديد.' });
      });
    }
  }

  toggleStatus(item: Donation): void {
    this.service.toggleStatus(item.id).subscribe(() => {
      this.loadData();
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة التبرع.' });
    });
  }

  confirmDelete(item: Donation): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف تبرع "${item.donorName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id).subscribe(() => {
          this.loadData();
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف التبرع.' });
        });
      },
    });
  }

  getStatusSeverity(status: string): 'info' | 'warn' | 'success' {
    switch(status) {
      case 'pending': return 'warn';
      case 'received': return 'success';
      case 'allocated': return 'info';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'pending': return 'قيد الانتظار';
      case 'received': return 'تم الاستلام';
      case 'allocated': return 'تم التخصيص';
      default: return status;
    }
  }
}
