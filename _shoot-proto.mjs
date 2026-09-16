import { chromium } from 'playwright';
const FILE='file:///C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/d1-decision-room.html';
const OUT='C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/shots';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1512,height:900},deviceScaleFactor:1});
await p.goto(FILE,{waitUntil:'networkidle'});await p.waitForTimeout(900);
const waits=[1300,1600,4200,1500,1500];
for(let i=0;i<5;i++){
  await p.waitForTimeout(waits[i]);
  await p.screenshot({path:`${OUT}/d1-beat-${i}.png`});
  if(i<4)await p.keyboard.press('ArrowRight');
}
// approved state
await p.click('#approveBtn');await p.waitForTimeout(900);
await p.screenshot({path:`${OUT}/d1-beat-4-approved.png`});
await b.close();console.log('done');
