/**
 * Week-by-week pregnancy knowledge bank.
 *
 * One entry per week (1–40) so every week shows its own content. Weeks are
 * counted from the last menstrual period (LMP), which is how gestational age is
 * dated clinically — that is why weeks 1–2 come before conception.
 *
 * Sizes are population averages; healthy babies vary a lot. This is general
 * education, not medical advice.
 */

export type Trimester = 1 | 2 | 3;

export interface WeekKnowledge {
  week: number;
  trimester: Trimester;
  title: string;
  /** Everyday object the baby is roughly the size of */
  size: string;
  sizeEmoji: string;
  /** Crown–rump length up to week 19, head-to-heel from week 20 */
  length: string;
  weight: string;
  baby: string;
  mom: string;
  tip: string;
  /** What a lot of people notice this week */
  symptoms: string[];
  /** What is worth prioritising on the plate right now */
  nutrition: string;
  /** Appointments, tests and practical to-dos due around this week */
  checklist: string[];
}

export const pregnancyKnowledgeBase: Record<number, WeekKnowledge> = {
  1: {
    week: 1, trimester: 1,
    title: 'Week 1: Counting Begins',
    size: 'No baby yet', sizeEmoji: '🌸', length: '—', weight: '—',
    baby: 'There is no baby yet. Pregnancy is dated from the first day of your last period, so week 1 is your period itself. This gives everyone a shared starting point long before conception happens.',
    mom: 'You are menstruating. Your body is already preparing the next egg, and the lining of the uterus is renewing itself for a possible pregnancy.',
    tip: 'If you are trying to conceive, start folic acid now. Neural tube development begins before most people know they are pregnant, so starting early matters more than starting perfectly.',
    symptoms: ['Menstrual bleeding', 'Period cramps', 'Mood changes', 'Tiredness'],
    nutrition: 'Begin 400 mcg of folic acid daily, and keep iron up with dal, leafy greens, eggs or meat while you are bleeding.',
    checklist: ['Start a folic acid supplement', 'Note the first day of this period — every due date is calculated from it', 'Stop alcohol and smoking if you are trying to conceive'],
  },
  2: {
    week: 2, trimester: 1,
    title: 'Week 2: Ovulation',
    size: 'One egg', sizeEmoji: '🥚', length: '0.1 mm', weight: '—',
    baby: 'Still no baby, but one follicle in your ovary is ripening and will release an egg at the end of this week. That egg carries half the genetic material of your future child.',
    mom: 'Oestrogen rises, cervical mucus becomes clear and stretchy like egg white, and your body temperature dips just before ovulation and then rises.',
    tip: 'The fertile window is the five days before ovulation plus the day itself — sperm survive far longer than the egg, which lasts only about 24 hours.',
    symptoms: ['Clear, stretchy cervical mucus', 'Mild one-sided twinge (mittelschmerz)', 'Higher libido', 'Breast tenderness'],
    nutrition: 'Keep taking folic acid and eat regularly — crash dieting around ovulation can disrupt your cycle.',
    checklist: ['Track cervical mucus or use an ovulation kit if you are timing conception', 'Continue folic acid', 'Review any regular medicines with your doctor for pregnancy safety'],
  },
  3: {
    week: 3, trimester: 1,
    title: 'Week 3: Fertilisation',
    size: 'Pinhead', sizeEmoji: '✨', length: '0.1 mm', weight: '—',
    baby: 'Sperm meets egg in the fallopian tube and a single cell forms with a complete set of chromosomes. Over about five days it divides into a ball of cells and travels down to the uterus.',
    mom: 'You will not feel any of this. Implantation into the uterine lining happens at the very end of this week or early next week.',
    tip: 'Behave as though you are pregnant from now on — avoid alcohol, smoking and unprescribed medicines, because the earliest weeks are when organs are most vulnerable.',
    symptoms: ['Usually nothing at all', 'Occasional light implantation spotting', 'Mild bloating'],
    nutrition: 'Folic acid remains the single most important supplement. Avoid raw eggs, unpasteurised milk and undercooked meat from here on.',
    checklist: ['Continue folic acid', 'Avoid alcohol, tobacco and X-rays', 'Check with a pharmacist before taking any over-the-counter medicine'],
  },
  4: {
    week: 4, trimester: 1,
    title: 'Week 4: The Journey Begins',
    size: 'Poppy seed', sizeEmoji: '🌱', length: '2 mm', weight: '< 1 g',
    baby: 'The blastocyst burrows into the uterine lining and splits into two parts: one becomes your baby, the other becomes the placenta. The neural tube — the beginning of the brain and spinal cord — starts to form.',
    mom: 'Your body starts producing hCG, the hormone a pregnancy test detects. A test taken now will usually turn positive, especially with first-morning urine.',
    tip: 'Take prenatal vitamins with folic acid without missing days. The neural tube closes by around week 6, so this is the window where folic acid does its most important work.',
    symptoms: ['Missed period', 'Tender, heavier breasts', 'Fatigue', 'Light implantation spotting', 'Mild cramping'],
    nutrition: '400–600 mcg folic acid daily. Add curd, milk or paneer for calcium, and start cutting back on caffeine.',
    checklist: ['Take a home pregnancy test', 'Book your first prenatal appointment', 'Note your LMP date so your due date can be calculated'],
  },
  5: {
    week: 5, trimester: 1,
    title: 'Week 5: A Heart Starts Forming',
    size: 'Sesame seed', sizeEmoji: '🌾', length: '3 mm', weight: '< 1 g',
    baby: 'The embryo now has three layers that will become the nervous system, the heart and muscles, and the lungs and digestive tract. A primitive heart tube begins to pulse.',
    mom: 'Rising hCG and progesterone can bring the first real symptoms — sore breasts, exhaustion and a sudden aversion to smells you normally like.',
    tip: 'Fatigue this early is normal and not a sign that something is wrong. Sleep when you can; your body is building an entire organ, the placenta, from scratch.',
    symptoms: ['Sore breasts', 'Deep fatigue', 'Nausea starting', 'Heightened sense of smell', 'Frequent urination'],
    nutrition: 'Small frequent meals help more than three big ones. Keep fluids up — dehydration worsens nausea and fatigue.',
    checklist: ['Confirm the pregnancy with your doctor', 'Start prenatal vitamins if you have not', 'List any long-term medicines to review at your first visit'],
  },
  6: {
    week: 6, trimester: 1,
    title: 'Week 6: A Heartbeat',
    size: 'Lentil', sizeEmoji: '🫘', length: '5 mm', weight: '< 1 g',
    baby: 'The heart is beating around 110 times a minute and can often be seen flickering on an early ultrasound. Arm and leg buds appear, and the face begins to take shape.',
    mom: 'Morning sickness — which happens at any hour — often arrives now. Your uterus is growing but your bump will not show for weeks.',
    tip: 'Keep dry biscuits or roasted chana by the bed and eat a little before getting up. An empty stomach makes nausea significantly worse.',
    symptoms: ['Nausea and vomiting', 'Food aversions', 'Fatigue', 'Bloating', 'Mood swings'],
    nutrition: 'Eat whatever stays down — this is not the week for a perfect diet. Ginger, lemon and cold foods are often easier to tolerate.',
    checklist: ['Attend your first prenatal visit if scheduled', 'Ask about a dating scan', 'Tell your doctor if vomiting stops you keeping fluids down'],
  },
  7: {
    week: 7, trimester: 1,
    title: 'Week 7: Brain Building',
    size: 'Blueberry', sizeEmoji: '🫐', length: '1 cm', weight: '1 g',
    baby: 'Brain cells are being generated at roughly 100 per minute. Hands and feet look like tiny paddles, and the umbilical cord is fully formed and delivering nutrients.',
    mom: 'You may need to urinate constantly as blood flow to your kidneys increases. Your gums might bleed slightly when brushing.',
    tip: 'Do not cut back on water to reduce bathroom trips — you need extra fluid now. Reduce evening drinks instead if the night waking bothers you.',
    symptoms: ['Frequent urination', 'Nausea', 'Excess saliva', 'Acne', 'Tender breasts'],
    nutrition: 'Protein at every meal — eggs, dal, curd, paneer, fish or chicken — supports the rapid cell division happening now.',
    checklist: ['Book a dating ultrasound if not done', 'Start gentle daily activity like walking', 'Switch to a soft toothbrush if your gums bleed'],
  },
  8: {
    week: 8, trimester: 1,
    title: 'Week 8: Rapid Growth',
    size: 'Raspberry', sizeEmoji: '🍇', length: '1.6 cm', weight: '1 g',
    baby: 'Fingers and toes are separating, eyelids are forming and the tail has disappeared. All essential organs have begun to develop, and the heart beats about 160 times a minute.',
    mom: 'Morning sickness and fatigue often peak around now. Blood volume is climbing, which is part of why you feel so tired.',
    tip: 'Eat small, frequent meals to manage nausea and stay hydrated with water, coconut water or ginger tea.',
    symptoms: ['Peak morning sickness', 'Extreme tiredness', 'Bloating and constipation', 'Breast changes', 'Emotional ups and downs'],
    nutrition: 'Add fibre — fruit, oats, whole grains — to counter the constipation that progesterone causes. Iron supplements can worsen it.',
    checklist: ['First detailed prenatal visit with blood tests', 'Blood group and Rh typing', 'Discuss first-trimester screening options'],
  },
  9: {
    week: 9, trimester: 1,
    title: 'Week 9: From Embryo to Fetus',
    size: 'Cherry', sizeEmoji: '🍒', length: '2.3 cm', weight: '2 g',
    baby: 'This is the last week as an embryo — from next week your baby is called a fetus. Tiny muscles allow the first movements, though far too small to feel.',
    mom: 'Your waistband may feel tight from bloating rather than the baby. Blood volume is up nearly 20 percent already.',
    tip: 'Dizziness when standing quickly is common as your blood vessels relax. Get up slowly and do not skip meals.',
    symptoms: ['Bloating', 'Dizziness', 'Nausea', 'Visible veins on the chest', 'Vivid dreams'],
    nutrition: 'Iron-rich foods with a source of vitamin C — lemon over greens, or citrus with your meal — help absorption considerably.',
    checklist: ['Complete first-trimester blood tests', 'Ask about NIPT or combined screening', 'Plan how and when to tell your workplace'],
  },
  10: {
    week: 10, trimester: 1,
    title: 'Week 10: Vital Organs at Work',
    size: 'Strawberry', sizeEmoji: '🍓', length: '3.1 cm', weight: '4 g',
    baby: 'Vital organs are functioning: kidneys make urine, the liver produces bile, and the stomach makes digestive juices. Tiny nails start forming on fingers and toes.',
    mom: 'Your uterus has grown from the size of a lemon to a grapefruit. Some people notice their face looks fuller.',
    tip: 'If nausea is severe enough that you are losing weight or cannot keep fluids down, that is not something to endure — safe treatments exist.',
    symptoms: ['Round ligament twinges', 'Nausea easing for some', 'Visible veins', 'Increased vaginal discharge', 'Headaches'],
    nutrition: 'Calcium becomes important as bones start to harden — milk, curd, paneer, ragi, sesame seeds or fortified alternatives.',
    checklist: ['NIPT blood test is possible from now', 'Schedule the NT scan for weeks 11–13', 'Start a pregnancy notes file for reports'],
  },
  11: {
    week: 11, trimester: 1,
    title: 'Week 11: Bones Hardening',
    size: 'Fig', sizeEmoji: '🫒', length: '4.1 cm', weight: '7 g',
    baby: 'Bones are beginning to harden, and your baby can open and close their fists and stretch. The head is still almost half the total body length.',
    mom: 'Your appetite may return as nausea starts easing. Hair and nails often grow faster thanks to hormones.',
    tip: 'The nuchal translucency scan is done between 11 and 13+6 weeks — it cannot be done later, so book it now if you want it.',
    symptoms: ['Returning appetite', 'Faster-growing hair and nails', 'Leg cramps', 'Mild breathlessness', 'Darkening nipples'],
    nutrition: 'Now that appetite is back, rebuild balanced meals: half vegetables, a quarter protein, a quarter whole grains.',
    checklist: ['Book or attend the NT scan (11–13+6 weeks)', 'Dental check-up — gum disease is linked to preterm birth', 'Confirm your due date from the scan'],
  },
  12: {
    week: 12, trimester: 1,
    title: 'Week 12: End of the First Trimester',
    size: 'Lime', sizeEmoji: '🍏', length: '5.4 cm', weight: '14 g',
    baby: 'Reflexes are developing — your baby can curl their toes and suck their thumb. The intestines move from the umbilical cord into the abdomen where they belong.',
    mom: 'Nausea usually fades and energy returns. The risk of miscarriage drops sharply at the end of this trimester.',
    tip: 'A great time to start Kegel exercises. Squeeze the muscles you would use to stop urine flow, hold five seconds, release, and repeat ten times a few times a day.',
    symptoms: ['Nausea fading', 'More energy', 'Dizziness', 'Slight bump appearing', 'Heartburn'],
    nutrition: 'Aim for roughly 300 extra calories a day from the second trimester — a glass of milk and a handful of nuts, not a second dinner.',
    checklist: ['Complete first-trimester screening', 'Many people share their news around now', 'Start Kegel exercises'],
  },
  13: {
    week: 13, trimester: 1,
    title: 'Week 13: Fingerprints Form',
    size: 'Lemon', sizeEmoji: '🍋', length: '7.4 cm', weight: '23 g',
    baby: 'Unique fingerprints are forming on those tiny fingertips. Vocal cords develop, and if you are carrying a girl, her ovaries already contain the beginnings of eggs.',
    mom: 'The last week of the first trimester. Many people find this the week they finally feel like themselves again.',
    tip: 'Start moisturising your belly and hips now rather than after stretch marks appear — it helps with the itching of stretching skin either way.',
    symptoms: ['Renewed energy', 'Visible bump', 'Less frequent urination', 'Changing skin pigmentation', 'Constipation'],
    nutrition: 'Iron needs climb from here. Many doctors start iron-folic acid tablets around now — take them with vitamin C, not with tea or milk.',
    checklist: ['Last week for the NT scan', 'Shift to comfortable, non-restrictive clothing', 'Discuss when the anomaly scan will be'],
  },
  14: {
    week: 14, trimester: 2,
    title: 'Week 14: The Second Trimester',
    size: 'Peach', sizeEmoji: '🍑', length: '8.7 cm', weight: '43 g',
    baby: 'Your baby makes facial expressions — squinting, frowning and grimacing — though not deliberately yet. Fine hair called lanugo starts covering the body.',
    mom: 'Welcome to the trimester most people enjoy most. Energy is better, nausea is usually gone and the bump is not yet uncomfortable.',
    tip: 'This is the best window for travel, dental work and any physical tasks you have been putting off.',
    symptoms: ['Increased energy', 'Improved appetite', 'Round ligament pain', 'Stuffy nose', 'Mild breast leakage'],
    nutrition: 'Protein needs increase now — target a protein source at every meal to support rapid muscle and tissue growth.',
    checklist: ['Routine antenatal check-up', 'Book the anomaly scan for 18–22 weeks', 'Consider starting prenatal yoga or swimming'],
  },
  15: {
    week: 15, trimester: 2,
    title: 'Week 15: Listening In',
    size: 'Apple', sizeEmoji: '🍎', length: '10.1 cm', weight: '70 g',
    baby: 'Bones in the ear are forming, so your baby is beginning to hear muffled sounds — your heartbeat, your digestion and your voice. Legs now grow longer than the arms.',
    mom: 'You might notice a dark line down the middle of your belly (linea nigra). It is hormonal and fades after birth.',
    tip: 'Start sleeping on your side rather than your back. Left is often recommended, but the important part is not flat on your back for long stretches.',
    symptoms: ['Linea nigra appearing', 'Nasal congestion', 'Sensitive gums', 'Heartburn', 'Backache starting'],
    nutrition: 'Omega-3 fats support brain and eye development — walnuts, flaxseed, chia and safe low-mercury fish.',
    checklist: ['Routine check-up and weight monitoring', 'Ask about a quadruple marker test if offered', 'Buy a supportive pillow for side sleeping'],
  },
  16: {
    week: 16, trimester: 2,
    title: 'Week 16: The Glow Begins',
    size: 'Avocado', sizeEmoji: '🥑', length: '11.6 cm', weight: '100 g',
    baby: 'Your baby can perceive light through closed eyelids and is listening to your voice. The heart pumps around 25 litres of blood a day.',
    mom: 'Your bump is likely showing. You might feel the first faint flutters — quickening — especially if this is not your first pregnancy.',
    tip: 'Talk or sing to your belly. Your baby can hear you now, and familiar voices are recognised after birth.',
    symptoms: ['First flutters of movement', 'Visible bump', 'Better skin and hair', 'Backache', 'Forgetfulness'],
    nutrition: 'Keep iron and calcium separated by a couple of hours — taken together, each blocks the absorption of the other.',
    checklist: ['Routine antenatal visit', 'Anomaly scan is usually scheduled for 18–22 weeks', 'Start pelvic tilts for back pain'],
  },
  17: {
    week: 17, trimester: 2,
    title: 'Week 17: Building Fat',
    size: 'Pear', sizeEmoji: '🍐', length: '13 cm', weight: '140 g',
    baby: 'Body fat starts forming under the skin, which will keep your baby warm after birth. The umbilical cord grows thicker and stronger.',
    mom: 'Your centre of gravity is shifting, which changes how you balance. Blood volume is now about 40 percent above pre-pregnancy levels.',
    tip: 'Wear flat, well-gripped footwear. Falls in pregnancy are far more often about a changed centre of gravity than about carelessness.',
    symptoms: ['Balance changes', 'Increased appetite', 'Vivid dreams', 'Itchy skin', 'Occasional dizziness'],
    nutrition: 'Healthy fats matter now — ghee in moderation, nuts, seeds and avocado support fat stores your baby is building.',
    checklist: ['Confirm the anomaly scan appointment', 'Switch to supportive, low-heeled shoes', 'Review your maternity leave entitlement'],
  },
  18: {
    week: 18, trimester: 2,
    title: 'Week 18: Yawns and Hiccups',
    size: 'Bell pepper', sizeEmoji: '🫑', length: '14.2 cm', weight: '190 g',
    baby: 'Your baby yawns, hiccups and swallows amniotic fluid. A protective myelin sheath begins forming around the nerves.',
    mom: 'Movements become more distinct. Some people feel rhythmic taps — those are usually fetal hiccups.',
    tip: 'The anomaly scan checks the brain, heart, spine, kidneys and limbs in detail. Take your partner and write your questions down beforehand.',
    symptoms: ['Clearer fetal movement', 'Leg cramps at night', 'Lower back pain', 'Swollen feet', 'Increased appetite'],
    nutrition: 'Magnesium-rich foods — bananas, nuts, whole grains, leafy greens — can ease night-time leg cramps.',
    checklist: ['Anomaly scan (18–22 weeks)', 'Blood pressure and urine check', 'Start sleeping with a pillow between your knees'],
  },
  19: {
    week: 19, trimester: 2,
    title: 'Week 19: Senses Developing',
    size: 'Mango', sizeEmoji: '🥭', length: '15.3 cm', weight: '240 g',
    baby: 'The brain regions for smell, taste, hearing, vision and touch are developing in dedicated areas. Vernix, a waxy white coating, begins protecting the skin.',
    mom: 'Round ligament pain — sharp twinges low on the sides when you move suddenly — is common as the uterus grows.',
    tip: 'When round ligament pain strikes, bend towards the pain and hold for a moment. Changing position slowly prevents most of it.',
    symptoms: ['Round ligament pain', 'Hip pain', 'Skin darkening', 'Dizziness', 'Shortness of breath'],
    nutrition: 'Choline supports brain development — eggs are the richest common source, along with dal, soy and peanuts.',
    checklist: ['Anomaly scan if not yet done', 'Discuss scan findings with your doctor', 'Begin thinking about where you want to deliver'],
  },
  20: {
    week: 20, trimester: 2,
    title: 'Week 20: The Halfway Mark',
    size: 'Banana', sizeEmoji: '🍌', length: '25.6 cm', weight: '300 g',
    baby: 'Halfway. Your baby is covered in vernix, is swallowing regularly and is producing meconium — the first stool, which stays inside until birth.',
    mom: 'You should feel kicks by now. Your uterus is at roughly the level of your belly button, which is how fundal height is measured from here on.',
    tip: 'Sleep on your side rather than your back — after 20 weeks the uterus can compress a major vein and reduce blood flow to the placenta.',
    symptoms: ['Regular kicks', 'Heartburn', 'Leg cramps', 'Shortness of breath', 'Stretch marks appearing'],
    nutrition: 'Half your plate as vegetables and fruit keeps fibre, folate and potassium up while weight gain accelerates.',
    checklist: ['Anomaly scan results reviewed', 'Fundal height measured at each visit from now', 'Consider booking antenatal classes'],
  },
  21: {
    week: 21, trimester: 2,
    title: 'Week 21: Tasting Your Food',
    size: 'Carrot', sizeEmoji: '🥕', length: '26.7 cm', weight: '360 g',
    baby: 'Taste buds are working, and flavours from what you eat pass into the amniotic fluid. Bone marrow begins making blood cells.',
    mom: 'Movements grow stronger and more regular. You may notice your baby is more active when you lie down to rest.',
    tip: 'Eating varied flavours now may make your baby more accepting of those tastes later — one small argument for not living on bland food.',
    symptoms: ['Stronger kicks', 'Braxton Hicks starting', 'Greasy skin or acne', 'Varicose veins', 'Swollen ankles'],
    nutrition: 'Vitamin K and calcium support the bone marrow and skeleton — greens, curd and paneer are easy daily sources.',
    checklist: ['Routine antenatal visit', 'Elevate your legs daily if ankles swell', 'Start noting your baby\'s active times'],
  },
  22: {
    week: 22, trimester: 2,
    title: 'Week 22: Looking Like a Newborn',
    size: 'Spaghetti squash', sizeEmoji: '🎃', length: '27.8 cm', weight: '430 g',
    baby: 'Your baby now looks like a miniature newborn — with eyebrows, eyelashes and fine hair — just thinner, with skin still wrinkled and translucent.',
    mom: 'Your bump is unmistakable now. Backache and heartburn are the two most common complaints of this stretch.',
    tip: 'For heartburn, eat earlier in the evening and prop the head of your bed rather than lying flat right after eating.',
    symptoms: ['Heartburn', 'Backache', 'Stretch marks', 'Belly button popping out', 'Increased discharge'],
    nutrition: 'Smaller, more frequent meals reduce reflux far more effectively than cutting out foods you enjoy.',
    checklist: ['Routine check-up', 'Ask about the glucose test coming at 24–28 weeks', 'Look into a maternity support belt if your back aches'],
  },
  23: {
    week: 23, trimester: 2,
    title: 'Week 23: Hearing You Clearly',
    size: 'Grapefruit', sizeEmoji: '🍊', length: '28.9 cm', weight: '501 g',
    baby: 'Your baby hears loud outside sounds and may startle at them. Blood vessels in the lungs are developing to prepare for breathing.',
    mom: 'You may notice swelling in your feet and ankles by the end of the day, which is normal — sudden swelling of face or hands is not.',
    tip: 'Learn the difference now: gradual, end-of-day ankle swelling is expected. Sudden puffiness of face and hands with headache needs same-day medical review.',
    symptoms: ['Ankle swelling', 'Braxton Hicks', 'Snoring', 'Darkened skin patches', 'Faster heartbeat'],
    nutrition: 'Reduce added salt and processed snacks to help with swelling, and drink more water rather than less.',
    checklist: ['Routine antenatal visit', 'Blood pressure check', 'Prepare for the glucose tolerance test'],
  },
  24: {
    week: 24, trimester: 2,
    title: 'Week 24: Viability Milestone',
    size: 'Ear of corn', sizeEmoji: '🌽', length: '30 cm', weight: '600 g',
    baby: 'Lungs are developing branches and producing surfactant, which allows air sacs to inflate. This week marks the point where survival outside the womb becomes possible with intensive care.',
    mom: 'You may experience Braxton Hicks — irregular, painless practice contractions — and itchy skin over your stretching belly.',
    tip: 'Moisturise your belly daily to soothe itching. Severe itching of the palms and soles, especially at night, needs a liver check rather than a cream.',
    symptoms: ['Braxton Hicks contractions', 'Itchy stretching skin', 'Blurred vision', 'Backache', 'Leg cramps'],
    nutrition: 'This is the glucose screening window — keep meals balanced with fibre and protein rather than sugar-heavy snacks.',
    checklist: ['Glucose tolerance test (24–28 weeks)', 'Repeat haemoglobin check', 'Moisturise daily for stretching skin'],
  },
  25: {
    week: 25, trimester: 2,
    title: 'Week 25: Filling Out',
    size: 'Cauliflower', sizeEmoji: '🥦', length: '34.6 cm', weight: '660 g',
    baby: 'Your baby is putting on baby fat, and the wrinkled skin is smoothing out. Hair is growing and now has colour and texture.',
    mom: 'Sleep gets harder as the bump grows. Heartburn, hip pain and needing the bathroom all conspire against a full night.',
    tip: 'A pillow under the bump and another between the knees takes strain off the lower back and hips more than any single pregnancy pillow.',
    symptoms: ['Difficulty sleeping', 'Hip pain', 'Haemorrhoids', 'Restless legs', 'Frequent urination'],
    nutrition: 'Iron matters more than ever as blood volume peaks — pair iron tablets with citrus, and keep tea and coffee away from mealtimes.',
    checklist: ['Complete the glucose test if not done', 'Ask about the Tdap vaccine (27–36 weeks)', 'Start planning your maternity leave handover'],
  },
  26: {
    week: 26, trimester: 2,
    title: 'Week 26: Eyes Open',
    size: 'Lettuce', sizeEmoji: '🥬', length: '35.6 cm', weight: '760 g',
    baby: 'Eyes begin to open, and your baby responds to light and sound with movement. Brainwave activity for hearing and sight is now detectable.',
    mom: 'You are nearing the end of the second trimester. Blood pressure may rise slightly, which is why every visit checks it.',
    tip: 'Learn the warning signs of pre-eclampsia now: severe headache, vision changes, upper abdominal pain and sudden swelling. Together they need urgent review.',
    symptoms: ['Rising blood pressure', 'Braxton Hicks', 'Trouble sleeping', 'Clumsiness', 'Rib discomfort'],
    nutrition: 'Potassium-rich foods like bananas, coconut water and sweet potato support healthy blood pressure.',
    checklist: ['Blood pressure and urine protein check', 'Learn the pre-eclampsia warning signs', 'Book antenatal classes if you want them'],
  },
  27: {
    week: 27, trimester: 2,
    title: 'Week 27: End of Trimester Two',
    size: 'Rutabaga', sizeEmoji: '🧅', length: '36.6 cm', weight: '875 g',
    baby: 'Your baby now sleeps and wakes at regular intervals and may suck their fingers. The lungs are still immature but are practising breathing movements.',
    mom: 'The last week of the second trimester. From here, appointments become more frequent and more focused on growth and position.',
    tip: 'Ask about the Tdap vaccine — given between 27 and 36 weeks, it passes whooping cough antibodies to your baby before birth.',
    symptoms: ['Rib pain', 'Shortness of breath', 'Leg cramps', 'Braxton Hicks', 'Mood changes'],
    nutrition: 'Brain growth accelerates from here — keep up omega-3s, eggs and protein through the third trimester.',
    checklist: ['Tdap vaccine (27–36 weeks)', 'Anti-D injection if you are Rh negative', 'Review glucose test results'],
  },
  28: {
    week: 28, trimester: 3,
    title: 'Week 28: Hello Third Trimester',
    size: 'Eggplant', sizeEmoji: '🍆', length: '37.6 cm', weight: '1 kg',
    baby: 'Your baby can open their eyes, has eyelashes and can dream — REM sleep begins around now. Weight will roughly triple between now and birth.',
    mom: 'You might feel short of breath as your uterus presses on the diaphragm. Visits typically move to every two weeks.',
    tip: 'Start counting kicks daily. Pick a time your baby is usually active, lie on your side, and time how long ten distinct movements take — it should be within two hours.',
    symptoms: ['Shortness of breath', 'Heartburn', 'Swollen feet', 'Trouble sleeping', 'Stronger Braxton Hicks'],
    nutrition: 'Calcium and iron demands peak in the third trimester. Do not skip supplements even if you feel well.',
    checklist: ['Start daily kick counts', 'Anti-D injection if Rh negative', 'Antenatal visits move to every two weeks'],
  },
  29: {
    week: 29, trimester: 3,
    title: 'Week 29: Strong Kicks',
    size: 'Butternut squash', sizeEmoji: '🍠', length: '38.6 cm', weight: '1.15 kg',
    baby: 'Muscles and lungs continue maturing, and the head grows to make room for the developing brain. Kicks are strong enough to be visible from outside.',
    mom: 'Heartburn and constipation often worsen as everything is compressed. Varicose veins and haemorrhoids may appear.',
    tip: 'Any noticeable drop in your baby\'s usual movement pattern deserves a call the same day — never wait until the next morning to see if it improves.',
    symptoms: ['Strong visible kicks', 'Heartburn', 'Constipation', 'Haemorrhoids', 'Fatigue returning'],
    nutrition: 'Fibre and fluids together — one without the other makes constipation worse rather than better.',
    checklist: ['Continue daily kick counts', 'Routine growth and blood pressure check', 'Start assembling your hospital bag list'],
  },
  30: {
    week: 30, trimester: 3,
    title: 'Week 30: Practising to Breathe',
    size: 'Cabbage', sizeEmoji: '🥗', length: '39.9 cm', weight: '1.32 kg',
    baby: 'Your baby practises breathing by moving the diaphragm rhythmically, and the soft lanugo hair starts disappearing as body fat takes over temperature control.',
    mom: 'Fatigue often returns in a way that feels like the first trimester. Mood swings are common as birth becomes real.',
    tip: 'Ten weeks left is the right moment to discuss your birth preferences — pain relief, who will be with you, and what happens if plans change.',
    symptoms: ['Return of fatigue', 'Mood swings', 'Heartburn', 'Backache', 'Braxton Hicks'],
    nutrition: 'Keep meals small and frequent as stomach space shrinks — five or six small meals beats three large ones now.',
    checklist: ['Discuss your birth plan', 'Growth scan if advised', 'Arrange help for the first weeks after birth'],
  },
  31: {
    week: 31, trimester: 3,
    title: 'Week 31: Rapid Brain Growth',
    size: 'Coconut', sizeEmoji: '🥥', length: '41.1 cm', weight: '1.5 kg',
    baby: 'Brain connections are forming rapidly and your baby can process information, track light and signal discomfort. All five senses are working.',
    mom: 'Your breasts may leak colostrum — thick yellowish early milk. Braxton Hicks become more noticeable.',
    tip: 'Learn the difference between practice and real contractions: Braxton Hicks are irregular, ease when you change position, and do not get closer together.',
    symptoms: ['Colostrum leakage', 'Frequent Braxton Hicks', 'Breathlessness', 'Backache', 'Clumsiness'],
    nutrition: 'Protein and healthy fats drive the brain growth spurt happening this month — do not skimp on either.',
    checklist: ['Routine antenatal visit', 'Buy nursing bras and breast pads', 'Confirm your delivery hospital and route'],
  },
  32: {
    week: 32, trimester: 3,
    title: 'Week 32: Getting Ready',
    size: 'Squash', sizeEmoji: '🥔', length: '42.4 cm', weight: '1.7 kg',
    baby: 'Your baby practises breathing and absorbs vital minerals like iron and calcium. Most babies settle head-down around now, though there is still time to turn.',
    mom: 'Lower back pain and frequent urination increase as the baby drops lower into the pelvis.',
    tip: 'Pack your hospital bag now rather than at 38 weeks. Include documents, comfortable clothes, toiletries, and a going-home outfit for the baby.',
    symptoms: ['Lower back pain', 'Frequent urination', 'Trouble sleeping', 'Swollen hands and feet', 'Shortness of breath'],
    nutrition: 'Iron and calcium absorption peaks now as your baby stockpiles both for the first months of life.',
    checklist: ['Pack your hospital bag', 'Growth scan and position check', 'Install and check the car seat if you use one'],
  },
  33: {
    week: 33, trimester: 3,
    title: 'Week 33: Immune Boost',
    size: 'Pineapple', sizeEmoji: '🍍', length: '43.7 cm', weight: '1.9 kg',
    baby: 'Antibodies pass from you to your baby, building an immune system that will protect them in the early months. The skull bones stay soft and separate to ease the journey through the birth canal.',
    mom: 'You may feel breathless and full after small meals as space runs out. Sleep is often broken.',
    tip: 'Rest lying on your left side when you can — it maximises blood flow to the placenta and reduces swelling.',
    symptoms: ['Breathlessness', 'Feeling full quickly', 'Swelling', 'Warm skin', 'Broken sleep'],
    nutrition: 'Vitamin C and zinc support the immune transfer happening now — citrus, guava, capsicum, nuts and seeds.',
    checklist: ['Routine antenatal visit', 'Discuss signs of labour with your doctor', 'Finalise who to call when labour starts'],
  },
  34: {
    week: 34, trimester: 3,
    title: 'Week 34: Nearly Fully Baked',
    size: 'Cantaloupe', sizeEmoji: '🍈', length: '45 cm', weight: '2.15 kg',
    baby: 'The central nervous system and lungs are maturing steadily. Babies born now generally do well, though they may need a little help breathing at first.',
    mom: 'Vision may feel slightly blurry from fluid retention. Visits usually become weekly from around now.',
    tip: 'Know the signs of preterm labour: regular contractions before 37 weeks, low back pressure, fluid leaking or a change in discharge. Do not wait these out at home.',
    symptoms: ['Blurred vision', 'Pelvic pressure', 'Fatigue', 'Braxton Hicks', 'Swelling'],
    nutrition: 'Dates in the last weeks have some evidence for supporting cervical ripening — a reasonable, low-risk addition.',
    checklist: ['Weekly antenatal visits begin', 'Group B Strep swab is due at 35–37 weeks', 'Review the signs of preterm labour'],
  },
  35: {
    week: 35, trimester: 3,
    title: 'Week 35: Running Out of Room',
    size: 'Honeydew melon', sizeEmoji: '🍉', length: '46.2 cm', weight: '2.4 kg',
    baby: 'Kidneys are fully developed and the liver can process some waste. Your baby is curled up tightly now, so movements feel more like rolls and stretches than kicks.',
    mom: 'Movements change in character but should not reduce in frequency — a full-term baby is cramped, not quieter.',
    tip: 'Keep counting kicks right up to birth. "The baby has run out of room" is a myth that delays too many important calls.',
    symptoms: ['Rolling rather than kicking movements', 'Pelvic pressure', 'Frequent urination', 'Insomnia', 'Nesting urge'],
    nutrition: 'Keep hydration high — dehydration can trigger Braxton Hicks that feel alarmingly like the real thing.',
    checklist: ['Group B Strep swab (35–37 weeks)', 'Confirm hospital admission paperwork', 'Finish the hospital bag'],
  },
  36: {
    week: 36, trimester: 3,
    title: 'Week 36: Almost There',
    size: 'Papaya', sizeEmoji: '🥭', length: '47.4 cm', weight: '2.6 kg',
    baby: 'Most systems are fully functional and your baby is gaining around 200 g a week, mostly fat. The head may engage — drop into the pelvis — this week or later.',
    mom: 'You will see your doctor weekly now. You might lose your mucus plug, which can happen days or weeks before labour.',
    tip: 'Review your birth plan with your doctor and make sure the car seat is properly installed. Losing the mucus plug alone is not a reason to go to hospital.',
    symptoms: ['Baby dropping (lightening)', 'Easier breathing', 'More pelvic pressure', 'Mucus plug loss', 'Strong Braxton Hicks'],
    nutrition: 'Eat well and regularly — you want energy reserves for labour, which can be long and unpredictable.',
    checklist: ['Weekly antenatal visits', 'Finalise the birth plan', 'Install the car seat'],
  },
  37: {
    week: 37, trimester: 3,
    title: 'Week 37: Early Term',
    size: 'Winter melon', sizeEmoji: '🥒', length: '48.6 cm', weight: '2.9 kg',
    baby: 'Your baby is early term. The lungs and brain still gain meaningfully in the next three weeks, which is why elective delivery before 39 weeks is usually avoided.',
    mom: 'Labour could start any time from now and still be considered normal. Your cervix may begin to soften and thin.',
    tip: 'Know when to leave for hospital: contractions five minutes apart lasting one minute for one hour, waters breaking, bleeding, or reduced movements.',
    symptoms: ['Cervical changes', 'Increased discharge', 'Diarrhoea', 'Nesting energy', 'Pelvic aching'],
    nutrition: 'Keep light, easily digested snacks available — early labour is much easier with steady energy.',
    checklist: ['Weekly check with cervical assessment', 'Know your route to hospital at any hour', 'Keep your phone charged and documents together'],
  },
  38: {
    week: 38, trimester: 3,
    title: 'Week 38: Any Day Now',
    size: 'Leek', sizeEmoji: '🥬', length: '49.8 cm', weight: '3.1 kg',
    baby: 'Your baby has a firm grasp and continues laying down fat for temperature control. The vernix and lanugo are mostly shed and swallowed.',
    mom: 'Waiting is the hardest part. Swelling, poor sleep and impatience are all completely normal at this stage.',
    tip: 'Real contractions get longer, stronger and closer together and do not stop when you change position or rest. Practice ones do.',
    symptoms: ['Strong pelvic pressure', 'Swollen feet', 'Insomnia', 'Loose stools', 'Cramping'],
    nutrition: 'Stay hydrated and keep meals regular — do not fast in anticipation of labour.',
    checklist: ['Weekly antenatal visit', 'Confirm who will accompany you', 'Rest whenever you can'],
  },
  39: {
    week: 39, trimester: 3,
    title: 'Week 39: Full Term',
    size: 'Mini watermelon', sizeEmoji: '🍉', length: '50.7 cm', weight: '3.3 kg',
    baby: 'Your baby is officially full term — the brain and lungs have reached the maturity they need. The chest becomes more prominent and the skin is now opaque.',
    mom: 'You may notice increased discharge, a bloody show, or a burst of energy. All can precede labour by hours or days.',
    tip: 'Call your doctor immediately if your waters break, whatever the colour — and note the time and the colour, because both matter clinically.',
    symptoms: ['Bloody show', 'Strong contractions coming and going', 'Pelvic pressure', 'Backache', 'Restlessness'],
    nutrition: 'Small, frequent, easy meals. Avoid heavy, greasy food that will not sit well if labour starts.',
    checklist: ['Weekly antenatal visit', 'Keep the hospital bag in the car or by the door', 'Note the time and colour if your waters break'],
  },
  40: {
    week: 40, trimester: 3,
    title: 'Week 40: Meet Your Baby',
    size: 'Small pumpkin', sizeEmoji: '🎃', length: '51.2 cm', weight: '3.5 kg',
    baby: 'Fully developed and ready for the world. Only about 5 in 100 babies arrive on their exact due date — anywhere from 37 to 42 weeks is normal.',
    mom: 'You are likely feeling a mix of exhaustion and excitement. Labour can start at any moment.',
    tip: 'Rest as much as possible. If your waters break or contractions are regular and strong, call your doctor or head to the hospital.',
    symptoms: ['Regular contractions', 'Waters breaking', 'Intense pelvic pressure', 'Bloody show', 'Exhaustion'],
    nutrition: 'Light meals and steady fluids. Your body needs fuel for what may be a long day.',
    checklist: ['Monitoring for post-dates if you pass 40 weeks', 'Discuss induction options after 41 weeks', 'Keep counting movements until birth'],
  },
};

/** Signs that need medical attention the same day, at any stage of pregnancy. */
export const universalWarningSigns: string[] = [
  'Vaginal bleeding or fluid leaking',
  'Severe or persistent headache',
  'Blurred vision, flashing lights or spots',
  'Sudden swelling of the face, hands or feet',
  'Severe pain in the upper abdomen',
  'Fever above 38 °C or chills',
  'Painful or burning urination',
  'Persistent vomiting that stops you keeping fluids down',
];

/**
 * Warning signs relevant to a given week — the universal list, plus movement
 * and preterm-labour signs once they become meaningful.
 */
export function getWarningSigns(week: number): string[] {
  const signs = [...universalWarningSigns];
  if (week >= 24) {
    signs.push('A clear reduction in your baby\'s usual movements');
  }
  if (week >= 20 && week < 37) {
    signs.push('Regular contractions or low back pressure before 37 weeks');
  }
  return signs;
}

export const TOTAL_PREGNANCY_WEEKS = 40;

/**
 * Content for a specific week. Weeks outside 1–40 are clamped to the nearest
 * end, so a post-dates pregnancy still shows week 40 rather than nothing.
 */
export function getKnowledgeForWeek(week: number): WeekKnowledge | null {
  if (!week || week < 1) return null;
  const clamped = Math.min(Math.max(Math.round(week), 1), TOTAL_PREGNANCY_WEEKS);
  return pregnancyKnowledgeBase[clamped] ?? null;
}

export function getTrimesterLabel(trimester: Trimester): string {
  return trimester === 1 ? 'First Trimester' : trimester === 2 ? 'Second Trimester' : 'Third Trimester';
}
