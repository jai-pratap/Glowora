const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const store = {
  get(key, fallback){try{return JSON.parse(localStorage.getItem('dermabloom_'+key)) ?? fallback}catch{return fallback}},
  set(key,value){localStorage.setItem('dermabloom_'+key,JSON.stringify(value))}
};
function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300)}
function initTheme(){const saved=localStorage.getItem('dermabloom_theme')||'light';document.documentElement.dataset.theme=saved;const btn=$('#theme-toggle');if(btn){btn.textContent=saved==='dark'?'☀':'☾';btn.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('dermabloom_theme',next);btn.textContent=next==='dark'?'☀':'☾';drawChart()})}}
function initNav(){const btn=$('#menu-toggle'),nav=$('#nav-links');btn?.addEventListener('click',()=>nav.classList.toggle('open'))}
initTheme();initNav();

const quizzes={
 skin:{target:'#skin-quiz',key:'skinResult',title:'Skin type',questions:[
  {q:'How does your skin usually feel a few hours after cleansing?',a:['Tight or dry','Comfortable and balanced','Shiny, especially in the T-zone','Shiny all over','Dry in some areas and oily in others']},
  {q:'How visible are your pores?',a:['Small or barely visible','Mostly visible around my nose','Visible across my face','Not sure']},
  {q:'How does your skin react to new products?',a:['Often feels irritated or stings','Usually tolerates products well','Sometimes gets clogged or breaks out','Not sure']},
  {q:'What is your main skin-care focus right now?',a:['Hydration and dryness','Oiliness and breakouts','Uneven tone or dark spots','Sensitivity and comfort','General maintenance']}
 ],result(answers){const first=answers[0];let type=first.includes('Tight')?'Dry-leaning':first.includes('Shiny all')?'Oily-leaning':first.includes('T-zone')||first.includes('Dry in')?'Combination-leaning':'Balanced-leaning';if(answers[2].startsWith('Often'))type+=' · sensitive tendencies';return {label:type,note:'Consider a gentle cleanser, moisturiser and daily broad-spectrum sunscreen. Introduce new products gradually and observe how your skin responds.'}}},
 hair:{target:'#hair-quiz',key:'hairResult',title:'Hair & scalp',questions:[
  {q:'Which best describes your scalp most days?',a:['Dry or sometimes flaky','Oily by the end of the day','Usually comfortable','Itchy or easily irritated']},
  {q:'How would you describe the hair shedding you notice?',a:['A little, mostly while washing or brushing','More than I used to notice','Sudden or noticeably increased','I am not sure']},
  {q:'How often do you use heat styling or tight hairstyles?',a:['Rarely','Once or twice a week','Most days','It varies']},
  {q:'What is your main hair-care goal?',a:['Scalp comfort','Less breakage','A simple healthy routine','Understand changes in shedding']}
 ],result(answers){let label=answers[0].startsWith('Dry')?'Dry/flaky scalp tendency':answers[0].startsWith('Oily')?'Oil-prone scalp tendency':answers[0].startsWith('Itchy')?'Sensitive/itch-prone scalp tendency':'Generally comfortable scalp';return {label,note:'Use gentle hair handling, avoid very tight styles and choose products suited to your scalp. Persistent flakes, irritation or increased shedding deserve professional assessment.'}}}
};
function renderQuiz(config){const root=$(config.target);if(!root)return;let index=0,answers=[];function show(){if(index>=config.questions.length){const result=config.result(answers);store.set(config.key,{...result,date:new Date().toISOString()});root.innerHTML=`<div class="result-box"><span class="pill">Assessment complete</span><h3>${result.label}</h3><p>${result.note}</p><button class="btn small" id="retake">Retake assessment</button> <a class="btn secondary small" href="dashboard.html">View dashboard</a></div>`;$('#retake',root).addEventListener('click',()=>{index=0;answers=[];show()});toast(config.title+' saved to your dashboard');return}
 const q=config.questions[index];root.innerHTML=`<div class="quiz-progress"><span style="width:${index/config.questions.length*100}%"></span></div><div class="muted" style="font-size:.8rem">Question ${index+1} of ${config.questions.length}</div><p class="question">${q.q}</p><div class="option-list">${q.a.map((a,i)=>`<button class="option ${answers[index]===a?'selected':''}" data-answer="${i}">${a}</button>`).join('')}</div><div class="quiz-controls"><button class="btn secondary small" id="prev" ${index===0?'disabled':''}>← Back</button><button class="btn small" id="next" ${!answers[index]?'disabled':''}>${index===config.questions.length-1?'See my summary':'Continue →'}</button></div>`;
 $$('[data-answer]',root).forEach(b=>b.addEventListener('click',()=>{answers[index]=q.a[Number(b.dataset.answer)];show()}));$('#prev',root).addEventListener('click',()=>{if(index>0){index--;show()}});$('#next',root).addEventListener('click',()=>{if(answers[index]){index++;show()}});
 }show()}
Object.values(quizzes).forEach(renderQuiz);

const defaultRoutine=[
 {id:'r1',name:'Gentle cleanse',time:'Morning',category:'Skin'},
 {id:'r2',name:'Moisturiser',time:'Morning',category:'Skin'},
 {id:'r3',name:'Broad-spectrum sunscreen',time:'Morning',category:'Skin'},
 {id:'r4',name:'Gentle cleanse',time:'Evening',category:'Skin'},
 {id:'r5',name:'Conditioner on lengths',time:'Evening',category:'Hair'}
];
function dateKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function initRoutine(){const form=$('#routine-form');if(!form)return;let items=store.get('routine',defaultRoutine);let checks=store.get('checks_'+dateKey(),[]);function save(){store.set('routine',items);store.set('checks_'+dateKey(),checks);render()}
 function render(){const morning=$('#morning-list'),evening=$('#evening-list');morning.innerHTML='';evening.innerHTML='';items.forEach(item=>{const done=checks.includes(item.id);const row=document.createElement('label');row.className='routine-item'+(done?' done':'');row.innerHTML=`<input type="checkbox" ${done?'checked':''}><span class="routine-name">${escapeHTML(item.name)}</span><span class="routine-meta">${item.category}</span><button type="button" class="icon-btn" aria-label="Remove step" style="width:30px;height:30px;font-size:.8rem">×</button>`;row.querySelector('input').addEventListener('change',e=>{checks=e.target.checked?[...checks,item.id]:checks.filter(x=>x!==item.id);save()});row.querySelector('button').addEventListener('click',()=>{items=items.filter(x=>x.id!==item.id);checks=checks.filter(x=>x!==item.id);save()});(item.time==='Morning'?morning:evening).append(row)});if(!items.some(i=>i.time==='Morning'))morning.innerHTML='<div class="empty-state">No morning steps yet.</div>';if(!items.some(i=>i.time!=='Morning'))evening.innerHTML='<div class="empty-state">No evening or anytime steps yet.</div>';const pct=items.length?Math.round(checks.length/items.length*100):0;$('#routine-progress').style.width=pct+'%';$('#progress-label').textContent=pct+'% complete';$('#routine-count').textContent=`${checks.length} / ${items.length}`}
 form.addEventListener('submit',e=>{e.preventDefault();const name=$('#routine-name').value.trim();if(!name)return;items.push({id:'r'+Date.now(),name,time:$('#routine-time').value,category:$('#routine-category').value});form.reset();save();toast('Routine step added')});$('#reset-routine').addEventListener('click',()=>{checks=[];save();toast('Today’s checkmarks reset')});render()}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
initRoutine();

const ingredients=[
 ['Hyaluronic acid','skin','💧','Hydration','A humectant used in moisturisers and serums to help attract and retain water in the skin.','Apply as directed; pair with a moisturiser if your skin feels dry.'],
 ['Niacinamide','skin','🌿','Barrier support','A form of vitamin B3 commonly used in products targeting uneven-looking tone and skin barrier support.','Start with a product concentration suited to your skin; stop if irritation occurs.'],
 ['Salicylic acid','skin','🫧','Exfoliation','A beta hydroxy acid often used in products for clogged pores and blemish-prone skin.','Can be drying or irritating. Introduce slowly and follow label directions.'],
 ['Ceramides','skin','🧴','Moisture barrier','Lipids naturally found in the skin barrier and included in moisturisers to support barrier function.','Often found in gentle moisturising formulas.'],
 ['Vitamin C','skin','🍊','Antioxidant care','A family of antioxidant ingredients used in some products to brighten the appearance of uneven tone.','Formulas vary; patch-test and use sunscreen as part of daytime care.'],
 ['Aloe vera','skin','🌱','Soothing feel','A plant-derived ingredient used in gels and moisturisers for a cooling, soothing feel.','Plant extracts can still cause allergy or irritation in some people.'],
 ['Ketoconazole','hair','🧼','Dandruff care','An antifungal ingredient used in certain medicated shampoos for dandruff and related scalp conditions.','Use only according to the product label or clinician advice.'],
 ['Piroctone olamine','hair','🌾','Scalp care','An ingredient found in some anti-dandruff shampoos to help manage visible flakes.','Follow product directions; seek advice for persistent scalp symptoms.'],
 ['Panthenol','hair','✨','Conditioning','Pro-vitamin B5 used in hair products to help condition hair and improve its feel.','Usually used in rinse-off or leave-on formulas as directed.'],
 ['Glycerin','hair','💦','Moisture','A humectant used in hair and skin products to attract moisture.','The overall formula matters; use products according to their instructions.'],
 ['Caffeine','hair','☕','Hair product ingredient','Included in some scalp products marketed for hair appearance; evidence for topical benefits is still developing.','Do not rely on cosmetic products to treat sudden or significant hair loss.'],
 ['Argan oil','hair','🌰','Hair conditioning','A plant oil used to smooth hair lengths and add softness or shine.','Use a small amount on lengths; oils may not suit every scalp.']
];
function initIngredients(){const grid=$('#ingredient-grid');if(!grid)return;const search=$('#ingredient-search'),filter=$('#ingredient-filter');function render(){const q=search.value.toLowerCase(),f=filter.value;const list=ingredients.filter(x=>(f==='all'||x[1]===f)&&x.join(' ').toLowerCase().includes(q));grid.innerHTML=list.length?list.map(x=>`<article class="ingredient-card"><div class="symbol">${x[2]}</div><span class="pill">${x[1]==='skin'?'Skin':'Hair & scalp'}</span><h3>${x[0]}</h3><strong style="font-size:.8rem;color:var(--sage-dark)">${x[3]}</strong><p style="margin-top:7px">${x[4]}</p><div class="notice" style="margin-top:13px;font-size:.78rem">${x[5]}</div></article>`).join(''):'<div class="empty-state" style="grid-column:1/-1">No matching ingredients found.</div>'}search.addEventListener('input',render);filter.addEventListener('change',render);render()}
initIngredients();

const tips=[
 ['Acne-prone skin','skin','✿','Keep the routine simple','Use a gentle cleanser and non-comedogenic moisturiser. Avoid scrubbing or picking blemishes. Some over-the-counter ingredients may help, but introduce them slowly and follow labels.'],
 ['Pigmentation & uneven tone','skin','☀','Be consistent with sun protection','Daily broad-spectrum sunscreen helps prevent dark spots from becoming more noticeable. Avoid harsh DIY treatments such as lemon juice, which can irritate skin.'],
 ['Dry or tight skin','skin','💧','Support your skin barrier','Try lukewarm rather than hot water, a gentle cleanser and a moisturiser. If dryness is persistent, painful or cracked, seek professional advice.'],
 ['Sensitive-feeling skin','skin','🌱','Reduce the number of variables','Choose fragrance-free gentle products where possible and introduce one new product at a time. Stop using a product that causes burning or a rash.'],
 ['Visible dandruff','hair','🫧','Care for your scalp gently','Use an anti-dandruff shampoo according to its label. Avoid scratching and heavy product build-up. Persistent redness, pain or thick scaling needs assessment.'],
 ['Hair breakage','hair','🌾','Handle hair with care','Detangle gently, limit high heat and avoid tight hairstyles that pull on the hair. Conditioner can help reduce friction and breakage.'],
 ['Increased hair shedding','hair','🍃','Notice patterns, not just single days','Shedding can have many causes. Sudden, patchy or persistent increased shedding should be discussed with a healthcare professional rather than self-diagnosed.'],
 ['Everyday routine','wellness','◷','Choose consistency over complexity','A few comfortable steps done regularly are often easier to maintain than a long routine. Review how your skin and scalp respond.'],
 ['Patch testing','skin','🧪','Try new products thoughtfully','Follow the product label for patch testing and discontinue use if you develop irritation. A patch test cannot guarantee a product will never cause a reaction.']
];
function initTips(){const grid=$('#tips-grid');if(!grid)return;const input=$('#tips-search');function render(){const q=input.value.toLowerCase(),list=tips.filter(t=>t.join(' ').toLowerCase().includes(q));grid.innerHTML=list.length?list.map(t=>`<article class="tip-card"><div class="feature-icon">${t[2]}</div><span class="pill">${t[1]==='wellness'?'Wellness':t[1]==='skin'?'Skin':'Hair & scalp'}</span><h3>${t[0]}</h3><strong>${t[3]}</strong><p>${t[4]}</p></article>`).join(''):'<div class="empty-state" style="grid-column:1/-1">No tips match that search.</div>'}input.addEventListener('input',render);render()}
initTips();

function initDashboard(){if(!$('#dash-skin'))return;const skin=store.get('skinResult',null),hair=store.get('hairResult',null),items=store.get('routine',defaultRoutine),checks=store.get('checks_'+dateKey(),[]);$('#dash-skin').textContent=skin?.label||'Not completed';$('#dash-skin-note').textContent=skin?.note||'Take the skin assessment to see your summary here.';$('#dash-hair').textContent=hair?.label||'Not completed';$('#dash-hair-note').textContent=hair?.note||'Take the hair assessment to see your summary here.';const pct=items.length?Math.round(checks.length/items.length*100):0;$('#dash-completion').textContent=pct+'%';$('#dash-progress').style.width=pct+'%';$('#dash-routine-note').textContent=`${checks.length} of ${items.length} routine steps checked off today.`;drawChart()}
function drawChart(){const canvas=$('#progress-chart');if(!canvas)return;const ctx=canvas.getContext('2d'),w=canvas.clientWidth,h=canvas.clientHeight,dpr=window.devicePixelRatio||1;canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);const items=store.get('routine',defaultRoutine);const done=store.get('checks_'+dateKey(),[]).length;const pct=items.length?done/items.length:0;const styles=getComputedStyle(document.documentElement),sage=styles.getPropertyValue('--sage').trim(),line=styles.getPropertyValue('--line').trim(),muted=styles.getPropertyValue('--muted').trim();ctx.clearRect(0,0,w,h);const x=26,y=24,bw=w-52,bh=26;ctx.fillStyle=line;roundRect(ctx,x,y,bw,bh,13);ctx.fill();ctx.fillStyle=sage;roundRect(ctx,x,y,bw*pct,bh,13);ctx.fill();ctx.fillStyle=muted;ctx.font='12px DM Sans';ctx.fillText('Today',x,y+58);ctx.fillText(`${done} of ${items.length} steps`,x,y+80);ctx.fillStyle=sage;ctx.font='bold 28px Playfair Display';ctx.fillText(Math.round(pct*100)+'%',x+bw-58,y+83)}
function roundRect(ctx,x,y,w,h,r){if(w<=0)return;ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
initDashboard();window.addEventListener('resize',drawChart);
