import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  surveyForm!: FormGroup;
  isSubmitted = false;

  skinTypeOptions = ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm'];
  
  skinProblemOptions = [
    { value: 'Mụn', icon: 'coronavirus', label: 'Da đang bị các loại mụn (mụn bọc, mụn ẩn, mụn đầu đen...)' },
    { value: 'Thâm nám', icon: 'grain', label: 'Da có vết thâm, đốm nâu hoặc bị tàn nhang' },
    { value: 'Lão hóa', icon: 'hourglass_empty', label: 'Da bắt đầu xuất hiện nếp nhăn, chảy xệ' },
    { value: 'Thiếu ẩm', icon: 'water_damage', label: 'Da thiếu nước, bong tróc hoặc căng rát' },
    { value: 'Da xỉn màu', icon: 'blur_on', label: 'Da không đều màu, kém sức sống' },
    { value: 'Lỗ chân lông to', icon: 'grid_view', label: 'Lỗ chân lông to, bề mặt sần sùi' }
  ];

  targetOptions = ['Kiểm soát dầu', 'Giảm mụn', 'Dưỡng ẩm', 'Làm sáng da', 'Chống lão hóa', 'Phục hồi da'];
  
  currentProductsOptions = ['Sữa rửa mặt', 'Toner', 'Serum', 'Kem dưỡng', 'Kem chống nắng'];

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.surveyForm = this.fb.group({
      selectedSkinType: ['', Validators.required],
      selectedProblems: [[], Validators.required],
      selectedTargets: [[]],
      selectedCurrentProducts: [[]]
    });

    const suffix = this.getAccountSuffix();
    const isReDo = sessionStorage.getItem('re_do_survey');

    if (isReDo === 'true') {
      sessionStorage.removeItem('user_skin_type' + suffix);
      sessionStorage.removeItem('user_skin_problems' + suffix);
      sessionStorage.removeItem('user_skin_targets' + suffix);
      sessionStorage.removeItem('re_do_survey'); // Dọn dẹp cờ kích hoạt
    } else {
      this.loadExistingSurvey();
    }
  }

  private getAccountSuffix(): string {
    const user = this.authService.getCurrentUser();
    return user ? `_${user.userId}` : '_guest';
  }

  loadExistingSurvey(): void {
    const suffix = this.getAccountSuffix();
    const savedType = sessionStorage.getItem('user_skin_type' + suffix);
    const savedProblems = sessionStorage.getItem('user_skin_problems' + suffix);
    const savedTargets = sessionStorage.getItem('user_skin_targets' + suffix);

    if (savedType) {
      this.surveyForm.get('selectedSkinType')?.setValue(savedType);
    }
    if (savedProblems) {
      try { this.surveyForm.get('selectedProblems')?.setValue(JSON.parse(savedProblems)); } catch(e) {}
    }
    if (savedTargets) {
      try { this.surveyForm.get('selectedTargets')?.setValue(JSON.parse(savedTargets)); } catch(e) {}
    }
  }

  get progressPercentage(): number {
    let score = 0;
    if (this.surveyForm.get('selectedSkinType')?.value) score += 25;
    if (this.surveyForm.get('selectedProblems')?.value?.length > 0) score += 25;
    if (this.surveyForm.get('selectedTargets')?.value?.length > 0) score += 25;
    if (this.surveyForm.get('selectedCurrentProducts')?.value?.length > 0) score += 25;
    return score; 
  }

  onCheckboxChange(e: any) {
    let selectedProblems: string[] = this.surveyForm.get('selectedProblems')?.value || [];
    if (e.target.checked) {
      if (!selectedProblems.includes(e.target.value)) {
        selectedProblems.push(e.target.value);
      }
    } else {
      selectedProblems = selectedProblems.filter(item => item !== e.target.value);
    }
    this.surveyForm.get('selectedProblems')?.setValue(selectedProblems);
    
    if (selectedProblems.length === 0) {
      this.surveyForm.get('selectedProblems')?.setErrors({ required: true });
    } else {
      this.surveyForm.get('selectedProblems')?.setErrors(null);
    }
  }

  toggleTarget(target: string) {
    let selectedTargets: string[] = this.surveyForm.get('selectedTargets')?.value || [];
    if (selectedTargets.includes(target)) {
      selectedTargets = selectedTargets.filter(t => t !== target);
    } else {
      selectedTargets.push(target);
    }
    this.surveyForm.get('selectedTargets')?.setValue(selectedTargets);
  }

  onProductChange(e: any, product: string) {
    let selectedProducts: string[] = this.surveyForm.get('selectedCurrentProducts')?.value || [];
    if (e.target.checked) {
      selectedProducts.push(product);
    } else {
      selectedProducts = selectedProducts.filter(p => p !== product);
    }
    this.surveyForm.get('selectedCurrentProducts')?.setValue(selectedProducts);
  }

  onSubmit() {
    this.isSubmitted = true;

    if (this.surveyForm.invalid) {
      if (this.surveyForm.get('selectedSkinType')?.invalid) {
        this.scrollToElement('q1-container');
      } else if (this.surveyForm.get('selectedProblems')?.invalid) {
        this.scrollToElement('q2-container');
      }
      return;
    }

    const formData = this.surveyForm.value;
    const suffix = this.getAccountSuffix(); 
    sessionStorage.setItem('user_skin_type' + suffix, formData.selectedSkinType);
    sessionStorage.setItem('user_skin_problems' + suffix, JSON.stringify(formData.selectedProblems));
    sessionStorage.setItem('user_skin_targets' + suffix, JSON.stringify(formData.selectedTargets));
    this.router.navigate(['/recommendation']);
  }

  scrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (elementId !== 'survey-start') {
        element.classList.add('form-error-flash');
        setTimeout(() => {
          element.classList.remove('form-error-flash');
        }, 1500);
      }
    }
  }
}