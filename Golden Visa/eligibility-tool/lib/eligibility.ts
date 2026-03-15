export interface EligibilityInput {
  university: string
  graduationYear: number
  gpa: number
  fieldOfStudy: string
}

export interface EligibilityResult {
  eligible: boolean
  reasons: string[]
  reasonsZh: string[]
  nextSteps: string[]
  nextStepsZh: string[]
}

// Top 100 universities known to qualify (partial list covering common applicants)
const TOP_100_UNIVERSITIES_KEYWORDS = [
  'national taiwan university', 'ntu', '台灣大學', '臺灣大學',
  'national tsing hua', 'nthu', '清華',
  'national cheng kung', 'ncku', '成功大學',
  'national yang ming chiao tung', 'nycu', '陽明交通',
  'national chengchi', 'nccu', '政治大學',
  // Global top 100
  'mit', 'massachusetts institute', 'harvard', 'stanford', 'cambridge',
  'oxford', 'imperial', 'ucl', 'eth zurich', 'nus', 'ntu singapore',
  'nanyang', 'peking', 'tsinghua', 'tokyo', 'kyoto', 'seoul national',
  'kaist', 'postech', 'hku', 'hkust', 'cuhk', 'melbourne', 'sydney',
  'monash', 'auckland', 'mcgill', 'toronto', 'ubc', 'yale', 'princeton',
  'columbia', 'penn', 'cornell', 'duke', 'johns hopkins', 'caltech',
  'chicago', 'northwestern', 'michigan', 'nyu', 'carnegie mellon',
  'georgia tech', 'ucla', 'berkeley', 'ucsd', 'usc'
]

function isTop100University(name: string): boolean {
  const lower = name.toLowerCase()
  return TOP_100_UNIVERSITIES_KEYWORDS.some(kw => lower.includes(kw))
}

const CURRENT_YEAR = new Date().getFullYear()

export function assessEligibility(input: EligibilityInput): EligibilityResult {
  const reasons: string[] = []
  const reasonsZh: string[] = []
  let eligible = true

  // Check university ranking
  const universityQualifies = isTop100University(input.university)
  if (!universityQualifies) {
    eligible = false
    reasons.push(`Your university "${input.university}" may not be in the QS/THE/ARWU top 100 list. Please verify your university's current ranking before applying.`)
    reasonsZh.push(`您的大學「${input.university}」可能未在QS/THE/ARWU全球前100名內。請在申請前確認您大學的最新排名。`)
  } else {
    reasons.push(`✓ Your university is recognized in the global top 100 rankings`)
    reasonsZh.push(`✓ 您的大學在全球前100名內，符合資格`)
  }

  // Check GPA
  if (input.gpa < 3.5) {
    eligible = false
    reasons.push(`✗ GPA ${input.gpa.toFixed(2)} is below the required minimum of 3.5/4.0`)
    reasonsZh.push(`✗ GPA ${input.gpa.toFixed(2)} 低於最低要求 3.5/4.0`)
  } else {
    reasons.push(`✓ GPA ${input.gpa.toFixed(2)} meets the minimum requirement of 3.5/4.0`)
    reasonsZh.push(`✓ GPA ${input.gpa.toFixed(2)} 符合最低要求 3.5/4.0`)
  }

  // Check graduation recency (within 2 years)
  const yearsSinceGraduation = CURRENT_YEAR - input.graduationYear
  if (yearsSinceGraduation > 2) {
    eligible = false
    reasons.push(`✗ Graduated ${yearsSinceGraduation} years ago — the requirement is within 2 years of graduation`)
    reasonsZh.push(`✗ 畢業至今 ${yearsSinceGraduation} 年 — 要求為畢業後2年內`)
  } else if (input.graduationYear > CURRENT_YEAR) {
    eligible = false
    reasons.push(`✗ Graduation year ${input.graduationYear} appears to be in the future`)
    reasonsZh.push(`✗ 畢業年份 ${input.graduationYear} 似乎在未來`)
  } else {
    const label = yearsSinceGraduation === 0 ? 'this year' : `${yearsSinceGraduation} year${yearsSinceGraduation > 1 ? 's' : ''} ago`
    const labelZh = yearsSinceGraduation === 0 ? '今年' : `${yearsSinceGraduation}年前`
    reasons.push(`✓ Graduated ${label} — within the 2-year window`)
    reasonsZh.push(`✓ ${labelZh}畢業 — 在2年窗口期內`)
  }

  const nextSteps = eligible
    ? [
        'Prepare your passport (valid 6+ months)',
        'Obtain official degree certificate and transcripts',
        'Get degree attested: NTU → Taiwan MOFA → UAE Embassy → UAE Ministry of Education (4–8 weeks)',
        'Apply online at icp.gov.ae or GDRFA portal',
        'Complete medical fitness test upon UAE entry',
        'Register for Emirates ID (biometrics)',
      ]
    : [
        'Review the eligibility criteria with one of our consultants',
        'Explore alternative UAE visa categories that may suit you',
        'Contact us for a free 15-minute consultation',
      ]

  const nextStepsZh = eligible
    ? [
        '準備護照（有效期6個月以上）',
        '取得官方畢業證書及成績單',
        '辦理學歷認證：NTU → 台灣外交部 → UAE大使館 → UAE教育部（約4–8週）',
        '在 icp.gov.ae 或 GDRFA 入口網站線上申請',
        '入境UAE後完成健康檢查',
        '辦理阿聯酋身份證（Emirates ID）生物特徵登記',
      ]
    : [
        '與我們的顧問審查資格條件',
        '探索其他適合您的阿聯酋簽證類別',
        '聯絡我們獲得免費15分鐘諮詢',
      ]

  return { eligible, reasons, reasonsZh, nextSteps, nextStepsZh }
}
