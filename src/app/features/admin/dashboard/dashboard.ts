import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CardModule } from 'primeng/card';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { BeneficiaryService } from '../../../core/services/beneficiary.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AssistanceService } from '../../../core/services/assistance.service';
import { DonationService } from '../../../core/services/donation.service';
import { forkJoin } from 'rxjs';
import type { ApexChart, ApexNonAxisChartSeries, ApexAxisChartSeries, ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexLegend, ApexFill, ApexStroke } from 'ng-apexcharts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule, CardModule, TranslatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  private beneficiaryService = inject(BeneficiaryService);
  private employeeService = inject(EmployeeService);
  private assistanceService = inject(AssistanceService);
  private donationService = inject(DonationService);

  stats = {
    totalBeneficiaries: 0,
    activeBeneficiaries: 0,
    totalEmployees: 0,
    totalDonations: 0,
    totalAssistance: 0,
    totalDonationsAmount: 0,
  };

  // Donations by status donut chart
  donutSeries: ApexNonAxisChartSeries = [];
  donutChart: ApexChart = {
    type: 'donut',
    fontFamily: 'inherit',
    height: 280,
  };
  donutLabels: string[] = [];

  // Assistance bar chart
  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = {
    type: 'bar',
    fontFamily: 'inherit',
    height: 280,
    toolbar: { show: false },
  };
  barXAxis: ApexXAxis = { categories: [] };
  barPlotOptions: ApexPlotOptions = {
    bar: { horizontal: false, columnWidth: '50%', borderRadius: 6 },
  };
  barDataLabels: ApexDataLabels = { enabled: false };
  barFill: ApexFill = {
    type: 'gradient',
    gradient: { shade: 'light', type: 'vertical', stops: [0, 100] },
  };
  barColors = ['#027373', '#038C7F'];

  statCards = [
    { key: 'totalBeneficiaries', icon: 'pi pi-users', colorClass: 'green', valueKey: 'totalBeneficiaries', labelKey: 'admin.stats.beneficiaries' },
    { key: 'totalEmployees', icon: 'pi pi-id-card', colorClass: 'blue', valueKey: 'totalEmployees', labelKey: 'admin.stats.employees' },
    { key: 'totalDonations', icon: 'pi pi-dollar', colorClass: 'amber', valueKey: 'totalDonations', labelKey: 'admin.stats.donations' },
    { key: 'totalAssistance', icon: 'pi pi-heart', colorClass: 'rose', valueKey: 'totalAssistance', labelKey: 'admin.stats.assistance' },
  ];

  ngOnInit(): void {
    forkJoin({
      beneficiaries: this.beneficiaryService.getAll(),
      employees: this.employeeService.getAll(),
      donations: this.donationService.getAll(),
      assistance: this.assistanceService.getAll(),
    }).subscribe(({ beneficiaries, employees, donations, assistance }) => {
      this.stats.totalBeneficiaries = beneficiaries.length;
      this.stats.activeBeneficiaries = beneficiaries.filter(b => b.isActive).length;
      this.stats.totalEmployees = employees.length;
      this.stats.totalDonations = donations.length;
      this.stats.totalAssistance = assistance.length;
      this.stats.totalDonationsAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

      // Donut - donations by type
      const typeCounts = donations.reduce((acc: any, d) => {
        const typeLabel = d.donationType === 1 ? 'Cash' : d.donationType === 2 ? 'In-Kind' : 'Bank Transfer';
        acc[typeLabel] = (acc[typeLabel] || 0) + 1;
        return acc;
      }, {});
      this.donutSeries = Object.values(typeCounts) as number[];
      this.donutLabels = Object.keys(typeCounts);

      // Bar - assistance by type
      const typeCounts2 = assistance.reduce((acc: any, a) => {
        acc[a.type] = (acc[a.type] || 0) + a.amount;
        return acc;
      }, {});
      this.barXAxis = { categories: Object.keys(typeCounts2) };
      this.barSeries = [{ name: 'قيمة المساعدات', data: Object.values(typeCounts2) as number[] }];
    });
  }
}
