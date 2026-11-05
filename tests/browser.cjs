const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
 const browser = await chromium.launch({headless:true});
 let checks=0;
 try {
  const page = await browser.newPage();
  const button=(id,attrs='')=>`<div data-scb-marker="1"><button id="${id}" data-scb-copy-button="1" data-scb-copied-label="Copied!" data-scb-error-label="Failed" ${attrs}><span class="scb-copy-label">Copy</span></button></div>`;
  async function setup(html,mode='text') {
   await page.goto('about:blank');
   await page.setContent(`<main class="scb-content-scope">${html}</main>`);
   await page.evaluate(mode=>{
    window.copied=[];
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:mode==='fallback'?undefined:{writeText:async v=>{if(mode==='error')throw Error('denied');window.copied.push(v);},write:async items=>{window.copied.push(await items[0].getType('text/html').then(b=>b.text()));}}});
    window.ClipboardItem=class {constructor(data){this.data=data;}async getType(type){return this.data[type];}};
    document.execCommand=()=>{window.copied.push(document.querySelector('textarea').value);return true;};
   },mode);
   await page.addScriptTag({path:path.resolve('simple-copy-button/assets/simple-copy-button.js')});
  }
  async function copy(id){await page.click('#'+id);await page.waitForFunction(id=>document.querySelector('#'+id+' .scb-copy-label').textContent!=='Copy',id);return page.evaluate(()=>window.copied.at(-1));}
  const check=(actual,expected)=>{assert.equal(actual,expected);checks++;};
  await setup('<h1 class="entry-title">Title</h1><p>First</p>'+button('a')+'<p>Second</p>'+button('b'));
  check(await copy('a'),'First');check(await copy('b'),'Second');
  await setup('<h1 class="page-title">Title</h1><p>Body</p>'+button('a','data-scb-include-title="1"'));
  check(await copy('a'),'Title\nBody');
  await setup('<p>Ignore</p><span data-scb-marker="1"></span><p>Keep</p>'+button('a'));
  check(await copy('a'),'Keep');
  await setup('<p>Keep</p><p class="omit">Skip</p><script type="text/plain">Script</script><style>.x{color:red}</style>'+button('a','data-scb-exclude=".omit"'));
  check(await copy('a'),'Keep');
  await setup('<p><strong>Rich</strong></p>'+button('a','data-scb-format="html"'));
  check(await copy('a'),'<p><strong>Rich</strong></p>');
  await setup('<p>Text</p>'+button('a'),'error');await copy('a');check(await page.textContent('#a .scb-copy-label'),'Failed');
  await setup(button('a'));await copy('a');check(await page.textContent('#a .scb-copy-label'),'Failed');
  await setup('<p>Legacy</p>'+button('a'),'fallback');check(await copy('a'),'Legacy');check(await page.locator('textarea').count(),0);
  await setup('<p>Valid</p>'+button('a','data-scb-exclude="["'));check(await copy('a'),'Valid');
  console.log(`${checks} browser checks passed`);
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
