import React, { useState, useEffect, useRef } from "react";

// rockfello_game — OS téléphone (V.01 monochrome arrondi).
// Démarrage à zéro · négociation au slider (le courtier décide) · boutique d'apps ·
// crédits (achat simulé) · ChatRock (IA interne payante).

const C={ink:"#000",paper:"#FFF",g50:"#FAFAFA",g100:"#F2F2F2",g150:"#EAEAEA",g200:"#DEDEDE",g300:"#CFCFCF",g400:"#8A8A8A",g700:"#2A2A2A"};
const R={lg:26,md:20,sm:14,pill:100};
const SH={soft:"0 2px 10px rgba(0,0,0,.06)",med:"0 8px 28px rgba(0,0,0,.12)"};
const FONT="@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');";
const RANGE="input.grad{-webkit-appearance:none;appearance:none;width:100%;height:16px;border-radius:100px;background:linear-gradient(90deg,#000,#fff);border:1px solid #000;outline:none}input.grad::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:28px;height:28px;border-radius:50%;background:#000;border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);cursor:pointer}input.grad::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#000;border:4px solid #fff;cursor:pointer}";
const MONO="'JetBrains Mono', monospace";

const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
const pick=(a)=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
let UID=1, POPN=101;

const CITY={ "Montréal":{x:50,y:50},"Longueuil":{x:55,y:54},"Sainte-Thérèse":{x:47,y:41},"Saint-Jérôme":{x:43,y:35},"Saint-Donat":{x:39,y:25},"Joliette":{x:55,y:37},"Trois-Rivières":{x:66,y:35},"Shawinigan":{x:64,y:27},"Québec":{x:81,y:27},"Val-des-Sources":{x:70,y:51},"Sherbrooke":{x:73,y:60},"Drummondville":{x:64,y:47},"Campbell's Bay":{x:17,y:33},"Gatineau":{x:21,y:42} };
const VILLES=Object.keys(CITY);
const BIENS=["8-plex","triplex délabré","RPA 22 unités","duplex + commercial","12 portes","terrain zoné mixte"];
const TYPES=["saisie judiciaire","vente pour taxes","faillite","rachat de créance","préavis d'exercice"];
const VENDEURS=["Faust — vendeur direct","Lemieux — syndic","Garceau — vendeur"];
const BANQUES=["Crédit Boréal","Distinction Capital","Harvey — prêteur privé"];
const COURTIERS=["Courtier — Tremblay","Courtier — Bélanger","Courtier — Roy"];
const FPREF=["Château","Manoir","Domaine","Villa","Le Castel","Résidence","Le Clos","Tour"];
const FSUF=["Lafortune","Lafortune","du Créancier","Tassé","Beauséjour","des Saisies","de la Créance","Côté","Goliath","Saint-Réal"];
const fancy=()=>`${pick(FPREF)} ${pick(FSUF)}`;

const POOL={
  offre:[{ch:"sms",t:"Acompte demandé pour bloquer le dossier.",cs:[{l:"Verser l'acompte, on bloque.",fx:{confiance:6,risque:-2}},{l:"Négocier l'acompte plus bas.",fx:{confiance:-5,marge:8}}]},
    {ch:"sms",t:"Un autre acheteur tourne autour. Faut bouger vite.",cs:[{l:"Surenchérir pour l'écarter.",fx:{marge:-12,confiance:5}},{l:"Garder mon prix, déposer l'offre.",fx:{risque:7}}]}],
  finance:[{ch:"mail",subj:"Pré-approbation — financement bridge",t:"Bridge approuvé à 11 %. On signe les conditions ?",cs:[{l:"Prendre le bridge.",fx:{risque:-5}},{l:"Chercher un meilleur taux (plus lent).",fx:{marge:7,risque:8}}]},
    {ch:"mail",subj:"Conditions de prêt — co-emprunteur requis",t:"Un co-emprunteur est exigé pour boucler le montage.",cs:[{l:"Ajouter Maxime, partager la marge.",fx:{marge:-12,confiance:10,risque:-4}},{l:"Y aller seul, garder 100 %.",fx:{risque:9}}]}],
  verif:[{ch:"mail",subj:"Vérification diligente — arrérages de taxes",t:"Taxes impayées importantes, titre clair sinon.",cs:[{l:"Exiger que le vendeur règle.",fx:{confiance:-4,marge:6}},{l:"Absorber et ajuster l'offre.",fx:{marge:-10,risque:-3}}]},
    {ch:"mail",subj:"Préavis d'exercice — le délai court",t:"La prise en paiement approche. Le temps presse.",cs:[{l:"Payer le rush du notaire.",fx:{marge:-6,risque:-8}},{l:"Garder le rythme, prendre le risque.",fx:{risque:13}}]}],
  acheteur:[{ch:"sms",t:"Je te l'achète : prime nette tout de suite.",cs:[{l:"Flipper la promesse, encaisser.",terminal:"flip"},{l:"Refuser, garder l'immeuble.",fx:{confiance:4},terminal:"close"}]}],
};
const DOCS=[
  {titre:"État des baux",fx:{marge:-5,risque:-3},find:"Bail commercial sous le marché jusqu'en 2028. Tu ajustes ta valeur."},
  {titre:"Rapport d'inspection",fx:{risque:-7,marge:-4},find:"Toiture en fin de vie. Repéré avant signature : tu négocies une réduction."},
  {titre:"Jugement — prise en paiement",fx:{risque:-6},find:"Le délai du préavis est plus long que prévu. Moins de pression."},
  {titre:"Relevé de taxes",fx:{marge:-6,risque:-3},find:"Arrérages confirmés. Tu les fais porter au vendeur."},
];
const ACC={A100:"Banque / Fiducie",P221:"Escompte créance",R005:"Intérêts",R006:"Frais de dossier",D010:"Frais juridiques",D020:"Travaux / réno",D030:"Assurances"};
const STORE=[
  {key:"mail",lab:"RockMail",g:"✉",k:25,c:2,desc:"Boîte courriel dédiée pour le financement et la vérification."},
  {key:"docs",lab:"Dossiers",g:"▤",k:35,c:3,desc:"Analyse de documents pour dé-risquer tes deals."},
  {key:"carte",lab:"Carte",g:"◎",k:40,c:3,desc:"Visualise tes dossiers sur la carte du Québec."},
  {key:"instarock",lab:"InstaRock",g:"❒",k:20,c:2,desc:"Le feed du milieu. Poste tes closings, monte ta notoriété."},
  {key:"quickrock",lab:"QuickRock",g:"$",k:60,c:4,desc:"Comptabilité : grand livre et P&L en temps réel."},
  {key:"chatrock",lab:"ChatRock",g:"◆",k:45,c:3,desc:"IA interne. Conseils de deal et lecture du courtier."},
];
const PACKS=[{c:10,p:"1,99 $"},{c:30,p:"4,99 $"},{c:80,p:"9,99 $"}];
const FIN=[{k:"Bridge",rate:11,riskFx:2},{k:"Prêt privé",rate:14,riskFx:1},{k:"Hypothèque",rate:6,riskFx:0},{k:"Marge",rate:9,riskFx:1}];

function genListing(noto){
  const tier=noto/100;
  const valeur=rnd(380,620)+Math.round(tier*900);
  const prix=Math.round(valeur*(0.5+Math.random()*0.18));
  return {id:UID++,pop:`POP-${POPN++}`,fancy:fancy(),type:pick(TYPES),ville:pick(VILLES),bien:pick(BIENS),valeur,prix,courtier:pick(COURTIERS)};
}
function makeProject(l,prix,struct){
  const mise=struct?struct.mise:Math.round(prix*0.3);
  const beats=[{...pick(POOL.offre),role:pick(VENDEURS)},{...pick(POOL.finance),role:pick(BANQUES)},{...pick(POOL.verif),role:"Me Lavoie — notaire"},{...pick(POOL.acheteur),role:"Acheteur — inconnu"}];
  const p={id:l.id,pop:l.pop,fancy:l.fancy,nom:`${l.pop} · ${l.ville}`,ville:l.ville,bien:l.bien,type:l.type,valeur:l.valeur,prix,mise,
    fin:struct?{bal:struct.bal,fin:struct.fin,type:struct.finType,rate:struct.rate}:null,
    marge:struct?struct.margeNet:clamp(Math.round((l.valeur-prix)*0.4),18,180),
    risque:struct?clamp(rnd(8,15)+Math.round(struct.lev*22)+struct.riskFx,5,55):rnd(8,18),
    confiance:rnd(45,62),beats,beat:0,feed:[],choices:null,ch:beats[0].ch,status:"active",result:null,pendingSince:Date.now(),nags:0};
  pushBeat(p,0); return p;
}
function pushBeat(p,i){const b=p.beats[i];p.feed.push({side:"in",from:b.role,ch:b.ch,subj:b.subj,t:b.t});p.choices=b.cs;p.ch=b.ch;p.pendingSince=Date.now();p.nags=0;}
function genDoc(p){const d=pick(DOCS);return {id:UID++,titre:d.titre,fx:d.fx,find:d.find,projetId:p.id,nom:p.nom,analyzed:false};}
function ecriture(p){const m=p.result.profit;let c;if(p.result.status==="RATÉ")c="D010";else if(p.type==="rachat de créance")c="P221";else c=p.result.status==="FLIP"?"R006":"R005";return {id:UID++,compte:c,lib:`${p.pop} · ${p.ville}`,montant:m};}
const brokerThreshold=(asking,noto)=>Math.round(asking*(0.9-Math.min(noto,100)*0.0018));

function mulberry(s){return function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function Photo({p,h=120,round=R.sm}){
  const r=mulberry(p.id*97+13), W=200,Hh=120;
  const terrain=p.bien.includes("terrain");
  const floors=p.bien.includes("RPA")||p.bien.includes("12")||p.bien.includes("8-plex")?4:p.bien.includes("triplex")?3:2;
  const cols=floors>=4?4:3, bw=110+Math.round(r()*30),bx=(W-bw)/2,bh=18+floors*18,by=Hh-22-bh,ww=(bw-16)/cols-8;
  const win=[];for(let f=0;f<floors;f++)for(let c=0;c<cols;c++)win.push({f,c,lit:r()>0.45});
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} width="100%" height={h} style={{display:"block",borderRadius:round,background:C.g100}}>
      <rect x="0" y="0" width={W} height={Hh} fill={C.g100}/><rect x="0" y={Hh-22} width={W} height="22" fill={C.g200}/>
      {[...Array(10)].map((_,i)=><line key={i} x1={i*22} y1={Hh-22} x2={i*22-10} y2={Hh} stroke={C.g300} strokeWidth="1"/>)}
      {terrain?(<><rect x="30" y={Hh-60} width="140" height="38" fill="none" stroke={C.ink} strokeWidth="2" strokeDasharray="6 5"/><circle cx="60" cy={Hh-46} r="12" fill={C.g700}/><rect x="58" y={Hh-36} width="4" height="14" fill={C.g700}/><rect x="120" y={Hh-50} width="34" height="22" fill={C.paper} stroke={C.ink} strokeWidth="2"/><text x="137" y={Hh-36} fontFamily="monospace" fontSize="8" textAnchor="middle">TERRAIN</text></>)
      :(<><rect x={bx} y={by} width={bw} height={bh} fill={C.paper} stroke={C.ink} strokeWidth="2"/><polygon points={`${bx-6},${by} ${bx+bw+6},${by} ${bx+bw-8},${by-12} ${bx+8},${by-12}`} fill={C.ink}/>
        {win.map((w,i)=><rect key={i} x={bx+8+w.c*(ww+8)} y={by+8+w.f*((bh-16)/floors)} width={ww} height="10" fill={w.lit?C.ink:C.paper} stroke={C.g400} strokeWidth="1"/>)}
        <rect x={bx+bw/2-9} y={Hh-40} width="18" height="18" fill={C.ink}/>{p.bien.includes("commercial")&&<rect x={bx+6} y={Hh-38} width="26" height="16" fill={C.g700}/>}</>)}
      <rect x="8" y="10" width="56" height="20" fill={C.ink}/><text x="36" y="24" fontFamily="monospace" fontSize="9" textAnchor="middle" fill={C.paper}>À VENDRE</text>
    </svg>
  );
}

export default function RockfelloGame(){
  const [view,setView]=useState({app:"home"});
  const [capital,setCapital]=useState(140);
  const [credits,setCredits]=useState(3);
  const [noto,setNoto]=useState(5);
  const [closed,setClosed]=useState(0);
  const [projets,setProjets]=useState([]);
  const [docs,setDocs]=useState([]);
  const [ledger,setLedger]=useState([]);
  const [listings,setListings]=useState(()=>[genListing(5)]);
  const [unlocked,setUnlocked]=useState({});
  const [notifs,setNotifs]=useState([]);
  const [igLiked,setIgLiked]=useState(false);
  const [draft,setDraft]=useState(""); const [corrected,setCorrected]=useState(null);
  const [selCity,setSelCity]=useState(null);
  const [offerPrice,setOfferPrice]=useState(0); const [nego,setNego]=useState(null); const [chatHint,setChatHint]=useState(null);
  const [chatLog,setChatLog]=useState([]);
  const [misePct,setMisePct]=useState(30); const [balPct,setBalPct]=useState(0); const [finType,setFinType]=useState("Bridge");
  const [sellOpen,setSellOpen]=useState(false);

  const closedRef=useRef(0); closedRef.current=closed;
  const notoRef=useRef(noto); notoRef.current=noto;

  const active=projets.filter(p=>p.status==="active");
  const smsPending=active.filter(p=>p.choices&&p.ch==="sms").length;
  const mailPending=active.filter(p=>p.choices&&p.ch==="mail").length;
  const docsPending=docs.filter(d=>!d.analyzed&&active.some(p=>p.id===d.projetId)).length;
  const CORE=new Set(["home","rocktris","messages","deals","store","offer","thread","deed","mailItem","mailSys"]);
  const isUnlocked=(a)=>CORE.has(a)||unlocked[a];

  const go=(app,x={})=>{ if(!isUnlocked(app)){setView({app:"store"});notify("Débloque cette app dans la Boutique.","warn");return;} setView({app,...x}); };
  const notify=(t,kind="info")=>{const id=UID++;setNotifs(n=>[...n,{id,t,kind}]);setTimeout(()=>setNotifs(n=>n.filter(x=>x.id!==id)),3400);};

  useEffect(()=>{setDraft("");setCorrected(null);setSellOpen(false);},[view.pid,view.app]);
  useEffect(()=>{ if(view.app==="offer"){const l=listings.find(x=>x.id===view.lid);if(l){setOfferPrice(l.prix);setNego(null);setChatHint(null);setMisePct(30);setBalPct(0);setFinType("Bridge");}} },[view.app,view.lid]);// eslint-disable-line

  const ref=useRef(projets); ref.current=projets;
  useEffect(()=>{
    const iv=setInterval(()=>{
      const now=Date.now();let worst=null,wa=0;
      ref.current.forEach(p=>{if(p.status==="active"&&p.choices&&(p.nags||0)<2){const age=now-(p.pendingSince||now);if(age>14000&&age>wa){worst=p;wa=age;}}});
      if(worst){setProjets(prev=>prev.map(q=>q.id===worst.id?{...q,nags:(q.nags||0)+1,risque:Math.min(60,q.risque+3),pendingSince:Date.now()}:q));notify(`Relance · ${worst.nom} attend ta réponse`,"warn");}
    },5000);return ()=>clearInterval(iv);
  },[]);

  const refill=(arr)=>{const target=Math.min(1+closedRef.current,4);const a=[...arr];while(a.length<target)a.push(genListing(notoRef.current));return a;};

  const choose=(pid,c)=>{
    setProjets(prev=>prev.map(p=>{
      if(p.id!==pid) return p;
      const np={...p,feed:[...p.feed,{side:"out",t:c.l}],choices:null};
      if(c.fx) for(const k in c.fx) np[k]=(np[k]||0)+c.fx[k];
      if(c.terminal){resolve(np,c.terminal);return np;}
      const ni=np.beat+1; if(ni>=np.beats.length){resolve(np,"close");return np;}
      np.beat=ni;np.beats=p.beats;pushBeat(np,ni);
      if(np.ch==="mail"&&unlocked.mail) notify(`Nouveau courriel · ${np.feed[np.feed.length-1].subj}`,"mail");
      return np;
    }));
    setDraft("");setCorrected(null);
  };
  const resolve=(np,mode)=>{
    let returned,status,line;
    if(mode==="flip"){const prime=Math.round(np.mise*0.4+rnd(20,55));returned=np.mise+prime;status="FLIP";line="Promesse assignée. Profit encaissé.";}
    else{const roll=rnd(0,100);if(roll<np.risque){returned=Math.round(np.mise*(np.insured?0.85:0.5));status="RATÉ";line=np.insured?"Deal raté — l'assurance a couvert une partie de la perte.":"Le deal s'est effondré à la signature.";}
      else{const bonus=np.confiance>70?rnd(10,25):0;returned=np.mise+np.marge+bonus;status="CLOSÉ";line="Acte signé. Marge encaissée.";}}
    const profit=returned-np.mise;np.status="done";np.result={status,profit,line};
    setCapital(c=>Math.round(c+returned));
    if(profit>0){setClosed(n=>n+1);setNoto(n=>Math.min(100,n+rnd(4,9)));}else setNoto(n=>Math.max(0,n-rnd(5,11)));
    setLedger(L=>[ecriture(np),...L]);
    setListings(prev=>refill(prev));
    notify(`${status} · ${profit>=0?"+":"−"}${Math.abs(profit)} k$`,profit>=0?"win":"lose");
  };

  const sellDeal=(p,channel)=>{
    const base=p.valeur;
    const gross=channel==="courtier"?Math.round(base*0.97):Math.round(base*0.90);
    const feePct=channel==="courtier"?5:2;
    const fee=Math.round(gross*feePct/100);
    const owed=p.fin?(p.fin.fin+p.fin.bal):0;
    const returned=Math.max(0,gross-fee-owed);
    const profit=returned-p.mise;
    setProjets(prev=>prev.map(q=>q.id===p.id?{...q,status:"done",choices:null,result:{status:"VENDU",profit,line:`Vendu via ${channel==="courtier"?"courtier (commission 5%)":"Rockfello.com (frais 2%)"} · ${gross}k brut.`}}:q));
    setCapital(c=>Math.round(c+returned));
    if(profit>0){setClosed(n=>n+1);setNoto(n=>Math.min(100,n+rnd(3,7)));}
    setLedger(L=>[{id:UID++,compte:profit>=0?"R006":"D010",lib:`${p.pop} · vente`,montant:profit},...L]);
    setListings(prev=>refill(prev));setSellOpen(false);
    notify(`VENDU · ${profit>=0?"+":"−"}${Math.abs(profit)} k$`,profit>=0?"win":"lose");
    go("deals");
  };
  const doTravaux=(p)=>{
    if((p.travaux||0)>=3){notify("Travaux déjà maximisés.","warn");return;}
    const cost=Math.round(p.prix*0.08);
    if(cost>capital){notify("Capital insuffisant pour les travaux.","warn");return;}
    setCapital(c=>c-cost);
    setProjets(prev=>prev.map(q=>q.id===p.id?{...q,valeur:q.valeur+Math.round(cost*1.7),marge:q.marge+Math.round(cost*0.5),risque:Math.min(60,q.risque+3),travaux:(q.travaux||0)+1}:q));
    setLedger(L=>[{id:UID++,compte:"D020",lib:`${p.pop} · travaux`,montant:-cost},...L]);
    notify(`Travaux · valeur +${Math.round(cost*1.7)}k`,"win");
  };
  const doInsure=(p)=>{
    if(p.insured){notify("Déjà assuré.");return;}
    const prem=Math.max(3,Math.round(p.mise*0.15));
    if(prem>capital){notify("Capital insuffisant.","warn");return;}
    setCapital(c=>c-prem);
    setProjets(prev=>prev.map(q=>q.id===p.id?{...q,insured:true,risque:Math.max(2,q.risque-8)}:q));
    setLedger(L=>[{id:UID++,compte:"D030",lib:`${p.pop} · assurance`,montant:-prem},...L]);
    notify("Assuré · risque −8 · perte couverte si raté","info");
  };
  const submitOffer=(l)=>{
    const th=brokerThreshold(l.prix,noto);
    const bal=Math.round(l.prix*balPct/100);
    const eff=offerPrice - bal*0.4 + (misePct-30)*l.prix*0.003;
    if(eff>=th) setNego({status:"accept",price:offerPrice});
    else if(eff>=th*0.93) setNego({status:"counter",price:th});
    else setNego({status:"reject"});
  };
  const doAcquire=(l,price)=>{
    const cash=Math.round(price*misePct/100);
    const bal=Math.round(price*balPct/100);
    const fin=Math.max(0,price-cash-bal);
    const fm=FIN.find(f=>f.k===finType)||FIN[0];
    if(cash>capital){notify("Capital insuffisant pour la mise.","warn");return;}
    const margePot=clamp(Math.round((l.valeur-price)*0.4),0,200);
    const carry=Math.round(fin*fm.rate/100*0.5+bal*0.05);
    const struct={mise:cash,bal,fin,finType,rate:fm.rate,margeNet:Math.max(5,margePot-carry),lev:(fin+bal)/price,riskFx:fm.riskFx};
    setCapital(c=>c-cash);
    const np=makeProject(l,price,struct);
    setProjets(prev=>[...prev,np]);
    setDocs(prev=>[...prev,genDoc(np)]);
    setListings(prev=>refill(prev.filter(x=>x.id!==l.id)));
    notify(`Offre acceptée · ${l.pop} à ${price} k$`,"win");
    go("messages");
  };

  const analyze=(doc)=>{setDocs(prev=>prev.map(d=>d.id===doc.id?{...d,analyzed:true}:d));setProjets(prev=>prev.map(p=>{if(p.id!==doc.projetId||p.status!=="active")return p;const np={...p};for(const k in doc.fx)np[k]=(np[k]||0)+doc.fx[k];np.risque=Math.max(2,np.risque);return np;}));notify("Document analysé · intel appliquée","info");};
  const nearest=(text,ch)=>{const w=text.toLowerCase().split(/\s+/).filter(Boolean);let best=ch[0],s=-1;ch.forEach(c=>{const cl=c.l.toLowerCase();const sc=w.reduce((a,x)=>a+(cl.includes(x)?1:0),0);if(sc>s){s=sc;best=c;}});return{best,matched:s>0};};

  const buyApp=(item,cur)=>{
    if(unlocked[item.key]){notify("Déjà débloquée.");return;}
    if(cur==="c"){if(credits<item.c){notify("Pas assez de crédits.","warn");return;}setCredits(x=>x-item.c);}
    else{if(capital<item.k){notify("Capital insuffisant.","warn");return;}setCapital(x=>x-item.k);}
    setUnlocked(u=>({...u,[item.key]:true}));notify(`${item.lab} débloquée !`,"win");
  };
  const buyCredits=(pack)=>{setCredits(c=>c+pack.c);notify(`Achat simulé · +${pack.c} crédits (aucun paiement réel)`,"win");};

  const dealAdvice=()=>{
    const p=[...active].sort((a,b)=>b.risque-a.risque)[0];
    if(!p) return "Aucun dossier actif. Va sur Rocktris faire une offre.";
    if(p.risque>=28) return `${p.nom} : risque élevé (${p.risque}). Analyse un document ou accélère le closing.`;
    if(p.beat===3) return `${p.nom} : étape acheteur. Confiance ${p.confiance}% — ${p.confiance>65?"flippe la promesse pour sécuriser le profit.":"garder l'immeuble reste viable si le risque est bas."}`;
    return `${p.nom} : marge ${p.marge} k$, risque ${p.risque}. Fais ta vérif diligente avant de signer.`;
  };
  const askChat=(cost)=>{
    if(cost.credits){if(credits<cost.credits){notify("Pas assez de crédits.","warn");return;}setCredits(c=>c-cost.credits);}
    else{if(capital<cost.k){notify("Capital insuffisant.","warn");return;}setCapital(c=>c-cost.k);}
    setChatLog(L=>[...L,{role:"q",t:cost.credits?`Conseil (${cost.credits} crédit)`:`Conseil (${cost.k} k$)`},{role:"a",t:dealAdvice()}]);
  };

  const dockA=(a)=>view.app===a||(a==="messages"&&view.app==="thread")||(a==="mail"&&["mailItem","mailSys"].includes(view.app))||(a==="rocktris"&&["deed","offer"].includes(view.app));

  const Shell=({title,children,back})=>(
    <div style={{minHeight:"100vh",background:"#D9D9D9",display:"flex",justifyContent:"center",alignItems:"flex-start",padding:"22px 12px",fontFamily:"Inter,sans-serif"}}>
      <style>{FONT+RANGE}</style>
      <div style={{width:"100%",maxWidth:392,background:C.g50,borderRadius:42,boxShadow:SH.med,display:"flex",flexDirection:"column",height:"min(830px,93vh)",overflow:"hidden",position:"relative"}}>
        <div style={{padding:"14px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontWeight:800,fontSize:15,letterSpacing:-.3}}>{back?<span onClick={()=>go(back)} style={{cursor:"pointer"}}>‹ {title}</span>:title}</span>
          <span style={{fontFamily:MONO,fontSize:11,color:C.g400}}>{capital}k · ⭑{noto} · ◆{credits}</span>
        </div>
        <div style={{position:"absolute",top:48,left:14,right:14,zIndex:20,display:"flex",flexDirection:"column",gap:8,pointerEvents:"none"}}>
          {notifs.map(n=>(<div key={n.id} style={{background:n.kind==="warn"||n.kind==="lose"?C.ink:C.paper,color:n.kind==="warn"||n.kind==="lose"?C.paper:C.ink,border:`1px solid ${C.ink}`,borderRadius:R.sm,padding:"11px 14px",fontSize:13,fontWeight:600,boxShadow:SH.med}}>{n.kind==="warn"?"⏰ ":n.kind==="mail"?"✉ ":n.kind==="win"?"✓ ":""}{n.t}</div>))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"4px 14px 14px"}}>{children}</div>
        <div style={{padding:"8px 10px 14px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,background:C.paper,borderRadius:R.pill,padding:6,boxShadow:SH.soft}}>
            {[["home","⌂"],["rocktris","⌖"],["messages","✶"],["deals","◧"],["store","⊕"]].map(([a,g])=>(
              <button key={a} onClick={()=>go(a)} style={{padding:"10px 0",border:"none",borderRadius:R.pill,background:dockA(a)?C.ink:"transparent",color:dockA(a)?C.paper:C.ink,fontSize:16,cursor:"pointer"}}>{g}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // -------- Home --------
  if(view.app==="home"){
    const tiles=[
      {a:"rocktris",lab:"Rocktris",g:"⌖",b:listings.length},{a:"messages",lab:"Messages",g:"✶",b:smsPending},
      {a:"deals",lab:"Deals",g:"◧",b:active.length},{a:"store",lab:"Boutique",g:"⊕",b:0},
      {a:"mail",lab:"RockMail",g:"✉",b:mailPending},{a:"docs",lab:"Dossiers",g:"▤",b:docsPending},
      {a:"carte",lab:"Carte",g:"◎",b:active.length},{a:"quickrock",lab:"QuickRock",g:"$",b:0},
      {a:"chatrock",lab:"ChatRock",g:"◆",b:0},{a:"instarock",lab:"InstaRock",g:"❒",b:0},
    ];
    return (<Shell title="rockfello_game">
      <div style={{padding:"6px 8px"}}>
        <div style={{fontSize:28,fontWeight:900,letterSpacing:-1.2,margin:"6px 0 2px"}}>{projets.length===0?"Bâtis ton empire.":"Ton empire."}</div>
        <div style={{fontSize:14,color:C.g400,marginBottom:20}}>{active.length} actifs · {closed} closés · débloque des apps avec tes gains</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {tiles.map(app=>{const lock=!isUnlocked(app.a);return (
            <button key={app.a} onClick={()=>lock?go("store"):go(app.a)} style={{border:"none",background:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
              <div style={{position:"relative",width:68,height:68,background:lock?C.g200:C.ink,color:lock?C.g400:C.paper,borderRadius:R.md,boxShadow:SH.soft,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,fontWeight:700}}>
                {lock?"🔒":app.g}
                {!lock&&app.b>0&&<span style={{position:"absolute",top:-7,right:-7,minWidth:22,height:22,background:C.paper,color:C.ink,border:`2px solid ${C.ink}`,borderRadius:R.pill,fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px"}}>{app.b}</span>}
              </div>
              <span style={{fontSize:12,fontWeight:600,color:lock?C.g400:C.ink}}>{app.lab}</span>
            </button>);})}
        </div>
      </div>
    </Shell>);
  }

  // -------- Boutique --------
  if(view.app==="store"){
    return (<Shell title="Boutique">
      <div style={{fontFamily:MONO,fontSize:10,color:C.g400,padding:"2px 4px 8px"}}>APPLICATIONS · DÉBLOQUE AVEC TES GAINS</div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
        {STORE.map(it=>{const own=unlocked[it.key];return (
          <div key={it.key} style={{background:C.paper,borderRadius:R.md,padding:14,boxShadow:SH.soft,display:"flex",gap:12,alignItems:"center"}}>
            <div style={{width:46,height:46,borderRadius:R.sm,background:own?C.ink:C.g150,color:own?C.paper:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,flexShrink:0}}>{it.g}</div>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:800,fontSize:14}}>{it.lab}</div><div style={{fontSize:11,color:C.g400,lineHeight:1.4}}>{it.desc}</div></div>
            {own?<span style={{flexShrink:0,fontFamily:MONO,fontSize:11,color:C.g400}}>Possédée</span>
              :<div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:6}}>
                <button onClick={()=>buyApp(it,"k")} style={{border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer",background:C.ink,color:C.paper}}>{it.k} k$</button>
                <button onClick={()=>buyApp(it,"c")} style={{border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer",background:C.paper,color:C.ink}}>{it.c} ◆</button>
              </div>}
          </div>);})}
      </div>
      <div style={{fontFamily:MONO,fontSize:10,color:C.g400,padding:"2px 4px 8px"}}>CRÉDITS · ACHAT SIMULÉ (AUCUN PAIEMENT RÉEL)</div>
      <div style={{display:"flex",gap:10}}>
        {PACKS.map((pk,i)=>(<div key={i} style={{flex:1,background:C.paper,borderRadius:R.md,padding:14,boxShadow:SH.soft,textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:900}}>◆{pk.c}</div><div style={{fontSize:12,color:C.g400,margin:"2px 0 10px"}}>{pk.p}</div>
          <button onClick={()=>buyCredits(pk)} style={{width:"100%",border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"8px 0",fontSize:12,fontWeight:700,cursor:"pointer",background:C.paper}}>Acheter</button>
        </div>))}
      </div>
    </Shell>);
  }

  // -------- Rocktris --------
  if(view.app==="rocktris"){
    return (<Shell title="Rocktris">
      <div style={{fontFamily:MONO,fontSize:10,color:C.g400,padding:"2px 4px 10px"}}>DOSSIERS EN DIFFICULTÉ · {listings.length} DISPONIBLE(S)</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>{listings.map(l=>(
        <div key={l.id} onClick={()=>go("deed",{lid:l.id})} style={{background:C.paper,borderRadius:R.md,boxShadow:SH.soft,overflow:"hidden",cursor:"pointer"}}>
          <Photo p={l} h={120} round={0}/>
          <div style={{padding:14}}><span style={{fontFamily:MONO,fontSize:9,color:C.paper,background:C.ink,padding:"3px 9px",borderRadius:R.pill}}>{l.type.toUpperCase()}</span>
            <div style={{fontSize:18,fontWeight:900,margin:"10px 0 0",letterSpacing:-.3}}>{l.fancy}</div>
            <div style={{fontSize:13,color:C.g700}}>{l.bien} · {l.ville}</div>
            <div style={{display:"flex",gap:14,marginTop:10,fontFamily:MONO,fontSize:12}}><span>ÉVAL <b>{l.valeur}k</b></span><span>DEMANDÉ <b>{l.prix}k</b></span></div></div>
        </div>))}{listings.length===0&&<Empty t="Aucun dossier pour l'instant. Ferme des deals pour en attirer plus." />}</div>
    </Shell>);
  }

  // -------- Deed --------
  if(view.app==="deed"){
    const l=listings.find(x=>x.id===view.lid);
    if(!l) return <Shell title="Rocktris" back="rocktris"><Empty t="Retiré du marché." /></Shell>;
    return (<Shell title="Carte de propriété" back="rocktris">
      <div style={{background:C.paper,borderRadius:R.lg,boxShadow:SH.med,overflow:"hidden",border:`2px solid ${C.ink}`}}>
        <div style={{background:C.ink,color:C.paper,padding:"12px 16px",textAlign:"center"}}><div style={{fontFamily:MONO,fontSize:9,letterSpacing:2,opacity:.7}}>TITRE DE PROPRIÉTÉ</div><div style={{fontSize:21,fontWeight:900,letterSpacing:-.4,marginTop:2}}>{l.fancy}</div></div>
        <div style={{padding:10}}><Photo p={l} h={130} round={R.sm}/></div>
        <div style={{padding:"0 16px 8px"}}><div style={{fontFamily:MONO,fontSize:10,color:C.g400,marginBottom:8}}>{l.pop} · {l.type.toUpperCase()} · {l.ville} · {l.courtier}</div>
          {[["Évaluation municipale",`${l.valeur} k$`],["Prix demandé",`${l.prix} k$`]].map(([k,v],i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderTop:`1px solid ${C.g150}`}}><span style={{fontSize:13,color:C.g700}}>{k}</span><span style={{fontFamily:MONO,fontSize:13,fontWeight:700}}>{v}</span></div>))}
        </div>
        <div style={{padding:"4px 16px 16px"}}><Pill dark onClick={()=>go("offer",{lid:l.id})}>Faire une offre →</Pill></div>
      </div>
    </Shell>);
  }

  // -------- Offer (négociation au slider) --------
  if(view.app==="offer"){
    const l=listings.find(x=>x.id===view.lid);
    if(!l) return <Shell title="Rocktris" back="rocktris"><Empty t="Retiré du marché." /></Shell>;
    const mn=Math.round(l.prix*0.55), mx=Math.round(l.valeur*1.0);
    const fm=FIN.find(f=>f.k===finType)||FIN[0];
    const finPct=Math.max(0,100-misePct-balPct);
    const cash=Math.round(offerPrice*misePct/100), balM=Math.round(offerPrice*balPct/100), finM=Math.max(0,offerPrice-cash-balM);
    const margePot=clamp(Math.round((l.valeur-offerPrice)*0.4),0,200);
    const carry=Math.round(finM*fm.rate/100*0.5+balM*0.05);
    const margeNet=Math.max(5,margePot-carry);
    const lev=(finM+balM)/offerPrice;
    const riskEst=clamp(13+Math.round(lev*22)+fm.riskFx,5,55);
    const tooCash=cash>capital;
    return (<Shell title="Faire une offre" back="deed">
      <div style={{background:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.soft}}>
        <div style={{fontWeight:800,fontSize:16}}>{l.fancy}</div>
        <div style={{fontFamily:MONO,fontSize:11,color:C.g400,marginBottom:4}}>{l.pop} · {l.ville} · {l.courtier}</div>
        <div style={{fontSize:12,color:C.g700,marginBottom:10}}>Demandé : {l.prix} k$ · Éval : {l.valeur} k$. Fixe ton prix — le courtier décidera.</div>
        <div style={{textAlign:"center",fontSize:38,fontWeight:900,letterSpacing:-1}}>{offerPrice} k$</div>
        <Slider min={mn} max={mx} value={offerPrice} onChange={v=>{setOfferPrice(v);setNego(null);}} grad />
        <div style={{display:"flex",justifyContent:"space-between",fontFamily:MONO,fontSize:10,color:C.g400}}><span>agressif {mn}k</span><span>généreux {mx}k</span></div>

        <div style={{borderTop:`1px solid ${C.g150}`,margin:"16px 0 12px"}}/>
        <div style={{fontFamily:MONO,fontSize:10,color:C.g400,marginBottom:10}}>MONTAGE DU FINANCEMENT</div>

        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600}}><span>Mise de fonds</span><span style={{fontFamily:MONO}}>{misePct}% · {cash}k</span></div>
        <Slider min={10} max={100} value={misePct} onChange={v=>{setMisePct(v);if(balPct>100-v)setBalPct(100-v);setNego(null);}} fill />
        {tooCash&&<div style={{fontFamily:MONO,fontSize:10,color:C.ink,fontWeight:700,marginTop:2}}>⚠ dépasse ton capital ({capital}k)</div>}

        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,marginTop:12}}><span>Balance de vente</span><span style={{fontFamily:MONO}}>{balPct}% · {balM}k</span></div>
        <Slider min={0} max={Math.max(0,100-misePct)} value={balPct} onChange={v=>{setBalPct(Math.min(v,100-misePct));setNego(null);}} fill />

        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,fontWeight:600,marginTop:12}}><span>Financement</span><span style={{fontFamily:MONO}}>{finPct}% · {finM}k</span></div>
        <div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>{FIN.map(f=>(<button key={f.k} onClick={()=>{setFinType(f.k);setNego(null);}} style={{border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",background:finType===f.k?C.ink:C.paper,color:finType===f.k?C.paper:C.ink}}>{f.k} {f.rate}%</button>))}</div>
        {finM===0&&<div style={{fontFamily:MONO,fontSize:10,color:C.g400,marginTop:6}}>aucun financement — payé en mise + balance</div>}

        <div style={{display:"flex",gap:12,marginTop:14,fontFamily:MONO,fontSize:12,flexWrap:"wrap"}}><span>CASH REQUIS <b>{cash}k</b></span><span>MARGE NETTE <b>≈{margeNet}k</b></span><span>RISQUE <b>≈{riskEst}</b></span></div>
        {chatHint&&<div style={{marginTop:12,background:C.g100,borderRadius:R.sm,padding:"10px 12px",fontSize:12,color:C.g700}}>◆ ChatRock : {chatHint}</div>}
      </div>

      {!nego&&(<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>
        <Pill dark onClick={()=>{if(tooCash){notify("Réduis ta mise — cash insuffisant.","warn");return;}submitOffer(l);}}>Soumettre l'offre au courtier</Pill>
        {unlocked.chatrock
          ? <Pill onClick={()=>{const th=brokerThreshold(l.prix,noto);if(credits<1){notify("Pas assez de crédits.","warn");return;}setCredits(c=>c-1);setChatHint(`le courtier acceptera sans doute autour de ${th}–${Math.round(th*1.05)} k$.`);}}>ChatRock : lire le courtier (1 ◆)</Pill>
          : <Pill onClick={()=>go("store")}>🔒 ChatRock — débloque pour lire le courtier</Pill>}
      </div>)}

      {nego&&nego.status==="accept"&&(<div style={{marginTop:12,background:C.ink,color:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.med}}>
        <div style={{fontFamily:MONO,fontSize:10,opacity:.6}}>{l.courtier.toUpperCase()}</div>
        <div style={{fontSize:18,fontWeight:800,margin:"4px 0 8px"}}>Offre acceptée à {nego.price} k$.</div>
        <Pill onClick={()=>doAcquire(l,nego.price)}>Engager {Math.round(nego.price*misePct/100)} k$ et démarrer</Pill>
      </div>)}
      {nego&&nego.status==="counter"&&(<div style={{marginTop:12,background:C.paper,border:`2px solid ${C.ink}`,borderRadius:R.md,padding:16,boxShadow:SH.med}}>
        <div style={{fontFamily:MONO,fontSize:10,color:C.g400}}>{l.courtier.toUpperCase()}</div>
        <div style={{fontSize:16,fontWeight:800,margin:"4px 0 10px"}}>Trop bas. Contre-offre à {nego.price} k$.</div>
        <div style={{display:"flex",gap:8}}><Pill dark onClick={()=>doAcquire(l,nego.price)}>Accepter {nego.price}k</Pill><Pill onClick={()=>setNego(null)}>Revoir mon prix</Pill></div>
      </div>)}
      {nego&&nego.status==="reject"&&(<div style={{marginTop:12,background:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.soft}}>
        <div style={{fontFamily:MONO,fontSize:10,color:C.g400}}>{l.courtier.toUpperCase()}</div>
        <div style={{fontSize:16,fontWeight:800,margin:"4px 0 10px"}}>Refusé. « Reviens avec du sérieux. »</div>
        <Pill onClick={()=>setNego(null)}>Remonter mon offre</Pill>
      </div>)}
    </Shell>);
  }

  // -------- Messages / Thread --------
  if(view.app==="messages"){
    const list=active.filter(p=>p.feed.length>0);
    return (<Shell title="Messages">{list.length===0&&<Empty t="Aucune conversation. Va sur Rocktris faire une offre." />}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>{list.map(p=>{const last=[...p.feed].reverse()[0];return <Card key={p.id} onClick={()=>go("thread",{pid:p.id})} title={p.nom} sub={last?last.t:""} pending={!!p.choices} />;})}</div></Shell>);
  }
  if(view.app==="thread"){
    const p=projets.find(x=>x.id===view.pid);
    if(!p) return <Shell title="Messages" back="messages"><Empty t="Introuvable." /></Shell>;
    const ch=p.choices; const isMail=p.ch==="mail";
    const send=()=>{if(!ch||isMail)return;const{best,matched}=nearest(draft||"",ch);if(draft&&matched&&best.l.toLowerCase()!==draft.toLowerCase())setCorrected(best.l);choose(p.id,best);};
    return (<Shell title={p.nom} back="messages">
      <div style={{borderRadius:R.md,overflow:"hidden",boxShadow:SH.soft,marginBottom:10}}><Photo p={p} h={96} round={0}/></div>
      <div style={{background:C.paper,borderRadius:R.md,padding:"10px 14px",marginBottom:10,boxShadow:SH.soft,fontFamily:MONO,fontSize:11,color:C.g400}}>{p.type.toUpperCase()} · MARGE {p.marge} · RISQUE {p.risque} · CONF {p.confiance}%{p.fin&&<span> · MISE {p.mise}k · {p.fin.type} {p.fin.fin}k{p.fin.bal>0?` · BV ${p.fin.bal}k`:""}</span>}{p.nags>0&&<span style={{color:C.ink,fontWeight:600}}> · {p.nags} relance(s)</span>}</div>
      {p.status==="active"&&(()=>{const cost=Math.round(p.prix*0.08);const prem=Math.max(3,Math.round(p.mise*0.15));const owed=p.fin?(p.fin.fin+p.fin.bal):0;const grR=Math.round(p.valeur*0.90),grC=Math.round(p.valeur*0.97);const netR=Math.max(0,grR-Math.round(grR*0.02)-owed)-p.mise;const netC=Math.max(0,grC-Math.round(grC*0.05)-owed)-p.mise;return (
        <div style={{background:C.paper,borderRadius:R.md,padding:14,marginBottom:10,boxShadow:SH.soft}}>
          <div style={{fontFamily:MONO,fontSize:10,color:C.g400,marginBottom:10}}>GESTION DU DOSSIER · ÉVAL {p.valeur}k</div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <button onClick={()=>doTravaux(p)} style={{flex:1,border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"9px 6px",fontSize:12,fontWeight:600,cursor:"pointer",background:C.paper,color:C.ink}}>Travaux −{cost}k{p.travaux?` (${p.travaux})`:""}</button>
            <button onClick={()=>doInsure(p)} disabled={p.insured} style={{flex:1,border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"9px 6px",fontSize:12,fontWeight:600,cursor:p.insured?"default":"pointer",background:p.insured?C.g150:C.paper,color:p.insured?C.g400:C.ink}}>{p.insured?"Assuré ✓":`Assurance −${prem}k`}</button>
          </div>
          {!sellOpen?<button onClick={()=>setSellOpen(true)} style={{width:"100%",border:"none",borderRadius:R.pill,padding:"11px 6px",fontSize:13,fontWeight:700,cursor:"pointer",background:C.ink,color:C.paper}}>Mettre en vente →</button>
            :<div style={{display:"flex",flexDirection:"column",gap:8}}>
              <button onClick={()=>sellDeal(p,"rockfello")} style={{border:`1px solid ${C.ink}`,borderRadius:R.md,padding:"10px 14px",fontSize:13,fontWeight:600,cursor:"pointer",background:C.paper,color:C.ink,textAlign:"left"}}>Rockfello.com · net ≈ {netR>=0?"+":"−"}{Math.abs(netR)}k<div style={{fontSize:10,color:C.g400,fontFamily:MONO}}>direct · frais 2%</div></button>
              <button onClick={()=>sellDeal(p,"courtier")} style={{border:`1px solid ${C.ink}`,borderRadius:R.md,padding:"10px 14px",fontSize:13,fontWeight:600,cursor:"pointer",background:C.paper,color:C.ink,textAlign:"left"}}>Via courtier · net ≈ {netC>=0?"+":"−"}{Math.abs(netC)}k<div style={{fontSize:10,color:C.g400,fontFamily:MONO}}>meilleur prix · commission 5%</div></button>
              <button onClick={()=>setSellOpen(false)} style={{border:"none",background:"none",fontSize:12,color:C.g400,cursor:"pointer"}}>Annuler</button>
            </div>}
        </div>);})()}
      <div style={{display:"flex",flexDirection:"column"}}>{p.feed.map((m,i)=><Bubble key={i} m={m} />)}{p.result&&<ResultCard r={p.result} />}</div>
      {ch&&isMail&&(<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}><div style={{fontFamily:MONO,fontSize:10,color:C.g400}}>✉ COURRIEL — réponds :</div>{ch.map((c,i)=><Pill key={i} onClick={()=>choose(p.id,c)}>{c.l}</Pill>)}</div>)}
      {ch&&!isMail&&(<div style={{position:"sticky",bottom:0,marginTop:8}}>
        <div style={{display:"flex",gap:6,alignItems:"center",overflowX:"auto",paddingBottom:8}}><span style={{fontFamily:MONO,fontSize:10,color:C.g400,whiteSpace:"nowrap"}}>Aa ✓</span>{ch.map((c,i)=><button key={i} onClick={()=>choose(p.id,c)} style={{whiteSpace:"nowrap",border:`1px solid ${C.g200}`,background:C.paper,borderRadius:R.pill,padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{c.l}</button>)}</div>
        {corrected&&<div style={{fontFamily:MONO,fontSize:10,color:C.g400,marginBottom:6}}>texto corrigé → « {corrected} »</div>}
        <div style={{display:"flex",gap:8,alignItems:"center"}}><input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Écris ton texto…" style={{flex:1,border:`1px solid ${C.g200}`,borderRadius:R.pill,padding:"12px 16px",fontSize:14,outline:"none",background:C.paper}}/><button onClick={send} style={{width:44,height:44,borderRadius:R.pill,border:"none",background:C.ink,color:C.paper,fontSize:18,cursor:"pointer",flexShrink:0}}>➤</button></div>
      </div>)}
    </Shell>);
  }

  // -------- RockMail --------
  if(view.app==="mail"){
    const mailP=active.filter(p=>p.choices&&p.ch==="mail");
    return (<Shell title="RockMail">{mailP.length===0&&<Empty t="Aucun courriel à traiter." />}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>{mailP.map(p=>{const m=[...p.feed].reverse().find(x=>x.ch==="mail");return <Card key={p.id} onClick={()=>go("mailItem",{pid:p.id})} title={m?.subj||p.nom} sub={`${m?.from} · ${p.nom}`} pending />;})}</div></Shell>);
  }
  if(view.app==="mailItem"){
    const p=projets.find(x=>x.id===view.pid);const m=p&&[...p.feed].reverse().find(x=>x.ch==="mail");
    if(!p||!m) return <Shell title="RockMail" back="mail"><Empty t="Introuvable." /></Shell>;
    return (<Shell title="Courriel" back="mail"><div style={{background:C.paper,borderRadius:R.md,padding:18,boxShadow:SH.soft}}><div style={{fontFamily:MONO,fontSize:10,color:C.g400}}>DE · {m.from}</div><div style={{fontSize:18,fontWeight:800,margin:"6px 0 4px"}}>{m.subj}</div><div style={{fontSize:12,color:C.g400,marginBottom:14}}>Dossier : {p.nom}</div><p style={{fontSize:14,lineHeight:1.6,color:C.g700}}>{m.t}</p></div>{p.choices&&p.ch==="mail"&&<div style={{display:"flex",flexDirection:"column",gap:8,marginTop:12}}>{p.choices.map((c,i)=><Pill key={i} onClick={()=>{choose(p.id,c);go("mail");}}>{c.l}</Pill>)}</div>}</Shell>);
  }

  // -------- Carte --------
  if(view.app==="carte"){
    const counts={};active.forEach(p=>{counts[p.ville]=(counts[p.ville]||0)+1;});
    const cityList=selCity?active.filter(p=>p.ville===selCity):[];
    return (<Shell title="Carte des dossiers">
      <div style={{background:C.paper,borderRadius:R.md,boxShadow:SH.soft,overflow:"hidden",marginBottom:12}}>
        <svg viewBox="0 0 100 70" width="100%" height="240" style={{display:"block",background:C.g100}}>
          <polygon points="5,8 95,4 96,62 30,66 4,40" fill={C.g150} stroke={C.g300} strokeWidth=".5"/>
          <polyline points="20,58 45,50 66,38 82,28 95,20" fill="none" stroke={C.g300} strokeWidth="2" strokeLinecap="round"/>
          {Object.entries(CITY).map(([city,co])=>{const n=counts[city]||0,sel=selCity===city;return (<g key={city} onClick={()=>n&&setSelCity(sel?null:city)} style={{cursor:n?"pointer":"default"}}>
            <circle cx={co.x} cy={co.y} r={n?3.4:1.6} fill={n?C.ink:C.g300} stroke={C.paper} strokeWidth=".6"/>{n>0&&<text x={co.x} y={co.y+1.2} fontSize="3.4" textAnchor="middle" fill={C.paper} fontFamily="monospace" fontWeight="bold">{n}</text>}{sel&&<circle cx={co.x} cy={co.y} r="5.5" fill="none" stroke={C.ink} strokeWidth=".6"/>}</g>);})}
        </svg>
        <div style={{padding:"10px 14px",fontFamily:MONO,fontSize:10,color:C.g400}}>● {active.length} dossiers actifs · touche une pastille</div>
      </div>
      {selCity?(<div><div style={{fontWeight:800,fontSize:15,margin:"4px 4px 10px"}}>{selCity} — {cityList.length} dossier(s)</div><div style={{display:"flex",flexDirection:"column",gap:10}}>{cityList.map(p=><Card key={p.id} onClick={()=>go("thread",{pid:p.id})} title={p.nom} sub={`${p.bien} · risque ${p.risque}`} pending={!!p.choices} />)}</div></div>):<Empty t="Touche une pastille noire pour voir les dossiers d'une ville." />}
    </Shell>);
  }

  // -------- Dossiers --------
  if(view.app==="docs"){
    const mine=docs.filter(d=>active.some(p=>p.id===d.projetId)||!d.analyzed);
    return (<Shell title="Dossiers">
      <div style={{position:"relative",height:70,marginBottom:8}}>{[2,1,0].map(k=><div key={k} style={{position:"absolute",left:k*10,right:k*10,top:k*7,height:54-k*4,background:C.paper,borderRadius:R.md,boxShadow:SH.soft,border:`1px solid ${C.g150}`}}/>)}<div style={{position:"absolute",inset:0,top:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14}}>{docs.filter(d=>!d.analyzed).length} document(s) à analyser</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>{mine.map(d=>(<div key={d.id} style={{background:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.soft,opacity:d.analyzed?.6:1}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:800,fontSize:15}}>{d.titre}</div><div style={{fontSize:12,color:C.g400,marginTop:2}}>{d.nom}</div></div><span style={{fontSize:22}}>▤</span></div>{d.analyzed?<div style={{fontSize:13,color:C.g700,lineHeight:1.5,marginTop:10,paddingTop:10,borderTop:`1px solid ${C.g150}`}}>✓ {d.find}</div>:<div style={{marginTop:12}}><Pill onClick={()=>analyze(d)}>Analyser le document</Pill></div>}</div>))}{mine.length===0&&<Empty t="Pile vide." />}</div>
    </Shell>);
  }

  // -------- QuickRock --------
  if(view.app==="quickrock"){
    const rev=ledger.filter(e=>e.montant>0).reduce((a,e)=>a+e.montant,0),dep=ledger.filter(e=>e.montant<0).reduce((a,e)=>a+Math.abs(e.montant),0);
    return (<Shell title="QuickRock">
      <div style={{background:C.ink,color:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.med,marginBottom:12}}><div style={{fontFamily:MONO,fontSize:10,letterSpacing:1,opacity:.6}}>A100 · BANQUE / FIDUCIE</div><div style={{fontSize:30,fontWeight:900,letterSpacing:-1,marginTop:2}}>{capital} k$</div></div>
      <div style={{display:"flex",gap:10,marginBottom:12}}><Mini l="REVENUS" v={`+${rev}k`} /><Mini l="DÉPENSES" v={`−${dep}k`} /><Mini l="NET" v={`${rev-dep>=0?"+":"−"}${Math.abs(rev-dep)}k`} /></div>
      <div style={{fontFamily:MONO,fontSize:10,color:C.g400,padding:"0 4px 8px"}}>GRAND LIVRE · {ledger.length} ÉCRITURES</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>{ledger.slice(0,40).map(e=>(<div key={e.id} style={{background:C.paper,borderRadius:R.sm,padding:"11px 14px",boxShadow:SH.soft,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{minWidth:0}}><div style={{fontWeight:700,fontSize:13}}>{e.compte} · {ACC[e.compte]}</div><div style={{fontSize:11,color:C.g400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.lib}</div></div><span style={{fontFamily:MONO,fontSize:14,fontWeight:700,marginLeft:10}}>{e.montant>=0?"+":"−"}{Math.abs(e.montant)}k</span></div>))}{ledger.length===0&&<Empty t="Aucune écriture. Ferme un dossier." />}</div>
    </Shell>);
  }

  // -------- ChatRock --------
  if(view.app==="chatrock"){
    return (<Shell title="ChatRock">
      <div style={{background:C.ink,color:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.med,marginBottom:12}}><div style={{fontFamily:MONO,fontSize:10,opacity:.6}}>◆ IA INTERNE</div><div style={{fontSize:15,fontWeight:700,marginTop:4}}>Je lis tes dossiers et te dis quoi faire.</div></div>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
        {chatLog.length===0&&<Empty t="Pose une question pour recevoir un conseil." />}
        {chatLog.map((m,i)=><div key={i} style={{display:"flex",justifyContent:m.role==="q"?"flex-end":"flex-start"}}><div style={{maxWidth:"85%",background:m.role==="q"?C.ink:C.paper,color:m.role==="q"?C.paper:C.ink,borderRadius:R.md,padding:"11px 14px",boxShadow:SH.soft,fontSize:14,lineHeight:1.45}}>{m.role==="a"?"◆ "+m.t:m.t}</div></div>)}
      </div>
      <div style={{display:"flex",gap:8}}><Pill onClick={()=>askChat({k:8})}>Conseil — 8 k$</Pill><Pill dark onClick={()=>askChat({credits:1})}>Conseil — 1 ◆</Pill></div>
    </Shell>);
  }

  // -------- InstaRock --------
  if(view.app==="instarock"){
    const posts=[{u:"@ostiguy_invest",t:"Closé. 14 portes à Joliette. On continue.",likes:212},{u:"@credit_boreal",t:"Bridge en 48h pour partenaires récurrents.",likes:87},{u:"@notaire_lavoie",t:"Un préavis d'exercice ne pardonne pas les retards.",likes:54}];
    return (<Shell title="InstaRock">
      <div style={{background:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.soft,marginBottom:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:800,fontSize:15}}>@rockfello</div><div style={{fontSize:12,color:C.g400}}>Notoriété {noto} · {closed} closés</div></div><button onClick={()=>{if(!igLiked){setNoto(n=>Math.min(100,n+1));setIgLiked(true);notify("+1 notoriété","win");}}} style={{border:`1px solid ${C.ink}`,borderRadius:R.pill,padding:"9px 16px",background:igLiked?C.ink:C.paper,color:igLiked?C.paper:C.ink,fontSize:13,fontWeight:700,cursor:"pointer"}}>{igLiked?"Actif":"Poster"}</button></div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>{posts.map((p,i)=><div key={i} style={{background:C.paper,borderRadius:R.md,padding:16,boxShadow:SH.soft}}><div style={{fontWeight:700,fontSize:13}}>{p.u}</div><p style={{fontSize:14,lineHeight:1.5,margin:"6px 0",color:C.g700}}>{p.t}</p><div style={{fontFamily:MONO,fontSize:11,color:C.g400}}>♥ {p.likes}</div></div>)}</div>
    </Shell>);
  }

  // -------- Deals --------
  if(view.app==="deals"){
    const sorted=[...projets].sort((a,b)=>(a.status==="active"?0:1)-(b.status==="active"?0:1));
    return (<Shell title="Deals">
      <div style={{display:"flex",gap:10,marginBottom:12}}><Mini l="CAPITAL" v={`${capital}k`} /><Mini l="ACTIFS" v={`${active.length}`} /><Mini l="CLOSÉS" v={`${closed}`} /></div>
      {sorted.length===0&&<Empty t="Aucun dossier. Va sur Rocktris faire ta première offre." />}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>{sorted.map(p=>(<div key={p.id} onClick={()=>p.status==="active"&&go("thread",{pid:p.id})} style={{background:C.paper,borderRadius:R.md,padding:10,boxShadow:SH.soft,cursor:p.status==="active"?"pointer":"default",opacity:p.status==="active"?1:.5,display:"flex",gap:10,alignItems:"center"}}>
        <div style={{width:64,flexShrink:0,borderRadius:R.sm,overflow:"hidden"}}><Photo p={p} h={42} round={R.sm}/></div>
        <div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontWeight:700,fontSize:13}}>{p.nom}</span><span style={{fontFamily:MONO,fontSize:9,color:C.paper,background:C.ink,padding:"2px 7px",borderRadius:R.pill}}>{p.status==="active"?(p.choices?(p.ch==="mail"?"COURRIEL":"TEXTO"):"…"):(p.result?.status||"FERMÉ")}</span></div><div style={{fontFamily:MONO,fontSize:10,color:C.g400,marginTop:3}}>{p.status==="active"?`étape ${p.beat+1}/4 · risque ${p.risque}`:(p.result?`${p.result.profit>=0?"+":"−"}${Math.abs(p.result.profit)} k$`:"")}</div></div>
      </div>))}</div>
    </Shell>);
  }

  return <Shell title="rockfello_game"><Empty t="—" /></Shell>;
}

function Slider({min,max,value,onChange,grad,fill}){
  const ref=useRef(null); const drag=useRef(false);
  const upd=(clientX)=>{const el=ref.current;if(!el)return;const r=el.getBoundingClientRect();let t=r.width?(clientX-r.left)/r.width:0;t=Math.max(0,Math.min(1,t));onChange(Math.round(min+t*(max-min)));};
  const pct=max>min?(value-min)/(max-min):0;
  return (<div ref={ref}
    onPointerDown={e=>{drag.current=true;try{e.currentTarget.setPointerCapture(e.pointerId);}catch(_){}upd(e.clientX);}}
    onPointerMove={e=>{if(drag.current)upd(e.clientX);}}
    onPointerUp={()=>{drag.current=false;}} onPointerCancel={()=>{drag.current=false;}}
    style={{position:"relative",height:36,margin:"8px 0 4px",display:"flex",alignItems:"center",touchAction:"none",userSelect:"none",cursor:"pointer"}}>
    <div style={{position:"absolute",left:0,right:0,height:16,borderRadius:100,border:`1px solid ${C.ink}`,background:grad?"linear-gradient(90deg,#000,#fff)":C.paper,overflow:"hidden"}}>
      {fill&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct*100}%`,background:C.ink}}/>}
    </div>
    <div style={{position:"absolute",left:`calc(${pct*100}% - 14px)`,width:28,height:28,borderRadius:"50%",background:C.ink,border:`4px solid ${C.paper}`,boxShadow:"0 2px 8px rgba(0,0,0,.35)",pointerEvents:"none"}}/>
  </div>);
}
function Pill({children,onClick,dark}){const[h,setH]=useState(false);return <button onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{flex:1,width:"100%",padding:"13px 18px",borderRadius:R.pill,border:`1px solid ${C.ink}`,background:(dark||h)?C.ink:C.paper,color:(dark||h)?C.paper:C.ink,fontSize:14,fontWeight:600,cursor:"pointer",textAlign:"center",transition:"background .15s,color .15s"}}>{children}</button>;}
function Card({title,sub,onClick,pending}){return (<div onClick={onClick} style={{background:C.paper,borderRadius:R.md,padding:"14px 16px",boxShadow:SH.soft,cursor:"pointer",display:"flex",gap:12,alignItems:"center"}}><span style={{width:9,height:9,borderRadius:R.pill,background:pending?C.ink:C.g200,flexShrink:0}} /><div style={{minWidth:0,flex:1}}><div style={{fontWeight:700,fontSize:14}}>{title}</div><div style={{fontSize:12,color:C.g400,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sub}</div></div>{pending&&<span style={{fontFamily:MONO,fontSize:9,color:C.paper,background:C.ink,padding:"3px 9px",borderRadius:R.pill,whiteSpace:"nowrap"}}>À TRAITER</span>}</div>);}
function Bubble({m}){const out=m.side==="out";return (<div style={{display:"flex",justifyContent:out?"flex-end":"flex-start",marginBottom:10}}><div style={{maxWidth:"82%"}}>{!out&&m.from&&<div style={{fontSize:11,fontWeight:600,marginBottom:4,marginLeft:4}}>{m.from}{m.ch==="mail"&&<span style={{fontFamily:MONO,fontSize:8,color:C.paper,background:C.ink,padding:"1px 5px",borderRadius:R.pill,marginLeft:6}}>COURRIEL</span>}</div>}<div style={{padding:"11px 15px",fontSize:14,lineHeight:1.45,background:out?C.ink:C.paper,color:out?C.paper:C.ink,borderRadius:R.md,borderBottomRightRadius:out?6:R.md,borderBottomLeftRadius:out?R.md:6,boxShadow:SH.soft}}>{m.subj?<b>{m.subj} : </b>:null}{m.t}</div></div></div>);}
function ResultCard({r}){return (<div style={{background:C.ink,color:C.paper,borderRadius:R.md,padding:18,marginTop:6,boxShadow:SH.med}}><div style={{fontFamily:MONO,fontSize:10,letterSpacing:1,opacity:.6}}>{r.status}</div><div style={{fontSize:32,fontWeight:900,letterSpacing:-1,margin:"2px 0 6px"}}>{r.profit>=0?"+":"−"}{Math.abs(r.profit)} k$</div><div style={{fontSize:13,lineHeight:1.5,opacity:.85}}>{r.line}</div></div>);}
function Mini({l,v}){return <div style={{flex:1,background:C.paper,borderRadius:R.sm,padding:"12px 14px",boxShadow:SH.soft}}><div style={{fontFamily:MONO,fontSize:9,letterSpacing:1,color:C.g400}}>{l}</div><div style={{fontSize:18,fontWeight:800,marginTop:2}}>{v}</div></div>;}
function Empty({t}){return <div style={{padding:40,textAlign:"center",color:C.g400,fontSize:14,lineHeight:1.5}}>{t}</div>;}
