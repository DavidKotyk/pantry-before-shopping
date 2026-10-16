import { chromium } from 'playwright';
import express from 'express';
import { resolve } from 'node:path';
import { writeFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';
const app=express();app.use(express.static(resolve('demo')));
const listener=app.listen(0,'127.0.0.1');await new Promise(r=>listener.once('listening',r));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
try{
  await page.goto(`http://127.0.0.1:${listener.address().port}/preview.html`);
  await page.locator('video').evaluate(async v=>{v.muted=true;await v.play();});
  await page.waitForFunction(()=>document.querySelector('video').currentTime>1);
  await page.locator('video').evaluate(v=>v.playbackRate=8);
  await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:30000});
  const meta=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,ended:v.ended,error:v.error?.message??null}));
  assert.ok(meta.duration>80 && meta.duration<180);assert.equal(meta.width,1440);assert.equal(meta.error,null);
  for(const second of [25,58,82]){
    await page.locator('video').evaluate(async(v,t)=>{v.pause();await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;});},second);
    await page.locator('video').screenshot({path:`docs/video-${second}.png`});
  }
  writeFileSync('docs/video-check.json',JSON.stringify({...meta,at:new Date().toISOString(),bytes:statSync('demo/pantry-before-shopping.webm').size,verification:'Entire video played to ended at 8x; frames captured at 25, 58 and 82 seconds.'},null,2));
  console.log(JSON.stringify(meta));
}finally{await browser.close();await new Promise(r=>listener.close(r));}
