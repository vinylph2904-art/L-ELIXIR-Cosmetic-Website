import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.css'
})
export class CollectionComponent implements OnInit, OnDestroy {
  articles = [
    {
      title: 'Tinh Hoa Dưỡng Sáng Lumina',
      description: 'Một bộ sưu tập được thiết kế để mang đến vẻ sáng tự nhiên, mềm mại và đầy sức sống cho làn da mỗi sáng mới.',
      image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=900&q=80',
      tag: 'Bộ sưu tập',
      route: '/articles/lumina'
    },
    {
      title: 'Vẻ Đẹp Rạng Đông Aurora',
      description: 'Aurora mang đến cảm giác mềm mại, ấm áp và tái tạo, như một buổi bình minh mới cho làn da bạn.',
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
      tag: 'Bộ sưu tập',
      route: '/articles/aurora'
    }
  ];

  columns = 4; // Mặc định cho desktop
  private destroy$ = new Subject<void>();
  private resizeSubject$ = new Subject<void>();

  ngOnInit() {
    this.updateColumns();
    
    // Debounce resize events
    window.addEventListener('resize', () => this.resizeSubject$.next());
    
    this.resizeSubject$
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateColumns());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateColumns() {
    const width = window.innerWidth;
    
    if (width < 640) {
      this.columns = 1; // sm
    } else if (width < 1024) {
      this.columns = 2; // md
    } else {
      this.columns = 4; // lg+
    }
  }

  get hiddenSlots() {
    const remainder = this.articles.length % this.columns;
    if (remainder === 0) return [];
    return Array(this.columns - remainder);
  }
}