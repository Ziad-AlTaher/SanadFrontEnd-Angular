import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface ServiceItem {
  icon: string;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './services-section.html',
  styleUrl: './services-section.css'
})
export class ServicesSectionComponent {
  services: ServiceItem[] = [
    {
      icon: 'pi-user-plus',
      titleKey: 'services.orphanSponsorship.title',
      descKey: 'services.orphanSponsorship.desc'
    },
    {
      icon: 'pi-heart-fill',
      titleKey: 'services.feedingMeals.title',
      descKey: 'services.feedingMeals.desc'
    },
    {
      icon: 'pi-unlock',
      titleKey: 'services.releasingDebtors.title',
      descKey: 'services.releasingDebtors.desc'
    },
    {
      icon: 'pi-globe',
      titleKey: 'services.otherServices.title',
      descKey: 'services.otherServices.desc'
    }
  ];
}
