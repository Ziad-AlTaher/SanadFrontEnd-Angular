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
import { AidTypeService } from '../../../core/services/aid-type.service';
import { ReadAidTypeDto } from '../../../core/models/aid-type.models';

@Component({
  selector: 'app-aid-types',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    TableModule, ButtonModule, DialogModule,
    InputTextModule, InputNumberModule, TagModule,
    ToastModule, TooltipModule, ConfirmDialogModule, TranslatePipe,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './aid-types.html',
  styleUrls: ['./aid-types.css'],
})
export class AidTypesComponent implements OnInit {
  private service = inject(AidTypeService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  aidTypes = signal<ReadAidTypeDto[]>([]);
  showDialog = signal(false);
  isEditMode = signal(false);
  selectedId = signal<string | null>(null);
  isLoading = signal(false);
  globalFilter = '';

  form: FormGroup = this.fb.group({
    name:         ['', [Validators.required]],
    defaultValue: [null, [Validators.required, Validators.min(0)]],
    description:  [''],
    isActive:     [true],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.service.getAll().subscribe(data => {
      this.aidTypes.set(data);
      this.isLoading.set(false);
    });
  }

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedId.set(null);
    this.form.reset({ isActive: true });
    this.showDialog.set(true);
  }

  openEditDialog(item: ReadAidTypeDto): void {
    this.isEditMode.set(true);
    this.selectedId.set(item.id || null);
    this.form.patchValue(item);
    this.showDialog.set(true);
  }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.value;
    if (this.isEditMode() && this.selectedId()) {
      this.service.update(this.selectedId()!, { ...value, id: this.selectedId()! }).subscribe((updatedItem) => {
        this.aidTypes.update(list => list.map(b => b.id === this.selectedId() ? updatedItem : b));
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'تم تعديل نوع المساعدة.' });
      });
    } else {
      this.service.create(value).subscribe((newItem) => {
        this.aidTypes.update(list => [newItem, ...list]);
        this.showDialog.set(false);
        this.messageService.add({ severity: 'success', summary: 'تمت الإضافة', detail: 'تم إضافة نوع مساعدة جديد.' });
      });
    }
  }

  toggleStatus(item: ReadAidTypeDto): void {
    this.service.toggleStatus(item.id!).subscribe(() => {
      this.aidTypes.update(list => list.map(b => b.id === item.id ? { ...b, isActive: !b.isActive } : b));
      this.messageService.add({ severity: 'info', summary: 'تم التحديث', detail: 'تم تغيير حالة نوع المساعدة.' });
    });
  }

  confirmDelete(item: ReadAidTypeDto): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف "${item.name}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'حذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id!).subscribe(() => {
          this.aidTypes.update(list => list.filter(b => b.id !== item.id));
          this.messageService.add({ severity: 'warn', summary: 'تم الحذف', detail: 'تم حذف نوع المساعدة.' });
        });
      },
    });
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}
