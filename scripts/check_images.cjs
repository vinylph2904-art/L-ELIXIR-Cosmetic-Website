const fs = require('fs');
const path = require('path');
const jsonPath = path.join(process.cwd(),'src','app','data','mock-products.json');
const data = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
let missing = [];
data.forEach(p=>{
  (p.images||[]).forEach(img=>{
    const imgPath = path.join(process.cwd(),'src','assets', img.replace('assets/',''));
    if(!fs.existsSync(imgPath)) missing.push({productId:p.productId, img, imgPath});
  });
});
if(missing.length===0){
  console.log('All images exist');
}else{
  console.log('Missing images:');
  missing.forEach(m=> console.log(m.productId, m.img));
}
process.exit(0);
