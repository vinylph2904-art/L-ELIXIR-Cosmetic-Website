import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../data/product.model';
import { ProductService } from '../../services/product.service';

interface Article {
  id: string;
  title: string;
  category: string;
  collection: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
  productLink: string;
}

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  currentArticle: Article | null = null;
  relatedProducts: Product[] = [];

  articles: Article[] = [
    {
      id: 'lumina',
      title: 'Tinh Hoa Dưỡng Sáng Lumina',
      category: 'Bộ sưu tập',
      date: 'THÁNG 6, 2024',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3TGHEBLX0pS9Ay6XVoyJtbAtfj-C4ssGB2kAeTlIvD6feY1hh0bngtp7sB_S3DCHDsQJLO9ZklmTPgW6HzpndSnR1JmcjyrRYczU7_xewXdS4lljjcZhVS3YM9_J7n9SAUB0il7hHly-KiDbA0hxYJS8NFQzz2xc6WWCHxYis8Jq3gJdXyzM2nLIBKMItYtib-wWLqG2h5ZKMKYaKb_uaOH1AT6erbQ84bR2XFpSvIHJLrxhhO3NWZsq4XGsXvvijh_AcqoaYz2UJ',
      collection: 'Lumina',
      excerpt: 'Bộ sưu tập Lumina được thiết kế để mang lại ánh sáng tự nhiên cho làn da, với công thức độc quyền kết hợp các chiết xuất từ hoa hồng và vàng colloidal.',
      content: `
        <section class="mb-32">
          <div class="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div class="order-2 md:order-1">
              <h2 class="mb-6 font-headline-lg text-headline-lg text-primary">Khám phá hành trình chăm sóc da Lumina</h2>
              <p class="mb-6 font-body-md text-body-md leading-relaxed text-secondary">
                Mỗi bộ sưu tập Lumina đều được xây dựng để đem lại hiệu quả chuyên sâu, phù hợp với nhu cầu dưỡng da hiện đại. Các sản phẩm đồng bộ giúp tăng cường hiệu quả và tối ưu trải nghiệm dưỡng da mỗi ngày.
              </p>
              <p class="font-body-md text-body-md leading-relaxed text-secondary">
                Kết hợp sản phẩm đúng bước, bạn sẽ nhận thấy làn da trở nên mềm mại, tươi sáng và khỏe mạnh hơn từng ngày.
              </p>
            </div>
            <div class="order-1 overflow-hidden rounded-2xl shadow-xl group md:order-2">
              <img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="assets/images/Serum/Serum 1.png" alt="Sản phẩm serum" />
            </div>
          </div>
        </section>

        <blockquote class="my-24 border-y border-outline-variant py-16 text-center">
          <span class="mb-6 inline-block text-5xl text-primary-container material-symbols-outlined">format_quote</span>
          <p class="px-8 font-headline-md text-headline-md italic text-primary md:px-24">
            "Một làn da khỏe đẹp không đến từ những quy trình phức tạp, mà từ sự chăm sóc đều đặn với những sản phẩm phù hợp mỗi ngày."
          </p>
        </blockquote>

        <section class="mb-32">
          <div class="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div class="overflow-hidden rounded-2xl shadow-xl group">
              <img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="assets/images/Kem dưỡng/1.1.png" alt="Kem dưỡng" />
              <img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="assets/images/KCN/kcn 1.1.jpg" alt="Kem chống nắng" />
            </div>
            <div>
              <h2 class="mb-6 font-headline-lg text-headline-lg text-primary">Hoàn thiện quy trình chăm sóc</h2>
              <p class="mb-6 font-body-md text-body-md leading-relaxed text-secondary">
                Hoàn thiện liệu trình với các bước dưỡng ẩm và bảo vệ để duy trì làn da khỏe mạnh suốt cả ngày. Sự kết hợp giữa serum, kem dưỡng và chống nắng là bí quyết để giữ cho da luôn rạng rỡ và tràn đầy sức sống.
              </p>
              <p class="font-body-md text-body-md leading-relaxed text-secondary">
                Chọn sản phẩm phù hợp trong bộ sưu tập sẽ giúp bạn xây dựng quy trình chăm sóc da hiệu quả, đơn giản và dễ dàng áp dụng mỗi ngày.
              </p>
            </div>
          </div>
        </section>
      `,
      productLink: 'http://localhost:62516/products?collection=Lumina'
    },
    {
      id: 'aurora',
      title: 'Vẻ Đẹp Rạng Đông Aurora',
      category: 'Bộ sưu tập',
      date: 'THÁNG 6, 2024',
      image: 'assets/images/Banner/AuroraBanner.jpg',
      collection: 'Aurora',
      excerpt: 'Aurora là bộ sưu tập đặc biệt được lấy cảm hứng từ hiện tượng Aurora Borealis, giúp làn da có ánh nhìn tự nhiên và khỏe mạnh từ bên trong.',
      content: `
        <section class="mb-32">
          <div class="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div class="order-2 md:order-1">
              <h2 class="mb-6 font-headline-lg text-headline-lg text-primary">Hành trình phục hồi dịu nhẹ cùng Aurora</h2>
              <p class="mb-6 font-body-md text-body-md leading-relaxed text-secondary">
                Aurora tập trung vào phục hồi và cân bằng, giúp làn da nhạy cảm trở nên khỏe mạnh hơn từng ngày. Bộ sưu tập kết hợp các bước dưỡng nhẹ nhàng nhưng vẫn đạt hiệu quả sâu.
              </p>
              <p class="font-body-md text-body-md leading-relaxed text-secondary">
                Sử dụng đúng quy trình sẽ giúp làn da giảm kích ứng, tăng độ đàn hồi và duy trì độ ẩm lâu dài.
              </p>
            </div>
            <div class="order-1 overflow-hidden rounded-2xl shadow-xl group md:order-2">
              <img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="assets/images/Serum/Serum 2.png" alt="Sản phẩm serum Aurora" />
            </div>
          </div>
        </section>

        <blockquote class="my-24 border-y border-outline-variant py-16 text-center">
          <span class="mb-6 inline-block text-5xl text-primary-container material-symbols-outlined">format_quote</span>
          <p class="px-8 font-headline-md text-headline-md italic text-primary md:px-24">
            "Làn da được phục hồi thực sự khi mỗi bước dưỡng da đều được chọn lọc và sử dụng điều độ."
          </p>
        </blockquote>

        <section class="mb-32">
          <div class="mb-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div class="overflow-hidden rounded-2xl shadow-xl group">
              <img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="assets/images/Kem dưỡng/1.2.png" alt="Kem dưỡng Aurora" />
              <img class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" src="assets/images/KCN/kcn 1.2.jpg" alt="Kem chống nắng Aurora" />
            </div>
            <div>
              <h2 class="mb-6 font-headline-lg text-headline-lg text-primary">Giữ vững lớp bảo vệ hàng ngày</h2>
              <p class="mb-6 font-body-md text-body-md leading-relaxed text-secondary">
                Bảo vệ da trước tia UV và các tác động môi trường là bước cuối cùng không thể thiếu. Aurora giúp da vừa ẩm mượt vừa chống oxy hóa trong mọi điều kiện.
              </p>
              <p class="font-body-md text-body-md leading-relaxed text-secondary">
                Chọn sản phẩm chống nắng phù hợp, duy trì thói quen dưỡng sáng và phục hồi để làn da luôn mềm mại và tươi trẻ.
              </p>
            </div>
          </div>
        </section>
      `,
      productLink: 'http://localhost:62516/products?collection=Aurora'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      this.currentArticle = this.articles.find(article => article.id === id) || null;
      if (this.currentArticle) {
        this.loadRelatedProducts(this.currentArticle.collection);
      } else {
        this.relatedProducts = [];
      }
    });
  }

  private loadRelatedProducts(collection: string): void {
    const normalizedCollection = collection.toLowerCase();
    this.productService.getProducts().subscribe(products => {
      this.relatedProducts = products.filter(product => {
        const productCollection = product.collection?.toLowerCase() || '';
        const productName = product.name.toLowerCase();
        return productCollection === normalizedCollection || productName.includes(normalizedCollection);
      });
    });
  }
}