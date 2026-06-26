import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './pages/home/home.component';
import { ProductListComponent } from './pages/product-list/product-list.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SurveyComponent } from './pages/survey/survey.component';
import { RecommendationComponent } from './pages/recommendation/recommendation.component';
import { OrderTrackingComponent } from './pages/order-tracking/order-tracking.component';
import { PaymentComponent } from './pages/payment/payment.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentFailureComponent } from './pages/payment-failure/payment-failure.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { BeautyAssistantComponent } from './beauty-assistant/beauty-assistant.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { ReviewListComponent } from './components/review-list/review-list.component';
import { ReviewFormComponent } from './components/review-form/review-form.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProductCardComponent } from './components/product-card/product-card.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    CartComponent,
    LoginComponent,
    SignupComponent,
    SurveyComponent,
    RecommendationComponent,
    OrderTrackingComponent,
    PaymentComponent,
    PaymentSuccessComponent,
    PaymentFailureComponent,
    ProfileComponent,
    ProductCardComponent,
    ReviewListComponent,
    ReviewFormComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BeautyAssistantComponent,
    ToastContainerComponent,
    RouterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}