import { Component } from '@angular/core';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent {
  currentStep = 1;
  selectedSkinType = '';
  concerns: string[] = [];

  nextStep() {
    if (this.currentStep < 4) {
      this.currentStep += 1;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  toggleConcern(concern: string) {
    const index = this.concerns.indexOf(concern);
    if (index > -1) {
      this.concerns.splice(index, 1);
    } else {
      this.concerns.push(concern);
    }
  }

  submitSurvey() {
    this.currentStep = 4;
  }
}
