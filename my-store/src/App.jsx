import { db } from './firebaseConfig';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ── FONT ── */
{
  const fl=document.createElement("link");
  fl.rel="stylesheet";
  fl.href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(fl);
}

/* ── GLOBAL CSS ── */
{
  const gs=document.createElement("style");
  gs.textContent=`
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;font-family:'Poppins',sans-serif;-webkit-tap-highlight-color:transparent;overflow-x:hidden}
:root{
  --bg:#f5f4f0;--sf:#fff;--sf2:#eeece8;--bd:#e2dfd8;
  --tx:#18160f;--tx2:#6a6358;--tx3:#aca59b;
  --ac:#2d6a4f;--ac2:#40916c;--acl:#d8f3dc;--acd:#b7e4c7;
  --dn:#c0392b;--dnl:#fdecea;
  --wn:#c87800;--wnl:#fff3cd;
  --in:#1a6db5;--inl:#e3f0fd;
  --r:14px;--rs:9px;
  --sh:0 1px 8px rgba(0,0,0,.07);--shlg:0 8px 32px rgba(0,0,0,.13)
}
.dark{
  --bg:#111109;--sf:#1c1b17;--sf2:#252420;--bd:#333028;
  --tx:#f0ede6;--tx2:#a09890;--tx3:#6a6358;
  --ac:#52b788;--ac2:#74c69d;--acl:#1a3d2b;--acd:#2d6a4f;
  --dn:#e05252;--dnl:#2d1212;
  --wn:#f0a500;--wnl:#2a1e00;
  --in:#56adf5;--inl:#0d1e33;
  --sh:0 1px 8px rgba(0,0,0,.3);--shlg:0 8px 32px rgba(0,0,0,.5)
}
.app-root{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--tx);
  display:flex;flex-direction:column;min-height:100vh;transition:background .25s,color .25s}
input,select,textarea,button{font-family:'Poppins',sans-serif}
button{cursor:pointer;transition:all .18s;border:none;background:none}
button:active{transform:scale(.97)}
input,select,textarea{
  background:var(--sf2);border:1.5px solid var(--bd);border-radius:var(--rs);
  color:var(--tx);padding:11px 14px;width:100%;font-size:14px;outline:none;
  transition:border .18s,box-shadow .18s;-webkit-appearance:none;appearance:none}
input:focus,select:focus,textarea:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--acl)}
input[type=checkbox]{width:18px;height:18px;accent-color:var(--ac);cursor:pointer;flex-shrink:0}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--bd);border-radius:4px}
.no-scrollbar{scrollbar-width:none;-ms-overflow-style:none}
.no-scrollbar::-webkit-scrollbar{display:none}
/* Horizontal pill-row scrollbar */
.hscroll{overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:var(--bd) transparent}
.hscroll::-webkit-scrollbar{height:3px}
.hscroll::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;
  padding:11px 20px;border-radius:var(--rs);font-size:14px;font-weight:600;
  cursor:pointer;transition:all .18s;white-space:nowrap;border:none}
.bp{background:var(--ac);color:#fff}.bp:hover{background:var(--ac2)}
.bg2{background:transparent;color:var(--tx2);border:1.5px solid var(--bd)}.bg2:hover{background:var(--sf2)}
.bd2{background:var(--dnl);color:var(--dn);border:1.5px solid var(--dn)}.bd2:hover{background:var(--dn);color:#fff}
.bsm{padding:7px 13px;font-size:13px;border-radius:7px}
.blg{padding:14px 28px;font-size:15px;border-radius:var(--r)}

.card{background:var(--sf);border-radius:var(--r);border:1.5px solid var(--bd);box-shadow:var(--sh)}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
.bg-g{background:var(--acl);color:var(--ac)}
.bg-r{background:var(--dnl);color:var(--dn)}
.bg-y{background:var(--wnl);color:var(--wn)}
.bg-b{background:var(--inl);color:var(--in)}

.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.52);z-index:200;
  display:flex;align-items:flex-end;justify-content:center;padding:0;backdrop-filter:blur(3px)}
@media(min-width:600px){.backdrop{align-items:center;padding:16px}}
.msheet{background:var(--sf);width:100%;max-width:560px;
  border-radius:24px 24px 0 0;max-height:92vh;overflow-y:auto;
  box-shadow:var(--shlg);animation:shUp .22s ease;padding:24px 20px 32px}
@media(min-width:600px){.msheet{border-radius:var(--r);max-height:88vh;padding:28px}}
.mlg{max-width:680px}
@keyframes shUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.shandle{width:40px;height:4px;background:var(--bd);border-radius:4px;margin:0 auto 18px}

.fg{margin-bottom:15px}
.fg label{display:block;font-size:13px;font-weight:600;color:var(--tx2);margin-bottom:6px}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:500px){.frow{grid-template-columns:1fr}}

/* ═══════════════════════════════════════════
   LAYOUT — Two-level scroll architecture
   ───────────────────────────────────────────
   Level 1: app-root (column, 100dvh, no overflow)
     ├─ .topbar  (mobile, flex-shrink:0, never scrolls)
     ├─ .mwrap   (flex row, flex:1, min-height:0 — fills remaining space)
     │   ├─ .sidebar  (desktop, fixed width, own scroll)
     │   └─ .pbody    (flex:1 — NOT a scroll container; just a size anchor)
     │       └─ .pg-page  (flex column, height:100% of pbody)
     │           ├─ .pg-hdr   (flex-shrink:0 — never scrolls, always visible)
     │           └─ .pg-body  (flex:1, overflow-y:auto — THE scroll region)
     └─ .botnav  (mobile, fixed, never in flow)

   KEY INSIGHT: .pbody does NOT scroll. Each page component is a flex column
   that fills .pbody exactly. The header (pg-hdr) is flex-shrink:0 so it keeps
   its natural height. The body (pg-body) is flex:1 + overflow-y:auto so it
   takes ALL remaining space and scrolls within it. The scrollbar appears only
   in the content area — never behind or over the header. No sticky, no z-index
   tricks, no box-shadow masking needed.
═══════════════════════════════════════════ */

.mwrap{display:flex;flex:1;min-height:0;overflow:hidden}
.sidebar{width:220px;background:var(--sf);border-right:1.5px solid var(--bd);
  display:flex;flex-direction:column;padding:16px 10px;flex-shrink:0;overflow-y:auto;
  height:100%;z-index:50}
@media(max-width:768px){.sidebar{display:none}}

/* pbody: size anchor only — does NOT scroll */
.pbody{flex:1;overflow:hidden;min-width:0;height:100%;display:flex;flex-direction:column}

/* pg-page: fills pbody, flex column — header + body */
.pg-page{display:flex;flex-direction:column;flex:1;min-height:0;height:100%}

/* pg-hdr: never scrolls, always on top, solid background */
.pg-hdr{
  flex-shrink:0;
  background:var(--sf);
  padding:18px 24px 14px;
  border-bottom:1.5px solid var(--bd);
  box-shadow:0 2px 8px rgba(0,0,0,.08);
  z-index:10;
  transition:background .25s}
@media(max-width:768px){.pg-hdr{padding:14px 16px 12px}}

/* pg-body: THE scroll container — all page content lives here */
.pg-body{
  flex:1;
  overflow-y:auto;
  overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  padding:24px;
  background:var(--bg);
  min-height:0}
@media(max-width:768px){.pg-body{padding:16px;padding-bottom:88px}}

.topbar{display:none;align-items:center;justify-content:space-between;
  padding:13px 18px;background:var(--sf);border-bottom:1.5px solid var(--bd);
  z-index:100;gap:8px;flex-shrink:0}
@media(max-width:768px){.topbar{display:flex}}

.botnav{display:none;position:fixed;bottom:0;left:0;right:0;
  background:var(--sf);border-top:1.5px solid var(--bd);
  z-index:100;padding:4px 0 max(4px,env(safe-area-inset-bottom))}
@media(max-width:768px){.botnav{display:flex}}
.ntab{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:6px 4px;font-size:10px;font-weight:600;color:var(--tx3);background:none;border:none;border-radius:0}
.ntab.on{color:var(--ac)}
.ntab span{font-size:22px;line-height:1}
.siditem{display:flex;align-items:center;gap:11px;padding:11px 12px;
  border-radius:10px;cursor:pointer;transition:all .18s;
  color:var(--tx2);font-size:14px;font-weight:500;margin-bottom:2px}
.siditem:hover{background:var(--sf2);color:var(--tx)}
.siditem.on{background:var(--acl);color:var(--ac)}

.pin-dot{width:13px;height:13px;border-radius:50%;border:2px solid var(--ac);
  margin:0 5px;transition:background .18s}
.pin-dot.on{background:var(--ac)}
.pin-key{width:68px;height:68px;border-radius:50%;font-size:22px;font-weight:700;
  background:var(--sf2);border:1.5px solid var(--bd);color:var(--tx)}
.pin-key:hover{background:var(--acl);border-color:var(--ac);color:var(--ac)}
@media(max-width:380px){.pin-key{width:58px;height:58px;font-size:19px}}

.toast{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:9999;
  background:var(--sf);border:1.5px solid var(--bd);border-radius:var(--r);
  padding:12px 20px;box-shadow:var(--shlg);font-size:14px;font-weight:500;
  display:flex;align-items:center;gap:9px;animation:toIn .28s ease;
  max-width:92vw;white-space:nowrap;pointer-events:none}
@keyframes toIn{from{transform:translateX(-50%) translateY(-12px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}

.pcard{background:var(--sf);border:1.5px solid var(--bd);border-radius:var(--r);
  padding:14px 10px;cursor:pointer;transition:all .18s;text-align:center;user-select:none}
.pcard:hover{border-color:var(--ac);background:var(--acl);transform:translateY(-1px)}
.pcard:active{transform:scale(.97)}

.twrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:var(--r)}
table{width:100%;border-collapse:collapse;font-size:14px;min-width:360px}
th{background:var(--sf2);color:var(--tx2);font-size:11px;font-weight:700;
  padding:10px 14px;text-align:left;text-transform:uppercase;letter-spacing:.6px;white-space:nowrap}
td{padding:12px 14px;border-bottom:1px solid var(--bd);vertical-align:middle;color:var(--tx)}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--sf2)}

/* sticky table header inside .card */
.sticky-th th{position:sticky;top:0;z-index:10;background:var(--sf2)}

.pw{background:var(--sf2);border-radius:20px;height:7px;overflow:hidden}
.pb{height:100%;border-radius:20px;background:var(--ac);transition:width .4s}
.sc{background:var(--sf);border-radius:var(--r);padding:18px 16px;border:1.5px solid var(--bd);box-shadow:var(--sh)}
.sn{font-size:26px;font-weight:800;line-height:1;margin-top:6px}
.sl{font-size:12px;color:var(--tx2);margin-top:3px;font-weight:500}

.rfont{font-family:'Courier New',monospace;font-size:13px;line-height:1.7}
@media print{body *{visibility:hidden}.printable,.printable *{visibility:visible}.printable{position:fixed;inset:0;padding:20px}}

.sbar{position:relative}
.sbar input{padding-left:40px;padding-right:36px}
.sbic{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--tx3);font-size:17px;pointer-events:none;z-index:1}
.sbar-x{position:absolute;right:9px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;color:var(--tx3);font-size:15px;
  width:24px;height:24px;display:flex;align-items:center;justify-content:center;
  border-radius:50%;padding:0;transition:all .15s}
.sbar-x:hover{background:var(--bd);color:var(--tx)}

.tabs{display:flex;border-bottom:2px solid var(--bd);margin-bottom:18px;overflow-x:auto;-webkit-overflow-scrolling:touch}
.tabs::-webkit-scrollbar{height:3px}
.tabs::-webkit-scrollbar-thumb{background:var(--bd);border-radius:3px}
.tabi{padding:10px 18px;cursor:pointer;font-size:14px;font-weight:600;
  color:var(--tx2);border-bottom:2.5px solid transparent;margin-bottom:-2px;
  transition:all .18s;white-space:nowrap}
.tabi.on{color:var(--ac);border-bottom-color:var(--ac)}

.crow{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--bd)}
.crow:last-child{border-bottom:none}
.qbtn{width:30px;height:30px;display:flex;align-items:center;justify-content:center;
  border-radius:7px;border:1.5px solid var(--bd);background:var(--sf2);
  font-size:16px;font-weight:700;color:var(--tx);cursor:pointer;transition:all .15s}
.qbtn:hover{border-color:var(--ac);color:var(--ac)}
.qbtn:active{background:var(--acl)}

.sdot{width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.sdot.off{background:var(--wn)!important;animation:none}

/* POS grid — desktop: side-by-side panels filling viewport below header
   The POS header is ~100px tall (approx). On mobile stack vertically. */
.pos-grid{display:grid;grid-template-columns:1fr 320px;gap:16px;
  min-height:calc(100vh - 200px)}
@media(max-width:1000px){.pos-grid{grid-template-columns:1fr 280px}}
@media(max-width:768px){.pos-grid{display:flex;flex-direction:column;height:auto;gap:14px}}

.cart-fab{display:none;position:fixed;bottom:72px;right:16px;z-index:150;
  width:56px;height:56px;border-radius:50%;background:var(--ac);color:#fff;
  font-size:24px;box-shadow:0 4px 18px rgba(0,0,0,.22);
  align-items:center;justify-content:center;flex-direction:column;gap:0;border:none;cursor:pointer}
.cart-fab:active{transform:scale(.93)}
@media(max-width:768px){.cart-fab{display:flex}}
.cart-fab-badge{position:absolute;top:-5px;right:-5px;background:var(--dn);color:#fff;
  border-radius:50%;min-width:20px;height:20px;font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center;border:2px solid var(--sf);padding:0 3px}

.mob-cart-ov{display:none;position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:180}
.mob-cart-ov.open{display:block}
.mob-cart-drawer{position:fixed;bottom:0;left:0;right:0;z-index:190;
  background:var(--sf);border-radius:22px 22px 0 0;max-height:82vh;
  box-shadow:var(--shlg);padding:0 18px max(18px,env(safe-area-inset-bottom));
  display:flex;flex-direction:column;
  transform:translateY(100%);transition:transform .28s ease}
.mob-cart-drawer.open{transform:translateY(0)}

[data-tip]{position:relative}
[data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;
  transform:translateX(-50%);background:var(--tx);color:var(--sf);font-size:11px;font-weight:500;
  padding:4px 9px;border-radius:6px;white-space:nowrap;z-index:999;pointer-events:none;
  font-family:'Poppins',sans-serif;opacity:.95;box-shadow:0 2px 8px rgba(0,0,0,.18)}
[data-tip]:hover::before{content:"";position:absolute;bottom:calc(100% + 1px);left:50%;
  transform:translateX(-50%);border:5px solid transparent;border-top-color:var(--tx);z-index:999;pointer-events:none}

.login-wrap .fg label{text-align:left}
`;
  document.head.appendChild(gs);
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
const fmt     = n  => `₱${Number(n||0).toFixed(2)}`;
const fmtDate = d  => new Date(d).toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"});
const fmtTime = d  => new Date(d).toLocaleTimeString("en-PH",{hour:"2-digit",minute:"2-digit"});
const uid     = () => Math.random().toString(36).substr(2,9)+Date.now().toString(36);
const today   = () => new Date().toISOString().split("T")[0];
const sanitize= s  => String(s||"").replace(/[<>"'`\\]/g,"").slice(0,500);

const beep=(f=880,d=80,t="square")=>{
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.frequency.value=f;o.type=t;
    g.gain.setValueAtTime(.3,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d/1000);
    o.start();o.stop(ctx.currentTime+d/1000);
  }catch{}
};
const okBeep =()=>{beep(523,70);setTimeout(()=>beep(659,70),80);setTimeout(()=>beep(784,110),165);};
const errBeep=()=>beep(220,180,"sawtooth");

const CAT_EMOJI=cat=>({
  "Instant Noodles":"🍜","Drinks":"🥤","Cigarettes":"🚬","Biscuits":"🍪",
  "Vegetables":"🥬","Condiments":"🧂","Snacks":"🍟","Canned Goods":"🥫",
  "Hygiene":"🧼","Dairy":"🥛","Rice & Grains":"🌾","Frozen Foods":"🧊",
  "Candies":"🍬","Bread":"🍞","Cooking Oil":"🫙","Coffee & Tea":"☕","Others":"📦"
})[cat]||"📦";

const ALL_CATS=["Instant Noodles","Drinks","Cigarettes","Biscuits","Vegetables",
  "Condiments","Snacks","Canned Goods","Hygiene","Dairy","Rice & Grains",
  "Frozen Foods","Candies","Bread","Cooking Oil","Coffee & Tea","Others"];

/* ═══════════════════════════════════════════
   EXCEL
═══════════════════════════════════════════ */
const ensureXLSX=()=>new Promise((res,rej)=>{
  if(window.XLSX){res();return;}
  const s=document.createElement("script");
  s.src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
  s.onload=res;s.onerror=rej;document.head.appendChild(s);
});
const toExcel=async(sheets,filename)=>{
  await ensureXLSX();
  const wb=window.XLSX.utils.book_new();
  sheets.forEach(sh=>{
    const ws=window.XLSX.utils.aoa_to_sheet(sh.rows);
    window.XLSX.utils.book_append_sheet(wb,ws,sh.name);
  });
  window.XLSX.writeFile(wb,filename||`sari-store-${today()}.xlsx`);
};
const fromExcel=file=>new Promise((res,rej)=>{
  ensureXLSX().then(()=>{
    const reader=new FileReader();
    reader.onload=ev=>{
      try{
        const wb=window.XLSX.read(ev.target.result,{type:"binary"});
        const result={};
        wb.SheetNames.forEach(n=>{result[n]=window.XLSX.utils.sheet_to_json(wb.Sheets[n]);});
        res(result);
      }catch(e){rej(e);}
    };
    reader.onerror=rej;
    reader.readAsBinaryString(file);
  }).catch(rej);
});

/* ═══════════════════════════════════════════
   FIREBASE
═══════════════════════════════════════════ */
let _fb=null,_storeKey="store_default",_fbReady=false;
const _FB_DB_URL="https://j7vj7f-default-rtdb.asia-southeast1.firebasedatabase.app";

const loadFB=()=>new Promise(res=>{
  if(_fbReady&&_fb){res(_fb);return;}
  const ls=src=>new Promise((r,j)=>{
    if(document.querySelector(`script[src="${src}"]`)){setTimeout(r,80);return;}
    const s=document.createElement("script");s.src=src;s.onload=r;s.onerror=j;document.head.appendChild(s);
  });
  ls("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js")
    .then(()=>ls("https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"))
    .then(()=>{
      try{
        if(!window.firebase){res(null);return;}
        if(!window.firebase.apps||window.firebase.apps.length===0){
          window.firebase.initializeApp({
            apiKey:"AIzaSyBRmBFqDU2v6M_E3xhMTZ5vKQpZpJHsm8c",
            databaseURL:_FB_DB_URL,projectId:"sari-store-app"
          });
        }
        _fb=window.firebase.database();_fbReady=true;res(_fb);
      }catch{res(null);}
    }).catch(()=>res(null));
});

/* ═══════════════════════════════════════════
   LOCAL STORAGE
═══════════════════════════════════════════ */
const LS_KEY="sari_v7";
const getLS=()=>{try{return JSON.parse(localStorage.getItem(LS_KEY))||{};}catch{return{};}};
const setLS=d=>{try{localStorage.setItem(LS_KEY,JSON.stringify(d));}catch{}};

const SEED=()=>{
  const now=new Date().toISOString(),c1=uid(),c2=uid();
  return{
    settings:{storeName:"Ligaya's Store",address:"123 Barangay Road",
      contact:"0917-123-4567",pin:"",pinEnabled:false,darkMode:false,lowStockThreshold:5},
    products:[
      {id:uid(),name:"Lucky Me Pancit Canton",category:"Instant Noodles",price:15,stock:48,isOpenPrice:false,createdAt:now},
      {id:uid(),name:"Marlboro Red",category:"Cigarettes",price:120,stock:10,isOpenPrice:false,createdAt:now},
      {id:uid(),name:"Coke 8oz",category:"Drinks",price:18,stock:24,isOpenPrice:false,createdAt:now},
      {id:uid(),name:"Sky Flakes",category:"Biscuits",price:8,stock:3,isOpenPrice:false,createdAt:now},
      {id:uid(),name:"Sibuyas / Onion",category:"Vegetables",price:0,stock:20,isOpenPrice:true,createdAt:now},
      {id:uid(),name:"Magic Sarap",category:"Condiments",price:6,stock:60,isOpenPrice:false,createdAt:now},
    ],
    transactions:[],
    customers:[
      {id:c1,name:"Aling Maria",contact:"0912-345-6789",address:"Blk 1 Lot 2",balance:245,createdAt:now},
      {id:c2,name:"Kuya Bert",contact:"0918-987-6543",address:"Blk 3 Lot 5",balance:0,createdAt:now},
    ],
    utangLedger:[{id:uid(),customerId:c1,type:"utang",amount:245,description:"Groceries",date:now}]
  };
};
const initDB=()=>{let d=getLS();if(!d.initialized){d={...SEED(),initialized:true};setLS(d);}return d;};

/* ═══════════════════════════════════════════
   GLOBAL TOAST
═══════════════════════════════════════════ */
let _tt;
const TC={set:null};
const toast=(msg,type="ok")=>TC.set?.({msg:sanitize(String(msg)),type,id:uid()});

/* ═══════════════════════════════════════════
   SEARCH BAR
═══════════════════════════════════════════ */
function SearchBar({value,onChange,placeholder="Search…",style={}}){
  const ref=useRef(null);
  return(
    <div className="sbar" style={{flex:1,...style}}>
      <span className="sbic">🔍</span>
      <input ref={ref} placeholder={placeholder} value={value}
        onChange={e=>onChange(e.target.value)}
        onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();ref.current?.blur();}}}
        enterKeyHint="search"/>
      {value&&(
        <button className="sbar-x" onClick={()=>{onChange("");ref.current?.focus();}}>✕</button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App(){
  const [db,       setDb]      = useState(()=>initDB());
  const [dark,     setDark]    = useState(()=>getLS().settings?.darkMode||false);
  const [page,     setPage]    = useState("dashboard");
  const [toastS,   setToastS]  = useState(null);
  const [confirm,  setConfirm] = useState(null);
  const [loggedIn, setLoggedIn]= useState(()=>!!sessionStorage.getItem("sari_auth"));
  const [pinOk,    setPinOk]   = useState(false);
  const [pinShow,  setPinShow] = useState(false);
  const [pinEntry, setPinEntry]= useState("");
  const [loginF,   setLoginF]  = useState({u:"",p:"",showP:false,err:""});
  const [authCreds,setAuthCreds]= useState({u:"",p:""});
  const [synced,   setSynced]  = useState(false);
  const fbRef=useRef(null);
  const pbodyRef=useRef(null);

  /* Scroll to top whenever page changes — target the .pg-body scroll region */
  useEffect(()=>{
    const el=pbodyRef.current?.querySelector(".pg-body");
    if(el)el.scrollTo({top:0,behavior:"instant"});
  },[page]);

  /* Back-button guard: push a dummy history entry so back doesn't bypass auth */
  useEffect(()=>{
    if(loggedIn&&pinOk){
      window.history.pushState({authed:true},"");
      const onPop=()=>{
        if(!sessionStorage.getItem("sari_auth")){
          window.history.pushState({},"");
        } else {
          window.history.pushState({authed:true},"");
        }
      };
      window.addEventListener("popstate",onPop);
      return()=>window.removeEventListener("popstate",onPop);
    }
  },[loggedIn,pinOk]);

  TC.set=setToastS;

  useEffect(()=>{document.documentElement.className=dark?"dark":"";},[dark]);
  useEffect(()=>{if(toastS){clearTimeout(_tt);_tt=setTimeout(()=>setToastS(null),3200);}},[toastS]);

  const refresh=useCallback(()=>setDb({...getLS()}),[]);

  const toggleDark=()=>{
    const nd=!dark;setDark(nd);
    const d=getLS();d.settings.darkMode=nd;setLS(d);setDb({...d});
  };

  useEffect(()=>{
    if(!loggedIn||!pinOk)return;
    let active=true;
    (async()=>{
      const fb=await loadFB();
      if(!fb||!active)return;
      const ref=fb.ref(`stores/${_storeKey}`);
      try{
        const snap=await ref.once("value");
        if(!snap.exists())await ref.set({...getLS(),_updatedAt:Date.now()});
        const handler=snap=>{
          if(!active)return;
          const remote=snap.val();if(!remote)return;
          const local=getLS();
          const remoteTs=remote._updatedAt||0,localTs=local._updatedAt||0;
          if(remoteTs>localTs){
            const merged={...remote,settings:{...remote.settings,darkMode:local.settings?.darkMode??false},initialized:true};
            setLS(merged);setDb({...merged});
          }
          setSynced(true);
        };
        ref.on("value",handler);
        fbRef.current={ref,handler};setSynced(true);
      }catch{setSynced(false);}
    })();
    return()=>{
      active=false;
      if(fbRef.current){try{fbRef.current.ref.off("value",fbRef.current.handler);}catch{}}
    };
  },[loggedIn,pinOk]);

  const saveData=useCallback(async d=>{
    const withTs={...d,_updatedAt:Date.now()};
    setLS(withTs);setDb({...withTs});
    if(_fbReady&&_fb){try{await _fb.ref(`stores/${_storeKey}`).set(withTs);}catch{}}
    try{window.dispatchEvent(new StorageEvent("storage",{key:LS_KEY}));}catch{}
  },[]);

  useEffect(()=>{
    const h=e=>{if(e.key===LS_KEY)setDb({...getLS()});};
    window.addEventListener("storage",h);
    return()=>window.removeEventListener("storage",h);
  },[]);

  const doLogin=()=>{
    const stored=getLS();
    const au=stored.settings?.adminUser||"admin";
    const ap=stored.settings?.adminPass||"admin123";
    if(loginF.u===au&&loginF.p===ap){
      _storeKey=`store_${loginF.u}`;
      sessionStorage.setItem("sari_auth","1");
      setAuthCreds({u:loginF.u,p:loginF.p});
      setLoggedIn(true);
      const d=getLS();
      if(d.settings?.pinEnabled&&d.settings?.pin)setPinShow(true);
      else setPinOk(true);
    }else{
      setLoginF(p=>({...p,err:"Invalid username or password."}));errBeep();
    }
  };

  const doPinDigit=digit=>{
    if(digit==="⌫"){beep(300,55);setPinEntry(p=>p.slice(0,-1));return;}
    const np=pinEntry+digit;if(np.length>4)return;
    beep(600,55);setPinEntry(np);
    if(np.length===4){
      setTimeout(()=>{
        if(np===db.settings.pin){setPinOk(true);setPinShow(false);setPinEntry("");okBeep();}
        else{errBeep();setPinEntry("");toast("Wrong PIN","err");}
      },280);
    }
  };

  /* ── Login screen ── */
  if(!loggedIn) return(
    <div className="app-root" style={{alignItems:"center",justifyContent:"center",display:"flex",minHeight:"100vh",padding:20}}>
      <div className="card" style={{width:"100%",maxWidth:380,padding:"36px 28px"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          {/* Ligaya's Store Logo */}
          <div style={{margin:"0 auto 14px",width:120,height:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
              {/* Background circle */}
              <circle cx="100" cy="100" r="98" fill="#1a0f00" stroke="#8B5E3C" strokeWidth="3"/>
              {/* Top banner arch */}
              <path d="M30 70 Q100 20 170 70" fill="#6B3A1F" stroke="#4a2510" strokeWidth="2"/>
              <path d="M35 65 Q100 15 165 65 Q100 30 35 65Z" fill="#8B5E3C"/>
              {/* LIGAYA'S text on arch */}
              <text x="100" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="Georgia,serif" fill="#F5E6D0" letterSpacing="1.5">LIGAYA'S</text>
              {/* Nipa hut body */}
              <rect x="62" y="115" width="76" height="52" fill="#6B3A1F" stroke="#4a2510" strokeWidth="1.5" rx="1"/>
              {/* Hut door */}
              <rect x="88" y="135" width="24" height="32" fill="#4a2510" rx="2"/>
              {/* Hut window */}
              <rect x="66" y="122" width="16" height="14" fill="#4a2510" rx="2"/>
              {/* Thatched roof */}
              <polygon points="55,118 100,78 145,118" fill="#8B6914" stroke="#6B5010" strokeWidth="1"/>
              <polygon points="55,118 100,80 145,118 140,118 100,84 60,118Z" fill="#A07820"/>
              {/* Roof texture lines */}
              <line x1="70" y1="118" x2="90" y2="86" stroke="#6B5010" strokeWidth="1" opacity="0.6"/>
              <line x1="85" y1="118" x2="98" y2="81" stroke="#6B5010" strokeWidth="1" opacity="0.6"/>
              <line x1="115" y1="118" x2="102" y2="81" stroke="#6B5010" strokeWidth="1" opacity="0.6"/>
              <line x1="130" y1="118" x2="110" y2="86" stroke="#6B5010" strokeWidth="1" opacity="0.6"/>
              {/* Awning */}
              <rect x="62" y="115" width="76" height="8" fill="#D4A853" rx="1"/>
              {/* Store counter/shelf */}
              <rect x="50" y="147" width="100" height="6" fill="#8B5E3C" stroke="#6B3A1F" strokeWidth="1" rx="1"/>
              {/* Products on shelf - bottles */}
              <rect x="54" y="135" width="6" height="13" fill="#1a3a6b" rx="2"/>
              <rect x="62" y="137" width="6" height="11" fill="#8B1a1a" rx="2"/>
              <rect x="116" y="136" width="7" height="12" fill="#2d8b1a" rx="2"/>
              <rect x="125" y="137" width="6" height="11" fill="#d4821a" rx="2"/>
              {/* Rice sack */}
              <ellipse cx="75" cy="152" rx="10" ry="8" fill="#c8b06e" stroke="#9a7a3a" strokeWidth="1"/>
              <text x="75" y="154" textAnchor="middle" fontSize="5" fill="#6B4a10" fontWeight="600">RICE</text>
              {/* Leaves left */}
              <path d="M25 130 Q38 100 50 115 Q38 118 25 130Z" fill="#2d5a1a" opacity="0.8"/>
              <path d="M20 145 Q35 115 48 125 Q32 130 20 145Z" fill="#3a6b22" opacity="0.7"/>
              {/* Leaves right */}
              <path d="M175 130 Q162 100 150 115 Q162 118 175 130Z" fill="#2d5a1a" opacity="0.8"/>
              <path d="M180 145 Q165 115 152 125 Q168 130 180 145Z" fill="#3a6b22" opacity="0.7"/>
              {/* Bottom banner */}
              <path d="M45 168 Q100 158 155 168 Q100 175 45 168Z" fill="#8B5E3C"/>
              <rect x="42" y="162" width="116" height="18" fill="#B87333" rx="4" stroke="#8B5020" strokeWidth="1.5"/>
              {/* Rivets */}
              <circle cx="52" cy="171" r="3" fill="#D4921E"/>
              <circle cx="148" cy="171" r="3" fill="#D4921E"/>
              {/* STORE text */}
              <text x="100" y="175" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="Georgia,serif" fill="#1a0f00" letterSpacing="2">STORE</text>
            </svg>
          </div>
          <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Ligaya's Store</h1>
          <p style={{color:"var(--tx2)",fontSize:13,fontWeight:500}}>Store Management System</p>
        </div>
        {loginF.err&&<div style={{background:"var(--dnl)",color:"var(--dn)",borderRadius:"var(--rs)",padding:"9px 14px",marginBottom:14,fontSize:13,fontWeight:500}}>❌ {loginF.err}</div>}
        <div className="login-wrap">
          <div className="fg">
            <label>Username</label>
            <input placeholder="Enter username" value={loginF.u}
              onChange={e=>setLoginF(p=>({...p,u:sanitize(e.target.value),err:""}))}
              onKeyDown={e=>e.key==="Enter"&&doLogin()} autoFocus autoComplete="off" maxLength={80}/>
          </div>
          <div className="fg" style={{position:"relative"}}>
            <label>Password</label>
            <input type={loginF.showP?"text":"password"} placeholder="••••••••" value={loginF.p}
              onChange={e=>setLoginF(p=>({...p,p:e.target.value,err:""}))}
              onKeyDown={e=>e.key==="Enter"&&doLogin()} autoComplete="off" maxLength={128}/>
            <button onClick={()=>setLoginF(p=>({...p,showP:!p.showP}))}
              style={{position:"absolute",right:10,top:32,background:"none",border:"none",cursor:"pointer",color:"var(--tx3)",fontSize:16,padding:4}}>
              {loginF.showP?"🙈":"👁"}
            </button>
          </div>
        </div>
        <button className="btn bp blg" style={{width:"100%"}} onClick={doLogin}>🔐 Login</button>
      </div>
    </div>
  );

  /* ── PIN screen ── */
  if(pinShow&&!pinOk) return(
    <div className="app-root" style={{alignItems:"center",justifyContent:"center",display:"flex",minHeight:"100vh"}}>
      <div className="card" style={{padding:"40px 32px",textAlign:"center",width:320,maxWidth:"92vw"}}>
        <div style={{fontSize:34,marginBottom:12}}>🔒</div>
        <h2 style={{fontSize:19,fontWeight:700,marginBottom:6}}>PIN Lock</h2>
        <p style={{fontSize:13,color:"var(--tx2)",marginBottom:28}}>Enter your 4-digit PIN to continue</p>
        <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:32}}>
          {[0,1,2,3].map(i=><div key={i} className={`pin-dot ${i<pinEntry.length?"on":""}`}/>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,justifyItems:"center"}}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
            <button key={i} className="pin-key" style={{opacity:k===""?0:1,pointerEvents:k===""?"none":"auto"}} onClick={()=>k&&doPinDigit(k)}>{k}</button>
          ))}
        </div>
        <button style={{marginTop:18,background:"none",border:"none",color:"var(--tx3)",fontSize:12,cursor:"pointer"}}
          onClick={()=>{sessionStorage.removeItem("sari_auth");setLoggedIn(false);setPinOk(false);setPinShow(false);}}>
          ← Back to login
        </button>
      </div>
    </div>
  );

  const logout=()=>setConfirm({title:"Log Out",msg:"Are you sure you want to log out?",icon:"🚪",danger:true,confirmText:"Log Out",
    onConfirm:()=>{
      /* Wipe session + auth creds from memory */
      sessionStorage.removeItem("sari_auth");
      sessionStorage.clear();
      /* Clear any sensitive auth keys from localStorage (keep store data) */
      try{localStorage.removeItem("sari_auth");}catch{}
      /* Reset all auth state */
      setLoggedIn(false);
      setPinOk(false);
      setPinShow(false);
      setPinEntry("");
      setAuthCreds({u:"",p:""});
      setLoginF({u:"",p:"",showP:false,err:""});
      /* Replace history so back button can't return to dashboard */
      window.history.replaceState({},"");
    }
  });

  /* Mobile bottom nav — Reports is NOT here; it lives inside "More" (Settings) */
  const navItems=[
    {id:"dashboard",icon:"📊",label:"Home"},
    {id:"pos",icon:"🛒",label:"POS"},
    {id:"inventory",icon:"📦",label:"Items"},
    {id:"utang",icon:"📋",label:"Utang"},
    {id:"settings",icon:"⚙️",label:"More"},
  ];
  /* Desktop sidebar — Reports visible here */
  const sideItems=[
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"pos",icon:"🛒",label:"Point of Sale"},
    {id:"inventory",icon:"📦",label:"Inventory"},
    {id:"utang",icon:"📋",label:"Utang"},
    {id:"reports",icon:"📈",label:"Reports"},
    {id:"settings",icon:"⚙️",label:"Settings"},
  ];

  const cp={db,saveData,setConfirm,refresh};

  return(
    <div className="app-root" style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>
      {/* Toast */}
      {toastS&&(
        <div className="toast" style={{borderColor:toastS.type==="err"?"var(--dn)":toastS.type==="warn"?"var(--wn)":"var(--ac)"}}>
          <span>{toastS.type==="err"?"❌":toastS.type==="warn"?"⚠️":"✅"}</span>{toastS.msg}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm&&(
        <div className="backdrop" onClick={e=>e.target===e.currentTarget&&(confirm.onCancel?.(),setConfirm(null))}>
          <div className="msheet" style={{maxWidth:420,borderRadius:"var(--r)",alignSelf:"center",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:14}}>{confirm.icon||"❓"}</div>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{confirm.title}</h3>
            <p style={{color:"var(--tx2)",fontSize:14,marginBottom:26,lineHeight:1.6,whiteSpace:"pre-line"}}>{confirm.msg}</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <button className="btn bg2" style={{minWidth:100}} onClick={()=>{confirm.onCancel?.();setConfirm(null);}}>Cancel</button>
              <button className={`btn ${confirm.danger?"bd2":"bp"}`} style={{minWidth:120}} onClick={()=>{confirm.onConfirm?.();setConfirm(null);}}>
                {confirm.confirmText||"Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile top bar — clicking store name goes to Dashboard */}
      <div className="topbar">
        <button style={{display:"flex",alignItems:"center",gap:8,minWidth:0,background:"none",border:"none",cursor:"pointer",padding:0}}
          onClick={()=>setPage("dashboard")}>
          <span style={{flexShrink:0,width:28,height:28,display:"inline-flex"}}>
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{width:28,height:28,borderRadius:"50%"}}>
              <circle cx="100" cy="100" r="98" fill="#1a0f00"/>
              <path d="M30 70 Q100 20 170 70" fill="#6B3A1F"/>
              <path d="M35 65 Q100 15 165 65 Q100 30 35 65Z" fill="#8B5E3C"/>
              <text x="100" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="Georgia,serif" fill="#F5E6D0" letterSpacing="1.5">LIGAYA'S</text>
              <rect x="62" y="115" width="76" height="52" fill="#6B3A1F" rx="1"/>
              <rect x="88" y="135" width="24" height="32" fill="#4a2510" rx="2"/>
              <polygon points="55,118 100,78 145,118" fill="#8B6914"/>
              <polygon points="55,118 100,80 145,118 140,118 100,84 60,118Z" fill="#A07820"/>
              <rect x="62" y="115" width="76" height="8" fill="#D4A853" rx="1"/>
              <rect x="42" y="162" width="116" height="18" fill="#B87333" rx="4" stroke="#8B5020" strokeWidth="1.5"/>
              <text x="100" y="175" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="Georgia,serif" fill="#1a0f00" letterSpacing="2">STORE</text>
            </svg>
          </span>
          <span style={{fontWeight:700,fontSize:15,color:"var(--tx)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{db.settings.storeName}</span>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4}}>
            <span className={`sdot ${synced?"":"off"}`}/>{synced?"Synced":"Local"}
          </span>
          <button className="btn bg2 bsm" style={{padding:"6px 10px"}} onClick={toggleDark}>{dark?"☀️":"🌙"}</button>
        </div>
      </div>

      {/* Main wrapper — fills remaining height, no overflow here */}
      <div className="mwrap" style={{flex:1,minHeight:0}}>
        {/* Desktop sidebar — clicking store name → Dashboard */}
        <aside className="sidebar">
          <button style={{display:"flex",alignItems:"center",gap:9,padding:"4px 8px 20px",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}
            onClick={()=>setPage("dashboard")}>
            <span style={{width:36,height:36,flexShrink:0,display:"inline-flex"}}>
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36,borderRadius:"50%"}}>
                <circle cx="100" cy="100" r="98" fill="#1a0f00"/>
                <path d="M35 65 Q100 15 165 65 Q100 30 35 65Z" fill="#8B5E3C"/>
                <text x="100" y="56" textAnchor="middle" fontSize="18" fontWeight="800" fontFamily="Georgia,serif" fill="#F5E6D0" letterSpacing="1.5">LIGAYA'S</text>
                <rect x="62" y="115" width="76" height="52" fill="#6B3A1F" rx="1"/>
                <rect x="88" y="135" width="24" height="32" fill="#4a2510" rx="2"/>
                <polygon points="55,118 100,78 145,118" fill="#8B6914"/>
                <polygon points="55,118 100,80 145,118 140,118 100,84 60,118Z" fill="#A07820"/>
                <rect x="62" y="115" width="76" height="8" fill="#D4A853" rx="1"/>
                <rect x="42" y="162" width="116" height="18" fill="#B87333" rx="4"/>
                <text x="100" y="175" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="Georgia,serif" fill="#1a0f00" letterSpacing="2">STORE</text>
              </svg>
            </span>
            <div>
              <div style={{fontWeight:700,fontSize:13,color:"var(--tx)"}}>{db.settings.storeName}</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>{synced?"🟢 Synced":"🟡 Local"}</div>
            </div>
          </button>
          {sideItems.map(item=>(
            <div key={item.id} className={`siditem ${page===item.id?"on":""}`} onClick={()=>setPage(item.id)}>
              <span style={{fontSize:18}}>{item.icon}</span>{item.label}
            </div>
          ))}
          <div style={{marginTop:"auto",paddingTop:16,borderTop:"1.5px solid var(--bd)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:12,color:"var(--tx2)"}}>{dark?"🌙 Dark":"☀️ Light"}</span>
              <button className="btn bg2 bsm" style={{padding:"5px 10px"}} onClick={toggleDark}>{dark?"☀️":"🌙"}</button>
            </div>
            <button className="btn bg2 bsm" style={{width:"100%"}} onClick={logout}>🚪 Log Out</button>
          </div>
        </aside>

        {/* .pbody: single scroll container, all pages render inside */}
        <div className="pbody" ref={pbodyRef}>
          {page==="dashboard"&&<Dashboard {...cp} setPage={setPage}/>}
          {page==="pos"       &&<POS       {...cp}/>}
          {page==="inventory" &&<Inventory {...cp}/>}
          {page==="utang"     &&<Utang     {...cp}/>}
          {page==="reports"   &&<Reports   {...cp}/>}
          {page==="settings"  &&<SettingsPage {...cp} dark={dark} toggleDark={toggleDark} logout={logout} setPage={setPage}/>}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="botnav">
        {navItems.map(item=>(
          <button key={item.id} className={`ntab ${(page===item.id||(item.id==="settings"&&page==="reports"))?"on":""}`} onClick={()=>setPage(item.id)}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function Dashboard({db,setPage}){
  const txns=db.transactions||[],prods=db.products||[],custs=db.customers||[];
  const todayTx=txns.filter(t=>t.date?.startsWith(today()));
  const daySales=todayTx.filter(t=>!t.isUtang).reduce((s,t)=>s+(t.total||0),0);
  /* Low stock: sorted alphabetically, split out-of-stock from low-stock */
  const threshold=db.settings?.lowStockThreshold||5;
  const outOfStock=[...prods].filter(p=>p.stock<=0).sort((a,b)=>a.name.localeCompare(b.name));
  const lowStock  =[...prods].filter(p=>p.stock>0&&p.stock<=threshold).sort((a,b)=>a.stock-b.stock);
  const allAlerts =[...outOfStock,...lowStock];
  const totalUtang=custs.reduce((s,c)=>s+(c.balance||0),0);
  const best=useMemo(()=>{
    const cnt={};
    txns.forEach(t=>t.items?.forEach(it=>{cnt[it.id]=(cnt[it.id]||0)+(it.qty||0);}));
    return Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,5)
      .map(([id,qty])=>{const p=prods.find(x=>x.id===id);return p?{...p,soldQty:qty}:null;})
      .filter(Boolean);
  },[txns,prods]);
  const recent=[...txns].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);

  return(
    <div className="pg-page">
      {/* Header */}
      <div className="pg-hdr">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <div>
            <h1 style={{fontSize:21,fontWeight:800}}>Dashboard</h1>
            <p style={{color:"var(--tx2)",fontSize:12,marginTop:2}}>
              {new Date().toLocaleDateString("en-PH",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
            </p>
          </div>
          <button className="btn bp bsm" onClick={()=>setPage("pos")}>🛒 New Sale</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="pg-body">
        {/* KPI Cards 2x2 grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[
            {label:"Today's Sales",  value:fmt(daySales),    icon:"💵", color:"var(--ac)",   bg:"rgba(82,183,136,0.08)",  border:"rgba(82,183,136,0.25)"},
            {label:"Transactions",   value:todayTx.length,   icon:"🧾", color:"var(--in)",   bg:"rgba(86,173,245,0.08)",  border:"rgba(86,173,245,0.25)"},
            {label:"Total Products", value:prods.length,     icon:"📦", color:"#b07ef8",     bg:"rgba(176,126,248,0.08)", border:"rgba(176,126,248,0.25)"},
            {label:"Total Utang",    value:fmt(totalUtang),  icon:"📋", color:"var(--wn)",   bg:"rgba(240,165,0,0.08)",   border:"rgba(240,165,0,0.25)"},
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:16,padding:"18px 16px",display:"flex",flexDirection:"column",gap:6}}>
              <div style={{fontSize:28}}>{s.icon}</div>
              <div style={{fontSize:22,fontWeight:800,lineHeight:1,color:s.color,marginTop:4}}>{s.value}</div>
              <div style={{fontSize:12,color:"var(--tx2)",fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Stock Alert — two-column grid */}
        {allAlerts.length>0&&(
          <div style={{background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:16,padding:"16px 18px",marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <span style={{fontSize:16}}>⚠️</span>
              <span style={{fontWeight:700,fontSize:14,color:"var(--wn)"}}>Stock Alert</span>
              <span style={{marginLeft:"auto",background:"var(--wnl)",color:"var(--wn)",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700}}>{allAlerts.length} items</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {allAlerts.map(p=>{
                const isOut=p.stock<=0;
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,background:"var(--sf2)",borderRadius:10,padding:"10px 12px"}}>
                    <span style={{fontSize:20,flexShrink:0}}>{CAT_EMOJI(p.category)}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--tx)"}}>{p.name}</div>
                      <span style={{display:"inline-block",marginTop:3,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:800,
                        background:isOut?"var(--dnl)":"var(--wnl)",
                        color:isOut?"var(--dn)":"var(--wn)"}}>
                        {isOut?"Out!":p.stock+" left"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          <div className="card" style={{padding:18}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>Recent Transactions</h3>
            {recent.length===0?<p style={{color:"var(--tx3)",fontSize:13}}>No transactions yet.</p>:recent.map(t=>(
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid var(--bd)"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{t.items?.length||0} item{t.items?.length!==1?"s":""}{t.isUtang?" · Utang":""}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{fmtDate(t.date)} {fmtTime(t.date)}</div>
                </div>
                <span style={{fontWeight:700,color:t.isUtang?"var(--wn)":"var(--ac)",fontSize:14}}>{fmt(t.total)}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:18}}>
            <h3 style={{fontSize:14,fontWeight:700,marginBottom:14}}>Best Selling Products</h3>
            {best.length===0?<p style={{color:"var(--tx3)",fontSize:13}}>No sales yet.</p>:best.map((p,i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--bd)"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"var(--acl)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"var(--ac)",flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:11,color:"var(--tx3)"}}>{p.soldQty} sold</div>
                </div>
                <span style={{fontSize:13,fontWeight:700}}>{p.isOpenPrice?"Var.":fmt(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>{/* pg-body */}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CUSTOMER SELECTOR MODAL (used in POS checkout for Utang)
═══════════════════════════════════════════ */
function CustomerSelectorModal({customers,value,onChange,onClose}){
  const [q,setQ]=useState("");
  const sorted=useMemo(()=>[...customers].sort((a,b)=>a.name.localeCompare(b.name)),[customers]);
  const filtered=useMemo(()=>sorted.filter(c=>
    c.name.toLowerCase().includes(q.toLowerCase())||
    (c.contact||"").includes(q)
  ),[sorted,q]);

  return(
    <div className="backdrop" style={{alignItems:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--sf)",width:"100%",maxWidth:480,borderRadius:18,
        maxHeight:"82vh",display:"flex",flexDirection:"column",boxShadow:"var(--shlg)",
        animation:"shUp .22s ease",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"18px 20px 12px",flexShrink:0,borderBottom:"1.5px solid var(--bd)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h3 style={{fontWeight:700,fontSize:16}}>👤 Select Customer</h3>
            <button className="btn bg2 bsm" onClick={onClose}>✕</button>
          </div>
          <div className="sbar">
            <span className="sbic">🔍</span>
            <input autoFocus placeholder="Search by name or number…" value={q}
              onChange={e=>setQ(e.target.value)} style={{paddingLeft:40}}/>
            {q&&<button className="sbar-x" onClick={()=>setQ("")}>✕</button>}
          </div>
        </div>
        {/* Customer list */}
        <div style={{flex:1,overflowY:"auto"}}>
          {filtered.length===0&&(
            <div style={{padding:32,textAlign:"center",color:"var(--tx3)",fontSize:14}}>No customers found.</div>
          )}
          {filtered.map(c=>(
            <div key={c.id} onClick={()=>{onChange(c.id);onClose();}}
              style={{display:"flex",alignItems:"center",gap:14,padding:"12px 20px",
                cursor:"pointer",borderBottom:"1px solid var(--bd)",transition:"background .12s",
                background:value===c.id?"var(--acl)":"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.background=value===c.id?"var(--acl)":"var(--sf2)"}
              onMouseLeave={e=>e.currentTarget.style.background=value===c.id?"var(--acl)":"transparent"}>
              <div style={{width:40,height:40,borderRadius:"50%",background:"var(--acl)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontWeight:800,fontSize:16,color:"var(--ac)",flexShrink:0}}>
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:700,fontSize:14,color:value===c.id?"var(--ac)":"var(--tx)",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                {c.contact&&<div style={{fontSize:12,color:"var(--tx3)"}}>{c.contact}</div>}
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:700,color:c.balance>0?"var(--wn)":"var(--ac)"}}>{fmt(c.balance)}</div>
                <div style={{fontSize:11,color:"var(--tx3)"}}>balance</div>
              </div>
              {value===c.id&&<span style={{color:"var(--ac)",fontSize:18,flexShrink:0}}>✔</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CUSTOMER PICKER (trigger button for POS checkout)
═══════════════════════════════════════════ */
function CustomerPicker({customers,value,onChange}){
  const [modalOpen,setModalOpen]=useState(false);
  const selected=customers.find(c=>c.id===value);

  return(
    <div className="fg">
      <label>Customer</label>
      <button type="button"
        onClick={()=>setModalOpen(true)}
        style={{background:"var(--sf2)",border:"1.5px solid var(--bd)",borderRadius:"var(--rs)",
          padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",
          width:"100%",transition:"all .18s",textAlign:"left"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--ac)";e.currentTarget.style.boxShadow="0 0 0 3px var(--acl)"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bd)";e.currentTarget.style.boxShadow="none"}}>
        {selected
          ?<span style={{fontSize:14,fontWeight:600,color:"var(--tx)"}}>{selected.name}
              <span style={{fontSize:12,color:"var(--tx3)",fontWeight:400,marginLeft:8}}>bal: {fmt(selected.balance)}</span>
            </span>
          :<span style={{fontSize:14,color:"var(--tx3)"}}>— Tap to select customer —</span>}
        <span style={{fontSize:12,color:"var(--tx3)",marginLeft:8}}>▼</span>
      </button>
      {value&&selected&&<div style={{fontSize:12,color:"var(--ac)",marginTop:5,fontWeight:500}}>✔ {selected.name} selected</div>}
      {modalOpen&&<CustomerSelectorModal customers={customers} value={value} onChange={onChange} onClose={()=>setModalOpen(false)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   POS
═══════════════════════════════════════════ */
function POS({db,saveData,setConfirm}){
  const CART_KEY="sari_pos_cart";
  const [search,       setSearch]      = useState("");
  const [cart,         setCart]        = useState(()=>{try{return JSON.parse(localStorage.getItem(CART_KEY))||[];}catch{return[];}});
  const [cash,         setCash]        = useState(()=>{try{return localStorage.getItem("sari_pos_cash")||"";}catch{return "";}});
  const [checkoutOpen, setCheckoutOpen]= useState(false);
  const [receiptData,  setReceiptData] = useState(null);
  const [utangMode,    setUtangMode]   = useState(false);
  const [custId,       setCustId]      = useState("");
  const [priceModal,   setPriceModal]  = useState(null);
  const [priceVal,     setPriceVal]    = useState("");
  const [catFilter,    setCatFilter]   = useState("All");
  const [mobCartOpen,  setMobCartOpen] = useState(false);

  /* Persist cart & cash to localStorage on every change */
  useEffect(()=>{try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch{}},[cart]);
  useEffect(()=>{try{localStorage.setItem("sari_pos_cash",cash);}catch{}},[cash]);

  const prods=db.products||[];
  const cats=["All",...new Set(prods.map(p=>p.category))];
  const filtered=useMemo(()=>[...prods]
    .sort((a,b)=>a.name.localeCompare(b.name))
    .filter(p=>(catFilter==="All"||p.category===catFilter)&&
      (search===""||p.name.toLowerCase().includes(search.toLowerCase())))
  ,[prods,catFilter,search]);

  const total =cart.reduce((s,i)=>s+i.price*i.qty,0);
  const change=Math.max(0,parseFloat(cash||0)-total);

  const addToCart=(prod,pOverride)=>{
    if(prod.stock<=0){toast("Out of stock!","err");return;}
    const price=pOverride!==undefined?pOverride:prod.price;
    setCart(prev=>{
      if(pOverride!==undefined)return[...prev,{...prod,qty:1,price,cartId:uid()}];
      const ex=prev.find(i=>i.id===prod.id);
      if(ex)return prev.map(i=>i.id===prod.id?{...i,qty:i.qty+1}:i);
      return[...prev,{...prod,qty:1,price,cartId:uid()}];
    });
    beep(700,55);
  };

  const handleProdClick=p=>{
    if(p.isOpenPrice){setPriceModal(p);setPriceVal(p.price>0?String(p.price):"");}
    else addToCart(p);
  };

  const updateQty=(cartId,delta)=>
    setCart(prev=>prev.map(i=>i.cartId===cartId?{...i,qty:Math.max(0,i.qty+delta)}:i).filter(i=>i.qty>0));

  const checkout=async()=>{
    if(cart.length===0){toast("Cart is empty!","warn");return;}
    if(!utangMode&&parseFloat(cash||0)<total){toast("Not enough cash!","err");return;}
    if(utangMode&&!custId){toast("Select a customer for utang!","warn");return;}
    const d=getLS();
    const txn={id:uid(),date:new Date().toISOString(),
      items:cart.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price})),
      total,cash:utangMode?0:parseFloat(cash||0),
      change:utangMode?0:change,isUtang:utangMode,customerId:utangMode?custId:null};
    d.transactions=[txn,...(d.transactions||[])];
    cart.forEach(item=>{
      const pi=d.products.findIndex(p=>p.id===item.id);
      if(pi>=0)d.products[pi].stock=Math.max(0,d.products[pi].stock-item.qty);
    });
    if(utangMode){
      const ci=d.customers.findIndex(c=>c.id===custId);
      if(ci>=0)d.customers[ci].balance=(d.customers[ci].balance||0)+total;
      d.utangLedger=[{id:uid(),customerId:custId,type:"utang",amount:total,
        description:cart.map(i=>i.name).join(", "),date:new Date().toISOString()},...(d.utangLedger||[])];
    }
    await saveData(d);okBeep();
    setReceiptData({txn,settings:d.settings});
    setCart([]);setCash("");setUtangMode(false);setCustId("");
    setCheckoutOpen(false);setMobCartOpen(false);
    try{localStorage.removeItem("sari_pos_cart");localStorage.removeItem("sari_pos_cash");}catch{}
  };

  const CartContent=({onCheckoutClick})=>(
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexShrink:0}}>
        <h3 style={{fontWeight:700,fontSize:15}}>Cart ({cart.length})</h3>
        {cart.length>0&&<button className="btn bd2 bsm" onClick={()=>{setCart([]);setCash("");try{localStorage.removeItem("sari_pos_cart");localStorage.removeItem("sari_pos_cash");}catch{}}}>Clear</button>}
      </div>
      <div style={{flex:1,overflowY:"auto",minHeight:60}}>
        {cart.length===0
          ?<div style={{textAlign:"center",color:"var(--tx3)",padding:"32px 0",fontSize:13}}>Tap a product to add it.</div>
          :cart.map(item=>(
            <div key={item.cartId} className="crow">
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                <div style={{fontSize:12,color:"var(--tx2)"}}>{fmt(item.price)} each</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                <button className="qbtn" onClick={()=>updateQty(item.cartId,-1)}>−</button>
                <span style={{minWidth:22,textAlign:"center",fontWeight:700,fontSize:14}}>{item.qty}</span>
                <button className="qbtn" onClick={()=>updateQty(item.cartId,1)}>+</button>
              </div>
              <span style={{fontSize:13,fontWeight:700,minWidth:54,textAlign:"right"}}>{fmt(item.price*item.qty)}</span>
            </div>
          ))
        }
      </div>
      <div style={{paddingTop:14,marginTop:4,flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:19,fontWeight:800,marginBottom:14}}>
          <span>Total</span><span style={{color:"var(--ac)"}}>{fmt(total)}</span>
        </div>
        <button className="btn bp blg" style={{width:"100%"}} onClick={onCheckoutClick||openCheckout}>
          ✅ Checkout
        </button>
      </div>
    </>
  );

  const openCheckout=()=>{if(cart.length===0){toast("Cart is empty!","warn");return;}setCheckoutOpen(true);};

  return(
    <div style={{display:"contents"}}>
      {priceModal&&(
        <div className="backdrop">
          <div className="msheet" style={{maxWidth:360,alignSelf:"center",textAlign:"center",borderRadius:"var(--r)"}}>
            <div style={{fontSize:32,marginBottom:8}}>💰</div>
            <h3 style={{fontWeight:700,marginBottom:4}}>Enter Price</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:18}}>{priceModal.name}</p>
            <input type="number" inputMode="decimal" placeholder="₱ 0.00" value={priceVal}
              onChange={e=>setPriceVal(e.target.value)} autoFocus
              style={{fontSize:20,textAlign:"center",marginBottom:16}}
              onKeyDown={e=>{if(e.key==="Enter"){const v=parseFloat(priceVal);if(!isNaN(v)&&v>=0){addToCart(priceModal,v);setPriceModal(null);}}}}/>
            <div style={{display:"flex",gap:10}}>
              <button className="btn bg2" style={{flex:1}} onClick={()=>setPriceModal(null)}>Cancel</button>
              <button className="btn bp" style={{flex:1}} onClick={()=>{const v=parseFloat(priceVal);if(!isNaN(v)&&v>=0){addToCart(priceModal,v);setPriceModal(null);}else toast("Enter a valid price","err");}}>Add to Cart</button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen&&(
        <div className="backdrop">
          <div className="msheet" style={{maxWidth:500,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <h3 style={{fontSize:17,fontWeight:700}}>Checkout</h3>
              <button className="btn bg2 bsm" onClick={()=>setCheckoutOpen(false)}>✕</button>
            </div>
            <div style={{background:"var(--sf2)",borderRadius:"var(--rs)",padding:14,marginBottom:16,maxHeight:200,overflowY:"auto"}}>
              {cart.map(i=>(
                <div key={i.cartId} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
                  <span style={{color:"var(--tx2)"}}>{i.name} ×{i.qty}</span>
                  <span style={{fontWeight:600}}>{fmt(i.price*i.qty)}</span>
                </div>
              ))}
              <div style={{borderTop:"1.5px solid var(--bd)",marginTop:10,paddingTop:10,fontWeight:800,display:"flex",justifyContent:"space-between",fontSize:16}}>
                <span>TOTAL</span><span style={{color:"var(--ac)"}}>{fmt(total)}</span>
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              <button className={`btn ${!utangMode?"bp":"bg2"}`} style={{flex:1}} onClick={()=>setUtangMode(false)}>💵 Cash</button>
              <button className={`btn ${utangMode?"bp":"bg2"}`}  style={{flex:1}} onClick={()=>setUtangMode(true)}>📋 Utang</button>
            </div>
            {!utangMode?(
              <div className="fg">
                <label>Cash Received</label>
                <input type="number" inputMode="decimal" placeholder="0.00" value={cash}
                  onChange={e=>setCash(e.target.value)} autoFocus
                  onKeyDown={e=>{if(e.key==="Enter"){e.target.blur();checkout();}}}/>
                {parseFloat(cash||0)>=total&&total>0&&(
                  <div style={{marginTop:8,fontWeight:700,color:"var(--ac)",fontSize:15}}>Change: {fmt(change)}</div>
                )}
                {parseFloat(cash||0)>0&&parseFloat(cash||0)<total&&(
                  <div style={{marginTop:8,fontSize:13,color:"var(--dn)"}}>⚠ Short by {fmt(total-parseFloat(cash||0))}</div>
                )}
              </div>
            ):(
              <CustomerPicker customers={db.customers||[]} value={custId} onChange={setCustId}/>
            )}
            <button className="btn bp blg" style={{width:"100%",marginTop:8}} onClick={checkout}>✅ Confirm Sale</button>
          </div>
        </div>
      )}

      {receiptData&&<ReceiptModal data={receiptData} onClose={()=>setReceiptData(null)}/>}

      <button className="cart-fab" onClick={()=>setMobCartOpen(true)}>
        🛒
        {cart.length>0&&<div className="cart-fab-badge">{cart.reduce((s,i)=>s+i.qty,0)}</div>}
      </button>

      <div className={`mob-cart-ov ${mobCartOpen?"open":""}`} onClick={()=>setMobCartOpen(false)}/>
      <div className={`mob-cart-drawer ${mobCartOpen?"open":""}`}>
        <div style={{padding:"14px 0 10px",cursor:"pointer",flexShrink:0}} onClick={()=>setMobCartOpen(false)}>
          <div className="shandle" style={{margin:"0 auto"}}/>
        </div>
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          <CartContent onCheckoutClick={()=>{setMobCartOpen(false);openCheckout();}}/>
        </div>
      </div>

      {/* POS page: header pinned, grid scrolls beneath */}
      <div className="pg-page">
        <div className="pg-hdr">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:10}}>
            <h1 style={{fontSize:19,fontWeight:800}}>🛒 Point of Sale</h1>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search product…"/>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginTop:10,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            {cats.map(c=><button key={c} className={`btn bsm ${catFilter===c?"bp":"bg2"}`} style={{flexShrink:0}} onClick={()=>setCatFilter(c)}>{c}</button>)}
          </div>
        </div>

        <div className="pg-body" style={{padding:16}}>
          <div className="pos-grid">
            <div style={{display:"flex",flexDirection:"column",minHeight:0}}>
              <div style={{overflowY:"auto",flex:1}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:10}}>
                  {filtered.map(p=>(
                    <div key={p.id} className="pcard" style={{opacity:p.stock<=0?.45:1}} onClick={()=>handleProdClick(p)}>
                      <div style={{fontSize:28,marginBottom:6}}>{CAT_EMOJI(p.category)}</div>
                      <div style={{fontSize:12,fontWeight:700,lineHeight:1.3,marginBottom:3}}>{p.name}</div>
                      <div style={{fontSize:13,color:"var(--ac)",fontWeight:800}}>{p.isOpenPrice?"Open Price":fmt(p.price)}</div>
                      <div style={{fontSize:11,color:p.stock<=5?"var(--wn)":"var(--tx3)",marginTop:2}}>{p.stock} left</div>
                    </div>
                  ))}
                  {filtered.length===0&&<div style={{gridColumn:"1/-1",padding:32,textAlign:"center",color:"var(--tx3)",fontSize:14}}>No products found</div>}
                </div>
              </div>
            </div>
            <div className="card" style={{display:"flex",flexDirection:"column",overflow:"hidden",padding:18}}>
              <CartContent/>
            </div>
          </div>
        </div>
      </div>{/* /pg-page */}
    </div>
  );
}

/* ═══════════════════════════════════════════
   RECEIPT MODAL
═══════════════════════════════════════════ */
function ReceiptModal({data,onClose}){
  const {txn,settings}=data;
  return(
    <div className="backdrop">
      <div className="msheet" style={{maxWidth:380,alignSelf:"center",borderRadius:"var(--r)"}}>
        <div className="rfont printable">
          <div style={{textAlign:"center",marginBottom:14}}>
            <div style={{fontWeight:800,fontSize:16}}>{settings.storeName}</div>
            {settings.address&&<div style={{fontSize:12,color:"var(--tx2)"}}>{settings.address}</div>}
            {settings.contact&&<div style={{fontSize:12,color:"var(--tx2)"}}>{settings.contact}</div>}
            <div style={{borderTop:"1px dashed var(--bd)",marginTop:8,paddingTop:8,fontSize:11}}>{new Date(txn.date).toLocaleString("en-PH")}</div>
            <div style={{fontSize:11}}>Receipt # {txn.id.slice(0,10).toUpperCase()}</div>
          </div>
          <div style={{borderTop:"1px dashed var(--bd)",paddingTop:8}}>
            {txn.items.map((it,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"2px 0"}}>
                <span>{it.name} ×{it.qty}</span><span>{fmt(it.price*it.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{borderTop:"1px dashed var(--bd)",marginTop:8,paddingTop:8}}>
            <div style={{display:"flex",justifyContent:"space-between",fontWeight:800,fontSize:15}}><span>TOTAL</span><span>{fmt(txn.total)}</span></div>
            {!txn.isUtang&&<>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Cash</span><span>{fmt(txn.cash)}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}><span>Change</span><span>{fmt(txn.change)}</span></div>
            </>}
            {txn.isUtang&&<div style={{color:"var(--wn)",fontWeight:700,fontSize:13,marginTop:4}}>⚠️ On Credit / Utang</div>}
          </div>
          <div style={{textAlign:"center",marginTop:14,fontSize:13,borderTop:"1px dashed var(--bd)",paddingTop:10}}>
            Thank you! Please come again 🫶
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button className="btn bg2" style={{flex:1}} onClick={onClose}>Close</button>
          <button className="btn bp" style={{flex:1}} onClick={()=>window.print()}>🖨️ Print</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INVENTORY
═══════════════════════════════════════════ */
function Inventory({db,saveData,setConfirm}){
  const [search,setSearch]=useState("");
  const [catF,  setCatF]  =useState("All");
  const [modal, setModal] =useState(false);
  const [editP, setEditP] =useState(null);
  const prods=db.products||[];
  const usedCats=["All",...new Set(prods.map(p=>p.category))];
  const filtered=useMemo(()=>[...prods]
    .sort((a,b)=>a.name.localeCompare(b.name))
    .filter(p=>(catF==="All"||p.category===catF)&&p.name.toLowerCase().includes(search.toLowerCase()))
  ,[prods,catF,search]);

  const handleSave=async(form,isNew)=>{
    if(!form.name?.trim()){toast("Product name required!","err");return;}
    if(!form.isOpenPrice&&(form.price===""||isNaN(parseFloat(form.price)))){toast("Enter a valid price!","err");return;}
    if(form.stock===""||isNaN(parseInt(form.stock))){toast("Enter stock quantity!","err");return;}
    const clean={...form,name:sanitize(form.name.trim()),price:parseFloat(form.price)||0,stock:parseInt(form.stock)||0};
    const d=getLS();
    if(isNew)d.products=[{...clean,id:uid(),createdAt:new Date().toISOString()},...(d.products||[])];
    else d.products=(d.products||[]).map(p=>p.id===clean.id?clean:p);
    await saveData(d);setModal(false);setEditP(null);
    toast(isNew?"Product added! ✅":"Product updated! ✅");okBeep();
  };

  const handleDelete=p=>setConfirm({
    title:"Delete Product",msg:`Delete "${p.name}"?\nThis cannot be undone.`,
    icon:"🗑️",danger:true,confirmText:"Delete",
    onConfirm:async()=>{
      const d=getLS();d.products=(d.products||[]).filter(x=>x.id!==p.id);
      await saveData(d);toast("Product deleted.");
    }
  });

  return(
    <div style={{display:"contents"}}>
      {modal&&<ProdModal product={editP} onSave={handleSave} onClose={()=>{setModal(false);setEditP(null);}}/>}

      <div className="pg-page">
        <div className="pg-hdr">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
            <h1 style={{fontSize:19,fontWeight:800}}>📦 Inventory</h1>
            <button className="btn bp bsm" onClick={()=>{setEditP(null);setModal(true);}}>+ Add Product</button>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search products…"/>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,marginTop:10,WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
            {usedCats.map(c=><button key={c} className={`btn bsm ${catF===c?"bp":"bg2"}`} style={{flexShrink:0}} onClick={()=>setCatF(c)}>{c}</button>)}
          </div>
        </div>

        <div className="pg-body">
          {filtered.length===0&&(
            <div className="card" style={{padding:32,textAlign:"center",color:"var(--tx3)"}}>No products found.</div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
            {filtered.map(p=>{
              const thresh=db.settings?.lowStockThreshold||5;
              const isOut=p.stock<=0;
              const isLow=!isOut&&p.stock<=thresh;
              const stockColor=isOut?"var(--dn)":isLow?"var(--wn)":"var(--ac)";
              const stockBg=isOut?"var(--dnl)":isLow?"var(--wnl)":"var(--acl)";
              const stockLabel=isOut?"Out of Stock":p.stock+" Left";
              return(
                <InventoryCard key={p.id} p={p} stockColor={stockColor} stockBg={stockBg} stockLabel={stockLabel}
                  onEdit={()=>{setEditP({...p});setModal(true);}} onDelete={()=>handleDelete(p)}/>
              );
            })}
          </div>
        </div>
      </div>{/* /pg-page */}
    </div>
  );
}

function InventoryCard({p,stockColor,stockBg,stockLabel,onEdit,onDelete}){
  const [menuOpen,setMenuOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(!menuOpen)return;
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setMenuOpen(false);};
    document.addEventListener("mousedown",h);document.addEventListener("touchstart",h);
    return()=>{document.removeEventListener("mousedown",h);document.removeEventListener("touchstart",h);};
  },[menuOpen]);
  return(
    <div className="card" style={{padding:"16px 18px",display:"flex",alignItems:"center",gap:14,position:"relative"}}>
      <div style={{width:46,height:46,borderRadius:12,background:"var(--sf2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>
        {CAT_EMOJI(p.category)}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontWeight:700,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
        {p.isOpenPrice&&(
          <div style={{marginTop:4}}>
            <span className="badge bg-b" style={{fontSize:11}}>Open Price</span>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
          <span style={{fontWeight:800,fontSize:16,color:"var(--tx)"}}>{p.isOpenPrice?"Variable":fmt(p.price)}</span>
          <span style={{padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:800,background:stockBg,color:stockColor}}>{stockLabel}</span>
        </div>
      </div>
      {/* Three-dot menu */}
      <div ref={ref} style={{position:"relative",flexShrink:0}}>
        <button style={{width:32,height:32,borderRadius:8,border:"1.5px solid var(--bd)",background:"var(--sf2)",color:"var(--tx2)",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
          onClick={()=>setMenuOpen(o=>!o)}>⋮</button>
        {menuOpen&&(
          <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:10,boxShadow:"var(--shlg)",zIndex:200,minWidth:130,overflow:"hidden"}}>
            <button style={{display:"flex",alignItems:"center",gap:9,padding:"11px 16px",width:"100%",fontSize:13,fontWeight:600,color:"var(--tx)",background:"none",border:"none",cursor:"pointer",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--sf2)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
              onClick={()=>{setMenuOpen(false);onEdit();}}>✏️ Edit</button>
            <button style={{display:"flex",alignItems:"center",gap:9,padding:"11px 16px",width:"100%",fontSize:13,fontWeight:600,color:"var(--dn)",background:"none",border:"none",cursor:"pointer",borderTop:"1px solid var(--bd)",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--dnl)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
              onClick={()=>{setMenuOpen(false);onDelete();}}>🗑️ Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProdModal({product,onSave,onClose}){
  const isNew=!product;
  const [form,setForm]=useState(isNew?{name:"",category:ALL_CATS[0],price:"",stock:"",isOpenPrice:false}:{...product});
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div className="backdrop">
      <div className="msheet mlg">
        <div className="shandle"/>
        <h3 style={{fontWeight:700,marginBottom:20,fontSize:16}}>{isNew?"➕ Add Product":"✏️ Edit Product"}</h3>
        <div className="fg"><label>Product Name *</label>
          <input placeholder="e.g. Lucky Me Pancit Canton" value={form.name}
            onChange={e=>s("name",e.target.value)} autoFocus maxLength={200}/>
        </div>
        <div className="fg"><label>Category *</label>
          <select value={form.category} onChange={e=>s("category",e.target.value)}>
            {ALL_CATS.map(c=><option key={c} value={c}>{CAT_EMOJI(c)} {c}</option>)}
          </select>
        </div>
        <div style={{background:"var(--sf2)",borderRadius:"var(--rs)",padding:14,marginBottom:16,display:"flex",gap:12,alignItems:"flex-start"}}>
          <input type="checkbox" id="opx" checked={form.isOpenPrice} onChange={e=>s("isOpenPrice",e.target.checked)} style={{marginTop:2}}/>
          <div>
            <label htmlFor="opx" style={{fontWeight:600,fontSize:14,cursor:"pointer",color:"var(--tx)"}}>Open / Variable Price</label>
            <div style={{fontSize:12,color:"var(--tx2)",marginTop:2}}>For items priced per amount (e.g. vegetables). Cashier enters price at checkout.</div>
          </div>
        </div>
        <div className="frow">
          <div className="fg"><label>{form.isOpenPrice?"Base Price (optional)":"Price (₱) *"}</label>
            <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e=>s("price",e.target.value)}/>
          </div>
          <div className="fg"><label>Stock Quantity *</label>
            <input type="number" inputMode="numeric" min="0" placeholder="0" value={form.stock} onChange={e=>s("stock",e.target.value)}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:6}}>
          <button className="btn bg2" style={{flex:1}} onClick={onClose}>✕ Cancel</button>
          <button className="btn bp" style={{flex:2}} onClick={()=>onSave(form,isNew)}>
            💾 {isNew?"Add Product":"Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   UTANG / CREDIT
═══════════════════════════════════════════ */
function Utang({db,saveData,setConfirm}){
  const [custModal,  setCustModal]  = useState(false);
  const [editCust,   setEditCust]   = useState(null);
  const [payModal,   setPayModal]   = useState(null);
  const [payAmt,     setPayAmt]     = useState("");
  const [ledgerCust, setLedgerCust] = useState(null);
  const [search,     setSearch]     = useState("");

  const customers =db.customers||[];
  const ledger    =db.utangLedger||[];
  const totalUtang=customers.reduce((s,c)=>s+(c.balance||0),0);

  const filteredCustomers=useMemo(()=>[...customers]
    .sort((a,b)=>a.name.localeCompare(b.name))
    .filter(c=>
      c.name.toLowerCase().includes(search.toLowerCase())||
      (c.contact||"").includes(search)||
      (c.address||"").toLowerCase().includes(search.toLowerCase())
    )
  ,[customers,search]);

  const handleSaveCust=async(form,isNew)=>{
    if(!form.name?.trim()){toast("Name is required!","err");return;}
    const clean={...form,name:sanitize(form.name.trim()),contact:sanitize(form.contact||""),address:sanitize(form.address||"")};
    const d=getLS();
    if(isNew)d.customers=[{...clean,id:uid(),balance:0,createdAt:new Date().toISOString()},...(d.customers||[])];
    else d.customers=(d.customers||[]).map(c=>c.id===clean.id?{...c,...clean}:c);
    await saveData(d);setCustModal(false);setEditCust(null);
    toast(isNew?"Customer added!":"Customer updated!");
  };

  const makePayment=()=>{
    const amt=parseFloat(payAmt);
    if(!amt||amt<=0){toast("Enter a valid amount!","err");return;}
    const cust=customers.find(c=>c.id===payModal.id);
    if(!cust){toast("Customer not found!","err");return;}
    if(amt>cust.balance+0.01){toast(`Exceeds balance of ${fmt(cust.balance)}!`,"err");return;}
    const snap={...payModal},amtSnap=amt;
    setPayModal(null);setPayAmt("");
    setTimeout(()=>{
      setConfirm({
        title:"Confirm Payment",
        msg:`Record ${fmt(amtSnap)} payment from ${snap.name}?\nRemaining: ${fmt(Math.max(0,snap.balance-amtSnap))}`,
        icon:"💵",confirmText:"Confirm",
        onConfirm:async()=>{
          const d=getLS();
          const ci=d.customers.findIndex(c=>c.id===snap.id);
          if(ci>=0)d.customers[ci].balance=parseFloat(Math.max(0,d.customers[ci].balance-amtSnap).toFixed(2));
          d.utangLedger=[{id:uid(),customerId:snap.id,type:"payment",amount:amtSnap,
            description:"Partial payment",date:new Date().toISOString()},...(d.utangLedger||[])];
          await saveData(d);toast("Payment recorded! 💵");okBeep();
        }
      });
    },60);
  };

  const deleteCust=c=>setConfirm({
    title:"Delete Customer",msg:`Delete "${c.name}"?\nAll records will be removed.`,icon:"🗑️",danger:true,confirmText:"Delete",
    onConfirm:async()=>{
      const d=getLS();
      d.customers=(d.customers||[]).filter(x=>x.id!==c.id);
      d.utangLedger=(d.utangLedger||[]).filter(l=>l.customerId!==c.id);
      await saveData(d);toast("Customer deleted.");
    }
  });

  return(
    <div style={{display:"contents"}}>
      {custModal&&(
        <div className="backdrop">
          <div className="msheet" style={{maxWidth:440,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:18,fontSize:16}}>{editCust?"✏️ Edit Customer":"➕ Add Customer"}</h3>
            <CustForm init={editCust||{}} onSave={handleSaveCust} onClose={()=>{setCustModal(false);setEditCust(null);}}/>
          </div>
        </div>
      )}

      {payModal&&(
        <div className="backdrop">
          <div className="msheet" style={{maxWidth:360,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:16}}>💵 Payment</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:6}}>{payModal.name}</p>
            <div style={{background:"var(--wnl)",border:"1.5px solid var(--wn)",borderRadius:"var(--rs)",padding:12,marginBottom:16}}>
              <span style={{color:"var(--wn)",fontWeight:600}}>Balance: {fmt(payModal.balance)}</span>
            </div>
            <div style={{display:"flex",gap:7,marginBottom:12,flexWrap:"wrap"}}>
              {[20,50,100,200,500].filter(a=>a<=payModal.balance).map(a=>(
                <button key={a} className="btn bg2 bsm" onClick={()=>setPayAmt(String(a))}>{fmt(a)}</button>
              ))}
              <button className="btn bg2 bsm" onClick={()=>setPayAmt(String(payModal.balance))}>Full</button>
            </div>
            <div className="fg">
              <label>Amount to Pay (partial ok!)</label>
              <input type="number" inputMode="decimal" placeholder="e.g. 50" value={payAmt}
                onChange={e=>setPayAmt(e.target.value)} autoFocus
                onKeyDown={e=>{if(e.key==="Enter"){e.target.blur();makePayment();}}}/>
            </div>
            {parseFloat(payAmt)>0&&parseFloat(payAmt)<=payModal.balance&&(
              <div style={{background:"var(--acl)",border:"1.5px solid var(--ac)",borderRadius:"var(--rs)",padding:12,marginBottom:14,fontSize:13}}>
                Remaining after payment: <strong>{fmt(Math.max(0,payModal.balance-parseFloat(payAmt)))}</strong>
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button className="btn bg2" style={{flex:1}} onClick={()=>{setPayModal(null);setPayAmt("");}}>Cancel</button>
              <button className="btn bp" style={{flex:1}} onClick={makePayment}>✅ Confirm</button>
            </div>
          </div>
        </div>
      )}

      {ledgerCust&&(
        <div className="backdrop">
          <div className="msheet mlg" style={{alignSelf:"center",borderRadius:"var(--r)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontWeight:700,fontSize:16}}>📋 {ledgerCust.name}'s Ledger</h3>
              <button className="btn bg2 bsm" onClick={()=>setLedgerCust(null)}>✕</button>
            </div>
            <div style={{background:ledgerCust.balance>0?"var(--wnl)":"var(--acl)",border:`1.5px solid ${ledgerCust.balance>0?"var(--wn)":"var(--ac)"}`,borderRadius:"var(--rs)",padding:14,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:12,color:"var(--tx2)"}}>Current Balance</div>
              <div style={{fontSize:28,fontWeight:700,color:ledgerCust.balance>0?"var(--wn)":"var(--ac)"}}>{fmt(ledgerCust.balance)}</div>
            </div>
            <div className="twrap">
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th></tr></thead>
                <tbody>
                  {ledger.filter(l=>l.customerId===ledgerCust.id).length===0&&(
                    <tr><td colSpan={4} style={{textAlign:"center",color:"var(--tx3)",padding:24}}>No records</td></tr>
                  )}
                  {[...ledger.filter(l=>l.customerId===ledgerCust.id)]
                    .sort((a,b)=>new Date(b.date)-new Date(a.date)).map(l=>(
                    <tr key={l.id}>
                      <td style={{fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(l.date)}<br/><span style={{color:"var(--tx3)"}}>{fmtTime(l.date)}</span></td>
                      <td><span className={`badge ${l.type==="payment"?"bg-g":"bg-r"}`}>{l.type==="payment"?"Payment":"Utang"}</span></td>
                      <td style={{fontWeight:700,color:l.type==="payment"?"var(--ac)":"var(--dn)"}}>{l.type==="payment"?"+":"−"}{fmt(l.amount)}</td>
                      <td style={{fontSize:12,color:"var(--tx2)"}}>{l.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Utang page: header pinned, list scrolls beneath */}
      <div className="pg-page">
        <div className="pg-hdr">
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:10}}>
            <h1 style={{fontSize:19,fontWeight:800}}>📋 Utang </h1>
            <button className="btn bp bsm" onClick={()=>{setEditCust(null);setCustModal(true);}}>+ Add Customer</button>
          </div>
          {/* Total utang summary inside header */}
          <div style={{background:"var(--wnl)",border:"1.5px solid var(--wn)",borderRadius:"var(--rs)",padding:"10px 14px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:11,color:"var(--tx2)",fontWeight:500}}>Total Uncollected Utang</div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--wn)"}}>{fmt(totalUtang)}</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>{customers.filter(c=>c.balance>0).length} with balance</div>
            </div>
            <span style={{fontSize:28}}>💳</span>
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, contact, or address…"/>
        </div>

        {/* Customer list — scrollable */}
        <div className="pg-body" style={{display:"flex",flexDirection:"column",gap:12}}>
          {filteredCustomers.length===0&&(
            <div className="card" style={{padding:32,textAlign:"center",color:"var(--tx3)"}}>
              {search?"No customers match your search.":"No customers yet."}
            </div>
          )}
          {filteredCustomers.map(c=>(
            <div key={c.id} className="card" style={{padding:"16px 18px"}}>
              {/* Header row: avatar + name/contact + status badge */}
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:"var(--acl)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,color:"var(--ac)",flexShrink:0}}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:15,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                  <div style={{fontSize:12,color:"var(--tx3)"}}>{c.contact?"Contact: "+c.contact:"—"}</div>
                </div>
                <span className={`badge ${c.balance>0?"bg-r":"bg-g"}`} style={{fontSize:12,padding:"4px 12px",flexShrink:0}}>
                  {c.balance>0?"ACTIVE UTANG":"PAID"}
                </span>
              </div>
              {/* Balance row */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:13,color:"var(--tx2)"}}>Current Balance:</span>
                <span style={{fontSize:18,fontWeight:800,color:c.balance>0?"var(--dn)":"var(--ac)"}}>{fmt(c.balance)}</span>
              </div>
              {/* Action buttons */}
              <div style={{display:"grid",gridTemplateColumns:c.balance>0?"1fr 1fr auto auto":"1fr auto auto",gap:8,alignItems:"center"}}>
                <button className="btn bg2 bsm" style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={()=>setLedgerCust(c)}>📋 Ledger</button>
                {c.balance>0&&<button className="btn bp bsm" style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} onClick={()=>{setPayModal(c);setPayAmt("");}}>💵 Payment</button>}
                <button className="btn bg2 bsm" style={{padding:"7px 12px",flexShrink:0}} onClick={()=>{setEditCust({...c});setCustModal(true);}}>✏️</button>
                <button className="btn bd2 bsm" style={{padding:"7px 12px",flexShrink:0}} onClick={()=>deleteCust(c)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>{/* /pg-page */}
    </div>
  );
}

function CustForm({init,onSave,onClose}){
  const [form,setForm]=useState({name:"",contact:"",address:"",...init});
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const isNew=!init.id;
  return(
    <div>
      <div className="fg"><label>Full Name *</label>
        <input placeholder="e.g. Aling Maria" value={form.name}
          onChange={e=>s("name",e.target.value)} autoFocus maxLength={100}/>
      </div>
      <div className="fg"><label>Contact Number</label>
        <input placeholder="09XXXXXXXXX" inputMode="numeric" value={form.contact} maxLength={11}
          onChange={e=>s("contact",e.target.value.replace(/[^0-9]/g,"").slice(0,11))}/>
        {form.contact.length>0&&form.contact.length<11&&(
          <div style={{fontSize:12,color:"var(--dn)",marginTop:5}}>Must be exactly 11 digits.</div>
        )}
      </div>
      <div className="fg"><label>Address</label>
        <input placeholder="e.g. Blk 2 Lot 5" value={form.address}
          onChange={e=>s("address",e.target.value)} maxLength={200}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:6}}>
        <button className="btn bg2" style={{flex:1}} onClick={onClose}>✕ Cancel</button>
        <button className="btn bp" style={{flex:1}} onClick={()=>onSave(form,isNew)}>💾 Save</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════ */
function Reports({db}){
  const [period,setPeriod]=useState("daily");
  const [busy,  setBusy]  =useState(false);
  const txns=db.transactions||[];
  const now=new Date();
  const filtered=txns.filter(t=>{
    const d=new Date(t.date);
    if(period==="daily")  return t.date?.startsWith(today());
    if(period==="weekly") return (now-d)/86400000<=7;
    if(period==="monthly")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
    return true;
  });
  const cashSales =filtered.filter(t=>!t.isUtang).reduce((s,t)=>s+(t.total||0),0);
  const utangSales=filtered.filter(t=>t.isUtang).reduce((s,t)=>s+(t.total||0),0);
  const ps={};
  filtered.forEach(t=>t.items?.forEach(i=>{
    if(!ps[i.id])ps[i.id]={name:i.name,qty:0,revenue:0};
    ps[i.id].qty+=i.qty;ps[i.id].revenue+=i.price*i.qty;
  }));
  const top=Object.values(ps).sort((a,b)=>b.revenue-a.revenue).slice(0,12);

  const doExport=async()=>{
    setBusy(true);
    try{
      await toExcel([
        {name:"Summary",rows:[
          ["Period",period],["Export Date",new Date().toLocaleString("en-PH")],[""],
          ["Cash Sales",cashSales],["Credit / Utang",utangSales],
          ["Gross Revenue",cashSales+utangSales],["Total Transactions",filtered.length]
        ]},
        {name:"Transactions",rows:[
          ["Date","Time","Items","Total (₱)","Type","Customer"],
          ...filtered.map(t=>[fmtDate(t.date),fmtTime(t.date),
            t.items?.map(i=>`${i.name} x${i.qty}`).join("; ")||"",
            t.total,t.isUtang?"Utang":"Cash",
            t.isUtang?(db.customers||[]).find(c=>c.id===t.customerId)?.name||"—":"—"])
        ]},
        {name:"Product Sales",rows:[
          ["Product","Qty Sold","Revenue (₱)"],
          ...top.map(p=>[p.name,p.qty,p.revenue])
        ]},
        {name:"Customers",rows:[
          ["Name","Contact","Address","Balance (₱)"],
          ...[...(db.customers||[])].sort((a,b)=>a.name.localeCompare(b.name))
            .map(c=>[c.name,c.contact||"",c.address||"",c.balance||0])
        ]},
      ],`sari-report-${period}-${today()}.xlsx`);
      toast("Report exported! 📊");
    }catch(e){toast("Export failed: "+(e?.message||String(e)).slice(0,80),"err");}
    finally{setBusy(false);}
  };

  return(
    <div className="pg-page">
      {/* Header */}
      <div className="pg-hdr">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12}}>
          <h1 style={{fontSize:19,fontWeight:800}}>📈 Reports</h1>
          <button className="btn bp bsm" onClick={doExport} disabled={busy}>
            {busy?"⏳ Exporting…":"📊 Export Excel"}
          </button>
        </div>
        <div className="tabs" style={{marginBottom:0,borderBottom:"2px solid var(--bd)"}}>
          {["daily","weekly","monthly","all"].map(p=>(
            <div key={p} className={`tabi ${period===p?"on":""}`} onClick={()=>setPeriod(p)}>
              {p.charAt(0).toUpperCase()+p.slice(1)}
            </div>
          ))}
        </div>
      </div>

      <div className="pg-body">
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
          <div className="sc"><div style={{fontSize:24}}>💵</div><div className="sn" style={{color:"var(--ac)"}}>{fmt(cashSales)}</div><div className="sl">Cash Sales</div></div>
          <div className="sc"><div style={{fontSize:24}}>🧾</div><div className="sn" style={{color:"var(--in)"}}>{filtered.length}</div><div className="sl">Transactions</div></div>
          <div className="sc"><div style={{fontSize:24}}>📋</div><div className="sn" style={{color:"var(--wn)"}}>{fmt(utangSales)}</div><div className="sl">On Credit</div></div>
          <div className="sc"><div style={{fontSize:24}}>💰</div><div className="sn" style={{color:"#8e44ad"}}>{fmt(cashSales+utangSales)}</div><div className="sl">Gross Revenue</div></div>
        </div>
        <div className="card" style={{padding:18,marginBottom:18}}>
          <h3 style={{fontWeight:700,marginBottom:14,fontSize:14}}>Top Products by Revenue</h3>
          {top.length===0?<p style={{color:"var(--tx3)",fontSize:13}}>No sales data for this period.</p>:top.map((p,i)=>(
            <div key={i} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:4}}>
                <span style={{fontWeight:600}}>{i+1}. {p.name}</span>
                <span style={{color:"var(--ac)",fontWeight:700}}>{fmt(p.revenue)}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div className="pw" style={{flex:1}}><div className="pb" style={{width:`${Math.min(100,(p.revenue/(top[0]?.revenue||1))*100)}%`}}/></div>
                <span style={{fontSize:11,color:"var(--tx3)",minWidth:44,textAlign:"right"}}>{p.qty} sold</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card" style={{padding:18}}>
          <h3 style={{fontWeight:700,marginBottom:14,fontSize:14}}>Transaction Log</h3>
          <div className="twrap">
            <table>
              <thead><tr><th>Date</th><th>Time</th><th>Items</th><th>Total</th><th>Type</th></tr></thead>
              <tbody>
                {filtered.length===0&&<tr><td colSpan={5} style={{textAlign:"center",color:"var(--tx3)",padding:24}}>No transactions in this period.</td></tr>}
                {filtered.slice(0,50).map(t=>(
                  <tr key={t.id}>
                    <td style={{fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(t.date)}</td>
                    <td style={{fontSize:12,whiteSpace:"nowrap"}}>{fmtTime(t.date)}</td>
                    <td style={{fontSize:12,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.items?.map(i=>i.name).join(", ")}</td>
                    <td style={{fontWeight:700,color:"var(--ac)"}}>{fmt(t.total)}</td>
                    <td><span className={`badge ${t.isUtang?"bg-y":"bg-g"}`}>{t.isUtang?"Utang":"Cash"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════ */
function SettingsPage({db,saveData,dark,toggleDark,setConfirm,logout,setPage}){
  const [form,    setForm]    = useState({...db.settings});
  const [tab,     setTab]     = useState("store");
  const [pinFlow, setPinFlow] = useState("idle");
  const [oldPin,  setOldPin]  = useState("");
  const [newPin,  setNewPin]  = useState("");
  const [confPin, setConfPin] = useState("");
  const [busy,    setBusy]    = useState(false);
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));

  const saveSettings=async()=>{
    const d=getLS();d.settings={...d.settings,...form};
    await saveData(d);toast("Settings saved! ✅");
  };

  const handlePinKey=digit=>{
    if(digit==="⌫"){
      beep(300,55);
      if(pinFlow==="old"||pinFlow==="disableVerify") setOldPin(p=>p.slice(0,-1));
      else if(pinFlow==="new")     setNewPin(p=>p.slice(0,-1));
      else if(pinFlow==="confirm") setConfPin(p=>p.slice(0,-1));
      return;
    }
    beep(600,55);
    if(pinFlow==="disableVerify"){
      const np=oldPin+digit;if(np.length>4)return;setOldPin(np);
      if(np.length===4)setTimeout(()=>{
        if(np===db.settings.pin){confirmDisablePin();}
        else{errBeep();setOldPin("");toast("Wrong PIN","err");}
      },280);
    } else if(pinFlow==="old"){
      const np=oldPin+digit;if(np.length>4)return;setOldPin(np);
      if(np.length===4)setTimeout(()=>{
        if(np===db.settings.pin){setOldPin("");setPinFlow("new");}
        else{errBeep();setOldPin("");toast("Wrong current PIN","err");}
      },280);
    } else if(pinFlow==="new"){
      const np=newPin+digit;if(np.length>4)return;setNewPin(np);
      if(np.length===4)setTimeout(()=>setPinFlow("confirm"),280);
    } else if(pinFlow==="confirm"){
      const cp=confPin+digit;if(cp.length>4)return;setConfPin(cp);
      if(cp.length===4){
        setTimeout(async()=>{
          if(cp===newPin){
            const d=getLS();d.settings.pin=cp;d.settings.pinEnabled=true;
            await saveData(d);
            setPinFlow("idle");setNewPin("");setConfPin("");setOldPin("");
            toast("PIN set successfully! 🔒");okBeep();
          }else{
            errBeep();setNewPin("");setConfPin("");setPinFlow("new");
            toast("PINs don't match. Re-enter new PIN.","err");
          }
        },280);
      }
    }
  };

  /* Disable PIN — requires current PIN verification */
  const startDisablePin=()=>{
    setOldPin("");setNewPin("");setConfPin("");
    setPinFlow("disableVerify");
  };
  const confirmDisablePin=async()=>{
    const d=getLS();d.settings.pin="";d.settings.pinEnabled=false;
    await saveData(d);
    setPinFlow("idle");setOldPin("");
    toast("PIN disabled.");
  };

  const startChangePin=()=>{
    setOldPin("");setNewPin("");setConfPin("");
    setPinFlow(db.settings.pinEnabled&&db.settings.pin?"old":"new");
  };

  const exportBackup=async()=>{
    setBusy(true);
    try{
      const d=getLS();
      await toExcel([
        {name:"Settings",rows:[
          ["Key","Value"],
          ...Object.entries(d.settings||{}).filter(([k])=>k!=="pin"&&k!=="adminPass").map(([k,v])=>[k,String(v)])
        ]},
        {name:"Products",rows:[
          ["id","name","category","price","stock","isOpenPrice","createdAt"],
          ...[...(d.products||[])].sort((a,b)=>a.name.localeCompare(b.name))
            .map(p=>[p.id,p.name,p.category,p.price,p.stock,p.isOpenPrice?"Yes":"No",p.createdAt||""])
        ]},
        {name:"Customers",rows:[
          ["id","name","contact","address","balance","createdAt"],
          ...[...(d.customers||[])].sort((a,b)=>a.name.localeCompare(b.name))
            .map(c=>[c.id,c.name,c.contact||"",c.address||"",c.balance||0,c.createdAt||""])
        ]},
        {name:"Transactions",rows:[
          ["id","date","items","total","cash","change","isUtang","customerId"],
          ...(d.transactions||[]).map(t=>[t.id,t.date,t.items?.map(i=>`${i.name} x${i.qty}`).join("; ")||"",
            t.total,t.cash||0,t.change||0,t.isUtang?"Yes":"No",t.customerId||""])
        ]},
        {name:"UtangLedger",rows:[
          ["id","customerId","type","amount","description","date"],
          ...(d.utangLedger||[]).map(l=>[l.id,l.customerId,l.type,l.amount,l.description||"",l.date])
        ]},
      ],`sari-backup-${today()}.xlsx`);
      toast("Backup exported! 📊");
    }catch(e){toast("Export failed: "+(e?.message||String(e)).slice(0,80),"err");}
    finally{setBusy(false);}
  };

  const importBackup=()=>{
    const inp=document.createElement("input");inp.type="file";inp.accept=".xlsx,.xls";
    inp.onchange=async e=>{
      const file=e.target.files?.[0];if(!file)return;
      try{
        const sheets=await fromExcel(file);
        setConfirm({title:"Import Backup",msg:"This will REPLACE all current data.\nAre you sure?",icon:"⚠️",danger:true,confirmText:"Import",
          onConfirm:async()=>{
            const d=getLS();
            if(sheets.Products){
              d.products=(sheets.Products||[]).map(r=>({
                id:r.id||uid(),name:sanitize(r.name||""),category:r.category||"Others",
                price:parseFloat(r.price)||0,stock:parseInt(r.stock)||0,
                isOpenPrice:r.isOpenPrice==="Yes",createdAt:r.createdAt||new Date().toISOString()
              }));
            }
            if(sheets.Customers){
              d.customers=(sheets.Customers||[]).map(r=>({
                id:r.id||uid(),name:sanitize(r.name||""),contact:sanitize(r.contact||""),
                address:sanitize(r.address||""),balance:parseFloat(r.balance)||0,
                createdAt:r.createdAt||new Date().toISOString()
              }));
            }
            if(sheets.Transactions){
              d.transactions=(sheets.Transactions||[]).map(r=>({
                id:r.id||uid(),date:r.date||new Date().toISOString(),
                items:[],total:parseFloat(r.total)||0,
                cash:parseFloat(r.cash)||0,change:parseFloat(r.change)||0,
                isUtang:r.isUtang==="Yes",customerId:r.customerId||null
              }));
            }
            if(sheets.UtangLedger){
              d.utangLedger=(sheets.UtangLedger||[]).map(r=>({
                id:r.id||uid(),customerId:sanitize(r.customerId||""),
                type:r.type==="payment"?"payment":"utang",amount:parseFloat(r.amount)||0,
                description:sanitize(r.description||""),date:r.date||new Date().toISOString()
              }));
            }
            d.initialized=true;
            await saveData(d);toast("Data imported from Excel! ✅");
          }
        });
      }catch(e){toast("Import failed: "+(e?.message||String(e)).slice(0,80),"err");}
    };
    inp.click();
  };

  const resetAll=()=>setConfirm({
    title:"Reset ALL Data",
    msg:"This will DELETE all products, sales, and customers.\nThis action is PERMANENT and cannot be undone.",
    icon:"☠️",danger:true,confirmText:"Yes, Delete Everything",
    onConfirm:()=>{localStorage.removeItem(LS_KEY);window.location.reload();}
  });

  const pinLabel={idle:"",old:"Enter your CURRENT PIN",disableVerify:"Enter your CURRENT PIN to disable",new:"Enter your NEW PIN",confirm:"Confirm your new PIN"};
  const curPin=pinFlow==="old"||pinFlow==="disableVerify"?oldPin:pinFlow==="new"?newPin:confPin;

  /* Mobile: all tabs including Reports link; Desktop: all tabs */
  const settingsTabs=[
    {id:"store",    label:"🏪 Store"},
    {id:"security", label:"🔒 Security"},
    {id:"backup",   label:"💾 Backup"},
    {id:"reports",  label:"📈 Reports", mobileOnly:true},
    {id:"danger",   label:"⚠️ Danger"},
  ];

  return(
    <div className="pg-page">
      {/* Header */}
      <div className="pg-hdr">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
          <h1 style={{fontSize:19,fontWeight:800}}>⚙️ Settings</h1>
          <button className="btn bp bsm" onClick={saveSettings}>💾 Save</button>
        </div>
        <div className="tabs" style={{marginBottom:0,borderBottom:"2px solid var(--bd)"}}>
          {settingsTabs.map(t=>{
            /* Show Reports tab only on mobile (hidden on desktop — it has sidebar) */
            if(t.mobileOnly) return(
              <div key={t.id} className="tabi" style={{display:"none"}}
                ref={el=>{if(el)el.style.display=window.innerWidth<=768?"block":"none";}}>
                {t.label}
              </div>
            );
            return(
              <div key={t.id} className={`tabi ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>
                {t.label}
              </div>
            );
          })}
          {/* Reports tab — mobile only, rendered inline */}
          <div className="tabi" id="reports-tab"
            style={{display:"none"}}
            onClick={()=>setPage("reports")}>
            📈 Reports
          </div>
        </div>
      </div>

      <div className="pg-body">
        {tab==="store"&&(
          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,marginBottom:16,fontSize:15}}>Store Information</h3>
            <div className="fg"><label>Store Name</label><input value={form.storeName} onChange={e=>s("storeName",e.target.value)}/></div>
            <div className="fg"><label>Address</label><input value={form.address} onChange={e=>s("address",e.target.value)}/></div>
            <div className="fg"><label>Contact Number</label>
              <input type="text" value={form.contact} maxLength={11}
                onChange={e=>s("contact",e.target.value.replace(/[^0-9]/g,"").slice(0,11))}/>
              {form.contact.length>0&&form.contact.length<11&&(
                <div style={{fontSize:12,color:"var(--dn)",marginTop:5}}>Must be exactly 11 digits.</div>
              )}
            </div>
            <div className="fg">
              <label>Low Stock Alert Threshold</label>
              <input type="number" min="1" value={form.lowStockThreshold} onChange={e=>s("lowStockThreshold",parseInt(e.target.value)||5)}/>
              <div style={{fontSize:12,color:"var(--tx2)",marginTop:5}}>Alert when stock falls to or below this number.</div>
            </div>
            {/* Reports shortcut — mobile only, inside Store tab */}
            <div id="mob-reports-link" style={{display:"none",padding:"14px 0",borderTop:"1px solid var(--bd)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><div style={{fontWeight:600,fontSize:14}}>📈 Reports</div><div style={{fontSize:12,color:"var(--tx2)"}}>View sales reports</div></div>
                <button className="btn bg2 bsm" onClick={()=>setPage("reports")}>Open →</button>
              </div>
            </div>
            {/* Log Out — mobile only, at bottom of Store tab */}
            <div id="mob-logout-store" style={{display:"none",padding:"14px 0",borderTop:"1px solid var(--bd)"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div><div style={{fontWeight:600,fontSize:14}}>Log Out</div><div style={{fontSize:12,color:"var(--tx2)"}}>Sign out from this device</div></div>
                <button className="btn bd2 bsm" onClick={logout}>🚪 Log Out</button>
              </div>
            </div>
          </div>
        )} 

        {tab==="security"&&(
          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:15}}>🔒 PIN Lock</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:16}}>A 4-digit PIN for daily quick access after login.</p>
            <div style={{display:"flex",gap:10,marginBottom:20,alignItems:"center",flexWrap:"wrap"}}>
              {db.settings.pinEnabled
                ?<span className="badge bg-g" style={{fontSize:13}}>✅ PIN Enabled</span>
                :<span className="badge bg-r" style={{fontSize:13}}>❌ PIN Not Set</span>}
            </div>
            {db.settings.pinEnabled&&pinFlow==="idle"&&(
              <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
                <button className="btn bg2 bsm" onClick={startChangePin}>🔄 Change PIN</button>
                {/* Disable PIN now requires password */}
                <button className="btn bd2 bsm" onClick={startDisablePin}>🔓 Disable PIN</button>
              </div>
            )}
            {!db.settings.pinEnabled&&pinFlow==="idle"&&(
              <button className="btn bp bsm" style={{marginBottom:20}} onClick={startChangePin}>🔒 Set PIN</button>
            )}
            {pinFlow!=="idle"&&(
              <div style={{background:"var(--sf2)",borderRadius:"var(--rs)",padding:22,textAlign:"center"}}>
                <p style={{fontWeight:600,fontSize:14,marginBottom:20,color:"var(--tx)"}}>{pinLabel[pinFlow]}</p>
                <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:26}}>
                  {[0,1,2,3].map(i=><div key={i} className={`pin-dot ${i<curPin.length?"on":""}`}/>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,justifyItems:"center",maxWidth:260,margin:"0 auto 16px"}}>
                  {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
                    <button key={i} className="pin-key" style={{opacity:k===""?0:1,pointerEvents:k===""?"none":"auto",width:64,height:64,fontSize:19}} onClick={()=>k&&handlePinKey(k)}>{k}</button>
                  ))}
                </div>
                <button className="btn bg2 bsm" onClick={()=>{setPinFlow("idle");setOldPin("");setNewPin("");setConfPin("");}}>Cancel</button>
              </div>
            )}
          </div>
        )}

        {tab==="backup"&&(
          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:15}}>💾 Backup & Restore</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:20}}>Export your full data as an Excel file. Import it to restore everything.</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
              <button className="btn bp bsm" onClick={exportBackup} disabled={busy}>
                {busy?"⏳ Exporting…":"📊 Export Backup (Excel)"}
              </button>
              <button className="btn bg2 bsm" onClick={importBackup}>⬆️ Import Backup (Excel)</button>
            </div>
            <div style={{background:"var(--inl)",border:"1.5px solid var(--in)",borderRadius:"var(--rs)",padding:14,marginBottom:12,fontSize:13,color:"var(--in)"}}>
              💡 Save backup to Google Drive. Restore on any device by importing the same file.
            </div>
            <div style={{background:"var(--acl)",border:"1.5px solid var(--ac)",borderRadius:"var(--rs)",padding:14,fontSize:13,color:"var(--ac)"}}>
              🌐 Multi-device sync: when online, all devices stay in sync automatically.
            </div>
          </div>
        )}

        {tab==="danger"&&(
          <div className="card" style={{padding:22,border:"1.5px solid var(--dn)"}}>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:15,color:"var(--dn)"}}>⚠️ Danger Zone</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:20}}>These actions are permanent and cannot be undone.</p>
            <button className="btn bd2" onClick={resetAll}>☠️ Reset ALL Data</button>
          </div>
        )}
      </div>

      {/* Inject mobile-only elements via a hidden style + inline script approach */}
      <style>{`
        @media(max-width:768px){
          #reports-tab{display:block!important}
          #mob-reports-link{display:block!important}
          #mob-logout-store{display:block!important}
        }
      `}</style>
    </div>
  );
}