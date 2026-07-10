const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'src', 'app', 'data');
const imgRoot = path.join(process.cwd(), 'src', 'assets', 'images');
const jsonPath = path.join(root, 'mock-products.json');

function listFiles(folder){
  const p = path.join(imgRoot, folder);
  try{
    return fs.readdirSync(p).filter(f => fs.statSync(path.join(p,f)).isFile());
  }catch(e){
    return [];
  }
}

const srFiles = listFiles('SRM');
const kcnFiles = listFiles('KCN');
const serumFiles = listFiles('Serum');

const srGroups = {};
srFiles.forEach(f =>{
  const m = f.match(/(SP\d{2})\./i);
  if(m){
    const key = m[1].toUpperCase();
    srGroups[key] = srGroups[key] || [];
    srGroups[key].push(path.posix.join('assets','images','SRM', f));
  }
});
Object.keys(srGroups).forEach(k => {
  srGroups[k].sort((a,b)=> (a.includes('.1')? -1:1) - (b.includes('.1')? -1:1));
});

const kcnGroups = {};
kcnFiles.forEach(f=>{
  const m = f.match(/kcn\s*(\d+)/i);
  if(m){
    const key = parseInt(m[1],10);
    kcnGroups[key] = kcnGroups[key] || [];
    kcnGroups[key].push(path.posix.join('assets','images','KCN', f));
  }
});
const kcnKeys = Object.keys(kcnGroups).map(x=>parseInt(x,10)).sort((a,b)=>a-b);
kcnKeys.forEach(k=>{
  kcnGroups[k].sort((a,b)=>(a.toLowerCase().includes('.1')? -1:1) - (b.toLowerCase().includes('.1')? -1:1));
});

const serumGroups = {};
serumFiles.forEach(f=>{
  const m = f.match(/Serum\s*(\d+)/i);
  if(m){
    const key = parseInt(m[1],10);
    serumGroups[key] = serumGroups[key] || [];
    serumGroups[key].push(path.posix.join('assets','images','Serum', f));
  }
});
const serumKeys = Object.keys(serumGroups).map(x=>parseInt(x,10)).sort((a,b)=>a-b);
serumKeys.forEach(k=>{
  serumGroups[k].sort((a,b)=> (a.toLowerCase().includes(`serum ${k}.png`)? -1:1) - (b.toLowerCase().includes(`serum ${k}.png`)? -1:1));
});

let products = JSON.parse(fs.readFileSync(jsonPath,'utf8'));

let kcnIdx = 0;
let serumIdx = 0;

products = products.map(p=>{
  const cat = (p.categoryName||'').toLowerCase();
  const name = (p.name||'').toLowerCase();
  const pid = (p.productId||'').toUpperCase();

  if(cat.includes('sữa rửa mặt') || name.includes('sữa rửa mặt') || name.includes('sua rua mat')){
    const grp = srGroups[pid];
    if(grp && grp.length>0){
      p.images = grp.slice(0,4);
    }
  }else if(cat.includes('chống nắng') || name.includes('chống nắng') || name.includes('chong nang')){
    if(kcnIdx < kcnKeys.length){
      const key = kcnKeys[kcnIdx];
      const grp = kcnGroups[key] || [];
      if(grp.length>0) p.images = grp.slice(0,4);
      kcnIdx++;
    }
  }else if(cat.includes('serum') || name.includes('serum')){
    const m = name.match(/serum\s*(\d+)/);
    if(m){
      const key = parseInt(m[1],10);
      if(serumGroups[key]) p.images = serumGroups[key].slice(0,4);
    }else{
      if(serumIdx < serumKeys.length){
        const key = serumKeys[serumIdx];
        p.images = (serumGroups[key]||[]).slice(0,4);
        serumIdx++;
      }
    }
  }
  // ensure cover ordering: prefer any file containing '.1' or ending with number 1
  if(Array.isArray(p.images) && p.images.length>1){
    p.images.sort((a,b)=>{
      const a1 = /\\.1(\\.|$)/i.test(a) || /\b1\./.test(path.basename(a));
      const b1 = /\\.1(\\.|$)/i.test(b) || /\b1\./.test(path.basename(b));
      if(a1 && !b1) return -1;
      if(b1 && !a1) return 1;
      return a.localeCompare(b);
    });
    p.images = p.images.slice(0,4);
  }
  return p;
});

fs.writeFileSync(jsonPath, JSON.stringify(products,null,2),'utf8');
console.log('Updated mock-products.json with images');
