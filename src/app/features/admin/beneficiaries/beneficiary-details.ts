import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { AidDisbursementService } from '../../../core/services/aid-disbursement.service';
import { ReadBeneficiaryDto } from '../../../core/models/beneficiary.models';
import { ReadAidDisbursementDto } from '../../../core/models/aid-disbursement.models';

@Component({
  selector: 'app-beneficiary-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TranslatePipe
  ],
  providers: [MessageService],
  templateUrl: './beneficiary-details.html',
  styleUrls: ['./beneficiary-details.css'],
  encapsulation: ViewEncapsulation.None
})
export class BeneficiaryDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(BeneficiaryService);
  private aidDisbursementService = inject(AidDisbursementService);
  private messageService = inject(MessageService);

  beneficiary = signal<ReadBeneficiaryDto | null>(null);
  aidDisbursements = signal<ReadAidDisbursementDto[]>([]);
  isLoading = signal(false);
  isAidLoading = signal(false);
  today = new Date();

  // Toggle disbursements visibility
  showDisbursements = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBeneficiary(id);
    } else {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'معرف المستحق غير صالح.' });
      this.router.navigate(['/admin/beneficiaries']);
    }
  }

  loadBeneficiary(id: string): void {
    this.isLoading.set(true);
    this.service.getById(id).subscribe({
      next: (data) => {
        this.beneficiary.set(data);
        this.isLoading.set(false);
        this.loadAidDisbursements(id);
      },
      error: () => {
        this.isLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تحميل بيانات المستحق.' });
        this.router.navigate(['/admin/beneficiaries']);
      }
    });
  }

  loadAidDisbursements(beneficiaryId: string): void {
    this.isAidLoading.set(true);
    this.aidDisbursementService.getByBeneficiaryId(beneficiaryId).subscribe({
      next: (data) => {
        const sorted = [...data].sort((a, b) => {
          const dateA = a.disbursementDate ? new Date(a.disbursementDate).getTime() : 0;
          const dateB = b.disbursementDate ? new Date(b.disbursementDate).getTime() : 0;
          return dateB - dateA;
        });
        this.aidDisbursements.set(sorted);
        this.isAidLoading.set(false);
      },
      error: () => {
        this.isAidLoading.set(false);
      }
    });
  }

  toggleDisbursements(): void {
    this.showDisbursements.update(val => !val);
  }

  printPage(): void {
    window.print();
  }

  getStatusSeverity(isActive?: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}
