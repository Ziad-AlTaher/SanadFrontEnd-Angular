import { Component, signal, WritableSignal, OnDestroy, PLATFORM_ID, Inject, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { BaseComponent } from '../../../../core/base/base.component';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

interface AboutValue {
  icon: string;
  titleKey: string;
  descKey: string;
}

interface Stat {
  icon: string;
  /** Final numeric target value */
  target: number;
  /** Display suffix shown after the number (e.g. '+', 'M+') */
  suffix: string;
  labelKey: string;
  /** Animated current display value — driven by count-up logic */
  displayValue: WritableSignal<number>;
}

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about-section.html',
  styleUrl: './about-section.css'
})
export class AboutSectionComponent extends BaseComponent implements AfterViewInit, OnDestroy {

  private observer: IntersectionObserver | null = null;
  private hasAnimated = false;

  /** Core values of Sanad */
  values: AboutValue[] = [
    { icon: 'pi-shield', titleKey: 'home.about.values.transparency.title', descKey: 'home.about.values.transparency.desc' },
    { icon: 'pi-heart',  titleKey: 'home.about.values.compassion.title',   descKey: 'home.about.values.compassion.desc'   },
    { icon: 'pi-lock',   titleKey: 'home.about.values.trust.title',        descKey: 'home.about.values.trust.desc'        },
    { icon: 'pi-globe',  titleKey: 'home.about.values.impact.title',       descKey: 'home.about.values.impact.desc'       }
  ];

  /** Stats with numeric targets for the count-up animation */
  stats: Stat[] = [
    { icon: 'pi-users',        target: 50000, suffix: '+',  labelKey: 'home.about.stats.beneficiaries.label', displayValue: signal(0) },
    { icon: 'pi-wallet',       target: 20,    suffix: 'M+', labelKey: 'home.about.stats.donations.label',    displayValue: signal(0) },
    { icon: 'pi-check-circle', target: 300,   suffix: '+',  labelKey: 'home.about.stats.projects.label',     displayValue: signal(0) },
    { icon: 'pi-star',         target: 10000, suffix: '+',  labelKey: 'home.about.stats.donors.label',       displayValue: signal(0) }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private el: ElementRef
  ) {
    super();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Observe the stats bar — trigger animation once when it enters the viewport
    const statsBar: HTMLElement | null = this.el.nativeElement.querySelector('.stats-bar');
    if (!statsBar) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !this.hasAnimated) {
          this.hasAnimated = true;
          this.runCountUp();
        }
      },
      { threshold: 0.3 }
    );

    this.observer.observe(statsBar);
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.observer?.disconnect();
  }

  /** Animates all stats from 0 to their target values using easing */
  private runCountUp(): void {
    const DURATION = 2000; // ms
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      // Ease-out cubic: decelerates towards the end
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      for (const stat of this.stats) {
        stat.displayValue.set(Math.round(stat.target * eased));
      }

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  }

  /** Formats display number with locale-aware thousands separator */
  formatNumber(value: number): string {
    return value.toLocaleString('en-US');
  }
}
