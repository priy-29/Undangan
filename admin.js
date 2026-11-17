"use strict";
(function(){
  const $=id=>document.getElementById(id);
  const loginPanel=$("loginPanel"),appPanel=$("appPanel");
  let auth,db;
  const setStatus=(id,msg)=>$(id).textContent=msg;
  if(!window.FIREBASE_CONFIGURED||typeof firebase==="undefined"){
    setStatus("loginStatus","Konfigurasi Firebase belum siap.");return;
  }
  try{
    if(!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
    auth=firebase.auth();db=firebase.firestore();
  }catch(e){setStatus("loginStatus","Firebase gagal diinisialisasi: "+e.message);return;}
  const showApp=user=>{
    loginPanel.classList.toggle("hidden",!!user);
    appPanel.classList.toggle("hidden",!user);
    if(user) loadGuests();
  };
  auth.onAuthStateChanged(showApp);
  $("loginForm").addEventListener("submit",async e=>{
    e.preventDefault();setStatus("loginStatus","Sedang masuk...");
    try{await auth.signInWithEmailAndPassword($("email").value.trim(),$("password").value);}
    catch(err){setStatus("loginStatus",err.message);}
  });
  $("logoutBtn").addEventListener("click",()=>auth.signOut());
  const slugify=name=>name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,40)||"tamu";
  async function uniqueUsername(base){
    let slug=base,n=2;
    while(true){
      const snap=await db.collection("guests").where("username","==",slug).limit(1).get();
      if(snap.empty)return slug;
      slug=base+"-"+n++;
    }
  }
  $("addBtn").addEventListener("click",async()=>{
    const names=$("names").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    if(!names.length){setStatus("addStatus","Masukkan minimal satu nama.");return;}
    $("addBtn").disabled=true;let made=0,failed=[];
    for(const name of names){
      try{
        const username=await uniqueUsername(slugify(name));
        await db.collection("guests").doc(username).set({
          name,username,createdAt:firebase.firestore.FieldValue.serverTimestamp()
        });
        made++;
      }catch(err){failed.push(name+": "+err.message);}
    }
    $("addBtn").disabled=false;$("names").value="";
    setStatus("addStatus",made+" tamu berhasil disimpan."+(failed.length?" Gagal: "+failed.join(" | "):""));
    await loadGuests();
  });
  async function loadGuests(){
    $("count").textContent="Memuat data...";
    try{
      const snap=await db.collection("guests").get();
      const guests=snap.docs.map(doc=>({id:doc.id,...doc.data()})).sort((a,b)=>(a.name||"").localeCompare(b.name||""));
      $("count").textContent=guests.length+" tamu terdaftar";
      const list=$("guestList");list.replaceChildren();
      if(!guests.length){list.textContent="Belum ada tamu.";return;}
      guests.forEach(g=>{
        const item=document.createElement("div");item.className="guest";
        const info=document.createElement("div");
        const name=document.createElement("div");name.className="guest-name";name.textContent=g.name||"(tanpa nama)";
        const url=location.origin+"/@"+g.username;
        const link=document.createElement("div");link.className="guest-link";link.textContent=url;
        info.append(name,link);
        const actions=document.createElement("div");actions.className="guest-actions";
        const copy=document.createElement("button");copy.type="button";copy.className="soft";copy.textContent="Salin";
        copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(url);copy.textContent="Tersalin";setTimeout(()=>copy.textContent="Salin",1500);}catch(e){prompt("Salin link ini:",url);}});
        const del=document.createElement("button");del.type="button";del.className="danger";del.textContent="Hapus";
        del.addEventListener("click",async()=>{if(!confirm("Hapus tamu "+(g.name||g.username)+"?"))return;try{await db.collection("guests").doc(g.id).delete();await loadGuests();}catch(e){alert("Gagal menghapus: "+e.message);}});
        actions.append(copy,del);item.append(info,actions);list.append(item);
      });
    }catch(err){$("count").textContent="Gagal memuat: "+err.message;}
  }
  $("refreshBtn").addEventListener("click",loadGuests);
})();