import { chromium } from 'playwright';
const FILE='file:///C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/cost-new-style.html';
const OUT='C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/shots';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1512,height:850},deviceScaleFactor:1});
await p.goto(FILE,{waitUntil:'networkidle'});await p.waitForTimeout(700);
const waits=[1100,1400,2200,1300,1400,3000,1300,900,800,800];
for(let i=0;i<10;i++){
  await p.waitForTimeout(waits[i]);
  await p.screenshot({path:`${OUT}/cost-${String(i).padStart(2,'0')}.png`});
  if(i<9)await p.keyboard.press('ArrowRight');
}
await b.close();console.log('done');
