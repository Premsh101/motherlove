export const pregnancyKnowledgeBase: Record<number, { title: string; baby: string; mom: string; tip: string }> = {
  4: {
    title: "Week 4: The Journey Begins",
    baby: "Your baby is the size of a poppy seed. The neural tube (brain and spinal cord) is starting to form.",
    mom: "You might feel early pregnancy symptoms like tender breasts, fatigue, and mild cramping.",
    tip: "Start taking prenatal vitamins with folic acid immediately to support neural tube development."
  },
  8: {
    title: "Week 8: Rapid Growth",
    baby: "Your baby is the size of a raspberry. Tiny fingers and toes are forming, and the heart is beating fast.",
    mom: "Morning sickness and fatigue might peak around this time. Your blood volume is increasing.",
    tip: "Eat small, frequent meals to manage nausea. Stay hydrated with water or ginger tea."
  },
  12: {
    title: "Week 12: End of the First Trimester",
    baby: "Your baby is the size of a plum. Reflexes are developing, and your baby can curl its toes.",
    mom: "Good news! Nausea usually starts to fade, and your energy levels may return soon.",
    tip: "It's a great time to start doing Kegel exercises to strengthen your pelvic floor muscles."
  },
  16: {
    title: "Week 16: The Glow Begins",
    baby: "Your baby is the size of an avocado. Their eyes can perceive light, and they are listening to your voice.",
    mom: "Your 'bump' is likely showing. You might start feeling a 'fluttering' sensation (quickening).",
    tip: "Talk or sing to your belly! Your baby can hear you now. Keep taking short daily walks."
  },
  20: {
    title: "Week 20: The Halfway Mark",
    baby: "Your baby is the size of a banana. They are covered in vernix, a waxy coating protecting their skin.",
    mom: "You should definitely feel kicks by now! Your uterus is at the level of your belly button.",
    tip: "Sleep on your side (preferably left) rather than your back to improve blood flow to the placenta."
  },
  24: {
    title: "Week 24: Viability Milestone",
    baby: "Your baby is the size of an ear of corn. Lungs are developing branches, and footprints are forming.",
    mom: "You may experience Braxton Hicks (practice contractions) and dry, itchy skin on your stretching belly.",
    tip: "Moisturize your belly daily to soothe itching. If you have sudden, severe swelling, contact your doctor."
  },
  28: {
    title: "Week 28: Hello Third Trimester",
    baby: "Your baby is the size of an eggplant. They can open their eyes and have eyelashes.",
    mom: "You might feel short of breath as your growing uterus pushes against your diaphragm.",
    tip: "Start monitoring fetal movements. Sit quietly and count kicks—you should feel 10 movements in 2 hours."
  },
  32: {
    title: "Week 32: Getting Ready",
    baby: "Your baby is the size of a squash. They are practicing breathing and absorbing vital minerals.",
    mom: "You may experience lower back pain and frequent urination as the baby drops lower.",
    tip: "Pack your hospital bag! Include essentials for you, your partner, and the baby's going-home outfit."
  },
  36: {
    title: "Week 36: Almost There",
    baby: "Your baby is the size of a papaya. Most systems are fully functional, and they are gaining fat rapidly.",
    mom: "You will see your doctor weekly now. You might lose your mucus plug soon.",
    tip: "Review your birth plan with your doctor and make sure your baby car seat is properly installed."
  },
  40: {
    title: "Week 40: Meet Your Baby",
    baby: "Your baby is the size of a small pumpkin. They are fully developed and ready for the world!",
    mom: "You are likely feeling a mix of exhaustion and excitement. Labor can start at any moment.",
    tip: "Rest as much as possible. If your water breaks or contractions are regular and strong, call your doctor or head to the hospital."
  }
};

export function getKnowledgeForWeek(week: number) {
  if (!week) return null;
  const milestones = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];
  let closest = 4;
  for (let m of milestones) {
    if (week >= m) closest = m;
  }
  return pregnancyKnowledgeBase[closest];
}
