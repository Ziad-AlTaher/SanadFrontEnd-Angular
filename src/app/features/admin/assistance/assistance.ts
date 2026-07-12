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
import { AssistanceService } from '../../../core/services/assistance.service';
import { Assistance } from '../../../core/models/admin.models';

@Component({
  selector: 'app-assistance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule,
    TagModule, ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './assistance.html',
  styleUrls: ['./assistance.css'],
})
export class AssistanceComponent implements OnInit {
  private service = inject(AssistanceService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  assistanceList = signal<Assistance[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);
  isLoading = signal(false);

  types = [
    { label: 'مالية', value: 'مالية' },
    { label: 'غذائية', value: 'غذائية' },
    { label: 'طبية', value: 'طبية' },
    { label: 'تعليمية', value: 'تعليمية' },
    { label: 'إيجار', value: 'إيجار' },
    { label: 'أخرى', value: 'أخرى' }
  ];

  form: FormGroup = this.fb.group({
    type: ['مالية', [Validators.required]],
    description: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(1)]],
    beneficiaryName: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe(data => {
      this.assistanceList.set(data);
      this.isLoading.set(false);
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.form.reset({ type: 'مالية', amount: 0 });
    this.showDialog.set(true);
  }

  openEditDialog(item: Assistance): void {
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
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل بيانات المساعدة.' });
      });
    } else {
      const newItem = {
        ...value,
        status: 'pending' as const,
        date: new Date().toISOString().split('T')[0],
        beneficiaryId: Math.floor(Math.random() * 100) + 1 // mock
      };
      this.service.create(newItem).subscribe(() => {
        this.loadData();
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة مساعدة جديدة.' });
      });
    }
  }

  toggleStatus(item: Assistance): void {
    this.service.toggleStatus(item.id).subscribe(() => {
      this.loadData();
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة المساعدة.' });
    });
  }

  confirmDelete(item: Assistance): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف المساعدة الخاصة بـ "${item.beneficiaryName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id).subscribe(() => {
          this.loadData();
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف المساعدة.' });
        });
      },
    });
  }

  getStatusSeverity(status: string): 'info' | 'warn' | 'success' | 'danger' {
    switch (status) {
      case 'pending': return 'warn';
      case 'approved': return 'info';
      case 'delivered': return 'success';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'مقبولة';
      case 'delivered': return 'تم التسليم';
      case 'rejected': return 'مرفوضة';
      default: return status;
    }
  }
}
