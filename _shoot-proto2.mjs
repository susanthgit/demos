import { chromium } from 'playwright';
const FILE='file:///C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/d2-control-room.html';
const OUT='C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/shots';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1512,height:900},deviceScaleFactor:1});
await p.goto(FILE,{waitUntil:'networkidle'});await p.waitForTimeout(900);
const waits=[1200,1500,1700,4200,1500,1500];
for(let i=0;i<6;i++){
  await p.waitForTimeout(waits[i]);
  await p.screenshot({path:`${OUT}/d2-beat-${i}.png`});
  if(i<5)await p.keyboard.press('ArrowRight');
}
await p.click('#approveG');await p.waitForTimeout(800);
await p.screenshot({path:`${OUT}/d2-beat-5-approved.png`});
await b.close();console.log('done');
