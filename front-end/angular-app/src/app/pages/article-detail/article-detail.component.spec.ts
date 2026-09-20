import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {
  articleId: string = '';
  
  articles: any = {
    lumina: {
      title: 'Tinh Hoa Dưỡng Sáng Lumina',
      category: 'Bộ sưu tập',
      date: 'THÁNG 6, 2024',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3TGHEBLX0pS9Ay6XVoyJtbAtfj-C4ssGB2kAeTlIvD6feY1hh0bngtp7sB_S3DCHDsQJLO9ZklmTPgW6HzpndSnR1JmcjyrRYczU7_xewXdS4lljjcZhVS3YM9_J7n9SAUB0il7hHly-KiDbA0hxYJS8NFQzz2xc6WWCHxYis8Jq3gJdXyzM2nLIBKMItYtib-wWLqG2h5ZKMKYaKb_uaOH1AT6erbQ84bR2XFpSvIHJLrxhhO3NWZsq4XGsXvvijh_AcqoaYz2UJ',
      excerpt: 'Bộ sưu tập Lumina được thiết kế để mang lại ánh sáng tự nhiên cho làn da, với công thức độc quyền kết hợp các chiết xuất từ hoa hồng và vàng colloidal.',
      content: `
        <h2>Tinh Hoa Dưỡng Sáng Lumina</h2>
        <p>Bộ sưu tập Lumina là một cuộc cách mạng trong lĩnh vực chăm sóc da hiện đại, được phát triển bởi các chuyên gia L'ELIXIR sau nhiều năm nghiên cứu.</p>
        
        <h3>Công thức độc quyền</h3>
        <p>Lumina kết hợp những chiết xuất quý hiếm từ hoa hồng Damascus, vàng colloidal 24K, và các peptide thủy phân. Mỗi sản phẩm được chế tạo với quy trình tinh tế nhất để đảm bảo hiệu quả tối đa.</p>
        
        <h3>Lợi ích chính</h3>
        <ul>
          <li>Làm sáng da tự nhiên trong 2-3 tuần</li>
          <li>Giảm nếp nhăn và chống lão hóa</li>
          <li>Cải thiện độ đàn hồi và độ ẩm</li>
          <li>An toàn cho mọi loại da</li>
        </ul>
        
        <h3>Cách sử dụng</h3>
        <p>Sử dụng sáng và tối sau khi làm sạch da. Thoa một lượng nhỏ lên mặt và cổ, massage nhẹ nhàng cho đến khi hấp thụ hoàn toàn.</p>
        
        <p>Khám phá sự thay đổi tuyệt vời của làn da bạn với Lumina - nơi khoa học gặp gỡ thiên nhiên.</p>
      `,
      productLink: 'http://localhost:62516/products?collection=Lumina'
    },
    aurora: {
      title: 'Vẻ Đẹp Rạng Đông Aurora',
      category: 'Bộ sưu tập',
      date: 'THÁNG 6, 2024',
      image: 'https://lh3.googleusercontent.com/aida/AP1WRLtoMTWBhibtXy0Ul9Xt3rmBF_CIDuZkex0C7GXrDbDcewBkkYov7CWWizMyQtSHWAZI_pLzHlNI9CPqx7sogrYRCKvjnhGl8ocqx24m1zuHGqhvItv4N2vAN83QenwotVeagJVClnIA0wMs77IsBdjaot2czToaETEgfCe5slBUDFLqGViuECUZ48uAgXFmwfeoHDlbmHOgjBtASfP5UYJt59ohw1PvV4wXK8otIk2-5-Jr1jYT7hsxQ4KM',
      excerpt: 'Aurora là bộ sưu tập đặc biệt được lấy cảm hứng từ hiện tượng Aurora Borealis, giúp làn da có ánh nhìn tự nhiên và khỏe mạnh từ bên trong.',
      content: `
        <h2>Vẻ Đẹp Rạng Đông Aurora</h2>
        <p>Aurora là biểu tượng của vẻ đẹp tự nhiên và sức sống, lấy cảm hứng từ hiện tượng Aurora Borealis kỳ diệu ở bắc cực. Bộ sưu tập này được tạo ra để giúp làn da bạn tỏa sáng với ánh sáng tự nhiên của chính nó.</p>
        
        <h3>Thành phần chính</h3>
        <p>Aurora chứa các thành phần từ thiên nhiên bắc cực, bao gồm chiết xuất từ thủy tảo, vitamin E thiên nhiên, và các tinh dầu bắc Âu quý hiếm.</p>
        
        <h3>Hiệu quả nổi bật</h3>
        <ul>
          <li>Phục hồi da từ tổn thương môi trường</li>
          <li>Tăng cường hàng rào bảo vệ da</li>
          <li>Cung cấp độ ẩm sâu lâu dài</li>
          <li>Giảm viêm và dỏ đỏ</li>
        </ul>
        
        <h3>Phù hợp cho ai?</h3>
        <p>Aurora đặc biệt phù hợp cho những ai có da nhạy cảm, da bị tổn thương hoặc da lão hóa. Công thức nhẹ nhàng nhưng hiệu quả giúp bất kỳ loại da nào cảm thấy mềm mại và khỏe mạnh.</p>
        
        <p>Trải nghiệm vẻ đẹp của Aurora - sự kết hợp hoàn hảo giữa thiên nhiên và khoa học.</p>
      `,
      productLink: 'http://localhost:62516/products?collection=Aurora'
    }
  };

  currentArticle: any = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.articleId = params['id'];
      this.currentArticle = this.articles[this.articleId];
    });
  }
}