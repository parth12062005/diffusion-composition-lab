import {normal, score, model, seededRandom, gaussianRandom, moments} from './math.mjs';

const $ = id => document.getElementById(id);
const palette = {ink:'#182b42', muted:'#74818d', teal:'#087f8c', coral:'#d45a42', violet:'#7052b5', grid:'#e2e3df', paper:'#f7f5ef'};
const initial = {mA:-2,vA:1,mB:2,vB:1,t:0.5,x:1,mode:'and',alpha:0.5};
const state = {...initial};
const fmt = (v,n=3)=>Number.isFinite(v)?v.toFixed(n):'Undefined';
let noisePlaying = false, samplePlaying = false, noiseDirection = 1, lastFrame = 0;
let particles = [], sampleSteps = 0, random = seededRandom(814);

function chart(canvas, xRange=[-7,7], yRange=[0,1]) {
  const rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  const width = Math.max(260,rect.width), height = Math.max(180,rect.height);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);
  const bounds={left:43,right:width-13,top:14,bottom:height-27};
  const X=x=>bounds.left+(x-xRange[0])/(xRange[1]-xRange[0])*(bounds.right-bounds.left);
  const Y=y=>bounds.bottom-(y-yRange[0])/(yRange[1]-yRange[0])*(bounds.bottom-bounds.top);
  ctx.font='10px Arial';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){
    const y=yRange[0]+i*(yRange[1]-yRange[0])/4, py=Y(y);
    ctx.strokeStyle=palette.grid;ctx.beginPath();ctx.moveTo(bounds.left,py);ctx.lineTo(bounds.right,py);ctx.stroke();
    ctx.fillStyle=palette.muted;ctx.textAlign='right';ctx.fillText(Math.abs(y)<.0001?'0':Math.abs(y)<1?y.toFixed(2):y.toFixed(1),bounds.left-8,py+3);
  }
  for(let x=Math.ceil(xRange[0]/2)*2;x<=xRange[1];x+=2){ctx.fillStyle=palette.muted;ctx.textAlign='center';ctx.fillText(x,X(x),height-7);}
  ctx.fillStyle=palette.muted;ctx.textAlign='right';ctx.fillText('x',width-2,height-7);
  return {ctx,width,height,bounds,X,Y,xRange,yRange};
}
function curve(c,fn,color,dashed=false,width=2.4){
  const {ctx,bounds,X,Y,xRange}=c;
  ctx.save();ctx.beginPath();ctx.rect(bounds.left,bounds.top,bounds.right-bounds.left,bounds.bottom-bounds.top);ctx.clip();
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dashed?[6,5]:[]);ctx.beginPath();
  for(let i=0;i<=420;i++){const x=xRange[0]+i/420*(xRange[1]-xRange[0]),y=fn(x);if(i===0)ctx.moveTo(X(x),Y(y));else ctx.lineTo(X(x),Y(y));}ctx.stroke();ctx.restore();
}
function probe(c,x,functions){
  const {ctx,X,Y,bounds}=c;ctx.strokeStyle='#aab0b4';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(X(x),bounds.top);ctx.lineTo(X(x),bounds.bottom);ctx.stroke();ctx.setLineDash([]);
  for(const [fn,color] of functions){const y=Y(fn(x));if(y<bounds.top||y>bounds.bottom)continue;ctx.fillStyle=color;ctx.strokeStyle=palette.paper;ctx.lineWidth=2;ctx.beginPath();ctx.arc(X(x),y,4.5,0,Math.PI*2);ctx.fill();ctx.stroke();}
}
function renderPlots(m){
  const densities=[[x=>normal(x,m.noisyA.mean,m.noisyA.variance),palette.teal],[x=>normal(x,m.noisyB.mean,m.noisyB.variance),palette.coral]];
  if(m.current)densities.push([x=>normal(x,m.current.mean,m.current.variance),palette.violet]);
  if(m.required)densities.push([x=>normal(x,m.required.mean,m.required.variance),palette.ink,true]);
  const peak=Math.max(...[m.noisyA,m.noisyB,m.current,m.required].filter(Boolean).map(g=>normal(g.mean,g.mean,g.variance)));
  const d=chart($('density-plot'),[-7,7],[0,peak*1.16]);densities.forEach(([fn,color,dash])=>curve(d,fn,color,dash));probe(d,state.x,densities);
  const fA=x=>score(x,m.noisyA), fB=x=>score(x,m.noisyB), fC=x=>fA(x)+m.weight*fB(x);
  const functions=[[fA,palette.teal],[fB,palette.coral],[fC,palette.violet]];
  if(m.required)functions.push([x=>score(x,m.required),palette.ink,true]);
  const limit=Math.max(4,Math.abs(fA(state.x))*1.25,Math.abs(fB(state.x))*1.25,Math.abs(fC(state.x))*1.25,m.required?Math.abs(score(state.x,m.required))*1.25:0);
  const s=chart($('score-plot'),[-7,7],[-limit,limit]);functions.forEach(([fn,color,dash])=>curve(s,fn,color,dash));probe(s,state.x,functions);
}
function renderLab(){
  const m=model(state);
  for(const key of ['mA','vA','mB','vB','alpha']){$(key).value=state[key];$(key+'-out').value=fmt(state[key],key.startsWith('m')?1:2);}
  $('noise').value=state.t;$('noise-out').value=fmt(state.t,2);$('probe').value=state.x;$('probe-out').value=fmt(state.x,2);
  $('signal-value').textContent='a = '+fmt(m.a,2);
  $('alpha-control').hidden=state.mode!=='not';
  document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===state.mode)));
  $('combined-score-label').textContent=state.mode==='and'?'sA + sB':'sA - alpha*sB';
  $('current-label').textContent=state.mode==='and'?'Product of noisy experts':'Ratio of noisy experts';
  $('required-label').textContent=state.mode==='and'?'Noised clean product':'Noised clean ratio';
  $('required-route-title').textContent=state.mode==='and'?'Multiply, then add noise':'Take the clean ratio, then add noise';
  $('route-title').textContent=state.mode==='and'?'Add noise, then multiply':'Add noise, then take the ratio';
  $('route-copy').textContent=state.mode==='and'?'Each expert learns its own noisy density. Adding their scores gives the score of their product at t.':'Subtracting alpha times B\'s noisy score gives the score of the ratio at t, provided it can be normalized.';
  const fA=score(state.x,m.noisyA),fB=score(state.x,m.noisyB);
  $('score-A').textContent=fmt(fA);$('score-B').textContent=fmt(fB);$('score-combined').textContent=fmt(fA+m.weight*fB);
  $('score-required').textContent=m.required?fmt(score(state.x,m.required)):'No clean target';
  $('required-moments').textContent=m.required?`Mean ${fmt(m.required.mean)} / variance ${fmt(m.required.variance)}`:'The clean ratio has no finite integral.';
  $('current-moments').textContent=m.current?`Mean ${fmt(m.current.mean)} / variance ${fmt(m.current.variance)}`:'This intermediate ratio has no finite integral.';
  $('target-warning').hidden=!!(m.clean&&m.current);
  $('target-warning').textContent=!m.clean?'For these settings, A AND NOT B has no normalizable clean Gaussian target. Its density ratio does not integrate to a finite value. Reduce alpha or change the variances.':!m.current?'The ratio at this noise level has no finite integral.':' ';
  let explanation;
  if(!m.clean)explanation='A formal score difference can exist even when there is no probability distribution to sample. The dashed target is therefore hidden.';
  else if(state.t<0.0001)explanation='At t = 0, both routes agree. Reverse diffusion also needs the correct scores at all the noisy levels on the way here.';
  else if(state.mode==='and'&&Math.abs(state.vA-1)<1e-8&&Math.abs(state.vB-1)<1e-8&&Math.abs(state.mA+state.mB)<1e-8)explanation='Special board example: the purple product stays Normal(0, 0.5) at every t. The dashed noised target changes. Try Unequal widths for a changing product.';
  else if(m.current&&Math.abs(m.current.variance-m.required.variance)<1e-5&&Math.abs(m.current.mean-m.required.mean)<1e-5)explanation='The routes happen to agree at this setting. Move the sliders to check whether they agree across the whole noise path.';
  else explanation=`At x = ${fmt(state.x,2)}, the combined score is ${fmt(fA+m.weight*fB)}, but ordinary reverse diffusion needs ${fmt(score(state.x,m.required))}. Both are scores of different intermediate densities.`;
  $('live-explanation').textContent=explanation;
  renderPlots(m);renderParticles();
}

function resetParticles(){random=seededRandom(814);particles=Array.from({length:512},()=>Math.sqrt(3)*gaussianRandom(random));sampleSteps=0;renderParticles();}
function canSample(){const m=model(state),h=Number($('step-size').value);return !!m.current&&h<4*m.current.variance;}
function advance(){
  const m=model(state),h=Number($('step-size').value);
  if(!canSample()){samplePlaying=false;updateSampleButton();return;}
  particles=particles.map(x=>x+0.5*h*score(x,m.current)+Math.sqrt(h)*gaussianRandom(random));sampleSteps++;renderParticles();
}
function renderParticles(){
  if(!particles.length)return;
  const m=model(state),h=Number($('step-size').value),stats=moments(particles),bins=42,min=-7,max=7,binWidth=(max-min)/bins;
  const counts=Array(bins).fill(0);particles.forEach(x=>{const i=Math.floor((x-min)/binWidth);if(i>=0&&i<bins)counts[i]++;});
  const peak=m.current?normal(m.current.mean,m.current.mean,m.current.variance):0;
  const c=chart($('particle-plot'),[min,max],[0,Math.max(0.6,peak*1.3,...counts.map(n=>n/particles.length/binWidth*1.12))]);
  c.ctx.fillStyle='#087f8c50';for(let i=0;i<bins;i++){const left=c.X(min+i*binWidth),top=c.Y(counts[i]/particles.length/binWidth);c.ctx.fillRect(left+1,top,Math.max(1,c.X(min+(i+1)*binWidth)-left-2),c.bounds.bottom-top);}
  if(m.current)curve(c,x=>normal(x,m.current.mean,m.current.variance),palette.violet,false,3);
  $('step-count').textContent=sampleSteps;$('sample-var').textContent=fmt(stats.variance);$('target-var').textContent=m.current?fmt(m.current.variance):'Undefined';
  $('step-size-out').value=fmt(h,3);
  const valid=canSample();$('sample-play').disabled=!valid;$('sample-step').disabled=!valid;
  $('sampler-status').textContent=!m.current?'Sampling paused: this ratio has no finite integral.':!valid?'Step size is too large for this Gaussian target. Reduce h.':`Holding t = ${fmt(state.t,2)} fixed. Target mean = ${fmt(m.current.mean)}. The initial particles have variance about 3.`;
  $('stationary-variance').textContent=valid?`For this Gaussian update, long-run variance = ${fmt(m.current.variance/(1-h/(4*m.current.variance)))}. The difference from ${fmt(m.current.variance)} is finite-step bias. If samples leave the plotted range, the histogram shows only those inside it.`:'';
  if(!valid){samplePlaying=false;updateSampleButton();}
}
function updateSampleButton(){$('sample-play').textContent=samplePlaying?'Pause Langevin':'Run Langevin';$('sample-play').setAttribute('aria-pressed',String(samplePlaying));}
function stopNoise(){noisePlaying=false;$('noise-play').textContent='Animate noise';$('noise-play').setAttribute('aria-pressed','false');}
function changed(){stopNoise();samplePlaying=false;updateSampleButton();resetParticles();renderLab();document.querySelectorAll('[data-preset]').forEach(b=>b.classList.remove('selected'));}
for(const key of ['mA','vA','mB','vB','alpha'])$(key).addEventListener('input',e=>{state[key]=Number(e.target.value);changed();});
$('noise').addEventListener('input',e=>{state.t=Number(e.target.value);changed();});
$('probe').addEventListener('input',e=>{state.x=Number(e.target.value);renderLab();});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;changed();}));
function preset(name){Object.assign(state,initial,name==='unequal'?{vA:0.45,vB:2.5,mA:-2,mB:1.5}:name==='shifted'?{vA:0.7,vB:1.6,mA:-1,mB:2.5}:{});changed();document.querySelector(`[data-preset="${name}"]`).classList.add('selected');}
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.preset)));
$('reset-lab').addEventListener('click',()=>preset('board'));
$('noise-play').addEventListener('click',()=>{noisePlaying=!noisePlaying;samplePlaying=false;updateSampleButton();noiseDirection=state.t>=0.999?-1:1;$('noise-play').textContent=noisePlaying?'Pause noise':'Animate noise';$('noise-play').setAttribute('aria-pressed',String(noisePlaying));});
$('sample-play').addEventListener('click',()=>{stopNoise();samplePlaying=!samplePlaying;updateSampleButton();});
$('sample-step').addEventListener('click',()=>{stopNoise();samplePlaying=false;updateSampleButton();advance();});
$('sample-reset').addEventListener('click',()=>{samplePlaying=false;updateSampleButton();resetParticles();});
$('step-size').addEventListener('input',()=>{samplePlaying=false;updateSampleButton();resetParticles();});
for(const id of ['density-plot','score-plot']){
  const c=$(id);let dragging=false;
  const move=e=>{const r=c.getBoundingClientRect();state.x=Math.max(-7,Math.min(7,-7+(e.clientX-r.left-43)/(r.width-56)*14));renderLab();};
  c.addEventListener('pointerdown',e=>{dragging=true;c.setPointerCapture(e.pointerId);move(e);});
  c.addEventListener('pointermove',e=>{if(dragging)move(e);});c.addEventListener('pointerup',()=>dragging=false);c.addEventListener('pointercancel',()=>dragging=false);
}
function frame(now){
  if(now-lastFrame>45){
    const delta=lastFrame?Math.min(now-lastFrame,100):45;lastFrame=now;
    if(noisePlaying&&!document.hidden){state.t+=noiseDirection*delta/9000;if(state.t>=1){state.t=1;noiseDirection=-1;}if(state.t<=0){state.t=0;noiseDirection=1;}renderLab();}
    if(samplePlaying&&!document.hidden)advance();
  }
  requestAnimationFrame(frame);
}

// Result images and measurements stay in memory until explicitly exported.
const slotLabels=['Expert A alone: 0 and 1','Expert B alone: 1 and 6','AND: reverse diffusion','AND: annealed Langevin','NOT: reverse diffusion','NOT: annealed Langevin'];
const images=Array(6).fill(null);
slotLabels.forEach((label,i)=>{
  const container=document.createElement('div');container.className='result-slot';
  const h=document.createElement('h4');h.textContent=label;
  const frame=document.createElement('label');frame.className='upload-frame';frame.htmlFor='result-image-'+i;frame.id='result-frame-'+i;
  const input=document.createElement('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.id='result-image-'+i;
  const remove=document.createElement('button');remove.type='button';remove.className='remove-image';remove.textContent='Remove image';remove.hidden=true;remove.id='remove-'+i;
  input.addEventListener('change',async()=>{
    const file=input.files?.[0];if(!file)return;
    if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024){$('results-status').textContent='Choose a PNG, JPEG or WebP image up to 4 MB.';input.value='';return;}
    const reader=new FileReader();reader.onload=()=>{images[i]=String(reader.result);renderResultImage(i);$('results-status').textContent='Image added in this tab. Export results to save your work.';};reader.onerror=()=>{$('results-status').textContent='The image could not be read. Try another file.';};reader.readAsDataURL(file);
  });
  remove.addEventListener('click',()=>{images[i]=null;input.value='';renderResultImage(i);});
  container.append(h,frame,input,remove);$('result-grids').append(container);renderResultImage(i);
});
function renderResultImage(i){
  const target=$('result-frame-'+i);target.replaceChildren();
  if(images[i]){const img=document.createElement('img');img.src=images[i];img.alt=slotLabels[i]+' experimental sample grid';target.append(img);}else{const strong=document.createElement('strong');strong.textContent='Results pending';const span=document.createElement('span');span.textContent='Click to add your sample grid';target.append(strong,span);}
  $('remove-'+i).hidden=!images[i];
}
const metricLabels=['Target digit (%)','Outside A: not 0 or 1 (%)','Unreadable, manual (%)','Sampling time (s)','Expert evaluations'];
metricLabels.forEach((label,r)=>{const tr=document.createElement('tr');const th=document.createElement('th');th.scope='row';th.textContent=label;tr.append(th);for(let c=0;c<4;c++){const td=document.createElement('td'),input=document.createElement('input');input.placeholder='Pending';input.id=`metric-${r}-${c}`;input.setAttribute('aria-label',`${label}, ${['AND reverse','AND Langevin','NOT reverse','NOT Langevin'][c]}`);input.inputMode='decimal';td.append(input);tr.append(td);}$('results-table').querySelector('tbody').append(tr);});
function collectResults(){return {format:'diffusion-composition-results-v1',images,metrics:metricLabels.map((_,r)=>Array.from({length:4},(_,c)=>$(`metric-${r}-${c}`).value)),N:$('run-N').value,alpha:$('run-alpha').value,seeds:$('run-seeds').value,findings:$('findings').value};}
$('export-results').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(collectResults(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='diffusion-experiment-results.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('results-status').textContent='Results exported. Import this JSON file to restore images and measurements.';});
$('import-results').addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{
    if(file.size>40*1024*1024)throw Error('File too large.');
    const data=JSON.parse(await file.text());
    if(data.format!=='diffusion-composition-results-v1'||!Array.isArray(data.images)||data.images.length!==6||!Array.isArray(data.metrics)||data.metrics.length!==5||data.metrics.some(r=>!Array.isArray(r)||r.length!==4))throw Error('This is not an exported results file.');
    if(data.images.some(v=>v!==null&&(typeof v!=='string'||v.length>6*1024*1024||!/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=\r\n]+$/.test(v))))throw Error('An image has an unsupported format.');
    if(data.metrics.some(r=>r.some(v=>typeof v!=='string'||v.length>100)))throw Error('Invalid measurement values.');
    for(const k of ['N','alpha','seeds','findings'])if(typeof data[k]!=='string'||data[k].length>20000)throw Error('Invalid results text.');
    data.images.forEach((v,i)=>{images[i]=v;renderResultImage(i);});
    data.metrics.forEach((row,r)=>row.forEach((v,c)=>{$(`metric-${r}-${c}`).value=v;}));
    $('run-N').value=data.N;$('run-alpha').value=data.alpha;$('run-seeds').value=data.seeds;$('findings').value=data.findings;
    $('results-status').textContent='Your result images and measurements are restored in this tab.';
  }catch(error){$('results-status').textContent='Could not import: '+error.message;}finally{e.target.value='';}
});

const chapters=Array.from(document.querySelectorAll('.chapter'));
const scripts={
 intro:'Krishiv: We study how to reuse diffusion experts after training. A learns zeros and ones, and B learns ones and sixes. We compare AND and A AND NOT B. First, the Gaussian lab lets us inspect the mathematical issue without neural network errors.',
 lab:'Krishiv: At a fixed noise level, move the probe point and read both expert scores. Their sum is the score of the product of noisy experts. The dashed curve instead comes from noising the clean product. In the board example, at t = 0.5 their variances are 0.5 and 0.875. Try unequal widths to see a changing product. NOT subtracts a scaled B score, but some ratios have no finite integral.',
 sampling:'Krishiv: Here we hold t fixed. Each Langevin update combines attraction by the score with fresh random noise. Watch the histogram approach the target. Smaller step sizes reduce discretization bias but can take longer to explore. The board example has a constant target across t, so it needs no annealing. Parth will now explain our image experiment.',
 mnist:'Parth: A learns digits zero and one. B learns one and six. AND should favour their shared digit one. A AND NOT B should suppress one and favour zero. These are hypotheses. We will insert real sample grids, compare samplers at a matched expert-evaluation budget, and report quality, class rates and runtime. We must also keep failures and distorted images.',
 wrap:'Parth: Our exact Gaussian example explains the mismatch. MNIST tests its practical effect with learned scores. The same expert networks remain frozen throughout the comparison. We will state what improved, what failed and what it cost after the results arrive. Thank you.'
};
let presenting=false,active=0,currentChapter=chapters[0];
function showChapter(i){active=Math.max(0,Math.min(chapters.length-1,i));chapters.forEach((s,j)=>s.classList.toggle('active-chapter',j===active));currentChapter=chapters[active];$('section-counter').textContent=`${active+1} / ${chapters.length}`;$('previous-section').disabled=active===0;$('next-section').disabled=active===chapters.length-1;window.scrollTo({top:0,behavior:'instant'});updateNotes();requestAnimationFrame(()=>{renderLab();renderParticles();});}
function togglePresent(){presenting=!presenting;document.body.classList.toggle('presenting',presenting);$('present').textContent=presenting?'Exit presentation':'Present';$('presentation-controls').hidden=!presenting;if(presenting){active=Math.max(0,chapters.indexOf(currentChapter));showChapter(active);}else{chapters[active].scrollIntoView();requestAnimationFrame(renderLab);}}
$('present').addEventListener('click',togglePresent);$('previous-section').addEventListener('click',()=>showChapter(active-1));$('next-section').addEventListener('click',()=>showChapter(active+1));
document.addEventListener('keydown',e=>{if(!presenting||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();showChapter(active+1);}if(e.key==='ArrowLeft'){e.preventDefault();showChapter(active-1);}if(e.key==='Escape'){togglePresent();}});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{if(!presenting)return;const i=chapters.findIndex(s=>'#'+s.id===a.getAttribute('href'));if(i>=0){e.preventDefault();showChapter(i);}}));
function updateNotes(){$('notes-title').textContent=currentChapter.dataset.speaker+' / '+currentChapter.querySelector('h1,h2').textContent;$('notes-body').textContent=scripts[currentChapter.id];}
$('notes-toggle').addEventListener('click',()=>{$('notes-panel').hidden=!$('notes-panel').hidden;$('notes-toggle').setAttribute('aria-expanded',String(!$('notes-panel').hidden));updateNotes();});
$('notes-close').addEventListener('click',()=>{$('notes-panel').hidden=true;$('notes-toggle').setAttribute('aria-expanded','false');});
const observer=new IntersectionObserver(entries=>{if(presenting)return;const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible[0]){currentChapter=visible[0].target;updateNotes();}},{rootMargin:'-15% 0px -40% 0px',threshold:[0,.1,.3]});chapters.forEach(s=>observer.observe(s));
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{renderLab();renderParticles();},120);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopNoise();samplePlaying=false;updateSampleButton();}});
resetParticles();renderLab();updateNotes();requestAnimationFrame(frame);
