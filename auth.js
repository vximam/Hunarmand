/**
 * Hunarmand Shared Authentication & Session Manager (auth.js)
 * Implements role-based access, Pakistani inputs validation, mock database persistence,
 * dynamic navbars, and admin route protection.
 */

// ═══════════════════════════════════════════════════
//  MOCK DATABASE INITIALIZATION (LOCALSTORAGE SEEDING)
// ═══════════════════════════════════════════════════
const initialWorkersSeed = [
  { id: 1, name: "Tariq Mahmood", email: "tariq.mahmood@hunarmand.pk", phone: "0300-1234567", cnic: "35201-1234567-1", skill: "Plumbing", city: "Lahore", status: "verified", statusColor: "green", badge: "Pro", date: "Feb 12, 2026", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { id: 2, name: "Sajid Ali", email: "sajid.elec@hunarmand.pk", phone: "0312-9876543", cnic: "42201-9876543-1", skill: "Electrical", city: "Karachi", status: "pending", statusColor: "amber", badge: "Standard", date: "Jan 05, 2026", image: null },
  { id: 3, name: "Kamran Khan", email: "kamran.wood@work.pk", phone: "0300-9876543", cnic: "37405-9876543-1", skill: "Carpentry", city: "Islamabad", status: "verified", statusColor: "green", badge: "Expert", date: "Aug 22, 2025", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" },
  { id: 4, name: "Ahmed Hassan", email: "ahmed.hassan@hunarmand.pk", phone: "0321-5555555", cnic: "35202-5555555-1", skill: "HVAC", city: "Lahore", status: "verified", statusColor: "green", badge: "Pro", date: "Mar 15, 2026", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { id: 5, name: "Bushra Yousuf", email: "bushra.clean@hunarmand.pk", phone: "0333-1112223", cnic: "42101-2223334-4", skill: "Cleaning", city: "Karachi", status: "verified", statusColor: "green", badge: "Pro", date: "Apr 02, 2026", image: null },
  { id: 6, name: "Imran Sheikh", email: "imran.paint@work.pk", phone: "0345-6667778", cnic: "37102-6667778-9", skill: "Painting", city: "Rawalpindi", status: "verified", statusColor: "green", badge: "Standard", date: "May 18, 2026", image: null },
  { id: 7, name: "Nadia Farooq", email: "nadia.repair@hunarmand.pk", phone: "0301-4445556", cnic: "33100-4445556-1", skill: "Appliance Repair", city: "Faisalabad", status: "verified", statusColor: "green", badge: "Pro", date: "Feb 27, 2026", image: null },
  { id: 8, name: "Waqas Ahmed", email: "waqas.elec@work.pk", phone: "0322-8889990", cnic: "35201-8889990-2", skill: "Electrical", city: "Lahore", status: "verified", statusColor: "green", badge: "Expert", date: "Nov 09, 2025", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop" },
  { id: 9, name: "Farhan Malik", email: "farhan.plumb@hunarmand.pk", phone: "0314-2223334", cnic: "61101-2223334-7", skill: "Plumbing", city: "Islamabad", status: "verified", statusColor: "green", badge: "Standard", date: "Jun 05, 2026", image: null },
  { id: 10, name: "Hina Baig", email: "hina.clean@work.pk", phone: "0336-5556667", cnic: "35201-5556667-3", skill: "Cleaning", city: "Lahore", status: "verified", statusColor: "green", badge: "Pro", date: "Mar 30, 2026", image: null },
  { id: 11, name: "Salman Raza", email: "salman.hvac@hunarmand.pk", phone: "0303-7778889", cnic: "42201-7778889-5", skill: "HVAC", city: "Karachi", status: "verified", statusColor: "green", badge: "Expert", date: "Jan 21, 2026", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop" },
  { id: 12, name: "Ayesha Noor", email: "ayesha.paint@work.pk", phone: "0347-3334445", cnic: "36302-3334445-6", skill: "Painting", city: "Multan", status: "verified", statusColor: "green", badge: "Standard", date: "Apr 14, 2026", image: null },
  { id: 13, name: "Zubair Khan", email: "zubair.security@hunarmand.pk", phone: "0313-9990001", cnic: "17301-9990001-8", skill: "Security", city: "Peshawar", status: "verified", statusColor: "green", badge: "Pro", date: "Dec 03, 2025", image: null },
  { id: 14, name: "Fatima Iqbal", email: "fatima.wood@work.pk", phone: "0334-1113335", cnic: "54401-1113335-0", skill: "Carpentry", city: "Quetta", status: "pending", statusColor: "amber", badge: "Standard", date: "Jul 08, 2026", image: null },
];

const initialUsersSeed = [
  { id: 1, name: "Zeshan S.", email: "zeshan@hunarmand.pk", phone: "0321-1234567", city: "Lahore", status: "active", requests: 5, rating: 4.8, joined: "12 July 2025", gender: "male" },
  { id: 2, name: "Maria A.", email: "maria@work.pk", phone: "0333-5555555", city: "Karachi", status: "active", requests: 3, rating: 4.5, joined: "20 August 2025", gender: "female" },
  { id: 3, name: "Bilal K.", email: "bilal@hunarmand.pk", phone: "0311-2222222", city: "Islamabad", status: "pending", requests: 1, rating: 3.8, joined: "10 Dec 2025", gender: "male" },
  { id: 4, name: "Admin User", email: "adminH001@hunarmand.pk", phone: "0300-0000000", city: "Islamabad", status: "active", requests: 0, rating: 5.0, joined: "01 Jan 2025", gender: "male" },
  { id: 5, name: "Usman Tariq", email: "usman.tariq@work.pk", phone: "0345-2345678", city: "Rawalpindi", status: "active", requests: 6, rating: 4.6, joined: "03 Feb 2026", gender: "male" },
  { id: 6, name: "Sana Malik", email: "sana.malik@hunarmand.pk", phone: "0301-8765432", city: "Faisalabad", status: "active", requests: 2, rating: 4.9, joined: "15 Mar 2026", gender: "female" },
  { id: 7, name: "Hamza Sheikh", email: "hamza.sheikh@work.pk", phone: "0322-3456789", city: "Multan", status: "active", requests: 4, rating: 4.2, joined: "22 Apr 2026", gender: "male" },
  { id: 8, name: "Ayesha Khan", email: "ayesha.khan@hunarmand.pk", phone: "0333-9988776", city: "Peshawar", status: "active", requests: 1, rating: 5.0, joined: "09 May 2026", gender: "female" },
  { id: 9, name: "Rabia Farooq", email: "rabia.farooq@work.pk", phone: "0314-5647382", city: "Quetta", status: "pending", requests: 0, rating: 0, joined: "01 Jul 2026", gender: "female" },
];

// Initialize localStorage arrays
if (!localStorage.getItem('allWorkers')) {
  localStorage.setItem('allWorkers', JSON.stringify(initialWorkersSeed));
}
if (!localStorage.getItem('allUsers')) {
  localStorage.setItem('allUsers', JSON.stringify(initialUsersSeed));
}

// Seed richer profile data (bio, rate, availability, portfolio) + sample reviews
// for the demo workers, so Find Artisans has real-looking data on first load.
const seedWorkerMeta = {
  1: { bio: "15+ years fixing leaks, installing fixtures, and full bathroom re-piping across Lahore. Same-day response for urgent jobs.", experience: "6-10 years", hourlyRate: 600, availability: "online", portfolio: ["Pipe Fitting","Leak Repair","Bathroom Install"], avgRating: 4.9, reviewCount: 3, completedJobs: 58, responseTime: "Within an hour" },
  2: { bio: "Licensed electrician handling wiring, fuse boxes, and appliance installs. Currently building my client base.", experience: "1-2 years", hourlyRate: 450, availability: "busy", portfolio: ["House Wiring","Fuse Boxes"], avgRating: 4.5, reviewCount: 1, completedJobs: 6, responseTime: "Within a few hours" },
  3: { bio: "Custom furniture and cabinetry specialist. I bring my own tools and can source hardwood on request.", experience: "3-5 years", hourlyRate: 700, availability: "online", portfolio: ["Custom Furniture","Cabinetry","Wardrobes"], avgRating: 5.0, reviewCount: 2, completedJobs: 41, responseTime: "Within an hour" },
  4: { bio: "HVAC installation and AC servicing for homes and small offices. Free inspection on first visit.", experience: "6-10 years", hourlyRate: 800, availability: "offline", portfolio: ["AC Install","AC Servicing","Duct Work"], avgRating: 4.8, reviewCount: 2, completedJobs: 73, responseTime: "Same day" },
  5: { bio: "Deep-cleaning specialist for homes, apartments and move-outs. I bring eco-friendly supplies.", experience: "3-5 years", hourlyRate: 350, availability: "online", portfolio: ["Deep Cleaning","Move-out Clean","Kitchen Detailing"], avgRating: 4.9, reviewCount: 4, completedJobs: 112, responseTime: "Within an hour" },
  6: { bio: "Interior and exterior painting, textures, and waterproofing. Free color consultation included.", experience: "6-10 years", hourlyRate: 500, availability: "busy", portfolio: ["Interior Paint","Waterproofing","Texture Walls"], avgRating: 4.6, reviewCount: 3, completedJobs: 64, responseTime: "Within a few hours" },
  7: { bio: "Fixing washing machines, fridges, microwaves and more. Genuine spare parts, 30-day warranty on repairs.", experience: "3-5 years", hourlyRate: 400, availability: "online", portfolio: ["Washing Machine Repair","Fridge Repair","Microwave Repair"], avgRating: 4.7, reviewCount: 2, completedJobs: 39, responseTime: "Within an hour" },
  8: { bio: "Commercial and residential electrical work, from fuse boxes to full rewiring. DHA-approved contractor.", experience: "10+ years", hourlyRate: 750, availability: "busy", portfolio: ["Rewiring","Fuse Boxes","Commercial Wiring"], avgRating: 4.8, reviewCount: 3, completedJobs: 96, responseTime: "Within a few hours" },
  9: { bio: "Reliable plumber for leaks, installs, and drainage issues across Islamabad and twin cities.", experience: "1-2 years", hourlyRate: 400, availability: "offline", portfolio: ["Leak Repair","Drain Cleaning"], avgRating: 4.3, reviewCount: 1, completedJobs: 14, responseTime: "Same day" },
  10: { bio: "Regular and one-time home cleaning with a small trusted team. Pet-friendly, non-toxic products.", experience: "1-2 years", hourlyRate: 300, availability: "online", portfolio: ["Home Cleaning","Office Cleaning"], avgRating: 4.6, reviewCount: 2, completedJobs: 27, responseTime: "Within a few hours" },
  11: { bio: "AC installation, gas refilling, and annual maintenance contracts for homes and offices.", experience: "6-10 years", hourlyRate: 850, availability: "busy", portfolio: ["AC Gas Refill","AC Installation","Maintenance Contracts"], avgRating: 4.9, reviewCount: 3, completedJobs: 81, responseTime: "Within an hour" },
  12: { bio: "Affordable, tidy painting work for homes and small shops around Multan.", experience: "1-2 years", hourlyRate: 380, availability: "online", portfolio: ["Home Painting","Shop Painting"], avgRating: 4.4, reviewCount: 1, completedJobs: 18, responseTime: "Within a few hours" },
  13: { bio: "Trained security guard available for events, offices, and residential gates. Licensed and background-checked.", experience: "3-5 years", hourlyRate: 300, availability: "online", portfolio: ["Event Security","Gate Security","Office Security"], avgRating: 4.7, reviewCount: 2, completedJobs: 33, responseTime: "Within an hour" },
  14: { bio: "Furniture repair and custom woodwork, currently completing verification.", experience: "1-2 years", hourlyRate: 350, availability: "offline", portfolio: ["Furniture Repair"], avgRating: 5.0, reviewCount: 0, completedJobs: 0, responseTime: "Within a few hours" },
};
const seedReviews = {
  1: [
    { clientName: "Zeshan S.", rating: 5, comment: "Fixed our kitchen leak in under an hour. Very professional.", service: "Kitchen Sink Repair", date: "Jun 12, 2026" },
    { clientName: "Maria A.", rating: 5, comment: "Reliable and fair pricing. Would book again.", service: "Bathroom Pipe Fitting", date: "May 28, 2026" },
    { clientName: "Bilal K.", rating: 4, comment: "Good work, arrived a bit later than planned.", service: "Tap Installation", date: "Apr 03, 2026" },
  ],
  2: [ { clientName: "Zeshan S.", rating: 4.5, comment: "Rewired our living room safely and quickly.", service: "House Wiring", date: "Jun 01, 2026" } ],
  3: [
    { clientName: "Maria A.", rating: 5, comment: "Built a beautiful custom wardrobe, great attention to detail.", service: "Custom Wardrobe", date: "Jun 20, 2026" },
    { clientName: "Bilal K.", rating: 5, comment: "Excellent carpentry work, on time and tidy.", service: "Cabinet Repair", date: "May 15, 2026" },
  ],
  4: [
    { clientName: "Zeshan S.", rating: 5, comment: "AC was fixed same day in the middle of summer, lifesaver.", service: "AC Repair", date: "Jun 25, 2026" },
    { clientName: "Maria A.", rating: 4.5, comment: "Professional install, cleaned up after the job.", service: "AC Installation", date: "Apr 18, 2026" },
  ],
  5: [
    { clientName: "Sana Malik", rating: 5, comment: "House has never been this clean. Booking her monthly now.", service: "Deep Cleaning", date: "Jun 30, 2026" },
    { clientName: "Ayesha Khan", rating: 5, comment: "Super thorough, even cleaned inside the oven.", service: "Kitchen Detailing", date: "Jun 10, 2026" },
    { clientName: "Rabia Farooq", rating: 4.5, comment: "Great move-out clean, got our deposit back.", service: "Move-out Clean", date: "May 22, 2026" },
    { clientName: "Maria A.", rating: 5, comment: "On time and very detail-oriented.", service: "Deep Cleaning", date: "Apr 09, 2026" },
  ],
  6: [
    { clientName: "Usman Tariq", rating: 5, comment: "Great color advice, walls look brand new.", service: "Interior Paint", date: "Jun 18, 2026" },
    { clientName: "Hamza Sheikh", rating: 4, comment: "Good work but took a day longer than quoted.", service: "Waterproofing", date: "May 30, 2026" },
    { clientName: "Zeshan S.", rating: 4.5, comment: "Neat finish, cleaned up after himself.", service: "Texture Walls", date: "Apr 25, 2026" },
  ],
  7: [
    { clientName: "Maria A.", rating: 5, comment: "Fixed our washing machine same day, genuine part used.", service: "Washing Machine Repair", date: "Jun 22, 2026" },
    { clientName: "Bilal K.", rating: 4.5, comment: "Fridge cooling properly again, fair price.", service: "Fridge Repair", date: "May 11, 2026" },
  ],
  8: [
    { clientName: "Hamza Sheikh", rating: 5, comment: "Rewired our whole shop safely, very knowledgeable.", service: "Commercial Wiring", date: "Jun 27, 2026" },
    { clientName: "Usman Tariq", rating: 4.5, comment: "Solved a tricky fuse box issue others couldn't.", service: "Fuse Boxes", date: "Jun 03, 2026" },
    { clientName: "Sana Malik", rating: 5, comment: "Professional and safety-conscious.", service: "Rewiring", date: "Apr 30, 2026" },
  ],
  9: [ { clientName: "Bilal K.", rating: 4.3, comment: "Fixed the leak, a bit pricey but good work.", service: "Leak Repair", date: "Jun 08, 2026" } ],
  10: [
    { clientName: "Ayesha Khan", rating: 4.5, comment: "Friendly team, pet-safe products as promised.", service: "Home Cleaning", date: "Jun 15, 2026" },
    { clientName: "Rabia Farooq", rating: 4.7, comment: "Office looked spotless for our client visit.", service: "Office Cleaning", date: "May 20, 2026" },
  ],
  11: [
    { clientName: "Zeshan S.", rating: 5, comment: "AC blowing ice cold now, quick gas refill service.", service: "AC Gas Refill", date: "Jun 29, 2026" },
    { clientName: "Maria A.", rating: 5, comment: "Set up a maintenance contract, very convenient.", service: "Maintenance Contracts", date: "Jun 05, 2026" },
    { clientName: "Hamza Sheikh", rating: 4.8, comment: "Installed 3 units in one day, efficient team.", service: "AC Installation", date: "Apr 14, 2026" },
  ],
  12: [ { clientName: "Hamza Sheikh", rating: 4.4, comment: "Affordable and tidy work for our shop front.", service: "Shop Painting", date: "Jun 02, 2026" } ],
  13: [
    { clientName: "Usman Tariq", rating: 4.8, comment: "Very punctual and alert, felt safe with him around.", service: "Event Security", date: "Jun 21, 2026" },
    { clientName: "Sana Malik", rating: 4.6, comment: "Reliable for our office gate coverage.", service: "Office Security", date: "May 08, 2026" },
  ],
};
Object.keys(seedWorkerMeta).forEach(id => {
  if (!localStorage.getItem(`hun_worker_meta_${id}`)) {
    localStorage.setItem(`hun_worker_meta_${id}`, JSON.stringify(seedWorkerMeta[id]));
  }
  if (!localStorage.getItem(`hun_reviews_worker_${id}`)) {
    localStorage.setItem(`hun_reviews_worker_${id}`, JSON.stringify(seedReviews[id]||[]));
  }
});

// ═══════════════════════════════════════════════════
//  SESSION & ACCESS SECURITY (ADMIN ROUTE GUARDS)
// ═══════════════════════════════════════════════════
function checkAdminSession() {
  const session = JSON.parse(localStorage.getItem('currentUser'));
  if (!session || session.role !== 'admin') {
    // Save intended destination
    const path = window.location.pathname.split('/').pop();
    localStorage.setItem('authRedirect', path || 'dashboard.html');
    window.location.href = 'auth.html?action=login&error=unauthorized';
  }
}

// ═══════════════════════════════════════════════════
//  VALIDATION HELPERS
// ═══════════════════════════════════════════════════
const Validation = {
  name: (val) => {
    if (!val || val.trim().length < 3 || !/^[a-zA-Z\s'.-]+$/.test(val)) return false;
    // Guard against keyboard-mash junk ("aaaaaa", "asdfgh") — require it to look like real words
    return (typeof HJ !== 'undefined' && HJ.isRealisticName) ? HJ.isRealisticName(val) : true;
  },
  email: (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  },
  phone: (val) => {
    // Matches common Pakistani formats: 03xxxxxxxxx or 03xx-xxxxxxx
    const cleaned = val.replace(/[-\s]/g, '');
    return /^(03|\+923|923)\d{9}$/.test(cleaned);
  },
  cnic: (val) => {
    // Matches XXXXX-XXXXXXX-Y
    return /^\d{5}-\d{7}-\d{1}$/.test(val);
  },
  password: (val) => {
    return {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /\d/.test(val),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
    };
  }
};

// Auto-formatter for CNIC field as user types
function formatCNICInput(inputEl) {
  inputEl.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // strip non-digits
    let formatted = '';
    if (value.length > 0) {
      formatted += value.substring(0, 5);
    }
    if (value.length > 5) {
      formatted += '-' + value.substring(5, 12);
    }
    if (value.length > 12) {
      formatted += '-' + value.substring(12, 13);
    }
    e.target.value = formatted;
  });
}

// Auto-formatter for Phone field as user types
function formatPhoneInput(inputEl) {
  inputEl.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (value.startsWith('92')) {
      value = '0' + value.substring(2);
    }
    let formatted = '';
    if (value.length > 0) {
      formatted += value.substring(0, 4);
    }
    if (value.length > 4) {
      formatted += '-' + value.substring(4, 11);
    }
    e.target.value = formatted;
  });
}

// ═══════════════════════════════════════════════════
//  DYNAMIC NAVBAR SESSION SYNCHRONIZATION
// ═══════════════════════════════════════════════════
function initAuthNavbar() {
  const session = JSON.parse(localStorage.getItem('currentUser'));
  const navButtonsContainer = document.querySelector('.nav-buttons');
  const mobileButtonsContainer = document.querySelector('.mobile-buttons');

  if (!session) {
    // Ensure auth links point to our standalone auth page
    updateNavbarToDefault();
    return;
  }

  // Inject styles for dropdown profile chip
  injectNavbarStyles();

  // Create Profile Dropdown HTML for Desktop
  const initials = getInitials(session.name);
  const avatarBg = session.image ? 'transparent' : '#1b5e37';
  const avatarContent = session.image
    ? `<img src="${session.image}" alt="${session.name}">`
    : `<span>${initials}</span>`;

  if (navButtonsContainer) {
    navButtonsContainer.innerHTML = `
      <div class="user-profile-dropdown" id="userProfileDropdown">
        <button class="profile-chip-btn" id="profileChipBtn">
          <div class="chip-avatar" style="background: ${avatarBg};">
            ${avatarContent}
          </div>
          <span class="chip-name">${session.name.split(' ')[0]}</span>
          <i class="fa-solid fa-chevron-down chip-arrow"></i>
        </button>
        <div class="dropdown-menu-list" id="dropdownMenuList">
          <div class="dropdown-header">
            <strong>${session.name}</strong>
            <span class="role-badge">${session.role.toUpperCase()}</span>
          </div>
          <hr>
          ${getDropdownLinks(session.role)}
          <hr>
          <a href="#" class="logout-link" id="navLogoutBtn">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out
          </a>
        </div>
      </div>
    `;

    // Dropdown toggle logic
    const dropBtn = document.getElementById('profileChipBtn');
    const menuList = document.getElementById('dropdownMenuList');

    dropBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuList.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      menuList.classList.remove('show');
    });
  }

  // Create Profile Menu for Mobile Navbar
  if (mobileButtonsContainer) {
    mobileButtonsContainer.innerHTML = `
      <div class="mobile-profile-container">
        <div class="mobile-profile-header">
          <div class="chip-avatar mobile-avatar" style="background: ${avatarBg};">
            ${avatarContent}
          </div>
          <div>
            <div class="mobile-user-name">${session.name}</div>
            <div class="mobile-user-role">${session.role.toUpperCase()}</div>
          </div>
        </div>
        <div class="mobile-profile-links">
          ${getDropdownLinks(session.role)}
          <button class="mobile-logout-btn" id="mobileNavLogoutBtn">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Log Out
          </button>
        </div>
      </div>
    `;
  }

  // Bind Logout actions
  const executeLogoutAction = (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    showToastNotification('Logged out successfully!', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  };

  const desktopLogout = document.getElementById('navLogoutBtn');
  if (desktopLogout) desktopLogout.addEventListener('click', executeLogoutAction);

  const mobileLogout = document.getElementById('mobileNavLogoutBtn');
  if (mobileLogout) mobileLogout.addEventListener('click', executeLogoutAction);
}

function updateNavbarToDefault() {
  const loginBtns = document.querySelectorAll('.login-btn, .mobile-login');
  const signupBtns = document.querySelectorAll('.signup-btn, .mobile-signup');

  loginBtns.forEach(btn => {
    btn.onclick = () => window.location.href = 'auth.html?action=login';
  });

  signupBtns.forEach(btn => {
    btn.onclick = () => window.location.href = 'auth.html?action=signup';
  });
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getDropdownLinks(role) {
  if (role === 'admin') {
    return `<a href="dashboard.html"><i class="fa-solid fa-chart-line"></i> Dashboard</a>`;
  } else {
    // Placeholder logic for User/Worker portals
    return `
      <a href="#" onclick="showFeatureModal('${role}')">
        <i class="fa-solid fa-circle-user"></i> My Portal
      </a>
    `;
  }
}

// ═══════════════════════════════════════════════════
//  MOCK MODAL SYSTEM FOR USER/WORKER PORTAL PENDING
// ═══════════════════════════════════════════════════
function showFeatureModal(role) {
  // Check if modal container exists, else inject
  let modal = document.getElementById('constructionModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'constructionModal';
    modal.className = 'construction-modal-overlay';
    document.body.appendChild(modal);
  }

  const roleText = role === 'worker' ? 'Worker Dashboard' : 'Client Profile Space';
  modal.innerHTML = `
    <div class="construction-modal-box">
      <button class="construction-modal-close" onclick="closeFeatureModal()">&times;</button>
      <div class="construction-icon">
        <i class="fa-solid fa-screwdriver-wrench"></i>
      </div>
      <h3>Portal Coming Soon!</h3>
      <p>The <strong>${roleText}</strong> dashboard is currently under active development. In the next updates, this will connect you directly to active workers, orders, and payment history.</p>
      <button class="construction-ok-btn" onclick="closeFeatureModal()">Understood</button>
    </div>
  `;
  setTimeout(() => {
    modal.classList.add('open');
  }, 10);
}

function closeFeatureModal() {
  const modal = document.getElementById('constructionModal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// Inject CSS for dynamic profile components
function injectNavbarStyles() {
  if (document.getElementById('auth-nav-styles')) return;

  const styleEl = document.createElement('style');
  styleEl.id = 'auth-nav-styles';
  styleEl.textContent = `
    /* Profile Chip Container */
    .user-profile-dropdown {
      position: relative;
      font-family: 'Inter', sans-serif;
    }
    .profile-chip-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(27, 94, 55, 0.06);
      border: 1.5px solid rgba(27, 94, 55, 0.18);
      border-radius: 99px;
      padding: 6px 14px;
      color: #0b1a10;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .profile-chip-btn:hover {
      background: rgba(27, 94, 55, 0.12);
      transform: translateY(-1px);
    }
    .chip-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .chip-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .chip-arrow {
      font-size: 10px;
      color: #1b5e37;
      transition: transform 0.3s;
    }
    .user-profile-dropdown:hover .chip-arrow {
      transform: translateY(1px);
    }
    
    /* Dropdown Menu List */
    .dropdown-menu-list {
      position: absolute;
      top: 105%;
      right: 0;
      width: 200px;
      background: #fff;
      border: 1px solid rgba(27, 94, 55, 0.15);
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(11,26,16,0.1);
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(10px);
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 1000;
    }
    .dropdown-menu-list.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .dropdown-header {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .dropdown-header strong {
      color: #0b1a10;
      font-size: 13.5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .role-badge {
      font-size: 9px;
      font-weight: 800;
      color: #1b5e37;
      background: #e8f5ed;
      padding: 2px 6px;
      border-radius: 4px;
      align-self: flex-start;
      margin-top: 2px;
    }
    .dropdown-menu-list hr {
      border: 0;
      border-top: 1px solid rgba(27, 94, 55, 0.08);
      margin: 4px 0;
    }
    .dropdown-menu-list a {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #4a6741;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
    }
    .dropdown-menu-list a:hover {
      background: #e8f5ed;
      color: #1b5e37;
    }
    .dropdown-menu-list a i {
      font-size: 14px;
      color: #1b5e37;
    }
    .dropdown-menu-list .logout-link {
      color: #ef4444;
    }
    .dropdown-menu-list .logout-link:hover {
      background: #fef2f2;
      color: #dc2626;
    }
    .dropdown-menu-list .logout-link i {
      color: inherit;
    }

    /* Mobile Profile Area */
    .mobile-profile-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .mobile-profile-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mobile-avatar {
      width: 40px;
      height: 40px;
      border: 2px solid rgba(255, 255, 255, 0.5);
    }
    .mobile-user-name {
      font-weight: 700;
      font-size: 15px;
    }
    .mobile-user-role {
      font-size: 10px;
      font-weight: 800;
      color: #a7f3d0;
      letter-spacing: 0.5px;
    }
    .mobile-profile-links {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .mobile-profile-links a {
      color: rgba(255, 255, 255, 0.85) !important;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mobile-logout-btn {
      width: 100%;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      padding: 10px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      margin-top: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    /* Construction Modal Styles */
    .construction-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(11, 26, 16, 0.5);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
    }
    .construction-modal-overlay.open {
      opacity: 1;
      pointer-events: all;
    }
    .construction-modal-box {
      background: #fff;
      border-radius: 24px;
      padding: 32px;
      width: 90%;
      max-width: 440px;
      box-shadow: 0 20px 60px rgba(11,26,16,0.18);
      position: relative;
      text-align: center;
      transform: scale(0.9);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .construction-modal-overlay.open .construction-modal-box {
      transform: scale(1);
    }
    .construction-modal-close {
      position: absolute;
      top: 14px;
      right: 18px;
      font-size: 26px;
      color: #94a3b8;
      background: none;
      border: none;
      cursor: pointer;
    }
    .construction-icon {
      width: 68px;
      height: 68px;
      border-radius: 20px;
      background: #e8f5ed;
      color: #1b5e37;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto 20px;
      animation: constructionBob 3s ease-in-out infinite;
    }
    @keyframes constructionBob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .construction-modal-box h3 {
      font-family: 'Sora', sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #1b5e37;
      margin-bottom: 12px;
    }
    .construction-modal-box p {
      font-size: 14px;
      color: #4e6a57;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .construction-ok-btn {
      background: #1b5e37;
      color: #fff;
      padding: 12px 28px;
      border-radius: 99px;
      font-weight: 700;
      font-size: 14px;
      width: 100%;
      cursor: pointer;
      transition: all 0.3s;
    }
    .construction-ok-btn:hover {
      background: #134228;
      box-shadow: 0 6px 20px rgba(27,94,55,0.25);
    }
  `;
  document.head.appendChild(styleEl);
}

// ═══════════════════════════════════════════════════
//  COMMON TOAST NOTIFICATION
// ═══════════════════════════════════════════════════
function showToastNotification(message, type = 'success') {
  let toastEl = document.getElementById('toast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = (type === 'success' ? '✅ ' : type === 'error' ? '❌ ' : 'ℹ️ ') + message;
  toastEl.classList.add('show');
  clearTimeout(toastEl._tid);
  toastEl._tid = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// Auto-run when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuthNavbar();
});
