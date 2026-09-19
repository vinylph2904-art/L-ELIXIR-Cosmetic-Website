import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastService } from '../../../services/toast.service';
import { Product } from '../../../data/product.model';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Filter & Search
  searchTerm = '';
  selectedCategory = '';
  stockFilter: 'all' | 'low' | 'deleted' | 'active' = 'all';

  categories = ['Sữa rửa mặt', 'Toner', 'Serum', 'Kem dưỡng', 'Chống nắng'];

  // Modal State
  isModalOpen = false;
  isEditMode = false;
  editingProduct: Product = this.getEmptyProduct();
  ingredientsInput = '';
  targetSkinTypesInput = '';
  targetSkinProblemsInput = '';
  imageInput = '';

  constructor(
    private productService: ProductService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProductsAdmin().subscribe(prods => {
      this.products = prods;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    let result = [...this.products];

    // 1. Search
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.productId.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term)
      );
    }

    // 2. Category
    if (this.selectedCategory) {
      result = result.filter(p => p.categoryName === this.selectedCategory);
    }

    // 3. Stock & Status
    if (this.stockFilter === 'low') {
      result = result.filter(p => !p.isDeleted && p.stockQuantity < 10);
    } else if (this.stockFilter === 'deleted') {
      result = result.filter(p => p.isDeleted);
    } else if (this.stockFilter === 'active') {
      result = result.filter(p => !p.isDeleted);
    }

    this.filteredProducts = result;
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.editingProduct = this.getEmptyProduct();
    this.ingredientsInput = '';
    this.targetSkinTypesInput = 'Da dầu, Da khô, Da hỗn hợp, Da nhạy cảm';
    this.targetSkinProblemsInput = 'Mụn, Thâm nám, Thiếu ẩm';
    this.imageInput = 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80';
    this.isModalOpen = true;
  }

  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.editingProduct = { ...product };
    this.ingredientsInput = (product.ingredients || []).join(', ');
    this.targetSkinTypesInput = (product.targetSkinTypes || []).join(', ');
    this.targetSkinProblemsInput = (product.targetSkinProblems || []).join(', ');
    this.imageInput = (product.images && product.images[0]) || '';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  // Handle image upload from computer (Convert to Base64)
  onFileSelected(event: any): void {
    const file = event.target.files && event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.toastService.error('Kích thước ảnh tối đa là 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageInput = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProduct(): void {
    if (!this.editingProduct.name.trim()) {
      this.toastService.error('Vui lòng nhập tên sản phẩm.');
      return;
    }

    if (!this.editingProduct.categoryName) {
      this.toastService.error('Vui lòng chọn danh mục.');
      return;
    }

    if (this.editingProduct.price <= 0) {
      this.toastService.error('Giá bán phải lớn hơn 0.');
      return;
    }

    const images = this.imageInput.trim() ? [this.imageInput.trim()] : ['assets/images/SRM/SP01.1.png'];
    const ingredients = this.ingredientsInput.split(',').map(s => s.trim()).filter(Boolean);
    const targetSkinTypes = this.targetSkinTypesInput.split(',').map(s => s.trim()).filter(Boolean);
    const targetSkinProblems = this.targetSkinProblemsInput.split(',').map(s => s.trim()).filter(Boolean);

    const productToSave: Product = {
      ...this.editingProduct,
      images,
      ingredients,
      targetSkinTypes,
      targetSkinProblems
    };

    if (this.isEditMode) {
      this.productService.updateProduct(productToSave).subscribe(() => {
        this.toastService.success(`Cập nhật sản phẩm "${productToSave.name}" thành công.`);
        this.closeModal();
        this.loadProducts();
      });
    } else {
      this.productService.addProduct(productToSave).subscribe(() => {
        this.toastService.success(`Thêm sản phẩm mới "${productToSave.name}" thành công.`);
        this.closeModal();
        this.loadProducts();
      });
    }
  }

  toggleSoftDelete(product: Product): void {
    if (product.isDeleted) {
      // Restore
      this.productService.restoreProduct(product.productId).subscribe(() => {
        this.toastService.success(`Đã khôi phục sản phẩm "${product.name}".`);
        this.loadProducts();
      });
    } else {
      // Soft-delete
      if (confirm(`Bạn có chắc chắn muốn xóa mềm (tạm ngưng) sản phẩm "${product.name}"? Sản phẩm sẽ ẩn khỏi trang bán hàng.`)) {
        this.productService.softDeleteProduct(product.productId).subscribe(() => {
          this.toastService.warning(`Đã chuyển sản phẩm "${product.name}" sang trạng thái tạm ngưng.`);
          this.loadProducts();
        });
      }
    }
  }

  hardDeleteProduct(product: Product): void {
    if (confirm(`Hành động này sẽ XÓA VĨNH VIỄN sản phẩm "${product.name}". Bạn có chắc chắn không?`)) {
      this.productService.deleteProduct(product.productId).subscribe(() => {
        this.toastService.error(`Đã xóa vĩnh viễn sản phẩm "${product.name}".`);
        this.loadProducts();
      });
    }
  }

  private getEmptyProduct(): Product {
    return {
      productId: '',
      name: '',
      brand: "L'Elixir",
      categoryName: 'Sữa rửa mặt',
      description: '',
      ingredients: [],
      images: [],
      volume: '150ml',
      routineStep: 'Bước 1',
      price: 250000,
      stockQuantity: 50,
      targetSkinTypes: ['Da dầu', 'Da hỗn hợp'],
      targetSkinProblems: ['Mụn'],
      averageRating: 5.0,
      reviewCount: 0,
      isDeleted: false
    };
  }

  formatCurrency(value: number): string {
    return (value || 0).toLocaleString('vi-VN') + ' ₫';
  }
}

