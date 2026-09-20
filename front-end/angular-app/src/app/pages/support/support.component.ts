import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

interface SubSection {
  title: string;
  id: string;
}

interface MenuSection {
  title: string;
  id: string;
  isOpen: boolean;
  subSections: SubSection[];
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export class SupportComponent implements OnInit {

  activeSection = 'giao-hang';
  activeSubSection = '';

  menuItems: MenuSection[] = [
    {
      title: 'Giao hàng & Đổi trả',
      id: 'giao-hang',
      isOpen: true,
      subSections: [
        { title: 'Chính sách giao hàng', id: 'chinh-sach-giao-hang' },
        { title: 'Chính sách đổi trả', id: 'chinh-sach-doi-tra' }
      ]
    },
    {
      title: 'Liên hệ',
      id: 'lien-he',
      isOpen: false,
      subSections: [
        { title: 'Thông tin liên hệ', id: 'thong-tin-lien-he' },
        { title: 'Thời gian hỗ trợ', id: 'thoi-gian-ho-tro' }
      ]
    },
    {
      title: 'Câu hỏi thường gặp',
      id: 'faq',
      isOpen: false,
      subSections: [
        { title: 'Đơn hàng', id: 'faq-don-hang' },
        { title: 'Thanh toán', id: 'faq-thanh-toan' },
        { title: 'Sản phẩm', id: 'faq-san-pham' }
      ]
    },
    {
      title: 'Tài khoản của tôi',
      id: 'profile',
      isOpen: false,
      subSections: []
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.route.fragment.subscribe(frag => {

      if (frag) {

        this.menuItems.forEach(item => {

          const hasSub = item.subSections.some(sub => sub.id === frag);

          if (item.id === frag || hasSub) {

            item.isOpen = true;
            this.activeSection = item.id;

            if (hasSub)
              this.activeSubSection = frag;

          }

        });

        setTimeout(() => {

          const el = document.getElementById(frag);

          if (el)
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });

        }, 200);

      }

    });

  }

  toggleSection(event: Event, sectionId: string) {

    event.preventDefault();
    event.stopPropagation();

    if (sectionId === 'profile') {
      this.router.navigate(['/profile']);
      return;
    }

    this.menuItems.forEach(item => {

      if (item.id === sectionId)
        item.isOpen = !item.isOpen;
      else
        item.isOpen = false;

    });

  }

  scrollToSubSection(event: Event, sectionId: string, subId: string) {

    event.preventDefault();
    event.stopPropagation();

    this.activeSection = sectionId;
    this.activeSubSection = subId;

    const el = document.getElementById(subId);

    if (el)
      el.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

  }

  @HostListener('window:scroll')
  onWindowScroll() {

    const scrollPosition = window.scrollY + 250;

    for (const item of this.menuItems) {

      for (const sub of item.subSections) {

        const el = document.getElementById(sub.id);

        if (
          el &&
          scrollPosition >= el.offsetTop &&
          scrollPosition < el.offsetTop + el.offsetHeight
        ) {

          this.activeSection = item.id;
          this.activeSubSection = sub.id;
          return;

        }

      }

    }

  }

}