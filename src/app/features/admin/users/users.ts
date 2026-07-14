import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { UserService } from '../../../core/services/user.service';
import { GetUserDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, TagModule,
    ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersComponent implements OnInit {
  private service = inject(UserService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  users = signal<GetUserDto[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<number | null>(null);
  isLoading = signal(false);

  selectedRoles: string[] = [];

  form: FormGroup = this.fb.group({
    userName:            ['', [Validators.required]],
    email:               ['', [Validators.required, Validators.email]],
    phoneNumber:         [''],
    address:             [''],
    nationality:         [''],
    password:            [''],
    confirmPassword:     [''],
    isActive:            [true],
    forcePasswordChange: [false],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.selectedRoles = ['User'];
    this.form.reset({ isActive: true, forcePasswordChange: false });
    this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('confirmPassword')?.setValidators([Validators.required]);
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
    this.showDialog.set(true);
  }

  openEditDialog(item: GetUserDto): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id || null);
    this.selectedRoles = item.roles ? [...item.roles] : [];
    this.form.reset({
      userName: item.userName,
      email: item.email,
      phoneNumber: item.phoneNumber,
      address: item.address,
      nationality: item.nationality,
      password: '',
      confirmPassword: '',
      isActive: item.isActive,
      forcePasswordChange: item.forcePasswordChange
    });
    this.form.get('password')?.clearValidators();
    this.form.get('confirmPassword')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.updateValueAndValidity();
    this.showDialog.set(true);
  }

  onRoleChange(role: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedRoles.includes(role)) {
        this.selectedRoles.push(role);
      }
    } else {
      this.selectedRoles = this.selectedRoles.filter(r => r !== role);
    }
  }

  hasRole(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;

    if (value.password || !this.isEditMode()) {
      if (value.password !== value.confirmPassword) {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'كلمتا المرور غير متطابقتين.' });
        return;
      }
    }

    const payload = {
      ...value,
      roles: this.selectedRoles
    };

    if (this.isEditMode() && this.selectedId()) {
      this.service.update(this.selectedId()!, payload).subscribe((updatedItem) => {
        this.users.update(list => list.map(u => u.id === this.selectedId() ? updatedItem : u));
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل بيانات المستخدم بنجاح.' });
      });
    } else {
      this.service.create(payload).subscribe((newItem) => {
        this.users.update(list => [newItem, ...list]);
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة المستخدم بنجاح.' });
      });
    }
  }

  toggleStatus(item: GetUserDto): void {
    this.service.updateUserStatus(item.id!).subscribe(() => {
      this.users.update(list => list.map(u => u.id === item.id ? { ...u, isActive: !u.isActive } : u));
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة المستخدم.' });
    });
  }

  resetPasswordSms(item: GetUserDto): void {
    this.service.resetPasswordAndSendSms(item.id!).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم إرسال رابط إعادة تعيين كلمة المرور.' });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل إرسال رسالة إعادة التعيين.' });
      }
    });
  }

  confirmDelete(item: GetUserDto): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف المستخدم "${item.userName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.users.update(list => list.filter(u => u.id !== item.id));
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف المستخدم بنجاح.' });
        });
      },
    });
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}
