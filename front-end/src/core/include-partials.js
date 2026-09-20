// core/include-partials.js
// Simple client-side partials loader. Finds elements with `data-include` and
// replaces them with fetched HTML. Paths should be relative from the page.
(function(){
  async function includeAll(){
    const nodes = document.querySelectorAll('[data-include]');
    await Promise.all(Array.from(nodes).map(async (el)=>{
      const url = el.getAttribute('data-include');
      try{
        const res = await fetch(url);
        if(!res.ok) throw new Error('Failed to load ' + url);
        const html = await res.text();
        el.innerHTML = html;
        // execute scripts inside the included HTML
        el.querySelectorAll('script').forEach(oldScript => {
          const script = document.createElement('script');
          if(oldScript.src) script.src = oldScript.src;
          script.textContent = oldScript.textContent;
          oldScript.parentNode.replaceChild(script, oldScript);
        });
      }catch(err){
        console.error(err);
      }
    }));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', includeAll);
  else includeAll();
})();
