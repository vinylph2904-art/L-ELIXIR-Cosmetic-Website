import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';

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
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent implements OnInit {
  activeSection: string = 'cau-chuyen';
  activeSubSection: string = '';

  menuItems: MenuSection[] = [
    {
      title: 'Câu chuyện thương hiệu',
      id: 'cau-chuyen',
      isOpen: true,
      subSections: [
        { title: 'Khởi nguồn di sản', id: 'khoi-nguon' },
        { title: 'Tầm nhìn & Sứ mệnh', id: 'tam-nhin' }
      ]
    },
    {
      title: 'Khoa học & DNA',
      id: 'khoa-hoc-dna',
      isOpen: false,
      subSections: [
        { title: 'Phức hợp độc quyền', id: 'phuc-hop' },
        { title: 'Tiêu chuẩn phòng lab', id: 'phong-lab' }
      ]
    },
    {
      title: 'Phát triển bền vững',
      id: 'phat-trien-ben-vung',
      isOpen: false,
      subSections: [
        { title: 'Nguồn nguyên liệu hữu cơ', id: 'nguyen-lieu-huu-co' },
        { title: 'Hành trình xanh & Bao bì', id: 'bao-bi-xanh' },
        { title: 'Cam kết hệ sinh thái', id: 'cam-ket-sinh-thai' }
      ]
    },
    {
      title: 'Cơ hội nghề nghiệp',
      id: 'co-hoi-nghe-nghiep',
      isOpen: false,
      subSections: [
        { title: 'Môi trường làm việc lý tưởng', id: 'moi-truong' },
        { title: 'Các vị trí đang tuyển dụng', id: 'tuyen-dung' }
      ]
    }
  ];

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.fragment.subscribe(frag => {
      if (frag) {
        this.menuItems.forEach(item => {
          const hasSub = item.subSections.some(sub => sub.id === frag);
          if (item.id === frag || hasSub) {
            item.isOpen = true;
            this.activeSection = item.id;
            if (hasSub) this.activeSubSection = frag;
          }
        });
        setTimeout(() => {
          const el = document.getElementById(frag);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  toggleSection(event: Event, sectionId: string) {
    event.preventDefault();
    event.stopPropagation();
    
    this.menuItems.forEach(item => {
      if (item.id === sectionId) {
        item.isOpen = !item.isOpen;
      } else {
        item.isOpen = false;
      }
    });
  }

  scrollToSubSection(event: Event, sectionId: string, subId: string) {
    event.preventDefault();
    event.stopPropagation();
    
    this.activeSection = sectionId;
    this.activeSubSection = subId;

    const el = document.getElementById(subId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.scrollY + 250;

    for (const item of this.menuItems) {
      for (const sub of item.subSections) {
        const el = document.getElementById(sub.id);
        if (el && scrollPosition >= el.offsetTop && scrollPosition < (el.offsetTop + el.offsetHeight)) {
          this.activeSection = item.id;
          this.activeSubSection = sub.id;
          return;
        }
      }
    }
  }
}