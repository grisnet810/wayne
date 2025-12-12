/* quote-wizard.js
   Full production-ready wizard:
   - Uses CATALOG, PRICING, FRAME_MATERIALS, GLASS_TYPES, HANDLES, LOCKS from catalog.js
   - Step flow: Product -> Type -> Size -> Frame -> Glass & Hardware -> Summary & Send
   - EmailJS optional (fallback to mailto)
*/

(function(){
  'use strict';

  function mm2sqm(wMm, hMm){ return (Number(wMm) * Number(hMm)) / 1_000_000; }
  function formatZAR(n){ return new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR',maximumFractionDigits:0}).format(Math.round(n)); }

  document.addEventListener('DOMContentLoaded', () => {
    const rootSteps = document.getElementById('wizSteps');
    const rootPanels = document.getElementById('wizPanels');

    if(!rootSteps || !rootPanels){
      console.error('Wizard missing DOM elements #wizSteps or #wizPanels');
      return;
    }

    const state = { productKey:null, typeId:null, size:null, frame:null, glass:null, handle:null, lock:null };

    const steps = ['Product','Style','Size','Frame','Glass & Hardware','Summary & Send'];
    rootSteps.innerHTML = '';
    steps.forEach((s,i)=>{
      const el = document.createElement('div');
      el.className = 'wiz-step' + (i===0?' active':'');
      el.dataset.step = i+1;
      el.textContent = s;
      el.addEventListener('click', ()=> goTo(i+1));
      rootSteps.appendChild(el);
    });

    rootPanels.innerHTML = '';
    const panels = [];
    for(let i=0;i<steps.length;i++){
      const p = document.createElement('div'); p.className = 'wiz-panel' + (i===0 ? ' active' : '');
      rootPanels.appendChild(p);
      panels.push(p);
    }
    const [p1,p2,p3,p4,p5,p6] = panels;

    // Panel 1: product grid
    p1.innerHTML = `<div class="wiz-grid" id="p1grid"></div>`;
    const p1grid = p1.querySelector('#p1grid');

    function renderProducts(){
      p1grid.innerHTML = '';
      Object.keys(CATALOG).forEach(key=>{
        const cat = CATALOG[key];
        const card = document.createElement('div'); card.className='wiz-card'; card.dataset.key = key;
        const img = (cat.types && cat.types[0] && cat.types[0].img) || 'https://via.placeholder.com/900x540?text=No+Image';
        card.innerHTML = `<img src="${img}" alt="${cat.label}"><div class="wiz-label">${cat.label}</div>`;
        card.addEventListener('click', ()=>{
          state.productKey = key; state.typeId = null; state.size = null; state.frame=null; state.glass=null; state.handle=null; state.lock=null;
          p1grid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected'));
          card.classList.add('selected');
          renderTypes(key); goTo(2);
        });
        p1grid.appendChild(card);
      });
    }

    function goTo(n){
      Array.from(rootSteps.children).forEach((c,i)=>c.classList.toggle('active', i===n-1));
      Array.from(rootPanels.children).forEach((p,i)=>p.classList.toggle('active', i===n-1));
      try { rootPanels.children[n-1].scrollIntoView({behavior:'smooth', block:'start'}); } catch(e){}
    }

    // Panel 2: Types
    function renderTypes(productKey){
      p2.innerHTML = `<div id="typesGrid" class="wiz-grid"></div>`;
      const typesGrid = p2.querySelector('#typesGrid');
      const types = (CATALOG[productKey].types || []);
      types.forEach(t=>{
        const card = document.createElement('div'); card.className='wiz-card';
        card.innerHTML = `<img src="${t.img}" alt="${t.label}"><div class="wiz-label">${t.label}</div>`;
        card.addEventListener('click', ()=>{
          state.typeId = t.id; typesGrid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected');
          renderSizes(productKey); goTo(3);
        });
        typesGrid.appendChild(card);
      });
      if(!types.length) typesGrid.innerHTML = '<div class="wiz-card"><div class="wiz-label">No styles found</div></div>';
    }

    // Panel 3: Sizes
    p3.innerHTML = `<div id="sizesGrid" class="wiz-grid"></div><div class="custom-size-row hidden" id="customRow"><input id="customW" type="number" placeholder="Width (mm)"><input id="customH" type="number" placeholder="Height (mm)"><button id="useCustom" class="btn btn-outline">Use custom</button></div>`;
    function renderSizes(productKey){
      const sizesGrid = p3.querySelector('#sizesGrid');
      const customRow = p3.querySelector('#customRow');
      sizesGrid.innerHTML = '';
      (CATALOG[productKey].sizes || []).forEach(s=>{
        const card = document.createElement('div'); card.className='wiz-card';
        const img = s.img || `https://via.placeholder.com/600x360?text=${encodeURIComponent(s.label)}`;
        card.innerHTML = `<img src="${img}" alt="${s.label}"><div class="wiz-label">${s.label}</div>`;
        card.addEventListener('click', ()=>{
          sizesGrid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected');
          if(s.custom){ customRow.classList.remove('hidden'); state.size = null; } else { customRow.classList.add('hidden'); state.size = {w:s.w,h:s.h,label:s.label}; goTo(4); }
        });
        sizesGrid.appendChild(card);
      });
      p3.querySelector('#useCustom').onclick = ()=> {
        const w = Number(p3.querySelector('#customW').value), h = Number(p3.querySelector('#customH').value);
        if(!w || !h){ alert('Enter valid width & height (mm)'); return; }
        state.size = {w,h,label:`${w} × ${h} mm`}; goTo(4);
      };
    }

    // Panel 4: Frame
    p4.innerHTML = `<h3>Choose frame material / colour</h3><div id="frameGrid" class="wiz-grid"></div>`;
    function renderFrameOptions(){
      const frameGrid = p4.querySelector('#frameGrid'); frameGrid.innerHTML='';
      (FRAME_MATERIALS || []).forEach(m=>{
        const card = document.createElement('div'); card.className='wiz-card';
        card.innerHTML = `<img src="${m.img}" alt="${m.label}"><div class="wiz-label">${m.label}</div>`;
        card.addEventListener('click', ()=>{ state.frame = m.id; frameGrid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); goTo(5); });
        frameGrid.appendChild(card);
      });
    }

    // Panel 5: Glass & hardware
    p5.innerHTML = `<h3>Glass options</h3><div id="glassGrid" class="wiz-grid"></div><h3 style="margin-top:14px">Handles</h3><div id="handleGrid" class="wiz-grid"></div><h3 style="margin-top:14px">Locks</h3><div id="lockGrid" class="wiz-grid"></div>`;
    function renderGlassAndHardware(){
      const glassGrid = p5.querySelector('#glassGrid'); const handleGrid = p5.querySelector('#handleGrid'); const lockGrid = p5.querySelector('#lockGrid');
      glassGrid.innerHTML=''; handleGrid.innerHTML=''; lockGrid.innerHTML='';
      (GLASS_TYPES || []).forEach(g=>{ const card=document.createElement('div'); card.className='wiz-card'; card.innerHTML=`<img src="${g.img}" alt="${g.label}"><div class="wiz-label">${g.label}</div>`; card.addEventListener('click', ()=>{ state.glass=g.id; glassGrid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); }); glassGrid.appendChild(card); });
      (HANDLES || []).forEach(h=>{ const card=document.createElement('div'); card.className='wiz-card'; card.innerHTML=`<img src="${h.img}" alt="${h.label}"><div class="wiz-label">${h.label}</div>`; card.addEventListener('click', ()=>{ state.handle=h.id; handleGrid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); }); handleGrid.appendChild(card); });
      (LOCKS || []).forEach(l=>{ const card=document.createElement('div'); card.className='wiz-card'; card.innerHTML=`<div style="padding:28px;text-align:center">${l.label}</div>`; card.addEventListener('click', ()=>{ state.lock=l.id; lockGrid.querySelectorAll('.wiz-card').forEach(c=>c.classList.remove('selected')); card.classList.add('selected'); }); lockGrid.appendChild(card); });
    }

    // Panel 6: summary
    p6.innerHTML = `
      <div class="summary-card">
        <img id="previewImage" src="https://via.placeholder.com/800x500?text=Preview" alt="Preview">
        <div class="summary-meta">
          <h3 id="summaryTitle">—</h3>
          <p id="summarySpecs">—</p>
          <div id="summaryPrice" class="price-box">Estimated: —</div>
        </div>
      </div>
      <form id="wizForm">
        <input id="custName" placeholder="Full name" required>
        <input id="custEmail" type="email" placeholder="Email" required>
        <input id="custPhone" placeholder="Phone" required>
        <input id="custLocation" placeholder="Delivery location / suburb">
        <div style="margin-top:10px">
          <button id="calcEstimate" type="button" class="btn btn-outline">Calculate Estimate</button>
          <button id="sendQuote" type="submit" class="btn btn-primary" disabled>Send Quote</button>
          <button id="saveLocal" type="button" class="btn btn-outline" disabled>Save</button>
        </div>
        <div id="wizErrors" style="margin-top:10px;color:#b00020"></div>
      </form>`;

    function updatePreview(){
      const title = state.productKey ? CATALOG[state.productKey].label : '—';
      const typeObj = (state.productKey && CATALOG[state.productKey].types.find(t=>t.id===state.typeId)) || {};
      const specs = [];
      if(typeObj.label) specs.push(typeObj.label);
      if(state.size) specs.push(state.size.label);
      if(state.frame) specs.push(FRAME_MATERIALS.find(f=>f.id===state.frame)?.label || '');
      if(state.glass) specs.push(GLASS_TYPES.find(g=>g.id===state.glass)?.label || '');
      document.getElementById('summaryTitle').textContent = title;
      document.getElementById('summarySpecs').textContent = specs.filter(Boolean).join(' • ');
      const typeImg = typeObj.img || 'https://via.placeholder.com/800x500?text=Preview';
      document.getElementById('previewImage').src = typeImg;
    }

    function calculateEstimate(){
      if(!state.productKey || !state.typeId || !state.size || !state.frame || !state.glass){ showError('Complete product, type, size, frame and glass selections before calculating.'); return null; }
      const size = state.size;
      const sqm = mm2sqm(size.w, size.h);
      const base = PRICING.products[state.productKey] || PRICING.products['shopfronts'];
      const matMult = PRICING.materials[state.frame] || 1;
      const glassMult = PRICING.glass[state.glass] || 1;
      const handlePrice = HANDLES.find(h=>h.id===state.handle)?.price || 0;
      const lockPrice = LOCKS.find(l=>l.id===state.lock)?.price || 0;
      const raw = (base.base + (base.per_sqm * sqm)) * matMult * glassMult;
      const final = raw + handlePrice + lockPrice;
      const low = final * (1 - PRICING.variancePct);
      const high = final * (1 + PRICING.variancePct);
      return {sqm, raw, final, low, high};
    }

    function showError(msg){ const el = document.getElementById('wizErrors'); if(el){ el.textContent=msg; setTimeout(()=>el.textContent='',6000);} }

    // delegated clicks
    document.addEventListener('click',(ev)=>{
      if(ev.target.matches('#calcEstimate')){ const res = calculateEstimate(); if(res){ document.getElementById('summaryPrice').textContent = `Estimated: ${formatZAR(res.low)} — ${formatZAR(res.high)} (mid ${formatZAR(res.final)})`; document.getElementById('sendQuote').disabled=false; document.getElementById('saveLocal').disabled=false; document.getElementById('wizForm').dataset.estimate = JSON.stringify(res); } }
      if(ev.target.matches('#saveLocal')){ const payload = {state, estimate: JSON.parse(document.getElementById('wizForm').dataset.estimate || '{}'), savedAt: new Date().toISOString()}; const stored = JSON.parse(localStorage.getItem('wga_wizard_quotes') || '[]'); stored.push(payload); localStorage.setItem('wga_wizard_quotes', JSON.stringify(stored)); alert('Quote saved locally.'); }
    });

    document.addEventListener('submit',(ev)=>{
      if(ev.target && ev.target.id === 'wizForm'){ ev.preventDefault();
        const name = document.getElementById('custName').value.trim();
        const email = document.getElementById('custEmail').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        if(!name) return showError('Enter your name.'); if(!validateEmail(email)) return showError('Enter a valid email.'); if(!validatePhone(phone)) return showError('Enter a valid phone number.');
        const estimate = JSON.parse(ev.target.dataset.estimate || '{}'); if(!estimate || !estimate.final) return showError('Calculate estimate before sending.');
        const payload = {
          to_name: name, to_email: email, phone,
          product: CATALOG[state.productKey]?.label || '',
          type: CATALOG[state.productKey]?.types.find(t=>t.id===state.typeId)?.label || '',
          size: state.size?.label || '',
          frame: FRAME_MATERIALS.find(f=>f.id===state.frame)?.label || '',
          glass: GLASS_TYPES.find(g=>g.id===state.glass)?.label || '',
          handle: HANDLES.find(h=>h.id===state.handle)?.label || '',
          lock: LOCKS.find(l=>l.id===state.lock)?.label || '',
          estimate_low: Math.round(estimate.low),
          estimate_high: Math.round(estimate.high),
          estimate_mid: Math.round(estimate.final)
        };

        // EmailJS if configured, otherwise mailto fallback
        if(typeof emailjs !== 'undefined' && typeof EMAILJS_USER_ID !== 'undefined' && EMAILJS_USER_ID !== 'YOUR_EMAILJS_USER_ID'){
          try{ emailjs.init(EMAILJS_USER_ID); emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, payload).then(()=>{ alert('Quote sent — check your email.'); }, (err)=>{ console.error(err); showError('Email sending failed.'); }); }catch(e){ console.error(e); fallbackMail(payload); }
        } else { fallbackMail(payload); }
      }
    });

    function fallbackMail(payload){
      const subject = encodeURIComponent(`Quote Request: ${payload.product}`);
      const body = encodeURIComponent(`Name: ${payload.to_name}\nEmail: ${payload.to_email}\nPhone: ${payload.phone}\nProduct: ${payload.product}\nType: ${payload.type}\nSize: ${payload.size}\nFrame: ${payload.frame}\nGlass: ${payload.glass}\nHandle: ${payload.handle}\nLock: ${payload.lock}\nEstimate (mid): R${payload.estimate_mid}\n`);
      window.location.href = `mailto:info@wayneglassandaluminium.co.za?subject=${subject}&body=${body}`;
    }

    function validateEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
    function validatePhone(p){ return /\d{7,15}/.test(p.replace(/[^0-9]/g,'')); }

    // initial renders
    try{ renderProducts(); renderFrameOptions(); renderGlassAndHardware(); } catch(e){ console.error('Initial render error', e); }
    // observe and update preview on panel changes
    const observer = new MutationObserver(()=> updatePreview());
    observer.observe(rootPanels,{childList:true,subtree:true});

    // query param support ?cat=
    try{ const params = new URLSearchParams(location.search); const cat = params.get('cat'); if(cat && CATALOG[cat]){ const card = Array.from(p1grid.children).find(c=> c.dataset.key === cat); if(card) card.click(); } } catch(e){}
  });
})();