import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
import { ProductReviewsComponent } from './pages/product-reviews/product-reviews.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { SupportComponent } from './pages/support/support.component';
import { CollectionComponent } from './pages/collection/collection.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';
import { ArticleDetailLuminaComponent } from './pages/article-detail-lumina/article-detail-lumina.component';
import { ArticleDetailAuroraComponent } from './pages/article-detail-aurora/article-detail-aurora.component';
import { AdminLoginComponent } from './pages/admin/admin-login/admin-login.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/admin-products/admin-products.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders/admin-orders.component';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { adminGuard, adminGuestGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'products/:id/reviews', component: ProductReviewsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  { path: 'survey', component: SurveyComponent },
  { path: 'recommendation', component: RecommendationComponent },
  { path: 'order-tracking', component: OrderTrackingComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  { path: 'payment-failure', component: PaymentFailureComponent },
  { path: 'about-us', component: AboutUsComponent }, // Đăng ký đường dẫn trang Về Chúng Tôi
  { path: 'support', component: SupportComponent},
  { path: 'collection', component: CollectionComponent},
  { path: 'articles/lumina', component: ArticleDetailLuminaComponent },
  { path: 'articles/aurora', component: ArticleDetailAuroraComponent },
  { path: 'articles/:id', component: ArticleDetailComponent},

  // BACK-OFFICE ADMIN ROUTES (FR21, FR26, FR22, FR23, FR25)
  { path: 'admin/login', component: AdminLoginComponent, canActivate: [adminGuestGuard] },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: AdminProductsComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'users', component: AdminUsersComponent }
    ]
  },

  { path: '**', redirectTo: '' } // Luôn để dòng này ở cuối cùng
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}