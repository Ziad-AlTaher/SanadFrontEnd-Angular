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
import { ReadDonationDto, DonationType } from '../../../core/models/donation.models';

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

  donations = signal<ReadDonationDto[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<string | null>(null);
  isLoading = signal(false);

  donationTypes = [
    { label: 'admin.donations.cash', value: 1 },
    { label: 'admin.donations.inkind', value: 2 },
    { label: 'admin.donations.bankTransfer', value: 3 }
  ];

  form: FormGroup = this.fb.group({
    donorName: ['', [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0)]],
    donationType: [1, [Validators.required]],
    donationDate: [null, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.donations.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.form.reset({ donationType: 1, amount: 0, donationDate: new Date().toISOString().split('T')[0] });
    this.showDialog.set(true);
  }

  openEditDialog(item: ReadDonationDto): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id || null);
    let formattedDate = item.donationDate;
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    this.form.patchValue({
      ...item,
      donationDate: formattedDate
    });
    this.showDialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    if (this.isEditMode() && this.selectedId()) {
      this.service.update(this.selectedId()!, { ...value, id: this.selectedId()! }).subscribe((updatedItem) => {
        this.donations.update(list => list.map(b => b.id === this.selectedId() ? updatedItem : b));
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل بيانات التبرع.' });
      });
    } else {
      this.service.create(value).subscribe((newItem) => {
        this.donations.update(list => [newItem, ...list]);
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم تسجيل التبرع بنجاح.' });
      });
    }
  }

  confirmDelete(item: ReadDonationDto): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف تبرع "${item.donorName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.donations.update(list => list.filter(b => b.id !== item.id));
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف التبرع.' });
        });
      },
    });
  }

  getDonationTypeLabel(type: DonationType): string {
    switch (type) {
      case DonationType.Cash: return 'admin.donations.cash';
      case DonationType.InKind: return 'admin.donations.inkind';
      case DonationType.BankTransfer: return 'admin.donations.bankTransfer';
      default: return '';
    }
  }

  getDonationTypeSeverity(type: DonationType): 'success' | 'info' | 'warn' {
    switch (type) {
      case DonationType.Cash: return 'success';
      case DonationType.InKind: return 'warn';
      case DonationType.BankTransfer: return 'info';
      default: return 'success';
    }
  }

  exportExcel(): void {
    this.service.exportExcel().subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(file);
        window.open(url, '_blank');
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تصدير ملف Excel.' })
    });
  }

  exportPdf(): void {
    this.service.exportPdf().subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(file);
        window.open(url, '_blank');
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تصدير ملف PDF.' })
    });
  }
}
