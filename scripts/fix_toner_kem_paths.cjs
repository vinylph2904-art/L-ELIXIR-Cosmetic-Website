const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(),'src','app','data','mock-products.json');
const tonerDir = path.join(process.cwd(),'src','assets','images','Toner');
const kemDir = path.join(process.cwd(),'src','assets','images','Kem dưỡng');

function listNames(dir){
  try{ return fs.readdirSync(dir).filter(f=>fs.statSync(path.join(dir,f)).isFile()); }
  catch(e){ return []; }
}
const tonerFiles = listNames(tonerDir);
const kemFiles = listNames(kemDir);

function groupByPrefix(files){
  const groups = {};
  files.forEach(f=>{
    const m = f.match(/^(\d+)\./);
    if(m){
      const k = parseInt(m[1],10);
      groups[k] = groups[k] || [];
      groups[k].push(path.posix.join('assets','images', path.basename(dirFor(files)), f));
    }
  });
}

// Helper: build groups mapping number -> files (posix paths)
function buildGroups(dirPath, files){
  const groups = {};
  files.forEach(f=>{
    const m = f.match(/^(\d+)\./);
    if(m){
      const k = parseInt(m[1],10);
      groups[k] = groups[k] || [];
      groups[k].push(path.posix.join('assets','images', path.basename(dirPath), f));
    }
  });
  Object.keys(groups).forEach(k=> groups[k].sort());
  return groups;
}

const tonerGroups = buildGroups(tonerDir, tonerFiles);
const kemGroups = buildGroups(kemDir, kemFiles);

let data = JSON.parse(fs.readFileSync(jsonPath,'utf8'));

let changed = false;

data = data.map(p=>{
  const pid = p.productId || '';
  const num = parseInt(pid.replace(/[^0-9]/g,''),10);
  if(p.images && Array.isArray(p.images)){
    if(p.images.some(x=> x.includes('assets/images/Toner/SP'))){
      // map SP11 -> tonerGroups[1], SP12 -> [2], index = num - 10
      const idx = num - 10;
      const grp = tonerGroups[idx];
      if(grp && grp.length>0){
        p.images = grp.slice(0,4);
        changed = true;
      }
    }
    if(p.images.some(x=> x.includes('assets/images/Kem/SP'))){
      const idx = num - 30; // SP31 ->1
      const grp = kemGroups[idx];
      if(grp && grp.length>0){
        p.images = grp.slice(0,4);
        changed = true;
      }
    }
  }
  return p;
});

if(changed){
  fs.writeFileSync(jsonPath, JSON.stringify(data,null,2),'utf8');
  console.log('Patched Toner/Kem paths');
}else{
  console.log('No changes needed');
}
