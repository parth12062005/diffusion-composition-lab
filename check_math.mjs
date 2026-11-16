import assert from 'node:assert/strict';
import {normal,score,model,combine,seededRandom,gaussianRandom,moments} from './dist/math.mjs';
const base={mA:-2,vA:1,mB:2,vB:1,t:0.5,x:1,mode:'and',alpha:0.5};
const close=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);

// Check the worked example independently of the plotting code.
const board=model(base);
close(board.current.mean,0);close(board.current.variance,0.5);
close(board.required.variance,0.875);
close(score(1,board.current),-2);close(score(1,board.required),-8/7);
for(const t of [0,0.2,0.5,0.9,1])close(model({...base,t}).current.variance,0.5);

// Check product and ratio scores against a numerical derivative of log density.
for(const weight of [1,-0.25,-0.5]){
  const A={mean:-1,variance:0.7},B={mean:2,variance:1.6},C=combine(A,B,weight);
  assert.ok(C);
  for(const x of [-2,0,1.5]){
    const logDensity=x=>Math.log(normal(x,A.mean,A.variance))+weight*Math.log(normal(x,B.mean,B.variance));
    const numerical=(logDensity(x+1e-5)-logDensity(x-1e-5))/2e-5;
    close(score(x,C),numerical,1e-7);
  }
}
const unequal=model({...base,vA:0.45,vB:2.5});
assert.ok(Math.abs(unequal.current.variance-unequal.required.variance)>0.1);
const clean=model({...base,vA:0.45,vB:2.5,t:0});
close(clean.current.mean,clean.required.mean);close(clean.current.variance,clean.required.variance);
assert.equal(model({...base,mode:'not',vA:3,vB:0.2}).clean,null);
close(model({...base,mode:'not',t:1}).current.variance,2);

// A Monte Carlo check catches drift/noise scaling errors in the Langevin update.
const rand=seededRandom(814),h=0.05;
let samples=Array.from({length:6000},()=>Math.sqrt(3)*gaussianRandom(rand));
for(let k=0;k<300;k++)samples=samples.map(x=>(1-h)*x+Math.sqrt(h)*gaussianRandom(rand));
close(moments(samples).variance,1/(2-h),0.03);
console.log('Passed: Gaussian example, score derivatives, clean endpoint, invalid ratio, high-noise initialization and Langevin variance.');
