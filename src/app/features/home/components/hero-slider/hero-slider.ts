import { Component, OnInit, OnDestroy, signal, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BaseComponent } from '../../../../core/base/base.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface Slide {
  id: number;
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css'
})
export class HeroSliderComponent extends BaseComponent implements OnInit, OnDestroy {
  currentSlide = signal(0);

  /** Sanad-themed slides — humanitarian / charitable imagery */
  slides: Slide[] = [
    {
      id: 1,
      // Helping hands / community support
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80',
      title: 'home.slider.slide1.title',
      description: 'home.slider.slide1.desc'
    },
    {
      id: 2,
      // Transparency / documents / trust
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1600&q=80',
      title: 'home.slider.slide2.title',
      description: 'home.slider.slide2.desc'
    },
    {
      id: 3,
      // Community / people together
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80',
      title: 'home.slider.slide3.title',
      description: 'home.slider.slide3.desc'
    }
  ];

  private intervalId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    super();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 6000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(): void {
    this.currentSlide.update(v => (v + 1) % this.slides.length);
  }

  prevSlide(): void {
    this.currentSlide.update(v => (v - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number): void {
    this.currentSlide.set(index);
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  /** Smooth-scroll to the About section */
  scrollToAbout(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
