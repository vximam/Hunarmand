/* ══════════════════════════════════════════════════════════════
   HUNARMAND ADMIN — CORE JS v4.0 (FIXED)
   No document.write. Sidebar/topbar injected via data-inject attrs.
   ══════════════════════════════════════════════════════════════ */

window.HC = window.HC || {};

/* ══ IMAGE UPLOAD (resize + compress client-side, no server needed) ══ */
HC.readImageFileAsDataURL = function(file, maxDim, callback){
  if (!file) return;
  if (!file.type.match('image.*')) { HC.toast('File must be an image (JPG, PNG, WEBP)','warning'); return; }
  if (file.size > 5*1024*1024) { HC.toast('Image must be under 5MB','warning'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      const max = maxDim || 400;
      if (w > h && w > max) { h = Math.round(h*max/w); w = max; }
      else if (h > max) { w = Math.round(w*max/h); h = max; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      callback(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => HC.toast('Could not read that image','warning');
    img.src = e.target.result;
  };
  reader.onerror = () => HC.toast('Could not read that file','warning');
  reader.readAsDataURL(file);
};
/** Wires a click-to-upload avatar zone. previewImgEl gets its src updated live; onDone(dataUrl) fires after resize. */
HC.wireAvatarUpload = function(zoneId, inputId, previewImgEl, onDone){
  const zone = document.getElementById(zoneId);
  const input = document.getElementById(inputId);
  if (!zone || !input) return;
  zone.onclick = () => input.click();
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    HC.readImageFileAsDataURL(file, 400, (dataUrl) => {
      if (previewImgEl) previewImgEl.src = dataUrl;
      if (onDone) onDone(dataUrl);
    });
  };
};

/* ══ CONFETTI (celebration animation for reviews / job completion) ══ */
HC.confetti = function(){
  const colors = ['#1E5631','#4CAF50','#A4DE02','#FFC107','#2196F3','#E91E63'];
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden';
  document.body.appendChild(container);
  for (let i=0;i<48;i++){
    const p = document.createElement('div');
    const size = 6 + Math.random()*6;
    const startX = Math.random()*100;
    const color = colors[Math.floor(Math.random()*colors.length)];
    const duration = 1.8 + Math.random()*1.4;
    const delay = Math.random()*0.3;
    const rotate = Math.random()*360;
    p.style.cssText = `position:absolute;top:-20px;left:${startX}vw;width:${size}px;height:${size*0.6}px;background:${color};opacity:.9;border-radius:2px;transform:rotate(${rotate}deg);animation:hcConfettiFall ${duration}s ease-in ${delay}s forwards`;
    container.appendChild(p);
  }
  setTimeout(()=>container.remove(), 3500);
};

/* ══ ANIMATED COUNTER (for stat cards) ══ */
HC.animateCounter = function(el, targetText, opts){
  if (!el) return;
  if (el.textContent === String(targetText)) return;
  opts = opts||{};
  const match = String(targetText).match(/-?[\d,]+\.?\d*/);
  if (!match) { el.textContent = targetText; return; }
  const target = parseFloat(match[0].replace(/,/g,''));
  const prefix = targetText.slice(0, match.index);
  const suffix = targetText.slice(match.index + match[0].length);
  const decimals = (match[0].split('.')[1]||'').length;
  const duration = opts.duration || 700;
  const start = performance.now();
  const from = 0;
  function tick(now){
    const p = Math.min(1, (now-start)/duration);
    const eased = 1 - Math.pow(1-p, 3);
    const val = from + (target-from)*eased;
    el.textContent = prefix + val.toLocaleString('en-PK', {minimumFractionDigits:decimals, maximumFractionDigits:decimals}) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
};

/* ══ NOTIFICATION BELL SHAKE (called when a new notif arrives while page is open) ══ */
HC.shakeBell = function(){
  const btn = document.getElementById('hc-notif-btn');
  if (!btn) return;
  btn.classList.remove('bell-shake');
  void btn.offsetWidth;
  btn.classList.add('bell-shake');
};


/* ══ TOAST ══ */
HC.toast = function(msg, type) {
  let el = document.getElementById('hc-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hc-toast';
    el.className = 'toast-bar';
    document.body.appendChild(el);
  }
  const icons = {success:'✓',error:'✕',warning:'⚠',default:'ℹ'};
  el.className = 'toast-bar ' + (type||'default');
  el.innerHTML = `<span>${icons[type]||icons.default}</span><span>${msg}</span>`;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 3400);
};
window.showToast = (m,t) => HC.toast(m,t);

/* ══ MODAL ══ */
HC._modalCb = null;
HC.modal = function(opts) {
  const o = document.getElementById('hc-modal');
  if (!o) return;
  document.getElementById('hc-mi').className = 'modal-ico-wrap ' + (opts.iconType||'');
  document.getElementById('hc-mic').className = opts.icon||'fas fa-info-circle';
  document.getElementById('hc-mt').textContent = opts.title||'';
  document.getElementById('hc-mb').textContent = opts.body||'';
  const fs = document.getElementById('hc-mf');
  if (fs) fs.innerHTML = opts.formHTML||'';
  const ok = document.getElementById('hc-mok');
  if (ok) {
    ok.textContent = opts.confirmText||'Confirm';
    ok.className = 'btn-modal-ok' + (opts.danger?' danger':'');
    ok.onclick = function() { const _r = HC._modalCb ? HC._modalCb() : undefined; if (_r !== false) HC.closeModal(); };
  }
  const cancel = document.getElementById('hc-mcancel');
  if (cancel) cancel.textContent = opts.cancelText||'Cancel';
  HC._modalCb = opts.onConfirm||null;
  const box = document.getElementById('hc-mbox');
  if (box) box.style.maxWidth = opts.wide ? '540px' : '450px';
  o.classList.add('open');
  document.body.style.overflow = 'hidden';
};
HC.closeModal = function() {
  const o = document.getElementById('hc-modal');
  if (o) o.classList.remove('open');
  document.body.style.overflow = '';
  HC._modalCb = null;
};
window.openModal  = (opts) => HC.modal(opts);
window.closeModal = ()     => HC.closeModal();

/* ══ SIDEBAR ══ */
HC.initSidebar = function() {
  const sb  = document.getElementById('hc-sidebar');
  const hbg = document.getElementById('hc-hbg');
  const bk  = document.getElementById('hc-back');
  if (!sb||!hbg) return;
  function open()  { sb.classList.add('open');  if(bk){bk.style.display='block';requestAnimationFrame(()=>bk.classList.add('show'));} hbg.classList.add('open'); }
  function close() { sb.classList.remove('open'); if(bk){bk.classList.remove('show');setTimeout(()=>bk.style.display='none',280);} hbg.classList.remove('open'); }
  hbg.addEventListener('click', ()=> sb.classList.contains('open') ? close() : open());
  if (bk) bk.addEventListener('click', close);
  HC.closeSidebar = close;
};

/* ══ THEME ══ */
HC.initTheme = function() {
  const btn = document.getElementById('hc-theme');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme')||'light';
    const nxt = cur==='dark'?'light':'dark';
    document.documentElement.classList.add('theme-transition');
    document.documentElement.setAttribute('data-theme', nxt);
    localStorage.setItem('hun_theme', nxt);
    setTimeout(()=>document.documentElement.classList.remove('theme-transition'),400);
    HC.toast('Theme: ' + nxt);
  });
  window.addEventListener('storage', e => {
    if (e.key==='hun_theme') {
      document.documentElement.classList.add('theme-transition');
      document.documentElement.setAttribute('data-theme', e.newValue||'light');
      setTimeout(()=>document.documentElement.classList.remove('theme-transition'),400);
    }
  });
};

/* ══ TRANSLATION ENGINE & DICTIONARY ══ */
const TRANSLATIONS = {
  ur: {
    "Dashboard": "ڈیش بورڈ",
    "Workers": "ہنرمند",
    "Users": "صارفین",
    "Management": "انتظامیہ",
    "Reports": "رپورٹس",
    "Analytics": "تجزیات",
    "Approvals": "منظوریاں",
    "Settings": "ترتیبات",
    "Online": "آن لائن",
    "Admin Console": "ایڈمن کنسول",
    "Admin Khan": "ایڈمن خان",
    "Super Admin": "سپر ایڈمن",
    "Logout": "لاگ آؤٹ",
    "Reports Center": "رپورٹ سینٹر",
    "Generate, schedule and download platform reports.": "پلیٹ فارم کی رپورٹس بنائیں، شیڈول کریں اور ڈاؤن لوڈ کریں۔",
    "Custom Report": "اپنی مرضی کی رپورٹ",
    "Quick Generate": "فوری رپورٹ",
    "Weekly Summary": "ہفتہ وار رپورٹ",
    "Worker Activity": "ہنرمندوں کی سرگرمی",
    "Revenue": "آمدنی",
    "Orders": "آرڈرز",
    "Reports Generated": "رپورٹس تیار کی گئیں",
    "Downloads": "ڈاؤن لوڈز",
    "Scheduled": "شیڈول کی گئیں",
    "Templates": "ٹیمپلیٹس",
    "Report History": "رپورٹ کی تاریخ",
    "Recently generated": "حالیہ تیار کردہ",
    "Report": "رپورٹ",
    "Type": "قسم",
    "By": "بذریعہ",
    "Date": "تاریخ",
    "Size": "سائز",
    "Format": "فارمیٹ",
    "Actions": "اقدامات",
    "Generate": "تیار کریں",
    "Platform Analytics": "پلیٹ فارم تجزیات",
    "Real-time insights and performance metrics.": "حقیقی وقت کے تجزیات اور کارکردگی کی پیمائش۔",
    "Export": "ایکسپورٹ",
    "New Users": "نئے صارفین",
    "vs previous period": "پچھلے دور کے مقابلے میں",
    "This month": "اس مہینے",
    "Avg Rating": "اوسط ریٹنگ",
    "Platform-wide": "پلیٹ فارم بھر میں",
    "Monthly Order Volume": "ماہانہ آرڈرز کی تعداد",
    "Orders per month (last 6 months)": "ماہانہ آرڈرز (آخری 6 ماہ)",
    "Jobs by Trade": "پیشوں کے لحاظ سے ملازمتیں",
    "Distribution of service requests": "سروس کی درخواستوں کی تقسیم",
    "Revenue Trend": "آمدنی کا رجحان",
    "Weekly revenue — last 8 weeks": "ہفتہ وار آمدنی — آخری 8 ہفتے",
    "Top Cities": "اعلیٰ شہر",
    "Ranked by order volume": "آرڈرز کی تعداد کے لحاظ سے",
    "Top Performing Workers": "بہترین کارکردگی والے ہنرمند",
    "Ranked by completed orders & rating": "مکمل شدہ آرڈرز اور ریٹنگ کے لحاظ سے",
    "All Workers": "تمام ہنرمند",
    "System Settings": "سسٹم ترتیبات",
    "Configure platform preferences, notifications, security, and appearance.": "پلیٹ فارم کی ترجیحات، اطلاعات، سیکیورٹی اور ظاہری شکل کو ترتیب دیں۔",
    "General": "عمومی",
    "Language & Region": "زبان اور خطہ",
    "Appearance": "ظاہری شکل",
    "Notifications": "اطلاعات",
    "Security": "سیکیورٹی",
    "Worker Rules": "ہنرمندوں کے قوانین",
    "Billing": "بلنگ",
    "Advanced": "ایڈوانسڈ",
    "General Settings": "عمومی ترتیبات",
    "Core platform configuration.": "پلیٹ فارم کی بنیادی ترتیب۔",
    "Platform Name": "پلیٹ فارم کا نام",
    "Shown across the public platform": "عوامی پلیٹ فارم پر دکھایا گیا ہے",
    "Contact Email": "رابطہ ای میل",
    "Primary admin contact": "بنیادی ایڈمن رابطہ",
    "Contact Phone": "رابطہ فون",
    "Displayed on public website": "عوامی ویب سائٹ پر دکھایا گیا ہے",
    "Timezone": "ٹائم زون",
    "All timestamps use this": "تمام اوقات اس کے مطابق ہوں گے",
    "Currency": "کرنسی",
    "Used for pricing & reports": "قیمتوں اور رپورٹس کے لیے استعمال کیا جاتا ہے",
    "Maintenance Mode": "مینٹیننس موڈ",
    "Shows maintenance page to visitors": "زائرین کو دیکھ بھال کا صفحہ دکھاتا ہے",
    "Public Registration": "عوامی رجسٹریشن",
    "Allow new users to self-register": "نئے صارفین کو خود رجسٹر ہونے دیں",
    "Save Changes": "تبدیلیاں محفوظ کریں",
    "Revert": "واپس لیں",
    "Select Language": "زبان منتخب کریں",
    "Date Format": "تاریخ کا فارمیٹ",
    "How dates appear across the panel": "پینل پر تاریخیں کیسے نظر آتی ہیں",
    "Time Format": "وقت کا فارمیٹ",
    "RTL Layout": "دائیں سے بائیں لے آؤٹ",
    "Auto-enabled for Urdu/Arabic scripts": "اردو/عربی اسکرپٹس کے لیے خود کار فعال",
    "SMS Language": "ایس ایم ایس کی زبان",
    "Language for automated worker/client SMS": "خودکار ہنرمند/صارف ایس ایم ایس کی زبان",
    "Save Language Settings": "زبان کی ترتیبات محفوظ کریں",
    "Theme Mode": "تھیم موڈ",
    "Light or dark interface": "ہلکا یا گہرا انٹرفیس",
    "Accent Color": "نمایاں رنگ",
    "Primary brand color": "بنیادی برانڈ کا رنگ",
    "Font Size": "فونٹ سائز",
    "Scale UI text globally": "پورے پینل پر متن کا سائز تبدیل کریں",
    "Animations & Transitions": "اینیمیشن اور ٹرانزیشن",
    "Disable for accessibility or performance": "کارکردگی یا رسائی کے لیے غیر فعال کریں",
    "Compact Sidebar": "چھوٹا سائڈ بار",
    "Show icons-only sidebar": "صرف آئیکنز والا سائڈ بار دکھائیں",
    "Save Appearance": "ظاہری شکل محفوظ کریں",
    "Worker Registry": "ہنرمندوں کی رجسٹری",
    "Verified": "تصدیق شدہ",
    "Pending Approval": "منظوری کے منتظر",
    "Suspended": "معطل شدہ",
    "Add Worker": "ہنرمند شامل کریں",
    "Pending": "زیر التواء",
    "Export CSV": "ایکسپورٹ CSV",
    "Bulk Verify": "بک تصدیق",
    "Message Workers": "ہنرمندوں کو پیغام دیں",
    "Worker": "ہنرمند",
    "Trade": "پیشہ",
    "City": "شہر",
    "Rating": "ریٹنگ",
    "Joined": "شامل ہوئے",
    "User Registry": "صارفین کی رجسٹری",
    "All Users": "تمام صارفین",
    "Active Accounts": "فعال اکاؤنٹس",
    "Blocked": "بلاک شدہ",
    "Avg Orders/User": "اوسط آرڈرز/صارف",
    "Add User": "صارف شامل کریں",
    "Bulk Actions": "بک کارروائیاں",
    "Message Users": "صارفین کو پیغام دیں",
    "User": "صارف",
    "Email": "ای میل",
    "Phone": "فون",
    "Status": "حیثیت",
    "Workers Awaiting Approval": "منظوری کے منتظر ہنرمند",
    "Approval Progress": "منظوری کی پیش رفت",
    "Approve All": "سب منظور کریں",
    "Export List": "فہرست ایکسپورٹ کریں",
    "Approve": "منظور کریں",
    "Reject": "مسترد کریں",
    "View ID": "آئی ڈی دیکھیں",
    "Approve Selected": "منتخب منظور کریں",
    "Reject Selected": "منتخب مسترد کریں",
    "Filter": "فلٹر کریں",
    "Executive Overview": "ایگزیکٹو جائزہ",
    "Quick": "فوری کارروائی",
    "Generate Report": "رپورٹ تیار کریں",
    "Broadcast": "براڈکاسٹ",
    "Total Workers": "کل ہنرمند",
    "Total Clients": "کل صارفین",
    "Active Orders": "فعال آرڈرز",
    "Pending Verifications": "زیر التواء تصدیقیں",
    "Avg Platform Rating": "پلیٹ فارم اوسط ریٹنگ",
    "CNIC Verification": "شناختی کارڈ کی تصدیق",
    "Activity Feed": "سرگرمیوں کی فیڈ",
    "Platform Health": "سسٹم کی صحت",
    "All Operational": "تمام فعال ہیں",
    "Last checked: just now": "آخری بار چیک کیا گیا: ابھی",
    "Refresh": "تازہ کریں",
    "Load More": "مزید لوڈ کریں",
    "All clear!": "سب ٹھیک ہے!",
    "No pending workers in this filter.": "اس فلٹر میں کوئی زیر التواء ہنرمند نہیں ہے۔"
  },
  "en-pk": {
    "Dashboard": "Dashboard",
    "Workers": "Hunarmand",
    "Users": "Users",
    "Management": "Intizamia",
    "Reports": "Reports",
    "Analytics": "Tazye",
    "Approvals": "Manzooriyan",
    "Settings": "Settings",
    "Online": "Online",
    "Admin Console": "Admin Console",
    "Admin Khan": "Admin Khan",
    "Super Admin": "Super Admin",
    "Logout": "Log Out",
    "Reports Center": "Reports Center",
    "Generate, schedule and download platform reports.": "Platform reports banayein aur download karein.",
    "Custom Report": "Custom Report",
    "Quick Generate": "Quick Generate",
    "Weekly Summary": "Haftawar Summary",
    "Worker Activity": "Hunarmand Activity",
    "Revenue": "Kamai (Revenue)",
    "Orders": "Orders",
    "Reports Generated": "Reports Bani",
    "Downloads": "Downloads",
    "Scheduled": "Scheduled",
    "Templates": "Templates",
    "Report History": "Report History",
    "Recently generated": "Haliye bani hui",
    "Report": "Report",
    "Type": "Type",
    "By": "Kiske zariye",
    "Date": "Date",
    "Size": "Size",
    "Format": "Format",
    "Actions": "Actions",
    "Generate": "Banayein",
    "Platform Analytics": "Platform Analytics",
    "Real-time insights and performance metrics.": "Asli waqt ke analytics aur kar kardagi.",
    "Export": "Export",
    "New Users": "Naye Users",
    "vs previous period": "pichle dauran ke mukable",
    "This month": "Is mahine",
    "Avg Rating": "Avg Rating",
    "Platform-wide": "Platform bhar mein",
    "Monthly Order Volume": "Mahana Orders",
    "Orders per month (last 6 months)": "Mahana orders (aakhri 6 mahine)",
    "Jobs by Trade": "Kaam ke hisab se jobs",
    "Distribution of service requests": "Requests ki taqseem",
    "Revenue Trend": "Kamai ka Trend",
    "Weekly revenue — last 8 weeks": "Haftawar kamai — aakhri 8 hafte",
    "Top Cities": "Top Shehar",
    "Ranked by order volume": "Orders ke hisab se",
    "Top Performing Workers": "Behtareen Hunarmand",
    "Ranked by completed orders & rating": "Completed orders aur rating ke hisab se",
    "All Workers": "Sab Hunarmand",
    "System Settings": "System Settings",
    "Configure platform preferences, notifications, security, and appearance.": "Platform settings aur shakal badlein.",
    "General": "Aam Settings",
    "Language & Region": "Zuban aur Ilaka",
    "Appearance": "Shakal (Appearance)",
    "Notifications": "Notif",
    "Security": "Security",
    "Worker Rules": "Hunarmand Rules",
    "Billing": "Billing",
    "Advanced": "Advanced",
    "General Settings": "General Settings",
    "Core platform configuration.": "Platform ki bunyadi settings.",
    "Platform Name": "Platform Ka Naam",
    "Shown across the public platform": "Public ko dikhne wala naam",
    "Contact Email": "Contact Email",
    "Primary admin contact": "Admin ka email",
    "Contact Phone": "Contact Phone",
    "Displayed on public website": "Public website par dikhne wala phone",
    "Timezone": "Timezone",
    "All timestamps use this": "Saare timestamps ispe chalenge",
    "Currency": "Currency",
    "Used for pricing & reports": "Pricing aur reports ke liye",
    "Maintenance Mode": "Maintenance Mode",
    "Shows maintenance page to visitors": "Visitors ko maintenance page dikhayein",
    "Public Registration": "Public Registration",
    "Allow new users to self-register": "Naye users khud register ho sakein",
    "Save Changes": "Save Karein",
    "Revert": "Revert",
    "Select Language": "Zuban Select Karein",
    "Date Format": "Date Format",
    "How dates appear across the panel": "Dates kaise dikhengi",
    "Time Format": "Time Format",
    "RTL Layout": "RTL Layout",
    "Auto-enabled for Urdu/Arabic scripts": "Urdu ke liye khud active hoga",
    "SMS Language": "SMS ki zuban",
    "Language for automated worker/client SMS": "Auto SMS ki zuban",
    "Save Language Settings": "Language Settings Save Karein",
    "Theme Mode": "Theme Mode",
    "Light or dark interface": "Sufaid ya kala theme",
    "Accent Color": "Accent Color",
    "Primary brand color": "Brand ka main rang",
    "Font Size": "Font Size",
    "Scale UI text globally": "Text ka size badlein",
    "Animations & Transitions": "Animations",
    "Disable for accessibility or performance": "Speed ke liye band karein",
    "Compact Sidebar": "Compact Sidebar",
    "Show icons-only sidebar": "Sirf icons wala sidebar",
    "Save Appearance": "Appearance Save Karein",
    "Worker Registry": "Hunarmand Registry",
    "All Workers": "Sab Hunarmand",
    "Verified": "Verified",
    "Pending Approval": "Approval Pending",
    "Suspended": "Suspended",
    "Add Worker": "Add Hunarmand",
    "Pending": "Pending",
    "Export CSV": "Export CSV",
    "Bulk Verify": "Bulk Verify",
    "Message Workers": "Message Workers",
    "Worker": "Hunarmand",
    "Trade": "Kaam",
    "City": "Shehar",
    "Rating": "Rating",
    "Joined": "Joined",
    "User Registry": "User Registry",
    "All Users": "Sab Users",
    "Active Accounts": "Active Accounts",
    "Blocked": "Blocked",
    "Avg Orders/User": "Avg Orders/User",
    "Add User": "Add User",
    "Bulk Actions": "Bulk Actions",
    "Message Users": "Message Users",
    "User": "User",
    "Email": "Email",
    "Phone": "Phone",
    "Status": "Status",
    "Workers Awaiting Approval": "Approval Awaiting Workers",
    "Approval Progress": "Approval Progress",
    "Approve All": "Sub Approve Karein",
    "Export List": "Export List",
    "Approve": "Approve",
    "Reject": "Reject",
    "View ID": "View ID",
    "Approve Selected": "Approve Selected",
    "Reject Selected": "Reject Selected",
    "Filter": "Filter",
    "Executive Overview": "Executive Overview",
    "Quick": "Jaldi",
    "Generate Report": "Generate Report",
    "Broadcast": "Broadcast",
    "Total Workers": "Total Hunarmand",
    "Total Clients": "Total Clients",
    "Active Orders": "Active Orders",
    "Pending Verifications": "Pending Verifications",
    "Avg Platform Rating": "Avg Platform Rating",
    "CNIC Verification": "CNIC Verification",
    "Activity Feed": "Activity Feed",
    "Platform Health": "Platform Health",
    "All Operational": "Sub Sahi Chal Raha Hai",
    "Last checked: just now": "Aakhri baar check kiya: abhi",
    "Refresh": "Taaza Karein",
    "Load More": "Aur Dekhein",
    "All clear!": "Sub Theek Hai!",
    "No pending workers in this filter.": "Koi pending hunarmand nahi hai."
  }
};

HC.translate = function(text) {
  const lang = localStorage.getItem('hun_lang') || 'en';
  if (lang === 'en') return text;
  const dict = TRANSLATIONS[lang];
  return (dict && dict[text.trim()]) || text;
};

HC.translateDOM = function() {
  const lang = localStorage.getItem('hun_lang') || 'en';
  if (lang === 'en') return;
  const dict = TRANSLATIONS[lang];
  if (!dict) return;

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let val = node.nodeValue.trim();
      if (dict[val]) {
        node.nodeValue = node.nodeValue.replace(val, dict[val]);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'TEXTAREA') {
        if (node.placeholder && dict[node.placeholder.trim()]) {
          node.placeholder = dict[node.placeholder.trim()];
        }
        if (node.hasAttribute('title') && dict[node.getAttribute('title').trim()]) {
          node.setAttribute('title', dict[node.getAttribute('title').trim()]);
        }
        for (let child of node.childNodes) {
          walk(child);
        }
      }
    }
  }
  walk(document.body);
};

/* ══ CURRENCY ENGINE ══ */
HC.formatCurrency = function(pkrAmount) {
  const curr = localStorage.getItem('hun_currency') || 'PKR';
  let val = pkrAmount;
  let symbol = 'PKR ';
  if (curr === 'USD') {
    val = pkrAmount / 280;
    symbol = '$';
  } else if (curr === 'AED') {
    val = pkrAmount / 76;
    symbol = 'AED ';
  }

  const formatted = val.toLocaleString(undefined, {
    minimumFractionDigits: curr === 'PKR' ? 0 : 2,
    maximumFractionDigits: curr === 'PKR' ? 0 : 2
  });

  return `${symbol}${formatted}`;
};

HC.updateCurrencyUI = function() {
  const curr = localStorage.getItem('hun_currency') || 'PKR';
  document.querySelectorAll('.stat-lbl, .chart-ttl, .dr-info-lbl, .tbl-title, th, .qa-btn, .breadcrumb-trail, .tbl-sub').forEach(el => {
    if (el.textContent.includes('(PKR)')) {
      el.textContent = el.textContent.replace('(PKR)', `(${curr})`);
    } else if (el.textContent.includes('PKR')) {
      el.textContent = el.textContent.replace('PKR', curr);
    }
  });
  
  const payoutInp = document.querySelector('input[value^="PKR "], input[value^="USD "], input[value^="AED "]');
  if (payoutInp) {
    payoutInp.value = HC.formatCurrency(500);
  }
};

/* ══ TIMEZONE-AWARE DATE/TIME ENGINE ══ */
HC.getFormattedDate = function(dateObj) {
  const tz = localStorage.getItem('hun_timezone') || 'Asia/Karachi';
  const dateFmt = localStorage.getItem('hun_date_format') || 'DD/MM/YYYY';
  const timeFmt = localStorage.getItem('hun_time_format') || '24-hour';

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: timeFmt === '12-hour (AM/PM)'
  }).formatToParts(dateObj || new Date());

  const map = {};
  parts.forEach(p => map[p.type] = p.value);

  let dStr = '';
  if (dateFmt === 'DD/MM/YYYY') {
    dStr = `${map.day}/${map.month}/${map.year}`;
  } else if (dateFmt === 'MM/DD/YYYY') {
    dStr = `${map.month}/${map.day}/${map.year}`;
  } else {
    dStr = `${map.year}-${map.month}-${map.day}`;
  }

  let tStr = '';
  if (timeFmt === '12-hour (AM/PM)') {
    let hr = parseInt(map.hour, 10);
    let period = map.dayPeriod || (hr >= 12 ? 'PM' : 'AM');
    let hr12 = hr % 12 || 12;
    tStr = `${String(hr12).padStart(2,'0')}:${map.minute}:${map.second} ${period}`;
  } else {
    tStr = `${map.hour}:${map.minute}:${map.second}`;
  }

  return { dateStr: dStr, timeStr: tStr, fullStr: `${dStr} • ${tStr}` };
};

/* ══ CLOCK ══ */
HC.initClock = function() {
  function tick() {
    const el = document.getElementById('hc-clock'); if (!el) return;
    const tz = localStorage.getItem('hun_timezone') || 'Asia/Karachi';
    const dateObj = new Date();

    const weekdayName = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(dateObj);
    const fmt = HC.getFormattedDate(dateObj);
    el.innerHTML = `${weekdayName}, ${fmt.fullStr}`;
  }
  tick(); setInterval(tick, 1000);
};

/* ══ SEARCH ══ */
HC.searchData = [];
HC.initSearch = function(data) {
  HC.searchData = data||[];
  const overlay=document.getElementById('hc-search');
  const input=document.getElementById('hc-sinput');
  if (!overlay||!input) return;
  function openS() { overlay.classList.add('open'); document.body.style.overflow='hidden'; setTimeout(()=>input.focus(),120); }
  function closeS() { overlay.classList.remove('open'); document.body.style.overflow=''; input.value=''; document.getElementById('hc-sresults').innerHTML=''; document.getElementById('hc-shint').textContent=HC.translate('Type to search workers, users, pages...'); }
  HC.openSearch=openS; HC.closeSearch=closeS;
  document.getElementById('hc-sbtn')?.addEventListener('click',openS);
  document.getElementById('hc-sclose')?.addEventListener('click',closeS);
  overlay.addEventListener('click',e=>{ if(e.target===overlay)closeS(); });
  input.addEventListener('input',()=>HC.doSearch(input.value));
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openS();}
    if(e.key==='Escape'){closeS();HC.closeModal();}
  });
};
HC.doSearch = function(q) {
  const res=document.getElementById('hc-sresults');
  const hint=document.getElementById('hc-shint');
  if(!res)return;
  const qt=q.trim().toLowerCase();
  if(!qt){res.innerHTML='';if(hint)hint.textContent=HC.translate('Type to search workers, users, pages...');return;}
  const matches=HC.searchData.filter(d=>
    (d.name||'').toLowerCase().includes(qt)||(d.sub||'').toLowerCase().includes(qt)||(d.tag||'').toLowerCase().includes(qt)
  );
  if(hint)hint.textContent=matches.length?`${matches.length} result${matches.length>1?'s':''} found`:`No results for "${q}"`;
  const hl=(t,q)=>{const i=t.toLowerCase().indexOf(q);return i<0?t:t.slice(0,i)+`<b style="color:var(--g1)">${t.slice(i,i+q.length)}</b>`+t.slice(i+q.length);};
  const ini=n=>(n||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  if(!matches.length){res.innerHTML=`<div class="search-empty">🔍 Nothing found</div>`;return;}
  res.innerHTML=matches.map(d=>`
    <div class="s-result" onclick="HC.closeSearch();HC.toast('${HC.translate('Opening')}: ${d.name}')">
      <div class="s-result-av">${ini(d.name)}</div>
      <div><div class="s-result-name">${hl(d.name,qt)}</div><div class="s-result-sub">${d.sub||''}</div></div>
      <span class="s-result-tag">${d.tag||''}</span>
    </div>`).join('');
};

/* ══ NOTIFICATIONS ══ */
HC.clearNotifs = function() {
  const b=document.getElementById('hc-nbadge');
  if(b&&b.style.display!=='none'){b.style.display='none';HC.toast(HC.translate('Notifications cleared'),'success');}
  else HC.toast(HC.translate('No new notifications'));
};

/* ══ COUNTER ANIMATION ══ */
HC.countUp = function(el, end, dur, formatFn) {
  if (!el) return;
  dur = dur||1100;
  const start=performance.now();
  function step(now){
    const p=Math.min((now-start)/dur,1);
    const e=1-Math.pow(1-p,3);
    const val = Math.round(e*end);
    el.textContent=formatFn ? formatFn(val) : val.toLocaleString();
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

/* ══ LOGOUT ══ */
HC.logout = function() {
  HC.modal({icon:'fas fa-arrow-right-from-bracket',iconType:'danger',title:HC.translate('Confirm Logout'),body:HC.translate('You will be signed out of the Hunarmand Admin workspace.'),confirmText:HC.translate('Yes, Logout'),cancelText:HC.translate('Stay'),danger:true,
    onConfirm:()=>{HC.toast(HC.translate('Signing out...')); localStorage.removeItem('currentUser'); setTimeout(()=>window.location.href='auth.html?action=login',900);}
  });
};
window.handleLogout = ()=>HC.logout();

/* ══ CSV EXPORT ══ */
HC.exportCSV = function(rows, filename) {
  const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename||'export.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  HC.toast(HC.translate('CSV exported!'),'success');
};

/* ══ SIDEBAR HTML ══ */
HC.buildSidebar = function(active) {
  const platformName = localStorage.getItem('hun_platform_name') || 'Hunarmand';
  const items = [
    {id:'dashboard',label:HC.translate('Dashboard'),href:'dashboard.html',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'},
    {id:'workers',label:HC.translate('Workers'),href:'workers.html',icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',badge:3},
    {id:'users',label:HC.translate('Users'),href:'users.html',icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'},
    {sep:true,label:HC.translate('Management')},
    {id:'reports',label:HC.translate('Reports'),href:'reports.html',icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>'},
    {id:'analytics',label:HC.translate('Analytics'),href:'reports.html#analytics',icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'},
    {id:'approvals',label:HC.translate('Approvals'),href:'pending-approvals.html',icon:'<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',badge:18},
    {id:'disputes',label:HC.translate('Disputes'),href:'disputes.html',icon:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',badge: (typeof HJ!=='undefined' ? (HJ.openDisputeCount()+HJ.openTicketCount()) : 0) || null},
    {id:'settings',label:HC.translate('Settings'),href:'reports.html#settings',icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'},
  ];
  return `<aside class="sidebar" id="hc-sidebar">
    <div class="sidebar-top">
      <div>
        <div class="brand-name">${platformName}</div>
        <div class="brand-sub">${HC.translate('Admin Console')}</div>
        <span class="brand-badge"><span class="brand-dot"></span>${HC.translate('Online')}</span>
      </div>
      <button class="mob-close" onclick="HC.closeSidebar&&HC.closeSidebar()" aria-label="Close menu">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <nav class="sidebar-nav">
      ${items.map(p=>p.sep?`<div class="nav-lbl">${p.label}</div>`:
        `<a class="nav-item${p.id===active?' active':''}" href="${p.href}" data-page="${p.id}">
          <div class="ni-icon"><svg viewBox="0 0 24 24">${p.icon}</svg></div>
          ${p.label}
          ${p.badge?`<span class="nav-badge">${p.badge}</span>`:''}
        </a>`).join('')}
    </nav>
    <div class="sidebar-bot">
      <div class="profile-chip" onclick="HC.toast('${HC.translate('Profile settings coming soon')}')">
        <div class="p-av">AK</div>
        <div style="flex:1;min-width:0"><div class="p-name">${HC.translate('Admin Khan')}</div><div class="p-role">${HC.translate('Super Admin')}</div></div>
        <span style="color:var(--faint);font-size:.72rem">›</span>
      </div>
      <button class="logout-btn" onclick="handleLogout()">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ${HC.translate('Logout')}
      </button>
    </div>
  </aside>`;
};

/* ══ WORKER SIDEBAR HTML (worker-dashboard.html) ══ */
HC.buildWorkerSidebar = function(active) {
  const platformName = localStorage.getItem('hun_platform_name') || 'Hunarmand';
  const session = JSON.parse(localStorage.getItem('currentUser')||'null') || {name:'Worker'};
  const initials = (session.name||'W').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const items = [
    {id:'dashboard',label:HC.translate('Dashboard'),href:'#dashboard',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'},
    {id:'jobs',label:HC.translate('Job Requests'),href:'#jobs',icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'},
    {id:'mywork',label:HC.translate('My Jobs'),href:'#mywork',icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'},
    {sep:true,label:HC.translate('Account')},
    {id:'earnings',label:HC.translate('Earnings'),href:'#earnings',icon:'<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="18"/>'},
    {id:'reviews',label:HC.translate('Reviews'),href:'#reviews',icon:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'},
    {id:'profile',label:HC.translate('Profile'),href:'#profile',icon:'<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'},
    {id:'settings',label:HC.translate('Settings'),href:'#settings',icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'},
  ];
  return `<aside class="sidebar" id="hc-sidebar">
    <div class="sidebar-top">
      <div>
        <div class="brand-name">${platformName}</div>
        <div class="brand-sub">${HC.translate('Worker Portal')}</div>
        <span class="brand-badge"><span class="brand-dot"></span>${HC.translate('Online')}</span>
      </div>
      <button class="mob-close" onclick="HC.closeSidebar&&HC.closeSidebar()" aria-label="Close menu">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <nav class="sidebar-nav">
      ${items.map(p=>p.sep?`<div class="nav-lbl">${p.label}</div>`:
        `<a class="nav-item${p.id===active?' active':''}" href="${p.href}" data-page="${p.id}" onclick="event.preventDefault();WK.showSection('${p.id}', this)">
          <div class="ni-icon"><svg viewBox="0 0 24 24">${p.icon}</svg></div>
          ${p.label}
        </a>`).join('')}
    </nav>
    <div class="sidebar-bot">
      <div class="profile-chip" onclick="WK.showSection('profile', document.querySelector('[data-page=profile]'))">
        <div class="p-av">${initials}</div>
        <div style="flex:1;min-width:0"><div class="p-name">${session.name||'Worker'}</div><div class="p-role">${HC.translate('Skilled Worker')}</div></div>
        <span style="color:var(--faint);font-size:.72rem">›</span>
      </div>
      <button class="logout-btn" onclick="WK.logout()">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ${HC.translate('Logout')}
      </button>
    </div>
  </aside>`;
};

/* ══ WORKER TOPBAR HTML ══ */
HC.buildWorkerTopbar = function(page, title) {
  return `<header class="topbar">
    <div class="topbar-l">
      <button class="hbg" id="hc-hbg" aria-label="Menu"><span></span><span></span><span></span></button>
      <div>
        <div class="breadcrumb-trail">Worker <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg> <b>${HC.translate(page)}</b></div>
        <div class="topbar-ttl">${HC.translate(title)}</div>
      </div>
    </div>
    <div class="topbar-r">
      <div class="tb-date" id="hc-clock"></div>
      <div style="position:relative">
        <button class="tb-btn" id="hc-notif-btn" title="${HC.translate('Notifications')}" onclick="HC.toggleNotifPanel()">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-badge" id="hc-notif-badge" style="display:none">0</span>
        </button>
        <div id="hc-notif-panel" class="notif-panel" style="display:none"></div>
      </div>
      <button class="tb-btn" id="hc-theme" title="${HC.translate('Toggle theme')}">
        <svg class="ico-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg class="ico-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </header>`;
};

/* ══ WORKER PORTAL INIT ══ */
HC.initWorker = function(pageName, pageTitle, activeNav) {
  const sbSlot = document.getElementById('hc-sidebar-slot');
  if (sbSlot) sbSlot.outerHTML = HC.buildWorkerSidebar(activeNav||pageName);
  const tbSlot = document.getElementById('hc-topbar-slot');
  if (tbSlot) tbSlot.outerHTML = HC.buildWorkerTopbar(pageName, pageTitle);
  if (!document.getElementById('hc-modal')) {
    document.body.insertAdjacentHTML('beforeend', HC.buildOverlays());
  }
  HC.initSidebar();
  HC.initTheme();
  HC.initClock();
  HC.applyGlobalSettings();
  const session = JSON.parse(localStorage.getItem('currentUser')||'null');
  if (session && typeof HJ !== 'undefined') HC.initNotifBell('worker', session.id);
};

/* ══ CLIENT SIDEBAR HTML (indexiii/findworker/booking2/payment) ══ */
HC.buildClientSidebar = function(active) {
  const platformName = localStorage.getItem('hun_platform_name') || 'Hunarmand';
  const session = JSON.parse(localStorage.getItem('currentUser')||'null') || {name:'Client'};
  const initials = (session.name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const items = [
    {id:'dashboard',label:HC.translate('Control Center'),href:'indexiii.html',icon:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'},
    {id:'findworker',label:HC.translate('Find Artisans'),href:'findworker.html',icon:'<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'},
    {id:'bookings',label:HC.translate('My Bookings'),href:'booking2.html',icon:'<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'},
    {sep:true,label:HC.translate('Account')},
    {id:'payment',label:HC.translate('Wallet'),href:'payment.html',icon:'<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" y1="6" x2="12" y2="18"/>'},
    {id:'settings',label:HC.translate('Settings'),href:'settings.html',icon:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'},
    {id:'help',label:HC.translate('Help Center'),href:'help.html',icon:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>'},
  ];
  return `<aside class="sidebar" id="hc-sidebar">
    <div class="sidebar-top">
      <div>
        <div class="brand-name">${platformName}</div>
        <div class="brand-sub">${HC.translate('Client Portal')}</div>
        <span class="brand-badge"><span class="brand-dot"></span>${HC.translate('Online')}</span>
      </div>
      <button class="mob-close" onclick="HC.closeSidebar&&HC.closeSidebar()" aria-label="Close menu">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <nav class="sidebar-nav">
      ${items.map(p=>p.sep?`<div class="nav-lbl">${p.label}</div>`:
        `<a class="nav-item${p.id===active?' active':''}" href="${p.href}" data-page="${p.id}">
          <div class="ni-icon"><svg viewBox="0 0 24 24">${p.icon}</svg></div>
          ${p.label}
        </a>`).join('')}
    </nav>
    <div class="sidebar-bot">
      <div class="profile-chip">
        <div class="p-av">${initials}</div>
        <div style="flex:1;min-width:0"><div class="p-name">${session.name||'Client'}</div><div class="p-role">${HC.translate('Client')}</div></div>
      </div>
      <button class="logout-btn" onclick="HC.clientLogout()">
        <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        ${HC.translate('Logout')}
      </button>
    </div>
  </aside>`;
};

HC.clientLogout = function(){
  HC.modal({icon:'fas fa-arrow-right-from-bracket',iconType:'danger',title:'Confirm Logout',body:'You will be signed out of your Client Portal.',confirmText:'Yes, Logout',cancelText:'Stay',danger:true,
    onConfirm:()=>{ HC.toast('Signing out...'); localStorage.removeItem('currentUser'); setTimeout(()=>window.location.href='auth.html?action=login', 800); }
  });
};

/* ══ CLIENT TOPBAR HTML ══ */
HC.buildClientTopbar = function(page, title) {
  return `<header class="topbar">
    <div class="topbar-l">
      <button class="hbg" id="hc-hbg" aria-label="Menu"><span></span><span></span><span></span></button>
      <div>
        <div class="breadcrumb-trail">Client <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg> <b>${HC.translate(page)}</b></div>
        <div class="topbar-ttl">${HC.translate(title)}</div>
      </div>
    </div>
    <div class="topbar-r">
      <div class="tb-date" id="hc-clock"></div>
      <div style="position:relative">
        <button class="tb-btn" id="hc-notif-btn" title="${HC.translate('Notifications')}" onclick="HC.toggleNotifPanel()">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span class="notif-badge" id="hc-notif-badge" style="display:none">0</span>
        </button>
        <div id="hc-notif-panel" class="notif-panel" style="display:none"></div>
      </div>
      <button class="tb-btn" id="hc-theme" title="${HC.translate('Toggle theme')}">
        <svg class="ico-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg class="ico-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </header>`;
};

/* ══ GENERIC NOTIFICATION BELL (works for any role: 'client' or 'worker') ══ */
HC._notifCtx = { role:'client', id:null };
HC.initNotifBell = function(role, id){
  HC._notifCtx = { role, id };
  HC.renderNotifBadge();
  HC._lastUnreadCount = HJ.unreadCount(role, id);
  document.addEventListener('click', (e)=>{
    const panel = document.getElementById('hc-notif-panel');
    const btn = document.getElementById('hc-notif-btn');
    if (!panel || !btn) return;
    if (panel.style.display!=='none' && !panel.contains(e.target) && !btn.contains(e.target)) {
      panel.style.display = 'none';
    }
  });
  clearInterval(HC._notifPollTimer);
  HC._notifPollTimer = setInterval(()=>{
    const count = HJ.unreadCount(role, id);
    if (count > HC._lastUnreadCount) { HC.shakeBell(); HC.renderNotifBadge(); }
    HC._lastUnreadCount = count;
  }, 2500);
};
HC.renderNotifBadge = function(){
  const { role, id } = HC._notifCtx;
  if (!id) return;
  const count = HJ.unreadCount(role, id);
  const badge = document.getElementById('hc-notif-badge');
  if (badge) { badge.style.display = count ? 'flex' : 'none'; badge.textContent = count>9?'9+':count; }
};
HC.toggleNotifPanel = function(){
  const panel = document.getElementById('hc-notif-panel');
  if (!panel) return;
  const showing = panel.style.display !== 'none';
  if (showing) { panel.style.display = 'none'; return; }
  const { role, id } = HC._notifCtx;
  const list = HJ.getNotifications(role, id);
  panel.innerHTML = `
    <div class="notif-panel-hdr">
      <span>${HC.translate('Notifications')}</span>
      ${list.length ? `<button onclick="HC.markAllNotifsRead()">${HC.translate('Mark all read')}</button>` : ''}
    </div>
    <div class="notif-panel-body">
      ${list.length ? list.map(n=>`
        <div class="notif-row${n.read?'':' unread'}" onclick="HC.handleNotifClick(${n.id},'${(n.link||'').replace(/'/g,"\\'")}')">
          <div class="notif-ico"><i class="fas ${n.icon}"></i></div>
          <div class="notif-txt"><div>${n.text}</div><div class="notif-time">${n.date} · ${n.time}</div></div>
        </div>`).join('') : `<div class="notif-empty">${HC.translate("You're all caught up!")}</div>`}
    </div>`;
  panel.style.display = 'block';
};
HC.markAllNotifsRead = function(){
  const { role, id } = HC._notifCtx;
  HJ.markAllRead(role, id);
  HC.renderNotifBadge();
  HC.toggleNotifPanel(); HC.toggleNotifPanel();
};
HC.handleNotifClick = function(notifId, link){
  const { role, id } = HC._notifCtx;
  HJ.markOneRead(role, id, notifId);
  HC.renderNotifBadge();
  if (link && link.startsWith('#')) {
    const navEl = document.querySelector(`[data-page="${link.slice(1)}"]`);
    if (navEl) { navEl.click(); document.getElementById('hc-notif-panel').style.display='none'; return; }
  }
  if (link && !link.startsWith('#')) { window.location.href = link; return; }
  document.getElementById('hc-notif-panel').style.display = 'none';
};

/* ══════════════════════════════════════════════════════════════
   TEST MODE — instantly switch between Admin / Client / Worker
   using two dedicated, reusable, pre-verified accounts, without
   ever needing to log out and back in.
   ══════════════════════════════════════════════════════════════ */
HC.TEST_CLIENT_ID = 1999999999001;
HC.TEST_WORKER_ID = 1999999999002;

HC.ensureTestAccounts = function(){
  const allUsers = JSON.parse(localStorage.getItem('allUsers')||'[]');
  const allWorkers = JSON.parse(localStorage.getItem('allWorkers')||'[]');

  if (!allUsers.some(u=>u.id===HC.TEST_CLIENT_ID)) {
    allUsers.push({ id:HC.TEST_CLIENT_ID, name:'Test Client', email:'test.client@hunarmand.pk', phone:'0300-0000001', city:'Lahore', status:'active', requests:0, rating:5.0, joined:HJ.niceDate(), gender:'male', image:null });
  }
  if (!allUsers.some(u=>u.id===HC.TEST_WORKER_ID)) {
    allUsers.push({ id:HC.TEST_WORKER_ID, name:'Test Worker', email:'test.worker@hunarmand.pk', phone:'0300-0000002', city:'Lahore', status:'active', requests:0, rating:5.0, joined:HJ.niceDate(), gender:'male', image:null });
  }
  localStorage.setItem('allUsers', JSON.stringify(allUsers));

  if (!allWorkers.some(w=>w.id===HC.TEST_WORKER_ID)) {
    allWorkers.push({ id:HC.TEST_WORKER_ID, name:'Test Worker', email:'test.worker@hunarmand.pk', phone:'0300-0000002', cnic:'00000-0000000-0', skill:'Plumbing', city:'Lahore', status:'verified', statusColor:'green', badge:'Test', date:HJ.niceDate(), image:null });
    localStorage.setItem('allWorkers', JSON.stringify(allWorkers));
  }
  if (!localStorage.getItem(`hun_worker_meta_${HC.TEST_WORKER_ID}`)) {
    HJ.saveWorkerMeta(HC.TEST_WORKER_ID, { ...HJ.WORKER_META_DEFAULTS, bio:'Reusable test account for previewing the worker portal.', experience:'3-5 years', hourlyRate:1000, availability:'online', portfolio:['Testing'] });
  }
};

HC.switchTestRole = function(role){
  if (typeof HJ === 'undefined') { console.error('portal-shared.js not loaded'); return; }
  if (role === 'admin') {
    localStorage.setItem('currentUser', JSON.stringify({ id:0, name:'Super Administrator', email:'adminH001@hunarmand.pk', phone:'N/A', role:'admin', image:null }));
    HC.toast('Switched to Admin view','success');
    setTimeout(()=>window.location.href='dashboard.html', 500);
    return;
  }
  HC.ensureTestAccounts();
  if (role === 'client') {
    localStorage.setItem('currentUser', JSON.stringify({ id:HC.TEST_CLIENT_ID, name:'Test Client', email:'test.client@hunarmand.pk', phone:'0300-0000001', role:'user', image:null }));
    HC.toast('Switched to Test Client view','success');
    setTimeout(()=>window.location.href='indexiii.html', 500);
  } else if (role === 'worker') {
    localStorage.setItem('currentUser', JSON.stringify({ id:HC.TEST_WORKER_ID, name:'Test Worker', email:'test.worker@hunarmand.pk', phone:'0300-0000002', role:'worker', image:null }));
    HC.toast('Switched to Test Worker view','success');
    setTimeout(()=>window.location.href='worker-dashboard.html', 500);
  }
};

HC.renderTestModeBar = function(){
  const existing = document.getElementById('hc-testbar');
  if (localStorage.getItem('hun_test_mode') !== 'true') { existing?.remove(); return; }
  const session = JSON.parse(localStorage.getItem('currentUser')||'null');
  const current = session ? session.role : null;
  const html = `<div id="hc-testbar" class="test-bar">
    <span class="test-bar-lbl"><i class="fas fa-flask"></i> Test Mode</span>
    <button class="test-bar-btn${current==='admin'?' active':''}" onclick="HC.switchTestRole('admin')"><i class="fas fa-user-shield"></i> Admin</button>
    <button class="test-bar-btn${current==='user'?' active':''}" onclick="HC.switchTestRole('client')"><i class="fas fa-user"></i> Client</button>
    <button class="test-bar-btn${current==='worker'?' active':''}" onclick="HC.switchTestRole('worker')"><i class="fas fa-hard-hat"></i> Worker</button>
  </div>`;
  if (existing) { existing.outerHTML = html; } else { document.body.insertAdjacentHTML('beforeend', html); }
};

/* ══ CLIENT PORTAL INIT ══ */
HC.initClient = function(pageName, pageTitle, activeNav) {
  const sbSlot = document.getElementById('hc-sidebar-slot');
  if (sbSlot) sbSlot.outerHTML = HC.buildClientSidebar(activeNav||pageName);
  const tbSlot = document.getElementById('hc-topbar-slot');
  if (tbSlot) tbSlot.outerHTML = HC.buildClientTopbar(pageName, pageTitle);
  if (!document.getElementById('hc-modal')) {
    document.body.insertAdjacentHTML('beforeend', HC.buildOverlays());
  }
  HC.initSidebar();
  HC.initTheme();
  HC.initClock();
  HC.applyGlobalSettings();
  const session = JSON.parse(localStorage.getItem('currentUser')||'null');
  if (session && typeof HJ !== 'undefined') HC.initNotifBell('client', session.id);
};

/* ══ TOPBAR HTML ══ */
HC.buildTopbar = function(page, title) {
  return `<header class="topbar">
    <div class="topbar-l">
      <button class="hbg" id="hc-hbg" aria-label="Menu"><span></span><span></span><span></span></button>
      <div>
        <div class="breadcrumb-trail">Admin <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg> <b>${HC.translate(page)}</b></div>
        <div class="topbar-ttl">${HC.translate(title)}</div>
      </div>
    </div>
    <div class="topbar-r">
      <div class="tb-date" id="hc-clock"></div>
      <button class="tb-btn" id="hc-sbtn" title="${HC.translate('Search')} (Ctrl+K)">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
      <button class="tb-btn" title="${HC.translate('Notifications')}" onclick="HC.clearNotifs()">
        <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <span class="notif-badge" id="hc-nbadge">3</span>
      </button>
      <button class="tb-btn" id="hc-theme" title="${HC.translate('Toggle theme')}">
        <svg class="ico-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg class="ico-moon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
    </div>
  </header>`;
};

/* ══ SHARED OVERLAYS HTML ══ */
HC.buildOverlays = function() {
  return `
  <!-- Backdrop -->
  <div id="hc-back" class="backdrop" style="display:none"></div>

  <!-- Modal scroll fix: overlay scrolls instead of clipping tall forms -->
  <style>
  .modal-overlay{overflow-y:auto!important;align-items:flex-start!important}
  .modal-overlay .modal-box{margin:auto;max-height:none!important;margin-top:1rem;margin-bottom:1rem}
  </style>

  <!-- Modal -->
  <div class="modal-overlay" id="hc-modal">
    <div class="modal-box" id="hc-mbox">
      <button class="modal-close-x" onclick="HC.closeModal()">✕</button>
      <div class="modal-ico-wrap" id="hc-mi"><i id="hc-mic" class="fas fa-check"></i></div>
      <div class="modal-title" id="hc-mt"></div>
      <div class="modal-body" id="hc-mb"></div>
      <div id="hc-mf"></div>
      <div class="modal-actions">
        <button class="btn-modal-cancel" id="hc-mcancel" onclick="HC.closeModal()">${HC.translate('Cancel')}</button>
        <button class="btn-modal-ok" id="hc-mok">${HC.translate('Confirm')}</button>
      </div>
    </div>
  </div>

  <!-- Search Overlay -->
  <div class="search-overlay" id="hc-search">
    <div class="search-box-inner">
      <div class="search-row">
        <input type="text" class="search-input-main" id="hc-sinput" placeholder="${HC.translate('Search workers, users, pages...')} (Ctrl+K)" autocomplete="off">
        <button class="search-close" id="hc-sclose">✕</button>
      </div>
      <div class="search-hint" id="hc-shint">${HC.translate('Type to search workers, users, pages...')}</div>
      <div class="search-results" id="hc-sresults"></div>
    </div>
  </div>`;
};

/* ══ GLOBAL PREFERENCES APPLICATION ══ */
HC.applyGlobalSettings = function() {
  const theme = localStorage.getItem('hun_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtnLight = document.getElementById('btnLight');
  const themeBtnDark = document.getElementById('btnDark');
  const themeBtnAuto = document.getElementById('btnAuto');
  if (themeBtnLight && themeBtnDark && themeBtnAuto) {
    document.querySelectorAll('#btnLight,#btnDark,#btnAuto').forEach(b => b.className = 'qa-btn');
    if (theme === 'light') themeBtnLight.className = 'qa-btn primary';
    else if (theme === 'dark') themeBtnDark.className = 'qa-btn primary';
  }

  const accent = localStorage.getItem('hun_accent_color');
  if (accent) {
    document.documentElement.style.setProperty('--g1', accent);
  }

  const fontSize = localStorage.getItem('hun_font_size') || 'md';
  const m = { sm: '14px', md: '16px', lg: '18px' };
  document.documentElement.style.fontSize = m[fontSize] || '16px';

  const anims = localStorage.getItem('hun_animations') !== 'false';
  const id = 'no-anim-style';
  if (!anims) {
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = '*{animation-duration:.001ms!important;transition-duration:.001ms!important}';
      document.head.appendChild(s);
    }
  } else {
    document.getElementById(id)?.remove();
  }

  const compact = localStorage.getItem('hun_compact_sidebar') === 'true';
  const sb = document.getElementById('hc-sidebar');
  const isRtl = localStorage.getItem('hun_lang') === 'ur';
  if (sb) {
    sb.style.width = compact ? '62px' : 'var(--sidebar)';
    if (isRtl) {
      sb.style.left = 'auto';
      sb.style.right = '0';
      sb.style.borderRight = 'none';
      sb.style.borderLeft = '1px solid var(--bdr)';
    } else {
      sb.style.left = '0';
      sb.style.right = 'auto';
      sb.style.borderRight = '1px solid var(--bdr)';
      sb.style.borderLeft = 'none';
    }
    
    const mc = document.getElementById('mainContent') || document.querySelector('.main-content');
    if (mc) {
      if (isRtl) {
        mc.style.marginLeft = '0';
        mc.style.marginRight = compact ? '62px' : 'var(--sidebar)';
      } else {
        mc.style.marginRight = '0';
        mc.style.marginLeft = compact ? '62px' : 'var(--sidebar)';
      }
    }
  }

  const lang = localStorage.getItem('hun_lang') || 'en';
  document.documentElement.setAttribute('data-lang', lang);
  if (lang === 'ur') {
    document.documentElement.setAttribute('dir', 'rtl');
  } else {
    document.documentElement.removeAttribute('dir');
  }
  
  if (accent) {
    const activeSwatch = document.querySelector(`.swatch[style*="${accent}"]`);
    if (activeSwatch) {
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      activeSwatch.classList.add('active');
    }
  }

  document.querySelectorAll('#langCards .lang-card').forEach(c => {
    c.classList.remove('active');
    if (c.getAttribute('onclick')?.includes(`'${lang}'`)) {
      c.classList.add('active');
    }
  });

  HC.updateCurrencyUI();
  HC.translateDOM();
  HC.renderTestModeBar();
};

/* ══ PAGE INIT ══ */
HC.init = function(pageName, pageTitle, activeNav, searchData) {
  // Inject sidebar
  const sbSlot = document.getElementById('hc-sidebar-slot');
  if (sbSlot) sbSlot.outerHTML = HC.buildSidebar(activeNav||pageName);
  // Inject topbar
  const tbSlot = document.getElementById('hc-topbar-slot');
  if (tbSlot) tbSlot.outerHTML = HC.buildTopbar(pageName, pageTitle);
  // Inject overlays once
  if (!document.getElementById('hc-modal')) {
    document.body.insertAdjacentHTML('beforeend', HC.buildOverlays());
  }
  HC.initSidebar();
  HC.initTheme();
  HC.initClock();
  HC.initSearch(searchData||[]);
  HC.applyGlobalSettings();
};
