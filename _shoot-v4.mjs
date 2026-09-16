import { chromium } from 'playwright';
const FILE='file:///C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/cost-v4-combo.html';
const OUT='C:/Users/ssutheesh/.copilot/session-state/abec0395-ec20-4911-aa9b-82fe2c76f5a3/files/proto/shots';
const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1512,height:850},deviceScaleFactor:1});
await p.goto(FILE,{waitUntil:'networkidle'});await p.waitForTimeout(700);
const waits=[1100,1400,1500,1900,1100,900,900];
for(let i=0;i<7;i++){
  await p.waitForTimeout(waits[i]);
  await p.screenshot({path:`${OUT}/v4-${i}.png`});
  if(i<6)await p.keyboard.press('ArrowRight');
}
await b.close();console.log('done');
