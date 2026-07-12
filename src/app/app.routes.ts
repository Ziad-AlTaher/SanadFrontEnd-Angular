import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout';
import { HomeComponent } from './features/home/home';
import { Auth } from './features/auth/auth';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { DashboardComponent } from './features/admin/dashboard/dashboard';
import { BeneficiariesComponent } from './features/admin/beneficiaries/beneficiaries';
import { BeneficiaryDetailsComponent } from './features/admin/beneficiaries/beneficiary-details';
import { EmployeesComponent } from './features/admin/employees/employees';
import { AssistanceComponent } from './features/admin/assistance/assistance';
import { DonationsComponent } from './features/admin/donations/donations';
import { AidTypesComponent } from './features/admin/aid-types/aid-types';
import { AidDisbursementsComponent } from './features/admin/aid-disbursements/aid-disbursements';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'contact', component: HomeComponent }
        ]
    },
    { path: 'auth', component: Auth },
    {
        path: 'admin',
        component: AdminLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'beneficiaries', component: BeneficiariesComponent },
            { path: 'beneficiaries/:id', component: BeneficiaryDetailsComponent },
            { path: 'employees', component: EmployeesComponent },
            { path: 'assistance', component: AssistanceComponent },
            { path: 'donations', component: DonationsComponent },
            { path: 'aid-types', component: AidTypesComponent },
            { path: 'aid-disbursements', component: AidDisbursementsComponent }
        ]
    },
    { path: '**', redirectTo: '' }
];

