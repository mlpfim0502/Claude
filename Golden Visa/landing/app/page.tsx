import Link from 'next/link'

// TODO: Replace with actual eligibility tool URL when deployed
const ELIGIBILITY_TOOL_URL = '/check'

// TODO: Replace with actual contact handles
const LINE_URL = 'https://line.me/ti/p/your-line-id'
const WHATSAPP_URL = 'https://wa.me/your-number'

const STEPS = [
  {
    num: '01',
    zh: '免費資格評估',
    en: 'Free eligibility check',
    desc: '填寫簡單表格，3分鐘確認是否符合資格',
  },
  {
    num: '02',
    zh: '文件準備',
    en: 'Document preparation',
    desc: '我們提供完整清單，協助您取得認證文件',
  },
  {
    num: '03',
    zh: '提交申請',
    en: 'Submit application',
    desc: '我們代為整理並提交至UAE移民局',
  },
]

const COMPARISONS = [
  { country: '🇦🇪 UAE 黃金簽證', time: '2–6 週', tax: '0%', sponsor: '不需要', lang: '遠端辦理' },
  { country: '🇨🇦 加拿大 PR', time: '1–3 年', tax: '33%+', sponsor: '需要', lang: '需居住' },
  { country: '🇸🇬 新加坡 EP', time: '3–6 個月', tax: '22%', sponsor: '需要雇主', lang: '現場辦理' },
  { country: '🇺🇸 美國 EB-2', time: '3–10 年', tax: '37%+', sponsor: '需要雇主', lang: '需要律師' },
]

const FAQS = [
  {
    q: '我一定要在UAE工作嗎？',
    a: '不需要。UAE黃金簽證（國際畢業生類別）不要求在UAE就業，您可以繼續在台灣工作，同時持有UAE居留權。',
  },
  {
    q: 'GPA 3.5以下可以申請嗎？',
    a: '國際畢業生類別需要GPA 3.5以上（4.0制）。如果GPA不足，我們也可以評估其他類別，例如投資者、企業家或傑出人才類別。',
  },
  {
    q: '申請費用是多少？',
    a: '政府費用約USD 1,000–2,000不等，我們的服務費請透過LINE/WhatsApp洽詢，提供完整報價。',
  },
  {
    q: '需要親自去UAE嗎？',
    a: '文件準備和申請提交階段不需要親赴UAE。最終步驟（體檢和Emirates ID）需前往UAE，通常可以安排短期出行完成。',
  },
  {
    q: '黃金簽證有效期多久？可以續簽嗎？',
    a: 'UAE黃金簽證有效期為10年，可無限次續簽，條件是保持良好記錄並在有效期前申請續簽。',
  },
  {
    q: 'NTU學位被UAE認可嗎？',
    a: '是的。UAE移民局認可台灣主要大學的學歷，但需要進行文件認證（MOFA公證及UAE大使館認證）。',
  },
]

const TIERS = [
  {
    name: '資格評估',
    nameEn: 'Assessment',
    price: '免費',
    priceEn: 'Free',
    features: ['線上填表評估', '即時結果回饋', '資格說明報告'],
    cta: '立即免費評估',
    ctaHref: ELIGIBILITY_TOOL_URL,
    highlighted: false,
  },
  {
    name: '全程代辦',
    nameEn: 'Full Service',
    price: '洽詢報價',
    priceEn: 'Contact for pricing',
    features: [
      '資格評估',
      '文件清單與指導',
      '文件認證協助',
      '申請書填寫與提交',
      '進度追蹤',
      '專屬客服支援',
    ],
    cta: '聯絡我們',
    ctaHref: '#contact',
    highlighted: true,
  },
]

export default function LandingPage() {
  return (
    <div className="bg-white font-[family-name:var(--font-inter)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-bold text-amber-600 text-lg">🇦🇪 UAE Golden Visa</span>
          <div className="flex items-center gap-3">
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              LINE 諮詢
            </a>
            <a
              href={ELIGIBILITY_TOOL_URL}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
            >
              免費評估資格
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>🎓</span> NTU畢業生專屬服務
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-tight tracking-tight mb-4">
            你的NTU學位
            <br />
            <span className="text-amber-500">可以換10年</span>
            <br />
            的阿聯酋居留權
          </h1>
          <p className="text-xl text-gray-600 mb-3 font-medium">
            Your NTU degree can get you 10-year UAE residency
          </p>
          <p className="text-lg text-gray-500 mb-10">
            免擔保人・免工作・<strong className="text-gray-700">2-6週完成申請</strong>・薪水100%免稅
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href={ELIGIBILITY_TOOL_URL}
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg shadow-amber-200 transition"
            >
              🔍 立即評估我的資格
            </a>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-lg px-8 py-4 rounded-2xl transition"
            >
              💬 LINE免費諮詢
            </a>
          </div>

          <p className="text-sm text-gray-400">* 評估完全免費，無任何義務</p>
        </div>
      </section>

      {/* Why UAE */}
      <section id="why-uae" className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">為什麼選擇UAE？</h2>
            <p className="text-gray-500">Why UAE?</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '💰',
                zh: '薪水100%免稅',
                en: '100% tax-free income',
                desc: '個人所得稅為零，留住更多您辛苦賺來的錢',
              },
              {
                icon: '🏖️',
                zh: '頂級生活品質',
                en: 'Premium lifestyle',
                desc: '世界級基礎設施、安全環境、多元國際社群',
              },
              {
                icon: '⚡',
                zh: '2-6週完成',
                en: 'Done in 2–6 weeks',
                desc: '比其他國家移民快10倍以上，流程簡單',
              },
              {
                icon: '👨‍👩‍👧',
                zh: '攜帶家人同行',
                en: 'Bring your family',
                desc: '配偶、子女都可以納入同一申請案',
              },
              {
                icon: '🚀',
                zh: '無需放棄台灣',
                en: 'Keep your Taiwan base',
                desc: '不需要在UAE工作或長期居住，保留雙重優勢',
              },
              {
                icon: '🔄',
                zh: '10年可續簽',
                en: '10-year renewable',
                desc: '黃金簽證可無限次續簽，長期持有',
              },
            ].map((item) => (
              <div key={item.zh} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-amber-200 transition">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.zh}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.en}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
              與其他國家相比 / Compare with other countries
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">國家</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">申請時間</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">稅率</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">擔保人</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">辦理方式</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COMPARISONS.map((row, i) => (
                    <tr key={row.country} className={i === 0 ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${i === 0 ? 'text-amber-700' : 'text-gray-900'}`}>
                          {row.country}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${i === 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                        {row.time}
                      </td>
                      <td className={`px-4 py-3 font-medium ${i === 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                        {row.tax}
                      </td>
                      <td className={`px-4 py-3 ${i === 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                        {row.sponsor}
                      </td>
                      <td className={`px-4 py-3 ${i === 0 ? 'text-amber-700' : 'text-gray-700'}`}>
                        {row.lang}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner 1 */}
      <section className="py-12 px-4 bg-amber-500">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl font-black text-white mb-4">
            想知道你符合資格嗎？3分鐘立即查看
          </p>
          <a
            href={ELIGIBILITY_TOOL_URL}
            className="inline-flex items-center gap-2 bg-white text-amber-600 font-bold text-lg px-8 py-3 rounded-xl hover:bg-amber-50 transition"
          >
            🔍 免費評估我的資格
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">申請流程</h2>
            <p className="text-gray-500">How it works — 3 simple steps</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-100 text-amber-700 font-black text-xl rounded-2xl mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{step.zh}</h3>
                <p className="text-sm text-gray-500 mb-2">{step.en}</p>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href={ELIGIBILITY_TOOL_URL}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition"
            >
              開始第一步：免費評估
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">服務方案</h2>
            <p className="text-gray-500">Service tiers</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-6 border-2 ${
                  tier.highlighted
                    ? 'border-amber-500 bg-amber-50 shadow-lg shadow-amber-100'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {tier.highlighted && (
                  <div className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    推薦 / Recommended
                  </div>
                )}
                <h3 className="text-xl font-black text-gray-900 mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{tier.nameEn}</p>
                <p className="text-2xl font-bold text-amber-600 mb-5">{tier.price}</p>
                <ul className="space-y-2 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.ctaHref}
                  className={`block text-center font-semibold py-2.5 rounded-xl transition ${
                    tier.highlighted
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {tier.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-2">常見問題</h2>
            <p className="text-gray-500">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="border border-gray-200 rounded-xl p-5 hover:border-amber-200 transition">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-amber-500 to-orange-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-3">準備好了嗎？</h2>
          <p className="text-amber-100 text-lg mb-8">
            立即與我們聯絡，我們將在24小時內回覆您
            <br />
            <span className="text-white/80 text-sm">Contact us — we respond within 24 hours</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href={ELIGIBILITY_TOOL_URL}
              className="inline-flex items-center justify-center gap-2 bg-white text-amber-600 font-bold text-lg px-8 py-4 rounded-2xl hover:bg-amber-50 transition shadow-lg"
            >
              🔍 免費評估資格
            </a>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-2xl transition"
            >
              💬 LINE諮詢
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-2xl transition"
            >
              📱 WhatsApp
            </a>
          </div>

          <p className="text-amber-100 text-sm">
            * 初次諮詢完全免費，無任何購買義務
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          © 2025 UAE Golden Visa Service for NTU Graduates ·{' '}
          <Link href={ELIGIBILITY_TOOL_URL} className="text-amber-400 hover:text-amber-300">
            資格評估
          </Link>
        </p>
        <p className="text-gray-600 text-xs mt-2">
          此網站僅供參考，最終申請結果以UAE移民局審核為準。
        </p>
      </footer>
    </div>
  )
}
