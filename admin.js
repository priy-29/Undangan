"use strict";
(() => {
 const $=id=>document.getElementById(id);
 const loginPanel=$("loginPanel"),appPanel=$("appPanel");
 let auth,db,guestCache=[],rsvpCache=[];
 const msg=(id,text)=>$(id).textContent=text;
 const slugify=value=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,45)||"tamu";
 const esc=value=>String(value??"");
 const dateText=value=>{try{const d=value?.toDate?value.toDate():value?.seconds?new Date(value.seconds*1000):null;return d?d.toLocaleString("id-ID",{dateStyle:"medium",timeStyle:"short"}):"Tanggal tidak tersedia"}catch{return"Tanggal tidak tersedia"}};
 if(!window.FIREBASE_CONFIGURED||typeof firebase==="undefined"){msg("loginStatus","Konfigurasi Firebase belum siap.");return}
 try{if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);auth=firebase.auth();db=firebase.firestore()}catch(e){msg("loginStatus","Firebase gagal diinisialisasi: "+e.message);return}
 auth.onAuthStateChanged(user=>{
  loginPanel.classList.toggle("hidden",!!user);appPanel.classList.toggle("hidden",!user);$("logoutBtn").classList.toggle("hidden",!user);
  $("adminEmail").textContent=user?.email||"";
  if(user)refreshAll();
 });
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();msg("loginStatus","Sedang masuk...");try{await auth.signInWithEmailAndPassword($("email").value.trim(),$("password").value)}catch(err){msg("loginStatus",err.message)}});
 $("logoutBtn").addEventListener("click",()=>auth.signOut());
 document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===btn));
  $("guestsSection").classList.toggle("active",btn.dataset.tab==="guests");
  $("rsvpsSection").classList.toggle("active",btn.dataset.tab==="rsvps");
 }));
 $("guestName").addEventListener("input",()=>{if(!$("editGuestId").value)$("guestUsername").value=slugify($("guestName").value)});
 $("guestForm").addEventListener("submit",async e=>{
  e.preventDefault();const name=$("guestName").value.trim(),username=slugify($("guestUsername").value||name),editing=$("editGuestId").value;
  if(!name||!username){msg("guestStatus","Nama dan username wajib diisi.");return}
  const btn=$("saveGuestBtn");btn.disabled=true;msg("guestStatus","Menyimpan...");
  try{
   const ref=db.collection("guests").doc(username);
   if(editing&&editing!==username){const old=await db.collection("guests").doc(editing).get();if(!old.exists)throw Error("Data tamu lama tidak ditemukan");if((await ref.get()).exists)throw Error("Username sudah dipakai tamu lain");const data=old.data();await ref.set({...data,username,name});await old.ref.delete();}
   else if(editing){await ref.update({name,username});}
   else {if((await ref.get()).exists)throw Error("Username sudah digunakan. Pilih username lain.");await ref.set({name,username,visitCount:0,createdAt:firebase.firestore.FieldValue.serverTimestamp(),lastVisited:null});}
   resetGuestForm();msg("guestStatus","Data tamu berhasil disimpan.");await loadGuests();
  }catch(err){msg("guestStatus","Gagal menyimpan: "+err.message)}finally{btn.disabled=false}
 });
 function resetGuestForm(){$("guestForm").reset();$("editGuestId").value="";$("guestUsername").disabled=false;$("guestFormTitle").textContent="Tambah tamu";$("saveGuestBtn").textContent="Simpan tamu";$("cancelEditBtn").classList.add("hidden")}
 $("cancelEditBtn").addEventListener("click",resetGuestForm);
 function editGuest(g){$("editGuestId").value=g.id;$("guestName").value=g.name||"";$("guestUsername").value=g.username||g.id;$("guestFormTitle").textContent="Edit tamu";$("saveGuestBtn").textContent="Simpan perubahan";$("cancelEditBtn").classList.remove("hidden");$("guestName").focus();window.scrollTo({top:0,behavior:"smooth"})}
 function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
 async function loadGuests(){
  msg("guestCount","Memuat daftar tamu...");
  try{const snap=await db.collection("guests").get();guestCache=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.name||"").localeCompare(b.name||""));msg("guestCount",guestCache.length+" tamu terdaftar");renderGuests();updateMetrics()}
  catch(e){msg("guestCount","Gagal memuat: "+e.message)}
 }
 function renderGuests(){
  const list=$("guestList");list.replaceChildren();const q=$("guestSearch").value.trim().toLowerCase();
  const filtered=guestCache.filter(g=>(g.name||"").toLowerCase().includes(q)||(g.username||g.id).toLowerCase().includes(q));
  if(!filtered.length){list.append(node("div","empty",q?"Tamu tidak ditemukan.":"Belum ada tamu terdaftar."));return}
  filtered.forEach(g=>{
   const item=node("div","item"),main=node("div","item-main"),title=node("div","item-title",g.name||"(tanpa nama)"),url=location.origin+"/@"+(g.username||g.id),sub=node("div","item-sub",url),meta=node("div","item-sub",(Number(g.visitCount)||0)+" kunjungan · Terakhir: "+dateText(g.lastVisited));
   main.append(title,sub,meta);const actions=node("div","item-actions");
   const copy=node("button","btn secondary small","Salin link");copy.type="button";copy.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(url);copy.textContent="Tersalin"}catch{prompt("Salin link:",url)}});
   const edit=node("button","btn secondary small","Edit");edit.type="button";edit.addEventListener("click",()=>editGuest(g));
   const del=node("button","btn danger small","Hapus");del.type="button";del.addEventListener("click",async()=>{if(!confirm("Hapus tamu "+(g.name||g.id)+"?"))return;try{await db.collection("guests").doc(g.id).delete();await loadGuests()}catch(e){alert("Gagal menghapus tamu: "+e.message)}});
   actions.append(copy,edit,del);item.append(main,actions);list.append(item);
  });
 }
 $("guestSearch").addEventListener("input",renderGuests);
 $("rsvpSearch").addEventListener("input",renderRsvps);
 async function loadRsvps(){
  msg("rsvpCount","Memuat ucapan...");
  try{const snap=await db.collection("rsvps").get();rsvpCache=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));msg("rsvpCount",rsvpCache.length+" konfirmasi / ucapan");renderRsvps();updateMetrics()}
  catch(e){msg("rsvpCount","Gagal memuat: "+e.message)}
 }
 function renderRsvps(){
  const list=$("rsvpList");list.replaceChildren();const q=$("rsvpSearch").value.trim().toLowerCase();
  const filtered=rsvpCache.filter(r=>(r.name||"").toLowerCase().includes(q)||(r.message||"").toLowerCase().includes(q));
  if(!filtered.length){list.append(node("div","empty",q?"Ucapan tidak ditemukan.":"Belum ada ucapan masuk."));return}
  filtered.forEach(r=>{
   const item=node("div","item"),main=node("div","item-main"),title=node("div","item-title",r.name||"Tamu"),badge=node("span","pill "+(r.attendance==="Hadir"?"yes":r.attendance==="Tidak Hadir"?"no":""),r.attendance||"Belum memilih"),date=node("div","item-sub",dateText(r.createdAt)),message=node("p","message",r.message||"(Tanpa pesan)"),meta=node("div","item-sub",(r.guests||1)+" orang");
   main.append(title,badge,date,meta,message);const actions=node("div","item-actions"),del=node("button","btn danger small","Hapus ucapan");del.type="button";del.addEventListener("click",async()=>{if(!confirm("Hapus ucapan dari "+(r.name||"tamu")+"?"))return;del.disabled=true;try{await db.collection("rsvps").doc(r.id).delete();await loadRsvps()}catch(e){del.disabled=false;alert("Gagal menghapus ucapan: "+e.message)}});actions.append(del);item.append(main,actions);list.append(item);
  });
 }
 function updateMetrics(){
  $("mGuests").textContent=guestCache.length;
  $("mVisits").textContent=guestCache.reduce((sum,g)=>sum+(Number(g.visitCount)||0),0);
  $("mYes").textContent=rsvpCache.filter(r=>r.attendance==="Hadir").length;
  $("mNo").textContent=rsvpCache.filter(r=>r.attendance==="Tidak Hadir").length;
  $("mMessages").textContent=rsvpCache.filter(r=>(r.message||"").trim().length>0).length;
 }
 async function refreshAll(){await Promise.all([loadGuests(),loadRsvps()])}
 $("refreshGuests").addEventListener("click",loadGuests);$("refreshRsvps").addEventListener("click",loadRsvps);
})();