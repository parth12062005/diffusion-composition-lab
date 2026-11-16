import {model,score} from './math.mjs';

export function scoreGrid(state,count=17,timeCount=25){
  const xs=Array.from({length:count},(_,i)=>-5+10*i/(count-1));
  const sample=t=>{
    const m=model({...state,t});
    return xs.map(x=>({x,t,combined:score(x,m.noisyA)+m.weight*score(x,m.noisyB),correct:m.required?score(x,m.required):null}));
  };
  const rows=Array.from({length:timeCount},(_,j)=>sample(j/(timeCount-1)));
  const slice=sample(state.t),gaps=slice.filter(p=>p.correct!==null).map(p=>Math.abs(p.combined-p.correct));
  return {xs,rows,slice,meanGap:gaps.length?gaps.reduce((a,b)=>a+b,0)/gaps.length:null,maxGap:gaps.length?Math.max(...gaps):null};
}

export function drawScoreMesh(canvas,state,view){
  const grid=scoreGrid(state,view.count),rect=canvas.getBoundingClientRect();
  const width=Math.max(300,rect.width),height=Math.max(300,rect.height),dpr=globalThis.devicePixelRatio||1;
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  const ctx=canvas.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,width,height);ctx.fillStyle='#fbfaf7';ctx.fillRect(0,0,width,height);
  const kinds=[];
  if(view.combined)kinds.push({key:'combined',color:'#7052b5',fill:'#7052b50b'});
  if(view.correct&&grid.rows[0][0].correct!==null)kinds.push({key:'correct',color:'#182b42',fill:'#182b4208'});
  const maximum=Math.max(1,...grid.rows.flatMap(row=>row.flatMap(p=>[Math.abs(p.combined),Math.abs(p.correct??0)])))*1.08;
  const raw=(x,t,s)=>{
    const xx=x/5,tt=2*t-1,zz=s/maximum;
    const horizontal=xx*Math.cos(view.yaw)-tt*Math.sin(view.yaw);
    const depth=xx*Math.sin(view.yaw)+tt*Math.cos(view.yaw);
    return {x:horizontal,y:-zz*Math.cos(view.pitch)-depth*Math.sin(view.pitch),depth:depth*Math.cos(view.pitch)-zz*Math.sin(view.pitch)};
  };
  const corners=[-5,5].flatMap(x=>[0,1].flatMap(t=>[-maximum,maximum].map(s=>raw(x,t,s))));
  const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x)),minY=Math.min(...corners.map(p=>p.y)),maxY=Math.max(...corners.map(p=>p.y));
  const scaleX=(width-104)/(maxX-minX),scaleY=(height-100)/(maxY-minY);
  const project=(x,t,s)=>{const p=raw(x,t,s);return {...p,x:width/2+(p.x-(minX+maxX)/2)*scaleX,y:height/2+(p.y-(minY+maxY)/2)*scaleY};};
  const line=(points,color,lineWidth=1,dash=[])=>{
    ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.setLineDash(dash);ctx.beginPath();
    points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);
  };
  const label=(str,p,dx=0,dy=0,color='#56677a')=>{ctx.fillStyle=color;ctx.font='11px Arial';ctx.textAlign='center';ctx.fillText(str,p.x+dx,p.y+dy);};

  // A quiet floor grid gives the mesh a spatial frame.
  for(const x of [-5,-2.5,0,2.5,5])line([project(x,0,-maximum),project(x,1,-maximum)],'#d9dcd9');
  for(const t of [0,.25,.5,.75,1])line([project(-5,t,-maximum),project(5,t,-maximum)],'#d9dcd9');
  line([project(-5,0,-maximum),project(5,0,-maximum)],'#94a0aa');
  line([project(5,0,-maximum),project(5,1,-maximum)],'#94a0aa');
  line([project(-5,0,-maximum),project(-5,0,maximum)],'#94a0aa');
  for(const x of [-5,0,5])label(String(x),project(x,0,-maximum),0,19);
  for(const t of [0,.5,1])label(t.toFixed(1),project(5,t,-maximum),20,4);
  label('x',project(5,0,-maximum),20,13);
  label('noise t',project(5,1,-maximum),18,-15);
  label('score s(x,t)',project(-5,0,maximum),22,-17);
  label(maximum.toFixed(1),project(-5,0,maximum),-20,5);
  label((-maximum).toFixed(1),project(-5,0,-maximum),-20,5);

  const faces=[],paths=[];
  for(const kind of kinds){
    const points=grid.rows.map(row=>row.map(p=>project(p.x,p.t,p[kind.key])));
    for(let j=0;j<points.length-1;j++)for(let i=0;i<points[j].length-1;i++){
      const corners=[points[j][i],points[j][i+1],points[j+1][i+1],points[j+1][i]];
      faces.push({points:corners,fill:kind.fill,depth:corners.reduce((s,p)=>s+p.depth,0)/4});
    }
    for(let i=0;i<grid.xs.length;i++)paths.push({points:points.map(row=>row[i]),color:kind.color,width:1.2});
    for(let j=0;j<points.length;j+=2)paths.push({points:points[j],color:kind.color,width:.7});
  }
  faces.sort((a,b)=>b.depth-a.depth).forEach(face=>{
    ctx.fillStyle=face.fill;ctx.beginPath();face.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
  });
  paths.sort((a,b)=>b.points[0].depth-a.points[0].depth).forEach(path=>line(path.points,path.color,path.width));

  // Thicker cross-sections mark the selected noise level on both surfaces.
  if(kinds.length===2)for(let i=0;i<grid.slice.length;i+=2){
    const p=grid.slice[i];line([project(p.x,p.t,p.combined),project(p.x,p.t,p.correct)],'#d45a4265',1,[3,3]);
  }
  for(const kind of kinds){
    line(grid.slice.map(p=>project(p.x,p.t,p[kind.key])),kind.color,3.2);
    for(const point of grid.slice){const p=project(point.x,point.t,point[kind.key]);ctx.fillStyle=kind.color;ctx.beginPath();ctx.arc(p.x,p.y,2.2,0,Math.PI*2);ctx.fill();}
  }
  ctx.fillStyle='#56677a';ctx.font='12px Arial';ctx.textAlign='left';ctx.fillText(`Selected t = ${state.t.toFixed(2)}`,16,24);
  if(!kinds.length)label('Choose a surface to display',{x:width/2,y:height/2});
  return grid;
}
