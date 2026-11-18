import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const demoItems = [
  {id:"demo-1",type:"lost",name:"Black wireless earbuds",category:"Electronics",location:"Central Library",date:"2026-11-14",description:"A small black earbuds case. Lost around the reading area.",recovered:false,createdAt:1763078400000},
  {id:"demo-2",type:"found",name:"Blue ruled notebook",category:"Books & stationery",location:"Engineering Block, first floor",date:"2026-11-15",description:"Blue notebook found on a desk after class.",recovered:false,createdAt:1763164800000},
  {id:"demo-3",type:"lost",name:"Silver water bottle",category:"Other",location:"Sports Ground",date:"2026-11-13",description:"Metal bottle with a plain silver finish.",recovered:false,createdAt:1762992000000},
  {id:"demo-4",type:"found",name:"Set of keys",category:"Accessories",location:"Canteen entrance",date:"2026-11-16",description:"A small set of keys found near the canteen entrance. For a real handover, take the item to campus security.",recovered:false,createdAt:1763251200000}
];

let listings = [...demoItems];
let activeFilter = "all";
let pendingPhoto = "";
let currentUser = null;
let databaseReady = false;
let unsubscribeListings = null;
let database;
let auth;

const $ = id => document.getElementById(id);

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function iconFor(category){
  return ({"Electronics":"🎧","Documents":"🪪","Books & stationery":"📘","Accessories":"🔑","Clothing":"🧥","Other":"🎒"})[category] || "📦";
}
function formatDate(value){
  if(!value) return "Date not provided";
  const d = new Date(value + "T00:00:00");
  return Number.isNaN(d.getTime()) ? escapeHTML(value) : d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function activeItems(){ return listings.filter(x => !x.recovered); }
function showToast(message){
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(()=>toast.classList.remove("show"),3000);
}
function navigate(page){
  document.querySelectorAll(".page").forEach(p => p.hidden = true);
  const target = $("page-"+page);
  if(target) target.hidden = false;
  document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.page === page));
  if(page === "home") renderHome();
  if(page === "browse") renderBrowse();
  window.scrollTo({top:0,behavior:"smooth"});
}
function countUp(el, to){
  const from = +el.textContent || 0; if (from === to) return;
  const t0 = performance.now();
  (function tick(t){
    const p = Math.min((t - t0) / 900, 1);
    el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}
function renderStats(){
  countUp($("stat-active"), activeItems().length);
  countUp($("stat-lost"), activeItems().filter(x => x.type === "lost").length);
  countUp($("stat-recovered"), listings.filter(x => x.recovered).length);
}
function cardTemplate(item){
  const image = item.photo ? `<img class="item-photo" src="${item.photo}" alt="Photo of ${escapeHTML(item.name)}">` : `<div class="item-emoji" aria-hidden="true">${iconFor(item.category)}</div>`;
  return `<article class="listing-card">
    <div class="listing-top"><span class="pill ${item.type}">${item.type}</span><span class="category">${escapeHTML(item.category)}</span></div>
    ${image}<h3>${escapeHTML(item.name)}</h3><p>⌖ ${escapeHTML(item.location)}</p><p>${escapeHTML(item.description)}</p>
    <div class="listing-meta"><span>${formatDate(item.date)}</span><button class="small-link" data-detail="${escapeHTML(item.id)}">View details →</button></div>
  </article>`;
}
function renderHome(){
  renderStats();
  const recent = activeItems().slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,3);
  $("recent-listings").innerHTML = recent.length ? recent.map(cardTemplate).join("") : `<div class="empty-state">No active reports yet. Be the first to add one!</div>`;
}
function renderBrowse(){
  const queryText = $("search-input").value.trim().toLowerCase();
  const category = $("category-filter").value;
  const found = activeItems().filter(item => {
    const matchesType = activeFilter === "all" || item.type === activeFilter;
    const matchesCategory = !category || item.category === category;
    const haystack = [item.name,item.description,item.location,item.category].join(" ").toLowerCase();
    return matchesType && matchesCategory && haystack.includes(queryText);
  });
  $("results-count").textContent = `${found.length} ${found.length === 1 ? "listing" : "listings"} found`;
  $("all-listings").innerHTML = found.length ? found.map(cardTemplate).join("") : `<div class="empty-state"><div style="font-size:32px">⌕</div><h3>No matching items</h3><p>Try another keyword or change the filters.</p></div>`;
}
function toWhatsAppNumber(raw){
  let digits = String(raw || "").replace(/\D/g, "");
  // Convenient default for this India-based campus project: accept a 10-digit Indian mobile number.
  if(digits.length === 10) digits = "91" + digits;
  return digits.length >= 11 && digits.length <= 15 ? digits : "";
}
function showDetail(id){
  const item = listings.find(x => x.id === id);
  if(!item) return;
  const contactNumber = toWhatsAppNumber(item.whatsapp || "");
  const contactLabel = item.type === "found" ? "Contact finder on WhatsApp" : "Contact person who reported this item";
  const message = encodeURIComponent(`Hi! I saw your ${item.type} item listing for "${item.name}" on CampusConnect. I think I can help identify/claim this item. Could we discuss a safe handover?`);
  const whatsappButton = contactNumber ? `<a class="btn btn-whatsapp" href="https://wa.me/${contactNumber}?text=${message}" target="_blank" rel="noopener noreferrer">${contactLabel} ↗</a>` : `<p class="contact-unavailable">The poster did not add a WhatsApp contact. Please use your campus help desk or security office for assistance.</p>`;
  const canRecover = currentUser && item.createdBy === currentUser.uid;
  $("detail-content").innerHTML = `<article class="detail-panel">
    <div class="listing-top"><span class="pill ${item.type}">${item.type}</span><span class="category">${escapeHTML(item.category)}</span></div>
    ${item.photo ? `<img class="detail-photo" src="${item.photo}" alt="Photo of ${escapeHTML(item.name)}">` : `<div class="item-emoji">${iconFor(item.category)}</div>`}
    <h2>${escapeHTML(item.name)}</h2><p class="detail-description">${escapeHTML(item.description)}</p>
    <div class="detail-grid">
      <div class="detail-field"><small>Campus location</small><strong>${escapeHTML(item.location)}</strong></div>
      <div class="detail-field"><small>Date reported / seen</small><strong>${formatDate(item.date)}</strong></div>
      <div class="detail-field"><small>Report type</small><strong>${item.type === "lost" ? "Item reported lost" : "Item reported found"}</strong></div>
      <div class="detail-field"><small>Status</small><strong>${item.recovered ? "Recovered" : "Active"}</strong></div>
    </div>
    ${whatsappButton}
    <p class="detail-description"><strong>Safety reminder:</strong> Don't share OTPs or sensitive personal information. Verify ownership and arrange handover in a supervised public place or through campus security.</p>
    <div class="detail-actions">${!item.recovered && canRecover ? `<button class="btn btn-primary" data-recover="${escapeHTML(item.id)}">Mark as recovered ✓</button>` : item.recovered ? `<span class="pill found">Recovered</span>` : ""}<button class="btn btn-outline" data-page="browse">Back to listings</button></div>
  </article>`;
  navigate("detail");
}
async function recoverItem(id){
  const item = listings.find(x => x.id === id);
  if(!item || item.createdBy !== currentUser?.uid) return showToast("Only the person who posted this report can update it.");
  if(!confirm("Mark this listing as recovered? It will disappear from active searches for everyone.")) return;
  try{
    await updateDoc(doc(database,"listings",id),{recovered:true,updatedAt:serverTimestamp()});
    showToast("Listing marked as recovered for everyone.");
  }catch(error){ console.error(error); showToast("Could not update the listing. Please try again."); }
}
async function handleReport(event){
  event.preventDefault();
  if(!databaseReady || !currentUser){ showToast("Connecting to CampusConnect. Please wait a moment and try again."); return; }
  const item = {
    type:$("report-type").value,
    category:$("report-category").value,
    name:$("item-name").value.trim(),
    location:$("item-location").value.trim(),
    date:$("item-date").value,
    description:$("item-description").value.trim(),
    whatsapp:$("item-whatsapp").value.trim(),
    recovered:false,
    createdBy:currentUser.uid,
    createdAt:serverTimestamp()
  };
  if(!item.name || !item.location || !item.date || !item.description){ $("form-message").textContent = "Please complete all required fields."; return; }
  if(item.whatsapp && !toWhatsAppNumber(item.whatsapp)){ $("form-message").textContent = "Enter a valid WhatsApp number with country code, e.g. 919876543210."; return; }
  try{
    await addDoc(collection(database,"listings"),item);
    $("report-form").reset();
    $("item-date").value = new Date().toISOString().slice(0,10);
    pendingPhoto = "";
    $("photo-preview").hidden = true;
    $("photo-preview").innerHTML = "";
    $("form-message").textContent = "Your report is now shared with everyone using CampusConnect!";
    showToast("Report published for the campus community.");
    setTimeout(()=>navigate("browse"),700);
  }catch(error){
    console.error(error);
    $("form-message").textContent = "Could not publish your report. Check the Firebase setup and try again.";
  }
}
function handlePhoto(file){
  pendingPhoto = "";
  $("photo-preview").hidden = true;
  $("photo-preview").innerHTML = "";
  if(!file) return;
  if(!file.type.startsWith("image/")){ showToast("Please choose an image file."); return; }
  if(file.size > 450000){ showToast("Please choose an image smaller than 450 KB."); return; }
  const reader = new FileReader();
  reader.onload = () => {
    pendingPhoto = reader.result;
    $("photo-preview").innerHTML = `<img src="${pendingPhoto}" alt="Selected item preview">`;
    $("photo-preview").hidden = false;
    showToast("Photo preview only: it will not be shared online in this version.");
  };
  reader.readAsDataURL(file);
}
function startLiveListings(){
  const listingsQuery = query(collection(database,"listings"),orderBy("createdAt","desc"));
  unsubscribeListings = onSnapshot(listingsQuery, snapshot => {
    const shared = snapshot.docs.map(d => ({id:d.id,...d.data(),createdAt:d.data().createdAt?.toMillis?.() || Date.now()}));
    listings = [...shared,...demoItems];
    renderHome();
    if(!$('page-browse').hidden) renderBrowse();
  }, error => {
    console.error(error);
    showToast("Can't load shared reports. Check your Firestore rules.");
  });
}
function setConnectionStatus(message, isError=false){
  const status = $("connection-status");
  if(status){ status.textContent = message; status.classList.toggle("error",isError); }
}
async function boot(){
  if(firebaseConfig.apiKey.includes("PASTE_") || firebaseConfig.projectId.includes("PASTE_")){
    setConnectionStatus("Firebase setup required — follow FIREBASE_SETUP.md",true);
    showToast("Finish the one-time Firebase setup to enable shared listings.");
    renderHome();
    return;
  }
  try{
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getFirestore(app);
    setConnectionStatus("Connecting to shared campus listings…");
    await signInAnonymously(auth);
    onAuthStateChanged(auth,user=>{
      currentUser = user;
      if(user && !databaseReady){
        databaseReady = true;
        setConnectionStatus("Connected · reports sync across devices");
        startLiveListings();
      }
    });
  }catch(error){
    console.error(error);
    setConnectionStatus("Connection problem — check Firebase setup",true);
    showToast("Firebase connection failed. Check FIREBASE_SETUP.md and your project settings.");
  }
}

document.addEventListener("click",event=>{
  const pageButton = event.target.closest("[data-page]");
  if(pageButton){ navigate(pageButton.dataset.page); return; }
  const detailButton = event.target.closest("[data-detail]");
  if(detailButton){ showDetail(detailButton.dataset.detail); return; }
  const recoverButton = event.target.closest("[data-recover]");
  if(recoverButton){ recoverItem(recoverButton.dataset.recover); return; }
  const filterButton = event.target.closest("[data-filter]");
  if(filterButton){
    activeFilter = filterButton.dataset.filter;
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b===filterButton));
    renderBrowse();
  }
});
$("search-input").addEventListener("input",renderBrowse);
$("category-filter").addEventListener("change",renderBrowse);
$("report-form").addEventListener("submit",handleReport);
$("item-photo").addEventListener("change",e=>handlePhoto(e.target.files[0]));
$("item-date").value = new Date().toISOString().slice(0,10);
renderHome();
boot();

/* CampusConnect light/dark theme */

function applyCampusTheme(theme) {
  const selected = theme === "dark" ? "dark" : "light";

  document.documentElement.dataset.theme = selected;

  const icon = $("theme-icon");
  const button = $("theme-toggle");

  if (icon) {
    icon.textContent = selected === "dark" ? "☀" : "☾";
  }

  if (button) {
    button.setAttribute(
      "aria-label",
      selected === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
    );
  }

  localStorage.setItem("cc-theme", selected);
}

applyCampusTheme(localStorage.getItem("cc-theme") || "light");

$("theme-toggle")?.addEventListener("click", () => {
  const current = document.documentElement.dataset.theme;
  applyCampusTheme(current === "dark" ? "light" : "dark");
});
