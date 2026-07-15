import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { AttachmentService } from '../../../core/services/attachment.service';
import { AidDisbursementService } from '../../../core/services/aid-disbursement.service';
import { ReadBeneficiaryDto, MaritalStatus, HealthStatus } from '../../../core/models/beneficiary.models';
import { ReadAttachmentDto, FileType } from '../../../core/models/attachment.models';
import { ReadAidDisbursementDto } from '../../../core/models/aid-disbursement.models';
import { environment } from '@env/environment';

import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-beneficiaries',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, TagModule,
    ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
    SelectModule, RouterModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './beneficiaries.html',
  styleUrls: ['./beneficiaries.css'],
})
export class BeneficiariesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('excelImportInput') excelImportInput!: ElementRef<HTMLInputElement>;

  private service = inject(BeneficiaryService);
  private attachmentService = inject(AttachmentService);
  private aidDisbursementService = inject(AidDisbursementService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  beneficiaries = signal<ReadBeneficiaryDto[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<string | null>(null);
  isLoading = signal(false);
  globalFilter = '';

  // Attachments state
  showAttachmentsDialog = signal(false);
  showAttachmentFormDialog = signal(false);
  currentBeneficiary = signal<ReadBeneficiaryDto | null>(null);
  attachments = signal<ReadAttachmentDto[]>([]);
  isAttachmentEditMode = signal(false);
  selectedAttachmentId = signal<string | null>(null);
  attachmentFile: File | null = null;
  isAttachmentsLoading = signal(false);

  // Aid Disbursements state
  showAidDialog = signal(false);
  aidDisbursements = signal<ReadAidDisbursementDto[]>([]);
  isAidLoading = signal(false);

  fileTypes = [
    { label: 'صورة (Image)', value: 1 },
    { label: 'ملف PDF', value: 2 },
    { label: 'ملف وورد (Word)', value: 3 },
    { label: 'ملف إكسل (Excel)', value: 4 },
    { label: 'آخر (Other)', value: 5 }
  ];

  maritalStatuses = [
    { label: 'admin.maritalStatus.single', value: MaritalStatus.Single },
    { label: 'admin.maritalStatus.married', value: MaritalStatus.Married },
    { label: 'admin.maritalStatus.divorced', value: MaritalStatus.Divorced },
    { label: 'admin.maritalStatus.widowed', value: MaritalStatus.Widowed }
  ];

  healthStatuses = [
    { label: 'admin.healthStatus.healthy', value: HealthStatus.Healthy },
    { label: 'admin.healthStatus.kidneyDialysis', value: HealthStatus.KidneyDialysis },
    { label: 'admin.healthStatus.burnInjury', value: HealthStatus.BurnInjury },
    { label: 'admin.healthStatus.amputation', value: HealthStatus.Amputation },
    { label: 'admin.healthStatus.chronicIllness', value: HealthStatus.ChronicIllness }
  ];

  form: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    nationalId: ['', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
    address: ['', [Validators.required]],
    notes: [''],
    birthDate: [null, [Validators.required]],
    isActive: [true],
    maritalStatus: [MaritalStatus.Single, [Validators.required]],
    healthStatus: [HealthStatus.Healthy, [Validators.required]],
    numberOfDependents: [0, [Validators.required, Validators.min(0)]],
  });

  attachmentForm: FormGroup = this.fb.group({
    fileName: ['', [Validators.required]],
    fileType: [1, [Validators.required]],
    isActive: [true]
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
    this.form.reset({ isActive: true, maritalStatus: MaritalStatus.Single, healthStatus: HealthStatus.Healthy, numberOfDependents: 0 });
    this.showDialog.set(true);
  }

  getMaritalStatusLabel(status?: MaritalStatus): string {
    if (status === undefined || status === null) return '';
    switch (status) {
      case MaritalStatus.Single: return 'admin.maritalStatus.single';
      case MaritalStatus.Married: return 'admin.maritalStatus.married';
      case MaritalStatus.Divorced: return 'admin.maritalStatus.divorced';
      case MaritalStatus.Widowed: return 'admin.maritalStatus.widowed';
      default: return '';
    }
  }

  getHealthStatusLabel(status?: HealthStatus): string {
    if (status === undefined || status === null) return '';
    switch (status) {
      case HealthStatus.Healthy: return 'admin.healthStatus.healthy';
      case HealthStatus.KidneyDialysis: return 'admin.healthStatus.kidneyDialysis';
      case HealthStatus.BurnInjury: return 'admin.healthStatus.burnInjury';
      case HealthStatus.Amputation: return 'admin.healthStatus.amputation';
      case HealthStatus.ChronicIllness: return 'admin.healthStatus.chronicIllness';
      default: return '';
    }
  }

  openEditDialog(item: ReadBeneficiaryDto): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id || null);
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

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }

  // ==========================================
  // Attachments Management
  // ==========================================

  openAttachments(beneficiary: ReadBeneficiaryDto): void {
    this.currentBeneficiary.set(beneficiary);
    this.showAttachmentsDialog.set(true);
    this.loadAttachments();
  }

  loadAttachments(): void {
    const beneficiaryId = this.currentBeneficiary()?.id;
    if (!beneficiaryId) return;
    console.log("Attachment before clear :", this.attachments());
    this.attachments.set([]);
    this.isAttachmentsLoading.set(true);
    this.attachmentService.getByBeneficiaryId(beneficiaryId).subscribe({
      next: (data) => {
        this.attachments.set(data);
        this.isAttachmentsLoading.set(false);
      },
      error: () => this.isAttachmentsLoading.set(false)
    });

    console.log("Attachment after clear :", this.attachments());
  }

  openAddAttachmentDialog(): void {
    this.isAttachmentEditMode.set(false);
    this.selectedAttachmentId.set(null);
    this.attachmentFile = null;
    this.clearFileInput();
    this.attachmentForm.reset({ fileType: 1, isActive: true });
    this.showAttachmentFormDialog.set(true);
  }

  openEditAttachmentDialog(item: ReadAttachmentDto): void {
    this.isAttachmentEditMode.set(true);
    this.selectedAttachmentId.set(item.id || null);
    this.attachmentFile = null;
    this.clearFileInput();
    this.attachmentForm.patchValue(item);
    this.showAttachmentFormDialog.set(true);
  }

  onAttachmentFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.attachmentFile = file;
      // Auto-populate fileName if empty
      const currentName = this.attachmentForm.get('fileName')?.value;
      if (!currentName) {
        this.attachmentForm.patchValue({ fileName: file.name });
      }
    }
  }

  saveAttachment(): void {
    if (this.attachmentForm.invalid) {
      this.attachmentForm.markAllAsTouched();
      return;
    }

    const beneficiaryId = this.currentBeneficiary()?.id;
    if (!beneficiaryId) return;

    const value = this.attachmentForm.value;
    const formData = new FormData();
    formData.append('fileName', value.fileName);
    formData.append('fileType', value.fileType.toString());
    formData.append('beneficiaryId', beneficiaryId);
    formData.append('isActive', value.isActive.toString());

    if (this.attachmentFile) {
      formData.append('file', this.attachmentFile);
    }

    if (this.isAttachmentEditMode() && this.selectedAttachmentId()) {
      formData.append('id', this.selectedAttachmentId()!);
      this.attachmentService.update(this.selectedAttachmentId()!, formData).subscribe((updated) => {
        this.attachments.update(list => list.map(a => a.id === this.selectedAttachmentId() ? updated : a));
        this.showAttachmentFormDialog.set(false);
        this.clearFileInput();
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل المرفق بنجاح.' });
        // Update attachments count on beneficiary row
        this.updateBeneficiaryAttachmentCount(1);
      });
    } else {
      if (!this.attachmentFile) {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يرجى اختيار ملف المرفق.' });
        return;
      }
      this.attachmentService.create(formData).subscribe((newItem) => {
        this.attachments.update(list => [newItem, ...list]);
        this.showAttachmentFormDialog.set(false);
        this.clearFileInput();
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة المرفق بنجاح.' });
        // Update attachments count on beneficiary row
        this.updateBeneficiaryAttachmentCount(1);
      });
    }
  }

  toggleAttachmentStatus(item: ReadAttachmentDto): void {
    this.attachmentService.toggleStatus(item.id!).subscribe(() => {
      this.attachments.update(list => list.map(a => a.id === item.id ? { ...a, isActive: !a.isActive } : a));
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة المرفق.' });
    });
  }

  confirmDeleteAttachment(item: ReadAttachmentDto): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف المرفق "${item.fileName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.attachmentService.delete(item.id!).subscribe(() => {
          this.attachments.update(list => list.filter(a => a.id !== item.id));
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف المرفق.' });
          // Update attachments count on beneficiary row
          this.updateBeneficiaryAttachmentCount(-1);
        });
      },
    });
  }

  updateBeneficiaryAttachmentCount(diff: number): void {
    const beneficiaryId = this.currentBeneficiary()?.id;
    if (!beneficiaryId) return;

    this.beneficiaries.update(list => list.map(b => {
      if (b.id === beneficiaryId) {
        return {
          ...b,
          attachmentCount: (b.attachmentCount || 0) + diff
        };
      }
      return b;
    }));
  }

  clearFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  getAttachmentUrl(filePath?: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    const base = environment.apiUrl.replace('/api', '');
    return `${base}/${filePath}`;
  }

  downloadAttachment(item: ReadAttachmentDto): void {
    const url = this.getAttachmentUrl(item.filePath);
    if (url) {
      window.open(url, '_blank');
    }
  }

  getFileTypeLabel(type?: FileType): string {
    switch (type) {
      case 1: return 'صورة';
      case 2: return 'ملف PDF';
      case 3: return 'ملف وورد';
      case 4: return 'ملف إكسل';
      default: return 'آخر';
    }
  }

  // ==========================================
  // Aid Disbursements Management
  // ==========================================

  openAidDisbursements(beneficiary: ReadBeneficiaryDto): void {
    this.currentBeneficiary.set(beneficiary);
    this.showAidDialog.set(true);
    this.loadAidDisbursements();
  }

  loadAidDisbursements(): void {
    const beneficiaryId = this.currentBeneficiary()?.id;
    if (!beneficiaryId) return;

    this.isAidLoading.set(true);
    this.aidDisbursements.set([]);
    this.aidDisbursementService.getByBeneficiaryId(beneficiaryId).subscribe({
      next: (data) => {
        // Sort from latest to oldest
        const sorted = [...data].sort((a, b) => {
          const dateA = a.disbursementDate ? new Date(a.disbursementDate).getTime() : 0;
          const dateB = b.disbursementDate ? new Date(b.disbursementDate).getTime() : 0;
          return dateB - dateA;
        });
        this.aidDisbursements.set(sorted);
        this.isAidLoading.set(false);
      },
      error: () => this.isAidLoading.set(false)
    });
  }

  exportExcel(): void {
    this.service.exportBeneficiariesToExcel().subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Beneficiaries.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تصدير ملف Excel.' })
    });
  }

  downloadTemplate(): void {
    this.service.exportEmptyTemplate().subscribe({
      next: (blob) => {
        const file = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'BeneficiariesTemplate.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل قالب Excel.' })
    });
  }

  triggerImportExcel(): void {
    this.excelImportInput.nativeElement.click();
  }

  onExcelImportSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.isLoading.set(true);
      this.service.importFromExcel(file).subscribe({
        next: () => {
          this.loadData();
          this.messageService.add({ severity: 'success', summary: 'تم الاستيراد', detail: 'تم استيراد المستحقين من ملف Excel بنجاح.' });
          this.excelImportInput.nativeElement.value = '';
        },
        error: () => {
          this.isLoading.set(false);
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل استيراد ملف Excel.' });
          this.excelImportInput.nativeElement.value = '';
        }
      });
    }
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