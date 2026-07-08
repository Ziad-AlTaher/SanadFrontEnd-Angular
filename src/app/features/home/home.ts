import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSliderComponent } from './components/hero-slider/hero-slider';
import { AboutSectionComponent } from './components/about-section/about-section';
import { ServicesSectionComponent } from './components/services-section/services-section';
import { ContactSectionComponent } from './components/contact-section/contact-section';
import { BaseComponent } from '../../core/base/base.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSliderComponent, AboutSectionComponent, ServicesSectionComponent, ContactSectionComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent extends BaseComponent { }
