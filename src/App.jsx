import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { auth, db as rtdb } from "./firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, deleteUser, signOut } from "firebase/auth";
import { ref as dbRef, get as dbGet, set as dbSet, onValue } from "firebase/database";
import { faHouse,faBoxesStacked,faClipboardList,faGear,faArrowsRotate,faCloudArrowUp,faLightbulb,faSkullCrossbones,faFileExport,faLockOpen,faXmark,faCartShopping,faPlus,faChartLine,faFilePen,faHandHoldingDollar,faFloppyDisk,faPen,faTrashCan,faStore,faLock,faTriangleExclamation,faRightFromBracket,faPrint,faMagnifyingGlass,faEye,faEyeSlash,faDownload,faWallet,faMobileScreenButton,faCircleQuestion,faEnvelope,faPaperPlane,faEllipsis,faCircleUser,faChevronDown,faBookOpen,faCalendarDay,faCalendarWeek,faCalendarDays,faInfinity,faFileLines,faSquarePlus,faCircleInfo,faTags} from "@fortawesome/free-solid-svg-icons";

/* ── FONT ── */
{
  const fl=document.createElement("link");
  fl.rel="stylesheet";
  fl.href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
  document.head.appendChild(fl);
}

/* ── GLOBAL CSS — single authoritative stylesheet, no secondary <style> tags ── */
{
  const gs=document.createElement("style");
  gs.textContent=`

/* ─── RESET ─────────────────────────────────────────────── */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* ─── SCROLLBAR: globally invisible ─────────────────────── */
::-webkit-scrollbar{display:none!important}
*{scrollbar-width:none;-ms-overflow-style:none}

/* ─── ROOT / THEME ──────────────────────────────────────── */
html,body{
  height:100dvh;width:100vw;
  font-family:'Poppins',sans-serif;
  font-size:14px;font-weight:400;line-height:1.5;
  -webkit-tap-highlight-color:transparent;
  overflow:hidden;
  background:var(--bg);color:var(--tx)}

:root{
  --bg:#f8f7f5;--sf:#ffffff;--sf2:#f0ede8;--bd:#e5e1da;
  --tx:#1a1814;--tx2:#6b6358;--tx3:#a89f95;
  --ac:#2d6a4f;--ac2:#40916c;--acl:#e8f5ee;--acd:#b7e4c7;
  --dn:#c0392b;--dnl:#fdf2f1;
  --wn:#b86e00;--wnl:#fdf6e3;
  --in:#1a6db5;--inl:#edf4fc;
  --r:12px;--rs:8px;
  --sh:0 1px 3px rgba(0,0,0,.06),0 1px 8px rgba(0,0,0,.04);
  --shlg:0 8px 32px rgba(0,0,0,.10);
  --nav-h:62px
}
.dark{
  --bg:#111109;--sf:#1c1b17;--sf2:#252420;--bd:#333028;
  --tx:#f0ede6;--tx2:#a09890;--tx3:#6a6358;
  --ac:#52b788;--ac2:#74c69d;--acl:#1a3d2b;--acd:#2d6a4f;
  --dn:#e05252;--dnl:#2d1212;
  --wn:#f0a500;--wnl:#2a1e00;
  --in:#56adf5;--inl:#0d1e33;
  --sh:0 1px 4px rgba(0,0,0,.25);--shlg:0 8px 32px rgba(0,0,0,.5)
}

/* ─── BASE ELEMENTS ─────────────────────────────────────── */
input,select,textarea,button{font-family:'Poppins',sans-serif;font-size:14px}
button{cursor:pointer;transition:all .18s;border:none;background:none}
button:active{transform:scale(.97)}
input,select,textarea{
  background:var(--sf);border:1.5px solid var(--bd);border-radius:var(--rs);
  color:var(--tx);padding:12px 14px;width:100%;font-size:14px;font-weight:400;
  min-height:44px;outline:none;
  transition:border .18s,box-shadow .18s;-webkit-appearance:none;appearance:none}
input:focus,select:focus,textarea:focus{
  border-color:var(--ac);box-shadow:0 0 0 3px var(--acl)}
input[type=checkbox]{
  width:18px;height:18px;accent-color:var(--ac);cursor:pointer;
  flex-shrink:0;min-height:unset}

/* ─── APP SHELL ─────────────────────────────────────────── */
.app-root{
  font-family:'Poppins',sans-serif;
  background:var(--bg);color:var(--tx);
  display:flex;flex-direction:column;
  width:100vw;height:100dvh;
  overflow:hidden;position:fixed;
  transition:background .25s,color .25s}

/* ─── LAYOUT ────────────────────────────────────────────── */
.mwrap{display:flex;flex:1;min-height:0;overflow:hidden;width:100%}


/* pbody: pure flex size anchor — no padding, no visual properties */
.pbody{flex:1;overflow:hidden;min-width:0;height:103dvh;display:flex;flex-direction:column}
@media(min-width:769px){.pbody{height:auto}}

.pg-page{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden;background:var(--bg)}

/* pg-act: upper-right action button row, sits above the header strip with no container */
.pg-act{display:flex;justify-content:flex-end;flex-shrink:0;padding:10px 24px 10px;background:var(--bg)}
@media(max-width:768px){.pg-act{padding:10px 16px}}
.pg-hdr{
  flex-shrink:0;background:var(--sf);
  padding:16px 24px;
  border-bottom:1px solid var(--bd);
  z-index:10;transition:background .25s}
@media(max-width:768px){.pg-hdr{padding:12px 16px}}

/* pg-body: the one scroll container per page */
.pg-body{
  flex:1;min-height:0;
  overflow-y:auto;overflow-x:hidden;
  -webkit-overflow-scrolling:touch;
  padding:4px 0px 0;
  background:var(--bg)}
@media(max-width:768px){
  .pg-body{padding:0}}

/* pg-spacer: last child inside every pg-body — real element, not padding,
   so it does NOT become phantom scrollable blank space */
.pg-spacer{
  display:block;width:100%;
  height:calc(var(--nav-h) + env(safe-area-inset-bottom,0px));
  flex-shrink:0;pointer-events:none}

/* ─── TOPBAR (no hamburger anywhere: desktop uses the permanent sidebar,
       mobile uses the bottom-nav "More" button to open the drawer) ── */
.topbar{
  display:flex;align-items:center;justify-content:space-between;
  padding:12px 16px;background:var(--sf);border-bottom:1px solid var(--bd);
  z-index:100;gap:8px;flex-shrink:0;width:100%}

.topbar-left{display:flex;align-items:center;gap:10px;min-width:0}
.topbar-ic{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  width:34px;height:34px;border-radius:10px;background:var(--acl);color:var(--ac);font-size:15px}
.topbar-title{
  font-size:17px;font-weight:700;color:var(--tx);line-height:1.3;
  min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ─── BOTTOM NAV (mobile) ───────────────────────────────── */
.botnav{
  display:none;
  position:fixed;bottom:0;left:0;right:0;
  height:var(--nav-h);
  background:var(--sf);border-top:1px solid var(--bd);
  z-index:999;
  padding-bottom:env(safe-area-inset-bottom,0px);
  align-items:flex-end;justify-content:space-around;
  overflow:visible}
@media(max-width:768px){.botnav{display:flex}}

.ntab{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;
  padding:8px 4px;font-size:10px;font-weight:500;
  color:var(--tx3);background:none;border:none;border-radius:0;
  transition:color .18s}
.ntab.on{color:var(--ac)}
.ntab span{font-size:20px;line-height:1}

/* POS FAB */
.ntab-pos-wrap{
  flex:1;position:relative;
  display:flex;flex-direction:column;
  align-items:center;justify-content:flex-end;
  padding-bottom:30px;overflow:visible}
.ntab-pos{
  position:absolute;top:-25px;left:50%;transform:translateX(-50%);
  display:flex;flex-direction:column;align-items:center;gap:3px;
  border:none;background:none;cursor:pointer;padding:0;z-index:1000}
.ntab-pos:active{transform:translateX(-50%)}
.ntab-pos-bubble{
  width:50px;height:50px;border-radius:50%;
  background:var(--ac);color:#fff;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;line-height:1;
  box-shadow:0 4px 16px rgba(45,106,79,.35);
  border:4px solid var(--bg);
  transition:transform .18s,box-shadow .18s}
.ntab-pos:active .ntab-pos-bubble{transform:scale(.92)}
.ntab-pos.on .ntab-pos-bubble{background:var(--ac2)}
.ntab-pos-label{font-size:10px;font-weight:600;color:var(--ac);margin-top:28px;line-height:1}
.ntab-pos.on .ntab-pos-label{color:var(--ac2)}

/* ─── SIDEBAR ITEMS ─────────────────────────────────────── */
.siditem{
  display:flex;align-items:center;gap:12px;padding:11px 14px;
  border-radius:var(--rs);cursor:pointer;transition:all .18s;
  color:var(--tx2);font-size:14px;font-weight:500;margin-bottom:2px;
  min-height:44px}
.siditem:hover{background:var(--sf2);color:var(--tx)}
.siditem.on{background:var(--acl);color:var(--ac);font-weight:600}

/* ─── NAV DRAWER (More) — slides in on desktop and mobile ── */
.nav-ov{
  position:fixed;inset:0;z-index:1700;
  background:rgba(0,0,0,.4);
  -webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);
  opacity:0;visibility:hidden;pointer-events:none;touch-action:none;
  transition:opacity .3s ease,visibility 0s linear .3s}
.nav-ov.open{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .3s ease,visibility 0s}
.nav-drawer{
  position:fixed;top:0;left:0;bottom:0;z-index:1750;
  width:min(300px,86vw);max-width:100%;
  background:var(--sf);border-right:1px solid var(--bd);box-shadow:var(--shlg);
  display:flex;flex-direction:column;
  padding:calc(16px + env(safe-area-inset-top,0px)) 12px calc(16px + env(safe-area-inset-bottom,0px));
  overflow-y:auto;overscroll-behavior:contain;
  transform:translateX(-100%);visibility:hidden;
  transition:transform .3s cubic-bezier(.4,0,.2,1),visibility 0s linear .3s}
.nav-drawer.open{transform:translateX(0);visibility:visible;transition:transform .3s cubic-bezier(.4,0,.2,1),visibility 0s}
@media(prefers-reduced-motion:reduce){.nav-ov,.nav-drawer{transition:none!important}}

/* ─── DESKTOP: the same drawer <aside> becomes the permanent sidebar ── */
:root{--side-w:260px}
@media(min-width:769px){
  .app-root.has-side{left:var(--side-w);width:calc(100vw - var(--side-w))}
  .nav-drawer{
    width:var(--side-w);
    transform:none!important;visibility:visible!important;transition:none;
    box-shadow:none;z-index:200}
  .nav-ov{display:none!important}
  .nav-drawer .nav-close{display:none}
}

/* ─── BUTTONS ───────────────────────────────────────────── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:7px;
  padding:0 20px;border-radius:var(--rs);font-size:14px;font-weight:600;
  min-height:44px;cursor:pointer;transition:all .18s;
  white-space:nowrap;border:none;text-decoration:none}
.bp{background:var(--ac);color:#fff}
.bp:hover{background:var(--ac2)}
.bg2{background:var(--sf2);color:var(--tx);border:1px solid var(--bd)}
.bg2:hover{background:var(--bd)}
.bd2{background:var(--dnl);color:var(--dn);border:1px solid var(--dn)}
.bd2:hover{background:var(--dn);color:#fff}
.bsm{min-height:36px;padding:0 14px;font-size:13px}
.blg{min-height:52px;padding:0 28px;font-size:15px;border-radius:var(--r)}

/* ─── FORMS ─────────────────────────────────────────────── */
.fg{margin-bottom:14px}
.fg label{display:block;font-size:13px;font-weight:600;color:var(--tx2);margin-bottom:6px}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:500px){.frow{grid-template-columns:1fr}}

/* ─── MINIMAL TRANSACTION FORM PIECES (GCash / E-Load) ───── */
.pseg{display:flex;gap:2px;padding:3px;background:var(--sf2);border:1px solid var(--bd);border-radius:12px}
.pseg.grid{display:grid}
.pseg button{flex:1;min-width:0;min-height:36px;padding:0 10px;border:none;background:none;border-radius:9px;
  font-weight:600;font-size:13px;color:var(--tx2);cursor:pointer;transition:background .18s,color .18s,box-shadow .18s}
.pseg button:hover{color:var(--tx)}
.pseg button.on{background:var(--sf);color:var(--ac);box-shadow:var(--sh)}
.pseg button:focus-visible{outline:2px solid var(--ac);outline-offset:1px}
.mf{position:relative}
.mf>span{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--tx3);font-weight:600;pointer-events:none}
.mf>input{padding-left:30px}
.mf.lg>span{font-size:20px}
.mf.lg>input{padding-left:36px;font-size:22px;font-weight:700;min-height:56px}
.tx-hint{font-size:12px;color:var(--tx3);margin-top:8px;text-align:center}
.tx-link{display:inline-flex;align-items:center;gap:6px;background:none;border:none;color:var(--ac);
  font-weight:600;font-size:13px;cursor:pointer;padding:6px 0;margin-bottom:10px}
.tx-link:hover{text-decoration:underline}
.tx-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;
  background:var(--sf2);border-radius:var(--rs);padding:10px 8px;margin-bottom:14px}
.tx-sum small{display:block;font-size:11px;color:var(--tx3);margin-bottom:2px}
.tx-sum b{font-size:13px}
.tx-actions{display:flex;gap:10px;margin-top:6px}
.tx-actions .bg2{flex:1}.tx-actions .bp{flex:2}

/* ─── CARDS / BADGES ────────────────────────────────────── */
.card{
  background:var(--sf);border-radius:var(--r);
  padding:20px;border:1px solid var(--bd)}
.badge{
  display:inline-flex;align-items:center;
  padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.bg-g{background:var(--acl);color:var(--ac)}
.bg-r{background:var(--dnl);color:var(--dn)}
.bg-y{background:var(--wnl);color:var(--wn)}
.bg-b{background:var(--inl);color:var(--in)}

/* ─── MODALS / SHEETS ───────────────────────────────────── */
.backdrop{
  position:fixed;inset:0;
  background:rgba(0,0,0,.4);
  z-index:2000;
  display:flex;align-items:flex-end;justify-content:center;
  backdrop-filter:blur(2px)}
@media(min-width:600px){.backdrop{align-items:center;padding:16px}}
.msheet{
  background:var(--sf);width:100%;
  border-radius:20px 20px 0 0;max-height:92dvh;overflow-y:auto;
  box-shadow:var(--shlg);animation:shUp .22s ease;
  padding:24px 20px max(24px,env(safe-area-inset-bottom))}
@media(min-width:600px){.msheet{border-radius:var(--r);max-height:88dvh;padding:28px}}
.mlg{max-width:680px}

/* Add/Edit Product dialog: compact so the action buttons always fit on screen, no scrolling */
.prod-sheet{padding:12px 16px max(14px,env(safe-area-inset-bottom))!important;max-height:100dvh}
.prod-sheet .shandle{margin-bottom:10px}
.prod-sheet .fg{margin-bottom:10px}
.prod-sheet .fg label{margin-bottom:4px;font-size:12.5px}
.prod-sheet input:not([type=checkbox]){min-height:42px;padding:8px 12px}
.prod-sheet .cp-trigger{min-height:42px;padding:8px 12px}
.prod-sheet .btn{min-height:44px}
@media(min-width:600px){.prod-sheet{padding:20px 22px!important}}
/* New E-Load transaction dialog: compact so the whole form fits on screen without scrolling */
.tx-sheet{padding:12px 16px max(14px,env(safe-area-inset-bottom))!important;max-height:100dvh}
.tx-sheet .shandle{margin-bottom:8px}
.tx-sheet h3{margin-bottom:10px!important}
.tx-sheet .fg{margin-bottom:8px}
.tx-sheet .fg label{margin-bottom:4px;font-size:12.5px}
.tx-sheet input:not([type=checkbox]){min-height:40px;padding:8px 12px}
.tx-sheet .mf.lg>input{min-height:46px;font-size:20px;padding-left:36px}
.tx-sheet .mf>input{padding-left:30px}
.tx-sheet .pseg button{min-height:32px}
.tx-sheet .tx-link{margin-bottom:6px;padding:2px 0}
.tx-sheet .tx-actions{margin-top:4px}
.tx-sheet .btn{min-height:42px}
.tx-sheet .tx-hint{margin-top:6px;margin-bottom:10px!important}
.tx-sheet .tx-sum{padding:6px 8px;margin-bottom:8px}
.tx-sheet .rg-sug{margin:0 0 8px;padding:5px 10px}
.tx-sheet .tx-warn{padding:6px 12px!important;margin-bottom:8px!important}
@media(min-width:600px){.tx-sheet{padding:20px 22px!important}}
@keyframes shUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
.shandle{width:40px;height:4px;background:var(--bd);border-radius:4px;margin:0 auto 16px}

/* ─── TABS ──────────────────────────────────────────────── */
.tabs{
  display:flex;gap:4px;padding:4px 0;margin-bottom:0;
  overflow-x:auto;border:none}
.tabi{
  padding:7px 16px;cursor:pointer;font-size:13px;font-weight:600;
  color:var(--tx2);border-radius:20px;transition:all .18s;
  white-space:nowrap;border:none;background:none;min-height:36px}
.tabi:hover{background:var(--sf2);color:var(--tx)}
.tabi.on{color:var(--ac);background:var(--acl)}

/* ─── SEARCH BAR ────────────────────────────────────────── */
.sbar{position:relative}
.sbar input{padding:7px 32px 7px 34px;font-size:13px;min-height:10px}
.sbic{
  position:absolute;left:11px;top:50%;transform:translateY(-50%);
  color:var(--tx3);font-size:14px;pointer-events:none;z-index:1}
.sbar-x{
  position:absolute;right:10px;top:50%;transform:translateY(-50%);
  background:none;border:none;cursor:pointer;color:var(--tx3);
  width:24px;height:24px;display:flex;align-items:center;justify-content:center;
  border-radius:50%;padding:0;transition:all .15s}
.sbar-x:hover{background:var(--bd);color:var(--tx)}

/* ─── CUSTOMER CARDS ────────────────────────────────────── */
.cust-card{
  background:var(--sf);border:1px solid var(--bd);border-radius:var(--rs);
  overflow:visible;transition:box-shadow .18s}
.cust-card:hover{box-shadow:var(--sh)}
.cust-row{
  display:flex;align-items:center;gap:12px;padding:13px 16px;
  cursor:pointer;user-select:none;border-radius:var(--rs);
  transition:background .15s;min-height:44px}
.cust-row:hover{background:var(--sf2)}
.cust-actions{
  display:flex;gap:8px;padding:10px 16px 14px;flex-wrap:wrap;
  border-top:1px solid var(--bd);animation:shUp .15s ease}

/* ─── TOAST ─────────────────────────────────────────────── */
.toast{
  position:fixed;top:18px;left:50%;transform:translateX(-50%);
  z-index:9999;
  background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);
  padding:12px 20px;box-shadow:var(--shlg);font-size:14px;font-weight:500;
  display:flex;align-items:center;gap:9px;animation:toIn .28s ease;
  max-width:92vw;white-space:nowrap;pointer-events:none}
@keyframes toIn{
  from{transform:translateX(-50%) translateY(-12px);opacity:0}
  to{transform:translateX(-50%) translateY(0);opacity:1}}

/* ─── DRAGGABLE CATEGORY BAR ────────────────────────────── */
.dscroll{display:flex;gap:7px;overflow-x:auto;overflow-y:hidden;
  scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;
  overscroll-behavior-x:contain;touch-action:pan-x;
  cursor:grab;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.dscroll::-webkit-scrollbar{display:none;width:0;height:0}
.dscroll.dragging{cursor:grabbing}
.dscroll.dragging .btn{pointer-events:none}
.dscroll .btn{cursor:pointer}
.dscroll.dragging .btn{cursor:grabbing}

/* ─── CATEGORY PICKER ───────────────────────────────────── */
.cp-trigger{
  display:flex;align-items:center;gap:10px;width:100%;min-height:44px;text-align:left;
  background:var(--sf);border:1.5px solid var(--bd);border-radius:var(--rs);
  padding:10px 14px;color:var(--tx);font-size:14px;transition:border .18s,box-shadow .18s}
.cp-trigger.open,.cp-trigger:focus-visible{border-color:var(--ac);box-shadow:0 0 0 3px var(--acl);outline:none}
.cp-trigger .cp-emo{font-size:18px;line-height:1;flex-shrink:0}
.cp-trigger .cp-val{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cp-trigger .cp-ph{color:var(--tx3)}
.cp-trigger .cp-chev{color:var(--tx3);font-size:12px;transition:transform .2s}
.cp-trigger.open .cp-chev{transform:rotate(180deg)}
.cp-backdrop{z-index:2100!important}
.cp-sheet{padding-top:14px!important;max-width:480px;display:flex;flex-direction:column}
.cp-head{display:flex;align-items:center;justify-content:space-between;margin:2px 2px 12px}
.cp-title{font-weight:700;font-size:15px;color:var(--tx)}
.cp-x{width:32px;height:32px;border-radius:50%;background:var(--sf2);color:var(--tx2);
  display:flex;align-items:center;justify-content:center;font-size:13px}
.cp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;overflow-y:auto;
  padding:2px;margin:-2px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.cp-opt{
  display:flex;align-items:center;gap:10px;min-height:48px;padding:10px 12px;
  background:var(--sf);border:1.5px solid var(--bd);border-radius:var(--rs);
  color:var(--tx);font-size:13.5px;font-weight:500;text-align:left;min-width:0}
.cp-opt .cp-emo{font-size:20px;line-height:1;flex-shrink:0}
.cp-opt .cp-lbl{min-width:0;line-height:1.25}
.cp-opt:hover{background:var(--sf2)}
.cp-opt.on{border-color:var(--ac);background:var(--acl);color:var(--ac);font-weight:600}
@media(max-width:768px){.cp-sheet{max-width:none}.cp-grid{max-height:60dvh}}
.cp-mng{display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;border-radius:16px;
  background:var(--sf2);color:var(--tx2);font-size:12.5px;font-weight:600}
.cp-mng:hover{color:var(--ac);background:var(--acl)}

/* ─── CATEGORY MANAGER ──────────────────────────────────── */
.cm-backdrop{z-index:2200!important}
.cm-form{background:var(--sf2);border-radius:var(--r);padding:12px;margin-bottom:12px}
.cm-form .cm-row{display:flex;gap:8px;align-items:center}
.cm-emoji-in{width:54px!important;flex:0 0 54px;text-align:center;font-size:20px;padding:8px 4px!important}
.cm-chips{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}
.cm-chip{width:34px;height:34px;border-radius:8px;font-size:18px;line-height:1;
  display:flex;align-items:center;justify-content:center;background:var(--sf);border:1.5px solid transparent}
.cm-chip:hover{background:var(--acl)}
.cm-chip.on{border-color:var(--ac);background:var(--acl)}
.cm-list{overflow-y:auto;display:flex;flex-direction:column;gap:6px;padding:2px;margin:-2px;
  -webkit-overflow-scrolling:touch;overscroll-behavior:contain;max-height:46dvh}
.cm-item{display:flex;align-items:center;gap:10px;min-height:52px;padding:8px 8px 8px 12px;
  background:var(--sf);border:1.5px solid var(--bd);border-radius:var(--rs)}
.cm-item.editing{border-color:var(--ac);background:var(--acl)}
.cm-item .cm-emo{font-size:21px;line-height:1;flex-shrink:0}
.cm-item .cm-name{flex:1;min-width:0;font-size:14px;font-weight:600;color:var(--tx);
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cm-item .cm-cnt{font-size:11.5px;font-weight:500;color:var(--tx3);margin-left:6px}
.cm-ib{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  color:var(--tx2);font-size:13px;flex-shrink:0}
.cm-ib:hover{background:var(--sf2);color:var(--ac)}
.cm-ib.dn:hover{color:var(--dn);background:var(--dnl)}
.cm-del{flex:1;font-size:12.5px;line-height:1.35;color:var(--tx)}
@media(max-width:768px){.cm-list{max-height:40dvh}}

/* ─── PRODUCT CARDS ─────────────────────────────────────── */
.pcard{
  background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);
  padding:12px 8px;cursor:pointer;transition:all .18s;
  text-align:center;user-select:none;min-height:112px;height:auto;
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
  box-sizing:border-box;min-width:0;overflow:hidden}
.pcard .pc-name{
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
  overflow:hidden;word-break:break-word;width:100%;line-height:1.3;
  min-height:calc(1.3em*2)}
.pos-products{grid-auto-rows:max-content}
.pcard:hover{border-color:var(--ac);background:var(--acl);transform:translateY(-1px)}
.pcard:active{transform:scale(.97)}

/* ─── INVENTORY CARDS: a little larger on desktop only ───── */
@media(min-width:769px){
  .inv-grid{grid-template-columns:repeat(auto-fill,minmax(340px,1fr))!important;gap:8px!important}
  .ic-card{padding:12px 14px!important;gap:12px!important}
  .ic-ico{width:44px!important;height:44px!important;border-radius:10px!important;font-size:23px!important}
  .ic-name{font-size:15px!important}
  .ic-price{font-size:15px!important}
  .ic-badge{font-size:12px!important;padding:2px 10px!important}
  .ic-menu{width:34px!important;height:34px!important;font-size:18px!important}
}

/* ─── TABLES ────────────────────────────────────────────── */
.twrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:var(--r)}
table{width:100%;border-collapse:collapse;font-size:14px;min-width:360px}
th{
  background:var(--sf2);color:var(--tx2);font-size:11px;font-weight:700;
  padding:10px 16px;text-align:left;text-transform:uppercase;
  letter-spacing:.6px;white-space:nowrap}
td{padding:14px 16px;border-bottom:1px solid var(--bd);vertical-align:middle;color:var(--tx)}
tr:last-child td{border-bottom:none}
tr:hover td{background:var(--sf2)}
.sticky-th th{position:sticky;top:0;z-index:10;background:var(--sf2)}

/* ─── STATS ─────────────────────────────────────────────── */
.pw{background:var(--sf2);border-radius:20px;height:6px;overflow:hidden}
.pb{height:100%;border-radius:20px;background:var(--ac);transition:width .4s}
.sc{
  background:var(--sf);border-radius:var(--r);
  padding:20px;border:1px solid var(--bd)}
.sn{font-size:24px;font-weight:700;line-height:1;margin-top:6px}
.sl{font-size:12px;color:var(--tx2);margin-top:4px;font-weight:500}

/* ─── MISC ──────────────────────────────────────────────── */
.rfont{font-family:'Courier New',monospace;font-size:13px;line-height:1.7}
.hscroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.sdot{width:8px;height:8px;border-radius:50%;background:#22c55e;
  display:inline-block;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.sdot.off{background:var(--wn)!important;animation:none}
.pin-dot{
  width:13px;height:13px;border-radius:50%;
  border:2px solid var(--ac);margin:0 5px;transition:background .18s}
.pin-dot.on{background:var(--ac)}
.pin-key{
  width:68px;height:68px;border-radius:50%;
  font-size:22px;font-weight:600;
  background:var(--sf2);border:1px solid var(--bd);color:var(--tx)}
.pin-key:hover{background:var(--acl);border-color:var(--ac);color:var(--ac)}
@media(max-width:380px){.pin-key{width:58px;height:58px;font-size:19px}}
@media print{
  body *{visibility:hidden}
  .printable,.printable *{visibility:visible}
  .printable{position:fixed;inset:0;padding:20px}}

/* ─── CART ROWS ─────────────────────────────────────────── */
.crow{
  display:flex;align-items:center;gap:10px;
  padding:12px 0;border-bottom:1px solid var(--bd)}
.crow:last-child{border-bottom:none}
.qbtn{
  width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  border-radius:8px;border:1px solid var(--bd);background:var(--sf2);
  font-size:16px;font-weight:700;color:var(--tx);cursor:pointer;transition:all .15s}
.qbtn:hover{border-color:var(--ac);color:var(--ac)}
.qbtn:active{background:var(--acl)}

/* ─── POS GRID ──────────────────────────────────────────── */
.pos-grid{display:grid;grid-template-columns:1fr 320px;gap:16px}
@media(max-width:1000px){.pos-grid{grid-template-columns:1fr 280px}}
@media(max-width:768px){
  .pos-grid{display:block}
  .pos-cart-col{display:none!important}}

/* Desktop POS: body becomes a flex column, the grid fills it, products scroll
   inside their own column and the cart card spans the full grid height. */
@media(min-width:769px){
  .pg-body.pos-body{display:flex;flex-direction:column;overflow:hidden}
  .pos-body .pos-grid{flex:1;min-height:0;grid-template-rows:minmax(0,1fr)}
  .pos-products{min-height:0;overflow-y:auto;overflow-x:hidden;align-content:start;
    padding:2px;margin:-2px}
  .pos-body .pos-cart-col{min-height:0}
  .pos-body .pg-spacer{display:none}
  .pg-body.pos-body{padding-bottom:4px}}

/* ─── MOBILE CART DRAWER ────────────────────────────────── */
.cart-fab{
  display:none;position:fixed;bottom:calc(var(--nav-h) + 12px);right:16px;
  z-index:1000;
  width:52px;height:52px;border-radius:50%;
  background:var(--ac);color:#fff;
  font-size:22px;box-shadow:0 4px 18px rgba(45,106,79,.3);
  align-items:center;justify-content:center;
  flex-direction:column;gap:0;border:none;cursor:pointer}
.cart-fab:active{transform:scale(.93)}
@media(max-width:768px){.cart-fab{display:flex}}
.cart-fab-badge{
  position:absolute;top:-4px;right:-4px;background:var(--dn);color:#fff;
  border-radius:50%;min-width:18px;height:18px;font-size:10px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  border:2px solid var(--sf);padding:0 2px}
.mob-cart-ov{
  display:none;position:fixed;inset:0;
  background:rgba(0,0,0,.4);z-index:1800}
.mob-cart-ov.open{display:block}
.mob-cart-drawer{
  position:fixed;bottom:0;left:0;right:0;z-index:1900;
  background:var(--sf);border-radius:20px 20px 0 0;max-height:82dvh;
  box-shadow:var(--shlg);
  padding:0 20px max(20px,env(safe-area-inset-bottom));
  display:flex;flex-direction:column;
  transform:translateY(100%);transition:transform .28s ease}
.mob-cart-drawer.open{transform:translateY(0)}

/* ─── TOOLTIP ───────────────────────────────────────────── */
[data-tip]{position:relative}
[data-tip]:hover::after{
  content:attr(data-tip);position:absolute;bottom:calc(100% + 6px);left:50%;
  transform:translateX(-50%);background:var(--tx);color:var(--sf);
  font-size:11px;font-weight:500;padding:4px 9px;border-radius:6px;
  white-space:nowrap;z-index:9999;pointer-events:none;
  font-family:'Poppins',sans-serif;opacity:.95}
[data-tip]:hover::before{
  content:"";position:absolute;bottom:calc(100% + 1px);left:50%;
  transform:translateX(-50%);border:5px solid transparent;
  border-top-color:var(--tx);z-index:9999;pointer-events:none}

/* ─── MOBILE DENSE LAYOUT ───────────────────────────────── */
@media(max-width:768px){
  #reports-tab{display:block!important}
}
@media(max-width:768px){
  .pg-body>.card,
  .pg-body>.cust-card,
  .pg-body>div>.card{
    border-radius:0!important;
    border-left:none!important;border-right:none!important;
    margin-left:0!important;margin-right:0!important;
    box-shadow:none!important}
  .pg-body .card{padding:16px!important}
  .sc{
    border-radius:0!important;
    border-left:none!important;border-right:none!important;
    padding:14px 16px!important;margin:0!important;box-shadow:none!important}
  .rpt-stats .sc{
    border-radius:var(--r)!important;
    border:1px solid var(--bd)!important;
    padding:16px!important}
  .cust-card{
    border-radius:0!important;
    border-left:none!important;border-right:none!important}
  .cust-row{border-radius:0!important}
  .pg-body [style*="minmax(280px"]{gap:1px!important}
  .dash-grid{gap:12px!important}
  .rpt-stats{gap:8px!important;padding:0 16px!important}
  .pg-body [style*="minmax(140px"]{gap:2px!important}
  .pg-body [style*="borderRadius:16"]{
    border-radius:0!important;
    border-left:none!important;border-right:none!important;
    margin-left:0!important;margin-right:0!important;margin-bottom:1px!important}
}

/* ─── GCASH / E-LOAD PAGES ──────────────────────────────── */
.gx-wrap{padding:0}
.gx-pad{padding:0}
.gx-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px}
.gx-list{display:flex;flex-direction:column;gap:8px}
.gx-row{
  background:var(--sf);border:1px solid var(--bd);border-radius:var(--rs);
  padding:12px 14px;cursor:pointer;min-height:44px;min-width:0;
  transition:background .15s}
.gx-row:hover{background:var(--sf2)}
.gx-meta{display:flex;flex-wrap:wrap;gap:2px 12px;font-size:11px;color:var(--tx3)}
.gx-meta span{max-width:100%;overflow-wrap:anywhere}
.mob-only{display:none}
@media(max-width:768px){
  .gx-wrap{padding:0}
  .gx-pad{padding:0 14px}
  .gx-bleed{padding:0}
  .gx-stats{grid-template-columns:repeat(2,1fr)}
  .gx-stats.rpt-stats{padding:0!important;gap:8px!important;margin:10px 0 16px!important}
  .gx-stats.rpt-stats .sc{border-radius:10px!important;background:var(--sf)!important;border:1px solid var(--bd)!important;box-shadow:none!important;padding:16px!important;margin:0!important}
  .gx-stats .sc{gap:12px!important}
  .rpt-stats:not(.gx-stats){padding:0!important;gap:8px!important;margin:10px 0 16px!important}
  .rpt-stats:not(.gx-stats) .sc{border-radius:10px!important;background:var(--sf)!important;border:1px solid var(--bd)!important;box-shadow:none!important;padding:16px!important;margin:0!important}
  .gx-stats .sl{margin-top:0}
  .gx-banner{border-radius:0!important;border-left:none!important;border-right:none!important;margin-bottom:1px!important}
  .gx-bleed .rg-card{border-radius:0;border-left:none;border-right:none;margin-bottom:8px}
  .gx-list{gap:1px}
  .gx-row{border-radius:0;border-left:none;border-right:none}
  .mob-only{display:block}
}


/* ─── PROFILE MENU (top-right dropdown) ─────────────────── */
.pm-wrap{position:relative}
.pm-btn{
  display:flex;align-items:center;gap:6px;
  padding:3px 9px 3px 3px;min-height:38px;
  border:1.5px solid var(--bd);border-radius:12px;background:var(--sf);
  color:var(--tx3);transition:border-color .18s,box-shadow .18s}
.pm-btn:hover{border-color:var(--ac2)}
.pm-btn.open{border-color:var(--ac);box-shadow:0 0 0 3px var(--acl)}
.pm-btn:focus-visible,.pm-item:focus-visible,.gd-row:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
.pm-chev{font-size:11px;transition:transform .18s}
.pm-btn.open .pm-chev{transform:rotate(180deg)}
.pm-menu{
  position:absolute;right:0;top:calc(100% + 8px);z-index:300;
  width:min(260px,calc(100vw - 24px));padding:6px;
  background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);box-shadow:var(--shlg);
  animation:pmIn .14s ease}
@keyframes pmIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
.pm-head{padding:10px 12px 12px;margin-bottom:6px;border-bottom:1px solid var(--bd)}
.pm-name{font-weight:700;font-size:14px;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pm-mail{font-size:12px;color:var(--tx2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pm-item{
  display:flex;align-items:center;gap:12px;width:100%;min-height:44px;padding:10px 12px;
  border-radius:var(--rs);text-align:left;font-size:14px;font-weight:500;color:var(--tx2)}
.pm-item svg{width:18px;font-size:15px}
.pm-item:hover{background:var(--sf2);color:var(--tx)}
.pm-item.on{background:var(--acl);color:var(--ac);font-weight:600}
.pm-item.out{color:var(--dn)}
.pm-item.out:hover{background:var(--dnl);color:var(--dn)}
@media(prefers-reduced-motion:reduce){.pm-menu{animation:none}.pm-chev{transition:none}}

.ua{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  border-radius:50%;background:var(--acl);color:var(--ac);font-weight:700;overflow:hidden}
.ua img{width:100%;height:100%;object-fit:cover;display:block}

/* ─── PROFILE / SETTINGS / GUIDE PAGES ──────────────────── */
/* full-width, no cap — Profile / Settings / Help / Guides all fill the page like every other page */
.pf-wrap{padding:0;display:flex;flex-direction:column;gap:16px;width:100%;max-width:none!important}
/* Profile page: store form on the left, account card beside it on wide screens */
@media(min-width:900px){
  .pf-wrap.pf-split{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);align-items:start}
}
@media(max-width:768px){.pf-wrap{padding:0;gap:8px}}

.gd-row{
  display:flex;align-items:center;gap:14px;width:100%;min-height:64px;padding:12px 0;
  text-align:left;color:var(--tx)}
.gd-ic{
  display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;
  width:38px;height:38px;border-radius:10px;background:var(--acl);color:var(--ac);font-size:16px}
.gd-title{display:block;font-size:14px;font-weight:600}
.gd-blurb{display:block;font-size:12px;color:var(--tx2)}
.gd-chev{color:var(--tx3);font-size:12px;transition:transform .18s}
.gd-chev.open{transform:rotate(180deg)}
.gd-body{padding:2px 0 18px 52px}
@media(max-width:480px){.gd-body{padding-left:0}}
.gd-steps{list-style:none;counter-reset:gd;display:flex;flex-direction:column;gap:12px;margin-bottom:14px}
.gd-steps li{
  counter-increment:gd;position:relative;padding-left:34px;
  font-size:13px;line-height:1.6;color:var(--tx)}
.gd-steps li::before{
  content:counter(gd);position:absolute;left:0;top:0;
  width:24px;height:24px;border-radius:50%;
  background:var(--ac);color:#fff;font-size:12px;font-weight:700;
  display:flex;align-items:center;justify-content:center}
.gd-tip{
  display:flex;gap:10px;align-items:flex-start;margin-bottom:14px;padding:12px 14px;
  background:var(--wnl);color:var(--wn);border-radius:var(--rs);font-size:12.5px;line-height:1.55}
.gd-tip svg{margin-top:3px;flex-shrink:0}
@media(prefers-reduced-motion:reduce){.gd-chev{transition:none}}

/* ─── PROFILE SUB-PAGE TABS (Profile · Settings · Help · Guides) ── */
.pf-tabs{margin-top:12px;gap:4px}
.pf-tabs .tabi{
  flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:7px 8px}
.pf-tabs .tabi:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
@media(max-width:400px){.pf-tabs .tabi svg{display:none}}

/* ─── GCASH RATE CHARGE GUIDE ───────────────────────────── */
.rg-card{background:var(--sf);border:1px solid var(--bd);border-radius:var(--r);margin-bottom:16px;overflow:hidden}
.rg-head{display:flex;align-items:center;gap:6px;padding:6px 10px 6px 0;background:var(--inl)}
.rg-toggle{display:flex;align-items:center;gap:12px;flex:1;min-width:0;padding:10px 4px 10px 14px;text-align:left;color:var(--tx);border-radius:var(--r)}
.rg-ic{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;width:38px;height:38px;border-radius:10px;background:var(--sf);color:var(--in);font-size:16px}
.rg-title{display:block;font-size:14px;font-weight:700;line-height:1.3}
.rg-sub{display:block;font-size:12px;color:var(--tx2);line-height:1.35}
.rg-body{padding:12px 16px 16px}
.rg-ibtn{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex-shrink:0;
  height:38px;min-width:38px;padding:0 12px;border-radius:10px;border:1px solid var(--bd);
  background:var(--sf);color:var(--tx);font-size:13px;font-weight:600}
.rg-ibtn:hover{border-color:var(--ac);color:var(--ac)}
.rg-ibtn.ghost{border-color:transparent;background:none;color:var(--tx3);padding:0}
.rg-ibtn.ghost:hover{background:var(--sf);color:var(--tx)}
.rg-ibtn:focus-visible,.rg-clear:focus-visible,.rg-toggle:focus-visible{outline:2px solid var(--ac);outline-offset:2px}
@media(max-width:480px){.rg-ibtn .rg-lbl{display:none}.rg-ibtn:not(.ghost){padding:0}}
.rg-cols{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.rg-tbl{border:1px solid var(--bd);border-radius:var(--rs);overflow:hidden}
/* phones: one table, one header, scrolls inside the card */
.rg-scroll{max-height:min(44dvh,340px);overflow-y:auto;overscroll-behavior:contain}
.rg-row{display:grid;grid-template-columns:1fr auto;gap:8px;padding:6px 14px;font-size:13px;border-top:1px solid var(--bd)}
.rg-row.h{background:var(--sf2);font-size:12px;font-weight:700;color:var(--tx2);border-top:none;padding:10px 14px;
  position:sticky;top:0;z-index:1}
.rg-row.h span:last-child{text-align:right}
.rg-row b{color:var(--ac);text-align:right;font-variant-numeric:tabular-nums}
.rg-row.hit{background:var(--acl);box-shadow:inset 3px 0 0 var(--ac);font-weight:700}
@media(max-width:768px){
  .rg-body{padding:10px 12px 12px}
  .rg-row{padding:5px 12px;font-size:12.5px}
  .rg-row.h{padding:8px 12px;font-size:11px}
}
.rg-edit-row{display:grid;grid-template-columns:1fr 1fr 1fr 40px;gap:8px;align-items:center;margin-bottom:8px}
.rg-edit-row input{padding:8px 10px;min-height:40px;font-size:13px}
.rg-edit-row.h{font-size:11px;font-weight:700;color:var(--tx2);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.rg-sug{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:-4px 0 14px;padding:8px 12px;background:var(--inl);color:var(--in);border-radius:var(--rs);font-size:12.5px;font-weight:500}

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

const CAT_DEFAULT_EMOJI={
  "Instant Noodles":"🍜","Drinks":"🥤","Cigarettes":"🚬","Biscuits":"🍪",
  "Vegetables":"🥬","Condiments":"🧂","Snacks":"🍟","Canned Goods":"🥫",
  "Hygiene":"🧼","Dairy":"🥛","Rice & Grains":"🌾","Frozen Foods":"🧊",
  "Candies":"🍬","Bread":"🍞","Cooking Oil":"🍳","Coffee & Tea":"☕","Others":"📦"
};
const ALL_CATS=["Instant Noodles","Drinks","Cigarettes","Biscuits","Vegetables",
  "Condiments","Snacks","Canned Goods","Hygiene","Dairy","Rice & Grains",
  "Frozen Foods","Candies","Bread","Cooking Oil","Coffee & Tea","Others"];
const OTHERS="Others";   /* locked fallback category: can't be renamed or deleted */
const CAT_EMOJI_CHOICES=["🍜","🥤","🍪","🥬","🧂","🍟","🥫","🧼","🥛","🌾","🧊","🍬","🍞","🍳","☕","🍺","🍎","🍗","🥚","🐟","🧴","🔋","🧻","🐾","💊","🍫","🛒","📦"];

/* Categories are real, editable data stored in db.categories = [{id,name,emoji}].
   Stores that predate this feature have no db.categories yet, so we fall back to the
   built-in list, plus any custom category names already used by products. */
const getCats=d=>{
  const stored=asArr(d?.categories).filter(c=>c&&c.name);
  const base=stored.length?stored:ALL_CATS.map(n=>({id:"d_"+n,name:n,emoji:CAT_DEFAULT_EMOJI[n]}));
  const known=new Set(base.map(c=>c.name.toLowerCase()));
  const extra=[];
  asArr(d?.products).forEach(p=>{
    const n=p?.category;
    if(n&&!known.has(n.toLowerCase())){known.add(n.toLowerCase());extra.push({id:"x_"+n,name:n,emoji:"📦"});}
  });
  const out=[...base,...extra];
  if(!out.some(c=>c.name===OTHERS))out.push({id:"d_"+OTHERS,name:OTHERS,emoji:"📦"});
  return out;
};
/* Module-level name→emoji lookup, refreshed on every App render so CAT_EMOJI works anywhere */
let _catReg={};
const setCatRegistry=d=>{_catReg=Object.fromEntries(getCats(d).map(c=>[c.name,c.emoji||"📦"]));};
const CAT_EMOJI=cat=>_catReg[cat]||CAT_DEFAULT_EMOJI[cat]||"📦";

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
   FIREBASE — services come from ./firebaseConfig.js (modular SDK).
   _storeKey is the signed-in Firebase Auth uid. It stays null until a user is
   authenticated, so nothing can read or write tenant data before login.
═══════════════════════════════════════════ */
let _storeKey=null;
const storeRef=uid=>dbRef(rtdb,`stores/${uid}`);

/* ═══════════════════════════════════════════
   LOCAL STORAGE — per-tenant namespacing
   Each store owner's data lives under its own key:
   sari_v7_store_{username}  (e.g. sari_v7_store_ligaya)
   _storeKey is set at login time before getLS/setLS are ever called.
═══════════════════════════════════════════ */
const LS_KEY_PREFIX="sari_v7";
const getLSKey=()=>`${LS_KEY_PREFIX}_${_storeKey}`;
const getLS=()=>{if(!_storeKey)return{};try{return JSON.parse(localStorage.getItem(getLSKey()))||{};}catch{return{};}};
const setLS=d=>{if(!_storeKey)return;try{localStorage.setItem(getLSKey(),JSON.stringify(d));}catch{}};
/* Per-tenant keys for the POS cart so one store's cart never shows in another */
const cartKey=()=>`sari_pos_cart_${_storeKey}`;
const cashKey=()=>`sari_pos_cash_${_storeKey}`;

/* Store/owner names keep apostrophes (e.g. "Maria's Mini Mart"); only markup
   characters are stripped. Text is rendered by React, so it is escaped on output. */
const cleanName=(s,max=80)=>String(s||"").replace(/[<>`\\]/g,"").replace(/\s+/g," ").trim().slice(0,max);

/* A brand-new store starts EMPTY and carries its own profile.
   storeName comes from registration — never hardcoded. */
const EMPTY_DB=({uid:u,storeName,ownerName,email})=>({
  profile:{uid:u,storeName,ownerName,email,createdAt:new Date().toISOString()},
  settings:{storeName,ownerName,address:"",contact:"",pin:"",pinEnabled:false,darkMode:false,lowStockThreshold:5},
  products:[],transactions:[],customers:[],utangLedger:[],
  gcashTransactions:[],eloadTransactions:[],
  initialized:true
});
/* Realtime Database drops empty arrays — restore them after every remote read */
const normalizeDB=d=>({
  ...d,
  settings:{lowStockThreshold:5,...(d?.settings||{})},
  products:asArr(d?.products),transactions:asArr(d?.transactions),
  customers:asArr(d?.customers),utangLedger:asArr(d?.utangLedger),
  gcashTransactions:asArr(d?.gcashTransactions),eloadTransactions:asArr(d?.eloadTransactions)
});
const EMPTY_VIEW={settings:{storeName:"",lowStockThreshold:5},products:[],transactions:[],customers:[],utangLedger:[]};
const authMsg=e=>({
  "auth/email-already-in-use":"That email is already registered. Please log in instead.",
  "auth/invalid-email":"Please enter a valid email address.",
  "auth/weak-password":"Password must be at least 6 characters.",
  "auth/user-not-found":"Invalid email or password.",
  "auth/wrong-password":"Invalid email or password.",
  "auth/invalid-credential":"Invalid email or password.",
  "auth/invalid-login-credentials":"Invalid email or password.",
  "auth/too-many-requests":"Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed":"Network error. Check your connection and try again.",
  "auth/operation-not-allowed":"Email/Password sign-in is not enabled in Firebase.",
  "auth/api-key-not-valid.-please-pass-a-valid-api-key.":"Firebase API key is invalid. Check apiKey in firebaseConfig.js.",
  "auth/invalid-api-key":"Firebase API key is invalid. Check apiKey in firebaseConfig.js."
}[e?.code]||`Something went wrong${e?.code?` (${e.code})`:""}. Please try again.`);

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
      <span className="sbic"><FontAwesomeIcon icon={faMagnifyingGlass} /></span>
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

/* Page name shown in the top bar */
const PAGE_META={
  dashboard:{title:"Dashboard",    icon:faHouse},
  pos:      {title:"Point of Sale",icon:faCartShopping},
  inventory:{title:"Inventory",    icon:faBoxesStacked},
  utang:    {title:"Utang",        icon:faClipboardList},
  gcash:    {title:"GCash",        icon:faWallet},
  eload:    {title:"E-Load",       icon:faMobileScreenButton},
  reports:  {title:"Reports",      icon:faChartLine},
  profile:  {title:"Profile",      icon:faCircleUser},
  settings: {title:"Settings",     icon:faGear},
  help:     {title:"Help",         icon:faCircleQuestion},
  guide:    {title:"Guides",       icon:faBookOpen}
};

/* ═══════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════ */
export default function App(){
  const [db,       setDb]      = useState(EMPTY_VIEW);   // real data is loaded after authentication
  const [dark,     setDark]    = useState(false);
  const [page,     setPage]    = useState("dashboard");
  const [toastS,   setToastS]  = useState(null);
  const [confirm,  setConfirm] = useState(null);
  const [loggedIn, setLoggedIn]= useState(false);
  const [authReady,setAuthReady]= useState(false);   // first Firebase auth check finished
  const [authMode, setAuthMode]= useState("login");  // "login" | "register"
  const [authBusy, setAuthBusy]= useState(false);
  const [bootErr,  setBootErr] = useState("");
  const [regF,     setRegF]    = useState({store:"",owner:"",email:"",p:"",p2:"",showP:false,err:""});
  const registeringRef=useRef(false);
  const [pinOk,    setPinOk]   = useState(false);
  const [pinShow,  setPinShow] = useState(false);
  const [pinEntry, setPinEntry]= useState("");
  const [loginF,   setLoginF]  = useState({u:"",p:"",showP:false,err:""});
  const [synced,   setSynced]  = useState(false);
  const fbRef=useRef(null);
  const pbodyRef=useRef(null);

  /* "More" navigation drawer (desktop + mobile) */
  const [drawerOpen,setDrawerOpen]=useState(false);
  const drawerCloseRef=useRef(null);
  const drawerOpenerRef=useRef(null);
  const closeDrawer=()=>setDrawerOpen(false);
  /* Desktop = permanent sidebar (same <aside>); mobile = drawer opened from bottom "More" */
  const [isDesktop,setIsDesktop]=useState(()=>typeof window!=="undefined"&&window.matchMedia("(min-width:769px)").matches);
  useEffect(()=>{
    const mq=window.matchMedia("(min-width:769px)");
    const h=e=>{setIsDesktop(e.matches);if(e.matches)setDrawerOpen(false);};
    mq.addEventListener("change",h);
    return()=>mq.removeEventListener("change",h);
  },[]);
  const toggleDrawer=()=>{
    if(!drawerOpen)drawerOpenerRef.current=document.activeElement;
    setDrawerOpen(!drawerOpen);
  };
  /* While open: lock page scroll (no layout shift), Esc closes, focus moves in and returns on close */
  useEffect(()=>{
    if(!drawerOpen)return;
    const b=document.body,prevO=b.style.overflow,prevP=b.style.paddingRight;
    const sw=window.innerWidth-document.documentElement.clientWidth;
    b.style.overflow="hidden";
    if(sw>0)b.style.paddingRight=`${sw}px`;
    const onKey=e=>{if(e.key==="Escape")setDrawerOpen(false);};
    window.addEventListener("keydown",onKey);
    const raf=setTimeout(()=>drawerCloseRef.current?.focus(),50);
    return()=>{
      clearTimeout(raf);
      b.style.overflow=prevO;b.style.paddingRight=prevP;
      window.removeEventListener("keydown",onKey);
      drawerOpenerRef.current?.focus?.();
    };
  },[drawerOpen]);
  const trapTab=e=>{
    if(e.key!=="Tab")return;
    const f=[...e.currentTarget.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"])')];
    if(!f.length)return;
    const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}
    else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}
  };

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
        if(!_storeKey){
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
  setCatRegistry(db);

  useEffect(()=>{document.documentElement.className=dark?"dark":"";},[dark]);
  useEffect(()=>{if(toastS){clearTimeout(_tt);_tt=setTimeout(()=>setToastS(null),3200);}},[toastS]);

  const refresh=useCallback(()=>setDb({...getLS()}),[]);

  const toggleDark=()=>{
    const nd=!dark;setDark(nd);
    const d=getLS();d.settings.darkMode=nd;setLS(d);setDb({...d});
  };

  useEffect(()=>{
    if(!loggedIn||!pinOk||!_storeKey)return;
    let active=true;
    (async()=>{
      const ref=storeRef(_storeKey);
      try{
        const snap=await dbGet(ref);
        if(!active)return;
        if(!snap.exists()&&getLS().initialized)await dbSet(ref,{...getLS(),_updatedAt:Date.now()});
        const handler=snap=>{
          if(!active)return;
          const raw=snap.val();if(!raw)return;
          const remote=normalizeDB(raw);
          const local=getLS();
          const remoteTs=remote._updatedAt||0,localTs=local._updatedAt||0;
          if(remoteTs>localTs){
            const merged={...remote,settings:{...remote.settings,darkMode:local.settings?.darkMode??false},initialized:true};
            setLS(merged);setDb({...merged});
          }
          setSynced(true);
        };
        const unsub=onValue(ref,handler,()=>setSynced(false));
        if(!active){unsub();return;}
        fbRef.current={unsub};setSynced(true);
      }catch{setSynced(false);}
    })();
    return()=>{
      active=false;
      if(fbRef.current){try{fbRef.current.unsub();}catch{}fbRef.current=null;}
    };
  },[loggedIn,pinOk]);

  const saveData=useCallback(async d=>{
    const withTs={...d,_updatedAt:Date.now()};
    setLS(withTs);setDb({...withTs});
    if(_storeKey){try{await dbSet(storeRef(_storeKey),withTs);}catch(e){console.error("Cloud save failed:",e?.code||e);}}
  },[]);

  useEffect(()=>{
    const h=e=>{if(e.key===getLSKey())setDb({...getLS()});};
    window.addEventListener("storage",h);
    return()=>window.removeEventListener("storage",h);
  },[]);

  /* ── Load (or create) the signed-in store's data, then enter the app ── */
  const enterStore=async user=>{
    _storeKey=user.uid;
    setBootErr("");
    try{
      let remote=null,fetched=false;
      {
        try{
          const snap=await Promise.race([
            dbGet(storeRef(user.uid)),
            new Promise((_,rej)=>setTimeout(()=>rej(new Error("timeout")),9000))
          ]);
          fetched=true;remote=snap.val()?normalizeDB(snap.val()):null;
        }catch{}
      }
      const local=getLS();
      let d;
      if(remote&&(!local.initialized||(remote._updatedAt||0)>=(local._updatedAt||0))){
        d={...remote,settings:{...remote.settings,darkMode:local.settings?.darkMode??remote.settings?.darkMode??false},initialized:true};
      }else if(local.initialized){
        d=normalizeDB(local);
        if(fetched){try{await dbSet(storeRef(user.uid),{...d,_updatedAt:d._updatedAt||Date.now()});}catch{}}
      }else if(fetched){
        /* Authenticated but no store record (e.g. registration was interrupted): create one */
        d=EMPTY_DB({uid:user.uid,storeName:cleanName(user.displayName?`${user.displayName}'s Store`:"My Store"),
          ownerName:cleanName(user.displayName||""),email:user.email||""});
        d._updatedAt=Date.now();
        try{await dbSet(storeRef(user.uid),d);}catch{}
      }else{
        throw new Error("offline-no-cache");
      }
      setLS(d);setDb({...d});setDark(!!d.settings?.darkMode);
      setPage("dashboard");
      setLoggedIn(true);
      if(d.settings?.pinEnabled&&d.settings?.pin){setPinOk(false);setPinShow(true);}
      else{setPinShow(false);setPinOk(true);}
    }catch{
      _storeKey=null;
      setBootErr("We couldn't load your store data. Check your connection and try again.");
    }
  };

  /* Reset every in-memory trace of the previous store */
  const leaveStore=()=>{
    _storeKey=null;
    setLoggedIn(false);setPinOk(false);setPinShow(false);setPinEntry("");
    setDb(EMPTY_VIEW);setDark(false);setPage("dashboard");setSynced(false);setConfirm(null);
    setLoginF({u:"",p:"",showP:false,err:""});
    setRegF({store:"",owner:"",email:"",p:"",p2:"",showP:false,err:""});
    setAuthMode("login");
  };

  /* Restore the Firebase session on load; react to sign-in / sign-out */
  useEffect(()=>{
    let alive=true;
    const unsub=onAuthStateChanged(auth,async user=>{
      if(!alive||registeringRef.current)return;   // registration finishes the sign-in itself
      if(user)await enterStore(user);
      else if(_storeKey)leaveStore();
      if(alive)setAuthReady(true);
    },err=>{
      console.error("Auth state error:",err);
      if(!alive)return;
      setLoginF(p=>({...p,err:"Cannot reach Firebase. Check your connection and reload."}));
      setAuthReady(true);
    });
    return()=>{alive=false;unsub();};
  },[]);

  const doLogin=async()=>{
    const email=loginF.u.trim(),pass=loginF.p;
    if(!email||!pass){setLoginF(p=>({...p,err:"Enter your email and password."}));errBeep();return;}
    setAuthBusy(true);
    try{
      await signInWithEmailAndPassword(auth,email,pass);   // onAuthStateChanged -> enterStore
    }catch(e){
      console.error("Login failed:",e);setLoginF(p=>({...p,err:authMsg(e)}));errBeep();
    }finally{setAuthBusy(false);}
  };

  const doRegister=async()=>{
    const store=cleanName(regF.store),owner=cleanName(regF.owner,60),email=regF.email.trim();
    const fail=m=>{setRegF(p=>({...p,err:m}));errBeep();};
    if(!store)return fail("Store name is required.");
    if(!owner)return fail("Owner / user name is required.");
    if(!email)return fail("Email is required.");
    if(regF.p.length<6)return fail("Password must be at least 6 characters.");
    if(regF.p!==regF.p2)return fail("Passwords do not match.");
    setAuthBusy(true);
    registeringRef.current=true;
    let created=null;
    try{
      const cred=await createUserWithEmailAndPassword(auth,email,regF.p);
      const user=created=cred.user;
      try{await updateProfile(user,{displayName:owner});}catch{}
      _storeKey=user.uid;                                   // the uid IS the store identity
      const d=EMPTY_DB({uid:user.uid,storeName:store,ownerName:owner,email:user.email||email});
      d._updatedAt=Date.now();
      await dbSet(storeRef(user.uid),d);                    // create this store's data scope
      setLS(d);setDb({...d});setDark(false);
      setPage("dashboard");setPinOk(true);setPinShow(false);setLoggedIn(true);   // auto-login
      toast(`Welcome, ${store}!`);okBeep();
    }catch(e){
      _storeKey=null;
      if(created){
        /* Account exists but its store record could not be written: roll the account
           back so the owner can simply try again instead of being stuck. */
        try{await deleteUser(created);}catch{try{await signOut(auth);}catch{}}
        fail("Could not create the store record. Please try again.");
      }else{console.error("Register failed:",e);fail(authMsg(e));}
    }finally{
      registeringRef.current=false;setAuthBusy(false);
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

  /* ── Checking saved session ── */
  if(!authReady) return(
    <div className="app-root" style={{alignItems:"center",justifyContent:"center",display:"flex",minHeight:"100dvh"}}>
      <div style={{textAlign:"center",color:"var(--tx2)"}}>
        <div style={{fontSize:40,marginBottom:10}}>🏪</div>
        <div style={{fontSize:13,fontWeight:500}}>Loading…</div>
      </div>
    </div>
  );

  /* ── Store data could not be loaded ── */
  if(bootErr&&!loggedIn) return(
    <div className="app-root" style={{alignItems:"center",justifyContent:"center",display:"flex",minHeight:"100dvh",padding:20}}>
      <div className="card" style={{width:"100%",maxWidth:380,padding:"32px 28px",textAlign:"center"}}>
        <div style={{fontSize:34,marginBottom:12}}><FontAwesomeIcon icon={faTriangleExclamation} /></div>
        <p style={{color:"var(--tx2)",fontSize:14,marginBottom:22}}>{bootErr}</p>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button className="btn bg2" onClick={()=>{setBootErr("");signOut(auth);}}>Log Out</button>
          <button className="btn bp" onClick={()=>auth.currentUser&&enterStore(auth.currentUser)}>Retry</button>
        </div>
      </div>
    </div>
  );

  /* ── Login / Register screen ── */
  if(!loggedIn){
    const reg=authMode==="register";
    const eyeBtn=(on,toggle)=>(
      <button type="button" onClick={toggle}
        style={{position:"absolute",right:10,top:32,background:"none",border:"none",cursor:"pointer",color:"var(--tx3)",fontSize:16,padding:4}}>
        {on?<FontAwesomeIcon icon={faEye} />:<FontAwesomeIcon icon={faEyeSlash} />}
      </button>
    );
    return(
    <div className="app-root" style={{alignItems:"center",justifyContent:"center",display:"flex",minHeight:"100dvh",padding:20}}>
      <div className="card" style={{width:"100%",maxWidth:380,padding:"36px 28px",maxHeight:"100dvh",overflowY:"auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:70,height:70,background:"var(--acl)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",fontSize:34}}>🏪</div>
          <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>{reg?"Register Your Store":"Store Management System"}</h1>
          {reg&&<p style={{color:"var(--tx2)",fontSize:13,fontWeight:500}}>Create your store account</p>}
        </div>
        {!reg&&loginF.err&&<div style={{background:"var(--dnl)",color:"var(--dn)",borderRadius:"var(--rs)",padding:"9px 14px",marginBottom:14,fontSize:13,fontWeight:500}}>❌ {loginF.err}</div>}
        {reg&&regF.err&&<div style={{background:"var(--dnl)",color:"var(--dn)",borderRadius:"var(--rs)",padding:"9px 14px",marginBottom:14,fontSize:13,fontWeight:500}}>❌ {regF.err}</div>}

        {!reg&&(
          <>
            <div className="login-wrap">
              <div className="fg">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={loginF.u}
                  onChange={e=>setLoginF(p=>({...p,u:e.target.value,err:""}))}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()} autoFocus autoComplete="email" maxLength={120}/>
              </div>
              <div className="fg" style={{position:"relative"}}>
                <label>Password</label>
                <input type={loginF.showP?"text":"password"} placeholder="••••••••" value={loginF.p}
                  onChange={e=>setLoginF(p=>({...p,p:e.target.value,err:""}))}
                  onKeyDown={e=>e.key==="Enter"&&doLogin()} autoComplete="current-password" maxLength={128}/>
                {eyeBtn(loginF.showP,()=>setLoginF(p=>({...p,showP:!p.showP})))}
              </div>
            </div>
            <button className="btn bp blg" style={{width:"100%"}} disabled={authBusy} onClick={doLogin}>
              <FontAwesomeIcon icon={faLock} /> {authBusy?"Logging in…":"Login"}
            </button>
            <p style={{textAlign:"center",fontSize:13,color:"var(--tx2)",marginTop:18}}>
              New here?{" "}
              <button type="button" style={{color:"var(--ac)",fontWeight:600,fontSize:13}} onClick={()=>setAuthMode("register")}>Register Store</button>
            </p>
          </>
        )}

        {reg&&(
          <>
            <div className="login-wrap">
              <div className="fg">
                <label>Store Name</label>
                <input placeholder="e.g. Maria's Mini Mart" value={regF.store}
                  onChange={e=>setRegF(p=>({...p,store:e.target.value,err:""}))} autoFocus autoComplete="organization" maxLength={80}/>
              </div>
              <div className="fg">
                <label>Owner / User Name</label>
                <input placeholder="Your name" value={regF.owner}
                  onChange={e=>setRegF(p=>({...p,owner:e.target.value,err:""}))} autoComplete="name" maxLength={60}/>
              </div>
              <div className="fg">
                <label>Email</label>
                <input type="email" placeholder="you@example.com" value={regF.email}
                  onChange={e=>setRegF(p=>({...p,email:e.target.value,err:""}))} autoComplete="email" maxLength={120}/>
              </div>
              <div className="fg" style={{position:"relative"}}>
                <label>Password</label>
                <input type={regF.showP?"text":"password"} placeholder="At least 6 characters" value={regF.p}
                  onChange={e=>setRegF(p=>({...p,p:e.target.value,err:""}))} autoComplete="new-password" maxLength={128}/>
                {eyeBtn(regF.showP,()=>setRegF(p=>({...p,showP:!p.showP})))}
              </div>
              <div className="fg">
                <label>Confirm Password</label>
                <input type={regF.showP?"text":"password"} placeholder="Re-enter password" value={regF.p2}
                  onChange={e=>setRegF(p=>({...p,p2:e.target.value,err:""}))}
                  onKeyDown={e=>e.key==="Enter"&&doRegister()} autoComplete="new-password" maxLength={128}/>
              </div>
            </div>
            <button className="btn bp blg" style={{width:"100%"}} disabled={authBusy} onClick={doRegister}>
              <FontAwesomeIcon icon={faStore} /> {authBusy?"Creating store…":"Register Store"}
            </button>
            <p style={{textAlign:"center",fontSize:13,color:"var(--tx2)",marginTop:18}}>
              Already have a store?{" "}
              <button type="button" style={{color:"var(--ac)",fontWeight:600,fontSize:13}} onClick={()=>setAuthMode("login")}>Log in</button>
            </p>
          </>
        )}
      </div>
    </div>
  );}

  /* ── PIN screen ── */
  if(pinShow&&!pinOk) return(
    <div className="app-root" style={{alignItems:"center",justifyContent:"center",display:"flex",minHeight:"100dvh"}}>
      <div className="card" style={{padding:"40px 32px",textAlign:"center",width:320,maxWidth:"92vw"}}>
        <div style={{fontSize:34,marginBottom:12}}><FontAwesomeIcon icon={faLock} /></div>
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
          onClick={()=>{signOut(auth);}}>
          ← Back to login
        </button>
      </div>
    </div>
  );

  const logout=()=>setConfirm({title:"Log Out",msg:"Are you sure you want to log out?",icon:<FontAwesomeIcon icon={faRightFromBracket} />,danger:true,confirmText:"Log Out",
    onConfirm:async()=>{
      /* Stop the live listener first, then sign out; onAuthStateChanged clears all in-memory data */
      if(fbRef.current){try{fbRef.current.unsub();}catch{}fbRef.current=null;}
      try{await signOut(auth);}catch{}
      leaveStore();
      window.history.replaceState({},"");
    }
  });

  /* Mobile bottom nav — Reports, GCash and E-Load live inside "More" (Guides is a Profile sub page) */
  const navItems=[
    {id:"dashboard", icon:<FontAwesomeIcon icon={faHouse} />, label:"Home"},
    {id: "inventory", icon: <FontAwesomeIcon icon={faBoxesStacked} />, label: "Items"},
    {id:"utang",icon:<FontAwesomeIcon icon={faClipboardList} />,label:"Utang"},
    {id:"more",icon:<FontAwesomeIcon icon={faEllipsis} />,label:"More"},
  ];
  /* Desktop sidebar — Reports visible here */
  const sideItems=[
    {id:"dashboard",icon:<FontAwesomeIcon icon={faHouse} />,label:"Dashboard"},
    {id:"pos",icon:<FontAwesomeIcon icon={faCartShopping} />,label:"Point of Sale"},
    {id:"inventory",icon:<FontAwesomeIcon icon={faBoxesStacked} />,label:"Inventory"},
    {id:"utang",icon:<FontAwesomeIcon icon={faClipboardList} />,label:"Utang"},
    {id:"gcash",icon:<FontAwesomeIcon icon={faWallet} />,label:"GCash"},
    {id:"eload",icon:<FontAwesomeIcon icon={faMobileScreenButton} />,label:"E-Load"},
    {id:"reports",icon:<FontAwesomeIcon icon={faChartLine} />,label:"Reports"},
  ];

  const cp={db,saveData,setConfirm,refresh};

  return(
    <div className="app-root has-side">
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

      {/* Top bar — current page name on the left; sync status, theme and profile menu on the right. Store identity lives in the sidebar. */}
      <div className="topbar">
        <div className="topbar-left">
          {PAGE_META[page]&&<span className="topbar-ic"><FontAwesomeIcon icon={PAGE_META[page].icon}/></span>}
          <h1 className="topbar-title">{PAGE_META[page]?.title||""}</h1>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:11,color:"var(--tx3)",display:"flex",alignItems:"center",gap:4}}>
            <span className={`sdot ${synced?"":"off"}`}/>{synced?"Synced":"Local"}
          </span>
          <button className="btn bg2 bsm" style={{padding:"6px 10px"}} onClick={toggleDark}>{dark?"☀️":"🌙"}</button>
          <ProfileMenu db={db} page={page} setPage={setPage} logout={logout}/>
        </div>
      </div>

      {/* Main wrapper — fills remaining height, no overflow here */}
      <div className="mwrap" style={{flex:1,minHeight:0}}>

        {/* .pbody: single scroll container, all pages render inside */}
        <div className="pbody" ref={pbodyRef}>
          {page==="dashboard"&&<Dashboard {...cp} setPage={setPage}/>}
          {page==="pos"       &&<POS       {...cp}/>}
          {page==="inventory" &&<Inventory {...cp}/>}
          {page==="utang"     &&<Utang     {...cp}/>}
          {page==="reports"   &&<Reports   {...cp}/>}
          {page==="gcash"     &&<GCash     {...cp}/>}
          {page==="eload"     &&<ELoad     {...cp}/>}
          {page==="profile"   &&<ProfilePage  {...cp} page={page} setPage={setPage} logout={logout}/>}
          {page==="settings"  &&<SettingsPage {...cp} page={page} setPage={setPage}/>}
          {page==="help"      &&<HelpPage     {...cp} page={page} setPage={setPage}/>}
          {page==="guide"     &&<GuidePage    {...cp} page={page} setPage={setPage}/>}
        </div>
      </div>

      {/* "More" drawer: overlay (behind drawer, above page) + sliding panel */}
      <div className={`nav-ov ${drawerOpen?"open":""}`} onClick={closeDrawer} aria-hidden="true"/>
      <aside id="nav-drawer" className={`nav-drawer ${drawerOpen?"open":""}`} {...(isDesktop?{}:{role:"dialog","aria-modal":"true","aria-hidden":!drawerOpen})}
        aria-label="Navigation menu" onKeyDown={isDesktop?undefined:trapTab}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"0 0 16px"}}>
          <button style={{display:"flex",alignItems:"center",gap:9,padding:"4px 8px",background:"none",border:"none",cursor:"pointer",textAlign:"left",minWidth:0,fontFamily:"inherit"}}
            onClick={()=>{setPage("dashboard");closeDrawer();}}>
            <span style={{fontSize:30,lineHeight:1,flexShrink:0}}>🏪</span>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:700,fontSize:13,color:"var(--tx)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{db.settings.storeName}</div>
              <div style={{fontSize:11,color:"var(--tx3)"}}>{synced?"🟢 Synced":"🟡 Local"}</div>
            </div>
          </button>
          <button ref={drawerCloseRef} className="btn bg2 bsm nav-close" aria-label="Close menu" style={{width:44,height:44,padding:0,flexShrink:0}} onClick={closeDrawer}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        {sideItems.map(item=>(
          <div key={item.id} role="button" tabIndex={0} className={`siditem ${page===item.id?"on":""}`}
            onClick={()=>{setPage(item.id);closeDrawer();}}
            onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setPage(item.id);closeDrawer();}}}>
            <span style={{fontSize:18}}>{item.icon}</span>{item.label}
          </div>
        ))}
        <div style={{marginTop:"auto",paddingTop:16,borderTop:"1.5px solid var(--bd)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:12,color:"var(--tx2)"}}>{dark?"🌙 Dark":"☀️ Light"}</span>
            <button className="btn bg2 bsm" style={{padding:"5px 10px"}} onClick={toggleDark}>{dark?"☀️":"🌙"}</button>
          </div>
          <button className="btn bg2 bsm" style={{width:"100%"}} onClick={()=>{closeDrawer();logout();}}><FontAwesomeIcon icon={faRightFromBracket} /> Log Out</button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="botnav" style={{overflow:"visible"}}>
        {/* Home, Items — left side */}
        {navItems.slice(0,2).map(item=>(
          <button key={item.id} className={`ntab ${page===item.id?"on":""}`} onClick={()=>setPage(item.id)}>
            <span>{item.icon}</span>{item.label}
          </button>
        ))}
        {/* POS — absolute FAB overflowing above the bar */}
        <div className="ntab-pos-wrap">
          <button className={`ntab-pos ${page==="pos"?"on":""}`} onClick={()=>setPage("pos")}>
            <div className="ntab-pos-bubble">🛒</div>
            <span className="ntab-pos-label">POS</span>
          </button>
        </div>
        {/* Utang, More — right side */}
        {navItems.slice(2).map(item=>(
          <button key={item.id} className={`ntab ${(page===item.id||(item.id==="more"&&(drawerOpen||["reports","gcash","eload"].includes(page))))?"on":""}`}
            {...(item.id==="more"?{"aria-haspopup":"dialog","aria-expanded":drawerOpen,"aria-controls":"nav-drawer"}:{})}
            onClick={()=>item.id==="more"?toggleDrawer():setPage(item.id)}>
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
  const hr=new Date().getHours();
  const greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
  const ownerFirst=cleanName(db.settings?.ownerName||db.profile?.ownerName||auth.currentUser?.displayName||"",60).split(" ")[0];
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
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"nowrap",gap:10}}>
          <div style={{flex:1,minWidth:0}}>
            <h2 style={{fontSize:"clamp(14px,4.2vw,17px)",fontWeight:800,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{greet}{ownerFirst?`, ${ownerFirst}`:""}</h2>
            <p style={{color:"var(--tx2)",fontSize:"clamp(10px,2.8vw,12px)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {new Date().toLocaleDateString("en-PH",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}
            </p>
          </div>
          <button className="btn bp bsm" style={{flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>setPage("pos")}><FontAwesomeIcon icon={faCartShopping} /> New Sale</button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="pg-body">
        {/* KPI Cards 2x2 grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16,marginTop:10,padding:"0 0"}}>
          {[
            {label:"Today's Sales",  value:fmt(daySales),    icon:"💵", color:"var(--ac)",   bg:"rgba(82,183,136,0.08)",  border:"rgba(82,183,136,0.25)"},
            {label:"Transactions",   value:todayTx.length,   icon:"🧾", color:"var(--in)",   bg:"rgba(86,173,245,0.08)",  border:"rgba(86,173,245,0.25)"},
            {label:"Total Products", value:prods.length,     icon:"📦", color:"#b07ef8",     bg:"rgba(176,126,248,0.08)", border:"rgba(176,126,248,0.25)"},
            {label:"Total Utang",    value:fmt(totalUtang),  icon:"📋", color:"var(--wn)",   bg:"rgba(240,165,0,0.08)",   border:"rgba(240,165,0,0.25)"},
          ].map((s,i)=>(
            <div key={i} style={{background:s.bg,border:`1.5px solid ${s.border}`,borderRadius:10,padding:"16px 16px",display:"flex",flexDirection:"column",gap:3}}>
              <div style={{fontSize:24}}>{s.icon}</div>
              <div style={{fontSize:20,fontWeight:800,lineHeight:1,color:s.color,marginTop:2}}>{s.value}</div>
              <div style={{fontSize:11,color:"var(--tx2)",fontWeight:500}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Stock Alert — two-column grid */}
        {allAlerts.length>0&&(
          <div style={{background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:10,padding:"16px 18px",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:16}}>⚠️</span>
              <span style={{fontWeight:600,fontSize:14,color:"var(--wn)"}}>Stock Alert</span>
              <span style={{marginLeft:"auto",background:"var(--wnl)",color:"var(--wn)",borderRadius:20,padding:"2px 10px",fontSize:12,fontWeight:700}}>{allAlerts.length} items</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
              {allAlerts.map(p=>{
                const isOut=p.stock<=0;
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:6,background:"var(--sf2)",borderRadius:10,padding:"8px 10px",minWidth:0}}>
                    <span style={{fontSize:18,flexShrink:0}}>{CAT_EMOJI(p.category)}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--tx)"}}>{p.name}</div>
                      <span style={{display:"inline-block",marginTop:2,padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:800,
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

        <div className="dash-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          <div className="card" style={{padding:18}}>
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:10}}>Recent Transactions</h3>
            {recent.length===0?<p style={{color:"var(--tx3)",fontSize:13}}>No transactions yet.</p>:recent.map(t=>(
              <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid var(--bd)"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{t.items?.length||0} item{t.items?.length!==1?"s":""}{t.isUtang?" · Utang":""}</div>
                  <div style={{fontSize:10,color:"var(--tx3)"}}>{fmtDate(t.date)} {fmtTime(t.date)}</div>
                </div>
                <span style={{fontWeight:700,color:t.isUtang?"var(--wn)":"var(--ac)",fontSize:14}}>{fmt(t.total)}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:18}}>
            <h3 style={{fontSize:14,fontWeight:600,marginBottom:10}}>Best Selling Products</h3>
            {best.length===0?<p style={{color:"var(--tx3)",fontSize:13}}>No sales yet.</p>:best.map((p,i)=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"4px 0",borderBottom:"1px solid var(--bd)"}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"var(--acl)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"var(--ac)",flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                  <div style={{fontSize:10,color:"var(--tx3)"}}>{p.soldQty} sold</div>
                </div>
                <span style={{fontSize:13,fontWeight:700}}>{p.isOpenPrice?"Var.":fmt(p.price)}</span>
              </div>
            ))}
          </div>
        </div>
      
        <div className="pg-spacer"/></div>{/* pg-body */}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CUSTOMER SELECTOR MODAL (used in POS checkout for Utang)
═══════════════════════════════════════════ */
function CustomerSelectorModal({customers,value,onChange,onClose,onAddNew}){
  const [q,setQ]=useState("");
  const [adding,setAdding]=useState(false);
  const [newName,setNewName]=useState("");
  const [newPhone,setNewPhone]=useState("");
  const handleAdd=()=>{
    const name=newName.trim();
    if(!name){toast("Customer name is required.","err");return;}
    onAddNew(name,newPhone.trim());
    setAdding(false);setNewName("");setNewPhone("");
    onClose();
  };
  const sorted=useMemo(()=>[...customers].sort((a,b)=>a.name.localeCompare(b.name)),[customers]);
  const filtered=useMemo(()=>sorted.filter(c=>
    c.name.toLowerCase().includes(q.toLowerCase())||
    (c.contact||"").includes(q)
  ),[sorted,q]);

  return(
    <div className="backdrop" style={{alignItems:"center",padding:16}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:"var(--sf)",width:"100%",maxWidth:480,borderRadius:10,
        maxHeight:"82vh",display:"flex",flexDirection:"column",boxShadow:"var(--shlg)",
        animation:"shUp .22s ease",overflow:"hidden"}}>
        {/* Header */}
        <div style={{padding:"18px 20px 10px",flexShrink:0,borderBottom:"1.5px solid var(--bd)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <h3 style={{fontWeight:700,fontSize:16}}>👤 Select Customer</h3>
            <button className="btn bg2 bsm" onClick={onClose}>✕</button>
          </div>
          {!adding?(
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div className="sbar" style={{flex:1}}>
                <span className="sbic">🔍</span>
                <input autoFocus placeholder="Search by name or number…" value={q}
                  onChange={e=>setQ(e.target.value)} style={{paddingLeft:40}}/>
                {q&&<button className="sbar-x" onClick={()=>setQ("")}>✕</button>}
              </div>
              <button className="btn bg2 bsm" style={{flexShrink:0}}
                onClick={()=>{setAdding(true);setQ("");}}>＋ New</button>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{fontWeight:600,fontSize:13,color:"var(--tx2)",marginBottom:2}}>＋ Add New Customer</div>
              <input autoFocus placeholder="Customer Name *" value={newName}
                onChange={e=>setNewName(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleAdd()}/>
              <input placeholder="Phone Number (optional)" value={newPhone}
                onChange={e=>setNewPhone(e.target.value.replace(/[^0-9+\-\s]/g,"").slice(0,15))}
                inputMode="tel"
                onKeyDown={e=>e.key==="Enter"&&handleAdd()}/>
              <div style={{display:"flex",gap:8}}>
                <button className="btn bg2 bsm" style={{flex:1}}
                  onClick={()=>{setAdding(false);setNewName("");setNewPhone("");}}>Cancel</button>
                <button className="btn bp bsm" style={{flex:1}} onClick={handleAdd}>✔ Add &amp; Select</button>
              </div>
            </div>
          )}
        </div>
        {/* Customer list */}
        {!adding&&(
          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.length===0&&(
              <div style={{padding:32,textAlign:"center",color:"var(--tx3)",fontSize:12}}>No customers found.</div>
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
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CUSTOMER PICKER (trigger button for POS checkout)
═══════════════════════════════════════════ */
function CustomerPicker({customers,value,onChange,onAddNew}){
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
      {modalOpen&&<CustomerSelectorModal customers={customers} value={value} onChange={onChange} onClose={()=>setModalOpen(false)} onAddNew={onAddNew}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   POS
═══════════════════════════════════════════ */
function POS({db,saveData,setConfirm}){
  const CART_KEY=cartKey();
  const [search,       setSearch]      = useState("");
  const [cart,         setCart]        = useState(()=>{try{return JSON.parse(localStorage.getItem(CART_KEY))||[];}catch{return[];}});
  const [cash,         setCash]        = useState(()=>{try{return localStorage.getItem(cashKey())||"";}catch{return "";}});
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
  useEffect(()=>{try{localStorage.setItem(cashKey(),cash);}catch{}},[cash]);

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
    try{localStorage.removeItem(cartKey());localStorage.removeItem(cashKey());}catch{}
  };

  const CartContent=({onCheckoutClick})=>(
    <>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexShrink:0}}>
        <h3 style={{fontWeight:700,fontSize:15}}>Cart ({cart.length})</h3>
        {cart.length>0&&<button className="btn bd2 bsm" onClick={()=>{setCart([]);setCash("");try{localStorage.removeItem(cartKey());localStorage.removeItem(cashKey());}catch{}}}>Clear</button>}
      </div>
      <div style={{flex:1,overflowY:"auto",minHeight:60,}}>
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
    <div className="pg-page">
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
              <button className={`btn ${!utangMode?"bp":"bg2"}`} style={{flex:1}} onClick={()=>setUtangMode(false)}><FontAwesomeIcon icon={faHandHoldingDollar} /> Cash</button>
              <button className={`btn ${utangMode?"bp":"bg2"}`}  style={{flex:1}} onClick={()=>setUtangMode(true)}><FontAwesomeIcon icon={faClipboardList} /> Utang</button>
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
              <CustomerPicker customers={db.customers||[]} value={custId} onChange={setCustId}
                onAddNew={async(name,contact)=>{
                  const newCust={id:uid(),name:sanitize(name),contact:sanitize(contact),address:"",balance:0,createdAt:new Date().toISOString()};
                  const d=getLS();
                  d.customers=[newCust,...(d.customers||[])];
                  await saveData(d);
                  setCustId(newCust.id);
                  toast(`${name} added! ✅`);
                }}/>
            )}
            <button className="btn bp blg" style={{width:"100%",marginTop:8}} onClick={checkout}>✅ Confirm Sale</button>
          </div>
        </div>
      )}

      {receiptData&&<ReceiptModal data={receiptData} onClose={()=>setReceiptData(null)}/>}

      <button className="cart-fab" onClick={()=>setMobCartOpen(true)}>
        <FontAwesomeIcon icon={faCartShopping} />
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

      {/* POS page: header pinned, body scrolls beneath */}
      <div className="pg-hdr">
        <SearchBar value={search} onChange={setSearch} placeholder="Search product…"/>
        <DragScroll style={{paddingBottom:4,marginTop:10}}>
          {cats.map(c=><button key={c} className={`btn bsm ${catFilter===c?"bp":"bg2"}`} style={{flexShrink:0}} onClick={()=>setCatFilter(c)}>{c}</button>)}
        </DragScroll>
      </div>

      <div className="pg-body pos-body">
        <div className="pos-grid">
          <div className="pos-products" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(115px,1fr))",gap:10}}>
            {filtered.map(p=>(
              <div key={p.id} className="pcard" style={{opacity:p.stock<=0?.45:1}} onClick={()=>handleProdClick(p)}>
                <div style={{fontSize:28,lineHeight:1.2,marginBottom:6,flexShrink:0}}>{CAT_EMOJI(p.category)}</div>
                <div className="pc-name" style={{fontSize:12,fontWeight:700,marginBottom:3}} title={p.name}>{p.name}</div>
                <div style={{fontSize:13,color:"var(--ac)",fontWeight:800}}>{p.isOpenPrice?"Open Price":fmt(p.price)}</div>
                <div style={{fontSize:11,color:p.stock<=5?"var(--wn)":"var(--tx3)",marginTop:2}}>{p.stock} left</div>
              </div>
            ))}
            {filtered.length===0&&<div style={{gridColumn:"1/-1",padding:32,textAlign:"center",color:"var(--tx3)",fontSize:14}}>No products found</div>}
          </div>
          <div className="card pos-cart-col" style={{display:"flex",flexDirection:"column",overflow:"hidden",padding:18}}>
            <CartContent/>
          </div>
        </div>
        <div className="pg-spacer"/>
      </div>
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
            {txn.isUtang&&<div style={{color:"var(--wn)",fontWeight:700,fontSize:13,marginTop:4}}><FontAwesomeIcon icon={faTriangleExclamation} /> On Credit / Utang</div>}
          </div>
          <div style={{textAlign:"center",marginTop:14,fontSize:13,borderTop:"1px dashed var(--bd)",paddingTop:10}}>
            Thank you! Please come again 🫶
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button className="btn bg2" style={{flex:1}} onClick={onClose}>Close</button>
          <button className="btn bp" style={{flex:1}} onClick={()=>window.print()}><FontAwesomeIcon icon={faPrint} /> Print</button>
        </div>
      </div>
    </div>
  );
}

/* Horizontally draggable strip: mouse drag (with momentum) on desktop,
   native touch swipe on mobile. Scrollbar hidden; clicks on children still work. */
function DragScroll({children,style,className=""}){
  const ref=useRef(null);
  const st=useRef({down:false,moved:false,startX:0,startLeft:0,lastX:0,lastT:0,v:0,raf:0});

  useEffect(()=>{
    const el=ref.current;if(!el)return;
    /* vertical mouse wheel scrolls the bar sideways */
    const onWheel=e=>{
      if(el.scrollWidth<=el.clientWidth||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
      e.preventDefault();el.scrollLeft+=e.deltaY;
    };
    el.addEventListener("wheel",onWheel,{passive:false});
    return()=>{el.removeEventListener("wheel",onWheel);cancelAnimationFrame(st.current.raf);};
  },[]);

  const onPointerDown=e=>{
    if(e.pointerType!=="mouse"||e.button!==0)return; /* touch uses native scrolling */
    const el=ref.current,d=st.current;
    cancelAnimationFrame(d.raf);
    d.down=true;d.moved=false;d.startX=e.clientX;d.startLeft=el.scrollLeft;
    d.lastX=e.clientX;d.lastT=performance.now();d.v=0;
  };
  const onPointerMove=e=>{
    const d=st.current,el=ref.current;
    if(!d.down||e.pointerType!=="mouse")return;
    const dx=e.clientX-d.startX;
    if(!d.moved){
      if(Math.abs(dx)<5)return;
      d.moved=true;el.classList.add("dragging");
      try{el.setPointerCapture(e.pointerId);}catch{}
    }
    el.scrollLeft=d.startLeft-dx;
    const now=performance.now(),dt=now-d.lastT;
    if(dt>0){d.v=.8*d.v+.2*((d.lastX-e.clientX)/dt);} /* px per ms */
    d.lastX=e.clientX;d.lastT=now;
  };
  const endDrag=e=>{
    const d=st.current,el=ref.current;
    if(!d.down)return;
    d.down=false;
    if(!d.moved)return;
    el.classList.remove("dragging");
    try{el.releasePointerCapture(e.pointerId);}catch{}
    /* momentum */
    let v=d.v*16; /* px per frame */
    if(performance.now()-d.lastT>80)v=0;
    const step=()=>{
      if(Math.abs(v)<.4)return;
      el.scrollLeft+=v;v*=.94;
      d.raf=requestAnimationFrame(step);
    };
    d.raf=requestAnimationFrame(step);
  };
  /* swallow the click that ends a drag so a category isn't selected by accident */
  const onClickCapture=e=>{
    if(st.current.moved){e.preventDefault();e.stopPropagation();st.current.moved=false;}
  };

  return(
    <div ref={ref} className={`dscroll ${className}`} style={style}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={endDrag} onPointerCancel={endDrag}
      onClickCapture={onClickCapture} onDragStart={e=>e.preventDefault()}>
      {children}
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
  const [catMgr,setCatMgr]=useState(false);
  const prods=db.products||[];
  const usedCats=["All",...new Set(prods.map(p=>p.category))];
  const cats=useMemo(()=>getCats(db),[db]);
  const counts=useMemo(()=>{const m={};prods.forEach(p=>{m[p.category]=(m[p.category]||0)+1;});return m;},[prods]);
  const filtered=useMemo(()=>[...prods]
    .sort((a,b)=>a.name.localeCompare(b.name))
    .filter(p=>(catF==="All"||p.category===catF)&&p.name.toLowerCase().includes(search.toLowerCase()))
  ,[prods,catF,search]);

  const handleSave=async(form,isNew)=>{
    if(!form.name?.trim()){toast("Product name required!","err");return;}
    if(!form.category){toast("Please select a category!","err");return;}
    if(!form.isOpenPrice&&(form.price===""||isNaN(parseFloat(form.price)))){toast("Enter a valid price!","err");return;}
    if(form.stock===""||isNaN(parseInt(form.stock))){toast("Enter stock quantity!","err");return;}
    const clean={...form,name:sanitize(form.name.trim()),price:parseFloat(form.price)||0,stock:parseInt(form.stock)||0};
    const d=getLS();
    /* Duplicate name check — only when adding a new product */
    if(isNew){
      const exists=(d.products||[]).some(p=>p.name.trim().toLowerCase()===clean.name.toLowerCase());
      if(exists){toast("Product already exists!","err");errBeep();return;}
      d.products=[{...clean,id:uid(),createdAt:new Date().toISOString()},...(d.products||[])];
    }else{
      d.products=(d.products||[]).map(p=>p.id===clean.id?clean:p);
    }
    await saveData(d);setModal(false);setEditP(null);
    toast(isNew?"Product added!":"Product updated!");okBeep();
  };

  /* Category add / edit / delete. Renames and deletes also update the products that use the category. */
  const catOps={
    add:async(rawName,rawEmoji)=>{
      const name=cleanName(rawName,30);
      if(!name){toast("Enter a category name!","err");return null;}
      const d=getLS();const cur=getCats(d);
      if(cur.some(c=>c.name.toLowerCase()===name.toLowerCase())){toast("Category already exists!","err");errBeep();return null;}
      const item={id:uid(),name,emoji:cleanName(rawEmoji,8)||"📦"};
      const oi=cur.findIndex(c=>c.name===OTHERS);   /* keep "Others" last */
      d.categories=oi<0?[...cur,item]:[...cur.slice(0,oi),item,...cur.slice(oi)];
      await saveData(d);toast("Category added!");okBeep();
      return item;
    },
    edit:async(id,rawName,rawEmoji)=>{
      const d=getLS();const cur=getCats(d);
      const c=cur.find(x=>x.id===id);if(!c)return null;
      const name=c.name===OTHERS?OTHERS:cleanName(rawName,30);
      if(!name){toast("Enter a category name!","err");return null;}
      if(cur.some(x=>x.id!==id&&x.name.toLowerCase()===name.toLowerCase())){toast("Category already exists!","err");errBeep();return null;}
      const emoji=cleanName(rawEmoji,8)||"📦";
      d.categories=cur.map(x=>x.id===id?{...x,name,emoji}:x);
      if(name!==c.name)d.products=asArr(d.products).map(p=>p.category===c.name?{...p,category:name}:p);
      await saveData(d);
      if(name!==c.name&&catF===c.name)setCatF(name);
      toast("Category updated!");okBeep();
      return{id,from:c.name,to:name};
    },
    remove:async id=>{
      const d=getLS();const cur=getCats(d);
      const c=cur.find(x=>x.id===id);
      if(!c||c.name===OTHERS)return null;
      let moved=0;
      d.products=asArr(d.products).map(p=>{if(p.category===c.name){moved++;return{...p,category:OTHERS};}return p;});
      d.categories=cur.filter(x=>x.id!==id);
      await saveData(d);
      if(catF===c.name)setCatF("All");
      toast(moved?`Category deleted. ${moved} product${moved===1?"":"s"} moved to Others.`:"Category deleted.");
      return{id,name:c.name,moved};
    }
  };

  const handleDelete=p=>setConfirm({
    title:"Delete Product",msg:`Delete "${p.name}"?\nThis cannot be undone.`,
    icon:<FontAwesomeIcon icon={faTrashCan} />,danger:true,confirmText:"Delete",
    onConfirm:async()=>{
      const d=getLS();d.products=(d.products||[]).filter(x=>x.id!==p.id);
      await saveData(d);toast("Product deleted.");
    }
  });

  return(
    <div style={{display:"contents"}}>
      {modal&&<ProdModal product={editP} defaultCategory={catF==="All"?"":catF} cats={cats} counts={counts} catOps={catOps} onSave={handleSave} onClose={()=>{setModal(false);setEditP(null);}}/>}
      {catMgr&&<CategoryManager cats={cats} counts={counts} ops={catOps} onClose={()=>setCatMgr(false)}/>}

      <div className="pg-page">
        <div className="pg-hdr">
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search products…"/>
            <button className="btn bg2 bsm" style={{flexShrink:0}} title="Manage categories" aria-label="Manage categories" onClick={()=>setCatMgr(true)}><FontAwesomeIcon icon={faTags}/></button>
            <button className="btn bp bsm" style={{flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>{setEditP(null);setModal(true);}}>+ Add Product</button>
          </div>
          <DragScroll style={{paddingBottom:2,marginTop:10}}>
            {usedCats.map(c=><button key={c} className={`btn bsm ${catF===c?"bp":"bg2"}`} style={{flexShrink:0}} onClick={()=>setCatF(c)}>{c}</button>)}
          </DragScroll>
        </div>

        <div className="pg-body">
          {filtered.length===0&&(
            <div className="card" style={{padding:32,textAlign:"center",color:"var(--tx3)"}}>No products found.</div>
          )}
          <div className="inv-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:2}}>
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
        
          <div className="pg-spacer"/></div>
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
    <div className="card ic-card" style={{padding:"7px 10px",display:"flex",alignItems:"center",gap:8,position:"relative"}}>
      <div className="ic-ico" style={{width:32,height:32,borderRadius:8,background:"var(--sf2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>
        {CAT_EMOJI(p.category)}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div className="ic-name" style={{fontWeight:700,fontSize:13,lineHeight:1.25,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
        {p.isOpenPrice&&(
          <div style={{marginTop:2}}>
            <span className="badge bg-b" style={{fontSize:10,padding:"1px 7px"}}>Open Price</span>
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6,marginTop:2}}>
          <span className="ic-price" style={{fontWeight:800,fontSize:13,color:"var(--tx)"}}>{p.isOpenPrice?"Variable":fmt(p.price)}</span>
          <span className="ic-badge" style={{padding:"1px 7px",borderRadius:20,fontSize:10,fontWeight:800,whiteSpace:"nowrap",background:stockBg,color:stockColor}}>{stockLabel}</span>
        </div>
      </div>
      {/* Three-dot menu */}
      <div ref={ref} style={{position:"relative",flexShrink:0}}>
        <button className="ic-menu" style={{width:28,height:28,borderRadius:7,border:"1px solid var(--bd)",background:"var(--sf2)",color:"var(--tx2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}
          onClick={()=>setMenuOpen(o=>!o)}>⋮</button>
        {menuOpen&&(
          <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",background:"var(--sf)",border:"1.5px solid var(--bd)",borderRadius:10,boxShadow:"var(--shlg)",zIndex:200,minWidth:130,overflow:"hidden"}}>
            <button style={{display:"flex",alignItems:"center",gap:9,padding:"11px 16px",width:"100%",fontSize:13,fontWeight:600,color:"var(--tx)",background:"none",border:"none",cursor:"pointer",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--sf2)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
              onClick={()=>{setMenuOpen(false);onEdit();}}> <FontAwesomeIcon icon={faPen} /> Edit</button>
            <button style={{display:"flex",alignItems:"center",gap:9,padding:"11px 16px",width:"100%",fontSize:13,fontWeight:600,color:"var(--dn)",background:"none",border:"none",cursor:"pointer",borderTop:"1px solid var(--bd)",transition:"background .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--dnl)"}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
              onClick={()=>{setMenuOpen(false);onDelete();}}> <FontAwesomeIcon icon={faTrashCan} /> Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* Add / rename / delete categories. Rendered above whatever opened it (inventory page or picker). */
function CategoryManager({cats,counts,ops,onClose}){
  const blank={id:null,name:"",emoji:"📦"};
  const [f,setF]=useState(blank);
  const [delId,setDelId]=useState(null);
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    const onKey=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[onClose]);
  const editing=!!f.id;
  const locked=editing&&cats.find(c=>c.id===f.id)?.name===OTHERS;
  const submit=async()=>{
    if(busy)return;
    setBusy(true);
    try{
      const r=editing?await ops.edit(f.id,f.name,f.emoji):await ops.add(f.name,f.emoji);
      if(r)setF(blank);
    }finally{setBusy(false);}
  };
  const doDelete=async c=>{
    if(busy)return;
    setBusy(true);
    try{
      const r=await ops.remove(c.id);
      if(r){setDelId(null);if(f.id===c.id)setF(blank);}
    }finally{setBusy(false);}
  };
  return createPortal(
    <div className="backdrop cp-backdrop cm-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="msheet cp-sheet">
        <div className="shandle" style={{marginBottom:12}}/>
        <div className="cp-head">
          <div className="cp-title">Manage Categories</div>
          <button type="button" className="cp-x" onClick={onClose} aria-label="Close"><FontAwesomeIcon icon={faXmark}/></button>
        </div>

        <div className="cm-form">
          <div style={{fontSize:12.5,fontWeight:600,color:"var(--tx2)",marginBottom:8}}>
            {editing?"Edit category":"New category"}
          </div>
          <div className="cm-row">
            <input className="cm-emoji-in" value={f.emoji} maxLength={8} aria-label="Emoji"
              onChange={e=>setF(p=>({...p,emoji:e.target.value}))}/>
            <input autoFocus={!editing} placeholder="e.g. Pet Supplies" value={f.name} maxLength={30}
              disabled={locked} aria-label="Category name"
              onChange={e=>setF(p=>({...p,name:e.target.value}))}
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();submit();}}}/>
            <button type="button" className="btn bp" style={{flexShrink:0}} disabled={busy} onClick={submit}>
              {editing?"Save":"Add"}
            </button>
            {editing&&<button type="button" className="btn bg2" style={{flexShrink:0}} onClick={()=>setF(blank)}>Cancel</button>}
          </div>
          {locked&&<div style={{fontSize:11.5,color:"var(--tx3)",marginTop:8}}>"Others" is the fallback category, so only its emoji can be changed.</div>}
          <div className="cm-chips">
            {CAT_EMOJI_CHOICES.map(em=>(
              <button type="button" key={em} className={`cm-chip ${f.emoji===em?"on":""}`}
                onClick={()=>setF(p=>({...p,emoji:em}))} aria-label={`Use ${em}`}>{em}</button>
            ))}
          </div>
        </div>

        <div className="cm-list">
          {cats.map(c=>{
            const n=counts?.[c.name]||0;
            if(delId===c.id)return(
              <div key={c.id} className="cm-item" style={{borderColor:"var(--dn)"}}>
                <div className="cm-del">
                  Delete <b>{c.name}</b>?{n>0?` Its ${n} product${n===1?"":"s"} will move to "Others".`:""}
                </div>
                <button type="button" className="btn bg2 bsm" onClick={()=>setDelId(null)}>Cancel</button>
                <button type="button" className="btn bd2 bsm" disabled={busy} onClick={()=>doDelete(c)}>Delete</button>
              </div>
            );
            return(
              <div key={c.id} className={`cm-item ${f.id===c.id?"editing":""}`}>
                <span className="cm-emo">{c.emoji||"📦"}</span>
                <span className="cm-name">{c.name}<span className="cm-cnt">{n} item{n===1?"":"s"}</span></span>
                <button type="button" className="cm-ib" aria-label={`Edit ${c.name}`}
                  onClick={()=>{setDelId(null);setF({id:c.id,name:c.name,emoji:c.emoji||"📦"});}}>
                  <FontAwesomeIcon icon={faPen}/>
                </button>
                {c.name!==OTHERS&&(
                  <button type="button" className="cm-ib dn" aria-label={`Delete ${c.name}`}
                    onClick={()=>{setF(blank);setDelId(c.id);}}>
                    <FontAwesomeIcon icon={faTrashCan}/>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>,document.body);
}

/* Clean, minimal category picker: input-style trigger + bottom sheet of tiles
   (replaces the native <select>, which renders a clunky OS list on mobile). */
function CategoryPicker({value,onChange,cats,counts,ops}){
  const [open,setOpen]=useState(false);
  const [mgr,setMgr]=useState(false);
  useEffect(()=>{
    if(!open)return;
    const onKey=e=>{if(e.key==="Escape"&&!document.querySelector(".cm-backdrop"))setOpen(false);};
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[open]);
  const [adding,setAdding]=useState(false);
  const [newCat,setNewCat]=useState("");
  const pick=c=>{onChange(c);setOpen(false);setAdding(false);setNewCat("");};
  const addCat=async()=>{
    const name=cleanName(newCat,30);
    if(!name){toast("Enter a category name!","err");return;}
    const existing=cats.find(c=>c.name.toLowerCase()===name.toLowerCase());
    if(existing){pick(existing.name);return;}
    const r=await ops.add(name,"📦");
    if(r)pick(r.name);
  };
  return(
    <>
      <button type="button" className={`cp-trigger ${open?"open":""}`} onClick={()=>setOpen(true)}>
        {value
          ?<><span className="cp-emo">{CAT_EMOJI(value)}</span><span className="cp-val">{value}</span></>
          :<span className="cp-val cp-ph">Select category…</span>}
        <FontAwesomeIcon icon={faChevronDown} className="cp-chev"/>
      </button>
      {open&&createPortal(
        <div className="backdrop cp-backdrop" onClick={e=>e.target===e.currentTarget&&setOpen(false)}>
          <div className="msheet cp-sheet">
            <div className="shandle" style={{marginBottom:12}}/>
            <div className="cp-head">
              <div className="cp-title">Select Category</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <button type="button" className="cp-mng" onClick={()=>setMgr(true)}>
                  <FontAwesomeIcon icon={faPen}/> Manage
                </button>
                <button type="button" className="cp-x" onClick={()=>setOpen(false)} aria-label="Close">
                  <FontAwesomeIcon icon={faXmark}/>
                </button>
              </div>
            </div>
            <div className="cp-grid">
              {cats.map(c=>(
                <button type="button" key={c.id} className={`cp-opt ${value===c.name?"on":""}`} onClick={()=>pick(c.name)}>
                  <span className="cp-emo">{c.emoji||"📦"}</span>
                  <span className="cp-lbl">{c.name}</span>
                </button>
              ))}
              {!adding?(
                <button type="button" className="cp-opt" style={{borderStyle:"dashed",color:"var(--ac)",fontWeight:600}}
                  onClick={()=>setAdding(true)}>
                  <span className="cp-emo"><FontAwesomeIcon icon={faPlus}/></span>
                  <span className="cp-lbl">New category</span>
                </button>
              ):(
                <div style={{gridColumn:"1/-1",display:"flex",gap:8}}>
                  <input autoFocus placeholder="e.g. Pet Supplies" value={newCat} maxLength={30}
                    onChange={e=>setNewCat(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCat();}}}/>
                  <button type="button" className="btn bp" style={{flexShrink:0}} onClick={addCat}>Add</button>
                </div>
              )}
            </div>
          </div>
        </div>,document.body)}
      {mgr&&<CategoryManager cats={cats} counts={counts} ops={ops} onClose={()=>setMgr(false)}/>}
    </>
  );
}

function ProdModal({product,onSave,onClose,defaultCategory="",cats=[],counts={},catOps}){
  const isNew=!product;
  const [form,setForm]=useState(isNew?{name:"",category:defaultCategory||"",price:"",stock:"",isOpenPrice:false}:{...product});
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  /* Keep this product's selected category in step with renames/deletes made from the picker */
  const ops={...catOps,
    edit:async(...a)=>{const r=await catOps.edit(...a);if(r&&r.from!==r.to)setForm(p=>p.category===r.from?{...p,category:r.to}:p);return r;},
    remove:async(...a)=>{const r=await catOps.remove(...a);if(r)setForm(p=>p.category===r.name?{...p,category:OTHERS}:p);return r;}
  };
  /* Esc closes the dialog (unless the category picker is open on top — it handles its own Esc) */
  useEffect(()=>{
    const onKey=e=>{if(e.key==="Escape"&&!document.querySelector(".cp-backdrop"))onClose();};
    document.addEventListener("keydown",onKey);
    return()=>document.removeEventListener("keydown",onKey);
  },[onClose]);
  return(
    <div className="backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="msheet mlg prod-sheet">
        <div className="shandle"/>
        <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>{isNew ? ("➕ Add Product") : (<><FontAwesomeIcon icon={faPen} /> Edit Product</>)}
        </h3>
        <div className="fg"><label>Product Name *</label>
          <input placeholder="e.g. Lucky Me Pancit Canton" value={form.name}
            onChange={e=>s("name",e.target.value)} autoFocus maxLength={200}/>
        </div>
        <div className="fg"><label>Category *</label>
          <CategoryPicker value={form.category||""} onChange={v=>s("category",v)} cats={cats} counts={counts} ops={ops}/>
        </div>
        <div style={{background:"var(--sf2)",borderRadius:"var(--rs)",padding:"10px 12px",marginBottom:10,display:"flex",gap:10,alignItems:"flex-start"}}>
          <input type="checkbox" id="opx" checked={form.isOpenPrice} onChange={e=>s("isOpenPrice",e.target.checked)} style={{marginTop:2}}/>
          <div>
            <label htmlFor="opx" style={{fontWeight:600,fontSize:14,cursor:"pointer",color:"var(--tx)"}}>Open / Variable Price</label>
            <div style={{fontSize:11.5,lineHeight:1.35,color:"var(--tx2)",marginTop:1}}>For items priced per amount (e.g. vegetables). Cashier enters price at checkout.</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div className="fg"><label>{form.isOpenPrice?"Base Price":"Price (₱) *"}</label>
            <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={e=>s("price",e.target.value)}/>
          </div>
          <div className="fg"><label>Stock Qty *</label>
            <input type="number" inputMode="numeric" min="0" placeholder="0" value={form.stock} onChange={e=>s("stock",e.target.value)}/>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:2}}>
          <button className="btn bg2" style={{flex:1}} onClick={onClose}>✕ Cancel</button>
          <button className="btn bp" style={{flex:2}} onClick={()=>onSave(form,isNew)}>
            <FontAwesomeIcon icon={faFloppyDisk} /> {isNew?"Add Product":"Save Changes"}
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
  const [expandedId, setExpandedId] = useState(null);

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
    /* Duplicate name check — only when adding a new customer */
    if(isNew){
      const exists=(d.customers||[]).some(c=>c.name.trim().toLowerCase()===clean.name.toLowerCase());
      if(exists){toast("Customer already exists!","err");errBeep();return;}
      d.customers=[{...clean,id:uid(),balance:0,createdAt:new Date().toISOString()},...(d.customers||[])];
    }else{
      d.customers=(d.customers||[]).map(c=>c.id===clean.id?{...c,...clean}:c);
    }
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
        icon:<FontAwesomeIcon icon={faHandHoldingDollar} />,confirmText:"Confirm",
        onConfirm:async()=>{
          const d=getLS();
          const ci=d.customers.findIndex(c=>c.id===snap.id);
          if(ci>=0)d.customers[ci].balance=parseFloat(Math.max(0,d.customers[ci].balance-amtSnap).toFixed(2));
          d.utangLedger=[{id:uid(),customerId:snap.id,type:"payment",amount:amtSnap,
            description:"Partial payment",date:new Date().toISOString()},...(d.utangLedger||[])];
          await saveData(d);toast(<span>Payment recorded! <FontAwesomeIcon icon={faHandHoldingDollar} /></span>);;okBeep();
          }});},60);};

  const deleteCust=c=>setConfirm({
    title:"Delete Customer",msg:`Delete "${c.name}"?\nAll records will be removed.`,icon:<FontAwesomeIcon icon={faTrashCan} />,danger:true,confirmText:"Delete",
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
            <h3 style={{ fontWeight:700, marginBottom:18, fontSize:16 }}>{editCust ? (<><FontAwesomeIcon icon={faPen} /> Edit Customer</>) : ("➕ Add Customer")}</h3>
            <CustForm init={editCust||{}} onSave={handleSaveCust} onClose={()=>{setCustModal(false);setEditCust(null);}}/>
          </div>
        </div>
      )}

      {payModal&&(
        <div className="backdrop">
          <div className="msheet" style={{maxWidth:360,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:16}}><FontAwesomeIcon icon={faHandHoldingDollar} /> Payment</h3>
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
              <h3 style={{fontWeight:700,fontSize:16}}><FontAwesomeIcon icon={faClipboardList} /> {ledgerCust.name}'s Ledger</h3>
              <button className="btn bg2 bsm" onClick={()=>setLedgerCust(null)}>✕</button>
            </div>
            <div style={{background:ledgerCust.balance>0?"var(--wnl)":"var(--acl)",border:`1.5px solid ${ledgerCust.balance>0?"var(--wn)":"var(--ac)"}`,borderRadius:"var(--rs)",padding:14,marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:12,color:"var(--tx2)"}}>Current Balance</div>
              <div style={{fontSize:28,fontWeight:700,color:ledgerCust.balance>0?"var(--wn)":"var(--ac)"}}>{fmt(ledgerCust.balance)}</div>
            </div>
            {/* Vertical ledger list — no horizontal scroll */}
            <div style={{flex:1,overflowY:"auto",minHeight:0,marginTop:4}}>
              {ledger.filter(l=>l.customerId===ledgerCust.id).length===0?(
                <div style={{textAlign:"center",padding:"28px 0",color:"var(--tx3)",fontSize:13}}>No transactions yet</div>
              ):(
                [...ledger.filter(l=>l.customerId===ledgerCust.id)]
                  .sort((a,b)=>new Date(b.date)-new Date(a.date))
                  .map((l,i,arr)=>(
                  <div key={l.id} style={{
                    display:"flex",alignItems:"flex-start",gap:11,
                    padding:"11px 0",
                    borderBottom:i<arr.length-1?"1px solid var(--bd)":"none"}}>
                    {/* Icon bubble */}
                    <div style={{width:34,height:34,borderRadius:"50%",flexShrink:0,
                      background:l.type==="payment"?"var(--acl)":"var(--wnl)",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>
                      {l.type==="payment"?<FontAwesomeIcon icon={faHandHoldingDollar} />:<FontAwesomeIcon icon={faFilePen} />}
                    </div>
                    {/* Description + date + badge */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {l.description||"—"}
                      </div>
                      <div style={{fontSize:11,color:"var(--tx3)",marginBottom:3}}>
                        {fmtDate(l.date)} · {fmtTime(l.date)}
                      </div>
                    </div>
                    {/* Amount */}
                    <div style={{fontWeight:800,fontSize:14,flexShrink:0,paddingTop:3,
                      color:l.type==="payment"?"var(--ac)":"var(--dn)"}}>
                      {l.type==="payment"?"+":"−"}{fmt(l.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Utang page: header pinned, list scrolls beneath */}
      <div className="pg-page">
        <div className="pg-hdr">
          {/* Summary: icon tile, total owed, and how many customers still owe */}
          <div style={{background:"var(--wnl)",border:"1.5px solid var(--wn)",borderRadius:"var(--rs)",padding:"9px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:"var(--sf)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💳</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,color:"var(--tx2)",fontWeight:500,lineHeight:1.2}}>Total Uncollected Utang</div>
              <div style={{fontSize:20,fontWeight:800,color:"var(--wn)",lineHeight:1.2}}>{fmt(totalUtang)}</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:16,fontWeight:800,color:"var(--tx)",lineHeight:1.2}}>{customers.filter(c=>c.balance>0).length}</div>
              <div style={{fontSize:10,color:"var(--tx3)",lineHeight:1.2}}>with balance</div>
            </div>
          </div>
          {/* Search + Add on one row (same pattern as the Products page) */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search customers…"/>
            <button className="btn bp bsm" style={{flexShrink:0,whiteSpace:"nowrap"}} aria-label="Add customer"
              onClick={()=>{setEditCust(null);setCustModal(true);}}>+ Add</button>
          </div>
        </div>

        {/* Customer list — scrollable */}
        <div className="pg-body" style={{display:"flex",flexDirection:"column",gap:1,paddingTop:10}}>
          {filteredCustomers.length===0&&(
            <div className="cust-card" style={{padding:"28px 16px",textAlign:"center",color:"var(--tx3)",fontSize:14}}>
              {search?"No customers match your search.":"No customers yet."}
            </div>
          )}
          {filteredCustomers.map(c=>{
            const isExpanded=expandedId===c.id;
            return(
            <div key={c.id} className="cust-card">
              {/* Compact single row */}
              <div className="cust-row" onClick={()=>setExpandedId(isExpanded?null:c.id)}>
                {/* Avatar */}
                <div style={{width:36,height:36,borderRadius:"50%",flexShrink:0,
                  background:c.balance>0?"var(--wnl)":"var(--acl)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontWeight:800,fontSize:14,
                  color:c.balance>0?"var(--wn)":"var(--ac)"}}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                {/* Name + contact */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"var(--tx3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.contact||c.address||"—"}</div>
                </div>
                {/* Balance + status */}
                <div style={{textAlign:"right",flexShrink:0,marginRight:6}}>
                  <div style={{fontWeight:800,fontSize:13,color:c.balance>0?"var(--dn)":"var(--ac)"}}>{fmt(c.balance)}</div>
                  <span className={`badge ${c.balance>0?"bg-r":"bg-g"}`} style={{fontSize:10,padding:"1px 8px"}}>{c.balance>0?"Utang":"Paid"}</span>
                </div>
                {/* Expand chevron */}
                <span style={{fontSize:11,color:"var(--tx3)",flexShrink:0,
                  display:"inline-block",transition:"transform .2s",
                  transform:isExpanded?"rotate(180deg)":"rotate(0deg)"}}>▾</span>
              </div>
              {/* Action tray — always visible space, never clips */}
              {isExpanded&&(
                <div className="cust-actions">
                  <button className="btn bg2 bsm" style={{flex:1,minWidth:0,fontSize:12,whiteSpace:"nowrap"}}
                    onClick={e=>{e.stopPropagation();setLedgerCust(c);}}><FontAwesomeIcon icon={faClipboardList} /> Ledger</button>
                  {c.balance>0&&(
                    <button className="btn bp bsm" style={{flex:1,minWidth:0,fontSize:12,whiteSpace:"nowrap"}}
                      onClick={e=>{e.stopPropagation();setPayModal(c);setPayAmt("");}}><FontAwesomeIcon icon={faHandHoldingDollar} /> Pay</button>
                  )}
                  <button className="btn bg2 bsm" style={{padding:"6px 13px",fontSize:14,flexShrink:0}}
                    onClick={e=>{e.stopPropagation();setEditCust({...c});setCustModal(true);}}><FontAwesomeIcon icon={faPen} /></button>
                  <button className="btn bd2 bsm" style={{padding:"6px 13px",fontSize:14,flexShrink:0}}
                    onClick={e=>{e.stopPropagation();deleteCust(c);}}><FontAwesomeIcon icon={faTrashCan} /></button>
                </div>
              )}
            </div>
            );
          })}
        
          <div className="pg-spacer"/></div>
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
        <button className="btn bp" style={{flex:1}} onClick={()=>{
          if(form.contact&&form.contact.length>0&&form.contact.length<11){toast("Contact number must be exactly 11 digits!","err");return;}
          onSave(form,isNew);
        }}><FontAwesomeIcon icon={faFloppyDisk} /> Save</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   REPORTS
═══════════════════════════════════════════ */
/* Report period sub-pages — mirrors ProfileTabs (same .tabs.pf-tabs styling) */
const REPORT_TABS=[
  {id:"daily",  label:"Daily",   icon:faCalendarDay},
  {id:"weekly", label:"Weekly",  icon:faCalendarWeek},
  {id:"monthly",label:"Monthly", icon:faCalendarDays},
  {id:"all",    label:"All",     icon:faInfinity},
];
function ReportTabs({period,setPeriod}){
  return(
    <div className="tabs pf-tabs" role="tablist" aria-label="Report period">
      {REPORT_TABS.map(t=>(
        <button key={t.id} type="button" role="tab" aria-selected={period===t.id}
          className={`tabi ${period===t.id?"on":""}`} onClick={()=>setPeriod(t.id)}>
          <FontAwesomeIcon icon={t.icon}/>{t.label}
        </button>
      ))}
    </div>
  );
}

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
      <div className="pg-act">
        <button className="btn bp bsm" onClick={doExport} disabled={busy}>{busy ? ("⏳ Exporting…") : (<><FontAwesomeIcon icon={faDownload} /> Export Excel</>)}
        </button>
      </div>
      {/* Period sub-pages — same tab pattern as the Profile sub-pages */}
      <PageHeader sub="Sales summary for the selected period.">
        <ReportTabs period={period} setPeriod={setPeriod}/>
      </PageHeader>

      <div className="pg-body">
        <div className="rpt-stats" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:5,marginTop:10,marginBottom:20}}>
          <div className="sc" style={{"--c":"var(--ac)"}}><div style={{fontSize:24}}>💵</div><div className="sn" style={{color:"var(--ac)"}}>{fmt(cashSales)}</div><div className="sl">Cash Sales</div></div>
          <div className="sc" style={{"--c":"var(--in)"}}><div style={{fontSize:24}}>🧾</div><div className="sn" style={{color:"var(--in)"}}>{filtered.length}</div><div className="sl">Transactions</div></div>
          <div className="sc" style={{"--c":"var(--wn)"}}><div style={{fontSize:24}}>📋</div><div className="sn" style={{color:"var(--wn)"}}>{fmt(utangSales)}</div><div className="sl">On Credit</div></div>
          <div className="sc" style={{"--c":"#8e44ad"}}><div style={{fontSize:24}}>💰</div><div className="sn" style={{color:"#8e44ad"}}>{fmt(cashSales+utangSales)}</div><div className="sl">Gross Revenue</div></div>
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
          <h3 style={{fontWeight:600,marginBottom:4,fontSize:14}}>Transaction Log</h3>
          {filtered.length===0
            ?<p style={{color:"var(--tx3)",fontSize:13,textAlign:"center",padding:"20px 0"}}>No transactions in this period.</p>
            :filtered.slice(0,50).map(t=>(
              <div key={t.id} style={{padding:"5px 0",borderBottom:"1px solid var(--bd)",display:"flex",flexDirection:"column",gap:4}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--tx2)"}}>{fmtDate(t.date)}</span>
                    <span style={{fontSize:11,color:"var(--tx3)"}}>{fmtTime(t.date)}</span>
                    <span className={`badge ${t.isUtang?"bg-y":"bg-g"}`} style={{fontSize:11}}>{t.isUtang?"Utang":"Cash"}</span>
                  </div>
                  <span style={{fontWeight:800,color:"var(--ac)",fontSize:14,flexShrink:0}}>{fmt(t.total)}</span>
                </div>
                {t.items?.length>0&&(
                  <div style={{fontSize:12,color:"var(--tx3)",lineHeight:1.5}}>
                    {t.items.map(i=>`${i.name} ×${i.qty}`).join(" · ")}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      </div>
    
      <div className="pg-spacer"/></div>
  );
}

/* ═══════════════════════════════════════════
   SHARED PAGE PIECES
═══════════════════════════════════════════ */
function PageHeader({sub,children}){
  return(
    <div className="pg-hdr">
      {sub&&<p style={{fontSize:12,color:"var(--tx2)"}}>{sub}</p>}
      {children}
    </div>
  );
}

/* Sub-page tabs shared by every page under Profile: Profile · Settings · Help · Guides.
   Each tab is still its own page id, so setPage("settings") etc. keeps working. */
const PROFILE_TABS=[
  {id:"profile", label:"Profile",  icon:faCircleUser},
  {id:"settings",label:"Settings", icon:faGear},
  {id:"help",    label:"Help",     icon:faCircleQuestion},
  {id:"guide",   label:"Guides",   icon:faBookOpen},
];
function ProfileTabs({page,setPage}){
  return(
    <div className="tabs pf-tabs" role="tablist" aria-label="Profile sections">
      {PROFILE_TABS.map(t=>(
        <button key={t.id} type="button" role="tab" aria-selected={page===t.id}
          className={`tabi ${page===t.id?"on":""}`} onClick={()=>setPage(t.id)}>
          <FontAwesomeIcon icon={t.icon}/>{t.label}
        </button>
      ))}
    </div>
  );
}

/* Round avatar: Google photo when available, otherwise the store's first letter */
function UserAvatar({photo,initial,size=32}){
  const [bad,setBad]=useState(false);
  return(
    <span className="ua" style={{width:size,height:size,fontSize:Math.round(size*.42)}}>
      {photo&&!bad
        ?<img src={photo} alt="" referrerPolicy="no-referrer" onError={()=>setBad(true)}/>
        :initial}
    </span>
  );
}

/* ═══════════════════════════════════════════
   PROFILE MENU  (top-right avatar dropdown)
   Profile · Settings · Sign out
═══════════════════════════════════════════ */
function ProfileMenu({db,page,setPage,logout}){
  const [open,setOpen]=useState(false);
  const wrapRef=useRef(null);
  const user=auth.currentUser;
  const storeName=db.settings?.storeName||"My Store";
  const email=user?.email||db.profile?.email||"";
  const photo=user?.photoURL||"";
  const initial=(storeName.trim()[0]||"S").toUpperCase();

  /* Close on outside click / tap and on Escape */
  useEffect(()=>{
    if(!open)return;
    const onDown=e=>{if(wrapRef.current&&!wrapRef.current.contains(e.target))setOpen(false);};
    const onKey=e=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("mousedown",onDown);
    document.addEventListener("touchstart",onDown);
    document.addEventListener("keydown",onKey);
    return()=>{
      document.removeEventListener("mousedown",onDown);
      document.removeEventListener("touchstart",onDown);
      document.removeEventListener("keydown",onKey);
    };
  },[open]);

  const go=id=>{setOpen(false);setPage(id);};

  return(
    <div className="pm-wrap" ref={wrapRef}>
      <button type="button" className={`pm-btn ${open?"open":""}`} aria-label="Account menu"
        aria-haspopup="menu" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>
        <UserAvatar photo={photo} initial={initial} size={30}/>
        <FontAwesomeIcon icon={faChevronDown} className="pm-chev"/>
      </button>
      {open&&(
        <div className="pm-menu" role="menu">
          <div className="pm-head">
            <div className="pm-name">{storeName}</div>
            {email&&<div className="pm-mail">{email}</div>}
          </div>
          <button type="button" role="menuitem" className={`pm-item ${page==="profile"?"on":""}`} onClick={()=>go("profile")}>
            <FontAwesomeIcon icon={faCircleUser}/>Profile
          </button>
          <button type="button" role="menuitem" className={`pm-item ${page==="settings"?"on":""}`} onClick={()=>go("settings")}>
            <FontAwesomeIcon icon={faGear}/>Settings
          </button>
          <button type="button" role="menuitem" className="pm-item out" onClick={()=>{setOpen(false);logout();}}>
            <FontAwesomeIcon icon={faRightFromBracket}/>Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   PROFILE  — store information + account
═══════════════════════════════════════════ */
function ProfilePage({db,saveData,logout,page,setPage}){
  const [form,setForm]=useState({
    ownerName:cleanName(db.settings.ownerName||db.profile?.ownerName||auth.currentUser?.displayName||"",60),
    storeName:db.settings.storeName||"",
    address:db.settings.address||"",
    contact:db.settings.contact||"",
    lowStockThreshold:db.settings.lowStockThreshold||5
  });
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const user=auth.currentUser;
  const email=user?.email||db.profile?.email||"";
  const isGoogle=user?.providerData?.some(p=>p.providerId==="google.com");
  const initial=((db.settings.storeName||"S").trim()[0]||"S").toUpperCase();

  const save=async()=>{
    if(form.contact.length>0&&form.contact.length<11){toast("Contact number must be exactly 11 digits!","err");return;}
    const d=getLS();
    d.settings={...d.settings,address:form.address,contact:form.contact,lowStockThreshold:form.lowStockThreshold};
    d.settings.storeName=cleanName(form.storeName)||d.profile?.storeName||"My Store";
    const owner=cleanName(form.ownerName,60);
    if(!owner){toast("Owner name is required!","err");errBeep();return;}
    d.settings.ownerName=owner;
    d.profile={...(d.profile||{}),storeName:d.settings.storeName,ownerName:owner};
    await saveData(d);toast("Profile saved! ✅");
  };

  return(
    <div className="pg-page">
      <PageHeader sub="Your store information and account.">
        <ProfileTabs page={page} setPage={setPage}/>
      </PageHeader>
      <div className="pg-body">
        <div className="pf-wrap pf-split">
          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,fontSize:15}}><FontAwesomeIcon icon={faStore}/> Store profile</h3>
            <p style={{color:"var(--tx2)",fontSize:13,margin:"2px 0 16px"}}>This is how your store shows up on receipts and across the app.</p>
            <div className="frow">
              <div className="fg"><label>Owner Name</label><input value={form.ownerName} maxLength={60} placeholder="Your name" onChange={e=>s("ownerName",e.target.value)}/></div>
              <div className="fg"><label>Store Name</label><input value={form.storeName} onChange={e=>s("storeName",e.target.value)}/></div>
            </div>
            <div className="frow">
              <div className="fg"><label>Contact Number</label>
                <input type="text" inputMode="numeric" value={form.contact} maxLength={11}
                  onChange={e=>s("contact",e.target.value.replace(/[^0-9]/g,"").slice(0,11))}/>
                {form.contact.length>0&&form.contact.length<11&&(
                  <div style={{fontSize:12,color:"var(--dn)",marginTop:5}}>Must be exactly 11 digits.</div>
                )}
              </div>
              <div className="fg"><label>Address</label><input value={form.address} onChange={e=>s("address",e.target.value)}/></div>
            </div>
            <div className="fg">
              <label>Low Stock Alert Threshold</label>
              <input type="number" min="1" value={form.lowStockThreshold} onChange={e=>s("lowStockThreshold",parseInt(e.target.value)||5)}/>
              <div style={{fontSize:12,color:"var(--tx2)",marginTop:5}}>Alert when stock falls to or below this number.</div>
            </div>
            <button className="btn bp" onClick={save}><FontAwesomeIcon icon={faFloppyDisk}/> Save changes</button>
          </div>

          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,fontSize:15}}><FontAwesomeIcon icon={faCircleUser}/> Account</h3>
            <p style={{color:"var(--tx2)",fontSize:13,margin:"2px 0 16px"}}>{isGoogle?"Signed in with Google.":"Signed in with email and password."}</p>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
                <UserAvatar photo={user?.photoURL||""} initial={initial} size={44}/>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14,overflowWrap:"anywhere"}}>{email||"No email on file"}</div>
                  {isGoogle&&<span className="badge bg-g" style={{marginTop:3}}>Google account</span>}
                </div>
              </div>
              <button className="btn bg2 bsm" onClick={logout}><FontAwesomeIcon icon={faRightFromBracket}/> Sign out</button>
            </div>
          </div>
        </div>
        <div className="pg-spacer"/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SETTINGS  — Security + Backup + Danger zone on one page
═══════════════════════════════════════════ */
function SettingsPage({db,saveData,setConfirm,page,setPage}){
  const [pinFlow, setPinFlow] = useState("idle");
  const [oldPin,  setOldPin]  = useState("");
  const [newPin,  setNewPin]  = useState("");
  const [confPin, setConfPin] = useState("");
  const [busy,    setBusy]    = useState(false);

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
        {name:"GCashTransactions",rows:[
          ["id","date","type","amount","fee","feeVia","customer","ref"],
          ...asArr(d.gcashTransactions).map(t=>[t.id,t.date,t.type,t.amount,t.fee,t.feeVia,t.customer||"",t.ref||""])
        ]},
        {name:"ELoadTransactions",rows:[
          ["id","date","network","mobile","amount","fee","feeVia","customer","ref"],
          ...asArr(d.eloadTransactions).map(t=>[t.id,t.date,t.network,String(t.mobile||""),t.amount,t.fee,t.feeVia,t.customer||"",t.ref||""])
        ]},
        {name:"GCashRates",rows:[
          ["min","max","fee"],
          ...getRates(d).map(r=>[r.min,r.max,r.fee])
        ]},
        {name:"GCashConfig",rows:[
          ["initialCash","initialGcash"],
          [Number(d.gcashConfig?.initialCash)||0,Number(d.gcashConfig?.initialGcash)||0]
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
            if(sheets.GCashTransactions){
              d.gcashTransactions=(sheets.GCashTransactions||[]).map(r=>({
                id:String(r.id||uid()),date:r.date||new Date().toISOString(),
                type:r.type==="cashout"?"cashout":"cashin",
                amount:r2(parseFloat(r.amount)),fee:Math.max(0,r2(parseFloat(r.fee))),
                feeVia:r.feeVia==="gcash"?"gcash":"cash",
                customer:sanitize(r.customer||"").slice(0,100),ref:sanitize(String(r.ref||"")).slice(0,50)
              })).filter(t=>t.amount>0);
            }
            if(sheets.ELoadTransactions){
              d.eloadTransactions=(sheets.ELoadTransactions||[]).map(r=>{
                let mob=String(r.mobile||"").replace(/[^0-9]/g,"");
                if(mob.length===10&&mob[0]==="9")mob="0"+mob;
                return{
                  id:String(r.id||uid()),date:r.date||new Date().toISOString(),
                  network:ELOAD_NETWORKS.includes(r.network)?r.network:"Other",mobile:mob,
                  amount:r2(parseFloat(r.amount)),fee:Math.max(0,r2(parseFloat(r.fee))),
                  feeVia:r.feeVia==="gcash"?"gcash":"cash",
                  customer:sanitize(r.customer||"").slice(0,100),ref:sanitize(String(r.ref||"")).slice(0,50)
                };
              }).filter(t=>t.amount>0);
            }
            if(sheets.GCashRates){
              const rr=(sheets.GCashRates||[]).map(r=>({id:uid(),min:r2(parseFloat(r.min)),max:r2(parseFloat(r.max)),fee:Math.max(0,r2(parseFloat(r.fee)))}))
                .filter(r=>r.max>=r.min&&r.max>0);
              if(rr.length)d.gcashRates=rr;
            }
            if(sheets.GCashConfig&&sheets.GCashConfig[0]){
              const c=sheets.GCashConfig[0];
              d.gcashConfig={initialCash:Math.max(0,r2(parseFloat(c.initialCash))),initialGcash:Math.max(0,r2(parseFloat(c.initialGcash)))};
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
    onConfirm:async()=>{
      const d=getLS();
      const fresh={...d,products:[],transactions:[],customers:[],utangLedger:[],gcashTransactions:[],eloadTransactions:[]};
      delete fresh.gcashConfig;
      await saveData(fresh);toast("All data has been reset.");
    }
  });

  const pinLabel={idle:"",old:"Enter your CURRENT PIN",disableVerify:"Enter your CURRENT PIN to disable",new:"Enter your NEW PIN",confirm:"Confirm your new PIN"};
  const curPin=pinFlow==="old"||pinFlow==="disableVerify"?oldPin:pinFlow==="new"?newPin:confPin;

  return(
    <div className="pg-page">
      <PageHeader sub="PIN lock, backup, and data controls.">
        <ProfileTabs page={page} setPage={setPage}/>
      </PageHeader>
      <div className="pg-body">
        <div className="pf-wrap">
          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:15}}><FontAwesomeIcon icon={faLock} /> PIN Lock</h3>
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
                <button className="btn bd2 bsm" onClick={startDisablePin}><FontAwesomeIcon icon={faLockOpen} />Disable PIN</button>
              </div>
            )}
            {!db.settings.pinEnabled&&pinFlow==="idle"&&(
              <button className="btn bp bsm" style={{marginBottom:20}} onClick={startChangePin}><FontAwesomeIcon icon={faLock} /> Set PIN</button>
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

          <div className="card" style={{padding:22}}>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:15}}><FontAwesomeIcon icon={faFloppyDisk} /> Backup & Restore</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:20}}>Export your full data as an Excel file. Import it to restore everything.</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
              <button className="btn bp bsm" onClick={exportBackup} disabled={busy}>
                {busy ? ("⏳ Exporting…") : (<><FontAwesomeIcon icon={faFileExport} /> Export Backup (Excel)</>)}
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

          <div className="card" style={{padding:22,border:"1.5px solid var(--dn)"}}>
            <h3 style={{fontWeight:700,marginBottom:6,fontSize:15,color:"var(--dn)"}}><FontAwesomeIcon icon={faTriangleExclamation} /> Danger Zone</h3>
            <p style={{color:"var(--tx2)",fontSize:13,marginBottom:20}}>These actions are permanent and cannot be undone.</p>
            <button className="btn bd2" onClick={resetAll}>☠️ Reset ALL Data</button>
          </div>
        </div>
        <div className="pg-spacer"/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GUIDE  — how to use each part of the app
═══════════════════════════════════════════ */
const GUIDE_SECTIONS=[
  {id:"start",icon:faLightbulb,title:"Getting started",blurb:"Set up once, then sell every day.",
    steps:[
      "Open the profile menu at the top right and choose Profile. Enter your store name, address, and contact number. They appear on your receipts.",
      "Go to Inventory and tap + Add Product. Enter the name, category, price, and stock.",
      "Open Point of Sale, tap a product to add it to the cart, and check out.",
      "At the end of the day, check Dashboard and Reports to see how you did."
    ]},
  {id:"pos",icon:faCartShopping,title:"Point of Sale",blurb:"Ring up a sale and give the receipt.",page:"pos",pageLabel:"Open Point of Sale",
    steps:[
      "Search for a product or tap it to add it to the cart. For an Open Price item, enter the price when asked.",
      "Type the Cash Received so the app can work out the change.",
      "Tap Checkout, then Confirm Sale. The receipt appears and stock goes down automatically."
    ],
    tip:"Customer can't pay now? Switch the sale to Utang and choose the customer. Products with zero stock can't be added to the cart."},
  {id:"inventory",icon:faBoxesStacked,title:"Inventory",blurb:"Keep products, prices, and stock up to date.",page:"inventory",pageLabel:"Open Inventory",
    steps:[
      "Tap + Add Product.",
      "Fill in the Product Name, Category, Price, and Stock Quantity, then save.",
      "Tap Edit on any product to change its price or add stock after a delivery."
    ],
    tip:"Not sure of the price yet? Turn on Open / Variable Price and enter it at the time of sale. Set your low-stock alert level in Profile."},
  {id:"utang",icon:faClipboardList,title:"Utang",blurb:"Track what customers owe and their payments.",page:"utang",pageLabel:"Open Utang",
    steps:[
      "Tap + Add (beside the search bar) and save their name, contact, and address.",
      "To sell on credit, choose Utang in Point of Sale and pick the customer.",
      "When they pay, open the customer, tap Payment, enter the amount, and confirm. Partial payments are fine.",
      "Tap Ledger to see every utang and payment for that customer."
    ],
    tip:"Total Uncollected Utang at the top shows everything still owed to you."},
  {id:"gcash",icon:faWallet,title:"GCash",blurb:"Record cash in and cash out with your fee.",page:"gcash",pageLabel:"Open GCash",
    steps:[
      "Tap Set Balances and enter your starting cash and GCash balance.",
      "Tap + New Transaction and choose cash in or cash out, then enter the amount.",
      "Enter your service fee and choose whether it was paid in cash or via GCash.",
      "Save. Your balances and Transaction History update right away."
    ]},
  {id:"eload",icon:faMobileScreenButton,title:"E-Load",blurb:"Log mobile load sales and your profit.",page:"eload",pageLabel:"Open E-Load",
    steps:[
      "Tap + New Transaction.",
      "Pick the Network, enter the customer's mobile number (11 digits starting with 09), and the Load Amount.",
      "Enter your Service Fee / Profit and choose how the fee was paid.",
      "Save. The sale shows up in Transaction History."
    ]},
  {id:"reports",icon:faChartLine,title:"Reports",blurb:"See how your store is doing.",page:"reports",pageLabel:"Open Reports",
    steps:[
      "Open Reports from the sidebar. On your phone, tap More first.",
      "Choose a daily, weekly, or monthly view.",
      "Review Gross Revenue, Cash Sales, On Credit, and Top Products by Revenue.",
      "Tap Export Excel to save a copy."
    ]},
  {id:"safety",icon:faLock,title:"PIN lock and backup",blurb:"Protect your store and keep your data safe.",page:"settings",pageLabel:"Open Settings",
    steps:[
      "Open the profile menu, choose Profile, then tap the Settings tab.",
      "Under Security, tap Set PIN to lock the app with a 4-digit PIN.",
      "Under Backup & Restore, tap Export Backup (Excel) and keep the file somewhere safe, like Google Drive.",
      "To restore on another device, tap Import Backup (Excel) and choose that file."
    ],
    tip:"Importing a backup replaces all current data."},
];

function GuidePage({page,setPage}){
  const [open,setOpen]=useState("start");
  return(
    <div className="pg-page">
      <PageHeader sub="Step-by-step help for running your store.">
        <ProfileTabs page={page} setPage={setPage}/>
      </PageHeader>
      <div className="pg-body">
        <div className="pf-wrap">
          <div className="card" style={{padding:"4px 22px"}}>
            {GUIDE_SECTIONS.map((g,i)=>{
              const isOpen=open===g.id;
              return(
                <div key={g.id} style={{borderTop:i?"1px solid var(--bd)":"none"}}>
                  <button type="button" className="gd-row" aria-expanded={isOpen} aria-controls={`gd-${g.id}`}
                    onClick={()=>setOpen(isOpen?null:g.id)}>
                    <span className="gd-ic"><FontAwesomeIcon icon={g.icon}/></span>
                    <span style={{flex:1,minWidth:0}}>
                      <span className="gd-title">{g.title}</span>
                      <span className="gd-blurb">{g.blurb}</span>
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className={`gd-chev ${isOpen?"open":""}`}/>
                  </button>
                  {isOpen&&(
                    <div id={`gd-${g.id}`} className="gd-body">
                      <ol className="gd-steps">
                        {g.steps.map((t,k)=><li key={k}>{t}</li>)}
                      </ol>
                      {g.tip&&<div className="gd-tip"><FontAwesomeIcon icon={faLightbulb}/><span>{g.tip}</span></div>}
                      {g.page&&<button className="btn bg2 bsm" onClick={()=>setPage(g.page)}>{g.pageLabel}</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="pg-spacer"/>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HELP  — contact the developer, request a feature, report an issue
═══════════════════════════════════════════ */
function HelpPage({db,page,setPage}){
  return(
    <div className="pg-page">
      <PageHeader sub="Get in touch, request a feature, or report a problem.">
        <ProfileTabs page={page} setPage={setPage}/>
      </PageHeader>
      <div className="pg-body">
        <div className="pf-wrap">
          <HelpSupport storeName={db.settings.storeName}/>
        </div>
        <div className="pg-spacer"/>
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════════
   GCASH & E-LOAD  — additive service modules
   Own data keys (never mixed with db.transactions / Reports):
     gcashTransactions : []   → { id,type,amount,fee,feeVia,customer,ref,date }
     eloadTransactions : []   → { id,network,mobile,amount,fee,feeVia,customer,ref,date }
     gcashConfig       : {initialCash,initialGcash}
   Missing keys on older stores/backups fall back safely to empty values.
═══════════════════════════════════════════════════════════════ */
const r2      = n => Math.round((Number(n)||0)*100)/100;
const asArr   = v => Array.isArray(v)?v:(v&&typeof v==="object"?Object.values(v):[]);
const fmtS    = n => n<0?`−${fmt(-n)}`:fmt(n);                 // balance, may be negative
const fmtSgn  = n => `${n<0?"−":"+"}${fmt(Math.abs(n))}`;      // signed effect
const fmtDT   = d => `${fmtDate(d)}, ${fmtTime(d)}`;
const sortNewest = list => [...list].sort((a,b)=>new Date(b.date)-new Date(a.date));
const isToday = d => new Date(d).toDateString()===new Date().toDateString();
const parseMoney = s => {const t=String(s).trim();if(t==="")return NaN;const n=Number(t);return Number.isFinite(n)?n:NaN;};
const blockNumKeys = e => {if(["e","E","+","-"].includes(e.key))e.preventDefault();};
const MAX_AMT = 9999999;

/* Balance effect of ONE GCash transaction.
   Cash In  : customer gives CASH, receives GCASH  → cash +amount, gcash −amount
   Cash Out : customer gives GCASH, receives CASH  → gcash +amount, cash −amount
   Service fee is collected in the wallet it is paid through (feeVia):
     feeVia "cash"  → cash  += fee      feeVia "gcash" → gcash += fee
   Invariant: cash + gcash change always equals the fee (profit). */
const gcashEffect=(type,amount,fee,feeVia)=>{
  const a=r2(amount),f=r2(fee);
  let cash=0,gcash=0;
  if(type==="cashout"){gcash+=a;cash-=a;}
  else{cash+=a;gcash-=a;}
  if(feeVia==="gcash")gcash+=f;else cash+=f;
  return{cash:r2(cash),gcash:r2(gcash),profit:f};
};

/* Current balances = starting balances + all GCash transactions */
const gcashBalances=d=>{
  const cfg=d.gcashConfig||{};
  let cash=Number(cfg.initialCash)||0,gcash=Number(cfg.initialGcash)||0,profit=0,todayProfit=0;
  asArr(d.gcashTransactions).forEach(t=>{
    const e=gcashEffect(t.type,t.amount,t.fee,t.feeVia);
    cash+=e.cash;gcash+=e.gcash;profit+=e.profit;
    if(isToday(t.date))todayProfit+=e.profit;
  });
  return{cash:r2(cash),gcash:r2(gcash),total:r2(cash+gcash),profit:r2(profit),todayProfit:r2(todayProfit)};
};

/* ── shared small UI pieces ── */
function Seg({value,onChange,options,cols}){
  return(
    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols||options.length},1fr)`,gap:8}}>
      {options.map(o=>(
        <button key={o.v} type="button" className={`btn bsm ${value===o.v?"bp":"bg2"}`}
          style={{minWidth:0,padding:"0 8px",minHeight:44}} onClick={()=>onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

function StatCard({label,value,color,sub,icon}){
  return(
    <div className="sc" style={{minWidth:0,display:"flex",gap:12,alignItems:"flex-start","--c":color}}>
      {icon&&<span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:44,height:44,borderRadius:12,
        background:`color-mix(in srgb, ${color} 14%, transparent)`,color,fontSize:20}}><FontAwesomeIcon icon={icon}/></span>}
      <div style={{minWidth:0,flex:1}}>
        <div className="sl" style={{marginTop:0}}>{label}</div>
        <div className="sn" style={{color,fontSize:"clamp(16px,4.6vw,22px)",overflowWrap:"anywhere"}}>{value}</div>
        {sub&&<div style={{fontSize:11,color:"var(--tx3)",marginTop:6}}>{sub}</div>}
      </div>
    </div>
  );
}

/* ── GCash Rate Charge Guide: default table, lookup, card and editor ── */
const defaultGcashRates=()=>{
  const r=[{id:"r0",min:1,max:500,fee:10}];
  for(let i=1;i<20;i++)r.push({id:`r${i}`,min:i*500+1,max:(i+1)*500,fee:10*(i+1)});
  return r;
};
const getRates=d=>{
  const list=asArr(d?.gcashRates).filter(r=>r&&Number.isFinite(Number(r.min))&&Number.isFinite(Number(r.max)));
  return (list.length?list:defaultGcashRates()).map(r=>({id:String(r.id||uid()),min:Number(r.min),max:Number(r.max),fee:Number(r.fee)||0}))
    .sort((a,b)=>a.min-b.min);
};
const findRate=(rates,amt)=>{
  if(!Number.isFinite(amt)||amt<=0)return null;
  const r=rates.find(x=>amt<=x.max);
  return r&&amt>=r.min-0.99?r:null;
};
const findFee=(rates,amt)=>findRate(rates,amt)?.fee??null;
const RG_OPEN_KEY="sari_rate_guide_open";
const readRgOpen=()=>{try{return localStorage.getItem(RG_OPEN_KEY)!=="0";}catch{return true;}};
const fmtRange=r=>`₱${r.min.toLocaleString("en-PH")} – ₱${r.max.toLocaleString("en-PH")}`;

function GCashRateGuide({rates,onEdit}){
  const [open,setOpenRaw]=useState(readRgOpen);
  const [q,setQ]=useState("");
  const [narrow,setNarrow]=useState(()=>typeof window!=="undefined"&&window.matchMedia("(max-width:768px)").matches);
  const hitRef=useRef(null);
  const setOpen=fn=>setOpenRaw(prev=>{
    const next=typeof fn==="function"?fn(prev):fn;
    try{localStorage.setItem(RG_OPEN_KEY,next?"1":"0");}catch{}
    return next;
  });
  useEffect(()=>{
    const mq=window.matchMedia("(max-width:768px)");
    const h=e=>setNarrow(e.matches);
    mq.addEventListener("change",h);
    return()=>mq.removeEventListener("change",h);
  },[]);
  const amt=parseMoney(q);
  const hit=q.trim()===""?null:findRate(rates,amt);
  const notFound=q.trim()!==""&&!hit;
  /* keep the matched row visible inside the scrolling table */
  useEffect(()=>{if(hit)hitRef.current?.scrollIntoView({block:"nearest"});},[hit?.id,open,narrow]);
  const half=Math.ceil(rates.length/2);
  const cols=!narrow&&rates.length>10?[rates.slice(0,half),rates.slice(half)]:[rates];
  const renderTable=(col,ci)=>narrow?(
    /* inline styles on purpose: this list must look the same even if an older stylesheet is still around */
    <div key={ci} style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,alignContent:"start",
      maxHeight:"min(44dvh,340px)",overflowY:"auto",overscrollBehavior:"contain"}}>
      {col.map(r=>{
        const on=hit&&hit.id===r.id;
        return(
          <div key={r.id} ref={on?hitRef:null}
            style={{display:"flex",flexDirection:"column",gap:1,minWidth:0,padding:"9px 12px",
              background:on?"var(--acl)":"var(--sf2)",borderRadius:"var(--rs)",
              border:`1px solid ${on?"var(--ac)":"transparent"}`,fontVariantNumeric:"tabular-nums"}}>
            <b style={{fontSize:16,fontWeight:800,lineHeight:1.25,color:"var(--ac)"}}>{fmt(r.fee).replace(".00","")}</b>
            <span style={{fontSize:12,color:on?"var(--ac)":"var(--tx2)",fontWeight:on?600:400,whiteSpace:"nowrap",
              overflow:"hidden",textOverflow:"ellipsis"}}>
              ₱{r.min.toLocaleString("en-PH")}–{r.max.toLocaleString("en-PH")}
            </span>
          </div>
        );
      })}
    </div>
  ):(
    <div key={ci} className="rg-tbl">
      <div className="rg-row h"><span>Transaction Amount</span><span>Rate Charge</span></div>
      {col.map(r=>(
        <div key={r.id} ref={hit&&hit.id===r.id?hitRef:null} className={`rg-row${hit&&hit.id===r.id?" hit":""}`}>
          <span>{fmtRange(r)}</span><b>{fmt(r.fee).replace(".00","")}</b>
        </div>
      ))}
    </div>
  );
  return(
    <div className="rg-card">
      <div className="rg-head">
        <button type="button" className="rg-toggle" aria-expanded={open} onClick={()=>setOpen(o=>!o)}>
          <span className="rg-ic"><FontAwesomeIcon icon={faFileLines}/></span>
          <span style={{minWidth:0}}>
            <span className="rg-title" style={{whiteSpace:"normal",overflow:"visible",textOverflow:"clip"}}>GCash Rate Charge</span>
            <span className="rg-sub" style={{whiteSpace:"normal",overflow:"visible",textOverflow:"clip"}}>Fees by transaction amount</span>
          </span>
        </button>
        <button type="button" className="rg-ibtn" aria-label="Edit rate guide" onClick={onEdit}>
          <FontAwesomeIcon icon={faPen}/><span className="rg-lbl">Edit</span>
        </button>
        <button type="button" className="rg-ibtn ghost" aria-label={open?"Collapse guide":"Expand guide"} aria-expanded={open}
          onClick={()=>setOpen(o=>!o)}>
          <FontAwesomeIcon icon={faChevronDown} className={`gd-chev ${open?"open":""}`}/>
        </button>
      </div>
      {open&&(
        <div className="rg-body">
          <div className="sbar" style={{marginBottom:10}}>
            <span className="sbic"><FontAwesomeIcon icon={faMagnifyingGlass}/></span>
            <input type="number" inputMode="decimal" min="0" step="0.01" max={MAX_AMT} onKeyDown={blockNumKeys}
              aria-label="Look up fee for an amount" placeholder="Search amount…" value={q}
              onChange={e=>setQ(e.target.value)} enterKeyHint="search"
              style={{paddingRight:hit||notFound?128:34}}/>
            {(hit||notFound)&&(
              <span role="status" aria-live="polite"
                style={{position:"absolute",right:38,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",
                  background:"none",padding:0,margin:0,border:"none",whiteSpace:"nowrap",
                  fontSize:13,fontWeight:hit?800:600,color:hit?"var(--ac)":"var(--wn)"}}>
                {hit?`Fee ${fmt(hit.fee).replace(".00","")}`:"Not in guide"}
              </span>
            )}
            {q!==""&&(
              <button type="button" className="sbar-x" aria-label="Clear amount" onClick={()=>setQ("")}>
                <FontAwesomeIcon icon={faXmark}/>
              </button>
            )}
          </div>
          <div className="rg-cols" style={narrow?{gridTemplateColumns:"1fr"}:undefined}>
            {cols.map(renderTable)}
          </div>
        </div>
      )}
    </div>
  );
}

function GCashRateEditor({rates,onSave,onClose}){
  const [rows,setRows]=useState(()=>rates.map(r=>({id:r.id,min:String(r.min),max:String(r.max),fee:String(r.fee)})));
  const [busy,setBusy]=useState(false);
  const set=(id,k,v)=>setRows(p=>p.map(r=>r.id===id?{...r,[k]:v}:r));
  const add=()=>setRows(p=>{
    const last=p[p.length-1];
    const nextMin=last&&Number.isFinite(Number(last.max))?Number(last.max)+1:1;
    return[...p,{id:uid(),min:String(nextMin),max:"",fee:""}];
  });
  const del=id=>setRows(p=>p.filter(r=>r.id!==id));
  const submit=async()=>{
    const out=[];
    for(const r of rows){
      const min=parseMoney(r.min),max=parseMoney(r.max),fee=parseMoney(r.fee);
      if(![min,max,fee].every(Number.isFinite)||min<0||max<min||fee<0){
        toast("Check the rows: every range needs valid From, To and Fee values.","err");errBeep();return;
      }
      if(max>MAX_AMT||fee>MAX_AMT){toast("Amount is too large!","err");errBeep();return;}
      out.push({id:r.id,min:r2(min),max:r2(max),fee:r2(fee)});
    }
    if(!out.length){toast("Add at least one rate.","err");errBeep();return;}
    out.sort((a,b)=>a.min-b.min);
    for(let i=1;i<out.length;i++)if(out[i].min<=out[i-1].max){toast("Ranges overlap — fix the rows.","err");errBeep();return;}
    setBusy(true);await onSave(out);setBusy(false);
  };
  return(
    <div>
      <p style={{color:"var(--tx2)",fontSize:13,marginBottom:14}}>Edit any fee, add new ranges, or remove ones you don't need.</p>
      <div className="rg-edit-row h"><span>From (₱)</span><span>To (₱)</span><span>Fee (₱)</span><span/></div>
      <div style={{maxHeight:"46dvh",overflowY:"auto",paddingTop:2}}>
        {rows.map(r=>(
          <div key={r.id} className="rg-edit-row">
            <input type="number" inputMode="decimal" min="0" value={r.min} onKeyDown={blockNumKeys} onChange={e=>set(r.id,"min",e.target.value)} aria-label="From"/>
            <input type="number" inputMode="decimal" min="0" value={r.max} onKeyDown={blockNumKeys} onChange={e=>set(r.id,"max",e.target.value)} aria-label="To"/>
            <input type="number" inputMode="decimal" min="0" value={r.fee} onKeyDown={blockNumKeys} onChange={e=>set(r.id,"fee",e.target.value)} aria-label="Fee"/>
            <button type="button" className="btn bd2 bsm" style={{padding:0,minWidth:40}} aria-label="Remove row" onClick={()=>del(r.id)}><FontAwesomeIcon icon={faTrashCan}/></button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:8,margin:"10px 0 14px",flexWrap:"wrap"}}>
        <button type="button" className="btn bg2 bsm" onClick={add}><FontAwesomeIcon icon={faPlus}/> Add rate</button>
        <button type="button" className="btn bg2 bsm" onClick={()=>setRows(defaultGcashRates().map(r=>({id:r.id,min:String(r.min),max:String(r.max),fee:String(r.fee)})))}>
          <FontAwesomeIcon icon={faArrowsRotate}/> Reset to default
        </button>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn bg2" style={{flex:1}} onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn bp" style={{flex:1}} onClick={submit} disabled={busy}><FontAwesomeIcon icon={faFloppyDisk}/> {busy?"Saving…":"Save"}</button>
      </div>
    </div>
  );
}

function TxnDetail({title,badge,rows,effects,onClose,onDelete}){
  return(
    <div className="backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="msheet" style={{maxWidth:440,alignSelf:"center",borderRadius:"var(--r)"}}>
        <div className="shandle"/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:14}}>
          <h3 style={{fontWeight:700,fontSize:16}}>{title}</h3>{badge}
        </div>
        {rows.map(([k,v])=>(
          <div key={k} style={{display:"flex",justifyContent:"space-between",gap:16,padding:"10px 0",borderBottom:"1px solid var(--bd)",fontSize:13}}>
            <span style={{color:"var(--tx2)",flexShrink:0}}>{k}</span>
            <span style={{fontWeight:600,textAlign:"right",minWidth:0,overflowWrap:"anywhere"}}>{v}</span>
          </div>
        ))}
        {effects&&(
          <div style={{background:"var(--sf2)",borderRadius:"var(--rs)",padding:"10px 14px",marginTop:14}}>
            {effects.map(([k,v,c])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"3px 0"}}>
                <span style={{color:"var(--tx2)"}}>{k}</span><span style={{fontWeight:700,color:c}}>{v}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{display:"flex",gap:10,marginTop:18}}>
          <button className="btn bd2" style={{flex:1}} onClick={onDelete}><FontAwesomeIcon icon={faTrashCan} /> Delete</button>
          <button className="btn bg2" style={{flex:1}} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   GCASH PAGE
═══════════════════════════════════════════ */
/* Minimal segmented control + peso input used by the transaction forms */
function PillSeg({value,onChange,options,label,cols}){
  return(
    <div className={`pseg${cols?" grid":""}`} role="radiogroup" aria-label={label}
      style={cols?{gridTemplateColumns:`repeat(${cols},1fr)`}:undefined}>
      {options.map(o=>(
        <button key={o.v} type="button" role="radio" aria-checked={value===o.v}
          className={value===o.v?"on":""} onClick={()=>onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}
function MoneyField({large,...props}){
  return(
    <div className={`mf${large?" lg":""}`}>
      <span>₱</span>
      <input type="number" inputMode="decimal" min="0" step="0.01" onKeyDown={blockNumKeys} {...props}/>
    </div>
  );
}
function TxMoreFields({f,s,open,setOpen,refPlaceholder}){
  if(!open)return <button type="button" className="tx-link" onClick={()=>setOpen(true)}>+ Add customer or reference no. (optional)</button>;
  return(
    <div className="frow">
      <div className="fg"><label>Customer</label>
        <input placeholder="e.g. Aling Maria" value={f.customer} maxLength={100} onChange={e=>s("customer",e.target.value)}/>
      </div>
      <div className="fg"><label>Reference no.</label>
        <input placeholder={refPlaceholder} value={f.ref} maxLength={50} onChange={e=>s("ref",e.target.value)}/>
      </div>
    </div>
  );
}

function GCashForm({balances,rates,onSave,onClose}){
  const [f,setF]=useState({type:"cashin",amount:"",fee:"",feeVia:"cash",customer:"",ref:""});
  const [busy,setBusy]=useState(false);
  const [more,setMore]=useState(false);
  const lock=useRef(false);
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const amt=parseMoney(f.amount);
  const fee=f.fee===""?0:parseMoney(f.fee);
  const valid=Number.isFinite(amt)&&amt>0&&Number.isFinite(fee)&&fee>=0;
  const eff=valid?gcashEffect(f.type,amt,fee,f.feeVia):null;
  const afterCash=eff?r2(balances.cash+eff.cash):null;
  const afterGcash=eff?r2(balances.gcash+eff.gcash):null;
  const goesNegative=eff&&(afterCash<0||afterGcash<0);
  const sugFee=findFee(rates||[],amt);
  const feeMatches=sugFee!==null&&Number(f.fee)===sugFee&&f.fee!=="";

  const submit=async()=>{
    if(lock.current)return;
    if(!Number.isFinite(amt)||amt<=0){toast("Enter an amount greater than 0!","err");errBeep();return;}
    if(!Number.isFinite(fee)||fee<0){toast("Service fee cannot be negative!","err");errBeep();return;}
    if(amt>MAX_AMT||fee>MAX_AMT){toast("Amount is too large!","err");errBeep();return;}
    lock.current=true;setBusy(true);
    const ok=await onSave({
      id:uid(),type:f.type,amount:r2(amt),fee:r2(fee),feeVia:f.feeVia,
      customer:sanitize(f.customer.trim()).slice(0,100),
      ref:sanitize(f.ref.trim()).slice(0,50),
      date:new Date().toISOString()
    });
    if(!ok){lock.current=false;setBusy(false);}
  };

  return(
    <div>
      <PillSeg label="Transaction type" value={f.type} onChange={v=>s("type",v)}
        options={[{v:"cashin",l:"Cash In"},{v:"cashout",l:"Cash Out"}]}/>
      <div className="tx-hint" style={{marginBottom:18}}>
        {f.type==="cashin"?"Customer gives cash and receives GCash.":"Customer gives GCash and receives cash."}
      </div>

      <div className="fg"><label>Amount</label>
        <MoneyField large placeholder="0.00" value={f.amount} onChange={e=>s("amount",e.target.value)} autoFocus/>
      </div>
      <div className="frow">
        <div className="fg"><label>Service fee</label>
          <MoneyField placeholder="0.00" value={f.fee} onChange={e=>s("fee",e.target.value)}/>
        </div>
        <div className="fg"><label>Fee paid via</label>
          <PillSeg label="Fee paid via" value={f.feeVia} onChange={v=>s("feeVia",v)}
            options={[{v:"cash",l:"Cash"},{v:"gcash",l:"GCash"}]}/>
        </div>
      </div>

      {sugFee!==null&&!feeMatches&&(
        <div className="rg-sug">
          <span><FontAwesomeIcon icon={faCircleInfo}/> Guide fee for {fmt(amt)}: <b>{fmt(sugFee)}</b></span>
          <button type="button" className="btn bp bsm" style={{minHeight:30,padding:"0 12px"}} onClick={()=>s("fee",String(sugFee))}>Use</button>
        </div>
      )}

      <TxMoreFields f={f} s={s} open={more} setOpen={setMore} refPlaceholder="GCash ref no."/>

      {eff&&(
        <div className="tx-sum">
          {[["Cash on Hand",fmtSgn(eff.cash),eff.cash<0?"var(--dn)":"var(--ac)"],
            ["GCash Wallet",fmtSgn(eff.gcash),eff.gcash<0?"var(--dn)":"var(--ac)"],
            ["Profit",fmtSgn(eff.profit),"var(--ac)"]].map(([k,v,c])=>(
            <div key={k}><small>{k}</small><b style={{color:c}}>{v}</b></div>
          ))}
        </div>
      )}
      {goesNegative&&(
        <div className="tx-warn" style={{background:"var(--wnl)",border:"1.5px solid var(--wn)",borderRadius:"var(--rs)",padding:"10px 14px",marginBottom:14,fontSize:12,color:"var(--wn)",fontWeight:500}}>
          {afterCash<0&&afterGcash<0?"Cash on Hand and GCash Wallet":afterCash<0?"Cash on Hand":"GCash Wallet"} would go below zero after this transaction.
        </div>
      )}

      <div className="tx-actions">
        <button className="btn bg2" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn bp" onClick={submit} disabled={busy||!valid}>
          <FontAwesomeIcon icon={faFloppyDisk} /> {busy?"Saving…":"Save"}
        </button>
      </div>
    </div>
  );
}

function GCashBalForm({init,onSave,onClose}){
  const [cash,setCash]=useState(init.initialCash?String(init.initialCash):"");
  const [gc,setGc]=useState(init.initialGcash?String(init.initialGcash):"");
  const [busy,setBusy]=useState(false);
  const submit=async()=>{
    if(busy)return;
    const c=cash===""?0:parseMoney(cash),g=gc===""?0:parseMoney(gc);
    if(!Number.isFinite(c)||c<0||!Number.isFinite(g)||g<0){toast("Enter valid amounts (0 or more)!","err");errBeep();return;}
    if(c>MAX_AMT||g>MAX_AMT){toast("Amount is too large!","err");errBeep();return;}
    setBusy(true);await onSave(r2(c),r2(g));setBusy(false);
  };
  return(
    <div>
      <p style={{color:"var(--tx2)",fontSize:13,marginBottom:14}}>
        Your balances before the first recorded GCash transaction. Current balances are these starting amounts plus all GCash transactions.
      </p>
      <div className="fg"><label>Starting Cash on Hand</label>
        <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={cash}
          onChange={e=>setCash(e.target.value)} onKeyDown={blockNumKeys} autoFocus/>
      </div>
      <div className="fg"><label>Starting GCash Wallet Balance</label>
        <input type="number" inputMode="decimal" min="0" step="0.01" placeholder="0.00" value={gc}
          onChange={e=>setGc(e.target.value)} onKeyDown={blockNumKeys}/>
      </div>
      <div style={{display:"flex",gap:10,marginTop:6}}>
        <button className="btn bg2" style={{flex:1}} onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn bp" style={{flex:1}} onClick={submit} disabled={busy}><FontAwesomeIcon icon={faFloppyDisk} /> Save</button>
      </div>
    </div>
  );
}

function GCash({db,saveData,setConfirm}){
  const [newModal,setNewModal]=useState(false);
  const [balModal,setBalModal]=useState(false);
  const [detail,setDetail]=useState(null);
  const [limit,setLimit]=useState(50);

  const txns=useMemo(()=>sortNewest(asArr(db.gcashTransactions)),[db.gcashTransactions]);
  const bal=useMemo(()=>gcashBalances(db),[db.gcashTransactions,db.gcashConfig]);
  const cfgSet=!!db.gcashConfig;
  const rates=useMemo(()=>getRates(db),[db.gcashRates]);
  const [rateModal,setRateModal]=useState(false);

  const saveRates=async list=>{
    try{
      const d=getLS();
      d.gcashRates=list;
      await saveData(d);
      setRateModal(false);toast("Rate guide saved!");okBeep();
    }catch{toast("Could not save rates!","err");}
  };

  const saveTxn=async t=>{
    try{
      const d=getLS();
      d.gcashTransactions=[t,...asArr(d.gcashTransactions)];
      await saveData(d);
      setNewModal(false);toast("GCash transaction saved!");okBeep();
      return true;
    }catch{toast("Could not save transaction!","err");return false;}
  };

  const saveBal=async(c,g)=>{
    try{
      const d=getLS();
      d.gcashConfig={initialCash:c,initialGcash:g};
      await saveData(d);
      setBalModal(false);toast("Starting balances saved!");
    }catch{toast("Could not save balances!","err");}
  };

  const askDelete=t=>{
    setDetail(null);
    setTimeout(()=>setConfirm({
      title:"Delete Transaction",
      msg:`Delete this ${t.type==="cashin"?"Cash In":"Cash Out"} of ${fmt(t.amount)}?\nBalances and profit will be recalculated.`,
      icon:<FontAwesomeIcon icon={faTrashCan} />,danger:true,confirmText:"Delete",
      onConfirm:async()=>{
        const d=getLS();
        d.gcashTransactions=asArr(d.gcashTransactions).filter(x=>x.id!==t.id);
        await saveData(d);toast("Transaction deleted.");
      }
    }),60);
  };

  const dEff=detail?gcashEffect(detail.type,detail.amount,detail.fee,detail.feeVia):null;

  return(
    <div style={{display:"contents"}}>
      {newModal&&(
        <div className="backdrop">
          <div className="msheet tx-sheet" style={{maxWidth:440,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:18,fontSize:16}}><FontAwesomeIcon icon={faWallet} /> New GCash Transaction</h3>
            <GCashForm balances={bal} rates={rates} onSave={saveTxn} onClose={()=>setNewModal(false)}/>
          </div>
        </div>
      )}
      {balModal&&(
        <div className="backdrop">
          <div className="msheet" style={{maxWidth:400,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:12,fontSize:16}}>Starting Balances</h3>
            <GCashBalForm init={db.gcashConfig||{}} onSave={saveBal} onClose={()=>setBalModal(false)}/>
          </div>
        </div>
      )}
      {rateModal&&(
        <div className="backdrop">
          <div className="msheet mlg" style={{alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:12,fontSize:16}}><FontAwesomeIcon icon={faFileLines} /> Edit Rate Charge Guide</h3>
            <GCashRateEditor rates={rates} onSave={saveRates} onClose={()=>setRateModal(false)}/>
          </div>
        </div>
      )}
      {detail&&dEff&&(
        <TxnDetail
          title="Transaction Details"
          badge={<span className={`badge ${detail.type==="cashin"?"bg-g":"bg-b"}`}>{detail.type==="cashin"?"Cash In":"Cash Out"}</span>}
          rows={[
            ["Date / Time",fmtDT(detail.date)],
            ["Amount",fmt(detail.amount)],
            ["Service Fee",fmt(detail.fee)],
            ["Fee Paid Via",detail.feeVia==="gcash"?"GCash":"Cash"],
            ["Customer",detail.customer||"—"],
            ["Reference No.",detail.ref||"—"],
          ]}
          effects={[
            ["Cash on Hand",fmtSgn(dEff.cash),dEff.cash<0?"var(--dn)":"var(--ac)"],
            ["GCash Wallet",fmtSgn(dEff.gcash),dEff.gcash<0?"var(--dn)":"var(--ac)"],
            ["Profit",fmtSgn(dEff.profit),"var(--ac)"],
          ]}
          onClose={()=>setDetail(null)} onDelete={()=>askDelete(detail)}/>
      )}

      <div className="pg-page">
        <div className="pg-hdr" style={{padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:10,color:"var(--tx3)",fontWeight:500,lineHeight:1.2}}>Today's Profit</div>
            <div style={{fontSize:15,fontWeight:800,color:"var(--ac)",lineHeight:1.2}}>{fmt(bal.todayProfit)}</div>
          </div>
          <button className="btn bp bsm" style={{flexShrink:0,minHeight:34,padding:"0 14px",fontSize:13}} onClick={()=>setNewModal(true)}>+ New Transaction</button>
        </div>
        <div className="pg-body">
          <div className="gx-wrap">
            {!cfgSet&&(
              <div className="gx-bleed">
                <div className="gx-banner" style={{background:"var(--inl)",border:"1.5px solid var(--in)",borderRadius:"var(--rs)",padding:"8px 14px",marginBottom:10,fontSize:12,lineHeight:1.3,color:"var(--in)",
                  display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                  <span style={{flex:1,minWidth:0}}>Set your starting Cash on Hand and GCash balance first.</span>
                  <button className="btn bg2 bsm" style={{flexShrink:0,whiteSpace:"nowrap"}} onClick={()=>setBalModal(true)}>Set Balances</button>
                </div>
              </div>
            )}

            <div className="rpt-stats gx-stats">
              <StatCard icon={faHandHoldingDollar} label="Cash on Hand" value={fmtS(bal.cash)} color="var(--ac)"/>
              <StatCard icon={faWallet} label="GCash Wallet Balance" value={fmtS(bal.gcash)} color="var(--in)"/>
              <StatCard icon={faSquarePlus} label="Total (Cash + GCash)" value={fmtS(bal.total)} color="#8e44ad"/>
              <StatCard icon={faChartLine} label="Total Profit" value={fmt(bal.profit)} color="var(--wn)" sub={`Today: ${fmt(bal.todayProfit)}`}/>
            </div>

            <div className="gx-bleed">
              <GCashRateGuide rates={rates} onEdit={()=>setRateModal(true)}/>
            </div>

            <div className="gx-pad" style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
              <h3 style={{fontWeight:700,fontSize:15}}>Transaction History</h3>
              <span style={{fontSize:12,color:"var(--tx3)"}}>{txns.length} total</span>
            </div>

            <div className="gx-list">
              {txns.length===0&&(
                <div className="gx-pad" style={{padding:"28px 16px",textAlign:"center",color:"var(--tx3)",fontSize:14}}>No GCash transactions yet.</div>
              )}
              {txns.slice(0,limit).map(t=>(
                <div key={t.id} className="gx-row" role="button" tabIndex={0}
                  onClick={()=>setDetail(t)} onKeyDown={e=>{if(e.key==="Enter")setDetail(t);}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flexWrap:"wrap"}}>
                      <span className={`badge ${t.type==="cashin"?"bg-g":"bg-b"}`}>{t.type==="cashin"?"Cash In":"Cash Out"}</span>
                      <span style={{fontSize:12,color:"var(--tx2)"}}>{fmtDT(t.date)}</span>
                    </div>
                    <div style={{fontWeight:800,fontSize:15,flexShrink:0}}>{fmt(t.amount)}</div>
                  </div>
                  <div className="gx-meta" style={{marginTop:6}}>
                    <span>Fee {fmt(t.fee)} via {t.feeVia==="gcash"?"GCash":"Cash"}</span>
                    <span style={{color:"var(--ac)",fontWeight:600}}>Profit {fmt(t.fee)}</span>
                    {t.customer&&<span>Customer: {t.customer}</span>}
                    {t.ref&&<span>Ref: {t.ref}</span>}
                  </div>
                </div>
              ))}
            </div>
            {txns.length>limit&&(
              <div className="gx-pad" style={{marginTop:12}}>
                <button className="btn bg2" style={{width:"100%"}} onClick={()=>setLimit(l=>l+50)}>Show more</button>
              </div>
            )}
          </div>
          <div className="pg-spacer"/>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   E-LOAD PAGE
═══════════════════════════════════════════ */
const ELOAD_NETWORKS=["Smart","TNT","Globe","TM","DITO","Other"];

function ELoadForm({onSave,onClose}){
  const [f,setF]=useState({network:"Smart",mobile:"",amount:"",fee:"",feeVia:"cash",customer:"",ref:""});
  const [busy,setBusy]=useState(false);
  const [more,setMore]=useState(false);
  const lock=useRef(false);
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const amt=parseMoney(f.amount);
  const fee=f.fee===""?0:parseMoney(f.fee);
  const mobileOk=/^09\d{9}$/.test(f.mobile);

  const submit=async()=>{
    if(lock.current)return;
    if(!mobileOk){toast("Enter a valid 11-digit mobile number (09XXXXXXXXX)!","err");errBeep();return;}
    if(!Number.isFinite(amt)||amt<=0){toast("Enter a load amount greater than 0!","err");errBeep();return;}
    if(!Number.isFinite(fee)||fee<0){toast("Service fee cannot be negative!","err");errBeep();return;}
    if(amt>MAX_AMT||fee>MAX_AMT){toast("Amount is too large!","err");errBeep();return;}
    lock.current=true;setBusy(true);
    const ok=await onSave({
      id:uid(),network:f.network,mobile:f.mobile,amount:r2(amt),fee:r2(fee),feeVia:f.feeVia,
      customer:sanitize(f.customer.trim()).slice(0,100),
      ref:sanitize(f.ref.trim()).slice(0,50),
      date:new Date().toISOString()
    });
    if(!ok){lock.current=false;setBusy(false);}
  };

  return(
    <div>
      <div className="fg"><label>Network</label>
        <PillSeg label="Network" cols={3} value={f.network} onChange={v=>s("network",v)} options={ELOAD_NETWORKS.map(n=>({v:n,l:n}))}/>
      </div>
      <div className="fg"><label>Customer mobile number</label>
        <input placeholder="09XXXXXXXXX" inputMode="numeric" value={f.mobile} maxLength={11}
          onChange={e=>s("mobile",e.target.value.replace(/[^0-9]/g,"").slice(0,11))} autoFocus/>
        {f.mobile.length>0&&!mobileOk&&(
          <div style={{fontSize:12,color:"var(--dn)",marginTop:5}}>Must be 11 digits starting with 09.</div>
        )}
      </div>
      <div className="fg"><label>Load amount</label>
        <MoneyField large placeholder="0.00" value={f.amount} onChange={e=>s("amount",e.target.value)}/>
      </div>
      <div className="frow">
        <div className="fg"><label>Service fee / profit</label>
          <MoneyField placeholder="0.00" value={f.fee} onChange={e=>s("fee",e.target.value)}/>
        </div>
        <div className="fg"><label>Fee paid via</label>
          <PillSeg label="Fee paid via" value={f.feeVia} onChange={v=>s("feeVia",v)}
            options={[{v:"cash",l:"Cash"},{v:"gcash",l:"GCash"}]}/>
        </div>
      </div>

      <TxMoreFields f={f} s={s} open={more} setOpen={setMore} refPlaceholder="Ref no."/>

      <div className="tx-actions">
        <button className="btn bg2" onClick={onClose} disabled={busy}>Cancel</button>
        <button className="btn bp" onClick={submit} disabled={busy}>
          <FontAwesomeIcon icon={faFloppyDisk} /> {busy?"Saving…":"Save"}
        </button>
      </div>
    </div>
  );
}

function ELoad({db,saveData,setConfirm}){
  const [newModal,setNewModal]=useState(false);
  const [detail,setDetail]=useState(null);
  const [limit,setLimit]=useState(50);

  const txns=useMemo(()=>sortNewest(asArr(db.eloadTransactions)),[db.eloadTransactions]);
  const totals=useMemo(()=>{
    let sales=0,profit=0,tSales=0,tProfit=0;
    txns.forEach(t=>{
      sales+=Number(t.amount)||0;profit+=Number(t.fee)||0;
      if(isToday(t.date)){tSales+=Number(t.amount)||0;tProfit+=Number(t.fee)||0;}
    });
    return{sales:r2(sales),profit:r2(profit),tSales:r2(tSales),tProfit:r2(tProfit)};
  },[txns]);

  const saveTxn=async t=>{
    try{
      const d=getLS();
      d.eloadTransactions=[t,...asArr(d.eloadTransactions)];
      await saveData(d);
      setNewModal(false);toast("E-Load transaction saved!");okBeep();
      return true;
    }catch{toast("Could not save transaction!","err");return false;}
  };

  const askDelete=t=>{
    setDetail(null);
    setTimeout(()=>setConfirm({
      title:"Delete Transaction",
      msg:`Delete this ${t.network} load of ${fmt(t.amount)} to ${t.mobile}?\nTotals will be recalculated.`,
      icon:<FontAwesomeIcon icon={faTrashCan} />,danger:true,confirmText:"Delete",
      onConfirm:async()=>{
        const d=getLS();
        d.eloadTransactions=asArr(d.eloadTransactions).filter(x=>x.id!==t.id);
        await saveData(d);toast("Transaction deleted.");
      }
    }),60);
  };

  return(
    <div style={{display:"contents"}}>
      {newModal&&(
        <div className="backdrop">
          <div className="msheet tx-sheet" style={{maxWidth:440,alignSelf:"center",borderRadius:"var(--r)"}}>
            <div className="shandle"/>
            <h3 style={{fontWeight:700,marginBottom:18,fontSize:16}}><FontAwesomeIcon icon={faMobileScreenButton} /> New E-Load Transaction</h3>
            <ELoadForm onSave={saveTxn} onClose={()=>setNewModal(false)}/>
          </div>
        </div>
      )}
      {detail&&(
        <TxnDetail
          title="Transaction Details"
          badge={<span className="badge bg-b">{detail.network}</span>}
          rows={[
            ["Date / Time",fmtDT(detail.date)],
            ["Network",detail.network],
            ["Mobile Number",detail.mobile],
            ["Load Amount",fmt(detail.amount)],
            ["Service Fee / Profit",fmt(detail.fee)],
            ["Fee Paid Via",detail.feeVia==="gcash"?"GCash":"Cash"],
            ["Customer",detail.customer||"—"],
            ["Reference No.",detail.ref||"—"],
          ]}
          onClose={()=>setDetail(null)} onDelete={()=>askDelete(detail)}/>
      )}

      <div className="pg-page">
        <div className="pg-hdr" style={{padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{minWidth:0}}>
            <div style={{fontSize:10,color:"var(--tx3)",fontWeight:500,lineHeight:1.2}}>Today's Profit</div>
            <div style={{fontSize:15,fontWeight:800,color:"var(--ac)",lineHeight:1.2}}>{fmt(totals.tProfit)}</div>
          </div>
          <button className="btn bp bsm" style={{flexShrink:0,minHeight:34,padding:"0 14px",fontSize:13}} onClick={()=>setNewModal(true)}>+ New Transaction</button>
        </div>
        <div className="pg-body">
          <div className="gx-wrap">
            <div className="rpt-stats gx-stats">
              <StatCard label="Total Load / Sales" value={fmt(totals.sales)} color="var(--in)" sub={`Today: ${fmt(totals.tSales)}`}/>
              <StatCard label="Total Profit" value={fmt(totals.profit)} color="var(--ac)" sub={`Today: ${fmt(totals.tProfit)}`}/>
            </div>

            <div className="gx-pad" style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
              <h3 style={{fontWeight:700,fontSize:15}}>Transaction History</h3>
              <span style={{fontSize:12,color:"var(--tx3)"}}>{txns.length} total</span>
            </div>

            <div className="gx-list">
              {txns.length===0&&(
                <div className="gx-pad" style={{padding:"28px 16px",textAlign:"center",color:"var(--tx3)",fontSize:14}}>No E-Load transactions yet.</div>
              )}
              {txns.slice(0,limit).map(t=>(
                <div key={t.id} className="gx-row" role="button" tabIndex={0}
                  onClick={()=>setDetail(t)} onKeyDown={e=>{if(e.key==="Enter")setDetail(t);}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flexWrap:"wrap"}}>
                      <span className="badge bg-b">{t.network}</span>
                      <span style={{fontSize:13,fontWeight:600}}>{t.mobile}</span>
                    </div>
                    <div style={{fontWeight:800,fontSize:15,flexShrink:0}}>{fmt(t.amount)}</div>
                  </div>
                  <div className="gx-meta" style={{marginTop:6}}>
                    <span>{fmtDT(t.date)}</span>
                    <span>Fee {fmt(t.fee)} via {t.feeVia==="gcash"?"GCash":"Cash"}</span>
                    <span style={{color:"var(--ac)",fontWeight:600}}>Profit {fmt(t.fee)}</span>
                    {t.customer&&<span>Customer: {t.customer}</span>}
                    {t.ref&&<span>Ref: {t.ref}</span>}
                  </div>
                </div>
              ))}
            </div>
            {txns.length>limit&&(
              <div className="gx-pad" style={{marginTop:12}}>
                <button className="btn bg2" style={{width:"100%"}} onClick={()=>setLimit(l=>l+50)}>Show more</button>
              </div>
            )}
          </div>
          <div className="pg-spacer"/>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HELP & SUPPORT  (the Help tab under Profile)
   No backend: requests open the user's email app with a
   pre-filled message addressed to the developer.
═══════════════════════════════════════════ */
const DEV_EMAIL="jayveepradia07@gmail.com";
const DEV_FB="https://www.facebook.com/jjaayyvvee";

const buildMailto=(kind,storeName,subject,message)=>{
  const tag=kind==="feature"?"Feature Request":"Issue Report";
  const lines=[message.trim(),"","— — —",`Store: ${storeName||"—"}`];
  if(kind==="issue"){
    lines.push(`Device: ${(navigator.userAgent||"").slice(0,160)}`);
    lines.push(`Screen: ${window.innerWidth}x${window.innerHeight}`);
    lines.push(`Sent: ${new Date().toLocaleString("en-PH")}`);
  }
  return `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(`[${tag}] ${subject.trim()}`)}&body=${encodeURIComponent(lines.join("\n"))}`;
};

function HelpForm({kind,storeName,subjectPh,messageLabel,messagePh,note,onDone}){
  const [subject,setSubject]=useState("");
  const [message,setMessage]=useState("");
  const send=()=>{
    if(!subject.trim()){toast("Please enter a subject!","err");errBeep();return;}
    if(message.trim().length<5){toast("Please describe it in a few words!","err");errBeep();return;}
    window.location.href=buildMailto(kind,storeName,subject,message);
    toast("Opening your email app…");
    onDone();
  };
  return(
    <div style={{paddingBottom:14}}>
      <div className="fg" style={{marginBottom:10}}>
        <input aria-label="Subject" placeholder={`Subject… ${subjectPh}`} value={subject} maxLength={100} onChange={e=>setSubject(e.target.value)} autoFocus/>
      </div>
      <div className="fg" style={{marginBottom:10}}>
        <textarea aria-label={messageLabel} rows={3} style={{resize:"vertical",minHeight:84}}
          placeholder={`${messageLabel} ${messagePh}`} value={message} maxLength={1500} onChange={e=>setMessage(e.target.value)}/>
      </div>
      {note&&<div style={{fontSize:11,color:"var(--tx3)",marginBottom:10}}>{note}</div>}
      <button className="btn bp" style={{width:"100%"}} onClick={send}><FontAwesomeIcon icon={faPaperPlane} /> Send</button>
    </div>
  );
}

function HelpSupport({storeName}){
  const [open,setOpen]=useState(null);
  const copyEmail=async()=>{
    try{await navigator.clipboard.writeText(DEV_EMAIL);toast("Email address copied!");}
    catch{toast(DEV_EMAIL);}
  };
  const rowBtn={display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,width:"100%",minHeight:48,
    background:"none",border:"none",borderTop:"1px solid var(--bd)",padding:"0",cursor:"pointer",
    fontFamily:"inherit",fontSize:14,fontWeight:600,color:"var(--tx)",textAlign:"left"};
  const items=[
    {id:"feature",icon:faLightbulb,title:"Request a Feature",subjectPh:"e.g. barcode scanning",messageLabel:"What would you like to add?",messagePh:"Tell us what you need…"},
    {id:"issue",icon:faTriangleExclamation,title:"Report an Issue",subjectPh:"e.g. can't add a product",messageLabel:"What's the issue?",messagePh:"Describe what happened…",
      note:"Store name and basic device info are included to help us find the problem."},
  ];
  return(
    <div className="card" style={{padding:"18px 22px 4px"}}>
      <h3 style={{fontWeight:700,marginBottom:12,fontSize:15}}><FontAwesomeIcon icon={faCircleQuestion} /> Help &amp; Support</h3>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,paddingBottom:12,flexWrap:"wrap"}}>
        <div style={{minWidth:0,fontSize:13}}>
          <div style={{fontWeight:600}}><FontAwesomeIcon icon={faEnvelope} /> Email</div>
          <div style={{color:"var(--tx2)",fontSize:12,overflowWrap:"anywhere"}}>{DEV_EMAIL}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn bg2 bsm" onClick={copyEmail}>Copy</button>
          <a className="btn bp bsm" href={`mailto:${DEV_EMAIL}`}>Email</a>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"12px 0",borderTop:"1px solid var(--bd)"}}>
        <div style={{fontSize:13,fontWeight:600}}>Message us on Facebook</div>
        <a className="btn bp bsm" href={DEV_FB} target="_blank" rel="noopener noreferrer">Open</a>
      </div>

      {items.map(it=>(
        <div key={it.id}>
          <button type="button" style={rowBtn} aria-expanded={open===it.id} onClick={()=>setOpen(open===it.id?null:it.id)}>
            <span><FontAwesomeIcon icon={it.icon} /> {it.title}</span>
            <span style={{color:"var(--tx3)",fontSize:18,lineHeight:1}}>{open===it.id?"−":"+"}</span>
          </button>
          {open===it.id&&(
            <HelpForm kind={it.id} storeName={storeName} subjectPh={it.subjectPh} messageLabel={it.messageLabel}
              messagePh={it.messagePh} note={it.note} onDone={()=>setOpen(null)}/>
          )}
        </div>
      ))}
    </div>
  );
}