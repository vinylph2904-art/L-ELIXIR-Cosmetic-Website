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
  searchTerm: string = '';
  selectedCategories: string[] = [];
  selectedSkinTypes: string[] = [];
  selectedSkinProblems: string[] = [];
  bestSellingProducts: Product[] = [];
  sortOption: string = '';
  @ViewChild('productSection')
  productSection!: ElementRef;
  currentBanner = 0;
  collectionBanners = [
    {
      title: 'Bộ sưu tập Lumina',
      subtitle: 'Tinh hoa dưỡng sáng',
      description: 'Khơi mở vẻ đẹp rạng rỡ từ bên trong.',
      image: 'assets/images/banner1.jpg'
    },
    {
      title: 'Bộ sưu tập Aurora',
      subtitle: 'Vẻ đẹp rạng đông',
      description: 'Thanh lọc và phục hồi làn da mỗi ngày.',
      image: 'assets/images/banner2.jpg'
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
    this.filteredProducts = data;
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
      }

      if (category || collection) {

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

    this.sortOption = '';
    this.applyFilters();

    const checkboxes =
      document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"]'
      );

    checkboxes.forEach(cb => cb.checked = false);
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
  }
}