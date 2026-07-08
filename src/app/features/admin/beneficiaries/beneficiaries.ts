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
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { ReadBeneficiaryDto } from '../../../core/models/beneficiary.models';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, TagModule,
    ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './beneficiaries.html',
  styleUrls: ['./beneficiaries.css'],
})
export class BeneficiariesComponent implements OnInit {
  private service = inject(BeneficiaryService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  beneficiaries = signal<ReadBeneficiaryDto[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<string | null>(null);
  isLoading = signal(false);
  globalFilter = '';

  form: FormGroup = this.fb.group({
    fullName:    ['', [Validators.required]],
    nationalId:  ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    address:     ['', [Validators.required]],
    notes:       [''],
    birthDate:   [null, [Validators.required]],
    isActive:    [true],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe(data => {
      this.beneficiaries.set(data);
      this.isLoading.set(false);
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.form.reset({ isActive: true });
    this.showDialog.set(true);
  }

  openEditDialog(item: ReadBeneficiaryDto): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id || null);
    // Format the date to string if needed by input type="date"
    let formattedDate = item.birthDate;
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    this.form.patchValue({
      ...item,
      birthDate: formattedDate
    });
    this.showDialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    if (this.isEditMode() && this.selectedId()) {
      this.service.update(this.selectedId()!, { ...value, id: this.selectedId()! }).subscribe((updatedItem) => {
        this.beneficiaries.update(list => list.map(b => b.id === this.selectedId() ? updatedItem : b));
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل بيانات المستحق.' });
      });
    } else {
      this.service.create(value).subscribe((newItem) => {
        this.beneficiaries.update(list => [newItem, ...list]);
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة مستحق جديد.' });
      });
    }
  }

  toggleStatus(item: ReadBeneficiaryDto): void {
    this.service.toggleStatus(item.id!).subscribe(() => {
      this.beneficiaries.update(list => list.map(b => b.id === item.id ? { ...b, isActive: !b.isActive } : b));
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة المستحق.' });
    });
  }

  confirmDelete(item: ReadBeneficiaryDto): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف "${item.fullName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.beneficiaries.update(list => list.filter(b => b.id !== item.id));
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف المستحق.' });
        });
      },
    });
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}
