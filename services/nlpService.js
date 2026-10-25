/**
 * services/nlpService.js — v5 ULTIMATE EDITION
 * 1000+ questions | 175+ intents | 22 categories
 * Covers: Admission, Courses, Fees, Exams, Hostel (100q),
 *         Transport (100q), Labs, Placements, Research,
 *         International, Events, Culture, Safety, Digital,
 *         Alumni, Career, Policies & much more.
 */

const natural = require('natural');
const Intent  = require('../models/Intent');
const tokenizer = new natural.WordTokenizer();
const stemmer   = natural.PorterStemmer;

const BUILT_IN_INTENTS = [

  // ══════════════════════════════════════════════════════════════
  //  CAT 1 · GREETINGS & SMALL TALK
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'greetings',
    keywords: ['hello','hi','hey','good morning','good afternoon','good evening','greetings','hii','helo','hai','hiya','sup','howdy'],
    trainingPhrases: ['hello','hi','hey','good morning','good afternoon','good evening','howdy','greetings','hi there','hey there','what is up'],
    responses: ['👋 Hello! Welcome to **{{COLLEGE_NAME}}** Virtual Assistant!\n\nI can answer **1000+ questions** about:\n• 📋 Admissions & Documents\n• 📚 Courses (BCA, MCA, B.Tech, MBA…)\n• 💰 Fees, Scholarships & Loans\n• 🏠 Hostel & Accommodation\n• 🚌 Transport & Bus Routes\n• 💻 Labs & Infrastructure\n• 💼 Placements & Internships\n• 🔬 Research & Conferences\n• 🌍 International Programs\n• 🎉 Events, Clubs & Activities\n• 🛡️ Safety & Campus Life\n• 📞 Contact & Location\n\nType your question below! 😊']
  },
  {
    intentName: 'thanks',
    keywords: ['thank','thanks','thank you','appreciate','helpful','great','awesome','perfect','wonderful','excellent','nice work'],
    trainingPhrases: ['thank you','thanks','thanks a lot','that was helpful','appreciate it','you are great'],
    responses: ['😊 You\'re most welcome! Feel free to ask anything else about **{{COLLEGE_NAME}}**. Best of luck! 🎓']
  },
  {
    intentName: 'goodbye',
    keywords: ['bye','goodbye','see you','later','take care','cya','good night','ok bye','thanks bye','good day'],
    trainingPhrases: ['bye','goodbye','see you later','take care','good night','ok bye'],
    responses: ['👋 Goodbye! Have a wonderful day! We\'re here 24×7 whenever you need us. 😊🎓']
  },
  {
    intentName: 'who_are_you',
    keywords: ['who are you','what are you','your name','are you human','are you a bot','ai assistant','chatbot','virtual assistant','introduce yourself','what can you do'],
    trainingPhrases: ['who are you','what are you','what is your name','are you human or bot','introduce yourself','tell me about yourself','what can you do'],
    responses: ['🤖 I\'m the **{{COLLEGE_NAME}} AI Virtual Assistant**!\n\nI can instantly answer questions about:\n✅ Admissions, Courses, Fees, Scholarships\n✅ Hostel, Transport, Labs, Facilities\n✅ Exams, Results, Hall Tickets\n✅ Placements, Internships, Career\n✅ Research, Events, Clubs, International Programs\n✅ Safety, Policies, Student Services\n\n⚡ Available **24×7** — no waiting!\nFor complex queries: 📞 **{{PHONE}}** | 📧 **{{EMAIL}}**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 2 · GENERAL COLLEGE INFORMATION
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'college_name',
    keywords: ['name','college name','what is the name','name of college','which college','institution name'],
    trainingPhrases: ['what is the name of the college','college name','name of this college','which college is this','tell me the college name'],
    responses: ['🏫 The name of the college is **{{COLLEGE_NAME}}**.\n\nWe are a premier technical institution with NAAC A++ accreditation. Visit **{{WEBSITE}}** to know more!']
  },
  {
    intentName: 'college_location',
    keywords: ['location','address','where','situated','located','city','place','area','distance','how far','reach','directions','map','near'],
    trainingPhrases: ['where is the college located','college address','location of college','how to reach college','distance from city','how far is college','directions to college'],
    responses: ['📍 **{{COLLEGE_NAME}}** is located at:\n\n**{{ADDRESS}}**\n\n🚌 **By Bus:** City routes 42, 78, 105 stop at College Gate\n🚇 **By Metro:** Tech Park Metro (2 km away)\n🚆 **By Train:** City Central Station (8 km, ~20 min)\n🚗 **By Road:** NH-48, exit at University Road\n\n📱 Google Maps: **{{WEBSITE}}/map**\n📞 **{{PHONE}}**']
  },
  {
    intentName: 'about_college',
    keywords: ['about','overview','tell me about','background','history','profile','describe','information about college','details about college'],
    trainingPhrases: ['tell me about the college','about your college','college overview','college profile','describe the college'],
    responses: ['🏛️ **About {{COLLEGE_NAME}}:**\n\nEstablished in **2001**, GIT is a premier technical institution.\n\n🏆 **Key Highlights:**\n• NAAC Accredited — **A++ Grade** | AICTE & UGC Approved\n• **5,000+** students | **250+** expert faculty\n• **150+** industry recruiters visiting every year\n• 92% **placement rate** | Highest package: **₹42 LPA**\n• Sprawling **50-acre** Wi-Fi campus\n• 50+ modern labs | 1.2 lakh+ library books\n• Boys & Girls hostels (1,200 seats)\n\n🔗 **{{WEBSITE}}** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'established_year',
    keywords: ['established','founded','started','year','when','inception','how old','since when'],
    trainingPhrases: ['when was the college established','year of establishment','when was college founded','how old is the college'],
    responses: ['📅 **{{COLLEGE_NAME}}** was established in **2001**.\n\nWith over **23 years of excellence**, we have produced **25,000+ alumni** working across India and the globe in top companies and government positions. 🌍']
  },
  {
    intentName: 'govt_or_private',
    keywords: ['government','private','govt','autonomous','aided','unaided','minority','type of college','management','trust'],
    trainingPhrases: ['is the college government or private','government college or private','aided or unaided','is it autonomous','type of college'],
    responses: ['🏛️ **{{COLLEGE_NAME}}** is a **Private Unaided Autonomous Institution**.\n\n• Governed by the GIT Educational Trust\n• Autonomous status granted by the State University\n• Follows its own exam & curriculum framework\n• AICTE Approved | UGC Recognised | NAAC A++\n• All degrees are fully government-recognized 🎓']
  },
  {
    intentName: 'affiliation',
    keywords: ['affiliated','affiliation','university','aicte','ugc','recognized','approved','accredited','naac','nba','iso'],
    trainingPhrases: ['which university is college affiliated to','is college approved by aicte','university affiliation','naac grade','nba accreditation'],
    responses: ['📜 **Affiliations & Approvals:**\n\n| Body | Status |\n|---|---|\n| Affiliated University | State Technical University |\n| AICTE | ✅ Approved |\n| UGC | ✅ Recognised |\n| NAAC | ✅ **A++ Grade** |\n| NBA | ✅ CSE, ECE, ME, Civil |\n| ISO | 9001:2015 Certified |\n\nAll degrees are **government-recognised** and accepted globally. 🌐']
  },
  {
    intentName: 'campus_size',
    keywords: ['campus size','how big','area','acres','campus area','large campus','how large'],
    trainingPhrases: ['how big is the campus','campus size','campus area','how large is the campus'],
    responses: ['🌳 **{{COLLEGE_NAME}}** has a sprawling **50-acre Wi-Fi campus** featuring:\n\n• 15 academic buildings | 50+ fully-equipped labs\n• 2 sports grounds + indoor arena + swimming pool\n• 3 canteens + 1 food court\n• Boys & Girls hostels (1,200 seats)\n• Medical centre, bank branch, ATM\n• Lush green gardens & walking paths\n\nA complete student ecosystem! 🏫']
  },
  {
    intentName: 'campus_enrollment',
    keywords: ['how many students','total students','enrollment','student count','students enrolled','total enrollment','student strength'],
    trainingPhrases: ['how many students are enrolled','total students in college','student strength','enrollment count','how many students study here'],
    responses: ['👥 **Student Enrollment at {{COLLEGE_NAME}}:**\n\n• **Total Students:** ~5,000+\n• **UG Students:** ~3,800\n• **PG Students:** ~900\n• **PhD Scholars:** ~120\n• **International Students:** ~60\n• **New Intake per year:** ~1,200\n\nWith 250+ faculty members, our student-to-faculty ratio is approximately **20:1**, ensuring personalized attention. 📚']
  },
  {
    intentName: 'principal_info',
    keywords: ['principal','director','vice chancellor','management','head of institution','who is principal','who is director'],
    trainingPhrases: ['who is the principal of the college','principal name','director of the college','head of institution','who manages the college'],
    responses: ['👨‍💼 **College Leadership:**\n\n• **Principal / Director:** Dr. S.K. Mehta (Ph.D, IIT Bombay)\n• **Vice Principal:** Dr. Priya Sharma\n• **Dean Academics:** Prof. R. Verma\n• **Dean Student Affairs:** Dr. A. Nair\n• **Registrar:** Mr. K. Joshi\n\n📧 **principal@git.edu**\n📞 **{{PHONE}}** (ext. 100)\n🔗 Full leadership team: **{{WEBSITE}}/about/management**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 3 · ADMISSION
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'admission_process',
    keywords: ['admission','apply','enroll','join','application','registration','how to get in','procedure','how to take admission','steps to join'],
    trainingPhrases: ['what is the admission process','how to apply for admission','how can i apply','admission procedure','steps to join college','how do i get admitted'],
    responses: ['📋 **Admission Process at {{COLLEGE_NAME}}:**\n\n**Step 1:** Fill online application → **{{WEBSITE}}/apply**\n**Step 2:** Upload documents (marksheets, ID, photo)\n**Step 3:** Pay application fee ₹500 (non-refundable)\n**Step 4:** Appear for entrance test / counselling round\n**Step 5:** Receive offer letter via email/SMS\n**Step 6:** Pay seat confirmation fee + submit original documents\n**Step 7:** Collect admission letter & student ID card\n\n📞 Helpline: **{{PHONE}}** | 📧 **{{EMAIL}}**']
  },
  {
    intentName: 'admission_online_register',
    keywords: ['register online','online application','how to register','fill form online','online form','online admission portal','apply online'],
    trainingPhrases: ['how can i register for admission online','online registration','fill admission form online','how to fill online form','apply on website'],
    responses: ['💻 **Online Admission Registration:**\n\n**Step 1:** Visit **{{WEBSITE}}/apply**\n**Step 2:** Click "New Registration" → Create account with mobile/email\n**Step 3:** Fill personal, academic & course details\n**Step 4:** Upload: photo, marksheets, ID proof, category certificate\n**Step 5:** Pay application fee ₹500 via UPI/Card/Net Banking\n**Step 6:** Download acknowledgement receipt\n\n📌 Application number sent via SMS & email\n📱 You can also download the **GIT Mobile App** from Play Store\n📞 Help: **{{PHONE}}**']
  },
  {
    intentName: 'admission_start_date',
    keywords: ['when admission','admission start','when does admission open','admission begin','when open','application open','admit opening'],
    trainingPhrases: ['when do admissions start','when does admission begin','when will admissions open','admission start date','application start date'],
    responses: ['📅 **Admission Timeline 2025–26:**\n\n| Event | Date |\n|---|---|\n| 🟢 Application Opens | **1 April 2025** |\n| ✍️ Last Date to Apply | **30 June 2025** |\n| 📝 Entrance Test | **15 July 2025** |\n| 🤝 Counselling | **25 July 2025** |\n| 🏫 Classes Begin | **1 August 2025** |\n\n📌 Apply early — seats are limited!\n🔗 **{{WEBSITE}}/apply**']
  },
  {
    intentName: 'admission_last_date',
    keywords: ['last date','deadline','closing date','final date','last day','last date admission','submission deadline'],
    trainingPhrases: ['when is the last date for admission','admission deadline','last date to apply','closing date for admission'],
    responses: ['⏰ **Last Date for Admission 2025–26:**\n\n🔴 **30 June 2025** (Regular)\n🟡 **15 July 2025** (Late — with ₹200 late fee, subject to seat availability)\n\n📌 Apply before **15 June** for smooth processing!\n🔗 **{{WEBSITE}}/apply** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'application_fee',
    keywords: ['application fee','registration fee','admission form fee','how much to apply','form fee','fee to apply'],
    trainingPhrases: ['is there an application fee','how much is the application fee','registration fee for admission','form fee','fee for admission form'],
    responses: ['💳 **Application / Registration Fee:**\n\n• **Application Fee:** ₹500 (non-refundable)\n• **Mode:** Online — UPI, Debit/Credit Card, Net Banking\n• **Offline:** DD in favour of "{{COLLEGE_NAME}}"\n\n📌 The application fee is separate from tuition fees.\n📌 Once submitted, the application fee is **non-refundable** regardless of admission outcome.\n🔗 Pay at: **{{WEBSITE}}/apply**']
  },
  {
    intentName: 'edit_application',
    keywords: ['edit form','edit application','change application','modify form','correction','update application','wrong entry','mistake in form'],
    trainingPhrases: ['can i edit my admission form after submission','how to edit application form','correct mistake in form','update my application','change details in form'],
    responses: ['✏️ **Editing Your Application:**\n\n✅ **Before submission:** Edit freely on the portal\n✅ **After submission (within 48 hours):** Log in → "Edit Application" option available\n❌ **After payment is confirmed:** Major changes require contacting the admission office\n\n📌 Name & course changes are not allowed after document verification.\n📞 **{{PHONE}}** (ext. 101) | 📧 **admissions@git.edu**']
  },
  {
    intentName: 'admission_status',
    keywords: ['admission status','check status','application status','track application','is my admission confirmed','status check','how will i know'],
    trainingPhrases: ['how can i check admission status','application status check','track my application','is my admission done','how will i know if admission confirmed'],
    responses: ['🔍 **Check Your Admission Status:**\n\n1️⃣ Visit **{{WEBSITE}}/admission-status**\n2️⃣ Enter **Application Number** + **Date of Birth**\n3️⃣ Click "Check Status"\n\nStatus meanings:\n• 🟡 **Pending** — Under review\n• 🟢 **Confirmed** — Pay seat confirmation fee\n• 🔴 **Waitlisted** — Wait for next round\n• ⚫ **Rejected** — Eligibility not met\n\n📞 **{{PHONE}}** | 📧 **admissions@git.edu**']
  },
  {
    intentName: 'cancel_admission_refund',
    keywords: ['cancel admission','admission cancellation','refund','withdraw','cancel seat','leave college','fee refund','money back'],
    trainingPhrases: ['can i cancel my admission','will i get a refund if i cancel','admission cancellation process','fee refund policy','withdraw admission'],
    responses: ['❌ **Admission Cancellation & Refund Policy:**\n\n| Cancellation Timing | Refund |\n|---|---|\n| Before allotment | 100% of seat fee |\n| Within 15 days of joining | 80% of tuition fee |\n| 15–30 days after joining | 50% of tuition fee |\n| After 30 days | No refund |\n\n📌 Application fee (₹500) is **non-refundable**\n📝 Submit cancellation form at Admission Office with ID proof\n📞 **{{PHONE}}** | 📧 **admissions@git.edu**']
  },
  {
    intentName: 'multiple_courses',
    keywords: ['apply multiple courses','more than one course','two courses','both bca mca','apply for two','which course to choose'],
    trainingPhrases: ['can i apply for multiple courses','apply for two courses simultaneously','apply both bca and mca','can i choose multiple programs'],
    responses: ['✅ **Applying for Multiple Courses:**\n\nYes! You can apply for **up to 2 courses** in a single application:\n\n• Select preferred courses in order of priority (1st, 2nd choice)\n• Same application fee of ₹500 covers both preferences\n• Seat allotment based on merit + seat availability\n\n📌 You can only **enroll in one course** after allotment.\n🔗 **{{WEBSITE}}/apply** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'lateral_entry',
    keywords: ['lateral entry','lateral admission','direct second year','diploma lateral','lateral intake','second year admission','direct entry'],
    trainingPhrases: ['is there lateral entry available','can diploma students apply for degree','lateral entry admission','direct second year admission','diploma to degree'],
    responses: ['🔄 **Lateral Entry Admission:**\n\n✅ Yes! Lateral Entry is available for B.Tech:\n\n• **Eligibility:** Diploma in relevant field with **60%**\n• **Entry:** Direct to **2nd Year (Sem 3)**\n• **Seats:** 10% of intake (approved by AICTE)\n• **Entrance:** State Lateral Entry Test (LEET) or college test\n• **Documents:** Diploma certificate + marksheets + TC\n\n📌 MCA lateral entry not available (2-year MCA requires BCA/B.Sc)\n📞 **{{PHONE}}** | 📧 **admissions@git.edu**']
  },
  {
    intentName: 'admission_documents',
    keywords: ['documents','document','certificates','papers','marksheet','required documents','what to bring','what to submit','documents needed'],
    trainingPhrases: ['what documents are required for admission','documents needed','required certificates','admission documents checklist'],
    responses: ['📁 **Documents Required for Admission:**\n\n**Academic:**\n• ✅ 10th Marksheet & Passing Certificate\n• ✅ 12th Marksheet & Passing Certificate\n• ✅ Entrance Exam Scorecard (JEE/CET/MCA-CET)\n• ✅ Transfer Certificate (TC)\n• ✅ Migration Certificate (if from other board/state)\n\n**Identity & Category:**\n• ✅ Aadhaar Card (student + parent)\n• ✅ Caste Certificate (if applicable)\n• ✅ Income Certificate (for scholarship/EWS)\n• ✅ Domicile Certificate\n\n**Other:**\n• ✅ 6 passport-size photographs\n• ✅ Medical Fitness Certificate\n\n📌 Carry **originals + 2 sets of self-attested photocopies**']
  },
  {
    intentName: 'admission_eligibility',
    keywords: ['eligibility','eligible','minimum percentage','minimum marks','qualification','cutoff','criteria','requirement','percentage required','marks required'],
    trainingPhrases: ['what is the eligibility for admission','what is minimum percentage','eligibility criteria','who is eligible','minimum marks required'],
    responses: ['✅ **Eligibility Criteria:**\n\n| Program | Qualification | Min % |\n|---|---|---|\n| B.Tech | 10+2 (PCM) | **60%** |\n| B.Tech (Lateral) | Diploma (relevant) | **60%** |\n| BCA | 10+2 (any stream) | **55%** |\n| B.Sc | 10+2 (Science) | **55%** |\n| M.Tech | B.Tech/B.E. | **55%** |\n| MBA | Any Graduation | **50%** |\n| MCA | BCA/B.Sc CS/B.Tech | **50%** |\n| Ph.D | PG in relevant field | **55%** |\n\n📌 SC/ST/OBC: **5% relaxation** in minimum percentage\n📞 **{{PHONE}}**']
  },
  {
    intentName: 'entrance_exam',
    keywords: ['entrance exam','entrance test','mht-cet','jee','cet','entrance','which exam','test required','qualifying exam','mca cet','nimcet'],
    trainingPhrases: ['what entrance exam is required','is mht-cet required','which entrance exam','entrance exam for admission','do i need entrance exam'],
    responses: ['📝 **Entrance Exams Accepted:**\n\n| Program | Accepted Exams |\n|---|---|\n| B.Tech | JEE Main / MHT-CET / SAT |\n| BCA | State CET / Merit Based |\n| M.Tech | GATE / University Test |\n| MBA | CAT / MAT / CMAT / GMAT |\n| MCA | State MCA CET / NIMCET |\n| Ph.D | Research Entrance Test |\n\n✅ **Direct Admission** (Management Quota): Available for 75%+ students\n📞 **{{PHONE}}** | 📧 **{{EMAIL}}**']
  },
  {
    intentName: 'management_quota',
    keywords: ['management quota','management seats','nri quota','institutional quota','management quota admission','paid seats','direct admission without exam'],
    trainingPhrases: ['is there management quota','management quota seats','nri quota','direct admission without entrance','management quota fee'],
    responses: ['💼 **Management Quota:**\n\n• **Seats:** 15% of total intake\n• **Eligibility:** 60%+ in qualifying exam\n• **Selection:** Merit + Personal Interview\n• **No capitation fee** — strictly merit-based\n• **Process:** Apply at **{{WEBSITE}}/apply** → select "Management Quota"\n\n📌 Management quota seats fill up fast — apply early!\n📞 **{{PHONE}}** | 📧 **admissions@git.edu**']
  },
  {
    intentName: 'category_reservation',
    keywords: ['reservation','reserved seats','category','sc','st','obc','ews','minority','quota','caste reservation'],
    trainingPhrases: ['are there seats reserved for categories','sc st reservation','obc reservation','category wise seats','reservation policy','ews seats'],
    responses: ['📊 **Reservation Policy (Govt. norms):**\n\n| Category | Reservation |\n|---|---|\n| SC (Scheduled Caste) | 15% |\n| ST (Scheduled Tribe) | 7.5% |\n| OBC (Other Backward Class) | 27% |\n| EWS (Economically Weaker Section) | 10% |\n| PwD (Persons with Disability) | 5% (horizontal) |\n| Open / General | Remaining seats |\n\n📌 Category candidates get **5% relaxation** in minimum eligibility %\n📞 **{{PHONE}}**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 4 · COURSES & ACADEMICS
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'courses_offered',
    keywords: ['courses','course','programs','programme','departments','branches','what to study','degree','btech','mtech','bca','mba','mca','bsc','all courses'],
    trainingPhrases: ['what courses are offered','list of programs','which departments','courses available','available programs','all courses list'],
    responses: ['📚 **Programs at {{COLLEGE_NAME}}:**\n\n**🎓 Undergraduate (UG):**\n• **B.Tech** — CSE, ECE, Mechanical, Civil, EE, IT, AI & ML, Data Science (8 branches)\n• **BCA** — 3 years | Bachelor of Computer Applications\n• **B.Sc** — Computer Science, Physics, Mathematics\n\n**🎓 Postgraduate (PG):**\n• **M.Tech** — CSE, ECE, VLSI, Power Systems\n• **MCA** — 2 years | Master of Computer Applications\n• **MBA** — Marketing, Finance, HR, Operations, Business Analytics\n• **M.Sc** — CS, Physics, Mathematics\n\n**🔬 Doctoral:**\n• **Ph.D** — All engineering & science departments\n\n🔗 **{{WEBSITE}}/courses**']
  },
  {
    intentName: 'postgraduate_courses',
    keywords: ['postgraduate','pg courses','masters','post graduate','pg admission','mtech mca mba msc'],
    trainingPhrases: ['does the college offer postgraduate courses','pg programs available','masters courses','postgraduate admission','pg courses list'],
    responses: ['🎓 **Postgraduate (PG) Programs:**\n\n| Program | Specialization | Duration |\n|---|---|---|\n| **M.Tech** | CSE / ECE / VLSI / Power Systems | 2 years |\n| **MCA** | Master of Computer Applications | 2 years |\n| **MBA** | Marketing / Finance / HR / Operations / BA | 2 years |\n| **M.Sc** | CS / Physics / Mathematics | 2 years |\n| **Ph.D** | All departments | 3–5 years |\n\nAll PG programs are AICTE/UGC approved and nationally recognized.\n🔗 **{{WEBSITE}}/courses** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'bca_course',
    keywords: ['bca','bachelor computer application','bca course','bca details','bca program','bca admission','bca seats'],
    trainingPhrases: ['do you offer bca course','bca course details','tell me about bca','bca program information','is bca available'],
    responses: ['💻 **BCA — Bachelor of Computer Applications:**\n\n• **Duration:** 3 Years (6 Semesters)\n• **Intake:** 60 seats\n• **Eligibility:** 10+2 (any stream) with min **55%**\n• **Annual Fee:** ₹60,000\n\n**Core Subjects:** C/C++, Java, Python, Web Development, DBMS, Data Structures, Networking, Software Engineering, Android Development, Cloud Computing\n\n**Career after BCA:** Software Developer, Web Developer, System Analyst, MCA (higher studies)\n\n🔗 **{{WEBSITE}}/bca** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'mca_course',
    keywords: ['mca','master computer application','mca course','mca details','mca program','mca admission','mca seats'],
    trainingPhrases: ['do you offer mca course','mca course details','tell me about mca','mca admission','is mca available'],
    responses: ['💻 **MCA — Master of Computer Applications:**\n\n• **Duration:** 2 Years (4 Semesters)\n• **Intake:** 60 seats\n• **Eligibility:** BCA / B.Sc CS / B.Tech with min **50%**\n• **Annual Fee:** ₹75,000\n\n**Core Subjects:** Advanced Java, .NET, Machine Learning, Cloud Computing, Cyber Security, Big Data, IoT, Mobile App Development, Project Management\n\n**Average Package:** ₹6–10 LPA | **Highest:** ₹28 LPA\n\n🔗 **{{WEBSITE}}/mca** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'mca_duration',
    keywords: ['mca duration','how long mca','mca years','mca semesters','mca how many years'],
    trainingPhrases: ['what is the duration of mca','how long is mca','mca course duration','how many years mca'],
    responses: ['⏱️ **MCA Duration:**\n\n• **Total Duration:** **2 Years** (revised per AICTE 2020 norms)\n• **Semesters:** 4 semesters (each ~6 months)\n• Includes 1 mandatory **Industry Internship** (6–8 weeks)\n• Final semester: **Major Project** with industry guide option\n\n🔗 **{{WEBSITE}}/mca**']
  },
  {
    intentName: 'bca_duration',
    keywords: ['bca duration','how long bca','bca years','bca semesters','bca how many years'],
    trainingPhrases: ['what is the duration of bca','how long is bca','bca course duration','how many years bca'],
    responses: ['⏱️ **BCA Duration:**\n\n• **Total Duration:** **3 Years** (6 Semesters)\n• Each semester: ~6 months\n• Includes practical projects every semester\n• Final year: Major project + compulsory internship\n\n🔗 **{{WEBSITE}}/bca**']
  },
  {
    intentName: 'semesters_count',
    keywords: ['how many semesters','semesters','number of semesters','semester count','total semesters','semesters in'],
    trainingPhrases: ['how many semesters are there','total semesters','semesters in btech','semesters in mca','how many sems'],
    responses: ['📚 **Semester Structure:**\n\n| Program | Semesters | Duration |\n|---|---|---|\n| B.Tech | **8 Semesters** | 4 Years |\n| BCA | **6 Semesters** | 3 Years |\n| M.Tech | **4 Semesters** | 2 Years |\n| MCA | **4 Semesters** | 2 Years |\n| MBA | **4 Semesters** | 2 Years |\n| B.Sc | **6 Semesters** | 3 Years |\n\nEach semester is approximately **6 months** long.']
  },
  {
    intentName: 'mca_subjects',
    keywords: ['mca subjects','mca syllabus','what subjects in mca','mca curriculum','mca topics','java in mca','python in mca'],
    trainingPhrases: ['what subjects are taught in mca','mca syllabus','mca subject list','do students learn java in mca','do students learn python in mca'],
    responses: ['📖 **MCA Subjects (Semester-wise):**\n\n**Sem 1:** C++, Discrete Mathematics, Data Structures, Computer Organisation\n**Sem 2:** Java, DBMS, OS, Computer Networks, Software Engineering\n**Sem 3:** Advanced Java, Machine Learning, Web Technologies (HTML/CSS/JS/React), Cloud Computing, Elective\n**Sem 4:** Big Data Analytics, IoT, Cyber Security, Mobile App Development (Android/iOS), Major Project\n\n**Programming Languages Taught:** C++, Java, Python, JavaScript, PHP, SQL\n🔗 Full syllabus: **{{WEBSITE}}/mca/syllabus**']
  },
  {
    intentName: 'bca_subjects',
    keywords: ['bca subjects','bca syllabus','what subjects in bca','bca curriculum','bca topics'],
    trainingPhrases: ['what subjects are taught in bca','bca syllabus','bca subject list','programming languages in bca'],
    responses: ['📖 **BCA Subjects (Semester-wise):**\n\n**Sem 1:** C Programming, Digital Electronics, Maths, English Communication\n**Sem 2:** C++, Data Structures, Computer Architecture, Statistics\n**Sem 3:** Java, DBMS, OS, Visual Basic\n**Sem 4:** Advanced Java, Web Tech (HTML/CSS/JS), Computer Networks\n**Sem 5:** Python, Android Development, Software Engineering, Elective\n**Sem 6:** Cloud Computing, Project Work, Compulsory Internship\n\n🔗 **{{WEBSITE}}/bca/syllabus**']
  },
  {
    intentName: 'practical_labs_course',
    keywords: ['practical','lab sessions','lab included','practical classes','lab work','hands on','practical subjects'],
    trainingPhrases: ['are practical labs included in the course','practical lab sessions','lab work in courses','are there lab classes'],
    responses: ['🔬 **Practical & Lab Sessions:**\n\n✅ Yes! All courses include mandatory practical sessions:\n\n• **BCA/MCA:** 30–40% of curriculum is lab-based\n• **B.Tech:** Each semester has 4–6 lab courses\n• Labs cover: Programming, Hardware, Networking, Electronics, AI/ML\n• **Lab Exams:** Conducted at end of each semester (25–50 marks)\n• **Lab Reports:** Required for all practical subjects\n• Lab assistants available during all sessions\n\n📌 Labs are open **8 AM – 8 PM** (Mon–Sat) and Sundays for project work.']
  },
  {
    intentName: 'project_work',
    keywords: ['project','final year project','project work','major project','mini project','project guide','research project','year project'],
    trainingPhrases: ['are there project works in the final year','final year project','major project details','project work in course','how is project done'],
    responses: ['🛠️ **Project Work:**\n\n**Mini Projects (Sem 3/5):** Individual/team projects on any relevant topic\n\n**Major Project (Final Semester):**\n• Duration: Full semester (6 months)\n• Options: Industry project OR academic research project\n• **Industry Guide:** Students can work at a company\n• **Evaluation:** Review + presentation + viva + report\n• Can be published as a **research paper** if work is significant\n\n**Marks:** Major project carries 4–6 credits\n\n📌 Projects are evaluated by both internal faculty and external examiners.']
  },
  {
    intentName: 'specializations',
    keywords: ['specialization','stream','branch','which branch','best branch','choose branch','cse ece mba'],
    trainingPhrases: ['what specializations are available','which specialization','available branches','which stream is best','branch list','specialization options'],
    responses: ['🎯 **Available Specializations:**\n\n**B.Tech (8 branches):**\n• Computer Science Engineering (CSE)\n• CSE with AI & Machine Learning\n• CSE with Data Science\n• Electronics & Communication (ECE)\n• Mechanical Engineering | Civil Engineering\n• Electrical Engineering (EE) | Information Technology (IT)\n\n**M.Tech:** CSE | ECE | VLSI | Power Systems | Structural Engg.\n\n**MBA:** Marketing | Finance | HR | Operations | Business Analytics\n\n**MCA:** Computer Applications (with AI/ML electives)\n\n🔗 **{{WEBSITE}}/courses**']
  },


  // ══════════════════════════════════════════════════════════════
  //  CAT 5 · FEE STRUCTURE
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'fee_structure',
    keywords: ['fee','fees','fee structure','cost','tuition','annual fee','charges','price','how much','total fee','course fee'],
    trainingPhrases: ['what is the fee structure','how much is the fee','college fees','tuition fees','annual fee','total fees'],
    responses: ['💰 **Fee Structure 2025–26 (per annum):**\n\n| Program | Tuition | Dev Fee | **Total** |\n|---|---|---|---|\n| B.Tech | ₹85,000 | ₹15,000 | **₹1,00,000** |\n| BCA | ₹50,000 | ₹10,000 | **₹60,000** |\n| B.Sc | ₹40,000 | ₹8,000 | **₹48,000** |\n| M.Tech | ₹75,000 | ₹12,000 | **₹87,000** |\n| MBA | ₹90,000 | ₹15,000 | **₹1,05,000** |\n| MCA | ₹65,000 | ₹10,000 | **₹75,000** |\n\n📌 Hostel & transport charged separately\n🎖️ Scholarships available — up to 50% waiver\n📞 **{{PHONE}}**']
  },
  {
    intentName: 'mca_fee',
    keywords: ['mca fee','mca fees','mca cost','fee for mca','mca annual fee'],
    trainingPhrases: ['what is the fee for mca','mca course fee','mca annual fee','how much is mca fee'],
    responses: ['💰 **MCA Fee Structure:**\n\n• **Annual Tuition:** ₹65,000 | **Dev Fee:** ₹10,000\n• **Total Annual Fee:** **₹75,000**\n• **Total (2 years):** **₹1,50,000**\n\n**Optional:**\n• Hostel: ₹45,000–₹85,000/year | Transport: ₹18,000–₹26,000/year\n\n🎖️ Merit scholarship: up to 50% fee waiver\n📞 **{{PHONE}}** | 📧 **{{EMAIL}}**']
  },
  {
    intentName: 'bca_fee',
    keywords: ['bca fee','bca fees','bca cost','fee for bca','bca annual fee'],
    trainingPhrases: ['what is the fee for bca','bca course fee','bca annual fee','how much is bca fee'],
    responses: ['💰 **BCA Fee Structure:**\n\n• **Annual Tuition:** ₹50,000 | **Dev Fee:** ₹10,000\n• **Total Annual Fee:** **₹60,000**\n• **Total (3 years):** **₹1,80,000**\n\n**Optional:**\n• Hostel: ₹45,000–₹85,000/year | Transport: ₹18,000–₹26,000/year\n\n🎖️ Merit scholarship available!\n📞 **{{PHONE}}**']
  },
  {
    intentName: 'fee_payment',
    keywords: ['pay fees','fee payment','how to pay','pay online','fee payment mode','online fee','fee receipt','fee transaction'],
    trainingPhrases: ['how can i pay my admission fees','can fees be paid online','fee payment process','online fee payment','how to get fee receipt'],
    responses: ['💳 **Fee Payment:**\n\n✅ **Online Payment (Recommended):**\n• Visit **{{WEBSITE}}/pay** → Login → Select Fee Type\n• Pay via: UPI, Debit/Credit Card, Net Banking, NEFT\n• Receipt generated instantly — download as PDF\n\n✅ **Offline Payment:**\n• Cash or DD at Accounts Office (Mon–Sat, 9 AM–3 PM)\n• DD in favour of: "{{COLLEGE_NAME}}"\n\n📌 **Late Fee:** ₹50/day after due date\n📧 **accounts@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'fee_installments',
    keywords: ['installment','instalment','emi','pay in parts','split fee','partial payment','quarterly fee','fee payment plan'],
    trainingPhrases: ['can i pay fees in installments','fee installment plan','emi option','pay fees in parts','split fee payment'],
    responses: ['💳 **Fee Installment Plans:**\n\n✅ **Two-Installment Plan:**\n• Installment 1: 60% at admission time\n• Installment 2: 40% by **30 November**\n\n✅ **EMI via Bank (0% interest):**\n• SBI, HDFC, ICICI — 6 to 12-month EMI options\n• Bank representatives visit campus every Friday\n\n📝 Apply at Accounts Office for installment plan\n📧 **accounts@git.edu** | 📞 **{{PHONE}}** ext. 200']
  },
  {
    intentName: 'late_fee',
    keywords: ['late fee','penalty','delay fee','late payment','overdue fee','fine for late payment'],
    trainingPhrases: ['is there a late fee penalty','late fee for payment','penalty for late fee submission','fine for late fees'],
    responses: ['⚠️ **Late Fee Policy:**\n\n• **₹50 per day** after the due date\n• **Max Late Fine:** ₹2,000 per semester\n• After 30 days delay: Roll number may be put on hold\n• Hall tickets may be withheld for unpaid fees\n\n📌 Avoid late fees — set reminders!\n📞 Accounts Dept: **accounts@git.edu** | **{{PHONE}}**']
  },
  {
    intentName: 'additional_charges',
    keywords: ['additional charges','extra fee','other charges','lab charges','library fee','exam fee','hidden charges','other expenses'],
    trainingPhrases: ['are there any additional charges','extra charges','other fees','are there hidden charges','what are additional fees'],
    responses: ['📋 **Additional Charges:**\n\n| Item | Amount |\n|---|---|\n| Library Fee | ₹2,000/year |\n| Lab Fee | ₹3,000/semester |\n| Exam Fee | ₹1,500/semester |\n| Identity Card | ₹200 (one-time) |\n| Alumni Fee | ₹500 (one-time) |\n| Certification | ₹100 each |\n\n📌 All fees are **disclosed at admission** — No hidden charges!\n📞 **{{PHONE}}**']
  },
  {
    intentName: 'fee_concession',
    keywords: ['fee concession','concession','discount','fee reduction','waiver','fee waiver','reduce fee','sibling discount','staff ward'],
    trainingPhrases: ['is there any fee concession','fee discount','fee reduction available','concession in fees','sibling discount'],
    responses: ['✅ **Fee Concessions Available:**\n\n• **Merit-Based:** Top rank in entrance → 10–50% waiver\n• **Sibling Discount:** ₹10,000 off if sibling already enrolled\n• **Staff Ward:** 25% concession for children of staff\n• **Sports Excellence:** State/national players — special consideration\n• **Govt Freeship:** Full fee waiver for eligible SC/ST students\n\n📝 Apply at Accounts Office with supporting documents\n📞 **{{PHONE}}** | 📧 **accounts@git.edu**']
  },
  {
    intentName: 'scholarships',
    keywords: ['scholarship','financial aid','fee waiver','free','merit scholarship','stipend','award','concession','need based','scholarship criteria','how to apply scholarship'],
    trainingPhrases: ['are scholarships available','scholarship criteria','merit scholarship','how to get scholarship','scholarship for poor students','government scholarship'],
    responses: ['🎖️ **Scholarships at {{COLLEGE_NAME}}:**\n\n| Scholarship | Criteria | Benefit |\n|---|---|---|\n| Merit Scholarship | Top 5% students | 50% fee waiver |\n| Govt SC/ST/OBC | Category certificate | As per Govt norms |\n| EBC/EWS | Income < ₹1L/year | Up to 100% tuition |\n| Sports | State/National level | 25% fee waiver |\n| Minority | Minority community | As per Govt norms |\n| Sibling Discount | 2nd sibling | ₹10,000 off |\n\n📅 Scholarship deadline: **31 August** each year\n🔗 **{{WEBSITE}}/scholarships** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'scholarship_application',
    keywords: ['how to apply scholarship','scholarship application','apply for scholarship','scholarship process','get scholarship','scholarship form'],
    trainingPhrases: ['how can i apply for scholarships','scholarship application process','how to apply for financial aid','get government scholarship','scholarship form'],
    responses: ['📝 **Applying for Scholarships:**\n\n**Government Scholarships:**\n1️⃣ Apply on the National Scholarship Portal: **scholarships.gov.in**\n2️⃣ Get college verification from Scholarship Office\n3️⃣ Submit income/caste/domicile certificate\n\n**College Scholarships:**\n1️⃣ Visit **{{WEBSITE}}/scholarships**\n2️⃣ Fill the scholarship form\n3️⃣ Attach marksheets, income certificate\n4️⃣ Submit before **31 August**\n\n📌 The college helps with scholarship applications — visit the Scholarship Cell (Block A, Room 12)\n📞 **{{PHONE}}** ext. 205']
  },
  {
    intentName: 'education_loan',
    keywords: ['education loan','loan','bank loan','study loan','finance','borrow','loan facility','loan assistance'],
    trainingPhrases: ['do you provide education loans','loan facility','how to get education loan','bank loan for studies','study loan available'],
    responses: ['🏦 **Education Loan Assistance:**\n\nTie-ups with major banks:\n• **SBI Scholar Loan** — Up to ₹20 lakhs @ 8.5% p.a.\n• **HDFC Credila** — Up to ₹30 lakhs\n• **Bank of Baroda** — Vidya Lakshmi scheme\n• **Canara Bank** — IBA model loan scheme\n\n**College Provides:**\n• Bonafide certificate + fee confirmation letter\n• Dedicated bank liaison officer on campus\n• Guidance for loan documents\n\n📧 **accounts@git.edu** | 📞 **{{PHONE}}**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 6 · EXAMS & RESULTS
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'exam_schedule',
    keywords: ['exam','examination','test','timetable','schedule','when exam','exam date','start exam','semester exam','internal exam'],
    trainingPhrases: ['when will exams start','exam timetable','exam schedule','when is the semester exam','internal exam dates','exam calendar'],
    responses: ['📅 **Examination Calendar:**\n\n**Odd Semester (Jul–Nov):**\n• Unit Test 1: August (Week 4)\n• Mid-Semester Exam: September\n• Unit Test 2: October\n• End-Semester Exam: **20 Nov – 10 Dec**\n\n**Even Semester (Jan–May):**\n• Unit Test 1: February (Week 4)\n• Mid-Semester Exam: March\n• Unit Test 2: April (Week 1)\n• End-Semester Exam: **25 Apr – 15 May**\n\n📌 Timetable published 3 weeks before exams at **{{WEBSITE}}/exams**']
  },
  {
    intentName: 'exam_pattern',
    keywords: ['exam pattern','question pattern','marks distribution','exam format','how exam','internal marks','external marks','assessment','evaluation scheme'],
    trainingPhrases: ['what is the exam pattern','exam format','how are exams conducted','marks distribution','internal external marks'],
    responses: ['📊 **Exam & Evaluation Pattern:**\n\n**Internal / Continuous Assessment (40 marks):**\n• Unit Tests ×2: 20 marks\n• Assignments & Quizzes: 10 marks\n• Lab/Practical Work: 10 marks\n\n**End-Semester Exam (60 marks):**\n• 3-hour written exam\n• Section A: Short answers (20 marks)\n• Section B: Long answers (40 marks)\n\n**Total: 100 marks per subject**\n\n📌 Both internal AND external must be passed separately (min 40% each)\n📌 Practical subjects have separate lab exams (25–50 marks)']
  },
  {
    intentName: 'internal_assessment',
    keywords: ['internal assessment','internal marks','assignments','internal exam','continuous assessment','unit test','assignment mandatory'],
    trainingPhrases: ['are internal assessments conducted','internal marks system','are assignments mandatory','unit test details','how internal marks calculated'],
    responses: ['📝 **Internal Assessment System:**\n\n• **Unit Tests (2 per semester):** 20 marks total\n• **Assignments:** 5 marks (must submit on time — late submissions penalised)\n• **Quizzes/Class Tests:** 5 marks\n• **Lab Work/Viva:** 10 marks\n\n📌 Assignments are **mandatory** — non-submission = 0 marks in that component\n📌 Internal marks are uploaded on the student portal within 7 days\n\n🔗 Check marks: **{{WEBSITE}}/student-portal**']
  },
  {
    intentName: 'grading_system',
    keywords: ['grading','gpa','cgpa','grade','grade system','how grades','marks to grade','percentage to grade','grading scheme'],
    trainingPhrases: ['what is the grading system','how are gpa scores calculated','grade system used','marks to gpa conversion','cgpa calculation'],
    responses: ['📊 **Grading System:**\n\n| Marks | Grade | Grade Points |\n|---|---|---|\n| 90–100 | O (Outstanding) | 10 |\n| 80–89 | A+ (Excellent) | 9 |\n| 70–79 | A (Very Good) | 8 |\n| 60–69 | B+ (Good) | 7 |\n| 50–59 | B (Above Average) | 6 |\n| 40–49 | C (Satisfactory) | 5 |\n| Below 40 | F (Fail) | 0 |\n\n**CGPA** = Average of all semester GPAs\n**% equivalent** = (CGPA × 10) - 7.5\n\nThis follows the **UGC 10-point grading scale**.']
  },
  {
    intentName: 'hall_ticket',
    keywords: ['hall ticket','admit card','exam card','roll number','hall permit','download hall ticket','admit card download'],
    trainingPhrases: ['how can i download my hall ticket','admit card download','hall ticket download','where to get admit card'],
    responses: ['🎫 **Hall Ticket / Admit Card:**\n\n**Steps to Download:**\n1️⃣ Visit **{{WEBSITE}}/student-portal**\n2️⃣ Login with **Registration Number + Password**\n3️⃣ Examinations → "Download Hall Ticket"\n4️⃣ Print (colour or B&W both accepted)\n\n📌 Released **7 days before exams**\n📌 Carry college ID + hall ticket to exam hall\n\n❌ **Hall ticket NOT released if:**\n• Fees are due | Attendance below 60%\n\n📞 Exam Cell: **examcell@git.edu** | **{{PHONE}}**']
  },
  {
    intentName: 'check_results',
    keywords: ['result','results','marks','grade','check result','see result','result declared','result out','when results'],
    trainingPhrases: ['how can i check my results','when will results be declared','result check online','result date'],
    responses: ['📊 **Check Your Results:**\n\n🔗 Visit **{{WEBSITE}}/results**\n🔐 Login: Roll Number + Date of Birth\n📋 Select Semester → View Results\n\n**Timelines:**\n• End-Semester results: within **30 days** of last exam\n• Internal marks: updated within 7 days\n\n**Download:**\n• Provisional marksheet from portal (free)\n• Original marksheet from Exam Section (after 2 weeks)\n\n📞 **examcell@git.edu** | **{{PHONE}}**']
  },
  {
    intentName: 'marksheet_download',
    keywords: ['marksheet','mark sheet','download marksheet','get marksheet','transcript','grade card'],
    trainingPhrases: ['where can i download my marksheet','marksheet download','how to get marksheet','transcript download'],
    responses: ['📄 **Marksheet Download:**\n\n**Provisional (Free):** **{{WEBSITE}}/results** → Login → Download\n\n**Original Marksheet:** Available at Exam Section 2 weeks after result. Carry ID proof.\n\n**Transcript (for higher studies/jobs):**\n• Apply at Exam Section — ₹200/copy\n• Processing: 5–7 working days\n• Attestation/apostille available on request\n\n📧 **examcell@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'revaluation',
    keywords: ['revaluation','rechecking','recheck','reverification','apply revaluation','marks review','challenge result','photocopy answer sheet'],
    trainingPhrases: ['can i apply for revaluation','revaluation process','rechecking of answer sheet','how to apply for revaluation'],
    responses: ['🔍 **Revaluation / Rechecking:**\n\n**Apply within 10 days of result**\n\n| Type | Fee | Timeline |\n|---|---|---|\n| Rechecking (re-totalling) | ₹200/subject | 10–15 days |\n| Photocopy of answer sheet | ₹200/subject | 5–7 days |\n| Revaluation (re-evaluation) | ₹500/subject | 20–25 days |\n\n📌 Fee refunded if marks increase by 5+\n📝 Apply: **{{WEBSITE}}/student-portal** → Examination → Revaluation\n📧 **examcell@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'passing_percentage',
    keywords: ['passing marks','passing percentage','minimum marks to pass','pass criteria','how to pass','minimum pass','passing standard'],
    trainingPhrases: ['what is the passing percentage','minimum marks to pass','passing marks in exam','pass criteria','how much to pass'],
    responses: ['✅ **Passing Criteria:**\n\n• **Theory:** Minimum **40%** (40/100) to pass\n• **Practical:** Minimum **40%** in lab exam\n• **Internal Assessment:** Must clear separately\n\n📌 A student can score well internally but still fail if external < 40% (and vice versa) — **both must be passed independently**.\n\nGrade Guide: O(90+) A+(80+) A(70+) B+(60+) B(50+) C(40+) F(<40)']
  },
  {
    intentName: 'backlog_fail',
    keywords: ['fail','backlog','reappear','supplementary','atkt','allowed to keep terms','back paper','kt','fail subject','failed exam'],
    trainingPhrases: ['what happens if i fail in a subject','backlog exam','reappear in exam','supplementary exam','atkt','can i reappear','repeat exam if fail'],
    responses: ['📝 **If You Fail a Subject (Backlog/ATKT):**\n\n• ✅ **ATKT:** You can move to the next semester while clearing backlogs\n• **Supplementary Exams:** Held alongside regular end-semester exams\n• **Backlog Form:** Student portal + ₹500/subject fee\n• **Max Attempts:** 6 attempts per subject\n• **Improvement Exam:** Available for students who want to improve existing passing grades\n\n📌 Degree awarded after clearing ALL backlogs\n📞 **examcell@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'improvement_exam',
    keywords: ['improvement exam','better marks','improve grade','re-exam to improve','betterment exam','upgrade marks'],
    trainingPhrases: ['are improvement exams available','can i retake exam to improve marks','improvement exam process','betterment exam','improve my grade'],
    responses: ['📈 **Improvement Exams:**\n\n✅ Yes! Students who have passed can appear for **improvement exams** to better their grades:\n\n• Available for **up to 3 subjects** per program\n• Can be attempted **once** per subject\n• Higher of the two marks (original/improvement) is considered\n• Apply via student portal within 10 days of result\n• Fee: ₹600/subject\n\n📌 Only theory subjects eligible; not practicals\n📞 **examcell@git.edu** | **{{PHONE}}**']
  },
  {
    intentName: 'online_exams',
    keywords: ['online exam','computer based test','cbt','digital exam','exam online','remote exam'],
    trainingPhrases: ['are online exams conducted','computer based exam','digital examination','exam from home','online test'],
    responses: ['💻 **Online Exam System:**\n\n• **Unit Tests** are conducted online via the college LMS (student portal)\n• **Mid-Semester Online:** Held in the campus computer lab (proctored)\n• **End-Semester:** Written (offline) in exam halls\n\n📌 Online quiz-based assessments are conducted weekly for some subjects\n📌 Students need their **Login ID + Password** for online tests\n\n🔗 LMS: **{{WEBSITE}}/student-portal**']
  },
  {
    intentName: 'exam_attendance',
    keywords: ['exam attendance','attendance for exam','75 percent','below 75','attendance rule','minimum attendance','attendance required exam','detained'],
    trainingPhrases: ['what is the minimum attendance requirement','attendance requirement for exams','75 percent attendance','what if attendance is low','attendance compulsory'],
    responses: ['📊 **Attendance Policy:**\n\n• **Minimum Required:** **75%** per subject per semester\n• **60–74%:** Conditional — principal\'s discretion + valid reason required\n• **Below 60%:** Detained — must repeat the semester\n\n**Medical Condonation:**\n• Submit doctor certificate within 3 days of absence\n• Max condonation: up to 10% (effective floor = 65%)\n\n📱 Check attendance daily at **{{WEBSITE}}/student-portal**\n📌 Attendance is strictly enforced — no exceptions without valid reason']
  },
  {
    intentName: 'mock_exams',
    keywords: ['mock exam','mock test','practice exam','sample test','trial exam','preparatory test','pre exam'],
    trainingPhrases: ['are mock exams conducted','practice tests available','sample question papers','previous year papers','mock tests before exams'],
    responses: ['📝 **Mock Exams & Practice Tests:**\n\n✅ Yes! Provided before every end-semester exam:\n\n• **Mock exams** conducted 2 weeks before semester exams\n• **Previous year question papers** available on student portal\n• **Sample question papers** shared by faculty\n• **Online practice quizzes** on LMS for daily revision\n• **Revision sessions** conducted by faculty 1 week before exams\n\n🔗 Previous papers: **{{WEBSITE}}/student-portal** → Examinations → Resources']
  },


  // ══════════════════════════════════════════════════════════════
  //  CAT 7 · FACULTY
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'faculty_info',
    keywords: ['faculty','professor','teacher','lecturer','staff','instructor','teaching staff','how many teachers'],
    trainingPhrases: ['who are the faculty members','tell me about faculty','faculty details','how many faculty','faculty list'],
    responses: ['👨‍🏫 **Faculty at {{COLLEGE_NAME}}:**\n\n• **Total Faculty:** 250+ qualified professionals\n• **Ph.D Holders:** 80% of senior faculty\n• **Industry Professionals:** 40% with 5+ years industry experience\n• **Research Publications:** 500+ in indexed journals (per year)\n• **Patents Filed:** 35+\n• **Average Experience:** 12+ years\n• **Faculty:Student Ratio:** ~1:20\n\n🔗 Faculty profiles: **{{WEBSITE}}/faculty**']
  },
  {
    intentName: 'faculty_qualified',
    keywords: ['faculty qualification','qualification of faculty','faculty experience','experienced teacher','faculty phd','how qualified'],
    trainingPhrases: ['what are the qualifications of faculty members','are teachers experienced','faculty qualification','qualified professors','faculty background'],
    responses: ['✅ **Faculty Qualifications:**\n\n• **80%** of faculty hold **Ph.D degrees** from top universities\n• **40%** have industry experience (TCS, Infosys, Microsoft, etc.)\n• **85%** actively involved in research\n• All faculty attend **FDP (Faculty Development Programs)** regularly\n• Visiting faculty from industry: TCS, Wipro, Microsoft\n\n🏆 Our faculty have received **National Awards for Teaching Excellence**!\n🔗 **{{WEBSITE}}/faculty**']
  },
  {
    intentName: 'hod_contacts',
    keywords: ['hod','head of department','department head','hod contact','principal','mca hod','bca hod'],
    trainingPhrases: ['who is the head of department','hod details','department head contact','hod email','who is hod of mca'],
    responses: ['👨‍💼 **Department Heads (HODs):**\n\n| Department | HOD | Email |\n|---|---|---|\n| CSE | Dr. A. Sharma | hod.cse@git.edu |\n| ECE | Dr. P. Nair | hod.ece@git.edu |\n| Mechanical | Dr. R. Verma | hod.me@git.edu |\n| Civil | Dr. S. Khan | hod.civil@git.edu |\n| IT | Dr. M. Singh | hod.it@git.edu |\n| MBA | Prof. K. Gupta | hod.mba@git.edu |\n| MCA | Dr. L. Patel | hod.mca@git.edu |\n| BCA | Prof. N. Joshi | hod.bca@git.edu |\n\n📞 Exchange: **{{PHONE}}**']
  },
  {
    intentName: 'faculty_office_hours',
    keywords: ['faculty office hours','professor office hours','meet professor','faculty available','faculty timing','when can i meet teacher'],
    trainingPhrases: ['are faculty office hours available','when can i meet my professor','faculty meeting hours','faculty available time'],
    responses: ['⏰ **Faculty Office Hours:**\n\n• Each faculty has **dedicated office hours** (2–3 hours/week)\n• Office hours schedule published on department notice board & LMS\n• Students can meet faculty **without appointment** during office hours\n• For outside office hours: Email faculty and fix appointment\n\n📌 Faculty are also reachable via **LMS messaging system**\n🔗 Department contacts: **{{WEBSITE}}/faculty**']
  },
  {
    intentName: 'mentor_programs',
    keywords: ['mentor','mentoring','mentorship','faculty mentor','academic mentor','mentor program','mentee','guidance from faculty'],
    trainingPhrases: ['are mentorship programs conducted by faculty','faculty mentoring','do students get mentors','peer mentoring programs'],
    responses: ['🤝 **Mentorship Programs:**\n\n✅ **Faculty Mentoring:**\n• Each student assigned a **faculty mentor** from day one\n• Monthly 1-on-1 sessions\n• Guidance on academics, career, personal challenges\n\n✅ **Peer Mentoring:**\n• Senior students mentor juniors\n• Particularly during 1st semester (critical transition period)\n\n✅ **Alumni Mentoring:**\n• Alumni volunteer as mentors for final year students\n• Career guidance, job search support\n\n🔗 **{{WEBSITE}}/student-support**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 8 · CAMPUS FACILITIES
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'campus_facilities',
    keywords: ['facilities','campus','amenities','infrastructure','what is available','campus life','labs','wifi','sports','canteen'],
    trainingPhrases: ['what facilities are available on campus','campus amenities','campus infrastructure','facilities list'],
    responses: ['🏛️ **Campus Facilities:**\n\n🔬 **Academic:** 50+ labs, Smart classrooms, Research centres\n📚 **Library:** 1.2 lakh+ books, 200+ journals, 24×7 digital access\n📶 **Wi-Fi:** 1 Gbps campus-wide — FREE for all\n🏋️ **Sports:** Cricket, Football, Basketball, Swimming Pool, Gym\n🍽️ **Cafeteria:** 3 canteens, 1 food court\n🏠 **Hostel:** AC/Non-AC boys & girls (1,200 seats)\n🚌 **Transport:** 25 buses, 30+ city routes\n🏥 **Medical:** 24×7 health centre + ambulance\n🅿️ **Parking:** Free for students (2-wheelers & 4-wheelers)\n🏪 **Others:** ATM, Bank Branch, Stationery, Career Centre']
  },
  {
    intentName: 'library',
    keywords: ['library','books','journals','reading room','e-library','digital library','study material','library timing','borrow books','library hours'],
    trainingPhrases: ['does the college have a library','library facilities','library timings','how many books','can students borrow books','library hours'],
    responses: ['📚 **Central Library:**\n\n• **Books:** 1,20,000+ volumes (all streams)\n• **E-Journals:** IEEE Xplore, Elsevier, Springer, JSTOR\n• **Newspapers & Magazines:** 30+ titles\n• **E-Books:** 50,000+ via INFLIBNET N-LIST\n• **Study Rooms:** 4 private study rooms (book via portal)\n\n**Timings:**\n• Mon–Sat: **8:00 AM – 9:00 PM**\n• Sunday: **10:00 AM – 5:00 PM**\n• Digital portal: **24×7** via **{{WEBSITE}}/library**\n\n**Borrowing:** 4 books | 14-day loan | ₹2/day fine for late return\n📧 **library@git.edu**']
  },
  {
    intentName: 'digital_library',
    keywords: ['digital library','e-books','ebooks','online books','electronic library','e-resources','e-journals','inflibnet','online study material'],
    trainingPhrases: ['is there a digital library','e-books available','online library resources','electronic journals','are ebooks available'],
    responses: ['💻 **Digital Library Resources:**\n\n• **INFLIBNET N-LIST:** Access to 6,000+ e-journals + 3 lakh+ e-books\n• **IEEE Xplore:** Engineering & technology research papers\n• **Springer, Elsevier:** Science & technology journals\n• **JSTOR:** Social science & humanities journals\n• **NPTEL:** Free video lectures from IITs & IISc\n\n✅ **Access:** Available **24×7** via **{{WEBSITE}}/library**\n✅ **Off-campus access:** Login from hostel/home with college credentials\n\n📧 **library@git.edu**']
  },
  {
    intentName: 'computer_lab',
    keywords: ['computer lab','lab','computers','systems','programming lab','it lab','how many computers','lab facilities','computer systems'],
    trainingPhrases: ['is there a computer lab','computer lab facilities','how many computers in lab','lab timing','programming lab'],
    responses: ['💻 **Computer Labs:**\n\n• **Total Labs:** 12 computer labs\n• **Systems:** 600+ computers (Core i5/i7, 8–16 GB RAM)\n• **Software:** All licensed — MS Office, AutoCAD, MATLAB, Eclipse, Android Studio, VS Code, PyCharm\n• **Internet:** 1 Gbps dedicated broadband\n• **OS:** Windows 10/11 + Linux dual boot\n\n**Timings:** 8:00 AM – 8:00 PM (Mon–Sat)\nSunday: Available for project work (with prior permission)\n\n📌 Students can use labs for **personal projects** with faculty permission']
  },
  {
    intentName: 'ai_ml_lab',
    keywords: ['ai lab','ml lab','data science lab','artificial intelligence lab','machine learning lab','data lab','ai infrastructure','specialized lab'],
    trainingPhrases: ['are there specialized labs for ai or data science','ai lab available','machine learning lab','data science infrastructure','innovation lab ai'],
    responses: ['🤖 **AI / ML / Data Science Labs:**\n\n✅ Yes! We have a dedicated **AI & Innovation Lab:**\n\n• **GPU Workstations:** 20 NVIDIA RTX-equipped systems\n• **Tools:** TensorFlow, PyTorch, Jupyter, Scikit-learn, Keras\n• **Datasets:** Access to Kaggle, UCI ML Repository\n• **Cloud:** AWS Educate, Google Cloud credits for students\n• **Projects:** Students work on real-world AI/ML projects\n\n🔗 **{{WEBSITE}}/labs/ai**\n📌 Open for all CSE/MCA/BCA students']
  },
  {
    intentName: 'robotics_iot_lab',
    keywords: ['robotics lab','iot lab','electronics lab','hardware lab','robotics kits','iot kits','embedded systems','arduino','raspberry pi'],
    trainingPhrases: ['are robotics labs available','is there an iot lab','electronics lab','hardware lab','are robotics kits available','arduino kits'],
    responses: ['🤖 **Robotics & IoT Labs:**\n\n✅ **Robotics Lab:**\n• 20+ robot kits (Arduino, Raspberry Pi, LEGO Mindstorms)\n• CNC machine, 3D printer\n• Drone development area\n\n✅ **IoT Lab:**\n• NodeMCU, ESP32, Raspberry Pi kits\n• Sensors: temperature, motion, IR, ultrasonic\n• Cloud IoT platforms: AWS IoT, Google IoT\n\n✅ **Electronics Lab:**\n• Oscilloscopes, signal generators, PCB fabrication\n\n📌 Open to all students for project work\n🔗 **{{WEBSITE}}/labs/robotics**']
  },
  {
    intentName: 'lab_after_hours',
    keywords: ['lab after hours','lab evening','lab open late','extra lab time','lab on weekend','lab sunday','personal project lab'],
    trainingPhrases: ['are computer labs open after class hours','can i use lab for personal projects','lab available on weekends','extra lab hours','lab open on sunday'],
    responses: ['🕐 **Lab Availability:**\n\n• **Regular Hours:** 8:00 AM – 8:00 PM (Mon–Sat)\n• **Sundays:** Open 10 AM – 5 PM for **project work** (register with lab incharge)\n• **After Hours (8–10 PM):** Available with **prior written permission** from HOD\n• **Personal Projects:** Allowed with faculty supervisor approval\n• **Booking:** Lab booking slots available on **{{WEBSITE}}/student-portal**\n\n📌 Lab assistants available during all regular hours']
  },
  {
    intentName: 'wifi_campus',
    keywords: ['wifi','wi-fi','internet','broadband','network','wireless','campus wifi','internet access','is wifi available','wifi speed','wifi limit'],
    trainingPhrases: ['is wifi available on campus','wifi facility','campus internet','is there wifi in college','campus wi-fi','free wifi','wifi speed'],
    responses: ['📶 **Wi-Fi at {{COLLEGE_NAME}}:**\n\n✅ **100% Wi-Fi Campus — FREE for all students!**\n\n• **Speed:** 1 Gbps dedicated line\n• **Coverage:** All buildings, hostels, library, cafeteria, sports area\n• **Access:** Login with college student credentials\n• **Hostel WiFi:** Available in all rooms (no extra charge)\n• **Limit:** Reasonable use policy applies (no torrenting)\n• **Firewall:** Safe & filtered browsing\n\n📌 Credentials provided at admission. For issues: **itsupport@git.edu**']
  },
  {
    intentName: 'smart_classrooms',
    keywords: ['smart classroom','digital classroom','smart board','projector','air conditioned classroom','ac classroom','classroom facilities','classroom technology'],
    trainingPhrases: ['are digital classrooms available','does college use smart boards','projectors in classrooms','air conditioned classrooms','smart boards used'],
    responses: ['🖥️ **Classroom Infrastructure:**\n\n✅ **Smart/Digital Classrooms:** 80% of classrooms\n• Interactive smart boards in all PG classrooms\n• HD projectors in all lecture halls\n• Wi-Fi enabled seating\n• Document cameras & audio systems\n\n✅ **Air Conditioning:**\n• All PG classrooms (MCA, MBA, M.Tech) — fully AC\n• UG classrooms — 60% AC\n\n✅ **Spacious:** All classrooms designed for 60–120 students\n✅ **Computers in labs:** Dedicated lab classrooms for practical courses']
  },
  {
    intentName: 'cafeteria',
    keywords: ['cafeteria','canteen','food','eat','dining','restaurant','tiffin','snacks','mess','food options','cafeteria timing'],
    trainingPhrases: ['is there a cafeteria','canteen available','where to eat','college food','cafeteria timing','food facilities','what food options'],
    responses: ['🍕 **Cafeteria & Food:**\n\n• **3 Canteens + 1 Food Court** on campus\n• Fresh, hygienic FSSAI-certified food\n• **Veg & Non-veg** options available\n• **Timing:** 7:30 AM – 9:00 PM (Mon–Sat)\n• Accepts UPI, cash, student ID prepaid card\n\n**Menu:** South Indian, North Indian, Chinese, snacks, juices, fresh meals\n\n**Price Range:** Snacks: ₹10–50 | Full Meal: ₹40–80 | Tea/Coffee: ₹10\n\n📌 Special menu on festivals 🎉']
  },
  {
    intentName: 'sports_facilities',
    keywords: ['sports','gym','ground','court','swimming pool','outdoor','indoor','cricket','football','basketball','sports facility','yoga','fitness'],
    trainingPhrases: ['is there a sports facility','sports facilities','gym in college','cricket ground','football field','basketball court','swimming pool','indoor games'],
    responses: ['⚽ **Sports Facilities:**\n\n**Outdoor:**\n• Cricket ground (turf pitch) | Football field (FIFA standard)\n• Basketball courts (3) | Volleyball courts (2)\n• Tennis courts (4) | 400m athletics track\n\n**Indoor:**\n• Gymnasium (250+ machines) — FREE for students\n• Badminton hall (6 courts) | Table tennis | Carrom | Chess\n\n**Other:**\n• **25m Swimming Pool** | Yoga & Meditation centre\n• Certified fitness trainers available\n\n⏰ Open: **6:00 AM – 8:00 PM** daily (FREE for students)']
  },
  {
    intentName: 'gym_yoga',
    keywords: ['gym','gymnasium','yoga','fitness','workout','exercise','meditation','fitness training','aerobics','health training'],
    trainingPhrases: ['does the college have a gym facility','yoga sessions conducted','fitness training available','is there a gym','yoga classes','meditation sessions'],
    responses: ['💪 **Gym, Yoga & Fitness:**\n\n✅ **Gymnasium:**\n• 250+ modern machines (cardio, weights, cross-training)\n• Certified fitness trainers — FREE guidance\n• Timing: **6:00 AM – 8:00 PM** daily\n\n✅ **Yoga & Meditation:**\n• Morning yoga sessions: **6:30 AM – 7:30 AM** (free for all)\n• Weekly meditation sessions on Wednesdays\n\n✅ **Diet & Nutrition:**\n• Quarterly nutrition workshops\n• Diet consultation available at Health Centre\n\n📌 All fitness facilities are **FREE for enrolled students!**']
  },
  {
    intentName: 'medical_facility',
    keywords: ['medical','health','doctor','clinic','nurse','ambulance','health centre','sick','hospital','first aid','health insurance','emergency medical'],
    trainingPhrases: ['does college have medical facilities','health centre','doctor on campus','medical facility','ambulance facility','health insurance for students','emergency medical'],
    responses: ['🏥 **Medical & Health Facilities:**\n\n✅ **24×7 On-Campus Health Centre:**\n• Resident doctor + 2 nurses round the clock\n• First aid & emergency treatment\n• Common medicines dispensed **FREE** to students\n• Ambulance service (on-call, 24×7)\n• Tie-up with City General Hospital (2 km)\n\n✅ **Health Insurance:**\n• **Group health insurance** for all enrolled students (₹500/year deducted from fees)\n• Coverage: ₹1 lakh per incident\n\n📞 Health Centre Emergency: **{{PHONE}}** ext. 911 (24×7)']
  },
  {
    intentName: 'drinking_water_sanitation',
    keywords: ['drinking water','water','restroom','toilet','bathroom','clean campus','hygiene','water purifier','water facility'],
    trainingPhrases: ['is drinking water available on campus','are restrooms clean','water purifier available','campus hygiene','sanitation facilities'],
    responses: ['💧 **Drinking Water & Sanitation:**\n\n✅ **Drinking Water:** RO purified water stations on every floor of every building\n✅ **Restrooms:** Clean, well-maintained facilities in all buildings\n• Separate restrooms for boys, girls, differently-abled\n• Cleaned **4 times daily** by dedicated housekeeping\n• Sanitary vending machines in girls\' restrooms\n\n✅ **Campus Hygiene:** ISO-certified hygiene standards\n✅ **Pest Control:** Monthly campus-wide treatment\n\n📌 Report maintenance issues via the student portal or call **{{PHONE}}**']
  },
  {
    intentName: 'parking',
    keywords: ['parking','park','bike','car','vehicle','parking area','two-wheeler','four-wheeler','parking space','bicycle parking'],
    trainingPhrases: ['is there a parking area','parking facility','bike parking','car parking','vehicle parking','is parking free','bicycle parking'],
    responses: ['🅿️ **Parking at {{COLLEGE_NAME}}:**\n\n✅ **FREE Parking for all students & staff:**\n\n• **2-Wheeler:** 2,000+ covered slots\n• **4-Wheeler:** 500+ slots\n• **Bicycle Parking:** Dedicated secure area near all blocks\n• **EV Charging:** 4 charging points (bikes & cars)\n\n📌 **Vehicle Registration:** Register at Security Office (RC + DL copy required)\n📌 Speed limit on campus: **10 km/h**\n📌 CCTV monitoring in all parking areas — secure & safe']
  },


  // ══════════════════════════════════════════════════════════════
  //  CAT 9 · HOSTEL (100 Questions Covered)
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'hostel_details',
    keywords: ['hostel','accommodation','boarding','stay','room','dorm','hostel available','girls hostel','boys hostel','hostel facility'],
    trainingPhrases: ['does college have hostel','hostel facility available','accommodation on campus','is hostel available','separate hostels','hostel details'],
    responses: ['🏠 **Hostel at {{COLLEGE_NAME}}:**\n\n✅ **Separate Boys & Girls Hostels** (total 1,200 seats)\n\n**Room Types & Fees (per annum):**\n| Type | Sharing | AC | Fee/Year |\n|---|---|---|---|\n| Standard Room | 4-person | ❌ | ₹45,000 |\n| Semi-Private | 2-person | ❌ | ₹60,000 |\n| Private Room | 1-person | ✅ | ₹85,000 |\n\n**Includes:** 3 meals/day | Wi-Fi | 24×7 security | Laundry | Common room\n\n🔗 **{{WEBSITE}}/hostel** | 📞 **{{PHONE}}** ext. 301 (Boys) / 302 (Girls)']
  },
  {
    intentName: 'hostel_application',
    keywords: ['hostel application','apply hostel','how to get hostel','hostel admission','hostel registration','hostel apply','hostel form'],
    trainingPhrases: ['how can i apply for hostel accommodation','hostel application process','how to apply for hostel','hostel registration','hostel form fill'],
    responses: ['📝 **Hostel Application Process:**\n\n**Step 1:** Fill hostel form at **{{WEBSITE}}/hostel/apply** or at Hostel Office\n**Step 2:** Upload: admission letter + ID proof + medical fitness certificate\n**Step 3:** Pay hostel deposit (₹5,000 refundable)\n**Step 4:** Room allotment via lottery / merit basis\n**Step 5:** Collect room key + hostel handbook at reporting\n\n📌 **Apply early** — hostel seats are limited and fill up fast!\n📌 First-year students get **priority allocation**\n📧 **hostel@git.edu** | 📞 **{{PHONE}}** ext. 301']
  },
  {
    intentName: 'hostel_first_year_guarantee',
    keywords: ['hostel for first year','guaranteed hostel','first year hostel','hostel first year students','freshman hostel','hostel guaranteed'],
    trainingPhrases: ['is hostel accommodation guaranteed for first-year students','hostel for freshers','do first year students get hostel','hostel priority first year'],
    responses: ['✅ **Hostel for First-Year Students:**\n\n**Yes! First-year (outstation) students get PRIORITY in hostel allocation.**\n\n• First-year students are allocated hostel before others\n• Outstation students (distance > 50 km) get **guaranteed hostel** subject to seat availability\n• Apply within **2 weeks of admission confirmation**\n• Local students can also apply — allocated on availability\n\n📌 Apply early since 1,200 seats serve 5,000+ students\n📧 **hostel@git.edu** | 📞 **{{PHONE}}** ext. 301']
  },
  {
    intentName: 'hostel_room_facilities',
    keywords: ['hostel room','hostel furniture','what in hostel room','hostel amenities','hostel room equipped','study table hostel','wardrobe hostel'],
    trainingPhrases: ['what facilities are provided in hostel rooms','hostel room facilities','are hostel rooms furnished','what is in hostel room','study table in hostel'],
    responses: ['🛏️ **Hostel Room Facilities:**\n\n**Each room includes:**\n• ✅ Single bed + mattress per student\n• ✅ Study table + chair per student\n• ✅ Personal wardrobe/cupboard with lock\n• ✅ Bookshelf\n• ✅ Fan (all rooms) | AC (single rooms)\n• ✅ 24×7 hot & cold water\n• ✅ Power outlets (2 per student)\n• ✅ Study lamp\n• ✅ Wi-Fi connectivity\n\n📌 Students may bring personal items (small fridge allowed with permission)\n📌 Cooking appliances (induction, microwave) **NOT allowed** for fire safety']
  },
  {
    intentName: 'hostel_meals',
    keywords: ['hostel meals','mess food','hostel food','hostel mess','meal hostel','breakfast lunch dinner hostel','mess timing','food in hostel'],
    trainingPhrases: ['are meals provided in hostel','hostel mess food','what food is served in hostel','meal timing hostel','mess menu','veg nonveg hostel'],
    responses: ['🍽️ **Hostel Mess / Meals:**\n\n✅ **3 meals + evening snacks daily — INCLUDED in hostel fee:**\n\n| Meal | Timing |\n|---|---|\n| 🌅 Breakfast | 7:00 – 9:00 AM |\n| ☀️ Lunch | 12:30 – 2:30 PM |\n| 🌆 Evening Snacks | 5:00 – 6:00 PM |\n| 🌙 Dinner | 7:30 – 9:30 PM |\n\n• Both **Vegetarian & Non-Vegetarian** options daily\n• Monthly menu rotated for variety\n• Special traditional meals on festivals\n• FSSAI certified kitchen\n\n📌 Outside food allowed (no cooking appliances)\n📌 **Mess feedback** submitted monthly — menu improved based on feedback']
  },
  {
    intentName: 'hostel_warden',
    keywords: ['hostel warden','warden available','hostel incharge','warden 24 hours','warden contact','hostel supervisor'],
    trainingPhrases: ['are hostel wardens available 24 hours','hostel warden contact','is warden available at night','hostel incharge'],
    responses: ['👮 **Hostel Warden & Staff:**\n\n✅ Wardens available **24 hours, 7 days a week**\n\n• **Boys Hostel Warden:** Mr. Suresh Kumar | 📞 ext. 301\n• **Girls Hostel Warden:** Mrs. Sunita Sharma | 📞 ext. 302\n• **Night Duty Warden:** On rotation (different staff each night)\n• **Resident Caretakers:** 1 per hostel floor\n\n📌 Wardens conduct welfare rounds daily\n📌 Emergency contact numbers posted in every hostel room\n📧 **hostel@git.edu**']
  },
  {
    intentName: 'hostel_curfew',
    keywords: ['hostel curfew','hostel gate close','hostel timing','when hostel gate close','hostel in time','stay outside hostel','hostel return time'],
    trainingPhrases: ['is there a curfew time in hostels','what time do hostel gates close','hostel gate close time','can hostel students stay outside overnight','hostel return time'],
    responses: ['🕙 **Hostel Timings & Curfew:**\n\n| | Boys | Girls |\n|---|---|---|\n| Gate Close | 10:00 PM | 9:00 PM |\n| Lights Out | 11:00 PM | 10:30 PM |\n| Morning Open | 5:30 AM | 5:30 AM |\n\n**Overnight Outings:**\n• Boys: Allowed on weekends with **gate pass** + parent consent\n• Girls: Allowed on weekends with **written parent consent** + warden approval\n\n📌 Late arrivals must be pre-approved by warden\n📌 Repeated curfew violations → disciplinary action']
  },
  {
    intentName: 'hostel_security',
    keywords: ['hostel security','hostel safe','hostel cctv','security hostel','hostel guard','hostel safety','hostel protected'],
    trainingPhrases: ['is security available in hostels','hostel security details','are cctv cameras in hostel','hostel safe for girls','hostel guard'],
    responses: ['🛡️ **Hostel Security:**\n\n✅ Round-the-clock security:\n\n• **CCTV cameras:** All corridors, entry/exit points, common areas\n• **Biometric entry:** Digital access control at hostel gates\n• **Security guards:** 2 guards per hostel per shift (3 shifts/day)\n• **Visitor registration:** All visitors sign-in at gate with ID\n• **Night patrolling:** Regular rounds by security staff\n• **Women Safety:** Only female wardens & staff in girls\' hostel\n• **Emergency alarm** buttons installed on every floor']
  },
  {
    intentName: 'hostel_visiting_hours',
    keywords: ['hostel visiting hours','visitor hostel','parents visit hostel','hostel guests','relatives visit hostel','when can parents visit'],
    trainingPhrases: ['what are the hostel visiting hours','are parents allowed to visit hostel students','when can family visit hostel','hostel visitor timings'],
    responses: ['👪 **Hostel Visiting Hours:**\n\n| Visitor Type | Days | Timing |\n|---|---|---|\n| Parents | Daily | 4:00 PM – 7:00 PM |\n| Other relatives | Weekends only | 10:00 AM – 5:00 PM |\n| Friends | Not allowed in rooms | Common room only |\n\n📌 Visitors must register at the hostel gate with photo ID\n📌 Visitors are **not allowed** inside hostel rooms (common rooms only)\n📌 **Guest rooms** available for parents staying overnight — book in advance\n📧 **hostel@git.edu**']
  },
  {
    intentName: 'hostel_guest_room',
    keywords: ['hostel guest room','parent stay hostel','can parents stay','guest room hostel','overnight stay hostel','parent accommodation'],
    trainingPhrases: ['are hostel guest rooms available','can parents stay in hostel','parent overnight accommodation','guest rooms for parents'],
    responses: ['🏨 **Hostel Guest Rooms:**\n\n✅ Yes! **Guest rooms available for parents/guardians:**\n\n• **Capacity:** 10 guest rooms (20 beds)\n• **Charges:** ₹300–500 per night (meals extra)\n• **Booking:** Advance booking required — 3 days notice\n• **Available:** Especially during admission season, convocation\n\n📌 Alumni can also stay in guest rooms (subject to availability)\n📧 **hostel@git.edu** | 📞 **{{PHONE}}** ext. 305\n🔗 **{{WEBSITE}}/hostel/guest**']
  },
  {
    intentName: 'hostel_laundry',
    keywords: ['laundry hostel','washing hostel','hostel clothes','washing machine hostel','laundry service','hostel laundry facility'],
    trainingPhrases: ['are laundry facilities available in hostels','hostel washing machine','laundry service hostel','hostel cloth washing'],
    responses: ['👕 **Hostel Laundry Facilities:**\n\n✅ **Laundry Service available:**\n\n• **Self-service washing machines:** 2 per floor (free usage)\n• **Drying area:** Covered drying space on each floor\n• **Paid laundry service:** ₹600/month (pickup + drop daily except Sunday)\n\n📌 Irons available at common room (free usage)\n📌 Dry cleaning items: Drop at hostel office for arrangement']
  },
  {
    intentName: 'hostel_common_room',
    keywords: ['hostel common room','hostel recreation','hostel tv','indoor games hostel','hostel study hall','hostel study room','recreation room hostel'],
    trainingPhrases: ['are there common rooms in hostels','hostel recreation room','hostel tv room','study halls in hostel','indoor games in hostel'],
    responses: ['🎮 **Hostel Common Rooms & Study Areas:**\n\n✅ **Recreation Room (per hostel block):**\n• LED TV with cable/streaming\n• Indoor games: Carrom, Chess, Table Tennis\n• Comfortable seating\n\n✅ **Study Halls:**\n• 2 dedicated study halls per hostel building\n• Open until midnight (even on exam nights)\n• Quiet zone — no disturbance policy\n\n✅ **Other:**\n• Vending machines (snacks & beverages)\n• ATM access inside campus\n• Stationery available at hostel counter']
  },
  {
    intentName: 'hostel_refund',
    keywords: ['hostel fee refund','hostel refund','hostel deposit refund','hostel cancel','leave hostel refund','hostel fees refundable'],
    trainingPhrases: ['are hostel fees refundable','hostel fee refund policy','hostel deposit refund','if i leave hostel do i get money back'],
    responses: ['💰 **Hostel Fee Refund Policy:**\n\n| Situation | Refund |\n|---|---|\n| Cancel before joining | 80% of hostel fee |\n| Leave within 1 month | 60% (pro-rated) |\n| Leave after 1 month | No refund (annual fee) |\n| Security Deposit | **100% refundable** (at checkout, no damages) |\n\n📌 Submit hostel cancellation form + ID at Hostel Office\n📌 Refund processed within **15–20 working days**\n📧 **hostel@git.edu** | 📞 **{{PHONE}}** ext. 301']
  },
  {
    intentName: 'hostel_wifi',
    keywords: ['hostel wifi','internet in hostel','wifi in room','hostel internet','hostel wifi speed','hostel network','wifi hostel'],
    trainingPhrases: ['is internet available in hostel rooms','hostel wifi available','hostel internet speed','wifi in hostel rooms','hostel wifi password'],
    responses: ['📶 **Hostel Wi-Fi:**\n\n✅ **High-speed Wi-Fi in every hostel room — FREE!**\n\n• **Speed:** Dedicated 200 Mbps per hostel block\n• **Coverage:** Every room, corridor, common room, study hall\n• **Login:** College ID credentials\n• **Password:** Provided at hostel check-in\n• **Availability:** 24×7 (not switched off at night)\n• **Limit:** Fair-use policy (no torrenting)\n\n📌 For connectivity issues: **itsupport@git.edu** or call **{{PHONE}}** ext. 400']
  },
  {
    intentName: 'hostel_room_change',
    keywords: ['change hostel room','room transfer','switch hostel room','hostel room change request','different room','room swap'],
    trainingPhrases: ['can students change hostel rooms','hostel room transfer','request different room','room change process','room swap hostel'],
    responses: ['🔄 **Hostel Room Change:**\n\n✅ Yes, room changes are allowed with valid reasons:\n\n**Process:**\n1️⃣ Submit written request to Hostel Warden (state reason)\n2️⃣ Warden reviews within 3 working days\n3️⃣ Room swap approved if alternate room available\n4️⃣ Room change fee: ₹200 (admin charge)\n\n**Valid reasons:** Medical condition, roommate conflict, noise issues, proximity needs\n\n📌 Room changes only allowed in **first 4 weeks** of semester\n📧 **hostel@git.edu**']
  },
  {
    intentName: 'hostel_power_backup',
    keywords: ['hostel power','hostel generator','power cut hostel','electricity hostel','power backup hostel','hostel light fail','backup hostel'],
    trainingPhrases: ['are there generators in hostels during power cuts','power backup hostel','hostel electricity supply','electricity in hostel rooms','generator hostel'],
    responses: ['⚡ **Hostel Power Supply:**\n\n✅ **100% Power Backup:**\n\n• **Diesel Generators:** Automatic switchover within 30 seconds of power cut\n• **UPS:** Covers lights, fans, and Wi-Fi routers without interruption\n• **Solar panels:** 25% of hostel power from solar energy\n• **Electricity charges:** Included in hostel fee (reasonable usage)\n• **AC rooms:** Higher electricity included in premium room fee\n\n📌 No power cuts expected to last longer than a few minutes']
  },
  {
    intentName: 'hostel_fire_safety',
    keywords: ['hostel fire safety','fire hostel','fire extinguisher hostel','hostel fire alarm','fire drill hostel','emergency hostel','fire exit hostel'],
    trainingPhrases: ['are there fire safety systems in hostels','hostel fire extinguisher','hostel fire alarm','are fire drills conducted in hostels'],
    responses: ['🔥 **Hostel Fire Safety:**\n\n✅ Full fire safety compliance:\n\n• Smoke detectors on every floor\n• Fire extinguishers on every floor (checked monthly)\n• Emergency sprinkler systems installed\n• Fire exits on every floor (clearly marked)\n• Fire evacuation plan displayed in every room\n\n✅ **Fire Drills:**\n• Conducted **twice per semester**\n• All students must participate\n\n📞 Fire emergency: **{{PHONE}}** ext. 911 (24×7)']
  },
  {
    intentName: 'hostel_feedback',
    keywords: ['hostel complaint','hostel feedback','hostel issue','hostel problem','report hostel','hostel committee','hostel suggestion'],
    trainingPhrases: ['can students provide feedback about hostel','hostel complaint process','hostel committee','report hostel problem','hostel feedback portal'],
    responses: ['📣 **Hostel Feedback & Complaints:**\n\n✅ Multiple channels available:\n\n• **Online:** Student portal → Hostel → Submit Feedback\n• **Physical:** Complaint/suggestion box on each hostel floor\n• **Direct:** Meet Hostel Warden during office hours (6–8 PM)\n• **Anonymous:** Anonymous complaint option on portal\n\n✅ **Hostel Committee:**\n• Student representatives on the Hostel Committee (elected)\n• Monthly hostel committee meetings\n• Complaints resolved within **48–72 hours**\n\n📧 **hostel@git.edu** | 📞 **{{PHONE}}** ext. 301']
  },
  {
    intentName: 'hostel_maintenance',
    keywords: ['hostel maintenance','hostel repair','hostel cleaning','hostel room repair','hostel service','hostel housekeeping','hostel pest control'],
    trainingPhrases: ['are hostel maintenance services available regularly','hostel cleaning schedule','hostel room repair','housekeeping hostel','pest control hostel'],
    responses: ['🔧 **Hostel Maintenance Services:**\n\n✅ **Daily Cleaning:**\n• Rooms cleaned by housekeeping team daily (with student permission)\n• Corridors, bathrooms: cleaned **twice daily**\n• Common rooms: cleaned after each use\n\n✅ **Maintenance & Repair:**\n• Request via student portal (resolved within 24 hours for urgent, 3 days others)\n• Dedicated maintenance team on campus 24×7\n\n✅ **Pest Control:**\n• Monthly campus-wide pest control treatment\n• Rodent control quarterly\n\n📌 Report issues: **hostel@git.edu** or maintenance portal']
  },
  {
    intentName: 'hostel_orientation',
    keywords: ['hostel orientation','hostel induction','hostel welcome','hostel rules explained','hostel day one','hostel joining'],
    trainingPhrases: ['is there a hostel orientation program','hostel induction day','hostel welcome program','what happens on first day at hostel'],
    responses: ['🎉 **Hostel Orientation Program:**\n\n✅ A dedicated **Hostel Orientation** is conducted for new students:\n\n• **Day 1:** Campus & hostel tour, room allocation, key collection\n• **Day 2:** Introduction to hostel rules, warden meeting, mess card, wifi setup\n• **Day 3:** Student-to-student interaction, senior student mentors assigned\n\n📌 Orientation happens during the first week of admission\n📌 Parents are invited to the first-day orientation session\n📧 **hostel@git.edu**']
  },
  {
    intentName: 'hostel_fees_payment',
    keywords: ['hostel fee payment','pay hostel fees','hostel fee online','hostel annual fee','hostel monthly fee','hostel fees mode','hostel fee discount'],
    trainingPhrases: ['how can i pay hostel fees','can hostel fees be paid online','are hostel fees paid annually or monthly','hostel fee payment mode','hostel fee discount'],
    responses: ['💳 **Hostel Fee Payment:**\n\n• **Mode:** Annual (preferred) or **2 installments**\n  - Installment 1: At hostel joining\n  - Installment 2: By **30 November**\n• **Online Payment:** **{{WEBSITE}}/pay** (UPI, Card, Net Banking)\n• **Offline:** Cash/DD at Accounts Office\n\n**Discounts:**\n• **Early bird:** ₹1,000 off if paid before 31 July\n• **Scholarship holders:** Hostel fee reduced proportionally\n\n📧 **accounts@git.edu** | 📞 **{{PHONE}}**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 10 · TRANSPORT (100 Questions Covered)
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'transport',
    keywords: ['bus','transport','shuttle','pickup','route','commute','travel','vehicle','transportation','college bus','bus service'],
    trainingPhrases: ['does college provide transportation','college bus service','bus routes','transport facility','is there a bus for students'],
    responses: ['🚌 **College Transport Service:**\n\n✅ Extensive bus service covering the entire city!\n\n• **Fleet:** 25 buses (AC & Non-AC)\n• **Routes:** 30+ routes across city\n• **Pick-up Points:** 150+ locations\n• **Timings:** Pickup from **7:15 AM** | Drop from **5:00 PM**\n\n**Annual Transport Fee:**\n| Distance | Fee |\n|---|---|\n| Within 15 km | ₹18,000 |\n| 15–30 km | ₹22,000 |\n| 30+ km | ₹26,000 |\n\n🔗 **{{WEBSITE}}/transport** | 📧 **transport@git.edu**']
  },
  {
    intentName: 'transport_application',
    keywords: ['apply transport','transport registration','register bus','how to get bus','transport form','bus pass application','transport enroll'],
    trainingPhrases: ['how can students apply for transport facilities','transport registration process','how to register for bus service','apply for college bus','bus pass'],
    responses: ['📝 **Applying for Transport:**\n\n**Online:**\n1️⃣ Visit **{{WEBSITE}}/transport/apply**\n2️⃣ Select your pickup area/stop\n3️⃣ Pay transport fee online\n4️⃣ Transport pass issued within 2 working days\n\n**Offline:**\n• Visit Transport Office (Admin Block, Ground Floor)\n• Mon–Sat, 9 AM – 4 PM\n\n📌 Apply before **20 July** for smooth start-of-semester boarding\n📌 Transport pass must be carried while boarding buses\n📧 **transport@git.edu** | 📞 **{{PHONE}}** ext. 180']
  },
  {
    intentName: 'bus_timings',
    keywords: ['bus timing','bus time','what time bus','bus schedule','bus departure','bus arrival','pickup time','drop time'],
    trainingPhrases: ['what are the bus timings for college transport','bus departure time','pickup time','drop time college bus','bus schedule'],
    responses: ['🕗 **Bus Timings:**\n\n**Morning (College-bound):**\n• Earliest pickup: **6:30 AM** (far routes)\n• City centre pickup: **7:00 – 7:30 AM**\n• Arrives college: **8:00 – 8:30 AM** (before 1st lecture at 8:30 AM)\n\n**Evening (Return):**\n• 1st batch drop: **4:00 PM** (after last lecture)\n• 2nd batch: **5:30 PM** (after labs/activities)\n• Late buses: **7:30 PM** (for evening classes)\n\n📌 Exact timings vary by route\n🔗 Full schedule: **{{WEBSITE}}/transport/schedule**']
  },
  {
    intentName: 'bus_routes',
    keywords: ['bus route','which areas','route list','bus coverage','my area bus','does bus go to','route number','route map','bus areas'],
    trainingPhrases: ['what are the bus routes','which areas does bus cover','bus route list','is there bus from my area','bus route details'],
    responses: ['🗺️ **Bus Routes Coverage:**\n\n30+ routes covering:\n• City Centre | Railway Station | Bus Stand\n• North Zone: Suburban areas, residential colonies\n• South Zone: Industrial area, satellite towns\n• East & West: All major localities\n• Coverage radius: **up to 40 km from college**\n\n🔗 **Interactive route map:** **{{WEBSITE}}/transport/routes**\n📱 Download **GIT Bus App** (Play Store) for real-time tracking\n📞 Transport Office: **transport@git.edu** | **{{PHONE}}** ext. 180\n\n📌 Don\'t see your area? Call to check — new stops added regularly!']
  },
  {
    intentName: 'transport_fee',
    keywords: ['transport fee','bus fee','what is transport fee','how much bus','transport charges','bus cost','travel fee'],
    trainingPhrases: ['what is the transport fee','bus fee per year','how much is transport fee','transport charges','bus cost per semester'],
    responses: ['💰 **Transport Fee (Annual):**\n\n| Distance from College | Annual Fee |\n|---|---|\n| Within 15 km | **₹18,000** |\n| 15–30 km | **₹22,000** |\n| 30–40 km | **₹26,000** |\n\n**Per Semester:** Divide annual fee by 2\n\n**Discounts:**\n• Sibling discount: ₹2,000 off second sibling\n• SC/ST students: 25% concession\n\n📌 Transport fee is **separate** from tuition fees\n🔗 **{{WEBSITE}}/transport**']
  },
  {
    intentName: 'transport_safety',
    keywords: ['transport safety','bus safe','safe transport','bus gps','bus cctv','female safety bus','bus security','safe travel'],
    trainingPhrases: ['are transport services safe for students','transport buses equipped with gps tracking','are there female staff on buses','bus safety measures','safe travel'],
    responses: ['🛡️ **Transport Safety Measures:**\n\n✅ All buses equipped with:\n• **GPS tracking** — real-time location visible on GIT Bus App\n• **CCTV cameras** inside & outside each bus\n• **Emergency contact** numbers displayed prominently\n• **First Aid kit** + fire extinguisher in every bus\n• **Emergency exit doors** (clearly marked)\n• **Seat belts** available\n\n✅ **Female Safety:**\n• Female staff/escort on all buses with girl students\n• CCTV footage reviewed daily\n• Direct helpline: **{{PHONE}}** ext. 180\n\n✅ **Driver verification:** All drivers licensed, police-verified, trained']
  },
  {
    intentName: 'transport_app',
    keywords: ['transport app','bus app','track bus','bus tracking app','mobile app bus','real time tracking','git bus app'],
    trainingPhrases: ['can transport buses be tracked via mobile app','bus tracking app','real time bus location','git mobile app transport','track bus arrival'],
    responses: ['📱 **GIT Bus Mobile App:**\n\n✅ Download **"GIT Bus Tracker"** from Google Play Store\n\n**Features:**\n• 🔴 Real-time bus location on map\n• ⏱️ Estimated arrival time at your stop\n• 📢 Delay notifications & alerts\n• 🗺️ All bus routes & stops\n• 📞 Emergency contact button\n• 🔔 Set reminders for your bus\n\n📌 Login with your college ID\n📌 Parents can also download the app to track their ward\'s bus\n🔗 **{{WEBSITE}}/transport/app**']
  },
  {
    intentName: 'transport_pass',
    keywords: ['transport pass','bus pass','transport card','travel pass','renew pass','bus pass renewal','transport id'],
    trainingPhrases: ['are transport passes issued to students','how to get bus pass','transport pass renewal','renew transport pass online','bus pass process'],
    responses: ['🪪 **Transport Pass:**\n\n✅ Transport pass issued to all registered students:\n\n• **Physical pass:** Smart card with student photo\n• **Digital pass:** Available on GIT Mobile App\n• **Validity:** One semester (renewed each semester)\n\n**Renewal:**\n• Online via **{{WEBSITE}}/transport/renew** before semester start\n• Fee payment triggers automatic pass renewal\n\n📌 Must carry pass while boarding — conductors verify\n📌 Lost pass: Apply for duplicate (₹100 fee)\n📧 **transport@git.edu**']
  },
  {
    intentName: 'transport_cancel',
    keywords: ['cancel transport','leave bus service','opt out transport','transport cancel','stop bus service','discontinue transport'],
    trainingPhrases: ['can students cancel transport services','opt out of bus service','transport cancellation','discontinue bus','leave bus service mid semester'],
    responses: ['❌ **Transport Cancellation:**\n\n• **Before semester starts:** Full refund minus ₹200 admin fee\n• **Within first 30 days:** 50% refund\n• **After 30 days:** No refund (mid-semester cancellation)\n\n**Process:**\n1️⃣ Submit cancellation form at Transport Office\n2️⃣ Return transport pass/card\n3️⃣ Refund processed in 10–15 working days\n\n📌 You can **opt back in** next semester if needed\n📧 **transport@git.edu** | 📞 **{{PHONE}}** ext. 180']
  },
  {
    intentName: 'transport_holiday',
    keywords: ['bus on holiday','transport holiday','weekend bus','bus sunday','bus festival','holiday transport','bus on national holiday'],
    trainingPhrases: ['are transport services available during holidays','bus operate on weekends','bus service on national holiday','weekend bus service','transport during festivals'],
    responses: ['🗓️ **Transport During Holidays:**\n\n| Day | Service |\n|---|---|\n| Regular weekdays | ✅ Full service |\n| Saturdays | ✅ Full service |\n| Sundays | ❌ No service (unless exam/event) |\n| National Holidays | ❌ No regular service |\n| Exam days | ✅ Special early buses available |\n| Cultural/Sports events | ✅ Event-specific buses arranged |\n\n📌 Special buses for **convocation, fests, exams** are announced via SMS/email 3 days in advance\n🔗 **{{WEBSITE}}/transport/schedule**']
  },
  {
    intentName: 'transport_disability',
    keywords: ['disabled transport','wheelchair bus','accessible bus','handicap transport','differently abled transport','reserved seat bus','transport for disabled'],
    trainingPhrases: ['are there reserved seats for disabled students on buses','is transport accessible for wheelchair users','disabled student transport','differently abled bus'],
    responses: ['♿ **Transport for Differently-Abled Students:**\n\n✅ Yes! Special provisions:\n\n• **Reserved seats:** 2 front seats per bus reserved for differently-abled students\n• **Wheelchair accessibility:** 3 buses with wheelchair ramps\n• **Low-floor buses:** Available on request with 2-day advance notice\n• **Priority boarding:** Differently-abled students board first\n• **Campus shuttle:** Electric golf carts for in-campus mobility\n\n📌 Register your special requirement at the Transport Office\n📞 **{{PHONE}}** ext. 180']
  },


  // ══════════════════════════════════════════════════════════════
  //  CAT 11 · PLACEMENTS & INTERNSHIPS
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'placements',
    keywords: ['placement','placements','job','package','salary','recruit','company','campus recruitment','hire','lpa','ctc','career','placed','placement record'],
    trainingPhrases: ['does college provide placement','placement details','placement record','companies visit campus','average package','highest package','placement statistics'],
    responses: ['💼 **Placement Highlights 2024:**\n\n• ✅ **Placement Rate:** 92% of eligible students\n• 🏆 **Highest Package:** ₹42 LPA (Amazon)\n• 📊 **Average Package:** ₹8.5 LPA\n• 🏢 **Companies:** 150+ visited (TCS, Infosys, Wipro, Accenture, Amazon, Microsoft, Deloitte, L&T, Capgemini)\n• 💰 **Package Range:** ₹3.5 LPA – ₹42 LPA\n• 🌍 **International Offers:** 12 students placed abroad\n\n**By Sector:** IT: 65% | Core Engg: 15% | Finance: 10% | Others: 10%\n\n🔗 **{{WEBSITE}}/placements** | 📧 **placement@git.edu**']
  },
  {
    intentName: 'placement_process',
    keywords: ['placement process','how placement works','campus placement steps','when placement starts','placement procedure','campus drive'],
    trainingPhrases: ['how does the placement process work','when do campus placements begin','placement process details','campus drive process'],
    responses: ['📋 **Placement Process at {{COLLEGE_NAME}}:**\n\n**Phase 1: Pre-Placement (Jul–Nov)**\n• Aptitude + Communication training\n• Resume workshops | Mock interviews\n• Company pre-placement talks (PPTs)\n\n**Phase 2: Campus Drives (Dec–Mar)**\n• Online aptitude test → Technical interview → HR interview\n• Offer letter within 2–4 weeks\n\n**Phase 3: Joining (Jul–Sep)**\n• Students join companies after graduation\n\n📌 **Eligibility:** No active backlogs + CGPA ≥ 6.0 (most companies)\n📧 **placement@git.edu** | 📞 **{{PHONE}}** ext. 250']
  },
  {
    intentName: 'placement_companies',
    keywords: ['which companies','companies visit','recruiters','companies list','top companies','mnc','recruiter list','what companies hire'],
    trainingPhrases: ['what companies visit the campus for recruitment','which companies hire from college','top recruiters','mnc visiting campus','companies list placement'],
    responses: ['🏢 **Top Recruiting Companies:**\n\n**IT Giants:** TCS, Infosys, Wipro, HCL, Tech Mahindra, Cognizant\n**Big Tech:** Amazon, Microsoft, Google, IBM, Oracle, Capgemini\n**Core Engineering:** L&T, Siemens, Bosch, Tata Motors, BHEL\n**Finance/Consulting:** Deloitte, EY, KPMG, Accenture\n**Startups:** 20+ funded startups recruit every year\n\n✅ **150+ companies** visited in 2024\n✅ **Multinational companies:** Yes, 40+ MNCs visit\n✅ **Startups:** Yes, high-growth startups actively recruit\n\n🔗 Full recruiter list: **{{WEBSITE}}/placements/companies**']
  },
  {
    intentName: 'placement_training',
    keywords: ['placement training','placement preparation','pre placement','aptitude training','interview training','placement coaching','soft skills training','communication training'],
    trainingPhrases: ['does the college provide placement training','aptitude training classes','communication skill training','placement coaching','soft skills training'],
    responses: ['🎯 **Placement Training Program:**\n\n**Year 1–2: Foundation**\n• Programming skills (C/Java/Python)\n• Communication & presentation skills\n• Personality development\n\n**Year 3: Core Preparation**\n• Quantitative Aptitude + Logical Reasoning\n• Verbal Ability + Group Discussion\n• Technical mock tests\n\n**Year 4 (Pre-Placement Season):**\n• Company-specific mock tests\n• 1-on-1 mock interviews\n• Resume review by placement experts\n• GD practice sessions\n\n✅ **All training is FREE** for enrolled students!\n📧 **placement@git.edu**']
  },
  {
    intentName: 'mock_interviews',
    keywords: ['mock interview','practice interview','interview training','hr interview practice','technical interview mock','gd practice','group discussion'],
    trainingPhrases: ['are mock interviews conducted','mock interview sessions','practice interviews','gd sessions','group discussion practice','interview preparation'],
    responses: ['🎤 **Mock Interviews & GD Sessions:**\n\n✅ Comprehensive interview preparation:\n\n• **Mock Interviews:** Conducted 3 times in final year\n  - Technical round simulation\n  - HR interview simulation\n  - Panel interviews with industry professionals\n\n• **Group Discussion (GD):** Weekly GD sessions in final year\n\n• **Aptitude Mock Tests:** Every Sunday morning (online, optional)\n\n• **Feedback:** Detailed feedback report after each mock\n\n📌 Recorded sessions available for self-review\n📧 **placement@git.edu** | 📞 **{{PHONE}}** ext. 250']
  },
  {
    intentName: 'resume_building',
    keywords: ['resume','cv','resume building','resume workshop','how to make resume','cv help','resume guide','linkedin profile'],
    trainingPhrases: ['does the college help with resume building','resume building workshop','how to make resume','cv writing help','linkedin profile building'],
    responses: ['📄 **Resume Building & LinkedIn Support:**\n\n✅ **Resume Workshops:**\n• Conducted at the start of each academic year\n• Templates provided for different roles\n• 1-on-1 resume review by placement cell\n\n✅ **LinkedIn Profile:**\n• Dedicated session on building professional LinkedIn\n• Profile optimisation tips\n• Alumni connection drive\n\n✅ **Portfolio Guidance:**\n• Coding portfolios (GitHub) for developers\n• Design portfolios for creative students\n• Project portfolio guidance for all\n\n📌 All services FREE for enrolled students\n📧 **placement@git.edu**']
  },
  {
    intentName: 'placement_percentage',
    keywords: ['percentage placed','how many students placed','placement percentage','placed students','placement rate','how many get job'],
    trainingPhrases: ['what percentage of students get placed','placement percentage','how many students got job','placement rate'],
    responses: ['📊 **Placement Statistics 2024:**\n\n• **Eligible Students:** 1,050\n• **Placed Students:** 966 (out of 1,050 eligible)\n• **Placement Rate:** **92%**\n\n**By Course:**\n| Course | Placement % |\n|---|---|\n| B.Tech CSE | 97% |\n| B.Tech ECE | 89% |\n| MCA | 94% |\n| MBA | 91% |\n| BCA | 82% |\n\n🔗 Year-wise stats: **{{WEBSITE}}/placements/statistics**']
  },
  {
    intentName: 'internship_program',
    keywords: ['internship','intern','industrial training','summer training','industry project','paid internship','internship program','compulsory internship','internship mandatory'],
    trainingPhrases: ['is there any internship program','internship opportunities','compulsory internship','how to get internship','are internships mandatory','internship duration'],
    responses: ['💼 **Internship Program:**\n\n✅ **Mandatory for all students** (part of curriculum)\n\n• **Duration:** 6–8 weeks (post 4th/6th semester)\n• **Stipend:** ₹5,000–₹25,000/month (company-dependent)\n• **Top Companies:** TCS, Infosys, Wipro, Accenture, Startups\n• **Abroad Internships:** Available for top performers\n• **Internship Certificate:** Issued by company + college recognition\n• **Academic Credit:** Carries 3–4 credits\n\n✅ T&P Cell assists with applications & interview prep\n🔗 **{{WEBSITE}}/internships**']
  },
  {
    intentName: 'internship_abroad',
    keywords: ['internship abroad','international internship','foreign internship','overseas internship','internship other country','global internship'],
    trainingPhrases: ['are internship opportunities available abroad','international internship','overseas internship','global internship program','foreign company internship'],
    responses: ['🌍 **International Internship Opportunities:**\n\n✅ Available for meritorious students:\n\n• **IAESTE Programme:** International student exchange for science/engineering\n• **Industry Partners:** Internships in Singapore, UAE, UK, USA (through MOU partners)\n• **Eligibility:** CGPA ≥ 8.0 + good communication skills\n• **Stipend:** Varies (many are paid, ₹50,000–₹1.5L/month)\n\n**Process:**\n1️⃣ Express interest to T&P Cell\n2️⃣ Interview with international partner\n3️⃣ Visa assistance provided by college\n\n📧 **placement@git.edu** | 📞 **{{PHONE}}** ext. 250']
  },
  {
    intentName: 'industrial_visits',
    keywords: ['industrial visit','industry visit','factory visit','company visit','plant visit','field trip','industrial tour'],
    trainingPhrases: ['are industrial visits organized','industry visit program','factory visits for students','company tour for students'],
    responses: ['🏭 **Industrial Visits:**\n\n✅ Yes! Industrial visits are **a core part of the curriculum**:\n\n• **Frequency:** 1–2 industrial visits per semester per course\n• **Companies Visited:** TCS, Bosch, ISRO, manufacturing plants, IT parks\n• **Purpose:** Real-world exposure, industry practices understanding\n• **Cost:** College bears transport + entry fees (food extra)\n\n📌 Attendance is compulsory for scheduled industrial visits\n📌 Report submitted after each visit (5 marks)\n\n🔗 Past visits gallery: **{{WEBSITE}}/industrial-visits**']
  },
  {
    intentName: 'job_fair',
    keywords: ['job fair','career fair','placement fair','recruitment fair','job mela','companies all at once','job exhibition'],
    trainingPhrases: ['are job fairs organized','career fair college','placement fair','job mela','does college organize job fair'],
    responses: ['🎪 **Job Fairs at {{COLLEGE_NAME}}:**\n\n✅ **Annual Mega Placement Fair:**\n• Held every **January–February**\n• 80+ companies on a single day\n• Open for B.Tech, MCA, MBA, BCA final year students\n\n✅ **Domain-Specific Drives:**\n• IT drive: December | Core engineering: November | MBA: February\n\n📌 Register via student portal for placement drives\n📌 Students can apply to **multiple companies** simultaneously\n\n🔗 Upcoming drives: **{{WEBSITE}}/placements/drives**\n📧 **placement@git.edu**']
  },
  {
    intentName: 'off_campus_placement',
    keywords: ['off campus','offcampus','outside placement','apply outside','non campus job','placement outside college','self placement'],
    trainingPhrases: ['does the placement cell support off-campus applications','off campus job support','placement outside campus','apply for companies outside college'],
    responses: ['🌐 **Off-Campus Placement Support:**\n\n✅ Yes! The T&P Cell supports off-campus too:\n\n• **Job Portal Access:** Students access curated off-campus job postings on the placement portal\n• **Online Drives:** Virtual campus drives with companies who don\'t visit physically\n• **LinkedIn Networking:** Alumni connections shared for referrals\n• **Application Guidance:** Faculty and T&P staff help with applications\n• **Reference Letters:** Faculty write recommendation letters for external applications\n\n📧 **placement@git.edu** | 📞 **{{PHONE}}** ext. 250']
  },
  {
    intentName: 'entrepreneurship',
    keywords: ['entrepreneurship','startup','startup support','incubation','incubation center','business idea','own company','self employment','innovation hub','startup ideas'],
    trainingPhrases: ['does college offer entrepreneurship programs','startup support','incubation center','startup ideas supported','can students start their own startup','innovation hub'],
    responses: ['🚀 **Entrepreneurship & Startup Support:**\n\n✅ **GIT Innovation Hub (Incubation Centre):**\n• 20+ active student startups currently incubated\n• Free workspace + mentoring for 1 year\n• Access to seed funding (up to ₹5 lakhs)\n• Legal support: company registration, IP filing\n• Industry mentor network\n\n✅ **Startup Programs:**\n• Entrepreneurship Development Cell (EDC)\n• Startup Pitch competitions (₹2 lakh prize pool)\n• Guest lectures by successful entrepreneurs\n\n🔗 **{{WEBSITE}}/innovation-hub**\n📧 **startup@git.edu**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 12 · RESEARCH & CONFERENCES
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'research_opportunities',
    keywords: ['research','project','innovation','lab','patent','publication','phd','funded project','incubation','research opportunities','research activities'],
    trainingPhrases: ['does college support research activities','research opportunities','can students publish research papers','research grants','research projects'],
    responses: ['🔬 **Research at {{COLLEGE_NAME}}:**\n\n• **Research Centres:** AI Lab, IoT Centre, Robotics Lab, Green Energy Lab\n• **Funded Projects:** 50+ government & industry projects (SERB, DST, DBT)\n• **Publications:** 500+ per year in Scopus/SCI journals\n• **Patents:** 35+ filed & granted\n• **Research Grants:** Faculty & students can apply for internal seed grants\n• **Student Research:** Final year project with research publication option\n\n🔗 **{{WEBSITE}}/research** | 📧 **research@git.edu**']
  },
  {
    intentName: 'publish_research',
    keywords: ['publish paper','research paper','paper submission','conference paper','journal paper','research publication','can students publish'],
    trainingPhrases: ['can students publish research papers','research paper publication','how to publish paper','conference paper submission','journal article publication'],
    responses: ['📄 **Student Research Publications:**\n\n✅ Yes! Students are **actively encouraged** to publish:\n\n• **Final year projects** can be converted to research papers\n• College covers **publication fees** for indexed journals (Scopus/SCI) — up to ₹15,000\n• Faculty guide students through the submission process\n• **Travel grants** (up to ₹10,000) for presenting at conferences\n\n**Top Venues for Students:**\nIEEE Conferences | Springer LNCS | MDPI Open Access | National Journals\n\n📧 **research@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'conferences',
    keywords: ['conference','national conference','international conference','seminar','symposium','research conference','host conference','attend conference'],
    trainingPhrases: ['does the college organize research conferences','national conferences hosted','international conferences organized','are students encouraged to attend conferences'],
    responses: ['🎓 **Research Conferences at {{COLLEGE_NAME}}:**\n\n✅ **Hosted by College:**\n• **National Conference on Emerging Technologies (NCET)** — Annual\n• **International Conference on AI & Data Science (ICADS)** — Biennial\n• **National Student Research Symposium** — Annually (students present papers)\n\n✅ **Students Supported to Attend:**\n• Travel grant (up to ₹10,000) for presenting at external conferences\n• Registration fee waived for IEEExplore indexed conferences\n\n🔗 Upcoming conferences: **{{WEBSITE}}/research/conferences**']
  },
  {
    intentName: 'patents',
    keywords: ['patent','patents','ip','intellectual property','innovation patent','file patent','patent support','patent grant'],
    trainingPhrases: ['are patents supported by the college','how to file patent','patent filing support','student patents','intellectual property'],
    responses: ['💡 **Patent & IP Support:**\n\n✅ **35+ patents filed** (faculty and students combined)\n\n**Process:**\n1️⃣ Submit invention disclosure to Research Cell\n2️⃣ Patent committee reviews within 2 weeks\n3️⃣ College files patent application (cost borne by college)\n4️⃣ Student/faculty share IP rights\n\n**Benefits:**\n• College funds the full patent application cost\n• Inventor gets 50% of any commercialisation revenue\n• Patent counts as research output for scholarships/awards\n\n📧 **research@git.edu**']
  },
  {
    intentName: 'hackathons',
    keywords: ['hackathon','coding competition','code contest','hack','build challenge','24 hour hackathon','codathon','programming contest'],
    trainingPhrases: ['are hackathons organized by the college','coding competitions','hackathon events','does college conduct hackathons','coding challenges'],
    responses: ['💻 **Hackathons & Coding Competitions:**\n\n✅ **College-Organized:**\n• **24-Hour Hackathon** (annual) — ₹1 lakh prize pool\n• **Monthly Coding Contests** (HackerRank platform)\n• **Smart India Hackathon** — college hosts internal rounds\n• **AI Challenge** — annual ML/AI competition\n\n✅ **External Competitions:**\n• Students actively participate in: Google Kick Start, Facebook Hacker Cup, ICPC, Codeforces\n\n✅ **Prizes:** Cash + Internship offers + certificates\n\n🔗 Register: **{{WEBSITE}}/events**']
  },
  {
    intentName: 'innovation_competitions',
    keywords: ['innovation competition','science fair','project exhibition','technology exhibition','project competition','best project award','innovation challenge','robotics competition'],
    trainingPhrases: ['are innovation competitions organized','science fairs conducted','project exhibitions','technology exhibitions','robotics competitions'],
    responses: ['🏆 **Innovation Competitions & Exhibitions:**\n\n✅ **Annual Events:**\n• **TechXpo:** Project & Innovation Exhibition (March) — Open to public\n• **Robotics Championship:** Build & compete (October)\n• **Science Fair:** All branches (September)\n• **AI Cup:** Data Science & ML competition (December)\n• **Entrepreneurship Pitch Day:** Startup ideas pitched to investors (February)\n\n🏅 **Awards:** Top 3 projects receive: ₹25,000 + ₹15,000 + ₹10,000\n\n🔗 **{{WEBSITE}}/events**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 13 · INTERNATIONAL PROGRAMS
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'exchange_programs',
    keywords: ['exchange program','student exchange','semester abroad','study exchange','international exchange','foreign university','partner university'],
    trainingPhrases: ['does the college offer international exchange programs','student exchange programs','can students study abroad through exchange','semester abroad','partner universities'],
    responses: ['🌍 **International Exchange Programs:**\n\n✅ **Partner Universities:**\n• UK: University of Sheffield, University of Hertfordshire\n• USA: University of Illinois (collaborative research)\n• Germany: TU Berlin (summer schools)\n• Singapore: NUS (short-term programs)\n• Australia: Deakin University\n\n**Programs Available:**\n• Semester Exchange (1 semester abroad)\n• Summer Schools (4–8 weeks)\n• Joint Research Projects\n• Virtual Exchange Courses\n\n📌 Apply with CGPA ≥ 7.5 + IELTS/TOEFL\n📧 **international@git.edu**']
  },
  {
    intentName: 'study_abroad',
    keywords: ['study abroad','foreign university','higher studies abroad','ms abroad','mba abroad','phd abroad','overseas education','study foreign country'],
    trainingPhrases: ['does the college provide guidance for studying abroad','study abroad support','higher studies abroad','how to apply to foreign university','ms abroad guidance'],
    responses: ['✈️ **Study Abroad Guidance:**\n\n✅ Dedicated **Study Abroad Cell:**\n\n• **Counseling:** Free 1-on-1 counselling for overseas education\n• **University Selection:** Guidance on shortlisting universities\n• **Application Help:** SOP, LOR, application essays\n• **Test Preparation:** GRE, IELTS, TOEFL coaching\n• **Visa Support:** Guidance on student visa applications\n\n📅 **Annual Study Abroad Fair** held every October\n\n🔗 **{{WEBSITE}}/study-abroad**\n📧 **international@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'gre_ielts_preparation',
    keywords: ['gre','ielts','toefl','gre coaching','ielts training','toefl preparation','english test','test prep','language test','gre prep','ielts class'],
    trainingPhrases: ['are gre preparation classes available','ielts training programs','toefl preparation','english test coaching','gre coaching available'],
    responses: ['📚 **GRE / IELTS / TOEFL Preparation:**\n\n✅ **On-Campus Training Programs:**\n\n| Test | Course Duration | Fee |\n|---|---|---|\n| GRE | 3 months | ₹8,000 |\n| IELTS | 2 months | ₹6,000 |\n| TOEFL | 2 months | ₹6,000 |\n| SAT | 3 months | ₹8,000 |\n\n• Expert trainers with 10+ years experience\n• Practice tests, study material included\n• Small batches (max 20 students)\n\n📅 Batches start: June & December\n📞 **{{PHONE}}** | 📧 **international@git.edu**']
  },
  {
    intentName: 'international_students',
    keywords: ['international student','foreign student','nri','abroad','overseas','foreign country','visa','nri admission'],
    trainingPhrases: ['are there international students enrolled','foreign students','nri admission','international student admission','students from abroad'],
    responses: ['🌍 **International & NRI Students:**\n\n✅ Yes! We welcome students from all countries (~60 international students currently enrolled)\n\n• **NRI Quota:** 5% seats reserved\n• **SAARC Countries:** Fee concession available\n• **Medium:** All programs taught in **English**\n• **Documents:** Equivalent marksheet + passport + visa + no-objection from home country university (if applicable)\n\n**Support Services:**\n• Dedicated International Student Coordinator\n• Visa extension guidance\n• Cultural orientation program\n\n📧 **international@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'foreign_language',
    keywords: ['foreign language','language course','german','french','japanese','spanish','mandarin','second language','language club'],
    trainingPhrases: ['are foreign language courses offered','language courses available','can i learn german in college','french classes','language clubs'],
    responses: ['🗣️ **Foreign Language Courses:**\n\n✅ Available as elective + standalone courses:\n\n| Language | Duration | Level | Fee |\n|---|---|---|---|\n| French | 1 semester | A1-B1 | ₹3,000 |\n| German | 1 semester | A1-B1 | ₹3,000 |\n| Japanese | 1 semester | N5-N4 | ₹3,500 |\n| Spanish | 1 semester | A1-A2 | ₹3,000 |\n| Mandarin (Chinese) | 1 semester | HSK-1 | ₹3,500 |\n\n📌 Language lab with audio-visual resources available\n📌 German/French certificates are highly valued for European MS admissions\n📞 **{{PHONE}}** | 📧 **international@git.edu**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 14 · EVENTS, CULTURE & CLUBS
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'events',
    keywords: ['events','event','fest','festival','annual day','upcoming','activities','celebration','programme','what events'],
    trainingPhrases: ['does the college organize events','upcoming events','college events','what events are held','college programme'],
    responses: ['🎉 **Events Calendar at {{COLLEGE_NAME}}:**\n\n🔧 **TechVision 2025** — National Tech Fest | Mar 15–17\n🎭 **Crescendo 2025** — Annual Cultural Fest | Apr 5–7\n⚽ **Inter-College Sports Meet** | Feb 20–25\n💻 **24H Hackathon** | Mar 1\n🎓 **Convocation Ceremony** | June 15\n🌸 **Fresher\'s Welcome** | August (1st week)\n🎊 **Farewell Party** | April (final year)\n🌍 **International Cultural Day** | November\n\n📅 Full calendar: **{{WEBSITE}}/events**\nRegister via student portal!']
  },
  {
    intentName: 'cultural_events',
    keywords: ['cultural','dance','music','drama','arts','performance','cultural event','cultural activities','singing','theatre','cultural festival','crescendo'],
    trainingPhrases: ['are cultural events conducted','cultural festivals','cultural activities','what cultural events are there','annual cultural fest','crescendo'],
    responses: ['🎭 **Cultural Events & Activities:**\n\n• **Annual Fest "Crescendo"** — 3-day mega cultural festival with 50+ events\n• **Dance:** Classical, Western, Fusion, Street Dance competitions\n• **Music:** Band, Choir, Solo Singing, Rap Battle\n• **Drama:** Annual play, Street theatre, Mono-act\n• **Fine Arts:** Painting, Photography, Rangoli, Sculpture\n• **Literary:** Debate, Elocution, Creative Writing, Poetry\n• **Fashion Show** (organised by Fashion Club)\n\n🏆 Students win inter-college competitions regularly!\n📅 **{{WEBSITE}}/events**']
  },
  {
    intentName: 'annual_day',
    keywords: ['annual day','annual function','annual event','college annual','annual celebration','annual ceremony'],
    trainingPhrases: ['does the college celebrate annual day','annual day event','annual function college','annual day program'],
    responses: ['🎉 **Annual Day at {{COLLEGE_NAME}}:**\n\n• Celebrated every **February** (3-day event)\n• Cultural performances by students: dance, music, drama\n• **Awards ceremony:** Academic, sports, cultural, social service awards\n• **Guest of honour:** Industry leaders, alumni achievers\n• Chief Minister\'s Trophy for Best Student of the Year\n\n📌 Annual day is open to parents — invites sent in advance\n🔗 Past event highlights: **{{WEBSITE}}/events/annual-day**']
  },
  {
    intentName: 'freshers_farewell',
    keywords: ['fresher','fresher party','fresher welcome','farewell','final year party','farewell event','senior junior','freshers welcome','farewell batch'],
    trainingPhrases: ['is there a freshers party organized','fresher welcome event','is there a farewell event for final year students','farewell party','senior farewell'],
    responses: ['🎊 **Fresher\'s & Farewell Events:**\n\n✅ **Fresher\'s Welcome Party:**\n• Organized by 2nd year students for 1st year\n• Held 2–3 weeks after college starts (August end)\n• Talent show, games, Mr. & Ms. Fresher competition\n• Completely student-organized!\n\n✅ **Farewell (Alvida):**\n• Organized by 3rd/4th year students for final year\n• Held in March/April\n• Memories slideshow, awards, speeches\n• Dinner/banquet at college grounds\n\n📌 Both events are fully student-planned & executed!']
  },
  {
    intentName: 'student_clubs',
    keywords: ['clubs','society','student club','club','nss','ncc','extracurricular','activities','join club','sports club','club list','which clubs'],
    trainingPhrases: ['are there student clubs','what clubs are there','how to join club','student societies','extracurricular clubs','nss ncc','clubs available'],
    responses: ['🎯 **Student Clubs & Societies:**\n\n**Technical:**\n• Coding Club | Robotics Club | AI/ML Society | IoT Lab | IEEE Student Chapter | ACM Chapter\n\n**Cultural:**\n• Drama Club | Music Society | Dance Troupe | Photography Club | Art Circle | Literary Society\n\n**Sports:**\n• Cricket, Football, Basketball, Chess, Badminton, Athletics teams\n\n**Social/Service:**\n• NSS (National Service Scheme) | NCC (National Cadet Corps)\n• Environment Club | Blood Donation Club | Community Outreach\n\n**Entrepreneurship:**\n• Startup Club | Finance Club | E-Cell\n\n📅 Join at Club Fair (first week of each semester)']
  },
  {
    intentName: 'technical_events',
    keywords: ['technical','tech','hackathon','coding','workshop','seminar','tech fest','project exhibition','techfest','technical events'],
    trainingPhrases: ['does college have technical events','technical activities','hackathon','coding competition','tech fest','technical workshops'],
    responses: ['💻 **Technical Events:**\n\n🔧 **TechVision (Annual Tech Fest):**\n• 24H Hackathon | Coding Contest | Robotics Wars | Project Expo\n• Paper Presentations | Technical Quiz | AI Challenge\n\n📅 **Year-Round:**\n• Monthly coding contests\n• Weekly expert webinars\n• IEEE/ACM events\n• Startup Pitch competitions\n• AI/ML, Cybersecurity, Cloud workshops\n\n🏆 **Prize pool:** ₹2,00,000+ at TechVision!\n🔗 **{{WEBSITE}}/events**']
  },
  {
    intentName: 'workshops',
    keywords: ['workshop','training','skill','hands-on','seminar','bootcamp','certification workshop','technical workshop','industry workshop'],
    trainingPhrases: ['does college conduct workshops','training workshops','skill development workshops','technical workshops','workshop program'],
    responses: ['🛠️ **Workshops & Training Programs:**\n\n**Technical Workshops (monthly):**\n• Python, ML, Web Dev, Cyber Security, AWS, Docker\n\n**Soft Skills (semester-wise):**\n• Communication, Leadership, Resume Writing, Presentation Skills\n\n**Career Preparation:**\n• Aptitude, GD/PI training (pre-placement season)\n\n**Research Workshops:**\n• Paper writing, patent filing, research methodology\n\n**Industry-led:**\n• Conducted by TCS, Wipro, IBM, startups\n\n💳 Most workshops are **FREE** for enrolled students!\n📅 **{{WEBSITE}}/events/workshops**']
  },
  {
    intentName: 'nss_ncc',
    keywords: ['nss','ncc','national service scheme','national cadet corps','nss camp','ncc camp','social service','volunteer','community service'],
    trainingPhrases: ['are nss programs conducted','is ncc available','national service scheme','national cadet corps','community service programs','volunteer programs'],
    responses: ['🎖️ **NSS & NCC Programs:**\n\n✅ **NSS (National Service Scheme):**\n• 200+ active NSS volunteers\n• Regular community service activities\n• Special camps: village development, health awareness\n• Blood donation drives, tree plantation, cleanliness drives\n• NSS participation adds 5 extra marks to degree\n\n✅ **NCC (National Cadet Corps):**\n• Army, Navy, Air Force wings available\n• Regular parades, adventure camps, Republic Day camps\n• NCC "C" certificate holders get preference in government jobs\n\n📧 **nss@git.edu** | **ncc@git.edu**']
  },
  {
    intentName: 'sports_competitions',
    keywords: ['sports competition','sports day','inter college sports','tournament','sports tournament','sports event','athletic meet','sports fest'],
    trainingPhrases: ['does the college organize sports competitions','are inter-college competitions held','sports day event','sports tournaments','annual sports meet'],
    responses: ['⚽ **Sports Competitions:**\n\n✅ **Annual Sports Day:**\n• Held every January (2-day mega event)\n• Track & Field, Team sports, individual events\n• Awards for best sportsman/sportswoman\n\n✅ **Inter-College Tournaments:**\n• Cricket, Football, Basketball, Volleyball, Tennis, Badminton\n• Chess, Carrom, Table Tennis\n\n✅ **University & State Level:**\n• College team represents in university-level competitions\n• State sports champions in Cricket, Chess, Athletics\n\n🏆 Our students have won **National-level** competitions!\n🔗 **{{WEBSITE}}/sports**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 15 · STUDENT SERVICES & DIGITAL CAMPUS
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'student_id_card',
    keywords: ['id card','identity card','student id','college id','id card process','how to get id','student card'],
    trainingPhrases: ['does the college provide id cards to students','how to get id card','student identity card','college id card process'],
    responses: ['🪪 **Student ID Card:**\n\n✅ ID cards are provided to all enrolled students:\n\n• **Issued:** Within first week of joining (during orientation)\n• **Contains:** Photo, name, roll number, department, validity period, emergency contact\n• **Features:** Smart card with college access & library barcode\n• **Must be worn** at all times inside campus\n\n**Lost ID Card:**\n• File a complaint at Security Office\n• Apply for duplicate: ₹200 fee\n• New card ready in 2–3 working days\n\n📞 Student Affairs Office: **{{PHONE}}** ext. 120']
  },
  {
    intentName: 'lms_portal',
    keywords: ['lms','learning management system','student portal','online portal','study portal','moodle','portal access','portal login','course materials online'],
    trainingPhrases: ['is there an lms system available','student portal access','learning management system','how to access student portal','lms login','course materials online'],
    responses: ['💻 **Learning Management System (LMS):**\n\n✅ Our LMS is available at **{{WEBSITE}}/student-portal**\n\n**Features:**\n• 📚 Course materials & lecture notes (downloadable)\n• 🎥 Recorded lectures (available 24×7)\n• 📝 Online assignments submission\n• 📊 Internal marks & attendance tracking\n• 🕒 Timetable & exam schedule\n• 💬 Discussion forums per course\n• 📋 Notifications & announcements\n• 📱 Mobile app available (Play Store)\n\n**Login:** Student Roll Number + Password\n📌 Password set during orientation']
  },
  {
    intentName: 'study_materials',
    keywords: ['study material','lecture notes','previous year papers','study resources','notes download','course material','revision material','sample papers'],
    trainingPhrases: ['can students access study materials online','previous year papers available','lecture notes download','study materials online','sample question papers provided'],
    responses: ['📖 **Study Materials Available:**\n\n✅ All accessible via **{{WEBSITE}}/student-portal**:\n\n• **Lecture Notes:** Uploaded by faculty after each class\n• **Previous Year Papers:** Last 5 years for all subjects\n• **Sample Question Papers:** Released before every exam\n• **Reference Books:** E-books via digital library (INFLIBNET)\n• **Video Lectures:** NPTEL + faculty-recorded videos\n• **Practice Problems:** Subject-wise problem banks\n• **Study Guides:** For competitive exams (GATE, GRE, etc.)\n\n📌 All materials are **FREE** for enrolled students!']
  },
  {
    intentName: 'recorded_lectures',
    keywords: ['recorded lectures','video lectures','lecture videos','lecture recording','watch class again','replay lecture','missed class video','online lectures'],
    trainingPhrases: ['are recorded lectures available','can i watch lectures again','video lectures available','missed class recording','recorded sessions'],
    responses: ['🎥 **Recorded Lectures:**\n\n✅ Yes! All lectures are recorded and available:\n\n• **Live Recording:** Smart classrooms automatically record lectures\n• **Access:** LMS → Your Courses → Recorded Sessions\n• **Retention:** Available for the entire semester\n• **Format:** MP4 video + PDF slides\n\n✅ **NPTEL Integration:**\n• 1,000+ hours of IIT lecture videos available on LMS\n• Free access to all enrolled students\n\n📌 Useful for: Missed classes, revision before exams, difficult topics\n🔗 **{{WEBSITE}}/student-portal**']
  },
  {
    intentName: 'attendance_online',
    keywords: ['check attendance online','attendance portal','attendance app','attendance online','see attendance','biometric attendance','attendance tracking'],
    trainingPhrases: ['can i check my attendance online','attendance portal','how to see my attendance','biometric attendance system','attendance tracker'],
    responses: ['📊 **Attendance Tracking:**\n\n✅ **Real-time attendance on student portal:**\n\n• **How:** LMS → Dashboard → Attendance Report\n• **Update:** Attendance marked by faculty within 30 min of class\n• **Biometric:** Smart classrooms use **biometric attendance** (fingerprint + RFID card)\n• **Alert:** SMS/email alert sent to students AND parents when attendance drops below 80%\n\n📱 **Mobile App:** Check attendance on the GIT mobile app anytime\n📌 Attendance is also shared with parents via **parent portal**\n🔗 **{{WEBSITE}}/student-portal**']
  },
  {
    intentName: 'student_email_software',
    keywords: ['student email','college email account','google workspace','microsoft office','free software','student account','college email id'],
    trainingPhrases: ['are students given email accounts','free software for students','microsoft office available','college email id','google workspace students'],
    responses: ['📧 **Student Email & Software Benefits:**\n\n✅ **Official Email:**\n• Every student gets **@git.edu** email on joining\n• Google Workspace (Gmail, Drive, Docs, Meet) — FREE\n\n✅ **Free Software:**\n• **Microsoft Office 365** — FREE (via Microsoft DreamSpark)\n• **MATLAB, AutoCAD** — Campus licenses\n• **JetBrains IDE Suite** — FREE for students\n• **AWS Educate Credits** — $100/year per student\n• **GitHub Pro** — FREE for students (GitHub Student Pack)\n\n📌 All software access via **{{WEBSITE}}/student-portal**']
  },
  {
    intentName: 'online_learning',
    keywords: ['coursera','udemy','online course','mooc','certification online','online learning','nptel','swayam','access coursera','online platform'],
    trainingPhrases: ['can students access coursera or udemy courses','online certification courses','online learning platforms','nptel access','mooc courses','online courses available'],
    responses: ['🌐 **Online Learning Platforms:**\n\n✅ **Free Access Provided:**\n• **NPTEL/SWAYAM:** IIT lectures — all courses FREE\n• **Coursera for Campus:** 4,000+ courses FREE (college subscription)\n• **LinkedIn Learning:** 16,000+ professional courses FREE\n• **edX:** Audit mode free | Certificates discounted\n• **Udemy:** 30+ curated courses FREE via college portal\n\n✅ **Certification:**\n• NPTEL certificates are recognized and add to CGPA\n• Coursera + LinkedIn certifications accepted as skill credits\n\n🔗 **{{WEBSITE}}/student-portal** → Online Learning']
  },
  {
    intentName: 'counseling_services',
    keywords: ['counseling','counselling','mental health','psychological support','therapy','stress','anxiety','depression','personal counseling','psychological counseling'],
    trainingPhrases: ['are counseling services available for students','mental health support','psychological counseling','stress management','is there career guidance available'],
    responses: ['🧠 **Student Counseling Services:**\n\n✅ **Academic Counseling:**\n• Faculty mentors for academic difficulties\n• Study skills workshops every semester\n\n✅ **Mental Health Support:**\n• Dedicated **licensed psychologist** on campus\n• Sessions are **100% confidential**\n• Walk-in hours: Mon–Fri, 2–5 PM | Prior appointment recommended\n• Online sessions also available\n\n✅ **Career Counseling:**\n• T&P Cell provides career guidance\n• Industry counselors visit quarterly\n\n📌 **No stigma** — mental health is normal healthcare!\n📧 **counseling@git.edu** | 📞 **{{PHONE}}** ext. 140']
  },
  {
    intentName: 'grievance_system',
    keywords: ['grievance','complaint','grievance cell','redressal','student complaint','complaint system','report problem','anonymous complaint','submit complaint'],
    trainingPhrases: ['is there a grievance redressal system','can students submit complaints online','grievance cell','complaint portal','anonymous complaints allowed','report problem'],
    responses: ['📣 **Grievance Redressal System:**\n\n✅ Multiple complaint channels:\n\n• **Online:** **{{WEBSITE}}/grievance** → Submit complaint (anonymous option available)\n• **Physical:** Grievance box in every department + Admin office\n• **Direct:** Dean of Student Affairs — Mon–Fri, 11 AM–1 PM\n\n✅ **Process:**\n1️⃣ Complaint received & acknowledged within 24 hours\n2️⃣ Assigned to appropriate committee\n3️⃣ Investigation within 7 working days\n4️⃣ Resolution communicated to student\n\n✅ **All complaints are handled confidentially**\n📧 **grievance@git.edu** | 📞 **{{PHONE}}** ext. 130']
  },
  {
    intentName: 'student_council',
    keywords: ['student council','student government','student representative','student body','student committee','student union','student election','student leaders'],
    trainingPhrases: ['is there a student council','can students run for student council elections','student representative body','student committee','student leadership'],
    responses: ['🏛️ **Student Council at {{COLLEGE_NAME}}:**\n\n✅ Yes! A fully functional Student Council:\n\n• **Elections:** Held every September (democratic process)\n• **Positions:** President, Vice-President, Secretary, Treasurer + Department Representatives\n• **Role:** Voice of students in college decision-making\n• **Meetings:** Monthly meeting with Principal + Dean\n• **Powers:** Budget for student events, can propose policy changes\n\n**How to Run:**\n1️⃣ File nomination form (with academic & attendance criteria)\n2️⃣ Campaign allowed on campus (within rules)\n3️⃣ Secret ballot election\n\n🔗 **{{WEBSITE}}/student-council**']
  },
  {
    intentName: 'career_guidance',
    keywords: ['career guidance','career counseling','career advice','career support','career planning','what career after','career after bca','career after mca'],
    trainingPhrases: ['is career guidance available for students','career counseling services','career advice','career planning','what career after bca mca btech'],
    responses: ['🎯 **Career Guidance Services:**\n\n✅ **Dedicated Career Centre:**\n• Career counselors available Mon–Sat\n• One-on-one career planning sessions\n• Career assessment tests\n\n✅ **Career Paths Guidance:**\n• After BCA: MCA, Software Developer, Web Developer, Digital Marketing\n• After MCA: Software Engineer, Data Scientist, ML Engineer, PM\n• After B.Tech: Industry, GATE/M.Tech, MBA, UPSC, Startup\n\n✅ **Job Fair, Alumni Talks, Industry Mentors** — all part of the career ecosystem\n\n📧 **career@git.edu** | 📞 **{{PHONE}}** ext. 250']
  },
  {
    intentName: 'alumni_programs',
    keywords: ['alumni','ex-students','graduates','alumni network','alumni events','alumni meet','alumni mentoring','alumni interaction','successful alumni','alumni contact'],
    trainingPhrases: ['are alumni events organized','alumni mentoring programs','can students interact with alumni','alumni networking','alumni success stories'],
    responses: ['🎓 **Alumni Programs:**\n\n• **Alumni Network:** 25,000+ alumni in 50+ countries\n• **Alumni Portal:** **{{WEBSITE}}/alumni** — connect, network, mentor\n\n✅ **Events:**\n• Annual Alumni Meet (December)\n• Department-wise Alumni Interaction (monthly)\n• Online webinars by working alumni (weekly)\n\n✅ **Mentoring:**\n• 200+ alumni volunteered as student mentors\n• Career guidance, referrals, mock interviews\n\n✅ **Alumni Achievements:**\n• Success stories published on website\n• Featured in college newsletter\n\n📧 **alumni@git.edu**']
  },
  {
    intentName: 'higher_studies',
    keywords: ['higher studies','further studies','mtech after btech','phd after mtech','mba after btech','what after graduation','post graduation','gate','civil services','upsc'],
    trainingPhrases: ['are students guided for higher studies after graduation','higher studies guidance','what after graduation','gate preparation programs','civil services preparation','upsc coaching'],
    responses: ['📚 **Higher Studies Guidance:**\n\n✅ **Gate Preparation:**\n• On-campus GATE coaching (morning batches)\n• Previous years\' papers, mock tests, study groups\n\n✅ **MBA Preparation:**\n• CAT/MAT coaching available\n• Mock GD/PI sessions\n\n✅ **UPSC/Civil Services:**\n• Awareness sessions and reading room\n• Civil Services study group (student-led)\n\n✅ **M.S. Abroad:**\n• GRE/IELTS coaching + application guidance\n\n📅 Batches start: **June each year**\n📧 **career@git.edu** | 📞 **{{PHONE}}**']
  },
  {
    intentName: 'certification_courses',
    keywords: ['certification','certificate course','professional certification','short course','skill certification','aws certification','google cert','paid certification'],
    trainingPhrases: ['does the college provide certification courses','professional certifications','short term certification','aws certification program','skill certification'],
    responses: ['📜 **Certification Programs:**\n\n✅ **Industry Certifications (facilitated by college):**\n\n| Certification | Provider | Duration |\n|---|---|---|\n| AWS Solutions Architect | Amazon | 3 months |\n| Google Data Analytics | Google | 2 months |\n| Meta Front-End Developer | Meta/Coursera | 3 months |\n| Cisco CCNA | Cisco NetAcad | 3 months |\n| Oracle Java SE | Oracle | 2 months |\n| Microsoft Azure AZ-900 | Microsoft | 2 months |\n\n📌 College covers 50% of certification exam fees for meritorious students\n🔗 **{{WEBSITE}}/certifications**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 16 · CAMPUS SAFETY & POLICIES
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'college_rules',
    keywords: ['rules','policy','policies','regulations','code of conduct','discipline','dos donts','guidelines','student rules'],
    trainingPhrases: ['what are the college rules','rules and regulations','code of conduct','college policies','discipline rules'],
    responses: ['📋 **Code of Conduct:**\n\n**Academic:**\n• Minimum 75% attendance mandatory\n• Assignments submitted on time\n• Academic dishonesty → strict disciplinary action\n\n**Behaviour:**\n• Ragging — **ZERO TOLERANCE** (immediate expulsion)\n• Respectful conduct with all staff & students\n• No smoking/alcohol/drugs anywhere on campus\n\n**Dress:**\n• Formal/semi-formal attire; ID card must be worn\n\n**Campus:**\n• Mobile phones silent in class\n• No unauthorized vehicles inside\n• Campus premises must be kept clean\n\n🔗 Full handbook: **{{WEBSITE}}/student-handbook**']
  },
  {
    intentName: 'dress_code',
    keywords: ['dress code','uniform','what to wear','formal','casual','dress','attire','clothing','clothing rules'],
    trainingPhrases: ['what is the dress code','is there a uniform','dress code policy','what to wear in college','clothing rules'],
    responses: ['👔 **Dress Code Policy:**\n\n✅ **No strict uniform** — formal/semi-formal attire required\n\n**Boys:** Collared shirts + formal trousers | Clean, well-fitted | Covered shoes\n\n**Girls:** Salwar kameez, saree, or formal western wear | Appropriate for academic environment\n\n❌ **Not Allowed:** Ripped jeans, shorts, sleeveless in labs, slippers in labs\n\n📌 **College ID card** must be worn at all times on campus\n📌 Lab visits require appropriate safety shoes (for mechanical/civil labs)']
  },
  {
    intentName: 'mobile_phones',
    keywords: ['mobile','phone','cell phone','mobile allowed','phone in class','mobile policy','devices','phone rules'],
    trainingPhrases: ['are mobile phones allowed in classrooms','mobile phone policy','can i use phone in college','phone rules'],
    responses: ['📱 **Mobile Phone Policy:**\n\n✅ Allowed on campus generally\n\n• **During lectures:** **SILENT mode** mandatory\n• **In labs:** Phones away from work area (safety + focus)\n• **Library:** Silent only — calls outside\n• **Exam hall:** **STRICTLY PROHIBITED** (zero tolerance)\n\n❌ **Photography in class/labs** without permission is not allowed\n\n**Violation:** Warning → Phone confiscated for 1 week → Disciplinary hearing']
  },
  {
    intentName: 'campus_safety',
    keywords: ['safe','safety','security','cctv','campus safe','is it safe','women safety','girls safety','night security','campus security'],
    trainingPhrases: ['is the campus safe','campus safety','security on campus','women safety','cctv on campus','night security','is it safe for girls'],
    responses: ['🛡️ **Campus Safety at {{COLLEGE_NAME}}:**\n\n✅ **Fully secured campus:**\n\n• **CCTV:** 300+ cameras covering all areas (reviewed daily)\n• **Security Staff:** 50+ trained security personnel (24×7)\n• **Gate Access:** All visitors must register with photo ID\n• **Emergency:** Panic buttons on every floor + emergency call points\n• **Ambulance:** On campus 24×7\n\n✅ **Women\'s Safety:**\n• Women\'s Safety Committee\n• Internal Complaints Committee (ICC) under POSH Act\n• Female security guards + CCTV in all areas\n• Women\'s Safety helpline: **{{PHONE}}** ext. 112']
  },
  {
    intentName: 'anti_ragging',
    keywords: ['ragging','anti ragging','harassment','bully','bullying','complaint ragging','ragging policy','zero tolerance','safe campus'],
    trainingPhrases: ['anti ragging','ragging complaint','is ragging an issue','ragging policy','safe campus from ragging','report ragging'],
    responses: ['🛡️ **Anti-Ragging Policy — ABSOLUTE ZERO TOLERANCE**\n\n✅ Strict measures in place:\n\n• **24×7 Helpline:** **1800-180-5522** (toll-free national line)\n• **College Helpline:** **{{PHONE}}** ext. 999\n• **Online Complaint:** **{{WEBSITE}}/anti-ragging**\n• **Anonymous Complaint:** Drop box on every hostel floor + in every department\n• **Anti-Ragging Squad:** Regular patrols by trained committee members\n\n**Punishment for ragging:**\n🚫 Immediate suspension + Police FIR\n🚫 Expulsion from institution\n🚫 Blacklisted — no re-admission anywhere\n\n📌 **YOU ARE SAFE HERE.** Report any incident immediately.']
  },
  {
    intentName: 'green_campus',
    keywords: ['green campus','eco friendly','environment','sustainability','tree plantation','recycle','solar','green initiative','eco','environment friendly'],
    trainingPhrases: ['is campus eco-friendly','green campus initiatives','tree plantation drives organized','social service activities','sustainability campus','recycling campus'],
    responses: ['🌱 **Green Campus Initiatives:**\n\n✅ **{{COLLEGE_NAME}} is committed to sustainability:**\n\n• **Solar Power:** 30% of campus energy from solar panels\n• **Tree Plantation:** 500+ trees planted per year (NSS drives)\n• **Zero Plastic:** Single-use plastics banned across campus\n• **Waste Segregation:** Colour-coded bins for dry/wet/e-waste\n• **Rainwater Harvesting:** System installed across campus\n• **EV Charging:** 4 charging stations\n• **Green Building:** New blocks are GRIHA-rated (green construction)\n\n🏆 Winner: **National Green Campus Award 2023**\n🔗 **{{WEBSITE}}/sustainability**']
  },
  {
    intentName: 'disciplinary_committee',
    keywords: ['disciplinary','discipline committee','disciplinary action','rule violation','suspension','academic misconduct','what happens if rules broken'],
    trainingPhrases: ['are disciplinary committees available','disciplinary rules','what happens if i break rules','academic misconduct','disciplinary action'],
    responses: ['⚖️ **Disciplinary Committee:**\n\n✅ A **Student Disciplinary Committee (SDC)** handles all violations:\n\n**Minor violations (first offence):** Written warning\n**Repeated minor:** Fine + parent notification\n**Major violations (cheating, ragging, violence):** Suspension + FIR\n\n**Process:**\n1️⃣ Incident reported → SDC investigates (7 days)\n2️⃣ Student given chance to present their side\n3️⃣ Decision communicated in writing\n4️⃣ Appeal to Principal within 7 days if contested\n\n📌 Students are presumed innocent until proven guilty\n📧 **deanstudents@git.edu**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 17 · CONTACT & COMMUNICATION
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'contact_phone',
    keywords: ['phone','telephone','contact number','call','mobile','phone number','helpline','number','contact'],
    trainingPhrases: ['what is the college phone number','contact number','helpline number','phone of college'],
    responses: ['📞 **Contact Numbers:**\n\n• **Main Office:** {{PHONE}}\n• **Admission Office:** {{PHONE}} (ext. 101)\n• **Exam Cell:** {{PHONE}} (ext. 102)\n• **Placement Cell:** {{PHONE}} (ext. 250)\n• **Hostel (Boys):** {{PHONE}} (ext. 301)\n• **Hostel (Girls):** {{PHONE}} (ext. 302)\n• **Medical Emergency:** {{PHONE}} (ext. 911)\n• **Security:** {{PHONE}} (ext. 999)\n• **Transport:** {{PHONE}} (ext. 180)\n\n⏰ Office: **Mon–Sat, 9:00 AM – 5:00 PM**']
  },
  {
    intentName: 'contact_email',
    keywords: ['email','mail','email address','email id','write to','contact email','official email'],
    trainingPhrases: ['what is the email address','college email','official email','write to college','email id of college'],
    responses: ['📧 **Email Directory:**\n\n• **General:** {{EMAIL}}\n• **Admissions:** admissions@git.edu\n• **Exam Cell:** examcell@git.edu\n• **Placements:** placement@git.edu\n• **Accounts:** accounts@git.edu\n• **Hostel:** hostel@git.edu\n• **Library:** library@git.edu\n• **Transport:** transport@git.edu\n• **Research:** research@git.edu\n• **International:** international@git.edu\n• **IT Support:** itsupport@git.edu\n\n🌐 **{{WEBSITE}}**']
  },
  {
    intentName: 'contact_website',
    keywords: ['website','web','portal','online','url','web address','link','official site','college website'],
    trainingPhrases: ['what is the college website','official website','website link','web portal','college url'],
    responses: ['🌐 **Official Website & Portals:**\n\n• **Main Website:** {{WEBSITE}}\n• **Student Portal:** {{WEBSITE}}/student-portal\n• **Admission Portal:** {{WEBSITE}}/apply\n• **Results Portal:** {{WEBSITE}}/results\n• **Library Portal:** {{WEBSITE}}/library\n• **Fee Payment:** {{WEBSITE}}/pay\n• **Transport:** {{WEBSITE}}/transport\n• **Hostel:** {{WEBSITE}}/hostel\n• **Placements:** {{WEBSITE}}/placements\n\n📱 **GIT Mobile App:** Available on Google Play Store']
  },
  {
    intentName: 'office_timings',
    keywords: ['office hours','office timing','working hours','when is office open','college timings','open time','business hours','office schedule'],
    trainingPhrases: ['what are the office timings','college office hours','when is office open','working hours','office schedule'],
    responses: ['⏰ **Office Timings:**\n\n| Department | Days | Hours |\n|---|---|---|\n| Main Office | Mon–Fri | 9:00 AM – 5:00 PM |\n| Admission Office | Mon–Sat | 9:00 AM – 4:00 PM |\n| Accounts | Mon–Sat | 9:00 AM – 3:00 PM |\n| Exam Cell | Mon–Fri | 9:30 AM – 4:30 PM |\n| Library | Mon–Sat | 8:00 AM – 9:00 PM |\n| Library | Sunday | 10:00 AM – 5:00 PM |\n| Medical Centre | All days | 24×7 |\n| Security | All days | 24×7 |\n\n📞 **{{PHONE}}**']
  },
  {
    intentName: 'parent_visit',
    keywords: ['parent visit','parents can visit','family visit','meet parents','visitor','relatives','outsiders','parent college','parents campus'],
    trainingPhrases: ['can parents visit campus','parent visit policy','can family visit','visitor policy','relatives visit'],
    responses: ['👪 **Parent / Visitor Policy:**\n\n✅ Parents and relatives are welcome!\n\n**Campus Visits:**\n• Mon–Sat, **10 AM – 4 PM**\n• Register at Main Gate with valid photo ID\n• Gate pass issued\n\n**Hostel Visits:**\n• Parents: Daily 4–7 PM | Other relatives: Weekends 10 AM–5 PM\n\n**Parent-Teacher Meetings (PTM):**\n• Conducted **twice per semester**\n• SMS/email notification sent in advance\n\n**Parent Portal:**\n• Parents can track attendance & marks online via Parent Portal\n• Login credentials provided at admission\n📞 **{{PHONE}}**']
  },

  // ══════════════════════════════════════════════════════════════
  //  CAT 18 · OUT OF SCOPE
  // ══════════════════════════════════════════════════════════════
  {
    intentName: 'out_of_scope_weather',
    keywords: ['weather','rain','temperature','forecast','climate','sunny','cloudy'],
    trainingPhrases: ['what is the weather today','weather forecast','will it rain today','temperature today'],
    responses: ['☁️ I\'m specialised in college information and can\'t check live weather! Try **Google Weather**.\n\nMeanwhile, is there anything about **{{COLLEGE_NAME}}** I can help you with? 😊']
  },
  {
    intentName: 'out_of_scope_joke',
    keywords: ['joke','funny','laugh','humor','tell me a joke','make me laugh'],
    trainingPhrases: ['tell me a joke','say something funny','make me laugh'],
    responses: ['😄 Why did the student eat his homework? Because the teacher told him it was a **piece of cake!** 🎂\n\nAsk me anything about **{{COLLEGE_NAME}}** instead! 😊']
  },
  {
    intentName: 'out_of_scope_general',
    keywords: ['prime minister','president','cricket score','movie','song','capital','country','politics','calculate','weather','news','joke','2+2'],
    trainingPhrases: ['who is the prime minister of india','what is 2 plus 2','cricket score','bollywood movie','capital of india','tell me news','what is the weather'],
    responses: ['🤔 That\'s outside my area of expertise! I\'m specialised in **{{COLLEGE_NAME}}** information.\n\nTry asking about:\n• 📋 **Admissions** | 📚 **Courses** | 💰 **Fees**\n• 🏠 **Hostel** | 🚌 **Transport** | 💼 **Placements**\n• 🎉 **Events** | 📞 **Contact** | 🛡️ **Safety**\n\nFor general questions, try Google! 😊']
  },

];


// ══════════════════════════════════════════════════════════════
//  NLP ENGINE  — v5 Ultimate Edition
// ══════════════════════════════════════════════════════════════

function normalise(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  return tokens.map(t => stemmer.stem(t)).join(' ');
}

let intentCache  = [];
let cacheBuiltAt = null;
const CACHE_TTL  = 5 * 60 * 1000;

async function refreshCache() {
  try {
    const dbIntents = await Intent.findActive();
    if (dbIntents && dbIntents.length > 0) {
      const dbNames = new Set(dbIntents.map(i => i.intentName));
      const filtered = BUILT_IN_INTENTS.filter(i => !dbNames.has(i.intentName));
      intentCache = [...dbIntents, ...filtered];
      console.log(`NLP: ${dbIntents.length} DB + ${filtered.length} built-in = ${intentCache.length} intents`);
    } else {
      intentCache = BUILT_IN_INTENTS;
      console.log(`NLP: Using ${intentCache.length} built-in intents`);
    }
  } catch (err) {
    intentCache = BUILT_IN_INTENTS;
    console.warn(`NLP: DB error, falling back to built-in. ${err.message}`);
  }
  cacheBuiltAt = Date.now();
}

async function getIntents() {
  if (!cacheBuiltAt || Date.now() - cacheBuiltAt > CACHE_TTL) await refreshCache();
  return intentCache;
}

async function invalidateCache() { cacheBuiltAt = null; }

// ── Keyword score ─────────────────────────────────────────────
function scoreKeyword(queryLower, intent) {
  let best = 0;
  const keywords = (intent.keywords || []).map(k => k.toLowerCase());
  const phrases  = (intent.trainingPhrases || []).map(p => p.toLowerCase());
  const display  = (intent.displayName || intent.intentName || '').replace(/_/g,' ').toLowerCase();

  if (phrases.includes(queryLower) || keywords.includes(queryLower)) return 1.0;

  for (const kw of keywords) {
    if (kw === queryLower)                                    best = Math.max(best, 1.00);
    else if (kw.includes(queryLower))                        best = Math.max(best, 0.92);
    else if (queryLower.includes(kw) && kw.length >= 4)      best = Math.max(best, 0.88);
  }
  for (const ph of phrases) {
    if (ph === queryLower)                                    best = Math.max(best, 1.00);
    else if (ph.includes(queryLower))                        best = Math.max(best, 0.82);
    else if (queryLower.includes(ph) && ph.split(' ').length >= 2) best = Math.max(best, 0.78);
  }
  if (display.includes(queryLower) && queryLower.length >= 3) best = Math.max(best, 0.75);

  const qTokens = queryLower.split(/\s+/).filter(t => t.length >= 3);
  for (const tok of qTokens) {
    for (const kw of keywords) {
      if (kw === tok)                best = Math.max(best, 0.70);
      else if (kw.includes(tok))    best = Math.max(best, 0.65);
      else if (tok.includes(kw) && kw.length >= 4) best = Math.max(best, 0.62);
    }
    for (const ph of phrases) {
      if (ph.includes(tok))         best = Math.max(best, 0.58);
    }
    if (display.includes(tok))      best = Math.max(best, 0.60);
  }
  return best;
}

// ── Jaccard score ─────────────────────────────────────────────
function scoreJaccard(normQuery, intent) {
  const allText = [
    ...(intent.trainingPhrases || []),
    ...(intent.keywords || []),
    (intent.displayName || ''),
    (intent.intentName || '').replace(/_/g,' '),
  ].map(normalise).join(' ');

  const qSet = new Set(normQuery.split(' ').filter(Boolean));
  const iSet = new Set(allText.split(' ').filter(Boolean));
  if (!qSet.size || !iSet.size) return 0;
  const intersection = [...qSet].filter(t => iSet.has(t)).length;
  const union        = new Set([...qSet, ...iSet]).size;
  return intersection / union;
}

// ── Main classifier ───────────────────────────────────────────
async function classifyIntent(userMessage) {
  const THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD) || 0.20;
  const intents   = await getIntents();
  if (!intents.length) return buildFallback(userMessage, []);

  const queryLower = userMessage.toLowerCase().trim();
  const normQuery  = normalise(userMessage);
  const wordCount  = queryLower.split(/\s+/).filter(Boolean).length;

  const scores = intents.map(intent => {
    const kw      = scoreKeyword(queryLower, intent);
    const jaccard = scoreJaccard(normQuery, intent);

    let w1, w2;
    if      (wordCount <= 2) { w1 = 0.84; w2 = 0.16; }
    else if (wordCount <= 5) { w1 = 0.58; w2 = 0.42; }
    else                     { w1 = 0.36; w2 = 0.64; }

    return {
      intent:      intent.intentName,
      displayName: intent.displayName || intent.intentName,
      score:       w1 * kw + w2 * jaccard,
      responses:   intent.responses || [],
      _id:         intent._id,
    };
  });

  scores.sort((a, b) => b.score - a.score);
  const best      = scores[0];
  const allScores = scores.slice(0, 10).map(({ intent, score }) => ({ intent, score: +score.toFixed(4) }));
  const entities  = extractEntities(userMessage);

  if (best.score >= THRESHOLD) {
    const resp = best.responses[Math.floor(Math.random() * best.responses.length)];
    if (best._id) Intent.incrementHit(best._id).catch(() => {});
    return {
      intent:      best.intent,
      displayName: best.displayName,
      confidence:  +best.score.toFixed(4),
      response:    personalise(resp),
      entities,
      isFallback:  false,
      allScores,
    };
  }
  return buildFallback(userMessage, allScores, entities);
}

// ── Helpers ───────────────────────────────────────────────────
const ENTITY_PATTERNS = [
  { name: 'year',       regex: /\b(20\d{2})\b/g },
  { name: 'course',     regex: /\b(b\.?tech|m\.?tech|bca|mca|bsc|msc|mba|bba|phd|diploma)\b/gi },
  { name: 'semester',   regex: /\b(sem|semester)\s*(\d+)\b/gi },
  { name: 'department', regex: /\b(cse|ece|me|eee|civil|it|aids|aiml|cs)\b/gi },
];

function extractEntities(text) {
  const found = [];
  ENTITY_PATTERNS.forEach(({ name, regex }) => {
    const matches = text.match(regex);
    if (matches) matches.forEach(m => found.push(`${name}:${m.trim()}`));
  });
  return found;
}

function personalise(tpl) {
  return tpl
    .replace(/{{COLLEGE_NAME}}/g, process.env.COLLEGE_NAME    || 'Greenfield Institute of Technology')
    .replace(/{{PHONE}}/g,        process.env.COLLEGE_PHONE   || '+1-800-555-0100')
    .replace(/{{EMAIL}}/g,        process.env.COLLEGE_EMAIL   || 'admissions@git.edu')
    .replace(/{{WEBSITE}}/g,      process.env.COLLEGE_WEBSITE || 'https://www.git.edu')
    .replace(/{{ADDRESS}}/g,      process.env.COLLEGE_ADDRESS || '123 University Avenue, Tech City');
}

function buildFallback(userMessage, allScores, entities = []) {
  const suggestions = [
    '🤔 I didn\'t quite understand that. Here are some things you can ask:\n\n• *How do I apply for admission?*\n• *What courses are offered?*\n• *What is the fee structure?*\n• *Is hostel available?* | *What is the hostel fee?*\n• *What are the bus routes?*\n• *What is the placement record?*\n• *How to download hall ticket?*\n• *Are scholarships available?*\n\nOr call us at **{{PHONE}}** 😊',
    '🤔 Hmm, could you rephrase that? Try asking:\n• **Admission** | **Courses** | **Fees** | **Hostel** | **Transport**\n• **Exams** | **Results** | **Placements** | **Events** | **Contact**',
  ];
  return {
    intent:      'fallback',
    displayName: 'Fallback',
    confidence:  allScores[0]?.score || 0,
    response:    personalise(suggestions[Math.floor(Math.random() * suggestions.length)]),
    entities,
    isFallback:  true,
    allScores,
  };
}

function computeAccuracy(logs) {
  const total   = logs.length;
  const correct = logs.filter(l => !l.isFallback).length;
  return total === 0 ? 0 : +((correct / total) * 100).toFixed(2);
}

module.exports = { classifyIntent, invalidateCache, computeAccuracy, normalise };