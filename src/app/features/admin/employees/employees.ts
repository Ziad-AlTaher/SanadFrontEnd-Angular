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
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee } from '../../../core/models/admin.models';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule,
    TagModule, ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './employees.html',
  styleUrls: ['./employees.css'],
})
export class EmployeesComponent implements OnInit {
  private service = inject(EmployeeService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  employees = signal<Employee[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);
  isLoading = signal(false);

  roles = [
    { label: 'مدير (Admin)', value: 'admin' },
    { label: 'مشرف (Supervisor)', value: 'supervisor' },
    { label: 'موظف (Employee)', value: 'employee' }
  ];

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    nationalId: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['employee', [Validators.required]],
    department: ['', [Validators.required]],
    salary: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe(data => {
      this.employees.set(data);
      this.isLoading.set(false);
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.form.reset({ role: 'employee', salary: 0 });
    this.showDialog.set(true);
  }

  openEditDialog(item: Employee): void {
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
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل بيانات الموظف.' });
      });
    } else {
      const newItem = { ...value, status: 'active' as const, joinDate: new Date().toISOString().split('T')[0] };
      this.service.create(newItem).subscribe(() => {
        this.loadData();
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة موظف جديد.' });
      });
    }
  }

  toggleStatus(item: Employee): void {
    this.service.toggleStatus(item.id).subscribe(() => {
      this.loadData();
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة الموظف.' });
    });
  }

  confirmDelete(item: Employee): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف الموظف "${item.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id).subscribe(() => {
          this.loadData();
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف الموظف.' });
        });
      },
    });
  }

  getStatusSeverity(status: string): 'success' | 'danger' {
    return status === 'active' ? 'success' : 'danger';
  }

  getRoleLabel(role: string): string {
    return this.roles.find(r => r.value === role)?.label || role;
  }
}
