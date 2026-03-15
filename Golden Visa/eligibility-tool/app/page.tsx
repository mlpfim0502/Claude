'use client'

import { useState } from 'react'
import { assessEligibility, EligibilityResult } from '@/lib/eligibility'

type Lang = 'zh' | 'en'

const t = {
  zh: {
    title: '阿聯酋黃金簽證資格評估',
    subtitle: '你的學位可以換10年阿聯酋居留權嗎？',
    tagline: '免擔保人・免工作・2–6週完成申請・薪水100%免稅',
    university: '大學名稱',
    universityPlaceholder: '例如：國立台灣大學',
    graduationYear: '畢業年份',
    gpa: 'GPA（4.0制）',
    gpaPlaceholder: '例如：3.7',
    fieldOfStudy: '主修科系',
    fieldPlaceholder: '例如：電機工程',
    checkBtn: '立即評估資格',
    eligible: '🎉 恭喜！您符合資格',
    notEligible: '暫時不符合資格',
    eligibleDesc: '根據您提供的資料，您可能符合UAE黃金簽證（國際畢業生類別）的申請資格。',
    notEligibleDesc: '根據您提供的資料，目前可能不符合UAE黃金簽證申請資格。但請聯絡我們確認，因為您可能符合其他類別。',
    reasons: '評估詳情',
    nextSteps: '下一步',
    learnMore: '免費取得完整申請指南',
    leadName: '您的姓名（選填）',
    leadEmail: '電子郵件',
    leadEmailPlaceholder: '請輸入您的電子郵件',
    sendBtn: '取得免費指南',
    thankYou: '✅ 感謝您！我們將盡快與您聯絡。',
    contactLine: '也可直接透過 LINE / WhatsApp 聯絡我們',
    switchLang: 'English',
    disclaimer: '* 此評估工具僅供參考，最終資格需經官方審核確認。',
    benefit1: '10年居留權，可攜帶家人',
    benefit2: '薪水零稅率',
    benefit3: '無需當地擔保人',
    benefit4: '申請僅需2–6週',
    benefit5: '比加拿大/新加坡/美國更快速',
  },
  en: {
    title: 'UAE Golden Visa Eligibility Check',
    subtitle: 'Can your degree unlock 10-year UAE residency?',
    tagline: 'No sponsor · No local job · 2–6 weeks · 100% tax-free income',
    university: 'University Name',
    universityPlaceholder: 'e.g. National Taiwan University',
    graduationYear: 'Graduation Year',
    gpa: 'GPA (out of 4.0)',
    gpaPlaceholder: 'e.g. 3.7',
    fieldOfStudy: 'Field of Study',
    fieldPlaceholder: 'e.g. Electrical Engineering',
    checkBtn: 'Check My Eligibility',
    eligible: '🎉 Congratulations! You may be eligible',
    notEligible: 'Not Currently Eligible',
    eligibleDesc: 'Based on your information, you may qualify for the UAE Golden Visa under the International Graduate pathway.',
    notEligibleDesc: 'Based on your information, you may not currently meet the UAE Golden Visa criteria. Contact us — you might qualify under a different category.',
    reasons: 'Assessment Details',
    nextSteps: 'Next Steps',
    learnMore: 'Get Your Free Application Guide',
    leadName: 'Your Name (optional)',
    leadEmail: 'Email Address',
    leadEmailPlaceholder: 'Enter your email',
    sendBtn: 'Send Me the Guide',
    thankYou: '✅ Thank you! We will be in touch shortly.',
    contactLine: 'Or contact us via LINE / WhatsApp',
    switchLang: '中文',
    disclaimer: '* This tool provides an indicative assessment only. Final eligibility is subject to official review.',
    benefit1: '10-year residency with family sponsorship',
    benefit2: 'Zero income tax',
    benefit3: 'No local sponsor required',
    benefit4: 'Application takes just 2–6 weeks',
    benefit5: 'Faster than Canada / Singapore / US',
  },
}

const CURRENT_YEAR = new Date().getFullYear()

export default function Home() {
  const [lang, setLang] = useState<Lang>('zh')
  const tx = t[lang]

  const [university, setUniversity] = useState('')
  const [graduationYear, setGraduationYear] = useState<string>(String(CURRENT_YEAR))
  const [gpa, setGpa] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [result, setResult] = useState<EligibilityResult | null>(null)

  const [email, setEmail] = useState('')
  const [leadName, setLeadName] = useState('')
  const [leadSent, setLeadSent] = useState(false)
  const [leadError, setLeadError] = useState('')
  const [leadLoading, setLeadLoading] = useState(false)

  function handleCheck(e: React.FormEvent) {
    e.preventDefault()
    const gpaNum = parseFloat(gpa)
    if (!university || !gpa || isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4) return
    const r = assessEligibility({
      university,
      graduationYear: parseInt(graduationYear),
      gpa: gpaNum,
      fieldOfStudy,
    })
    setResult(r)
    setLeadSent(false)
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLeadLoading(true)
    setLeadError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: leadName,
          university,
          graduationYear: parseInt(graduationYear),
          gpa: parseFloat(gpa),
          fieldOfStudy,
          eligible: result?.eligible,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setLeadSent(true)
    } catch {
      setLeadError(lang === 'zh' ? '提交失敗，請再試一次。' : 'Submission failed. Please try again.')
    } finally {
      setLeadLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest opacity-80 mb-0.5">UAE Golden Visa</div>
            <h1 className="text-lg font-bold leading-tight">{tx.title}</h1>
          </div>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="text-sm bg-white/20 hover:bg-white/30 transition px-3 py-1.5 rounded-full font-medium"
          >
            {tx.switchLang}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Hero */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-800">{tx.subtitle}</h2>
          <p className="text-amber-700 font-medium text-sm">{tx.tagline}</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 gap-2">
          {[tx.benefit1, tx.benefit2, tx.benefit3, tx.benefit4, tx.benefit5].map((b, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-amber-100">
              <span className="text-amber-500 text-lg">✦</span>
              <span className="text-gray-700 text-sm">{b}</span>
            </div>
          ))}
        </div>

        {/* Eligibility Form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <form onSubmit={handleCheck} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{tx.university} *</label>
              <input
                type="text"
                required
                value={university}
                onChange={e => setUniversity(e.target.value)}
                placeholder={tx.universityPlaceholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{tx.graduationYear} *</label>
                <select
                  value={graduationYear}
                  onChange={e => setGraduationYear(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{tx.gpa} *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  required
                  value={gpa}
                  onChange={e => setGpa(e.target.value)}
                  placeholder={tx.gpaPlaceholder}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{tx.fieldOfStudy}</label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={e => setFieldOfStudy(e.target.value)}
                placeholder={tx.fieldPlaceholder}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold py-4 rounded-xl transition text-base shadow-md"
            >
              {tx.checkBtn}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div
            id="result-section"
            className={`rounded-2xl shadow-md border p-6 space-y-4 ${result.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
          >
            <div>
              <h3 className={`text-xl font-bold ${result.eligible ? 'text-green-700' : 'text-red-700'}`}>
                {result.eligible ? tx.eligible : tx.notEligible}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {result.eligible ? tx.eligibleDesc : tx.notEligibleDesc}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">{tx.reasons}</h4>
              <ul className="space-y-1.5">
                {(lang === 'zh' ? result.reasonsZh : result.reasons).map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 bg-white/70 rounded-lg px-3 py-2">{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-gray-700 mb-2">{tx.nextSteps}</h4>
              <ol className="space-y-1.5 list-decimal list-inside">
                {(lang === 'zh' ? result.nextStepsZh : result.nextSteps).map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 bg-white/70 rounded-lg px-3 py-2">{s}</li>
                ))}
              </ol>
            </div>

            {/* Lead Capture */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-bold text-gray-800 mb-3">{tx.learnMore}</h4>
              {leadSent ? (
                <p className="text-green-700 font-medium text-sm">{tx.thankYou}</p>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <input
                    type="text"
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    placeholder={tx.leadName}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder={tx.leadEmailPlaceholder}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  {leadError && <p className="text-red-600 text-xs">{leadError}</p>}
                  <button
                    type="submit"
                    disabled={leadLoading}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition text-sm disabled:opacity-60"
                  >
                    {leadLoading ? '...' : tx.sendBtn}
                  </button>
                </form>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 mb-2">{tx.contactLine}</p>
                <div className="flex gap-2 justify-center">
                  <a
                    href="https://line.me/ti/p/~goldenvisatw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                  >
                    LINE
                  </a>
                  <a
                    href="https://wa.me/85212345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center pb-4">{tx.disclaimer}</p>
      </div>
    </main>
  )
}
