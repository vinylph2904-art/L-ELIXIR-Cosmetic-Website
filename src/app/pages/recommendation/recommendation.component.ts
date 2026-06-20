import { Component, OnInit } from '@angular/core';
import { RecommendationService } from './recommendation.service';
import { Product } from '../../data/product.model';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {
  userSkinType: string = '';
  userProblems: string[] = [];
  userTargets: string[] = [];

  hasData = false;
  isRelaxedRule = false;

  // Tách biệt hoàn toàn thành 5 mảng sản phẩm tương ứng 5 bước
  cleansers: Product[] = [];
  toners: Product[] = [];
  serums: Product[] = [];
  moisturizers: Product[] = [];
  sunscreens: Product[] = []; 
  
  allProducts: any[] = []; 

  // Biến điều khiển chuyển bước động (1 -> 5)
  activeStep: number = 1;

  // 🔽 ĐÃ THÊM: Biến kiểm soát ẩn/hiện để giới hạn hiển thị tối đa 4 sản phẩm ban đầu
  showAllRecommended: boolean = false; 

  // Mảng động chứa danh sách thành phần sẽ hiển thị lên 4 khung mẫu
  dynamicIngredients: any[] = [];

  // Mảng động chứa thông tin chẩn đoán chuyên sâu để render ra 3 ô
  customArticles: any[] = []; 

  // Các biến kiểm soát trạng thái ẩn/hiện của Modal Popup
  isModalOpen = false;
  selectedArticle: any = null;

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit(): void {
    // Đọc dữ liệu từ bộ nhớ Session Storage thực tế
    this.userSkinType = sessionStorage.getItem('user_skin_type') || '';
    
    const savedProblems = sessionStorage.getItem('user_skin_problems');
    if (savedProblems) {
      try { this.userProblems = JSON.parse(savedProblems); } catch(e) {}
    }

    const savedTargets = sessionStorage.getItem('user_skin_targets');
    if (savedTargets) {
      try { this.userTargets = JSON.parse(savedTargets); } catch(e) {}
    }

    if (!this.userSkinType) {
      this.hasData = false;
      return;
    }

    this.hasData = true;

    // Tạo các bản sao mảng độc lập để tránh lỗi tham chiếu chéo làm biến đổi dữ liệu ID trong Service
    const cleanProblemsForProducts = [...this.userProblems];
    const cleanProblemsForIngredients = [...this.userProblems];
    const cleanProblemsForAnalysis = [...this.userProblems];

    // Lấy dữ liệu khuyến dùng sản phẩm gốc
    const result = this.recommendationService.getRecommendations(this.userSkinType, cleanProblemsForProducts);
    this.isRelaxedRule = result.isRelaxed;

    // Gán trực tiếp danh sách sản phẩm chuẩn từ Service sang mảng allProducts dùng cho HTML
    this.allProducts = result.products && result.products.length > 0 ? [...result.products] : [];

    // Nạp dữ liệu cho các khu vực khác
    this.dynamicIngredients = this.recommendationService.getDynamicIngredients(this.userSkinType, cleanProblemsForIngredients);
    this.customArticles = this.recommendationService.getDetailedAnalysis(this.userSkinType, cleanProblemsForAnalysis);

    // Chạy hàm phân loại để chuẩn bị dữ liệu cho Lộ trình 5 bước độc lập ở đáy trang
    this.categorizeRoutine(this.allProducts);
  }

  // Phân loại rõ ràng các danh mục sản phẩm độc lập
  private categorizeRoutine(products: Product[]): void {
    this.cleansers = products.filter(p => p.categoryName === 'Sữa rửa mặt' || p.categoryName === 'Tẩy trang');
    this.toners = products.filter(p => p.categoryName === 'Toner');
    this.serums = products.filter(p => p.categoryName === 'Serum');
    this.moisturizers = products.filter(p => p.categoryName === 'Kem dưỡng');
    
    // 🔥 ĐÃ CẬP NHẬT: Bước 5 chỉ lọc theo đúng loại da (skinType), không quan tâm đến vấn đề da để tránh bị rỗng data
    this.sunscreens = products.filter(p => p.categoryName === 'Chống nắng');
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openArticleModal(article: any): void {
    this.selectedArticle = article;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeArticleModal(): void {
    this.isModalOpen = false;
    this.selectedArticle = null;
    document.body.style.overflow = 'auto';
  }
}