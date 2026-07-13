/**
 * Hunarmand Shared Authentication & Session Manager (auth.js)
 * Implements role-based access, Pakistani inputs validation, mock database persistence,
 * dynamic navbars, and admin route protection.
 */

// ═══════════════════════════════════════════════════
//  MOCK DATABASE — WORKERS (18 real Pakistani workers)
// ═══════════════════════════════════════════════════
const initialWorkersSeed = [
  { id:1,  name:"Tariq Mahmood",  email:"tariq.mahmood@hunarmand.pk",   phone:"0300-1234567", cnic:"35201-1234567-1", skill:"Plumbing",        city:"Lahore",      status:"verified", statusColor:"green", badge:"Pro",      date:"Feb 12, 2026", image:"https://randomuser.me/api/portraits/men/11.jpg" },
  { id:2,  name:"Sajid Ali",      email:"sajid.elec@hunarmand.pk",      phone:"0312-9876543", cnic:"42201-9876543-1", skill:"Electrical",      city:"Karachi",     status:"verified", statusColor:"green", badge:"Standard", date:"Jan 05, 2026", image:"https://randomuser.me/api/portraits/men/22.jpg" },
  { id:3,  name:"Kamran Khan",    email:"kamran.wood@work.pk",          phone:"0300-9876543", cnic:"37405-9876543-1", skill:"Carpentry",       city:"Islamabad",   status:"verified", statusColor:"green", badge:"Expert",   date:"Aug 22, 2025", image:"https://randomuser.me/api/portraits/men/33.jpg" },
  { id:4,  name:"Ahmed Hassan",   email:"ahmed.hassan@hunarmand.pk",    phone:"0321-5555555", cnic:"35202-5555555-1", skill:"HVAC",            city:"Lahore",      status:"verified", statusColor:"green", badge:"Pro",      date:"Mar 15, 2026", image:"https://randomuser.me/api/portraits/men/44.jpg" },
  { id:5,  name:"Rizwan Akhtar",  email:"rizwan.paint@hunarmand.pk",    phone:"0331-7654321", cnic:"35401-7654321-3", skill:"Painting",        city:"Faisalabad",  status:"verified", statusColor:"green", badge:"Pro",      date:"Nov 10, 2025", image:"https://randomuser.me/api/portraits/men/55.jpg" },
  { id:6,  name:"Noman Siddiqui", email:"noman.clean@hunarmand.pk",     phone:"0322-4441234", cnic:"42101-4441234-2", skill:"Cleaning",        city:"Karachi",     status:"verified", statusColor:"green", badge:"Standard", date:"Dec 01, 2025", image:"https://randomuser.me/api/portraits/men/66.jpg" },
  { id:7,  name:"Fawad Hussain",  email:"fawad.appliance@hunarmand.pk", phone:"0311-8882345", cnic:"35301-8882345-1", skill:"Appliance Repair",city:"Rawalpindi",  status:"verified", statusColor:"green", badge:"Expert",   date:"Sep 14, 2025", image:"https://randomuser.me/api/portraits/men/77.jpg" },
  { id:8,  name:"Asif Mehmood",   email:"asif.security@hunarmand.pk",   phone:"0345-6667890", cnic:"38401-6667890-5", skill:"Security",        city:"Islamabad",   status:"verified", statusColor:"green", badge:"Pro",      date:"Oct 05, 2025", image:"https://randomuser.me/api/portraits/men/88.jpg" },
  { id:9,  name:"Bilal Chaudhry", email:"bilal.weld@work.pk",           phone:"0300-3334455", cnic:"35601-3334455-1", skill:"Welder",          city:"Lahore",      status:"verified", statusColor:"green", badge:"Expert",   date:"Jul 18, 2025", image:"https://randomuser.me/api/portraits/men/12.jpg" },
  { id:10, name:"Umer Farooq",    email:"umer.drive@hunarmand.pk",      phone:"0323-5556677", cnic:"35201-5556677-3", skill:"Driver",          city:"Karachi",     status:"verified", statusColor:"green", badge:"Standard", date:"Apr 22, 2026", image:"https://randomuser.me/api/portraits/men/23.jpg" },
  { id:11, name:"Yasir Niazi",    email:"yasir.gen@hunarmand.pk",       phone:"0334-2223344", cnic:"37101-2223344-7", skill:"General",         city:"Peshawar",    status:"verified", statusColor:"green", badge:"Standard", date:"May 30, 2026", image:"https://randomuser.me/api/portraits/men/34.jpg" },
  { id:12, name:"Rashid Baloch",  email:"rashid.plumb@hunarmand.pk",    phone:"0333-9990011", cnic:"54101-9990011-2", skill:"Plumbing",        city:"Quetta",      status:"verified", statusColor:"green", badge:"Pro",      date:"Jun 01, 2026", image:"https://randomuser.me/api/portraits/men/45.jpg" },
  { id:13, name:"Hamza Rafiq",    email:"hamza.elec@hunarmand.pk",      phone:"0301-1112233", cnic:"35201-1112233-4", skill:"Electrical",      city:"Multan",      status:"verified", statusColor:"green", badge:"Pro",      date:"Jan 20, 2026", image:"https://randomuser.me/api/portraits/men/56.jpg" },
  { id:14, name:"Naveed Shah",    email:"naveed.hvac@work.pk",          phone:"0312-6667788", cnic:"37405-6667788-3", skill:"HVAC",            city:"Rawalpindi",  status:"pending",  statusColor:"amber", badge:"Standard", date:"Jun 28, 2026", image:"https://randomuser.me/api/portraits/men/67.jpg" },
  { id:15, name:"Sadia Bibi",     email:"sadia.clean@hunarmand.pk",     phone:"0332-4445566", cnic:"35202-4445566-8", skill:"Cleaning",        city:"Lahore",      status:"verified", statusColor:"green", badge:"Pro",      date:"Mar 03, 2026", image:"https://randomuser.me/api/portraits/women/11.jpg" },
  { id:16, name:"Rabia Noor",     email:"rabia.paint@hunarmand.pk",     phone:"0343-7778899", cnic:"42201-7778899-6", skill:"Painting",        city:"Karachi",     status:"verified", statusColor:"green", badge:"Expert",   date:"Feb 14, 2026", image:"https://randomuser.me/api/portraits/women/22.jpg" },
  { id:17, name:"Irfan Qureshi",  email:"irfan.carp@hunarmand.pk",      phone:"0344-3334455", cnic:"35601-3334455-9", skill:"Carpentry",       city:"Faisalabad",  status:"verified", statusColor:"green", badge:"Expert",   date:"Apr 11, 2026", image:"https://randomuser.me/api/portraits/men/78.jpg" },
  { id:18, name:"Daniyal Mirza",  email:"daniyal.sec@hunarmand.pk",     phone:"0355-2221100", cnic:"38401-2221100-1", skill:"Security",        city:"Islamabad",   status:"pending",  statusColor:"amber", badge:"Standard", date:"Jul 10, 2026", image:"https://randomuser.me/api/portraits/men/89.jpg" },
];

// ═══════════════════════════════════════════════════
//  MOCK DATABASE — USERS (12 Pakistani users)
// ═══════════════════════════════════════════════════
const initialUsersSeed = [
  { id:101, name:"Zeshan Saeed",  email:"zeshan@hunarmand.pk",    phone:"0321-1234567", city:"Lahore",     status:"active",  requests:8,  rating:4.8, joined:"12 July 2025",   gender:"male"   },
  { id:102, name:"Maria Aslam",   email:"maria@work.pk",          phone:"0333-5555555", city:"Karachi",    status:"active",  requests:5,  rating:4.5, joined:"20 August 2025", gender:"female" },
  { id:103, name:"Bilal Khan",    email:"bilal@hunarmand.pk",     phone:"0311-2222222", city:"Islamabad",  status:"active",  requests:3,  rating:4.2, joined:"10 Dec 2025",    gender:"male"   },
  { id:104, name:"Hira Fatima",   email:"hira@users.pk",          phone:"0342-9876543", city:"Lahore",     status:"active",  requests:11, rating:4.9, joined:"05 June 2025",   gender:"female" },
  { id:105, name:"Usman Ghani",   email:"usman@hunarmand.pk",     phone:"0301-5554433", city:"Faisalabad", status:"active",  requests:2,  rating:4.1, joined:"22 Sep 2025",    gender:"male"   },
  { id:106, name:"Sara Malik",    email:"sara@work.pk",           phone:"0322-1113344", city:"Rawalpindi", status:"active",  requests:7,  rating:4.7, joined:"11 Oct 2025",    gender:"female" },
  { id:107, name:"Farhan Tahir",  email:"farhan@hunarmand.pk",    phone:"0313-6667788", city:"Karachi",    status:"active",  requests:4,  rating:4.3, joined:"30 Nov 2025",    gender:"male"   },
  { id:108, name:"Nadia Perveen", email:"nadia@users.pk",         phone:"0344-2223344", city:"Peshawar",   status:"active",  requests:6,  rating:4.6, joined:"18 Jan 2026",    gender:"female" },
  { id:109, name:"Khalid Meer",   email:"khalid@hunarmand.pk",    phone:"0335-8889900", city:"Multan",     status:"pending", requests:1,  rating:3.9, joined:"25 Mar 2026",    gender:"male"   },
  { id:110, name:"Ambreen Raza",  email:"ambreen@work.pk",        phone:"0346-4445566", city:"Quetta",     status:"active",  requests:9,  rating:4.8, joined:"14 Feb 2026",    gender:"female" },
  { id:111, name:"Zaid Ibrahim",  email:"zaid@hunarmand.pk",      phone:"0302-7778890", city:"Lahore",     status:"active",  requests:14, rating:5.0, joined:"01 Jan 2025",    gender:"male"   },
  { id:112, name:"Admin User",    email:"adminH001@hunarmand.pk", phone:"0300-0000000", city:"Islamabad",  status:"active",  requests:0,  rating:5.0, joined:"01 Jan 2025",    gender:"male"   },
];

// Initialize localStorage arrays (only on first load)
if (!localStorage.getItem('allWorkers')) {
  localStorage.setItem('allWorkers', JSON.stringify(initialWorkersSeed));
}
if (!localStorage.getItem('allUsers')) {
  localStorage.setItem('allUsers', JSON.stringify(initialUsersSeed));
}

// ═══════════════════════════════════════════════════
//  RICH WORKER META + REVIEWS
// ═══════════════════════════════════════════════════
const seedWorkerMeta = {
  1:  { bio:"15+ years fixing leaks, installing fixtures and full bathroom re-piping across Lahore. Same-day response for urgent jobs.", experience:"10+ years", hourlyRate:700, availability:"online",  portfolio:["Pipe Fitting","Leak Repair","Bathroom Install","Water Tank"], avgRating:4.8, reviewCount:5, completedJobs:87, responseTime:"Within an hour" },
  2:  { bio:"Licensed electrician handling house wiring, fuse boxes and appliance installs. Full safety certification from PESCO.", experience:"3-5 years",  hourlyRate:500, availability:"busy",    portfolio:["House Wiring","Fuse Boxes","Solar Wiring","DB Board"],           avgRating:4.5, reviewCount:4, completedJobs:34, responseTime:"Within a few hours" },
  3:  { bio:"Custom furniture and cabinetry specialist. I bring my own tools and can source solid hardwood and ply on request.", experience:"6-10 years", hourlyRate:800, availability:"online",  portfolio:["Custom Furniture","Cabinetry","Wardrobes","Door Frames"],        avgRating:5.0, reviewCount:6, completedJobs:62, responseTime:"Within an hour" },
  4:  { bio:"HVAC installation and AC servicing for homes and small offices. Free inspection on first visit. All brands covered.", experience:"6-10 years", hourlyRate:900, availability:"busy",    portfolio:["AC Install","AC Servicing","Duct Work","Chiller Maint."],         avgRating:4.8, reviewCount:5, completedJobs:93, responseTime:"Same day" },
  5:  { bio:"Interior and exterior painting specialist using premium Berger and ICI paints. Zero mess, precision tape work.", experience:"6-10 years", hourlyRate:650, availability:"working", portfolio:["Interior Paint","Exterior Paint","Texture Work","Polish"],          avgRating:4.8, reviewCount:4, completedJobs:55, responseTime:"Within a few hours" },
  6:  { bio:"Deep cleaning and sanitisation specialist for homes, offices and post-construction sites. Eco-friendly products used.", experience:"3-5 years",  hourlyRate:400, availability:"online",  portfolio:["Deep Clean","Post-Construction","Office Cleaning","Sofa Wash"],   avgRating:4.7, reviewCount:3, completedJobs:41, responseTime:"Same day" },
  7:  { bio:"Appliance repair for all major brands — washing machines, fridges, microwaves and ovens. 30-day warranty on all repairs.", experience:"6-10 years", hourlyRate:550, availability:"offline", portfolio:["Washing Machine","Fridge Repair","Oven Repair","Geyser"],         avgRating:4.8, reviewCount:4, completedJobs:78, responseTime:"Within a few hours" },
  8:  { bio:"Security systems installation including CCTV, biometric locks, alarm systems and access control. 24/7 monitoring setup.", experience:"3-5 years",  hourlyRate:750, availability:"working", portfolio:["CCTV Install","Alarm Systems","Biometric","Access Control"],      avgRating:5.0, reviewCount:3, completedJobs:39, responseTime:"Within an hour" },
  9:  { bio:"Skilled welder handling structural steel, gates, grills, railings and custom metalwork. Workshop + on-site available.", experience:"10+ years",  hourlyRate:700, availability:"online",  portfolio:["Structural Steel","Gates & Grills","Railings","Metal Fab"],       avgRating:4.8, reviewCount:4, completedJobs:71, responseTime:"Within a few hours" },
  10: { bio:"Professional driver with clean 10-year record. Available for daily commute, airport transfers and family trips.", experience:"10+ years",  hourlyRate:350, availability:"offline", portfolio:["Airport Transfer","Daily Commute","Long Route","Family Trips"],     avgRating:4.7, reviewCount:3, completedJobs:120,responseTime:"Same day" },
  11: { bio:"Versatile handyman for all general maintenance tasks. Minor repairs, furniture assembly, wall-mounting and more.", experience:"3-5 years",  hourlyRate:450, availability:"online",  portfolio:["Minor Repairs","Furniture Assembly","Wall Mount","Tiling"],          avgRating:4.5, reviewCount:2, completedJobs:29, responseTime:"Within a few hours" },
  12: { bio:"Expert plumber based in Quetta serving residential and commercial clients. Specialises in waterproofing and drainage.", experience:"6-10 years", hourlyRate:650, availability:"online",  portfolio:["Waterproofing","Drainage","Pipe Fitting","Bathroom Fix"],          avgRating:4.7, reviewCount:3, completedJobs:48, responseTime:"Within an hour" },
  13: { bio:"Senior electrician with solar panel installation experience. Serving Multan and surrounding districts reliably.", experience:"6-10 years", hourlyRate:600, availability:"working", portfolio:["Solar Install","House Wiring","Generator","UPS Setup"],             avgRating:4.8, reviewCount:4, completedJobs:57, responseTime:"Within a few hours" },
  14: { bio:"HVAC technician with specialisation in split ACs and VRF systems. Currently building client base in Rawalpindi.", experience:"1-2 years",  hourlyRate:500, availability:"online",  portfolio:["Split AC","VRF Systems","AC Gas Refill","Duct Clean"],              avgRating:4.0, reviewCount:1, completedJobs:12, responseTime:"Within a few hours" },
  15: { bio:"Professional cleaning specialist. Expert in deep home cleaning, mattress sanitisation and kitchen degreasing.", experience:"3-5 years",  hourlyRate:420, availability:"online",  portfolio:["Deep Cleaning","Mattress Clean","Kitchen Degrease","Carpet Wash"],   avgRating:5.0, reviewCount:4, completedJobs:63, responseTime:"Within an hour" },
  16: { bio:"Award-winning decorative painter with expertise in texture finishes, stencil art and imported washable paints.", experience:"6-10 years", hourlyRate:800, availability:"busy",    portfolio:["Texture Finish","Stencil Art","Wallpaper","3D Paint"],              avgRating:5.0, reviewCount:5, completedJobs:44, responseTime:"Within a few hours" },
  17: { bio:"Furniture maker and wood restoration expert. Crafts bespoke kitchens, wardrobes and TV units to your exact specs.", experience:"10+ years",  hourlyRate:900, availability:"working", portfolio:["Bespoke Kitchen","Wardrobes","TV Units","Wood Restore"],             avgRating:4.8, reviewCount:4, completedJobs:53, responseTime:"Within an hour" },
  18: { bio:"New to the platform but certified in electronic security systems. Eager to build reviews. First install 20% off!", experience:"1-2 years",  hourlyRate:550, availability:"online",  portfolio:["CCTV Setup","Alarm Systems","Door Locks"],                          avgRating:4.0, reviewCount:1, completedJobs:5,  responseTime:"Within a few hours" },
};

const seedReviews = {
  1:  [
    { clientName:"Zeshan Saeed", rating:5,   comment:"Fixed our kitchen leak in under an hour. Very professional and fair pricing.", service:"Kitchen Sink Repair",    date:"Jun 12, 2026" },
    { clientName:"Maria Aslam",  rating:5,   comment:"Reliable and tidy. Would definitely book again for future work.",              service:"Bathroom Pipe Fitting",   date:"May 28, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Replaced the entire water tank plumbing same day. Lifesaver!",                service:"Water Tank Pipe Fix",     date:"May 10, 2026" },
    { clientName:"Bilal Khan",   rating:4,   comment:"Good work overall. Arrived slightly late but got the job done properly.",     service:"Tap Installation",        date:"Apr 03, 2026" },
    { clientName:"Sara Malik",   rating:5,   comment:"Expert level plumbing. Cleaned up perfectly after finishing.",                service:"Full Bathroom Repiping",  date:"Mar 18, 2026" },
  ],
  2:  [
    { clientName:"Zeshan Saeed", rating:5,   comment:"Rewired our living room safely and quickly. Great attitude.",                 service:"House Wiring",            date:"Jun 01, 2026" },
    { clientName:"Usman Ghani",  rating:4,   comment:"Installed DB board without any issues. Reasonable rate.",                    service:"DB Board Install",        date:"May 15, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Solar wiring done professionally, everything is working perfectly.",         service:"Solar Wiring",            date:"Apr 20, 2026" },
    { clientName:"Bilal Khan",   rating:4,   comment:"Fixed faulty wiring, professional and on time.",                            service:"Fault Wiring Fix",        date:"Mar 05, 2026" },
  ],
  3:  [
    { clientName:"Maria Aslam",  rating:5,   comment:"Built a beautiful custom wardrobe. Exceptional attention to detail!",        service:"Custom Wardrobe",         date:"Jun 20, 2026" },
    { clientName:"Bilal Khan",   rating:5,   comment:"Excellent carpentry work, on time and left everything spotless.",            service:"Cabinet Repair",          date:"May 15, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Stunning kitchen cabinetry — exactly what we wanted. Highly recommend!",    service:"Kitchen Cabinets",        date:"Apr 28, 2026" },
    { clientName:"Sara Malik",   rating:5,   comment:"Made a full bedroom set in 5 days. Quality rivals branded furniture.",       service:"Bedroom Furniture Set",   date:"Apr 05, 2026" },
    { clientName:"Zeshan Saeed", rating:5,   comment:"Fixed our main door frame and installed new hinges. Perfect finish.",        service:"Door Frame Repair",       date:"Mar 12, 2026" },
    { clientName:"Nadia Perveen",rating:5,   comment:"Built a custom TV unit that fits perfectly. Very satisfied!",               service:"TV Unit Build",            date:"Feb 20, 2026" },
  ],
  4:  [
    { clientName:"Zeshan Saeed", rating:5,   comment:"AC was fixed same day in the middle of summer — absolute lifesaver.",       service:"AC Repair",               date:"Jun 25, 2026" },
    { clientName:"Maria Aslam",  rating:5,   comment:"Professional installation, cleaned up after the job completely.",           service:"AC Installation",          date:"May 18, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Serviced 3 ACs in one visit. Fast and thorough, great value.",              service:"3x AC Service",            date:"Apr 30, 2026" },
    { clientName:"Farhan Tahir", rating:4,   comment:"Duct work was done well, though he was slightly delayed.",                 service:"Duct Work",               date:"Apr 05, 2026" },
    { clientName:"Bilal Khan",   rating:5,   comment:"Installed chiller maintenance unit — very knowledgeable.",                 service:"Chiller Maintenance",     date:"Mar 22, 2026" },
  ],
  5:  [
    { clientName:"Hira Fatima",  rating:5,   comment:"Painted our entire flat in 2 days. Zero drips, perfect edges.",             service:"Full Flat Interior",       date:"Jun 08, 2026" },
    { clientName:"Usman Ghani",  rating:4,   comment:"Exterior walls painted well. Took slightly longer than quoted.",            service:"Exterior Painting",        date:"May 22, 2026" },
    { clientName:"Zeshan Saeed", rating:5,   comment:"Texture wall finish is stunning. Many guests have asked who did it!",      service:"Texture Finish",           date:"Apr 14, 2026" },
    { clientName:"Sara Malik",   rating:5,   comment:"Polish job on woodwork is immaculate. Would highly recommend.",             service:"Wood Polish",              date:"Mar 29, 2026" },
  ],
  6:  [
    { clientName:"Nadia Perveen",rating:5,   comment:"Office deep clean was incredible — smelled brand new after.",               service:"Office Deep Clean",        date:"Jun 05, 2026" },
    { clientName:"Maria Aslam",  rating:4,   comment:"Sofa wash was thorough, took about 2.5 hours which is expected.",          service:"Sofa Wash",                date:"May 10, 2026" },
    { clientName:"Farhan Tahir", rating:5,   comment:"Post-construction cleaning done perfectly, not a speck left.",              service:"Post-Construction Clean",  date:"Apr 20, 2026" },
  ],
  7:  [
    { clientName:"Khalid Meer",  rating:5,   comment:"Washing machine was fixed in 40 minutes. Even cleaned the filter.",        service:"Washing Machine Repair",   date:"Jun 15, 2026" },
    { clientName:"Zeshan Saeed", rating:5,   comment:"Fridge compressor fixed, comes with 30-day warranty as promised.",         service:"Fridge Compressor Fix",    date:"May 28, 2026" },
    { clientName:"Hira Fatima",  rating:4,   comment:"Geyser repair was quick. Comes back for follow-ups too.",                  service:"Geyser Repair",            date:"May 05, 2026" },
    { clientName:"Ambreen Raza", rating:5,   comment:"Microwave oven was beyond repair but he was honest about it. Integrity!",  service:"Oven Assessment",          date:"Apr 11, 2026" },
  ],
  8:  [
    { clientName:"Hira Fatima",  rating:5,   comment:"8 CCTV cameras installed neatly with full monitoring app setup.",          service:"CCTV Installation",        date:"Jun 18, 2026" },
    { clientName:"Zaid Ibrahim", rating:5,   comment:"Biometric lock + alarm in one afternoon. Very professional.",              service:"Biometric & Alarm",        date:"May 25, 2026" },
    { clientName:"Sara Malik",   rating:5,   comment:"Access control for office installed flawlessly. Staff love it.",           service:"Access Control Install",   date:"Apr 30, 2026" },
  ],
  9:  [
    { clientName:"Usman Ghani",  rating:5,   comment:"Gate and grills welded perfectly, even touched up the paint.",            service:"Gate & Grills",            date:"Jun 10, 2026" },
    { clientName:"Zaid Ibrahim", rating:5,   comment:"Custom steel railing for staircase — looks like professional imported.",  service:"Staircase Railing",        date:"May 18, 2026" },
    { clientName:"Farhan Tahir", rating:4,   comment:"Metal fabrication was solid. Slight delay but result was worth it.",      service:"Metal Fabrication",        date:"Apr 22, 2026" },
    { clientName:"Ambreen Raza", rating:5,   comment:"Structural steel repair for shop front done in record time.",              service:"Structural Repair",        date:"Mar 30, 2026" },
  ],
  10: [
    { clientName:"Maria Aslam",  rating:5,   comment:"Airport pickup on time, polite and knew exactly the best route.",         service:"Airport Transfer",         date:"Jun 20, 2026" },
    { clientName:"Bilal Khan",   rating:4,   comment:"Good driver for daily commute. Reliable and clean car.",                  service:"Daily Commute",            date:"May 30, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Family trip from Karachi to Hyderabad, safe and comfortable.",            service:"Long Distance Trip",        date:"Apr 15, 2026" },
  ],
  11: [
    { clientName:"Nadia Perveen",rating:4,   comment:"Assembled IKEA furniture quickly and correctly. Good value.",              service:"Furniture Assembly",       date:"Jun 01, 2026" },
    { clientName:"Usman Ghani",  rating:5,   comment:"Wall-mounted TV plus cable management, looks super clean now.",           service:"TV Wall Mount",             date:"May 05, 2026" },
  ],
  12: [
    { clientName:"Ambreen Raza", rating:5,   comment:"Waterproofed our roof and bathroom walls — no leaks after the rains.",    service:"Roof Waterproofing",       date:"Jun 12, 2026" },
    { clientName:"Khalid Meer",  rating:5,   comment:"Fixed a blocked drainage issue that had been troubling us for months.",   service:"Drainage Fix",             date:"May 20, 2026" },
    { clientName:"Sara Malik",   rating:4,   comment:"Pipe fitting was clean. Only minor delay at start due to traffic.",       service:"Pipe Fitting",             date:"Apr 28, 2026" },
  ],
  13: [
    { clientName:"Khalid Meer",  rating:5,   comment:"Solar panel system installed with full monitoring dashboard. Excellent!", service:"Solar Installation",        date:"Jun 08, 2026" },
    { clientName:"Ambreen Raza", rating:5,   comment:"Generator wiring done safely and neatly. Generator works perfectly.",    service:"Generator Wiring",         date:"May 15, 2026" },
    { clientName:"Farhan Tahir", rating:4,   comment:"House wiring was thorough. Rates are very competitive for the quality.",  service:"House Wiring",             date:"Apr 10, 2026" },
    { clientName:"Nadia Perveen",rating:5,   comment:"UPS setup was quick and he explained everything. Great experience.",      service:"UPS Setup",                date:"Mar 25, 2026" },
  ],
  14: [
    { clientName:"Zeshan Saeed", rating:4,   comment:"AC gas refill done fine. Still early days but seems reliable.",           service:"AC Gas Refill",            date:"Jun 22, 2026" },
  ],
  15: [
    { clientName:"Zeshan Saeed", rating:5,   comment:"House deep clean was spectacular. Every corner was spotless.",            service:"Full Home Deep Clean",     date:"Jun 14, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Mattress cleaning — instantly fresher and no more dust allergies!",       service:"Mattress Sanitisation",    date:"May 22, 2026" },
    { clientName:"Maria Aslam",  rating:5,   comment:"Kitchen degreasing was phenomenal. Looked brand new after.",             service:"Kitchen Degrease",         date:"Apr 30, 2026" },
    { clientName:"Sara Malik",   rating:5,   comment:"Carpet wash removed stains I thought were permanent. Highly recommend!",  service:"Carpet Wash",              date:"Apr 08, 2026" },
  ],
  16: [
    { clientName:"Bilal Khan",   rating:5,   comment:"3D paint in living room is absolutely stunning. Worth every rupee.",      service:"3D Paint Feature Wall",    date:"Jun 16, 2026" },
    { clientName:"Usman Ghani",  rating:5,   comment:"Stencil art in kids' room — my children are in love with it!",           service:"Stencil Art",              date:"May 28, 2026" },
    { clientName:"Ambreen Raza", rating:5,   comment:"Wallpaper installation was flawless, no bubbles or misalignment.",        service:"Wallpaper Install",        date:"May 04, 2026" },
    { clientName:"Nadia Perveen",rating:5,   comment:"Texture finish on bedroom walls is exactly what I pinned on Pinterest!",  service:"Texture Finish",           date:"Apr 12, 2026" },
    { clientName:"Zaid Ibrahim", rating:5,   comment:"Painted our entire villa. Incredibly neat and professional.",             service:"Villa Interior Paint",     date:"Mar 20, 2026" },
  ],
  17: [
    { clientName:"Zaid Ibrahim", rating:5,   comment:"Bespoke kitchen designed and built to perfection. Incredible craftsmanship.", service:"Bespoke Kitchen Build", date:"Jun 02, 2026" },
    { clientName:"Hira Fatima",  rating:5,   comment:"Full bedroom wardrobes with internal lighting. Looks absolutely stunning.",service:"Sliding Wardrobes",         date:"May 10, 2026" },
    { clientName:"Farhan Tahir", rating:5,   comment:"TV unit with hidden wire management. Very classy end result.",            service:"TV Unit with Wiring",      date:"Apr 18, 2026" },
    { clientName:"Khalid Meer",  rating:4,   comment:"Wood restoration on antique dining table — looks 10 years younger.",     service:"Wood Restoration",         date:"Mar 28, 2026" },
  ],
  18: [
    { clientName:"Nadia Perveen",rating:4,   comment:"CCTV setup was fine for a first-timer. Good attitude and followed up.",   service:"CCTV Setup",               date:"Jun 25, 2026" },
  ],
};

// Seed worker meta + reviews (only if not already set — preserves user edits)
Object.keys(seedWorkerMeta).forEach(id => {
  if (!localStorage.getItem(`hun_worker_meta_${id}`)) {
    localStorage.setItem(`hun_worker_meta_${id}`, JSON.stringify(seedWorkerMeta[id]));
  }
  if (!localStorage.getItem(`hun_reviews_worker_${id}`)) {
    localStorage.setItem(`hun_reviews_worker_${id}`, JSON.stringify(seedReviews[id] || []));
  }
});

// ═══════════════════════════════════════════════════
//  SEED REALISTIC JOBS
// ═══════════════════════════════════════════════════
(function seedJobs() {
  if (localStorage.getItem('hun_jobs_seeded_v3')) return;
  const existingJobs = JSON.parse(localStorage.getItem('hun_jobs') || '[]');
  const seededJobs = [
    { id:90001, clientId:101, clientName:"Zeshan Saeed",  clientImage:null, workerId:1,  workerName:"Tariq Mahmood",  workerImage:"https://randomuser.me/api/portraits/men/11.jpg",  service:"Kitchen Sink Repair",       skill:"Plumbing",        city:"Lahore",      address:"House 12, Gulberg III",     budget:2500,  description:"Leaking kitchen sink pipe needs fixing urgently.",                  preferredDate:"2026-06-12", timeWindow:"Morning (8am-12pm)",    urgent:false, status:"completed",   createdAt:"Jun 10, 2026", createdAtMs:Date.now()-30*86400000, acceptedAt:"Jun 11, 2026", startedAt:"Jun 12, 2026",  startedAtMs:Date.now()-30*86400000+3600000, completedAt:"Jun 12, 2026", reviewed:true,  rating:5,    reviewComment:"Fixed in under an hour!" },
    { id:90002, clientId:102, clientName:"Maria Aslam",   clientImage:null, workerId:3,  workerName:"Kamran Khan",    workerImage:"https://randomuser.me/api/portraits/men/33.jpg",  service:"Custom Wardrobe Build",      skill:"Carpentry",       city:"Karachi",     address:"Flat 5, Clifton Block 8",   budget:18000, description:"Need a custom 3-door wardrobe for master bedroom.",                 preferredDate:"2026-06-18", timeWindow:"Morning (8am-12pm)",    urgent:false, status:"completed",   createdAt:"Jun 16, 2026", createdAtMs:Date.now()-24*86400000, acceptedAt:"Jun 17, 2026", startedAt:"Jun 18, 2026",  startedAtMs:Date.now()-24*86400000+3600000, completedAt:"Jun 20, 2026", reviewed:true,  rating:5,    reviewComment:"Stunning work!" },
    { id:90003, clientId:104, clientName:"Hira Fatima",   clientImage:null, workerId:4,  workerName:"Ahmed Hassan",   workerImage:"https://randomuser.me/api/portraits/men/44.jpg",  service:"3x AC Full Service",         skill:"HVAC",            city:"Lahore",      address:"House 7, DHA Phase 5",      budget:6000,  description:"Three split ACs need full service before summer peak.",              preferredDate:"2026-06-25", timeWindow:"Afternoon (12pm-5pm)",  urgent:false, status:"completed",   createdAt:"Jun 23, 2026", createdAtMs:Date.now()-18*86400000, acceptedAt:"Jun 24, 2026", startedAt:"Jun 25, 2026",  startedAtMs:Date.now()-18*86400000+3600000, completedAt:"Jun 25, 2026", reviewed:true,  rating:5,    reviewComment:"Fast and thorough!" },
    { id:90004, clientId:110, clientName:"Ambreen Raza",  clientImage:null, workerId:8,  workerName:"Asif Mehmood",   workerImage:"https://randomuser.me/api/portraits/men/88.jpg",  service:"8-Camera CCTV System",       skill:"Security",        city:"Islamabad",   address:"House 22, F-7/2",           budget:15000, description:"8-camera CCTV system for villa perimeter.",                         preferredDate:"2026-07-11", timeWindow:"Morning (8am-12pm)",    urgent:false, status:"in_progress", createdAt:"Jul 09, 2026", createdAtMs:Date.now()-3*86400000,  acceptedAt:"Jul 10, 2026", startedAt:"Jul 11, 2026",  startedAtMs:Date.now()-6*3600000,           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
    { id:90005, clientId:106, clientName:"Sara Malik",    clientImage:null, workerId:5,  workerName:"Rizwan Akhtar",  workerImage:"https://randomuser.me/api/portraits/men/55.jpg",  service:"Full Flat Interior Paint",   skill:"Painting",        city:"Rawalpindi",  address:"Apt 3B, Bahria Town",       budget:12000, description:"2-bed flat needs fresh coat of paint, all rooms.",                  preferredDate:"2026-07-12", timeWindow:"Morning (8am-12pm)",    urgent:false, status:"in_progress", createdAt:"Jul 10, 2026", createdAtMs:Date.now()-2*86400000,  acceptedAt:"Jul 11, 2026", startedAt:"Jul 12, 2026",  startedAtMs:Date.now()-4*3600000,           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
    { id:90006, clientId:103, clientName:"Bilal Khan",    clientImage:null, workerId:2,  workerName:"Sajid Ali",      workerImage:"https://randomuser.me/api/portraits/men/22.jpg",  service:"Full House Rewiring",        skill:"Electrical",      city:"Islamabad",   address:"Street 14, G-9/3",          budget:8000,  description:"Full house rewiring needed, old 1990s wiring.",                     preferredDate:"2026-07-15", timeWindow:"Morning (8am-12pm)",    urgent:false, status:"requested",   createdAt:"Jul 12, 2026", createdAtMs:Date.now()-86400000,    acceptedAt:null,           startedAt:null,             startedAtMs:null,                           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
    { id:90007, clientId:107, clientName:"Farhan Tahir",  clientImage:null, workerId:9,  workerName:"Bilal Chaudhry", workerImage:"https://randomuser.me/api/portraits/men/12.jpg",  service:"Iron Gate Fabrication",      skill:"Welder",          city:"Karachi",     address:"Plot 44, North Karachi",    budget:9500,  description:"Need a custom iron gate for main entrance, 8 feet wide.",           preferredDate:"2026-07-16", timeWindow:"ASAP",                  urgent:true,  status:"requested",   createdAt:"Jul 12, 2026", createdAtMs:Date.now()-8*3600000,   acceptedAt:null,           startedAt:null,             startedAtMs:null,                           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
    { id:90008, clientId:111, clientName:"Zaid Ibrahim",  clientImage:null, workerId:15, workerName:"Sadia Bibi",     workerImage:"https://randomuser.me/api/portraits/women/11.jpg", service:"Full Villa Deep Clean",      skill:"Cleaning",        city:"Lahore",      address:"House 3, Model Town E",     budget:5000,  description:"Villa deep clean needed before in-laws arrive tomorrow.",            preferredDate:"2026-07-13", timeWindow:"ASAP",                  urgent:true,  status:"accepted",    createdAt:"Jul 11, 2026", createdAtMs:Date.now()-1.5*86400000,acceptedAt:"Jul 12, 2026", startedAt:null,             startedAtMs:null,                           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
    { id:90009, clientId:108, clientName:"Nadia Perveen", clientImage:null, workerId:13, workerName:"Hamza Rafiq",   workerImage:"https://randomuser.me/api/portraits/men/56.jpg",  service:"Solar Panel Wiring Install", skill:"Electrical",      city:"Multan",      address:"House 9, Gulgasht Colony",  budget:7500,  description:"6-panel solar setup needs wiring and inverter connection.",          preferredDate:"2026-07-13", timeWindow:"Morning (8am-12pm)",    urgent:false, status:"in_progress", createdAt:"Jul 12, 2026", createdAtMs:Date.now()-1*86400000,  acceptedAt:"Jul 12, 2026", startedAt:"Jul 13, 2026",  startedAtMs:Date.now()-2*3600000,           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
    { id:90010, clientId:105, clientName:"Usman Ghani",   clientImage:null, workerId:17, workerName:"Irfan Qureshi", workerImage:"https://randomuser.me/api/portraits/men/78.jpg",  service:"Kitchen Cabinet Rebuild",    skill:"Carpentry",       city:"Faisalabad",  address:"House 41, Peoples Colony",  budget:16000, description:"Rebuilding kitchen cabinets, water damage on lower units.",          preferredDate:"2026-07-13", timeWindow:"Afternoon (12pm-5pm)",  urgent:false, status:"in_progress", createdAt:"Jul 11, 2026", createdAtMs:Date.now()-2*86400000,  acceptedAt:"Jul 12, 2026", startedAt:"Jul 13, 2026",  startedAtMs:Date.now()-5*3600000,           completedAt:null,           reviewed:false, rating:null, reviewComment:null },
  ];
  const existingIds = new Set(existingJobs.map(j => j.id));
  const merged = [...seededJobs.filter(j => !existingIds.has(j.id)), ...existingJobs];
  localStorage.setItem('hun_jobs', JSON.stringify(merged));
  localStorage.setItem('hun_jobs_seeded_v3', '1');

  // Seed earnings ledger for demo workers
  if (!localStorage.getItem('hun_ledger_worker_1')) {
    localStorage.setItem('hun_ledger_worker_1', JSON.stringify([
      { desc:"Payment received — Kitchen Sink Repair (after 10% platform fee)", amount:2250, date:"Jun 12, 2026" },
      { desc:"Payment received — Bathroom Pipe Fitting (after 10% platform fee)", amount:2700, date:"May 28, 2026" },
      { desc:"Payment received — Tap Installation (after 10% platform fee)", amount:1350, date:"Apr 03, 2026" },
    ]));
  }
  if (!localStorage.getItem('hun_ledger_worker_3')) {
    localStorage.setItem('hun_ledger_worker_3', JSON.stringify([
      { desc:"Payment received — Custom Wardrobe Build (after 10% platform fee)", amount:16200, date:"Jun 20, 2026" },
      { desc:"Payment received — Kitchen Cabinets (after 10% platform fee)", amount:12600, date:"Apr 28, 2026" },
    ]));
  }
})();


// ═══════════════════════════════════════════════════
//  SESSION & ACCESS SECURITY (ADMIN ROUTE GUARDS)
// ═══════════════════════════════════════════════════
function checkAdminSession() {
  const session = JSON.parse(localStorage.getItem('currentUser'));
  if (!session || session.role !== 'admin') {
    const path = window.location.pathname.split('/').pop();
    localStorage.setItem('authRedirect', path || 'dashboard.html');
    window.location.href = 'auth.html?action=login&error=unauthorized';
  }
}

// ═══════════════════════════════════════════════════
//  VALIDATION HELPERS
// ═══════════════════════════════════════════════════
const Validation = {
  name:  (val) => val.trim().length >= 3 && /^[a-zA-Z\s]+$/.test(val),
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  phone: (val) => { const c = val.replace(/[-\s]/g,''); return /^(03|\+923|923)\d{9}$/.test(c); },
  cnic:  (val) => /^\d{5}-\d{7}-\d{1}$/.test(val),
  password: (val) => ({
    length:  val.length >= 8,
    upper:   /[A-Z]/.test(val),
    lower:   /[a-z]/.test(val),
    number:  /\d/.test(val),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(val)
  })
};

function formatCNICInput(inputEl) {
  inputEl.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    let f = '';
    if (v.length > 0) f += v.substring(0,5);
    if (v.length > 5) f += '-' + v.substring(5,12);
    if (v.length > 12) f += '-' + v.substring(12,13);
    e.target.value = f;
  });
}

function formatPhoneInput(inputEl) {
  inputEl.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('92')) v = '0' + v.substring(2);
    let f = '';
    if (v.length > 0) f += v.substring(0,4);
    if (v.length > 4) f += '-' + v.substring(4,11);
    e.target.value = f;
  });
}

// ═══════════════════════════════════════════════════
//  DYNAMIC NAVBAR SESSION SYNCHRONIZATION
// ═══════════════════════════════════════════════════
function initAuthNavbar() {
  const session = JSON.parse(localStorage.getItem('currentUser'));
  const navButtonsContainer   = document.querySelector('.nav-buttons');
  const mobileButtonsContainer = document.querySelector('.mobile-buttons');

  if (!session) { updateNavbarToDefault(); return; }

  injectNavbarStyles();
  const initials = getInitials(session.name);
  const avatarBg = session.image ? 'transparent' : '#1b5e37';
  const avatarContent = session.image
    ? `<img src="${session.image}" alt="${session.name}">`
    : `<span>${initials}</span>`;

  if (navButtonsContainer) {
    navButtonsContainer.innerHTML = `
      <div class="user-profile-dropdown" id="userProfileDropdown">
        <button class="profile-chip-btn" id="profileChipBtn">
          <div class="chip-avatar" style="background:${avatarBg};">${avatarContent}</div>
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
      </div>`;
    const dropBtn  = document.getElementById('profileChipBtn');
    const menuList = document.getElementById('dropdownMenuList');
    dropBtn.addEventListener('click', (e) => { e.stopPropagation(); menuList.classList.toggle('show'); });
    document.addEventListener('click', () => menuList.classList.remove('show'));
  }

  if (mobileButtonsContainer) {
    mobileButtonsContainer.innerHTML = `
      <div class="mobile-profile-container">
        <div class="mobile-profile-header">
          <div class="chip-avatar mobile-avatar" style="background:${avatarBg};">${avatarContent}</div>
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
      </div>`;
  }

  const doLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    showToastNotification('Logged out successfully!', 'info');
    setTimeout(() => window.location.href = 'index.html', 1000);
  };
  const dBtn = document.getElementById('navLogoutBtn');
  const mBtn = document.getElementById('mobileNavLogoutBtn');
  if (dBtn) dBtn.addEventListener('click', doLogout);
  if (mBtn) mBtn.addEventListener('click', doLogout);
}

function updateNavbarToDefault() {
  document.querySelectorAll('.login-btn, .mobile-login').forEach(b => b.onclick = () => window.location.href = 'auth.html?action=login');
  document.querySelectorAll('.signup-btn, .mobile-signup').forEach(b => b.onclick = () => window.location.href = 'auth.html?action=signup');
}

function getInitials(name) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2); }

function getDropdownLinks(role) {
  if (role === 'admin')  return `<a href="dashboard.html"><i class="fa-solid fa-chart-line"></i> Dashboard</a>`;
  if (role === 'worker') return `<a href="worker-dashboard.html"><i class="fa-solid fa-hard-hat"></i> Worker Portal</a>`;
  return `<a href="dashboard.html"><i class="fa-solid fa-circle-user"></i> My Portal</a>`;
}

// ═══════════════════════════════════════════════════
//  FEATURE MODAL (under construction)
// ═══════════════════════════════════════════════════
function showFeatureModal(role) {
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
      <div class="construction-icon"><i class="fa-solid fa-screwdriver-wrench"></i></div>
      <h3>Portal Coming Soon!</h3>
      <p>The <strong>${roleText}</strong> is currently under active development. In the next updates, you'll be able to manage orders, earnings, and more.</p>
      <button class="construction-ok-btn" onclick="closeFeatureModal()">Understood</button>
    </div>`;
  setTimeout(() => modal.classList.add('open'), 10);
}
function closeFeatureModal() {
  const modal = document.getElementById('constructionModal');
  if (modal) modal.classList.remove('open');
}

// ═══════════════════════════════════════════════════
//  NAVBAR STYLES (injected dynamically)
// ═══════════════════════════════════════════════════
function injectNavbarStyles() {
  if (document.getElementById('auth-nav-styles')) return;
  const s = document.createElement('style');
  s.id = 'auth-nav-styles';
  s.textContent = `
    .user-profile-dropdown{position:relative;font-family:'Inter',sans-serif}
    .profile-chip-btn{display:flex;align-items:center;gap:10px;background:rgba(27,94,55,.06);border:1.5px solid rgba(27,94,55,.18);border-radius:99px;padding:6px 14px;color:#0b1a10;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s cubic-bezier(.22,1,.36,1)}
    .profile-chip-btn:hover{background:rgba(27,94,55,.12);transform:translateY(-1px)}
    .chip-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;overflow:hidden;color:#fff;font-size:11px;font-weight:700;flex-shrink:0}
    .chip-avatar img{width:100%;height:100%;object-fit:cover}
    .chip-arrow{font-size:10px;color:#1b5e37;transition:transform .3s}
    .dropdown-menu-list{position:absolute;top:105%;right:0;width:210px;background:#fff;border:1px solid rgba(27,94,55,.15);border-radius:14px;box-shadow:0 10px 30px rgba(11,26,16,.1);padding:8px;display:flex;flex-direction:column;gap:4px;opacity:0;visibility:hidden;transform:translateY(10px);transition:all .3s cubic-bezier(.22,1,.36,1);z-index:1000}
    .dropdown-menu-list.show{opacity:1;visibility:visible;transform:translateY(0)}
    .dropdown-header{padding:8px 12px;display:flex;flex-direction:column;gap:2px}
    .dropdown-header strong{color:#0b1a10;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .role-badge{font-size:9px;font-weight:800;color:#1b5e37;background:#e8f5ed;padding:2px 6px;border-radius:4px;align-self:flex-start;margin-top:2px}
    .dropdown-menu-list hr{border:0;border-top:1px solid rgba(27,94,55,.08);margin:4px 0}
    .dropdown-menu-list a{padding:8px 12px;border-radius:8px;font-size:13px;font-weight:600;color:#4a6741;display:flex;align-items:center;gap:10px;transition:all .2s}
    .dropdown-menu-list a:hover{background:#e8f5ed;color:#1b5e37}
    .dropdown-menu-list a i{font-size:14px;color:#1b5e37}
    .dropdown-menu-list .logout-link{color:#ef4444}
    .dropdown-menu-list .logout-link:hover{background:#fef2f2;color:#dc2626}
    .dropdown-menu-list .logout-link i{color:inherit}
    .mobile-profile-container{display:flex;flex-direction:column;gap:16px;padding:12px;background:rgba(255,255,255,.08);border-radius:16px;border:1px solid rgba(255,255,255,.15);color:#fff}
    .mobile-profile-header{display:flex;align-items:center;gap:12px}
    .mobile-avatar{width:40px;height:40px;border:2px solid rgba(255,255,255,.5)}
    .mobile-user-name{font-weight:700;font-size:15px}
    .mobile-user-role{font-size:10px;font-weight:800;color:#a7f3d0;letter-spacing:.5px}
    .mobile-profile-links{display:flex;flex-direction:column;gap:10px}
    .mobile-profile-links a{color:rgba(255,255,255,.85)!important;font-size:14px;font-weight:600;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;gap:10px}
    .mobile-logout-btn{width:100%;background:rgba(239,68,68,.2);border:1px solid rgba(239,68,68,.4);color:#fca5a5;padding:10px;border-radius:10px;font-weight:700;font-size:13px;margin-top:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px}
    .construction-modal-overlay{position:fixed;inset:0;background:rgba(11,26,16,.5);backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .3s}
    .construction-modal-overlay.open{opacity:1;pointer-events:all}
    .construction-modal-box{background:#fff;border-radius:24px;padding:32px;width:90%;max-width:440px;box-shadow:0 20px 60px rgba(11,26,16,.18);position:relative;text-align:center;transform:scale(.9);transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
    .construction-modal-overlay.open .construction-modal-box{transform:scale(1)}
    .construction-modal-close{position:absolute;top:14px;right:18px;font-size:26px;color:#94a3b8;background:none;border:none;cursor:pointer}
    .construction-icon{width:68px;height:68px;border-radius:20px;background:#e8f5ed;color:#1b5e37;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;animation:constructionBob 3s ease-in-out infinite}
    @keyframes constructionBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    .construction-modal-box h3{font-family:'Sora',sans-serif;font-size:20px;font-weight:800;color:#1b5e37;margin-bottom:12px}
    .construction-modal-box p{font-size:14px;color:#4e6a57;line-height:1.6;margin-bottom:24px}
    .construction-ok-btn{background:#1b5e37;color:#fff;padding:12px 28px;border-radius:99px;font-weight:700;font-size:14px;width:100%;cursor:pointer;transition:all .3s;border:none}
    .construction-ok-btn:hover{background:#134228;box-shadow:0 6px 20px rgba(27,94,55,.25)}
  `;
  document.head.appendChild(s);
}

// ═══════════════════════════════════════════════════
//  COMMON TOAST NOTIFICATION
// ═══════════════════════════════════════════════════
function showToastNotification(message, type = 'success') {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = (type==='success'?'✅ ':type==='error'?'❌ ':'ℹ️ ') + message;
  t.classList.add('show');
  clearTimeout(t._tid);
  t._tid = setTimeout(() => t.classList.remove('show'), 3000);
}

// Auto-run when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => { initAuthNavbar(); });
