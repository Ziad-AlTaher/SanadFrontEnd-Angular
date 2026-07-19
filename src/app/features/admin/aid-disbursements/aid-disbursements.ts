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
import { AidDisbursementService } from '../../../core/services/aid-disbursement.service';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { AidTypeService } from '../../../core/services/aid-type.service';
import { ReadAidDisbursementDto } from '../../../core/models/aid-disbursement.models';
import { ReadBeneficiaryDto } from '../../../core/models/beneficiary.models';
import { ReadAidTypeDto } from '../../../core/models/aid-type.models';

@Component({
  selector: 'app-aid-disbursements',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, SelectModule, TagModule,
    ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './aid-disbursements.html',
  styleUrls: ['./aid-disbursements.css'],
})
export class AidDisbursementsComponent implements OnInit {
  private service = inject(AidDisbursementService);
  private beneficiaryService = inject(BeneficiaryService);
  private aidTypeService = inject(AidTypeService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  aidDisbursements = signal<ReadAidDisbursementDto[]>([]);
  beneficiaries = signal<ReadBeneficiaryDto[]>([]);
  aidTypes = signal<ReadAidTypeDto[]>([]);
  totalRecords = signal(0);
  lastLazyEvent: any = null;

  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<string | null>(null);
  isLoading = signal(false);

  form: FormGroup = this.fb.group({
    beneficiaryId: [null, [Validators.required]],
    aidTypeId: [null, [Validators.required]],
    amount: [null, [Validators.required, Validators.min(0)]],
    disbursementDate: [null, [Validators.required]],
    inKindName: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadData(): void {
    if (this.lastLazyEvent) {
      this.loadAidDisbursementsLazy(this.lastLazyEvent);
    }
  }

  loadAidDisbursementsLazy(event: any): void {
    this.lastLazyEvent = event;
    const page = Math.floor((event.first || 0) / (event.rows || 10)) + 1;
    const pageSize = event.rows || 10;
    const sortColumn = event.sortField || undefined;
    const sortColumnDirection = event.sortOrder === 1 ? 'asc' : event.sortOrder === -1 ? 'desc' : undefined;
    const search = event.globalFilter || '';

    this.isLoading.set(true);
    this.service.getAllPaged({
      page,
      pageSize,
      search,
      sortColumn,
      sortColumnDirection
    }).subscribe({
      next: (res) => {
        if (res.status && res.data) {
          this.aidDisbursements.set(res.data.listData || []);
          this.totalRecords.set(res.data.paginationData?.totalCount || 0);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadDropdowns(): void {
    this.beneficiaryService.getAll().subscribe(data => this.beneficiaries.set(data));
    this.aidTypeService.getAll().subscribe(data => this.aidTypes.set(data));
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    const currentAidTypeId = this.form.get('aidTypeId')?.value;
    const currentAmount = this.form.get('amount')?.value;
    const currentinKindName = this.form.get('inKindName')?.value;
    this.form.reset({
      disbursementDate: new Date().toISOString().split('T')[0],
      inKindName: currentinKindName,
      notes: '',
      aidTypeId: currentAidTypeId,
      amount: currentAmount
    });
    this.showDialog.set(true);
  }

  onAidTypeChange(aidTypeId: string): void {
    const selectedType = this.aidTypes().find(t => t.id === aidTypeId);
    if (selectedType) {
      this.form.patchValue({ amount: selectedType.defaultValue });
    }
  }

  openEditDialog(item: ReadAidDisbursementDto): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id || null);
    let formattedDate = item.disbursementDate;
    if (formattedDate && formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    this.form.patchValue({
      ...item,
      disbursementDate: formattedDate
    });
    this.showDialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;

    if (this.isEditMode() && this.selectedId()) {
      this.service.update(this.selectedId()!, { ...value, id: this.selectedId()! }).subscribe((updatedItem) => {
        this.loadData();
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل عملية الصرف.' });
      });
    } else {
      this.service.create(value).subscribe((newItem) => {
        this.loadData();
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة عملية الصرف بنجاح.' });
      });
    }
  }

  confirmDelete(item: ReadAidDisbursementDto): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف عملية صرف المساعدة لـ "${item.beneficiaryName}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.aidDisbursements.update(list => list.filter(b => b.id !== item.id));
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف عملية الصرف.' });
        });
      },
    });
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
