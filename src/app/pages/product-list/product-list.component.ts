import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { Product } from '../../data/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ActivatedRoute } from '@angular/router';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  currentPage = 1;
  itemsPerPage = 8;
  totalPages = 1;
  searchTerm: string = '';
  selectedCategories: string[] = [];
  selectedSkinTypes: string[] = [];
  selectedSkinProblems: string[] = [];
  bestSellingProducts: Product[] = [];
  sortOption: string = 'newest';
  isFilterDrawerOpen = false;
  isSortDrawerOpen = false;
  @ViewChild('productSection')
  productSection!: ElementRef;
  currentBanner = 0;
  collectionBanners = [
    {
      title: 'Bộ sưu tập Lumina',
      subtitle: 'Tinh hoa dưỡng sáng',
      description: 'Khơi mở vẻ đẹp rạng rỡ từ bên trong.',
      image: 'assets/images/Banner/LuminaBanner.jpg',
      route: '/articles/lumina'
    },
    {
      title: 'Bộ sưu tập Aurora',
      subtitle: 'Vẻ đẹp rạng đông',
      description: 'Thanh lọc và phục hồi làn da mỗi ngày.',
      image: 'assets/images/Banner/AuroraBanner.jpg',
      route: '/articles/aurora'
    }
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
  this.productService.getProducts().subscribe((data: Product[]) => {
    this.allProducts = data;
    this.filteredProducts = [...data];
    this.applyFilters();
    this.bestSellingProducts = [...data]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 3);
    this.route.queryParams.subscribe(params => {

      const category = params['category'];
      const collection = params['collection'];

      if (category) {
        this.selectedCategories = [category];
        this.applyFilters();
      }

    if (collection) {
      const keyword = this.normalize(collection);

      this.filteredProducts = this.allProducts.filter(product =>
        this.normalize(product.name).includes(keyword)
      );

      this.currentPage = 1;
      this.updatePagination();
    }
    });
  });
}

private normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);

    if (this.totalPages === 0) {
      this.totalPages = 1;
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedProducts = this.filteredProducts.slice(start, end);
  }

  applyFilters() {
    let results = [...this.allProducts];

    // AF2: Tìm kiếm (không phân biệt hoa/thường và dấu)
    if (this.searchTerm.trim() !== '') {
      const search = this.normalize(this.searchTerm);

      results = results.filter(product =>
        this.normalize(product.name).includes(search)
      );
    }

    // Logic lọc Category & Skin Type 
    if (this.selectedCategories.length > 0) {
      results = results.filter(p => this.selectedCategories.includes(p.categoryName));
    }

    if (this.selectedSkinTypes.length > 0) {
      results = results.filter(p => 
        p.targetSkinTypes.some(type => this.selectedSkinTypes.includes(type))
      );
    }

    if (this.selectedSkinProblems.length > 0) {
      results = results.filter(p => 
        p.targetSkinProblems.some(problem => this.selectedSkinProblems.includes(problem))
      );
    }
    switch (this.sortOption) {
      case 'reviews':
        results.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'priceAsc':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        results.sort((a, b) => b.price - a.price);
        break;
    }
    this.filteredProducts = results;
    this.currentPage = 1;
    this.updatePagination();
  }

  onFilterChange(type: 'category' | 'skin' | 'problem', value: string, event: any) {
    const isChecked = event.target.checked;
    const targetArray = type === 'category' ? this.selectedCategories : type === 'skin' ? this.selectedSkinTypes : this.selectedSkinProblems;

    if (isChecked) {
      targetArray.push(value);
    } else {
      const index = targetArray.indexOf(value);
      if (index > -1) targetArray.splice(index, 1);
    }
    this.applyFilters();
  }

  addToCart(product: Product) {
    this.cartService.addToCart({ ...product, quantity: 1 });
    this.toastService.success(`Đã thêm "${product.name}" vào giỏ hàng`, 3000);
  }
  getFullStars(rating: number): number {
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  getEmptyStars(rating: number): number {
    return 5 - Math.floor(rating) - (rating % 1 >= 0.5 ? 1 : 0);
  }

  clearFilters() {
    this.searchTerm = '';

    this.selectedCategories = [];
    this.selectedSkinTypes = [];
    this.selectedSkinProblems = [];

    this.sortOption = 'newest';
    this.applyFilters();

    const checkboxes =
      document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]'
      );

    checkboxes.forEach(cb => cb.checked = false);
    this.closeFilterDrawer();
  }

  getSortLabel(option: string): string {
    switch (option) {
      case 'reviews':
        return 'Lượt đánh giá';
      case 'priceAsc':
        return 'Giá tăng dần';
      case 'priceDesc':
        return 'Giá giảm dần';
      case 'newest':
      default:
        return 'Mới nhất';
    }
  }

  openFilterDrawer(): void {
    this.isFilterDrawerOpen = true;
  }

  closeFilterDrawer(): void {
    this.isFilterDrawerOpen = false;
  }

  applyAndCloseFilters(): void {
    this.applyFilters();
    this.closeFilterDrawer();
  }

  openSortDrawer(): void {
    this.isSortDrawerOpen = true;
  }

  closeSortDrawer(): void {
    this.isSortDrawerOpen = false;
  }

  applySort(option: string): void {
    this.sortOption = option;
    this.applyFilters();
    this.closeSortDrawer();
  }

  nextBanner(): void {
    this.currentBanner =
      (this.currentBanner + 1) % this.collectionBanners.length;
  }

  prevBanner(): void {
    this.currentBanner =
      (this.currentBanner - 1 + this.collectionBanners.length)
      % this.collectionBanners.length;
  }
  viewCollection(collectionName: string): void {
    const keyword = collectionName
      .replace('Bộ sưu tập ', '')
      .toLowerCase();

    this.filteredProducts = this.allProducts.filter(product =>
      this.normalize(product.name).includes(this.normalize(keyword))
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();

    this.productSection?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  get pages(): (number | string)[] {
    const pages: (number | string)[] = [];

    // <= 5 trang thì hiện hết
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Đầu danh sách
    if (this.currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', this.totalPages);
      return pages;
    }

    // Cuối danh sách
    if (this.currentPage >= this.totalPages - 2) {
      pages.push(
        1,
        '...',
        this.totalPages - 3,
        this.totalPages - 2,
        this.totalPages - 1,
        this.totalPages
      );
      return pages;
    }

    // Ở giữa
    pages.push(
      1,
      '...',
      this.currentPage - 1,
      this.currentPage,
      this.currentPage + 1,
      '...',
      this.totalPages
    );

    return pages;
  }
}