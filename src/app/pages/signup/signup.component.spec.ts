import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignupComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { RouterTestingModule } from '@angular/router/testing';

await TestBed.configureTestingModule({
  declarations: [SignupComponent],
  imports: [RouterTestingModule, FormsModule]
}).compileComponents();
