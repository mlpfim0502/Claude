import { PrismaClient, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

const questions = [
  {
    batchYear: 'b10',
    questionNumber: 1,
    stem: "A 45-year-old man presents with acute right lower quadrant pain, fever (38.5°C), and leukocytosis. McBurney's point tenderness is present. What is the MOST likely diagnosis?",
    optionA: "Meckel's diverticulum",
    optionB: 'Acute appendicitis',
    optionC: 'Right ureteral colic',
    optionD: 'Mesenteric adenitis',
    answer: 'B',
    explanation: "Classic presentation of acute appendicitis: RLQ pain migrating from periumbilical area, fever, leukocytosis, and McBurney's point tenderness (1/3 from ASIS to umbilicus).",
    difficulty: 1,
    tags: ['appendicitis', 'acute abdomen'],
  },
  {
    batchYear: 'b10',
    questionNumber: 2,
    stem: 'Which of the following is the MOST common cause of small bowel obstruction in adults?',
    optionA: 'Inguinal hernia',
    optionB: 'Volvulus',
    optionC: 'Adhesions from prior surgery',
    optionD: 'Intussusception',
    answer: 'C',
    explanation: 'Post-operative adhesions account for approximately 60-70% of small bowel obstructions in adults. Hernias are the second most common cause.',
    difficulty: 1,
    tags: ['bowel obstruction', 'adhesions'],
  },
  {
    batchYear: 'b10',
    questionNumber: 3,
    stem: 'A patient presents with hematemesis and is found to have esophageal varices. What is the FIRST-LINE treatment?',
    optionA: 'Surgical portosystemic shunt',
    optionB: 'Endoscopic band ligation + octreotide',
    optionC: 'TIPS procedure',
    optionD: 'Balloon tamponade (Sengstaken-Blakemore)',
    answer: 'B',
    explanation: 'First-line management combines vasoactive agents (octreotide/somatostatin) with endoscopic therapy (band ligation). Balloon tamponade is reserved for refractory bleeding as a bridge.',
    difficulty: 2,
    tags: ['varices', 'GI bleed', 'portal hypertension'],
  },
  {
    batchYear: 'b10',
    questionNumber: 4,
    stem: "What is Courvoisier's sign and what does it suggest?",
    optionA: 'Palpable non-tender gallbladder → pancreatic head cancer',
    optionB: 'Palpable tender gallbladder → acute cholecystitis',
    optionC: "Murphy's sign positive → cholelithiasis",
    optionD: "Cullen's sign → acute pancreatitis",
    answer: 'A',
    explanation: "Courvoisier's law: a palpable, non-tender gallbladder in a jaundiced patient suggests obstruction by pancreatic head malignancy (not gallstones, which cause chronic inflammation/fibrosis of GB wall).",
    difficulty: 2,
    tags: ['jaundice', 'pancreatic cancer', 'gallbladder'],
  },
  {
    batchYear: 'b10',
    questionNumber: 5,
    stem: "Charcot's triad consists of which three findings?",
    optionA: 'Fever, jaundice, RUQ pain',
    optionB: 'Fever, jaundice, altered mental status',
    optionC: 'RUQ pain, nausea, leukocytosis',
    optionD: 'Fever, RUQ pain, hypotension',
    answer: 'A',
    explanation: "Charcot's triad (fever + jaundice + RUQ pain) = acute cholangitis. Reynolds' pentad adds hypotension and altered mental status indicating septic shock.",
    difficulty: 2,
    tags: ['cholangitis', 'biliary'],
  },
  {
    batchYear: 'b10',
    questionNumber: 6,
    stem: "A 60-year-old man with a long history of GERD undergoes endoscopy showing Barrett's esophagus with high-grade dysplasia. What is the recommended management?",
    optionA: 'Increase PPI dose and repeat EGD in 3 months',
    optionB: 'Endoscopic eradication therapy (radiofrequency ablation)',
    optionC: 'Esophagectomy',
    optionD: 'H. pylori eradication',
    answer: 'B',
    explanation: "High-grade dysplasia in Barrett's is treated with endoscopic eradication therapy (EET) — typically radiofrequency ablation ± endoscopic mucosal resection. Esophagectomy is reserved for invasive adenocarcinoma.",
    difficulty: 3,
    tags: ["Barrett's esophagus", 'GERD', 'esophageal cancer'],
  },
  {
    batchYear: 'b10',
    questionNumber: 7,
    stem: 'Which hernia type passes MEDIAL to the inferior epigastric vessels?',
    optionA: 'Indirect inguinal hernia',
    optionB: 'Direct inguinal hernia',
    optionC: 'Femoral hernia',
    optionD: 'Spigelian hernia',
    answer: 'B',
    explanation: "Direct inguinal hernias pass through Hesselbach's triangle, MEDIAL to the inferior epigastric vessels. Indirect hernias pass LATERAL to them through the deep inguinal ring.",
    difficulty: 2,
    tags: ['hernia', 'inguinal', 'anatomy'],
  },
  {
    batchYear: 'b10',
    questionNumber: 8,
    stem: 'What is the MOST common site of peptic ulcer perforation?',
    optionA: 'Posterior wall of the duodenum',
    optionB: 'Anterior wall of the duodenum',
    optionC: 'Lesser curvature of the stomach',
    optionD: 'Gastric antrum',
    answer: 'B',
    explanation: 'Anterior duodenal ulcers perforate into the peritoneal cavity (causing peritonitis). Posterior duodenal ulcers erode into the gastroduodenal artery, causing massive GI bleeding.',
    difficulty: 2,
    tags: ['peptic ulcer', 'perforation', 'duodenum'],
  },
  {
    batchYear: 'b10',
    questionNumber: 9,
    stem: 'A patient develops fever, tachycardia, and wound erythema on post-op day 1 after colectomy. A foul-smelling, gas-forming infection is suspected. What organism is MOST likely?',
    optionA: 'Staphylococcus aureus',
    optionB: 'Clostridium perfringens',
    optionC: 'Pseudomonas aeruginosa',
    optionD: 'Bacteroides fragilis',
    answer: 'B',
    explanation: 'Gas gangrene (clostridial myonecrosis) from C. perfringens presents within 24-48h with rapidly spreading crepitant, foul-smelling wound infection. Requires immediate surgical debridement + IV penicillin.',
    difficulty: 3,
    tags: ['surgical infection', 'clostridium', 'gas gangrene'],
  },
  {
    batchYear: 'b10',
    questionNumber: 10,
    stem: 'The "duct of Wirsung" refers to which structure?',
    optionA: 'Common bile duct',
    optionB: 'Main pancreatic duct',
    optionC: 'Accessory pancreatic duct',
    optionD: 'Cystic duct',
    answer: 'B',
    explanation: 'The main pancreatic duct is the duct of Wirsung. The accessory duct is the duct of Santorini. Both drain into the duodenum; Wirsung joins the CBD at the ampulla of Vater.',
    difficulty: 1,
    tags: ['pancreas', 'anatomy'],
  },
]

async function main() {
  console.log('Seeding database...')

  const subject = await prisma.subject.upsert({
    where: { name: '外科學' },
    update: {},
    create: { name: '外科學' },
  })

  for (const q of questions) {
    await prisma.question.upsert({
      where: { batchYear_questionNumber: { batchYear: q.batchYear, questionNumber: q.questionNumber } },
      update: q,
      create: { ...q, subjectId: subject.id, questionType: QuestionType.MCQ },
    })
  }

  console.log(`Seeded ${questions.length} questions in subject "${subject.name}"`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
