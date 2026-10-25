/**
 * data/schoolIntents.js
 * ─────────────────────────────────────────────────────────────────────────────
 * The school enquiry knowledge base — the single source of truth for:
 *   · services/nlpService.js  (built-in intents, used when the DB is empty)
 *   · database/seed.js        (loaded into Supabase so admins can edit them)
 *
 * ⚠️  All figures (fees, timings, ages, counts) are SAMPLE values for a typical
 *     CBSE day school in India. Edit them here or in the Admin Panel before
 *     going live.
 *
 * Template variables (filled in from .env at reply time):
 *   {{SCHOOL_NAME}}  {{PHONE}}  {{EMAIL}}  {{WEBSITE}}  {{ADDRESS}}
 *
 * Fields per intent:
 *   intentName       unique snake_case id
 *   displayName      label shown in the admin panel
 *   category         admissions | academics | fees | campus | contact | events | general
 *   keywords         short words/phrases, weighted heavily for short queries
 *   trainingPhrases  example questions, weighted heavily for long queries
 *   responses        one is picked at random
 * ─────────────────────────────────────────────────────────────────────────────
 */

module.exports = [

  // ══════════════════════════════════════════════════════════════════════════
  //  GENERAL · greetings & small talk
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'greetings', displayName: 'Greetings', category: 'general',
    keywords: ['hello','hi','hey','good morning','good afternoon','good evening','greetings','hii','helo','namaste','namaskar'],
    trainingPhrases: ['hello','hi','hey there','good morning','good afternoon','good evening','hi there'],
    responses: ['👋 Hello! Welcome to the **{{SCHOOL_NAME}}** enquiry assistant.\n\nI can help parents and students with:\n• 📋 Admissions, age criteria & documents\n• 💰 Fees, instalments & concessions\n• 📚 Curriculum, classes & exams\n• 🚌 School bus & transport\n• ⏰ School timings, uniform & books\n• 🏫 Facilities, sports & activities\n• 🛡️ Safety & student care\n• 📞 Contact & campus visits\n\nType your question below! 😊'],
  },
  {
    intentName: 'thanks', displayName: 'Thanks', category: 'general',
    keywords: ['thank','thanks','thank you','appreciate','helpful','great','awesome','perfect','dhanyavad'],
    trainingPhrases: ['thank you','thanks a lot','that was helpful','appreciate it','thanks for the information'],
    responses: ['😊 You\'re most welcome! Feel free to ask anything else about **{{SCHOOL_NAME}}**.'],
  },
  {
    intentName: 'goodbye', displayName: 'Goodbye', category: 'general',
    keywords: ['bye','goodbye','see you','take care','good night','ok bye'],
    trainingPhrases: ['bye','goodbye','see you later','take care','ok bye'],
    responses: ['👋 Goodbye! We look forward to welcoming your child to **{{SCHOOL_NAME}}**. 😊'],
  },
  {
    intentName: 'who_are_you', displayName: 'About the Assistant', category: 'general',
    keywords: ['who are you','what are you','your name','are you human','are you a bot','chatbot','virtual assistant','what can you do'],
    trainingPhrases: ['who are you','what can you do','are you a robot','are you a real person','introduce yourself'],
    responses: ['🤖 I\'m the virtual enquiry assistant for **{{SCHOOL_NAME}}**. I answer common questions from parents and students instantly, in English, Hindi or Marathi.\n\nIf I can\'t help, you can connect to a member of our admissions team through **Live Chat**.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  GENERAL · about the school
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'about_school', displayName: 'About the School', category: 'general',
    keywords: ['about school','about the school','tell me about','school details','school information','overview','history of school'],
    trainingPhrases: ['tell me about the school','give me information about your school','what kind of school is this','school overview'],
    responses: ['🏫 **About {{SCHOOL_NAME}}:**\n\n• **Type:** Co-educational, English-medium day school\n• **Board:** CBSE (Central Board of Secondary Education)\n• **Classes:** Playgroup to Class 12\n• **Established:** 1998\n• **Students:** ~2,400 | **Teachers:** 120+\n• **Class size:** Maximum 30 students per section\n\nOur focus is on concept-based learning, values and all-round development through sports, arts and clubs.\n🔗 {{WEBSITE}}'],
  },
  {
    intentName: 'school_board', displayName: 'Board / Affiliation', category: 'general',
    keywords: ['board','cbse','icse','state board','affiliation','affiliated','ssc','igcse','ib board','which board'],
    trainingPhrases: ['which board is the school affiliated to','is the school cbse or state board','is it cbse','school affiliation','what syllabus do you follow'],
    responses: ['📜 **Board & Affiliation:**\n\n{{SCHOOL_NAME}} is affiliated to **CBSE, New Delhi** from Class 1 to Class 12.\n\n• Classes 1–8 follow the **NCERT** curriculum, aligned with **NEP 2020**\n• Classes 9–12 follow the CBSE scheme of studies\n• Pre-primary follows our play-based early-years programme\n\nThe affiliation certificate is available on {{WEBSITE}} under *Mandatory Disclosure*.'],
  },
  {
    intentName: 'medium_of_instruction', displayName: 'Medium of Instruction', category: 'general',
    keywords: ['medium','english medium','language of instruction','teaching language','marathi medium','hindi medium'],
    trainingPhrases: ['what is the medium of instruction','is it an english medium school','in which language do you teach'],
    responses: ['🗣️ **Medium of Instruction:** English\n\n**Second language:** Hindi or Marathi (from Class 1)\n**Third language:** Sanskrit, Marathi or Hindi (Classes 5–8)\n\nWe encourage students to speak English on campus while respecting every child\'s mother tongue.'],
  },
  {
    intentName: 'co_ed', displayName: 'Co-educational', category: 'general',
    keywords: ['co-ed','coed','co education','girls school','boys school','girls and boys','only girls','only boys'],
    trainingPhrases: ['is this a co-ed school','is it only for girls','is it a boys school','do boys and girls study together'],
    responses: ['👫 Yes, {{SCHOOL_NAME}} is a **co-educational** school. Boys and girls study together in all classes from Playgroup to Class 12.'],
  },
  {
    intentName: 'principal_info', displayName: 'Principal', category: 'general',
    keywords: ['principal','headmistress','headmaster','head of school','meet principal','director'],
    trainingPhrases: ['who is the principal','can i meet the principal','how to meet the principal','principal appointment'],
    responses: ['👩‍🏫 **Meeting the Principal:**\n\nThe Principal meets parents **by appointment**, Monday–Friday, 11:00 AM – 1:00 PM.\n\n📞 Book through the school office: **{{PHONE}}**\n📧 Or email **{{EMAIL}}** with the subject *"Appointment with Principal"*.'],
  },
  {
    intentName: 'teachers_info', displayName: 'Teachers & Staff', category: 'academics',
    keywords: ['teacher','teachers','faculty','staff','qualified','qualification of teachers','class teacher','b.ed','ctet'],
    trainingPhrases: ['are the teachers qualified','how many teachers are there','what is the teacher student ratio','tell me about the teachers'],
    responses: ['👩‍🏫 **Our Teachers:**\n\n• **120+** teachers, all with **B.Ed / D.Ed** and CTET/TET qualifications\n• Subject specialists for every subject from Class 6 onwards\n• **Student–teacher ratio:** about 20:1\n• Every section has a **class teacher** who is the parents\' first point of contact\n• Regular in-house training plus CBSE capacity-building workshops'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  ADMISSIONS
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'admission_process', displayName: 'Admission Process', category: 'admissions',
    keywords: ['admission','admissions','apply','how to apply','enroll','enrol','admission process','admission procedure','join school','take admission'],
    trainingPhrases: ['how to apply for admission','what is the admission process','how do i get my child admitted','admission procedure','steps for admission','how can i enroll my child'],
    responses: ['📋 **Admission Process at {{SCHOOL_NAME}}:**\n\n1️⃣ **Register online** at {{WEBSITE}}/admissions (registration fee ₹1,000)\n2️⃣ **Interaction / assessment:**\n   • Playgroup–UKG: informal interaction with the child and parents\n   • Class 1–9: simple test in English, Maths & EVS/Science\n   • Class 11: based on Class 10 marks + counselling\n3️⃣ **Result** is shared by SMS/email within 7 days\n4️⃣ **Document verification** at the school office\n5️⃣ **Pay admission fee** to confirm the seat\n\n📞 Help: **{{PHONE}}** | 📧 **{{EMAIL}}**'],
  },
  {
    intentName: 'admission_dates', displayName: 'Admission Dates', category: 'admissions',
    keywords: ['admission start','admissions open','when do admissions','admission date','last date','deadline','registration date','admission open','admission closing'],
    trainingPhrases: ['when do admissions start','are admissions open','what is the last date for admission','when does registration open','admission deadline'],
    responses: ['📅 **Admission Schedule (next academic year):**\n\n• **Registration opens:** 1st November\n• **Pre-primary & Class 1 interactions:** December – January\n• **Class 2–9 assessments:** January – February\n• **Class 11 admissions:** after Class 10 board results (May)\n• **Registration closes:** when seats are full\n\nThe academic year begins in **April**. Watch {{WEBSITE}}/admissions for the exact dates.'],
  },
  {
    intentName: 'age_criteria', displayName: 'Age Criteria', category: 'admissions',
    keywords: ['age','age criteria','age limit','minimum age','how old','age for nursery','age for class 1','age eligibility','date of birth'],
    trainingPhrases: ['nursery admission age','age for admission','what is the age criteria for nursery','what age is required for class 1','minimum age for admission','my child is 3 years old which class','age limit for lkg'],
    responses: ['🎂 **Age Criteria** (age completed as on **31st March** of the admission year):\n\n• **Playgroup:** 2 years 6 months+\n• **Nursery:** 3 years+\n• **LKG (Jr. KG):** 4 years+\n• **UKG (Sr. KG):** 5 years+\n• **Class 1:** 6 years+ (as per NEP 2020)\n\nFor higher classes, the child should have passed the previous class. A **birth certificate** is required as proof of age.'],
  },
  {
    intentName: 'admission_documents', displayName: 'Documents Required', category: 'admissions',
    keywords: ['documents','document','certificates','papers','required documents','what to bring','documents needed','birth certificate','aadhaar'],
    trainingPhrases: ['what documents are required for admission','documents needed for admission','which certificates are required','admission documents checklist'],
    responses: ['📁 **Documents Required for Admission:**\n\n✅ Birth certificate (original + copy)\n✅ Aadhaar card of the child and both parents\n✅ 4 recent passport-size photos of the child, 2 of each parent\n✅ Address proof (electricity bill / rent agreement / passport)\n✅ Previous school report card (Class 1 onwards)\n✅ **Transfer Certificate (TC)** — Class 2 onwards, countersigned if from another state\n✅ Caste certificate (if applicable)\n✅ Medical & vaccination record\n\nPlease bring originals for verification.'],
  },
  {
    intentName: 'entrance_test', displayName: 'Entrance Test / Interaction', category: 'admissions',
    keywords: ['entrance test','admission test','entrance exam','interview','interaction','assessment test','written test','syllabus for test'],
    trainingPhrases: ['is there an entrance test for admission','what is the syllabus for the admission test','is there an interview for nursery','will my child be tested','what is asked in the interaction'],
    responses: ['📝 **Admission Assessment:**\n\n• **Playgroup – UKG:** No test. A friendly 10-minute interaction with the child and parents.\n• **Class 1 – 9:** A 45-minute test in **English, Maths and EVS/Science**, based on the previous class syllabus.\n• **Class 11:** Admission is based on **Class 10 marks** and stream counselling.\n\nSample papers are shared after registration. 😊'],
  },
  {
    intentName: 'seat_availability', displayName: 'Seat Availability', category: 'admissions',
    keywords: ['seats','seat available','vacancy','vacancies','seats left','is there a seat','availability'],
    trainingPhrases: ['are seats available in class 5','is there a vacancy','how many seats are there in nursery','are seats still available'],
    responses: ['🪑 **Seat Availability:**\n\nSeats vary by class every year. Entry-level classes (Playgroup, Nursery, Class 1 and Class 11) have the most seats.\n\nTo check a specific class, call **{{PHONE}}** or email **{{EMAIL}}** with your child\'s class and date of birth. You can also register online and we\'ll contact you when a seat opens.'],
  },
  {
    intentName: 'mid_year_admission', displayName: 'Mid-year Admission', category: 'admissions',
    keywords: ['mid year','mid-year','mid session','transfer','relocating','middle of year','change school','shifting'],
    trainingPhrases: ['can i get admission in the middle of the year','we are relocating can my child join mid session','do you take mid year admissions','transfer from another school'],
    responses: ['🔄 **Mid-year / Transfer Admissions:**\n\n✅ Yes, subject to seat availability — common for families relocating.\n\n• Bring the **Transfer Certificate** and latest report card\n• An assessment may be held for Class 2 and above\n• Fees are charged from the quarter in which the child joins\n• Students from other boards get a short bridge plan from subject teachers\n\n📞 **{{PHONE}}**'],
  },
  {
    intentName: 'rte_admission', displayName: 'RTE 25% Admission', category: 'admissions',
    keywords: ['rte','right to education','25 percent','25%','free seat','ews','economically weaker','rte lottery','rte admission'],
    trainingPhrases: ['do you have rte seats','how to apply under rte','is free admission available under rte','rte 25 percent reservation'],
    responses: ['⚖️ **RTE Admissions:**\n\nAs per the Right to Education Act, **25% of entry-level seats** are reserved for children from economically weaker and disadvantaged groups.\n\n• Applications are made **only through the government RTE portal** (not directly to the school)\n• Seats are allotted by the government **online lottery**\n• Selected students study free of tuition fees\n\nOur office can guide you with the documents: **{{PHONE}}**'],
  },
  {
    intentName: 'class_11_streams', displayName: 'Class 11 Streams', category: 'admissions',
    keywords: ['stream','streams','science stream','commerce','arts','humanities','pcm','pcb','class 11','11th','junior college','after 10th'],
    trainingPhrases: ['which streams are available in class 11','do you have commerce stream','is pcb available','what subjects are offered in 11th','admission in class 11'],
    responses: ['🎯 **Class 11 & 12 Streams:**\n\n🔬 **Science (PCM):** Physics, Chemistry, Maths + English + 1 elective\n🧬 **Science (PCB):** Physics, Chemistry, Biology + English + 1 elective\n💼 **Commerce:** Accountancy, Business Studies, Economics + English + Maths / IP\n📖 **Humanities:** History, Political Science, Psychology/Geography + English + 1 elective\n\n**Electives:** Computer Science, Informatics Practices, Physical Education, Painting\n\n**Eligibility:** generally 60%+ in Class 10 for Science, 50%+ for Commerce & Humanities.'],
  },
  {
    intentName: 'admission_status', displayName: 'Admission Status', category: 'admissions',
    keywords: ['admission status','application status','result of admission','selected or not','check status','registration status'],
    trainingPhrases: ['how do i check my admission status','is my child selected','when will i know the admission result','application status'],
    responses: ['🔍 **Checking Admission Status:**\n\n• Log in at **{{WEBSITE}}/admissions** with your registration number\n• Results are also sent by **SMS and email** within 7 days of the interaction/test\n• Selected parents must complete documents and fees within **5 working days**\n\nQuestions? 📞 **{{PHONE}}**'],
  },
  {
    intentName: 'cancel_admission', displayName: 'Cancel Admission / Refund', category: 'admissions',
    keywords: ['cancel admission','withdraw admission','refund','cancellation','get money back','refund policy'],
    trainingPhrases: ['how do i cancel admission','will i get a refund if i cancel','what is the refund policy','withdraw my child'],
    responses: ['↩️ **Cancellation & Refund Policy:**\n\n• **Registration fee:** non-refundable\n• **Admission fee:** non-refundable once the seat is confirmed\n• **Caution deposit:** fully refundable when the child leaves (after clearing dues)\n• **Tuition fee:** refunded for any full quarter not yet started, if you inform us in writing before it begins\n\nSubmit a written request at the school office or email **{{EMAIL}}**.'],
  },
  {
    intentName: 'school_visit', displayName: 'Campus Visit / School Tour', category: 'admissions',
    keywords: ['visit','school tour','campus tour','see the school','visit campus','open house','come to school'],
    trainingPhrases: ['can i visit the school','how to book a school tour','can we see the campus before admission','is there an open house'],
    responses: ['🚶 **Visit Our Campus:**\n\nWe\'d love to show you around!\n\n• **Guided tours:** Monday–Saturday, 9:30 AM – 12:30 PM, by appointment\n• **Open House:** held in November and January — see {{WEBSITE}}\n• Book a tour: **{{PHONE}}** or **{{EMAIL}}**\n\n📍 {{ADDRESS}}'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  FEES
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'fee_structure', displayName: 'Fee Structure', category: 'fees',
    keywords: ['fee','fees','fee structure','school fees','tuition','how much fee','annual fee','cost','charges','fee details'],
    trainingPhrases: ['what is the fee structure','how much is the school fee','what are the fees for class 5','tuition fee per year','total annual fees'],
    responses: ['💰 **Annual Tuition Fee (sample, per year):**\n\n• **Playgroup – UKG:** ₹45,000\n• **Class 1 – 5:** ₹55,000\n• **Class 6 – 8:** ₹62,000\n• **Class 9 – 10:** ₹70,000\n• **Class 11 – 12:** ₹78,000 (+ ₹6,000 lab fee for Science)\n\n**One-time at admission:**\n• Registration: ₹1,000 | Admission fee: ₹15,000\n• Caution deposit: ₹5,000 (refundable)\n\nTransport, books and uniform are charged separately. Payable in **4 quarterly instalments**.\n🔗 {{WEBSITE}}/fees'],
  },
  {
    intentName: 'fee_payment', displayName: 'Fee Payment Methods', category: 'fees',
    keywords: ['pay fee','pay fees','payment','online payment','upi','net banking','cheque','payment mode','how to pay','fee receipt'],
    trainingPhrases: ['how do i pay the fees','can i pay fees online','what are the payment options','is upi accepted','where do i get the fee receipt'],
    responses: ['💳 **How to Pay Fees:**\n\n✅ **Online:** Parent app / {{WEBSITE}}/fees — UPI, net banking, debit/credit card\n✅ **Bank:** NEFT to the school account (details on the fee card)\n✅ **At school:** Cheque or demand draft at the accounts office, 8:00 AM – 1:00 PM\n\n❌ Cash is not accepted.\n🧾 Receipts are emailed instantly for online payments and available in the parent app.'],
  },
  {
    intentName: 'fee_installments', displayName: 'Instalments & Due Dates', category: 'fees',
    keywords: ['instalment','installment','installments','quarterly','due date','monthly fee','pay in parts','fee schedule','when to pay'],
    trainingPhrases: ['can i pay fees in instalments','what are the fee due dates','is monthly payment allowed','when is the fee due','quarterly fee schedule'],
    responses: ['📆 **Fee Instalments:**\n\nTuition is paid in **4 quarterly instalments**, due by the **10th** of:\n• April | • July | • October | • January\n\nYou may also pay the full year in April. Monthly payment is not available, but please contact the accounts office if you are facing difficulty — we\'ll try to help.'],
  },
  {
    intentName: 'late_fee', displayName: 'Late Fee', category: 'fees',
    keywords: ['late fee','late payment','penalty','fine','overdue','missed payment','delay in fee'],
    trainingPhrases: ['what is the late fee','is there a fine for late payment','i missed the fee due date','penalty for late fees'],
    responses: ['⏰ **Late Payment:**\n\n• A late fee of **₹100 per week** applies after the 10th of the due month\n• After 60 days, the child\'s report card and online access may be withheld until dues are cleared\n\nIf you have a genuine difficulty, please speak to the accounts office before the due date: **{{PHONE}}**'],
  },
  {
    intentName: 'sibling_concession', displayName: 'Sibling Concession', category: 'fees',
    keywords: ['sibling','siblings','second child','brother','sister','two children','concession','discount','fee waiver'],
    trainingPhrases: ['is there a discount for siblings','do you give concession for second child','fee concession','any discount on fees'],
    responses: ['👧👦 **Fee Concessions:**\n\n• **Sibling concession:** 10% off tuition for the second child, 15% for the third\n• **Staff ward:** 50% tuition concession\n• **Single parent / financial hardship:** reviewed case by case by the fee committee\n\nApply with a written request at the accounts office. Concessions apply to tuition fees only.'],
  },
  {
    intentName: 'scholarships', displayName: 'Scholarships', category: 'fees',
    keywords: ['scholarship','scholarships','merit scholarship','financial aid','sports scholarship','free education'],
    trainingPhrases: ['are scholarships available','merit scholarship for students','how to apply for scholarship','sports scholarship','financial help for fees'],
    responses: ['🏅 **Scholarships:**\n\n🎓 **Merit:** 25% tuition waiver for students scoring **95%+** (Class 9–12), 15% for 90%+\n🏆 **Sports / Arts:** for students representing district level or above\n🏛️ **Government:** we help students apply for central and state scholarships\n\nApplications open every **April**. Details: {{WEBSITE}}/scholarships'],
  },
  {
    intentName: 'other_charges', displayName: 'Other Charges (Books, Uniform, Activities)', category: 'fees',
    keywords: ['other charges','extra charges','additional fees','hidden charges','book fees','uniform cost','activity fee','annual charges'],
    trainingPhrases: ['are there any extra charges','what other fees are there apart from tuition','cost of books and uniform','is there an activity fee'],
    responses: ['🧾 **Charges Apart from Tuition (approx.):**\n\n• **Books & stationery kit:** ₹3,500 – ₹7,000 depending on class\n• **Uniform set:** ₹3,000 – ₹4,500\n• **Transport:** ₹18,000 – ₹30,000/year (optional)\n• **Exam & activity fee:** included in tuition\n• **Field trips / camps:** optional, charged per trip\n\nThere are **no hidden charges** — everything is listed on the fee card.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  ACADEMICS
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'classes_offered', displayName: 'Classes Offered', category: 'academics',
    keywords: ['classes','which classes','grades','up to which class','till which class','sections','kg','nursery','pre primary','primary'],
    trainingPhrases: ['which classes do you have','up to which class is the school','do you have nursery','do you have class 12','school sections'],
    responses: ['🏫 **Classes at {{SCHOOL_NAME}}:**\n\n🧸 **Pre-Primary:** Playgroup, Nursery, LKG, UKG\n📗 **Primary:** Class 1 – 5\n📘 **Middle:** Class 6 – 8\n📙 **Secondary:** Class 9 – 10 (CBSE board exam in Class 10)\n📕 **Senior Secondary:** Class 11 – 12 — Science, Commerce & Humanities'],
  },
  {
    intentName: 'curriculum', displayName: 'Curriculum & Teaching', category: 'academics',
    keywords: ['curriculum','syllabus','teaching method','pedagogy','ncert','nep','how do you teach','learning approach','activity based'],
    trainingPhrases: ['what curriculum do you follow','what is your teaching method','do you follow ncert books','is teaching activity based','tell me about nep'],
    responses: ['📚 **Curriculum & Teaching:**\n\n• **Pre-primary:** play-based, phonics, numeracy, motor skills — no formal exams\n• **Class 1–8:** NCERT curriculum, aligned with **NEP 2020** — experiential, project and activity-based learning\n• **Class 9–12:** CBSE syllabus with focus on concepts, practicals and board preparation\n\n✨ Smart classes, STEM projects, reading programme and value education in every class.'],
  },
  {
    intentName: 'subjects', displayName: 'Subjects', category: 'academics',
    keywords: ['subjects','which subjects','languages offered','second language','third language','computer subject','evs'],
    trainingPhrases: ['what subjects are taught','which languages can my child study','is computer taught','subjects in class 6'],
    responses: ['📖 **Subjects:**\n\n• **Class 1–5:** English, Hindi/Marathi, Maths, EVS, Computers, Art, Music, PE\n• **Class 6–8:** English, Hindi/Marathi, 3rd language, Maths, Science, Social Science, Computers, AI/Coding, Art, PE\n• **Class 9–10:** English, Hindi/Marathi/Sanskrit, Maths (Standard/Basic), Science, Social Science, + IT/AI elective\n• **Class 11–12:** as per stream — ask me about *streams*'],
  },
  {
    intentName: 'exam_pattern', displayName: 'Exams & Assessment', category: 'academics',
    keywords: ['exam','exams','test','tests','assessment','exam pattern','term exam','unit test','periodic test','half yearly','annual exam','exam schedule'],
    trainingPhrases: ['what is the exam pattern','how many exams are there in a year','when are the exams','how are students assessed','exam schedule'],
    responses: ['📝 **Assessment Pattern:**\n\n• **Pre-primary:** no exams — observation-based progress reports\n• **Class 1–2:** continuous assessment through activities and worksheets\n• **Class 3–12:**\n   – Periodic Test 1 (July)\n   – **Half-Yearly** exam (September/October)\n   – Periodic Test 2 (December)\n   – **Annual** exam (February/March)\n\n🎓 Class 10 & 12 **CBSE board exams** are held February–March.\nThe exam timetable is shared in the parent app 3 weeks before each exam.'],
  },
  {
    intentName: 'results_report_card', displayName: 'Results & Report Cards', category: 'academics',
    keywords: ['result','results','report card','marks','grades','marksheet','progress report','grading system','percentage'],
    trainingPhrases: ['when will the results be declared','how can i see my child\'s report card','what is the grading system','how do i check marks','progress report'],
    responses: ['📊 **Results & Report Cards:**\n\n• Report cards are given at the **Parent-Teacher Meeting** after the half-yearly and annual exams\n• Marks of every test are also visible in the **parent app**\n• Annual results: first week of **April**\n• **Grading:** CBSE 8-point scale (A1, A2, B1 … E) with marks shown for Class 6 onwards\n\nBoard results (Class 10 & 12) are published by CBSE in May.'],
  },
  {
    intentName: 'homework_policy', displayName: 'Homework Policy', category: 'academics',
    keywords: ['homework','home work','assignments','too much homework','holiday homework','project work'],
    trainingPhrases: ['how much homework is given','what is the homework policy','is there homework for nursery','holiday homework'],
    responses: ['🏠 **Homework Guidelines (per day):**\n\n• **Pre-primary:** no written homework — fun activities only\n• **Class 1–2:** up to 30 minutes\n• **Class 3–5:** up to 1 hour\n• **Class 6–8:** up to 1.5 hours\n• **Class 9–12:** up to 2 hours\n\nNo homework on weekends for Classes 1–5. Holiday work is limited to creative projects. Homework is posted daily in the parent app.'],
  },
  {
    intentName: 'attendance_policy', displayName: 'Attendance & Leave', category: 'academics',
    keywords: ['attendance','leave','absent','sick leave','leave application','minimum attendance','75 percent','holiday leave'],
    trainingPhrases: ['what is the attendance requirement','how to apply for leave','my child is sick how do i inform','minimum attendance for exams'],
    responses: ['📅 **Attendance & Leave:**\n\n• **Minimum attendance:** 75% (mandatory for Class 10 & 12 board exam eligibility)\n• **Informing absence:** message the class teacher in the parent app on the same day\n• **Planned leave:** apply in writing at least 3 days in advance\n• **Sick leave over 3 days:** a medical certificate is required\n\nAttendance is updated daily in the parent app.'],
  },
  {
    intentName: 'ptm', displayName: 'Parent-Teacher Meetings', category: 'academics',
    keywords: ['ptm','parent teacher meeting','parent-teacher','meet teacher','parents meeting','talk to teacher','open day'],
    trainingPhrases: ['when is the parent teacher meeting','how can i meet my child\'s teacher','how often are ptms held','can i talk to the class teacher'],
    responses: ['🤝 **Parent-Teacher Meetings:**\n\n• **Scheduled PTMs:** after each major exam (about 4 per year), usually on Saturdays\n• **Anytime:** book a 15-minute slot with the class teacher via the parent app\n• Teachers reply to app messages within **one working day**\n\nWe believe parents and teachers are partners in every child\'s progress.'],
  },
  {
    intentName: 'remedial_support', displayName: 'Extra Classes & Learning Support', category: 'academics',
    keywords: ['extra classes','remedial','weak in studies','tuition classes','extra help','doubt clearing','slow learner','learning support'],
    trainingPhrases: ['are extra classes available for weak students','my child needs extra help in maths','do you have remedial classes','doubt clearing sessions'],
    responses: ['📈 **Extra Learning Support:**\n\n• **Remedial classes** after school (2:15–3:00 PM) for students who need help — free of charge\n• **Doubt-clearing** sessions before every exam\n• **Board preparation** classes for Class 10 & 12 from November\n• **Enrichment** programmes (Olympiads, quizzes) for advanced learners\n\nTeachers identify students who need support, and parents can request it too.'],
  },
  {
    intentName: 'special_needs', displayName: 'Special Needs / Inclusive Education', category: 'academics',
    keywords: ['special needs','special education','inclusive','learning disability','dyslexia','adhd','autism','special educator','cwsn'],
    trainingPhrases: ['do you admit children with special needs','is there a special educator','my child has dyslexia','is the school inclusive'],
    responses: ['💙 **Inclusive Education:**\n\nWe welcome children with special needs wherever we can support them well.\n\n• Full-time **special educator** and **counsellor** on campus\n• Individual Education Plans (IEPs) with parents\n• CBSE-permitted exam concessions (extra time, scribe, etc.)\n• Wheelchair-accessible ground floor, ramps and washrooms\n\nPlease share any assessment reports at the time of admission so we can plan the right support.'],
  },
  {
    intentName: 'books_stationery', displayName: 'Books & Stationery', category: 'academics',
    keywords: ['books','book list','textbooks','stationery','notebooks','where to buy books','book kit'],
    trainingPhrases: ['where can i buy the books','what is the book list','are books provided by the school','do you use ncert books'],
    responses: ['📚 **Books & Stationery:**\n\n• The **book list** for each class is published on {{WEBSITE}} in March\n• Complete **book & notebook kits** are available from the school store in the first week of April\n• NCERT books are used wherever prescribed, with a few supplementary books\n• Parents may also buy books outside, as long as the edition matches'],
  },
  {
    intentName: 'digital_learning', displayName: 'Parent App & Online Learning', category: 'academics',
    keywords: ['app','parent app','school app','portal','online class','online learning','lms','circular','login','e-learning'],
    trainingPhrases: ['is there a school app for parents','how do i log in to the parent portal','do you have online classes','where can i see circulars'],
    responses: ['📱 **Parent App & Digital Learning:**\n\nThe school app (Android & iOS) gives parents:\n• Daily homework and class updates\n• Attendance, marks and report cards\n• Circulars, calendar and holiday list\n• Online fee payment and receipts\n• Messaging with the class teacher\n\nLogin details are sent by SMS after admission. Online classes are used only when the school is closed (e.g. weather emergencies).'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SCHOOL LIFE · timings, uniform, calendar
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'school_timings', displayName: 'School Timings', category: 'campus',
    keywords: ['timing','timings','school time','school hours','start time','end time','what time','dispersal','reporting time','schedule'],
    trainingPhrases: ['what are the school timings','what time does school start','when does school end','school hours for nursery','dispersal time'],
    responses: ['⏰ **School Timings (Monday – Friday):**\n\n🧸 **Playgroup – UKG:** 8:30 AM – 12:30 PM\n📘 **Class 1 – 12:** 7:45 AM – 2:15 PM\n\n📅 **Saturdays:** 1st, 3rd & 5th Saturdays are activity days (7:45 – 11:30 AM); 2nd & 4th Saturdays are holidays.\n\nGates open 15 minutes before school starts.'],
  },
  {
    intentName: 'academic_calendar', displayName: 'Academic Year & Holidays', category: 'campus',
    keywords: ['holiday','holidays','vacation','summer vacation','diwali vacation','academic year','calendar','holiday list','winter break','session start'],
    trainingPhrases: ['when does the academic year start','when is summer vacation','what is the holiday list','how long is the diwali break','school calendar'],
    responses: ['🗓️ **Academic Calendar (typical):**\n\n• **Session starts:** 1st week of April\n• **Summer vacation:** May (school reopens 2nd week of June)\n• **Diwali break:** about 2 weeks in October/November\n• **Winter break:** 25th December – 1st January\n• **Annual exams:** February – March\n\nThe full holiday list is in the parent app and on {{WEBSITE}}/calendar.'],
  },
  {
    intentName: 'uniform', displayName: 'Uniform & Dress Code', category: 'campus',
    keywords: ['uniform','dress code','school dress','shoes','pe uniform','house uniform','winter uniform','where to buy uniform'],
    trainingPhrases: ['what is the school uniform','where can i buy the uniform','what is the dress code','is there a sports uniform','winter uniform'],
    responses: ['👕 **Uniform:**\n\n• **Regular uniform:** Monday, Tuesday, Thursday\n• **PE / House uniform:** Wednesday & Friday\n• **Winter:** school blazer or sweater (November – February)\n• **Shoes:** black leather shoes; white sports shoes on PE days\n\n🛍️ Available at the **school uniform store** on campus and our authorised vendor (details on {{WEBSITE}}).\n\nStudents must wear their **ID card** every day.'],
  },
  {
    intentName: 'canteen_food', displayName: 'Canteen & Lunch', category: 'campus',
    keywords: ['canteen','food','lunch','tiffin','snacks','meal','cafeteria','lunch box','junk food','mid day meal'],
    trainingPhrases: ['is there a canteen','is lunch provided','what food is allowed in tiffin','do you serve meals','healthy food policy'],
    responses: ['🍱 **Food & Canteen:**\n\n• Students bring a **home-made tiffin**; there are two breaks (short break + lunch break)\n• The school **canteen** serves fresh, hygienic **vegetarian** snacks and meals at fixed prices\n• **Optional meal plan:** nutritious lunch for Classes 1–8, charged monthly\n• 🚫 Junk food, fizzy drinks and chocolates are not allowed in tiffins\n\nPre-primary children get a healthy mid-morning snack.'],
  },
  {
    intentName: 'mobile_phone_policy', displayName: 'Mobile Phone Policy', category: 'campus',
    keywords: ['mobile','phone','mobile phone','smartphone','smart watch','gadgets','electronic devices'],
    trainingPhrases: ['can students bring mobile phones','is mobile allowed in school','are smart watches allowed','gadget policy'],
    responses: ['📵 **Mobile Phone Policy:**\n\nMobile phones, smart watches and other gadgets are **not allowed** in school.\n\nIf a student must carry a phone for travel, it is deposited with the class teacher in the morning and returned at dispersal. Parents can always reach their child through the school office: **{{PHONE}}**.'],
  },
  {
    intentName: 'school_rules', displayName: 'Rules & Discipline', category: 'campus',
    keywords: ['rules','discipline','code of conduct','punishment','behaviour','behavior','school rules','late coming'],
    trainingPhrases: ['what are the school rules','what is the discipline policy','what happens if a student comes late','code of conduct'],
    responses: ['📏 **Discipline & Conduct:**\n\n• Students should arrive on time, in full uniform with ID card\n• Late-comers (after 8:00 AM) report to the front office\n• Respect for teachers, classmates and school property is expected\n• **No corporal punishment** — we use counselling, reflection and parent meetings\n• Bullying of any kind is taken very seriously\n\nThe full code of conduct is in the student diary.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  FACILITIES
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'facilities', displayName: 'School Facilities', category: 'campus',
    keywords: ['facilities','infrastructure','amenities','campus','what facilities','classrooms','building'],
    trainingPhrases: ['what facilities does the school have','tell me about the infrastructure','what is there on campus','school amenities'],
    responses: ['🏫 **Facilities at {{SCHOOL_NAME}}:**\n\n• 📺 Smart, air-ventilated classrooms\n• 🔬 Physics, Chemistry & Biology labs\n• 💻 Two computer labs + STEM / Robotics lab\n• 📚 Library with 15,000+ books\n• ⚽ Playground, basketball court & indoor games hall\n• 🎭 Auditorium, music, dance & art rooms\n• 🩺 Infirmary with a full-time nurse\n• 💧 RO drinking water on every floor\n• 📹 CCTV across the campus'],
  },
  {
    intentName: 'library', displayName: 'Library', category: 'campus',
    keywords: ['library','books library','reading room','borrow books','reading programme'],
    trainingPhrases: ['is there a library','how many books are in the library','can students borrow books','library timings'],
    responses: ['📚 **Library:**\n\n• **15,000+** books, magazines and newspapers in English, Hindi and Marathi\n• Separate **junior library** for Classes 1–5 with picture and story books\n• Weekly library period for every class\n• Students can borrow **2 books for 14 days**\n• Open 7:45 AM – 3:00 PM on school days'],
  },
  {
    intentName: 'labs', displayName: 'Science & Computer Labs', category: 'campus',
    keywords: ['lab','labs','laboratory','science lab','computer lab','robotics','stem','atal tinkering','coding','ai lab'],
    trainingPhrases: ['what labs do you have','is there a computer lab','do you teach robotics','is there a science lab','coding classes'],
    responses: ['🔬 **Labs:**\n\n• **Physics, Chemistry & Biology** labs for Classes 9–12\n• **Composite science lab** for Classes 6–8\n• **2 computer labs** with 80+ computers\n• **STEM / Robotics lab** — robotics, electronics and 3D design\n• **Coding & AI** classes from Class 3\n• **Maths lab** for hands-on concepts'],
  },
  {
    intentName: 'sports', displayName: 'Sports', category: 'events',
    keywords: ['sports','games','playground','cricket','football','basketball','swimming','skating','athletics','chess','yoga','karate','taekwondo','pe'],
    trainingPhrases: ['what sports are available','is there a playground','do you have swimming','is cricket coaching available','sports facilities'],
    responses: ['⚽ **Sports at {{SCHOOL_NAME}}:**\n\n🏏 Cricket | ⚽ Football | 🏀 Basketball | 🏐 Volleyball\n🏃 Athletics | ♟️ Chess | 🛼 Skating | 🥋 Taekwondo | 🧘 Yoga | 🏓 Table tennis\n\n• Daily or alternate-day **PE periods** for all classes\n• Professional coaches for after-school coaching (optional, small fee)\n• Students take part in CBSE cluster, district and state tournaments'],
  },
  {
    intentName: 'medical_facility', displayName: 'Medical Care', category: 'campus',
    keywords: ['medical','doctor','nurse','infirmary','first aid','sick room','health checkup','injury','ambulance'],
    trainingPhrases: ['is there a nurse in school','what if my child falls sick in school','is there a doctor','medical facilities','health check up'],
    responses: ['🩺 **Health & Medical Care:**\n\n• **Infirmary** with a qualified full-time nurse during school hours\n• First aid on every floor and in every school bus\n• Tie-up with a nearby hospital for emergencies\n• **Annual health check-up** (including eye and dental) for all students\n• Parents are informed immediately if a child is unwell\n\nPlease keep your emergency contact number updated in the parent app.'],
  },
  {
    intentName: 'daycare', displayName: 'Daycare / After-school Care', category: 'campus',
    keywords: ['daycare','day care','creche','after school care','after-school','working parents','stay after school'],
    trainingPhrases: ['do you have daycare','is after school care available','my child needs to stay till evening','is there a creche'],
    responses: ['🧸 **After-school Daycare:**\n\n• Available for Playgroup to Class 5\n• Timings: after dispersal till **6:30 PM**, Monday–Friday\n• Includes lunch, rest time, homework help and supervised play\n• Fees charged separately on a monthly basis\n\nLimited seats — please enquire at the office: **{{PHONE}}**'],
  },
  {
    intentName: 'hostel_boarding', displayName: 'Hostel / Boarding', category: 'campus',
    keywords: ['hostel','boarding','residential','stay in school','boarding school','accommodation'],
    trainingPhrases: ['is hostel available','is it a boarding school','do you have residential facility','can my child stay in the school'],
    responses: ['🏠 {{SCHOOL_NAME}} is a **day school**, so we do not offer hostel or boarding facilities.\n\nWe do offer **school bus transport** across the city and **after-school daycare** till 6:30 PM for younger children. Ask me about *transport* or *daycare* for details.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  TRANSPORT
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'transport', displayName: 'School Bus / Transport', category: 'campus',
    keywords: ['bus','buses','transport','school bus','van','pickup','drop','conveyance','bus facility','bus service'],
    trainingPhrases: ['is school bus available','do you provide transport','does the bus come to my area','is there pick up and drop','how to apply for school bus'],
    responses: ['🚌 **School Transport:**\n\n• **30+ buses** covering most areas of the city\n• Every bus has **GPS tracking**, **CCTV**, a trained driver and a **female attendant**\n• Live bus location in the parent app\n• Morning pick-up between 6:45 – 7:30 AM\n\n**To apply:** fill the transport form at the office or in the parent app. Routes and stops are on {{WEBSITE}}/transport.'],
  },
  {
    intentName: 'transport_fee', displayName: 'Transport Fee', category: 'fees',
    keywords: ['bus fee','bus fees','transport fee','transport charges','bus charges','van fee','how much for bus'],
    trainingPhrases: ['what is the bus fee','how much are transport charges','transport fee per year','bus fees for my area'],
    responses: ['🚌 **Transport Fee (sample, per year):**\n\n• **Up to 5 km:** ₹18,000\n• **5 – 10 km:** ₹24,000\n• **10 – 15 km:** ₹30,000\n\nPaid quarterly along with tuition. Transport can be stopped only at the end of a quarter, with one month\'s written notice.'],
  },
  {
    intentName: 'transport_safety', displayName: 'Bus Safety', category: 'campus',
    keywords: ['bus safety','safe bus','gps','bus tracking','attendant','bus driver','bus cctv','track bus','where is the bus'],
    trainingPhrases: ['is the school bus safe','can i track the school bus','is there a lady attendant in the bus','are bus drivers verified'],
    responses: ['🛡️ **Bus Safety:**\n\n✅ GPS tracking — see the bus live in the parent app\n✅ CCTV cameras inside every bus\n✅ Female attendant on every bus\n✅ Police-verified, experienced drivers\n✅ Speed governors (max 40 km/h), first-aid kit and fire extinguisher\n✅ Children are handed over only to a parent or authorised person at the stop\n\nAll buses follow RTO school-bus safety rules.'],
  },
  {
    intentName: 'pickup_policy', displayName: 'Pickup & Drop by Parents', category: 'campus',
    keywords: ['pick up','pickup','pick my child','collect child','drop my child','own transport','early pickup','pickup card','who can pick'],
    trainingPhrases: ['can i pick up my child myself','what is the pickup procedure','can someone else collect my child','early pickup from school'],
    responses: ['👨‍👩‍👧 **Pickup by Parents:**\n\n• Parents using their own transport receive a **pickup card** with photos of up to 3 authorised persons\n• Children are released **only** to a person showing the pickup card\n• For **early pickup**, inform the class teacher in the app and sign the register at the front office\n• If someone new is collecting, the parent must call the office in advance'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SAFETY & WELL-BEING
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'safety_security', displayName: 'Safety & Security', category: 'campus',
    keywords: ['safety','safe','security','cctv','guard','secure','visitors','id card','is the school safe','child safety'],
    trainingPhrases: ['is the school safe','what security measures are there','is there cctv in school','how do you ensure child safety','visitor policy'],
    responses: ['🛡️ **Safety & Security:**\n\n• **CCTV** coverage of classrooms, corridors, gates and buses\n• Trained **security guards** at all gates, 24×7\n• Visitors enter only with ID verification and a visitor pass\n• All staff are **police-verified**\n• Regular **fire and earthquake drills**\n• Female staff accompany pre-primary children at all times\n• **POCSO** committee and child-protection policy in place'],
  },
  {
    intentName: 'anti_bullying', displayName: 'Anti-bullying', category: 'campus',
    keywords: ['bullying','bully','bullied','harassment','teasing','ragging','cyber bullying'],
    trainingPhrases: ['what is your anti bullying policy','my child is being bullied','how do you handle bullying','is there ragging'],
    responses: ['🚫 **Anti-bullying Policy:**\n\nWe have **zero tolerance** for bullying — physical, verbal or online.\n\n• An **Anti-bullying Committee** of teachers and the counsellor\n• Students can report confidentially to any teacher or the counsellor\n• Every complaint is investigated within 48 hours and parents are informed\n• Regular awareness sessions on kindness and cyber-safety\n\nIf your child is facing this, please contact the class teacher or **{{EMAIL}}** right away.'],
  },
  {
    intentName: 'counselling', displayName: 'Counselling & Well-being', category: 'campus',
    keywords: ['counsellor','counselor','counselling','counseling','mental health','stress','exam stress','emotional','wellbeing','well-being','career counselling'],
    trainingPhrases: ['is there a counsellor in school','my child is stressed about exams','do you offer career counselling','emotional support for students'],
    responses: ['💬 **Counselling & Well-being:**\n\n• Full-time **school counsellor** for students and parents\n• Sessions are **confidential**\n• Help with exam stress, adjustment, friendships and emotions\n• **Career counselling** and aptitude tests for Classes 9–12\n• Life-skills and well-being periods for every class\n\nBook a session through the class teacher or the parent app.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  EVENTS & ACTIVITIES
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'extracurricular', displayName: 'Extra-curricular Activities', category: 'events',
    keywords: ['activities','extra curricular','extracurricular','co-curricular','clubs','hobby','music','dance','art','drama','after school activities'],
    trainingPhrases: ['what extra curricular activities are there','do you have music and dance classes','what clubs are available','activities for students'],
    responses: ['🎨 **Activities & Clubs:**\n\n🎵 Music (vocal & instrumental) | 💃 Dance | 🎨 Art & craft | 🎭 Drama\n🔬 Science club | 🌱 Eco club | 📖 Literary & debate club | 💻 Coding club\n🧠 Quiz club | 📷 Photography | ♟️ Chess\n\n• Weekly **activity periods** for all classes\n• **House system** — 4 houses compete in sports, arts and academics all year\n• Saturday activity days for workshops and competitions'],
  },
  {
    intentName: 'events', displayName: 'Events & Celebrations', category: 'events',
    keywords: ['events','annual day','sports day','function','celebration','festival','science exhibition','independence day','republic day','annual function'],
    trainingPhrases: ['what events are held in school','when is the annual day','when is sports day','do you celebrate festivals','school functions'],
    responses: ['🎉 **Events at {{SCHOOL_NAME}}:**\n\n• 🎭 **Annual Day** — December\n• 🏃 **Sports Day** — January\n• 🔬 **Science & Art Exhibition** — November\n• 🇮🇳 Independence Day & Republic Day\n• 🪔 Festivals — Ganesh Utsav, Diwali, Christmas, Eid and more\n• 📚 Book Week, Grandparents\' Day, Children\'s Day\n\nParents are invited to Annual Day, Sports Day and exhibitions.'],
  },
  {
    intentName: 'field_trips', displayName: 'Field Trips & Camps', category: 'events',
    keywords: ['trip','trips','field trip','picnic','excursion','tour','camp','outing','educational tour','summer camp'],
    trainingPhrases: ['do you take students on trips','are there picnics','is there a summer camp','educational tours for students'],
    responses: ['🚌 **Trips & Camps:**\n\n• **Field trips** for every class each term — museums, science parks, farms, factories\n• **Adventure camps** for Classes 6–12 (2–3 days, optional)\n• **Summer camp** in May — sports, art, robotics and more\n\nAll trips are accompanied by teachers and require parent consent. Costs are shared in advance.'],
  },
  {
    intentName: 'competitions', displayName: 'Olympiads & Competitions', category: 'events',
    keywords: ['olympiad','olympiads','competition','competitions','quiz','debate','inter school','nso','imo','spell bee','contest'],
    trainingPhrases: ['do students take part in olympiads','are there inter school competitions','quiz and debate competitions','spell bee'],
    responses: ['🏆 **Olympiads & Competitions:**\n\n• **Olympiads:** Science (NSO), Maths (IMO), English, Cyber — conducted in school\n• **Inter-school:** debates, quizzes, MUN, science fairs, sports\n• **In-house:** spell bee, elocution, art, coding contests\n\nWinners are recognised at assembly and on Annual Day. 🎖️'],
  },
  {
    intentName: 'ncc_scouts', displayName: 'NCC / Scouts & Guides', category: 'events',
    keywords: ['ncc','scouts','guides','scout','cubs','bulbuls','community service','social service'],
    trainingPhrases: ['do you have ncc','are scouts and guides available','community service activities'],
    responses: ['🎖️ **Scouts, Guides & Service:**\n\n• **Cubs & Bulbuls** (Classes 3–5) and **Scouts & Guides** (Classes 6–10)\n• Community service drives — cleanliness, tree plantation, donation drives\n• Road-safety and first-aid training\n\nThese build leadership, teamwork and a sense of service.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CERTIFICATES & ADMIN
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'transfer_certificate', displayName: 'Transfer / Leaving Certificate', category: 'admissions',
    keywords: ['tc','transfer certificate','leaving certificate','school leaving','lc','migration certificate','leave the school'],
    trainingPhrases: ['how do i get the transfer certificate','how to apply for tc','leaving certificate process','we are leaving the school'],
    responses: ['📄 **Transfer Certificate (TC):**\n\n1. Submit a written TC application at the office (or in the parent app)\n2. Clear all dues and return library books\n3. TC is issued within **7 working days**\n\nThe caution deposit is refunded with the TC. For Class 10/12 migration certificates, CBSE procedures apply.'],
  },
  {
    intentName: 'bonafide_certificate', displayName: 'Bonafide & Other Certificates', category: 'admissions',
    keywords: ['bonafide','bonafide certificate','character certificate','study certificate','fee certificate','certificate request'],
    trainingPhrases: ['how do i get a bonafide certificate','i need a fee certificate for tax','character certificate','study certificate for passport'],
    responses: ['📃 **Certificates:**\n\nBonafide, character, fee (for income-tax) and study certificates are issued by the school office.\n\n• Apply in the parent app or at the office\n• Ready in **2 working days**\n• Collect from the office, 8:00 AM – 1:00 PM'],
  },
  {
    intentName: 'grievance', displayName: 'Complaints & Feedback', category: 'contact',
    keywords: ['complaint','complain','grievance','feedback','suggestion','problem','issue','not happy'],
    trainingPhrases: ['how do i make a complaint','where can i give feedback','i have a grievance','whom to contact for a problem'],
    responses: ['📢 **Complaints & Feedback:**\n\n1. First speak to the **class teacher** (parent app or PTM)\n2. If unresolved, contact the **section coordinator**\n3. Then write to the **Principal** at **{{EMAIL}}**\n\nEvery complaint gets a response within **3 working days**. We value your feedback — it helps us improve.'],
  },
  {
    intentName: 'careers_jobs', displayName: 'Jobs at the School', category: 'contact',
    keywords: ['job','jobs','job vacancy','teacher vacancy','teacher job','teaching vacancy','vacancy for teacher','teaching job','career at school','recruitment','apply for job','work at school','resume'],
    trainingPhrases: ['are there any teaching vacancies','how can i apply for a job at your school','i want to work as a teacher','recruitment'],
    responses: ['💼 **Work With Us:**\n\nWe\'re always looking for passionate teachers and staff.\n\n• Current openings: {{WEBSITE}}/careers\n• Email your resume to **{{EMAIL}}** with the post in the subject line\n• Teaching posts need **B.Ed** and CTET/TET (as applicable)'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  CONTACT
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'contact', displayName: 'Contact Details', category: 'contact',
    keywords: ['contact','phone','phone number','call','mobile number','contact number','helpline','reach you','email','mail id','email address'],
    trainingPhrases: ['what is the contact number','how can i contact the school','what is the school email','give me the phone number','how to reach the office'],
    responses: ['📞 **Contact {{SCHOOL_NAME}}:**\n\n📱 **Phone:** {{PHONE}}\n📧 **Email:** {{EMAIL}}\n🌐 **Website:** {{WEBSITE}}\n📍 **Address:** {{ADDRESS}}\n\n🕐 Office hours: Monday – Saturday, 8:00 AM – 3:00 PM'],
  },
  {
    intentName: 'location', displayName: 'Address & Location', category: 'contact',
    keywords: ['address','location','where is','directions','how to reach','map','located','nearest','landmark'],
    trainingPhrases: ['where is the school located','what is the school address','how do i reach the school','directions to the school','google map location'],
    responses: ['📍 **{{SCHOOL_NAME}}**\n\n{{ADDRESS}}\n\n🗺️ Search *"{{SCHOOL_NAME}}"* on Google Maps for directions.\n📞 Need help finding us? Call **{{PHONE}}**'],
  },
  {
    intentName: 'office_timings', displayName: 'Office Hours', category: 'contact',
    keywords: ['office timing','office hours','office time','office open','reception','admin office','accounts office','working hours'],
    trainingPhrases: ['what are the office timings','when is the school office open','is the office open on saturday','accounts office timing'],
    responses: ['🕐 **Office Hours:**\n\n• **School office:** Monday – Saturday, 8:00 AM – 3:00 PM\n• **Accounts (fees):** Monday – Saturday, 8:00 AM – 1:00 PM\n• **Admissions desk:** Monday – Saturday, 9:00 AM – 2:00 PM\n\nClosed on Sundays, 2nd & 4th Saturdays and public holidays.'],
  },
  {
    intentName: 'website', displayName: 'Website', category: 'contact',
    keywords: ['website','site','web site','official website','url','online portal'],
    trainingPhrases: ['what is the school website','official website link','where can i find more information online'],
    responses: ['🌐 Our official website is **{{WEBSITE}}** — admissions, fees, calendar, circulars and the mandatory disclosure are all there.'],
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  OUT OF SCOPE
  // ══════════════════════════════════════════════════════════════════════════
  {
    intentName: 'out_of_scope_weather', displayName: 'Out of Scope — Weather', category: 'general',
    keywords: ['weather','temperature','rain today','forecast'],
    trainingPhrases: ['what is the weather today','will it rain today'],
    responses: ['🌦️ I can\'t check the weather, but if the school closes due to heavy rain we send an SMS and post a notice in the parent app. Anything else about **{{SCHOOL_NAME}}** I can help with?'],
  },
  {
    intentName: 'out_of_scope_joke', displayName: 'Out of Scope — Joke', category: 'general',
    keywords: ['joke','funny','make me laugh','tell me a joke'],
    trainingPhrases: ['tell me a joke','say something funny'],
    responses: ['😄 Why did the student eat his homework? Because the teacher said it was a piece of cake! 🍰\n\nNow, how can I help you with **{{SCHOOL_NAME}}**?'],
  },
];
