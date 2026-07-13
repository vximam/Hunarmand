/**
 * Hunarmand Portal Shared Data Layer (portal-shared.js)
 * Single source of truth shared between the Client Portal, the Worker
 * Portal, and the Admin panel — jobs, stages, reviews, notifications,
 * payment methods, and profile data all live here so an action on one
 * side (request a job, accept it, advance a stage, leave a review,
 * verify a worker) is immediately reflected everywhere else.
 */
const HJ = {};

/* ═══════════════ MONEY ═══════════════ */
HJ.money = n => 'Rs. ' + Math.abs(Math.round(n||0)).toLocaleString('en-PK');
HJ.moneySigned = n => (n<0 ? '-' : '') + HJ.money(n);
HJ.niceDate = () => new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
HJ.niceTime = () => new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});

/* ═══════════════ JOBS ═══════════════ */
HJ.getJobs = () => JSON.parse(localStorage.getItem('hun_jobs') || '[]');
HJ.saveJobs = (jobs) => localStorage.setItem('hun_jobs', JSON.stringify(jobs));

HJ.forClient = (clientId) => HJ.getJobs().filter(j => j.clientId === clientId).sort((a,b)=>b.createdAtMs-a.createdAtMs);
HJ.forWorkerRequests = (workerId) => HJ.getJobs().filter(j => j.workerId === workerId && j.status === 'requested').sort((a,b)=>b.createdAtMs-a.createdAtMs);
HJ.forWorkerActive = (workerId) => HJ.getJobs().filter(j => j.workerId === workerId && j.status !== 'requested' && j.status !== 'declined').sort((a,b)=>b.createdAtMs-a.createdAtMs);

/* Job stage order — used to render a 4-step progress tracker on bookings */
HJ.STAGES = ['requested','accepted','in_progress','completed'];
HJ.STAGE_LABEL = { requested:'Requested', accepted:'Accepted', in_progress:'Work Started', completed:'Completed' };
HJ.stageIndex = (status) => HJ.STAGES.indexOf(status);

/* Client requests a specific worker for a service */
HJ.createRequest = ({clientId, clientName, clientImage, workerId, workerName, workerImage, service, skill, city, address, budget, description, preferredDate, timeWindow, photoUrl, urgent}) => {
  const jobs = HJ.getJobs();
  const job = {
    id: Date.now() + Math.floor(Math.random()*1000),
    clientId, clientName, clientImage: clientImage||null,
    workerId, workerName, workerImage: workerImage||null,
    service, skill: skill||'General', city, address: address||'', budget: Number(budget)||0, description: description||'',
    preferredDate: preferredDate||null, timeWindow: timeWindow||'Any time', photoUrl: photoUrl||null, urgent: !!urgent,
    status: 'requested',
    createdAt: HJ.niceDate(), createdAtMs: Date.now(),
    acceptedAt: null, startedAt: null, completedAt: null,
    reviewed: false, rating: null, reviewComment: null
  };
  jobs.unshift(job);
  HJ.saveJobs(jobs);
  HJ.notify('worker', workerId, { icon:'fa-bell', text:`${urgent?'🔴 Urgent request':'New request'} from ${clientName}: "${service}"`, link:'#jobs' });
  return job;
};

HJ.accept = (jobId) => {
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (!j) return null;
  j.status = 'accepted';
  j.acceptedAt = HJ.niceDate();
  HJ.saveJobs(jobs);
  HJ.notify('client', j.clientId, { icon:'fa-circle-check', text:`${j.workerName} accepted your request: "${j.service}"`, link:'booking2.html' });
  return j;
};

HJ.start = (jobId) => {
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (!j) return null;
  j.status = 'in_progress';
  j.startedAt = HJ.niceDate();
  j.startedAtMs = Date.now();
  HJ.saveJobs(jobs);
  HJ.notify('client', j.clientId, { icon:'fa-person-digging', text:`${j.workerName} started work on "${j.service}"`, link:'booking2.html' });
  return j;
};

HJ.decline = (jobId) => {
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (!j) return null;
  j.status = 'declined';
  HJ.saveJobs(jobs);
  HJ.notify('client', j.clientId, { icon:'fa-xmark', text:`${j.workerName} declined your request: "${j.service}"`, link:'booking2.html' });
  return j;
};

HJ.cancel = (jobId) => {
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (!j) return null;
  j.status = 'cancelled';
  HJ.saveJobs(jobs);
  HJ.notify('worker', j.workerId, { icon:'fa-ban', text:`${j.clientName} cancelled the request: "${j.service}"`, link:'#jobs' });
  return j;
};

/* Worker marks a job complete: auto-settles payment on both ledgers, minus platform commission */
HJ.PLATFORM_COMMISSION_RATE = 0.10;
HJ.complete = (jobId) => {
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (!j) return null;
  j.status = 'completed';
  j.completedAt = HJ.niceDate();
  HJ.saveJobs(jobs);
  const commission = Math.round(j.budget * HJ.PLATFORM_COMMISSION_RATE);
  const workerPayout = j.budget - commission;
  HJ.addLedgerEntry('worker', j.workerId, `Payment received — ${j.service} (after ${Math.round(HJ.PLATFORM_COMMISSION_RATE*100)}% platform fee)`, workerPayout);
  HJ.addLedgerEntry('client', j.clientId, `Payment for ${j.service} (${j.workerName})`, -j.budget);
  HJ.addPlatformRevenue(j.id, commission, j.service);
  HJ.bumpCompletedCount(j.workerId);
  HJ.notify('client', j.clientId, { icon:'fa-flag-checkered', text:`"${j.service}" marked complete. Payment settled — rate your experience!`, link:'booking2.html' });
  HJ.notify('worker', j.workerId, { icon:'fa-wallet', text:`${HJ.money(workerPayout)} added to your wallet for "${j.service}"`, link:'#earnings' });
  return j;
};

HJ.statusBadge = (status) => ({
  requested: '<span class="badge amber">⏳ Requested</span>',
  accepted: '<span class="badge blue">Accepted</span>',
  in_progress: '<span class="badge blue">Work Started</span>',
  completed: '<span class="badge green">✓ Completed</span>',
  declined: '<span class="badge red">Declined</span>',
  cancelled: '<span class="badge gray">Cancelled</span>',
}[status] || `<span class="badge gray">${status}</span>`);

/* ═══════════════ LEDGER / WALLET ═══════════════ */
HJ.getLedger = (role, id) => JSON.parse(localStorage.getItem(`hun_ledger_${role}_${id}`) || '[]');
HJ.saveLedger = (role, id, ledger) => localStorage.setItem(`hun_ledger_${role}_${id}`, JSON.stringify(ledger));
HJ.addLedgerEntry = (role, id, desc, amount, method) => {
  const l = HJ.getLedger(role, id);
  l.unshift({ desc, amount, method: method||null, date: HJ.niceDate() });
  HJ.saveLedger(role, id, l);
};
HJ.walletBalance = (role, id) => HJ.getLedger(role, id).reduce((s,t)=>s+t.amount,0);

/* ═══════════════ PAYMENT METHODS (EasyPaisa / JazzCash / Bank) ═══════════════ */
HJ.PAYMENT_BRANDS = {
  easypaisa: { label:'EasyPaisa', color:'#2E7D32', bg:'#E8F5E9', icon:'fa-mobile-screen-button' },
  jazzcash:  { label:'JazzCash',  color:'#C8102E', bg:'#FDEAEC', icon:'fa-mobile-screen-button' },
  bank:      { label:'Bank Account', color:'#1565C0', bg:'#E3F2FD', icon:'fa-building-columns' },
};
HJ.getPaymentMethods = (role, id) => JSON.parse(localStorage.getItem(`hun_paymethods_${role}_${id}`) || '[]');
HJ.savePaymentMethods = (role, id, methods) => localStorage.setItem(`hun_paymethods_${role}_${id}`, JSON.stringify(methods));
HJ.linkPaymentMethod = (role, id, type, number) => {
  const methods = HJ.getPaymentMethods(role, id).filter(m=>m.type!==type);
  methods.push({ type, number, linkedAt: HJ.niceDate() });
  HJ.savePaymentMethods(role, id, methods);
  return methods;
};
HJ.unlinkPaymentMethod = (role, id, type) => {
  HJ.savePaymentMethods(role, id, HJ.getPaymentMethods(role, id).filter(m=>m.type!==type));
};
HJ.maskAccount = (number) => number && number.length>4 ? number.slice(0,3)+'••••'+number.slice(-2) : number;

/* ═══════════════ NOTIFICATIONS ═══════════════ */
HJ.getNotifications = (role, id) => JSON.parse(localStorage.getItem(`hun_notifs_${role}_${id}`) || '[]');
HJ.saveNotifications = (role, id, list) => localStorage.setItem(`hun_notifs_${role}_${id}`, JSON.stringify(list));
HJ.notify = (role, id, { icon, text, link }) => {
  if (!id) return;
  const list = HJ.getNotifications(role, id);
  list.unshift({ id: Date.now()+Math.floor(Math.random()*1000), icon: icon||'fa-bell', text, link: link||null, read:false, date: HJ.niceDate(), time: HJ.niceTime() });
  HJ.saveNotifications(role, id, list.slice(0,50));
};
HJ.unreadCount = (role, id) => HJ.getNotifications(role, id).filter(n=>!n.read).length;
HJ.markAllRead = (role, id) => {
  const list = HJ.getNotifications(role, id).map(n=>({...n, read:true}));
  HJ.saveNotifications(role, id, list);
};
HJ.markOneRead = (role, id, notifId) => {
  const list = HJ.getNotifications(role, id).map(n=> n.id===notifId ? {...n, read:true} : n);
  HJ.saveNotifications(role, id, list);
};

/* ═══════════════ REVIEWS & RATINGS ═══════════════ */
HJ.getReviews = (workerId) => JSON.parse(localStorage.getItem(`hun_reviews_worker_${workerId}`) || '[]');
HJ.addReview = (jobId, rating, comment) => {
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (!j || j.reviewed) return null;
  j.reviewed = true; j.rating = rating; j.reviewComment = comment||'';
  HJ.saveJobs(jobs);
  const reviews = HJ.getReviews(j.workerId);
  reviews.unshift({ clientName: j.clientName, rating, comment: comment||'', service: j.service, date: HJ.niceDate() });
  localStorage.setItem(`hun_reviews_worker_${j.workerId}`, JSON.stringify(reviews));
  HJ.recalcRating(j.workerId);
  HJ.notify('worker', j.workerId, { icon:'fa-star', text:`${j.clientName} left you a ${rating}-star review`, link:'#profile' });
  return j;
};
HJ.recalcRating = (workerId) => {
  const reviews = HJ.getReviews(workerId);
  const meta = HJ.getWorkerMeta(workerId);
  meta.avgRating = reviews.length ? +(reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : 5.0;
  meta.reviewCount = reviews.length;
  HJ.saveWorkerMeta(workerId, meta);
};
HJ.bumpCompletedCount = (workerId) => {
  const meta = HJ.getWorkerMeta(workerId);
  meta.completedJobs = (meta.completedJobs||0) + 1;
  HJ.saveWorkerMeta(workerId, meta);
};

/* ═══════════════ WORKER PROFILE META (bio, rate, availability, portfolio) ═══════════════ */
HJ.WORKER_META_DEFAULTS = { bio:'', experience:'1-2 years', hourlyRate:0, availability:'online', portfolio:[], avgRating:5.0, reviewCount:0, completedJobs:0, responseTime:'Within a few hours' };
HJ.getWorkerMeta = (workerId) => {
  const raw = localStorage.getItem(`hun_worker_meta_${workerId}`);
  return raw ? { ...HJ.WORKER_META_DEFAULTS, ...JSON.parse(raw) } : { ...HJ.WORKER_META_DEFAULTS };
};
HJ.saveWorkerMeta = (workerId, meta) => localStorage.setItem(`hun_worker_meta_${workerId}`, JSON.stringify(meta));

HJ.AVAILABILITY = {
  online:  { label:'Available',  color:'#2E7D32', dot:'#43A047' },
  busy:    { label:'Busy',       color:'#B26A00', dot:'#F5A623' },
  working: { label:'On a Job',   color:'#1565C0', dot:'#3B82F6' },
  offline: { label:'Offline',    color:'#78716C', dot:'#A8A29E' },
};

/* ═══════════════ CLIENT PROFILE META ═══════════════ */
HJ.CLIENT_META_DEFAULTS = { bio:'', address:'', avatar:null };
HJ.getClientMeta = (clientId) => {
  const raw = localStorage.getItem(`hun_client_meta_${clientId}`);
  return raw ? { ...HJ.CLIENT_META_DEFAULTS, ...JSON.parse(raw) } : { ...HJ.CLIENT_META_DEFAULTS };
};
HJ.saveClientMeta = (clientId, meta) => localStorage.setItem(`hun_client_meta_${clientId}`, JSON.stringify(meta));

/* ═══════════════ PRICE FAIRNESS ═══════════════ */
HJ.MARKET_RATES = {
  'Plumbing':        { min:800,  avg:1800, max:5000 },
  'Electrical':      { min:700,  avg:1600, max:4500 },
  'Carpentry':       { min:1000, avg:2400, max:8000 },
  'HVAC':            { min:1500, avg:3200, max:9000 },
  'Painting':        { min:1200, avg:2800, max:7000 },
  'Cleaning':        { min:500,  avg:1200, max:3500 },
  'Appliance Repair':{ min:600,  avg:1500, max:4000 },
  'Security':        { min:1000, avg:2500, max:8000 },
  'Welder':          { min:800,  avg:2000, max:6000 },
  'Driver':          { min:400,  avg:900,  max:2500 },
  'General':         { min:500,  avg:1400, max:4000 },
};
HJ.priceFairness = (skill, budget) => {
  const rate = HJ.MARKET_RATES[skill] || HJ.MARKET_RATES['General'];
  const b = Number(budget)||0;
  if (b <= 0) return null;
  if (b < rate.min) return { level:'low', message:`This is below the typical range (${HJ.money(rate.min)}–${HJ.money(rate.max)}). Workers may be less likely to accept.`, rate };
  if (b > rate.max) return { level:'high', message:`This is above the typical range (${HJ.money(rate.min)}–${HJ.money(rate.max)}). Generous, but you may be overpaying.`, rate };
  return { level:'fair', message:`Fair price — typical range for this service is ${HJ.money(rate.min)}–${HJ.money(rate.max)}.`, rate };
};

/* ═══════════════ GEOLOCATION ═══════════════ */
HJ.CITY_COORDS = {
  'Lahore':    {lat:31.5497, lng:74.3436},
  'Karachi':   {lat:24.8607, lng:67.0011},
  'Islamabad': {lat:33.6844, lng:73.0479},
  'Rawalpindi':{lat:33.5651, lng:73.0169},
  'Faisalabad':{lat:31.4504, lng:73.1350},
  'Multan':    {lat:30.1575, lng:71.5249},
  'Peshawar':  {lat:34.0151, lng:71.5249},
  'Quetta':    {lat:30.1798, lng:66.9750},
};
HJ.haversine = (lat1,lng1,lat2,lng2) => {
  const R=6371, toRad=d=>d*Math.PI/180;
  const dLat=toRad(lat2-lat1), dLng=toRad(lng2-lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};
HJ.nearestCity = (lat, lng) => {
  let best = null, bestDist = Infinity;
  for (const [city, c] of Object.entries(HJ.CITY_COORDS)) {
    const d = HJ.haversine(lat, lng, c.lat, c.lng);
    if (d < bestDist) { bestDist = d; best = city; }
  }
  return best;
};

/* ═══════════════ MESSAGING (per-job chat thread) ═══════════════ */
HJ.getMessages = (jobId) => JSON.parse(localStorage.getItem(`hun_msgs_${jobId}`) || '[]');
HJ.sendMessage = (jobId, sender, senderName, text) => {
  const msgs = HJ.getMessages(jobId);
  msgs.push({ sender, senderName, text, date: HJ.niceDate(), time: HJ.niceTime() });
  localStorage.setItem(`hun_msgs_${jobId}`, JSON.stringify(msgs));
  const jobs = HJ.getJobs();
  const j = jobs.find(x=>x.id===jobId);
  if (j) {
    const toRole = sender === 'client' ? 'worker' : 'client';
    const toId = sender === 'client' ? j.workerId : j.clientId;
    HJ.notify(toRole, toId, { icon:'fa-comment', text:`${senderName}: "${text.slice(0,60)}${text.length>60?'…':''}"`, link: toRole==='client' ? 'booking2.html' : '#jobs' });
  }
  return msgs;
};
HJ.unreadMessageCount = (jobId, myRole) => HJ.getMessages(jobId).filter(m=>m.sender!==myRole && !m.readBy?.includes(myRole)).length;

/* ═══════════════ FAVORITES (saved artisans) ═══════════════ */
HJ.getFavorites = (clientId) => JSON.parse(localStorage.getItem(`hun_favorites_${clientId}`) || '[]');
HJ.isFavorite = (clientId, workerId) => HJ.getFavorites(clientId).includes(workerId);
HJ.toggleFavorite = (clientId, workerId) => {
  let favs = HJ.getFavorites(clientId);
  if (favs.includes(workerId)) favs = favs.filter(id=>id!==workerId);
  else favs.push(workerId);
  localStorage.setItem(`hun_favorites_${clientId}`, JSON.stringify(favs));
  return favs.includes(workerId);
};

/* ═══════════════ ADDRESS BOOK ═══════════════ */
HJ.getAddresses = (clientId) => JSON.parse(localStorage.getItem(`hun_addresses_${clientId}`) || '[]');
HJ.saveAddresses = (clientId, list) => localStorage.setItem(`hun_addresses_${clientId}`, JSON.stringify(list));
HJ.addAddress = (clientId, label, address, city) => {
  const list = HJ.getAddresses(clientId);
  list.push({ id: Date.now(), label, address, city });
  HJ.saveAddresses(clientId, list);
  return list;
};
HJ.removeAddress = (clientId, id) => {
  HJ.saveAddresses(clientId, HJ.getAddresses(clientId).filter(a=>a.id!==id));
};

/* ═══════════════ PROMO CODES ═══════════════ */
HJ.PROMO_CODES = {
  'WELCOME500': { amount: 500, desc: 'Welcome bonus', oneTime: true },
  'HUNAR200':   { amount: 200, desc: 'Hunarmand loyalty credit', oneTime: true },
};
HJ.getRedeemedCodes = (clientId) => JSON.parse(localStorage.getItem(`hun_promos_${clientId}`) || '[]');
HJ.redeemPromoCode = (clientId, code) => {
  const upper = (code||'').trim().toUpperCase();
  const promo = HJ.PROMO_CODES[upper];
  if (!promo) return { ok:false, message:'Invalid promo code.' };
  const redeemed = HJ.getRedeemedCodes(clientId);
  if (promo.oneTime && redeemed.includes(upper)) return { ok:false, message:'You already redeemed this code.' };
  HJ.addLedgerEntry('client', clientId, `Promo code: ${upper} (${promo.desc})`, promo.amount);
  redeemed.push(upper);
  localStorage.setItem(`hun_promos_${clientId}`, JSON.stringify(redeemed));
  return { ok:true, amount: promo.amount, message:`✓ ${HJ.money(promo.amount)} added to your wallet!` };
};

/* ═══════════════ ADMIN BROADCASTS ═══════════════ */
HJ.broadcastToAllClients = (text, icon) => {
  const allUsers = JSON.parse(localStorage.getItem('allUsers')||'[]');
  allUsers.forEach(u => HJ.notify('client', u.id, { icon: icon||'fa-bullhorn', text, link: null }));
};
HJ.broadcastToAllWorkers = (text, icon) => {
  const allWorkers = JSON.parse(localStorage.getItem('allWorkers')||'[]');
  allWorkers.forEach(w => HJ.notify('worker', w.id, { icon: icon||'fa-bullhorn', text, link: null }));
};

/* ═══════════════ DISPUTES / REPORT AN ISSUE ═══════════════ */
HJ.DISPUTE_REASONS = ['No-show', 'Poor quality of work', 'Overcharged', 'Unprofessional behavior', 'Damaged property', 'Other'];
HJ.getDisputes = () => JSON.parse(localStorage.getItem('hun_disputes') || '[]');
HJ.saveDisputes = (list) => localStorage.setItem('hun_disputes', JSON.stringify(list));
HJ.fileDispute = (jobId, reason, description) => {
  const job = HJ.getJobs().find(j=>j.id===jobId);
  if (!job) return null;
  const disputes = HJ.getDisputes();
  const dispute = { id: Date.now()+Math.floor(Math.random()*1000), jobId, clientId: job.clientId, clientName: job.clientName, workerId: job.workerId, workerName: job.workerName, service: job.service, budget: job.budget, reason, description: description||'', status: 'open', createdAt: HJ.niceDate(), resolution: null, resolutionNote: '' };
  disputes.unshift(dispute);
  HJ.saveDisputes(disputes);
  return dispute;
};
HJ.resolveDispute = (disputeId, resolution, note) => {
  const disputes = HJ.getDisputes();
  const d = disputes.find(x=>x.id===disputeId);
  if (!d) return null;
  d.status = 'resolved'; d.resolution = resolution; d.resolutionNote = note||''; d.resolvedAt = HJ.niceDate();
  HJ.saveDisputes(disputes);
  if (resolution === 'Refund issued') {
    HJ.addLedgerEntry('client', d.clientId, `Refund — ${d.service} (dispute resolved)`, d.budget);
  }
  HJ.notify('client', d.clientId, { icon:'fa-gavel', text:`Your report on "${d.service}" was resolved: ${resolution}`, link:'booking2.html' });
  return d;
};
HJ.openDisputeCount = () => HJ.getDisputes().filter(d=>d.status==='open').length;
HJ.hasDispute = (jobId) => HJ.getDisputes().some(d=>d.jobId===jobId);
HJ.disputeForJob = (jobId) => HJ.getDisputes().find(d=>d.jobId===jobId);

/* ═══════════════ SUPPORT TICKETS (Help Center) ═══════════════ */
HJ.getSupportTickets = () => JSON.parse(localStorage.getItem('hun_support_tickets') || '[]');
HJ.fileSupportTicket = (clientId, clientName, subject, message) => {
  const list = HJ.getSupportTickets();
  const ticket = { id: Date.now()+Math.floor(Math.random()*1000), clientId, clientName, subject, message, status:'open', createdAt: HJ.niceDate() };
  list.unshift(ticket);
  localStorage.setItem('hun_support_tickets', JSON.stringify(list));
  return ticket;
};
HJ.resolveSupportTicket = (ticketId, reply) => {
  const list = HJ.getSupportTickets();
  const t = list.find(x=>x.id===ticketId);
  if (!t) return null;
  t.status='resolved'; t.reply=reply||''; t.resolvedAt=HJ.niceDate();
  localStorage.setItem('hun_support_tickets', JSON.stringify(list));
  HJ.notify('client', t.clientId, { icon:'fa-headset', text:`Support replied to "${t.subject}"`, link:null });
  return t;
};
HJ.openTicketCount = () => HJ.getSupportTickets().filter(t=>t.status==='open').length;

/* ═══════════════ REFERRAL PROGRAM ═══════════════ */
HJ.REFERRAL_BONUS = 300;
HJ.getReferralCode = (clientId, name) => {
  const base = (name||'USER').replace(/[^A-Za-z]/g,'').toUpperCase().slice(0,5) || 'USER';
  return base + String(clientId).slice(-4);
};
HJ.getReferralData = (clientId) => JSON.parse(localStorage.getItem(`hun_referrals_${clientId}`) || '{"referred":[],"earned":0}');
HJ.saveReferralData = (clientId, data) => localStorage.setItem(`hun_referrals_${clientId}`, JSON.stringify(data));
HJ.applyReferral = (newClientId, newClientName, referralCode) => {
  if (!referralCode) return false;
  const allUsers = JSON.parse(localStorage.getItem('allUsers')||'[]');
  const referrer = allUsers.find(u => HJ.getReferralCode(u.id, u.name) === referralCode.toUpperCase());
  if (!referrer || referrer.id === newClientId) return false;
  const data = HJ.getReferralData(referrer.id);
  if (data.referred.some(r=>r.id===newClientId)) return false;
  data.referred.push({ id:newClientId, name:newClientName, date:HJ.niceDate() });
  data.earned += HJ.REFERRAL_BONUS;
  HJ.saveReferralData(referrer.id, data);
  HJ.addLedgerEntry('client', referrer.id, `Referral bonus — ${newClientName} joined Hunarmand`, HJ.REFERRAL_BONUS);
  HJ.addLedgerEntry('client', newClientId, `Welcome bonus (referred by ${referrer.name})`, HJ.REFERRAL_BONUS);
  HJ.notify('client', referrer.id, { icon:'fa-user-plus', text:`🎉 ${newClientName} joined using your referral link! +${HJ.money(HJ.REFERRAL_BONUS)}`, link:'settings.html' });
  return true;
};

/* ═══════════════ PLATFORM REVENUE (commission) ═══════════════ */
HJ.getPlatformRevenue = () => JSON.parse(localStorage.getItem('hun_platform_revenue') || '[]');
HJ.addPlatformRevenue = (jobId, amount, service) => {
  const list = HJ.getPlatformRevenue();
  list.unshift({ jobId, amount, service, date: HJ.niceDate(), dateMs: Date.now() });
  localStorage.setItem('hun_platform_revenue', JSON.stringify(list));
};
HJ.totalPlatformRevenue = () => HJ.getPlatformRevenue().reduce((s,r)=>s+r.amount,0);

/* ═══════════════ LIVE ORDER TRACKING (simulated stages from real elapsed time) ═══════════════ */
HJ.TRACKING_STAGES = [
  { key:'heading', label:'Artisan is heading your way', icon:'fa-route', afterSec:0 },
  { key:'arrived', label:'Arrived — setting up', icon:'fa-location-dot', afterSec:12 },
  { key:'working', label:'Work in progress', icon:'fa-screwdriver-wrench', afterSec:30 },
  { key:'wrapping', label:'Wrapping up', icon:'fa-broom', afterSec:60 },
];
HJ.getTrackingStage = (job) => {
  if (job.status!=='in_progress') return null;
  const startedMs = job.startedAtMs || job.createdAtMs;
  const elapsedSec = (Date.now() - startedMs) / 1000;
  let current = HJ.TRACKING_STAGES[0];
  for (const s of HJ.TRACKING_STAGES) { if (elapsedSec >= s.afterSec) current = s; }
  const idx = HJ.TRACKING_STAGES.indexOf(current);
  const pct = Math.min(100, Math.round(((idx+1) / HJ.TRACKING_STAGES.length) * 100));
  return { ...current, idx, pct, elapsedSec: Math.round(elapsedSec) };
};
