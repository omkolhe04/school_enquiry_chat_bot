/**
 * database/seed.js
 * Seed the MongoDB database with 30+ college intents
 * Run: node database/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Intent   = require('../models/Intent');

const INTENTS = [
  // ── ADMISSIONS ──────────────────────────────────────────────────────────────
  {
    intentName:   'admission_process',
    displayName:  'Admission Process',
    category:     'admissions',
    trainingPhrases: [
      'how to apply for admission',
      'what is the admission process',
      'how do I get admitted',
      'admission procedure',
      'steps to join college',
      'how to enroll in college',
      'application process for admission',
      'how to apply to your college',
      'what are the steps for admission',
      'college admission steps',
    ],
    responses: [
      '📋 **Admission Process at {{COLLEGE_NAME}}:**\n\n1. Fill the online application at {{WEBSITE}}/apply\n2. Submit academic transcripts & certificates\n3. Pay the application fee (₹500 non-refundable)\n4. Appear for the entrance test / counselling\n5. Receive offer letter and pay seat confirmation fee\n6. Submit originals during document verification\n\nFor help call us at {{PHONE}} or email {{EMAIL}} 😊',
      '🎓 To join {{COLLEGE_NAME}}, visit {{WEBSITE}}/apply and complete the online form. Shortlisted candidates are called for counselling. Need help? Email {{EMAIL}}!',
    ],
    entities: ['course', 'year'],
  },
  {
    intentName:   'admission_eligibility',
    displayName:  'Admission Eligibility',
    category:     'admissions',
    trainingPhrases: [
      'what are the eligibility criteria',
      'who can apply',
      'minimum marks for admission',
      'eligibility for BTech',
      'what percentage is needed',
      'cutoff marks for admission',
      'can I apply with 60 percent',
      'qualification required',
      'admission requirements',
      'academic requirements for college',
    ],
    responses: [
      '✅ **Eligibility Criteria:**\n\n• **B.Tech / B.E.:** 10+2 with Physics, Chemistry & Maths — min **60%** aggregate\n• **BCA / B.Sc CS:** 10+2 (any stream) — min **55%** aggregate\n• **MBA / MCA:** Graduation in relevant field — min **50%** aggregate\n• **M.Tech / M.E.:** B.Tech/B.E. — min **55%** aggregate\n\nSC/ST/OBC candidates: 5% relaxation applies. Visit {{WEBSITE}} for full details.',
    ],
    entities: ['course'],
  },
  {
    intentName:   'admission_dates',
    displayName:  'Admission Dates',
    category:     'admissions',
    trainingPhrases: [
      'when does admission start',
      'last date for admission',
      'admission deadline',
      'when is the last date to apply',
      'admission schedule',
      'when will admissions open',
      'what are admission dates',
      'registration deadline',
      'application closing date',
    ],
    responses: [
      '📅 **Admission Schedule 2024–25:**\n\n| Event | Date |\n|---|---|\n| Application Opens | 1 April 2025 |\n| Last Date to Apply | 30 June 2025 |\n| Entrance Test | 15 July 2025 |\n| Counselling Starts | 25 July 2025 |\n| Classes Begin | 1 August 2025 |\n\nStay updated at {{WEBSITE}} or call {{PHONE}}.',
    ],
    entities: ['year'],
  },

  // ── COURSES ─────────────────────────────────────────────────────────────────
  {
    intentName:   'course_details',
    displayName:  'Course Details',
    category:     'academics',
    trainingPhrases: [
      'what courses are offered',
      'list of programs',
      'which departments are available',
      'what can I study here',
      'available courses',
      'programs offered',
      'what branches does the college have',
      'tell me about your courses',
      'undergraduate programs',
      'postgraduate programs',
    ],
    responses: [
      '📚 **Programs at {{COLLEGE_NAME}}:**\n\n**Undergraduate (4-year):**\n• B.Tech — CSE, ECE, ME, Civil, EE, IT, AI & ML\n• BCA, B.Sc (CS, Physics, Math)\n\n**Postgraduate (2-year):**\n• M.Tech — CSE, ECE, VLSI, Power Systems\n• MCA, M.Sc, MBA\n\n**Doctoral:**\n• Ph.D (all departments)\n\nVisit {{WEBSITE}}/courses for detailed syllabi.',
    ],
    entities: ['course', 'department'],
  },
  {
    intentName:   'course_duration',
    displayName:  'Course Duration',
    category:     'academics',
    trainingPhrases: [
      'how long is the course',
      'duration of BTech',
      'how many years is the program',
      'course length',
      'how many semesters',
      'BTech duration',
      'MBA duration',
      'MCA how many years',
    ],
    responses: [
      '⏱️ **Course Durations:**\n\n| Program | Duration | Semesters |\n|---|---|---|\n| B.Tech / B.E. | 4 Years | 8 |\n| BCA | 3 Years | 6 |\n| B.Sc | 3 Years | 6 |\n| M.Tech | 2 Years | 4 |\n| MBA | 2 Years | 4 |\n| MCA | 2 Years | 4 |\n| Ph.D | 3–5 Years | — |',
    ],
    entities: ['course'],
  },
  {
    intentName:   'syllabus',
    displayName:  'Syllabus & Curriculum',
    category:     'academics',
    trainingPhrases: [
      'what is the syllabus',
      'curriculum details',
      'subjects in first year',
      'what subjects are taught',
      'course content',
      'semester subjects',
      'academic curriculum',
      'what will I study in BTech',
    ],
    responses: [
      '📖 The syllabus is designed as per the latest industry standards and university guidelines. You can download semester-wise syllabi from {{WEBSITE}}/academics/syllabus. Need a specific branch? Just ask e.g. "syllabus for CSE" and I\'ll guide you! 😊',
    ],
    entities: ['course', 'semester', 'department'],
  },

  // ── FEES ────────────────────────────────────────────────────────────────────
  {
    intentName:   'fee_structure',
    displayName:  'Fee Structure',
    category:     'fees',
    trainingPhrases: [
      'what is the fee structure',
      'how much does it cost',
      'tuition fees',
      'college fees',
      'annual fees',
      'total fees for BTech',
      'how much is the fee',
      'fee details',
      'semester fee',
      'what is the cost of education',
    ],
    responses: [
      '💰 **Fee Structure 2024–25 (per annum):**\n\n| Program | Tuition Fee | Other Fees | Total |\n|---|---|---|---|\n| B.Tech | ₹85,000 | ₹15,000 | ₹1,00,000 |\n| BCA | ₹50,000 | ₹10,000 | ₹60,000 |\n| M.Tech | ₹75,000 | ₹12,000 | ₹87,000 |\n| MBA | ₹90,000 | ₹15,000 | ₹1,05,000 |\n| MCA | ₹65,000 | ₹10,000 | ₹75,000 |\n\n*Hostel & mess fees are additional. Scholarships available for meritorious students.*',
    ],
    entities: ['course'],
  },
  {
    intentName:   'fee_payment',
    displayName:  'Fee Payment Methods',
    category:     'fees',
    trainingPhrases: [
      'how to pay fees',
      'fee payment options',
      'online fee payment',
      'can I pay fees in installments',
      'fee payment deadline',
      'methods to pay tuition',
      'pay fees online',
    ],
    responses: [
      '💳 **Fee Payment Options:**\n\n• **Online:** Net banking, UPI, Credit/Debit Card via {{WEBSITE}}/pay\n• **DD/Cheque:** In favour of "{{COLLEGE_NAME}}"\n• **Counter:** Accounts department (Mon–Sat, 9 AM – 4 PM)\n\n📌 Instalment plan available: 60% at admission, 40% by November 30.\n\nFor payment receipts, contact accounts@git.edu',
    ],
    entities: [],
  },
  {
    intentName:   'scholarships',
    displayName:  'Scholarships & Financial Aid',
    category:     'fees',
    trainingPhrases: [
      'are scholarships available',
      'financial aid for students',
      'scholarship criteria',
      'merit scholarship',
      'how to get scholarship',
      'fee waiver',
      'government scholarship',
      'minority scholarship',
      'free education',
      'scholarship for poor students',
    ],
    responses: [
      '🎖️ **Scholarships at {{COLLEGE_NAME}}:**\n\n• **Merit Scholarship:** Top 5% students — 50% fee waiver\n• **Government Schemes:** SC/ST/OBC & EBC — apply via scholarship portal\n• **Sports Scholarship:** State/national level athletes\n• **Minority Scholarship:** As per Govt of India norms\n• **Need-based Aid:** EMI plans & fee deferral options\n\nApply at {{WEBSITE}}/scholarships. Deadline: August 31 each year.',
    ],
    entities: [],
  },

  // ── EXAMINATIONS ────────────────────────────────────────────────────────────
  {
    intentName:   'exam_schedule',
    displayName:  'Exam Schedule',
    category:     'academics',
    trainingPhrases: [
      'when are exams',
      'exam timetable',
      'exam schedule',
      'when is the semester exam',
      'final exam dates',
      'internal exam dates',
      'midterm schedule',
      'when does exam start',
      'examination calendar',
    ],
    responses: [
      '📅 **Examination Calendar:**\n\n**Odd Semester (July–Nov):**\n• Internal Assessments: September & October\n• End-Semester Exam: November 20 – December 10\n\n**Even Semester (Jan–May):**\n• Internal Assessments: February & March\n• End-Semester Exam: April 25 – May 15\n\nDetailed date sheets are published on {{WEBSITE}}/exams 3 weeks before exams.',
    ],
    entities: ['semester', 'year'],
  },
  {
    intentName:   'exam_results',
    displayName:  'Exam Results',
    category:     'academics',
    trainingPhrases: [
      'when will results be out',
      'how to check results',
      'result announcement',
      'marksheet download',
      'exam result date',
      'when are results published',
      'semester results',
      'check my grades',
      'result link',
    ],
    responses: [
      '📊 Results are usually published within **30 days** of the last exam. Check your results at:\n\n🔗 {{WEBSITE}}/results\n\nYou\'ll need your **Roll Number** and **Date of Birth** to log in. Marksheets are available 2 weeks after results. For discrepancies, apply for revaluation within 10 days of result declaration.',
    ],
    entities: ['semester'],
  },
  {
    intentName:   'backlog_reappear',
    displayName:  'Backlog / Reappear Exam',
    category:     'academics',
    trainingPhrases: [
      'backlog exam',
      'reappear in exam',
      'failed in subject',
      'supplementary exam',
      'improvement exam',
      'how to clear backlog',
      'can I reattempt exam',
      'ex-student exam',
    ],
    responses: [
      '📝 Students with backlogs can appear in **Supplementary Exams** held alongside the regular end-semester exams. Steps:\n\n1. Fill the backlog form on the student portal\n2. Pay the re-appear fee (₹500 per subject)\n3. Download admit card from portal\n\nMax **6 attempts** per subject. Contact the exam cell at examcell@git.edu for special cases.',
    ],
    entities: [],
  },

  // ── FACULTY ─────────────────────────────────────────────────────────────────
  {
    intentName:   'faculty_information',
    displayName:  'Faculty Information',
    category:     'academics',
    trainingPhrases: [
      'tell me about the faculty',
      'who are the professors',
      'faculty details',
      'teaching staff',
      'how many professors',
      'faculty qualification',
      'experienced teachers',
      'faculty list',
      'department professors',
      'who teaches BTech',
    ],
    responses: [
      '👨‍🏫 **Faculty at {{COLLEGE_NAME}}:**\n\n• **Total Faculty:** 250+ highly qualified professors\n• **Ph.D Holders:** 80% of senior faculty\n• **Industry Experience:** 40% faculty with 5+ years industry background\n• **Research Publications:** 500+ papers in national/international journals\n\nNotable faculty profiles available at {{WEBSITE}}/faculty. You can also email specific departments directly — contact details on the website!',
    ],
    entities: ['department'],
  },
  {
    intentName:   'hod_contacts',
    displayName:  'HOD / Department Contacts',
    category:     'academics',
    trainingPhrases: [
      'contact HOD',
      'who is head of department',
      'department head',
      'HOD email',
      'contact CSE department',
      'ECE department head',
      'department contact number',
    ],
    responses: [
      '📞 **Department Heads:**\n\n| Dept | HOD | Email |\n|---|---|---|\n| CSE | Dr. A. Sharma | hod.cse@git.edu |\n| ECE | Dr. P. Nair | hod.ece@git.edu |\n| ME | Dr. R. Verma | hod.me@git.edu |\n| Civil | Dr. S. Khan | hod.civil@git.edu |\n| MBA | Prof. M. Gupta | hod.mba@git.edu |\n\nFor others, visit {{WEBSITE}}/departments',
    ],
    entities: ['department'],
  },

  // ── CAMPUS FACILITIES ───────────────────────────────────────────────────────
  {
    intentName:   'campus_facilities',
    displayName:  'Campus Facilities',
    category:     'campus',
    trainingPhrases: [
      'what facilities are available',
      'campus amenities',
      'infrastructure details',
      'what is in the campus',
      'sports facilities',
      'labs and equipment',
      'college infrastructure',
      'campus life',
      'what does campus offer',
    ],
    responses: [
      '🏛️ **Campus Facilities at {{COLLEGE_NAME}}:**\n\n• 🔬 **Labs:** 50+ state-of-the-art laboratories\n• 📚 **Library:** 1 lakh+ books, e-journals, IEEE & Scopus access\n• 🏋️ **Sports:** Cricket ground, football field, basketball court, gym\n• 🍽️ **Cafeteria:** 3 canteens with hygienic, affordable meals\n• 🏠 **Hostel:** Separate boys & girls hostels (AC & non-AC)\n• 🏥 **Medical:** 24×7 on-campus health centre\n• 🚌 **Transport:** Bus service covering 30+ city routes\n• 📶 **Wi-Fi:** High-speed campus-wide internet',
    ],
    entities: [],
  },
  {
    intentName:   'hostel_details',
    displayName:  'Hostel Details',
    category:     'campus',
    trainingPhrases: [
      'is hostel available',
      'hostel fees',
      'accommodation on campus',
      'boys hostel',
      'girls hostel',
      'hostel facilities',
      'can I stay in hostel',
      'hostel room types',
      'hostel food',
      'hostel apply',
    ],
    responses: [
      '🏠 **Hostel Information:**\n\n**Availability:** Separate boys & girls hostels (capacity 1,200 students)\n\n**Room Types & Fees (per annum):**\n| Type | Fee |\n|---|---|\n| 4-seater (non-AC) | ₹45,000 |\n| 2-seater (non-AC) | ₹60,000 |\n| Single (AC) | ₹85,000 |\n\n**Includes:** Mess charges, 24×7 security, Wi-Fi, laundry\n\nApply at {{WEBSITE}}/hostel. Limited seats — apply early!',
    ],
    entities: [],
  },
  {
    intentName:   'library',
    displayName:  'Library',
    category:     'campus',
    trainingPhrases: [
      'library timings',
      'how many books in library',
      'library facilities',
      'library membership',
      'digital library',
      'e-library access',
      'can I access journals',
      'library hours',
    ],
    responses: [
      '📚 **Central Library:**\n\n• **Books:** 1,20,000+ volumes across all disciplines\n• **Journals:** 200+ print journals + IEEE, Elsevier, Springer (digital)\n• **Timings:** Mon–Sat 8:00 AM – 9:00 PM | Sun 10:00 AM – 5:00 PM\n• **Digital Access:** Available 24×7 via student portal\n• **Borrowing:** 4 books at a time for 14 days\n\nLibrary card issued during orientation week. For remote access: library@git.edu',
    ],
    entities: [],
  },
  {
    intentName:   'placements',
    displayName:  'Placements & Careers',
    category:     'campus',
    trainingPhrases: [
      'placement details',
      'what is placement record',
      'highest package',
      'companies that visit campus',
      'placement statistics',
      'how is placement here',
      'job opportunities',
      'campus recruitment',
      'placement percentage',
      'which companies hire from here',
    ],
    responses: [
      '💼 **Placement Highlights (2024):**\n\n• **Placement Rate:** 92% of eligible students placed\n• **Highest Package:** ₹42 LPA (Amazon)\n• **Average Package:** ₹8.5 LPA\n• **Companies Visited:** 150+ including TCS, Infosys, Wipro, Accenture, Amazon, Microsoft, Deloitte\n• **Sectors:** IT, Core Engg, Finance, Consulting, Government\n\n🔗 Full report at {{WEBSITE}}/placements\nContact placement cell: placement@git.edu',
    ],
    entities: [],
  },

  // ── EVENTS ──────────────────────────────────────────────────────────────────
  {
    intentName:   'events',
    displayName:  'College Events',
    category:     'events',
    trainingPhrases: [
      'upcoming events',
      'college fest',
      'annual day',
      'technical events',
      'cultural events',
      'what events are happening',
      'college activities',
      'tech fest',
      'sports day',
      'cultural fest',
    ],
    responses: [
      '🎉 **Upcoming Events at {{COLLEGE_NAME}}:**\n\n🔧 **TechVision 2025** — National Tech Fest | March 15–17\n🎭 **Crescendo** — Annual Cultural Fest | April 5–7\n⚽ **Intercollege Sports Meet** — February 20–25\n🏆 **Hackathon 24H** — March 1\n🎓 **Convocation Ceremony** — June 15\n\nRegister at {{WEBSITE}}/events. Watch this space for more! 🚀',
    ],
    entities: [],
  },
  {
    intentName:   'clubs_societies',
    displayName:  'Clubs & Societies',
    category:     'events',
    trainingPhrases: [
      'what clubs are there',
      'student clubs',
      'extracurricular activities',
      'societies in college',
      'how to join a club',
      'coding club',
      'robotics club',
      'NSS NCC',
      'student activities',
    ],
    responses: [
      '🎯 **Student Clubs & Societies:**\n\n**Technical:** Coding Club, Robotics Club, IoT Lab, AI/ML Society\n**Cultural:** Drama Club, Music Society, Dance Troupe, Photography Club\n**Sports:** Cricket, Football, Basketball, Chess, Athletics teams\n**Social:** NSS, NCC, Environment Club, Literary Society\n\nJoin during the Club Fair (first week of each semester). Details at {{WEBSITE}}/student-life',
    ],
    entities: [],
  },

  // ── CONTACT ─────────────────────────────────────────────────────────────────
  {
    intentName:   'contact_details',
    displayName:  'Contact Details',
    category:     'contact',
    trainingPhrases: [
      'contact details',
      'how to contact college',
      'phone number of college',
      'email address',
      'college address',
      'where is the college',
      'how to reach you',
      'contact information',
      'helpline number',
      'get in touch',
    ],
    responses: [
      '📬 **{{COLLEGE_NAME}} — Contact Us:**\n\n📞 **Phone:** {{PHONE}}\n📧 **Email:** {{EMAIL}}\n🌐 **Website:** {{WEBSITE}}\n📍 **Address:** {{ADDRESS}}\n\n**Office Hours:** Mon–Sat, 9:00 AM – 5:00 PM\n\nFor specific queries:\n• Admissions: admissions@git.edu\n• Exams: examcell@git.edu\n• Placements: placement@git.edu',
    ],
    entities: [],
  },
  {
    intentName:   'location_directions',
    displayName:  'Location & Directions',
    category:     'contact',
    trainingPhrases: [
      'how to reach college',
      'location of college',
      'directions to campus',
      'nearest metro station',
      'bus to college',
      'how far from railway station',
      'google maps location',
      'campus location',
    ],
    responses: [
      '🗺️ **How to Reach {{COLLEGE_NAME}}:**\n\n📍 **Address:** {{ADDRESS}}\n\n🚌 **By Bus:** Routes 42, 78, 105 stop at College Gate\n🚇 **By Metro:** Nearest station — Tech Park Metro (2 km, auto available)\n🚆 **By Train:** City Central Station (8 km, cab 20 mins)\n✈️ **By Air:** International Airport (25 km, 40 mins by cab)\n\n🔗 Google Maps: {{WEBSITE}}/map',
    ],
    entities: [],
  },

  // ── GENERAL ─────────────────────────────────────────────────────────────────
  {
    intentName:   'greetings',
    displayName:  'Greetings',
    category:     'general',
    trainingPhrases: [
      'hello',
      'hi',
      'hey',
      'good morning',
      'good afternoon',
      'good evening',
      'hi there',
      'howdy',
      'what\'s up',
      'greetings',
    ],
    responses: [
      '👋 Hello! Welcome to {{COLLEGE_NAME}}\'s virtual assistant! How can I help you today?\n\nYou can ask me about:\n• Admissions & Eligibility\n• Courses & Syllabus\n• Fees & Scholarships\n• Exams & Results\n• Campus Facilities\n• Placements\n• Events & Clubs\n• Contact Details',
      '😊 Hi there! I\'m the {{COLLEGE_NAME}} chatbot, here 24×7 to answer your queries! What would you like to know?',
    ],
    entities: [],
  },
  {
    intentName:   'thanks',
    displayName:  'Thank You',
    category:     'general',
    trainingPhrases: [
      'thank you',
      'thanks',
      'thanks a lot',
      'thank you so much',
      'that was helpful',
      'great help',
      'you are helpful',
      'appreciate it',
    ],
    responses: [
      '😊 You\'re welcome! Feel free to ask if you have more questions. We\'re always happy to help!',
      '🙌 Happy to help! Is there anything else you\'d like to know about {{COLLEGE_NAME}}?',
    ],
    entities: [],
  },
  {
    intentName:   'about_college',
    displayName:  'About the College',
    category:     'general',
    trainingPhrases: [
      'tell me about the college',
      'about your college',
      'college overview',
      'history of college',
      'when was college established',
      'who founded the college',
      'college ranking',
      'NAAC accreditation',
      'college profile',
      'is college approved',
    ],
    responses: [
      '🏫 **About {{COLLEGE_NAME}}:**\n\n{{COLLEGE_NAME}} (GIT) was established in 2001 and is one of the top-ranked technical institutions in the region.\n\n🏆 **Key Highlights:**\n• NAAC Accredited — A++ Grade\n• NBA Accredited programs\n• NIRF Ranking — Top 150 Engineering Colleges (India)\n• 5000+ students across 15+ programs\n• 250+ expert faculty\n• 150+ industry recruiters\n\nVisit {{WEBSITE}} to know more!',
    ],
    entities: [],
  },
  {
    intentName:   'affiliation',
    displayName:  'Affiliation & Recognition',
    category:     'general',
    trainingPhrases: [
      'which university is college affiliated to',
      'is college approved by AICTE',
      'university affiliation',
      'recognized by UGC',
      'autonomous college',
      'AICTE approval',
    ],
    responses: [
      '📜 **Affiliation & Approvals:**\n\n• **Affiliated to:** State Technical University (STU)\n• **Approved by:** AICTE (All India Council for Technical Education)\n• **Recognised by:** UGC (University Grants Commission)\n• **Accreditation:** NAAC A++ | NBA (CSE, ECE, ME)\n• **ISO:** 9001:2015 Certified Institution\n\nAll degrees are government-recognised and globally accepted.',
    ],
    entities: [],
  },
  {
    intentName:   'transport_bus',
    displayName:  'College Transport / Bus',
    category:     'campus',
    trainingPhrases: [
      'college bus service',
      'bus routes',
      'transport facility',
      'bus fee',
      'how to avail transport',
      'shuttle service',
      'bus timing',
      'pickup points',
      'transportation from city',
    ],
    responses: [
      '🚌 **College Transport:**\n\n• **Routes:** 30+ routes covering the entire city\n• **Buses:** 25 AC & non-AC buses\n• **Pick-up Points:** 150+ city locations\n• **Timings:** Pick-up starts 7:15 AM | Drop starts 5:00 PM\n\n**Annual Bus Fee:**\n• Within 15 km — ₹18,000\n• 15–30 km — ₹22,000\n• 30+ km — ₹26,000\n\nRegister for transport at {{WEBSITE}}/transport',
    ],
    entities: [],
  },
  {
    intentName:   'internship',
    displayName:  'Internships',
    category:     'campus',
    trainingPhrases: [
      'internship opportunities',
      'how to get internship',
      'summer internship',
      'industrial training',
      'company internship',
      'internship program',
      'paid internship',
      'sixth semester internship',
    ],
    responses: [
      '💼 **Internship Program:**\n\n• **Mandatory Internship:** 6–8 weeks (after 4th/6th semester)\n• **Companies:** TCS, Infosys, Wipro, startups & core industry firms\n• **Stipend:** ₹5,000–₹25,000/month (varies by company)\n• **Portal:** Register at {{WEBSITE}}/internships\n• **Assistance:** Training & Placement Cell helps with applications and interviews\n\nAlso check LinkedIn, Internshala for additional opportunities!',
    ],
    entities: [],
  },
  {
    intentName:   'sports_facilities',
    displayName:  'Sports Facilities',
    category:     'campus',
    trainingPhrases: [
      'sports facilities',
      'gym in college',
      'cricket ground',
      'football field',
      'basketball court',
      'swimming pool',
      'sports complex',
      'indoor games',
      'outdoor sports',
    ],
    responses: [
      '⚽ **Sports Facilities:**\n\n**Outdoor:** Cricket ground, Football field (FIFA standard), Athletics track, Tennis courts (4), Basketball courts (3), Volleyball courts (2)\n\n**Indoor:** Gymnasium, Badminton hall (6 courts), Table tennis, Carrom, Chess room\n\n**Wellness:** Fully equipped gym (250+ machines), Yoga centre, 25m Swimming pool\n\nAll facilities open daily 6 AM–8 PM. Free for all enrolled students!',
    ],
    entities: [],
  },
  {
    intentName:   'research',
    displayName:  'Research & Projects',
    category:     'academics',
    trainingPhrases: [
      'research opportunities',
      'can students do research',
      'project facilities',
      'research labs',
      'innovation centre',
      'funded research projects',
      'research publications',
      'incubation centre',
      'startup support',
    ],
    responses: [
      '🔬 **Research & Innovation:**\n\n• **Research Centres:** AI Lab, IoT Centre, Robotics Lab, Green Energy Lab\n• **Funded Projects:** 50+ ongoing government & industry funded projects\n• **Publications:** 500+ per year in indexed journals\n• **Patents:** 35+ filed & granted\n• **Incubation:** GIT Innovation Hub supports 20+ student startups\n• **SERB / DST / DBT funded:** Eligible faculty projects\n\nStudent projects: {{WEBSITE}}/research',
    ],
    entities: [],
  },
  {
    intentName:   'anti_ragging',
    displayName:  'Anti-Ragging Policy',
    category:     'general',
    trainingPhrases: [
      'anti ragging',
      'ragging complaint',
      'is ragging an issue',
      'safe campus',
      'harassment complaint',
      'how to report ragging',
      'ragging policy',
    ],
    responses: [
      '🛡️ **Anti-Ragging Policy:**\n\n{{COLLEGE_NAME}} maintains a **ZERO TOLERANCE** policy against ragging.\n\n• 24×7 Anti-Ragging Helpline: **1800-180-5522**\n• Campus Surveillance: CCTV across all areas\n• Anti-Ragging Committee: Active & responsive\n• Online Complaint: {{WEBSITE}}/anti-ragging\n\nRagging is a criminal offence. Any incident will result in immediate expulsion and police action. Your safety is our priority! 💪',
    ],
    entities: [],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college_chatbot');
    console.log('✅  Connected to MongoDB');

    // Clear existing intents
    await Intent.deleteMany({});
    console.log('🗑️   Cleared existing intents');

    // Insert all intents
    const inserted = await Intent.insertMany(INTENTS);
    console.log(`🌱  Seeded ${inserted.length} intents successfully!\n`);

    // Display summary
    const categories = {};
    INTENTS.forEach(({ category }) => {
      categories[category] = (categories[category] || 0) + 1;
    });
    console.log('📊  Intent distribution:');
    Object.entries(categories).forEach(([cat, count]) =>
      console.log(`    ${cat.padEnd(12)} : ${count} intents`)
    );

    console.log('\n✨  Database seeded! Run "npm start" to launch the chatbot.');
  } catch (err) {
    console.error('❌  Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
