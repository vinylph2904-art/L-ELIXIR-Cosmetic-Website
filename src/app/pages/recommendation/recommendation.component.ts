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
  cleansers: Product[] = [];
  toners: Product[] = [];
  serums: Product[] = [];
  moisturizers: Product[] = [];
  sunscreens: Product[] = []; 
  allProducts: any[] = []; 
  activeStep: number = 1;
  showAllRecommended: boolean = false; 
  dynamicIngredients: any[] = [];
  customArticles: any[] = []; 
  isModalOpen = false;
  selectedArticle: any = null;

  constructor(private recommendationService: RecommendationService) {}

  ngOnInit(): void {
    
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

    const cleanProblemsForProducts = [...this.userProblems];
    const cleanProblemsForIngredients = [...this.userProblems];
    const cleanProblemsForAnalysis = [...this.userProblems];

    const result = this.recommendationService.getRecommendations(this.userSkinType, cleanProblemsForProducts);
    this.isRelaxedRule = result.isRelaxed;
    this.allProducts = result.products && result.products.length > 0 ? [...result.products] : [];
    this.dynamicIngredients = this.recommendationService.getDynamicIngredients(this.userSkinType, cleanProblemsForIngredients);
    this.customArticles = this.recommendationService.getDetailedAnalysis(this.userSkinType, cleanProblemsForAnalysis);
    this.categorizeRoutine(this.allProducts);
  }

  private categorizeRoutine(products: Product[]): void {
    this.cleansers = products.filter(p => p.categoryName === 'Sữa rửa mặt' || p.categoryName === 'Tẩy trang');
    this.toners = products.filter(p => p.categoryName === 'Toner');
    this.serums = products.filter(p => p.categoryName === 'Serum');
    this.moisturizers = products.filter(p => p.categoryName === 'Kem dưỡng');
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