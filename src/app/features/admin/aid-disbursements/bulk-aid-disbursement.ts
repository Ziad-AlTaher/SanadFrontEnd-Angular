import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AidDisbursementService } from '../../../core/services/aid-disbursement.service';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { AidTypeService } from '../../../core/services/aid-type.service';
import { ReadBeneficiaryDto, BeneficiaryType } from '../../../core/models/beneficiary.models';
import { ReadAidTypeDto } from '../../../core/models/aid-type.models';
import { forkJoin } from 'rxjs';

export interface BulkDisbursementRow {
  checked: boolean;
  beneficiary: ReadBeneficiaryDto;
  aidTypeId: string;
  aidTypeName: string;
  amount: number;
}

@Component({
  selector: 'app-bulk-aid-disbursement',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, ButtonModule,
    InputNumberModule, SelectModule, CheckboxModule,
    ToastModule, TooltipModule, TagModule, TranslatePipe,
  ],
  providers: [MessageService],
  templateUrl: './bulk-aid-disbursement.html',
  styleUrls: ['./bulk-aid-disbursement.css'],
})
export class BulkAidDisbursementComponent implements OnInit {
  private service = inject(AidDisbursementService);
  private beneficiaryService = inject(BeneficiaryService);
  private aidTypeService = inject(AidTypeService);
  private messageService = inject(MessageService);

  // Dropdown data
  aidTypes = signal<ReadAidTypeDto[]>([]);
  allBeneficiaries = signal<ReadBeneficiaryDto[]>([]);

  // Filter state
  selectedAidTypeId = signal<string | null>(null);
  amount = signal<number>(0);
  disbursementDate = signal<string>(new Date().toISOString().split('T')[0]);
  inKindName = signal<string>('');

  // BeneficiaryType flags
  BeneficiaryType = BeneficiaryType;
  typeMonthly = signal(false);
  typeChronicIllness = signal(false);
  typeExceptional = signal(false);

  // Computed combined flag
  get selectedTypeFlags(): number {
    let flags = 0;
    if (this.typeMonthly()) flags |= BeneficiaryType.Monthly;
    if (this.typeChronicIllness()) flags |= BeneficiaryType.ChronicIllness;
    if (this.typeExceptional()) flags |= BeneficiaryType.Exceptional;
    return flags;
  }

  // Preview table
  bulkRows = signal<BulkDisbursementRow[]>([]);
  isPrepared = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);

  // Master checkbox
  allChecked = computed(() => this.bulkRows().length > 0 && this.bulkRows().every(r => r.checked));
  someChecked = computed(() => this.bulkRows().some(r => r.checked));
  checkedCount = computed(() => this.bulkRows().filter(r => r.checked).length);

  ngOnInit(): void {
    this.loadDropdowns();
  }

  loadDropdowns(): void {
    forkJoin({
      aidTypes: this.aidTypeService.getAll(),
      beneficiaries: this.beneficiaryService.getAll(),
    }).subscribe({
      next: ({ aidTypes, beneficiaries }) => {
        this.aidTypes.set(aidTypes);
        this.allBeneficiaries.set(beneficiaries);
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل البيانات.' })
    });
  }

  onAidTypeChange(aidTypeId: string): void {
    const selectedType = this.aidTypes().find(t => t.id === aidTypeId);
    if (selectedType?.defaultValue != null) {
      this.amount.set(selectedType.defaultValue);
    }
    this.selectedAidTypeId.set(aidTypeId);
  }

  prepare(): void {
    const aidTypeId = this.selectedAidTypeId();
    if (!aidTypeId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار نوع المساعدة أولاً.' });
      return;
    }

    const flags = this.selectedTypeFlags;
    if (flags === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار نوع مستفيد واحد على الأقل.' });
      return;
    }

    const aidType = this.aidTypes().find(t => t.id === aidTypeId);
    const aidTypeName = aidType?.name ?? '';
    const amount = this.amount();

    const filtered = this.allBeneficiaries().filter(b => {
      const bt = b.beneficiaryType ?? 0;
      return b.isActive !== false && (bt & flags) !== 0;
    });

    if (filtered.length === 0) {
      this.messageService.add({ severity: 'info', summary: 'لا توجد نتائج', detail: 'لا يوجد مستفيدون من النوع المحدد.' });
      this.bulkRows.set([]);
      this.isPrepared.set(true);
      return;
    }

    const rows: BulkDisbursementRow[] = filtered.map(b => ({
      checked: true,
      beneficiary: b,
      aidTypeId,
      aidTypeName,
      amount,
    }));

    this.bulkRows.set(rows);
    this.isPrepared.set(true);
    this.messageService.add({
      severity: 'success',
      summary: 'جاهز',
      detail: `تم تجهيز ${rows.length} سجل. راجع القائمة وعدّل القيم إذا لزم.`
    });
  }

  toggleMaster(checked: boolean): void {
    this.bulkRows.update(rows => rows.map(r => ({ ...r, checked })));
  }

  toggleRow(index: number, checked: boolean): void {
    this.bulkRows.update(rows => {
      const updated = [...rows];
      updated[index] = { ...updated[index], checked };
      return updated;
    });
  }

  updateAmount(index: number, value: number): void {
    this.bulkRows.update(rows => {
      const updated = [...rows];
      updated[index] = { ...updated[index], amount: value };
      return updated;
    });
  }
  trackByBeneficiary = (index: number, row: any): any => {
    return row.beneficiary?.id ?? index;
  };
  saveAll(): void {
    const checkedRows = this.bulkRows().filter(r => r.checked);
    if (checkedRows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'لم تحدد أي سجلات للحفظ.' });
      return;
    }

    this.isSaving.set(true);
    const date = this.disbursementDate();
    const inKind = this.inKindName();

    let saved = 0;
    let failed = 0;
    let pending = checkedRows.length;

    for (const row of checkedRows) {
      this.service.create({
        beneficiaryId: row.beneficiary.id,
        aidTypeId: row.aidTypeId,
        amount: row.amount,
        disbursementDate: date,
        inKindName: inKind || undefined,
      }).subscribe({
        next: () => {
          saved++;
          pending--;
          if (pending === 0) this.onSaveComplete(saved, failed);
        },
        error: () => {
          failed++;
          pending--;
          if (pending === 0) this.onSaveComplete(saved, failed);
        }
      });
    }
  }

  private onSaveComplete(saved: number, failed: number): void {
    this.isSaving.set(false);
    if (saved > 0) {
      this.messageService.add({
        severity: failed > 0 ? 'warn' : 'success',
        summary: 'اكتمل الحفظ',
        detail: `تم حفظ ${saved} سجل بنجاح.${failed > 0 ? ` فشل ${failed} سجل.` : ''}`,
        life: 6000
      });
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: `فشل حفظ جميع السجلات (${failed}).` });
    }

    if (saved > 0) {
      // Remove saved rows from list
      this.bulkRows.update(rows => rows.filter(r => !r.checked));
      if (this.bulkRows().length === 0) this.isPrepared.set(false);
    }
  }

  reset(): void {
    this.bulkRows.set([]);
    this.isPrepared.set(false);
    this.selectedAidTypeId.set(null);
    this.amount.set(0);
    this.typeMonthly.set(false);
    this.typeChronicIllness.set(false);
    this.typeExceptional.set(false);
    this.disbursementDate.set(new Date().toISOString().split('T')[0]);
    this.inKindName.set('');
  }

  getBeneficiaryTypeLabel(bt: number): string {
    const labels: string[] = [];
    if (bt & BeneficiaryType.Monthly) labels.push('شهري');
    if (bt & BeneficiaryType.ChronicIllness) labels.push('مزمن');
    if (bt & BeneficiaryType.Exceptional) labels.push('استثنائي');
    return labels.join(' + ') || '-';
  }

  tafqeet(num: number): string {
    if (num === 0) return 'صفر';
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة'];
    const teens = ['عشرة', 'أحد عشر', 'إثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
    const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    const thousands = ['', 'ألف', 'ألفان', 'ثلاثة آلاف', 'أربعة آلاف', 'خمسة آلاف', 'ستة آلاف', 'سبعة آلاف', 'ثمانية آلاف', 'تسعة آلاف', 'عشرة آلاف'];

    let temp = num;
    let parts: string[] = [];

    if (temp >= 1000) {
      const th = Math.floor(temp / 1000);
      if (th === 1) parts.push('ألف');
      else if (th === 2) parts.push('ألفان');
      else if (th >= 3 && th <= 10) parts.push(thousands[th]);
      else parts.push(this.tafqeet(th).replace(' جنيهاً لا غير', '') + ' ألف');
      temp %= 1000;
    }

    if (temp >= 100) {
      const h = Math.floor(temp / 100);
      parts.push(hundreds[h]);
      temp %= 100;
    }

    if (temp > 0) {
      if (temp <= 10) {
        parts.push(ones[temp]);
      } else if (temp < 20) {
        parts.push(teens[temp - 10]);
      } else {
        const o = temp % 10;
        const t = Math.floor(temp / 10);
        if (o > 0) {
          parts.push(ones[o] + ' و' + tens[t]);
        } else {
          parts.push(tens[t]);
        }
      }
    }

    return parts.join(' و') + ' جنيهاً';
  }

  printReport(): void {
    const checkedRows = this.bulkRows().filter(r => r.checked);
    if (checkedRows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى تحديد سجل واحد على الأقل للطباعة.' });
      return;
    }

    // Extract month and year
    let monthStr = '................';
    if (this.disbursementDate()) {
      const dateObj = new Date(this.disbursementDate());
      const arabicMonths = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      monthStr = `${arabicMonths[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }

    // Chunk size: 22 rows per page
    const chunkSize = 22;
    const chunks: BulkDisbursementRow[][] = [];
    for (let i = 0; i < checkedRows.length; i += chunkSize) {
      chunks.push(checkedRows.slice(i, i + chunkSize));
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يرجى السماح بفتح النوافذ المنبثقة للطباعة.' });
      return;
    }

    let pagesHtml = '';
    chunks.forEach((chunk, chunkIdx) => {
      const isLastPage = chunkIdx === chunks.length - 1;
      let rowsHtml = '';
      chunk.forEach((row, rowIdx) => {
        const serialNumber = chunkIdx * chunkSize + rowIdx + 1;
        const familyCount = row.beneficiary.numberOfDependents != null ? row.beneficiary.numberOfDependents : 1;
        rowsHtml += `
          <tr>
            <td class="col-num">${serialNumber}</td>
            <td class="col-name">${row.beneficiary.fullName || ''}</td>
            <td class="col-rel">شخصه</td>
            <td class="col-fam">${familyCount}</td>
            <td class="col-amount">${row.amount}</td>
            <td class="col-words">${this.tafqeet(row.amount)}</td>
            <td class="col-sig">${row.beneficiary.nationalId || ''}</td>
          </tr>
        `;
      });

      pagesHtml += `
        <div class="page-container">
          <div class="header-org">
            <p>جمعية أنصار السنة الدمحمية بهرية رزنة</p>
            <p>المشهرة برقم 548 لسنة 3991</p>
            <p>مسجد التوحيد</p>
          </div>
          <div class="report-title">
            لجنة المساعدات الاجتماعية عن شهر ( ${monthStr} )
          </div>
          <table class="report-table">
            <thead>
              <tr>
                <th class="col-num">م</th>
                <th class="col-name" style="text-align: center;">الاسم</th>
                <th class="col-rel">القرابة</th>
                <th class="col-fam">الأسرة</th>
                <th class="col-amount">المبلغ</th>
                <th class="col-words">المبلغ فقط وقدره</th>
                <th class="col-sig" style="text-align: center;">التوقيع ورقم البطاقة</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          ${isLastPage ? `
            <div class="footer-signatures">
              <div class="yeatamed">يعتمد،،،</div>
              <div class="signature-row">
                <span>رئيس مجلس الإدارة</span>
                <span>أمين الصندوق</span>
              </div>
            </div>
          ` : ''}
        </div>
      `;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>كشف الصرف الجماعي - ${monthStr}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            font-family: 'Cairo', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #fff;
            direction: rtl;
          }
          .page-container {
            box-sizing: border-box;
            width: 210mm;
            height: 297mm;
            padding: 20mm 15mm 20mm 15mm;
            position: relative;
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }
          .page-container:last-child {
            page-break-after: avoid;
          }
          .header-org {
            text-align: right;
            margin-bottom: 20px;
          }
          .header-org p {
            margin: 0 0 5px 0;
            font-size: 16px;
            font-weight: bold;
            text-decoration: underline;
          }
          .report-title {
            text-align: center;
            font-size: 19px;
            font-weight: bold;
            margin: 20px 0;
          }
          table.report-table {
            width: 100%;
            border-collapse: collapse;
            border: 2.5px solid #000;
            margin-top: 10px;
          }
          table.report-table th, table.report-table td {
            border: 0.5px solid #000;
            padding: 4px;
            height: 33px;
            font-size: 12px;
            box-sizing: border-box;
          }
          table.report-table th {
            font-weight: bold;
            font-size: 13px;
            height: 38px;
            text-align: center;
          }
          table.report-table thead tr {
            border-bottom: 2px solid #000;
          }
          .col-num { width: 5%; text-align: center; }
          .col-name { width: 30%; text-align: right; padding-right: 8px; font-weight: bold; }
          .col-rel { width: 10%; text-align: center; }
          .col-fam { width: 7%; text-align: center; }
          .col-amount { width: 7%; text-align: center; }
          .col-words { width: 15%; text-align: center; font-size: 11px; }
          .col-sig { width: 26%; text-align: center; font-size: 10px; }

          .footer-signatures {
            margin-top: auto;
            padding-top: 30px;
          }
          .footer-signatures .yeatamed {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 30px;
            text-align: right;
            padding-right: 50px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            padding: 0 50px;
            font-size: 14px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

