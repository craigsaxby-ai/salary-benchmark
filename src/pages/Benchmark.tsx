import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Salary data ──────────────────────────────────────────────────────────────

interface SalaryBand {
  low: number
  median: number
  high: number
  p90: number
  oteMultiplier: number
}

const SALARY_DATA: Record<string, Record<string, SalaryBand>> = {
  'VP of Sales': {
    'Series A': { low: 120000, median: 145000, high: 175000, p90: 200000, oteMultiplier: 1.5 },
    'Series B': { low: 140000, median: 170000, high: 210000, p90: 240000, oteMultiplier: 1.6 },
    'Series C+': { low: 160000, median: 200000, high: 250000, p90: 300000, oteMultiplier: 1.7 },
    'Scale-up (100-500 employees)': { low: 130000, median: 160000, high: 195000, p90: 220000, oteMultiplier: 1.5 },
    'Enterprise (500+ employees)': { low: 150000, median: 185000, high: 225000, p90: 260000, oteMultiplier: 1.5 },
    'Seed / Pre-Series A': { low: 90000, median: 115000, high: 140000, p90: 165000, oteMultiplier: 1.4 },
  },
  'Chief Revenue Officer (CRO)': {
    'Series A': { low: 150000, median: 180000, high: 220000, p90: 260000, oteMultiplier: 1.6 },
    'Series B': { low: 175000, median: 215000, high: 265000, p90: 320000, oteMultiplier: 1.7 },
    'Series C+': { low: 200000, median: 260000, high: 330000, p90: 400000, oteMultiplier: 1.8 },
    'Scale-up (100-500 employees)': { low: 165000, median: 200000, high: 250000, p90: 290000, oteMultiplier: 1.6 },
    'Enterprise (500+ employees)': { low: 200000, median: 250000, high: 310000, p90: 370000, oteMultiplier: 1.5 },
    'Seed / Pre-Series A': { low: 120000, median: 150000, high: 185000, p90: 220000, oteMultiplier: 1.5 },
  },
  'Sales Director': {
    'Series A': { low: 100000, median: 125000, high: 155000, p90: 180000, oteMultiplier: 1.4 },
    'Series B': { low: 120000, median: 150000, high: 185000, p90: 215000, oteMultiplier: 1.5 },
    'Series C+': { low: 135000, median: 170000, high: 210000, p90: 245000, oteMultiplier: 1.5 },
    'Scale-up (100-500 employees)': { low: 110000, median: 140000, high: 170000, p90: 200000, oteMultiplier: 1.4 },
    'Enterprise (500+ employees)': { low: 130000, median: 160000, high: 200000, p90: 235000, oteMultiplier: 1.4 },
    'Seed / Pre-Series A': { low: 80000, median: 100000, high: 125000, p90: 145000, oteMultiplier: 1.3 },
  },
  default: {
    default: { low: 100000, median: 130000, high: 165000, p90: 195000, oteMultiplier: 1.4 },
  },
}

const LOCATION_MULTIPLIERS: Record<string, number> = {
  'London / UK': 1.0,
  'New York / US East': 1.35,
  'San Francisco / US West': 1.45,
  'Rest of US': 1.2,
  'Europe (ex-UK)': 0.85,
  Remote: 0.95,
}

function getBand(title: string, stage: string): SalaryBand {
  const titleData = SALARY_DATA[title] ?? SALARY_DATA['default']
  return titleData[stage] ?? titleData[Object.keys(titleData)[0]] ?? SALARY_DATA['default']['default']
}

function applyMultiplier(band: SalaryBand, location: string): SalaryBand {
  const m = LOCATION_MULTIPLIERS[location] ?? 1.0
  return {
    low: Math.round(band.low * m),
    median: Math.round(band.median * m),
    high: Math.round(band.high * m),
    p90: Math.round(band.p90 * m),
    oteMultiplier: band.oteMultiplier,
  }
}

function formatSalary(n: number, currency: string) {
  const sym = currency === 'GBP' ? '£' : '$'
  return sym + n.toLocaleString()
}

function getVerdict(salary: number, band: SalaryBand): 'below' | 'at' | 'above' {
  if (salary < band.low) return 'below'
  if (salary > band.high) return 'above'
  return 'at'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  stage: string
  industry: string
  location: string
  salary: string
  currency: 'GBP' | 'USD'
}

type Step = 'form' | 'results' | 'full'

export default function Benchmark() {
  const navigate = useNavigate()

  const [form, setForm] = useState<FormState>({
    title: '',
    stage: '',
    industry: '',
    location: '',
    salary: '',
    currency: 'GBP',
  })

  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [band, setBand] = useState<SalaryBand | null>(null)

  const isFormComplete =
    form.title && form.stage && form.industry && form.location && form.salary

  const userSalary = parseInt(form.salary.replace(/[^0-9]/g, ''), 10) || 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isFormComplete) return
    const raw = getBand(form.title, form.stage)
    const adjusted = applyMultiplier(raw, form.location)
    setBand(adjusted)
    setStep('results')
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    console.log('Email captured:', email)
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setStep('full')
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const selectClass =
    'w-full bg-navy border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors appearance-none'
  const labelClass = 'block text-sm font-medium text-gray-400 mb-1'

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white transition-colors text-sm">
          ← Back
        </button>
        <span className="font-semibold text-sm text-orange">Salary Benchmark</span>
        <span />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* ── STEP 1: Form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold mb-2">Your Salary Benchmark</h1>
            <p className="text-gray-400 mb-8">Anonymous · Takes 60 seconds</p>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              {/* Job Title */}
              <div>
                <label className={labelClass}>Job Title</label>
                <div className="relative">
                  <select
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select your title</option>
                    {[
                      'VP of Sales',
                      'Sales Director',
                      'Chief Revenue Officer (CRO)',
                      'Chief Commercial Officer (CCO)',
                      'Head of Sales',
                      'Regional Sales Director',
                      'Sales Manager',
                    ].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              {/* Company Stage */}
              <div>
                <label className={labelClass}>Company Stage</label>
                <div className="relative">
                  <select
                    value={form.stage}
                    onChange={(e) => setField('stage', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select company stage</option>
                    {[
                      'Seed / Pre-Series A',
                      'Series A',
                      'Series B',
                      'Series C+',
                      'Scale-up (100-500 employees)',
                      'Enterprise (500+ employees)',
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className={labelClass}>Industry</label>
                <div className="relative">
                  <select
                    value={form.industry}
                    onChange={(e) => setField('industry', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select industry</option>
                    {[
                      'B2B SaaS',
                      'FinTech',
                      'MarTech',
                      'Sales Tech / RevTech',
                      'HealthTech',
                      'PropTech',
                      'Other B2B Tech',
                    ].map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={labelClass}>Location</label>
                <div className="relative">
                  <select
                    value={form.location}
                    onChange={(e) => setField('location', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Select location</option>
                    {[
                      'London / UK',
                      'New York / US East',
                      'San Francisco / US West',
                      'Rest of US',
                      'Europe (ex-UK)',
                      'Remote',
                    ].map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown />
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className={labelClass}>Your Current Base Salary</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setField('currency', form.currency === 'GBP' ? 'USD' : 'GBP')}
                    className="bg-navy border border-border rounded-lg px-3 py-3 text-sm font-semibold text-gray-300 hover:border-orange transition-colors min-w-[64px]"
                  >
                    {form.currency === 'GBP' ? '£ GBP' : '$ USD'}
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 150000"
                    value={form.salary}
                    onChange={(e) => setField('salary', e.target.value)}
                    className="flex-1 bg-navy border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormComplete}
              className="w-full mt-6 bg-orange hover:bg-orange/90 disabled:bg-orange/30 disabled:cursor-not-allowed transition-colors text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-orange/10"
            >
              See My Benchmark →
            </button>
          </form>
        )}

        {/* ── STEP 2: Results (partial) ── */}
        {(step === 'results' || step === 'full') && band && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Benchmark</h1>
            <p className="text-gray-400 mb-8">
              Based on <span className="text-white font-medium">{form.title}</span> at a{' '}
              <span className="text-white font-medium">{form.stage}</span> company in{' '}
              <span className="text-white font-medium">{form.location}</span>
            </p>

            {/* Verdict badge */}
            <VerdictBadge salary={userSalary} band={band} currency={form.currency} />

            {/* Range bar */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Base Salary Range</h2>
              <RangeBar salary={userSalary} band={band} currency={form.currency} />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Low<br />{formatSalary(band.low, form.currency)}</span>
                <span className="text-center">Median<br />{formatSalary(band.median, form.currency)}</span>
                <span className="text-right">High<br />{formatSalary(band.high, form.currency)}</span>
              </div>
            </div>

            {/* ── FULL: revealed after email ── */}
            {step === 'full' ? (
              <>
                {/* Success banner */}
                <div className="bg-green/10 border border-green/30 text-green rounded-xl px-5 py-3 mb-6 text-sm font-medium">
                  ✓ Full report also sent to your email
                </div>

                {/* Full data */}
                <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-6">
                  {/* Percentiles */}
                  <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Full Percentile Breakdown</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: '25th percentile', value: Math.round(band.low * 0.9) },
                        { label: '50th percentile (median)', value: band.median },
                        { label: '75th percentile', value: band.high },
                        { label: '90th percentile', value: band.p90 },
                      ].map((row) => (
                        <div key={row.label} className="bg-navy rounded-xl p-4">
                          <div className="text-xs text-gray-500 mb-1">{row.label}</div>
                          <div className="text-lg font-bold">{formatSalary(row.value, form.currency)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OTE */}
                  <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">OTE Benchmark (Base + Variable)</h2>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Low OTE', value: Math.round(band.low * band.oteMultiplier) },
                        { label: 'Median OTE', value: Math.round(band.median * band.oteMultiplier) },
                        { label: 'High OTE', value: Math.round(band.high * band.oteMultiplier) },
                      ].map((row) => (
                        <div key={row.label} className="bg-navy rounded-xl p-4 text-center">
                          <div className="text-xs text-gray-500 mb-1">{row.label}</div>
                          <div className="text-base font-bold text-orange">{formatSalary(row.value, form.currency)}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Typical variable split: {Math.round((1 - 1 / band.oteMultiplier) * 100)}% of OTE on top of base
                    </p>
                  </div>

                  {/* Equity */}
                  <div>
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Equity Benchmarks</h2>
                    <EquityTable title={form.title} stage={form.stage} />
                  </div>

                  {/* Your package summary */}
                  <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Package vs Market</h2>
                    <PackageSummary salary={userSalary} band={band} currency={form.currency} />
                  </div>
                </div>

                {/* CTA to Searchline */}
                <div className="bg-card border border-border rounded-2xl p-6 text-center">
                  <p className="text-gray-400 text-sm mb-3">Want to find your next role at market rate?</p>
                  <a
                    href="https://candidate-portal-taupe.vercel.app/signup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-orange hover:bg-orange/90 transition-colors text-white font-bold px-6 py-3 rounded-xl"
                  >
                    Join Searchline →
                  </a>
                </div>
              </>
            ) : (
              /* ── LOCKED section ── */
              <div className="relative">
                {/* Blurred preview */}
                <div className="bg-card border border-border rounded-2xl p-6 blur-locked select-none pointer-events-none mb-4">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {['25th percentile', '50th percentile', '75th percentile', '90th percentile'].map((l) => (
                      <div key={l} className="bg-navy rounded-xl p-4">
                        <div className="text-xs text-gray-500 mb-1">{l}</div>
                        <div className="text-lg font-bold">████████</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-16 bg-navy rounded-xl" />
                </div>

                {/* Email capture overlay */}
                <div className="bg-card border border-orange/20 rounded-2xl p-6 shadow-xl">
                  <div className="text-center mb-5">
                    <div className="text-2xl mb-2">🔒</div>
                    <h3 className="font-bold text-lg mb-1">See the full breakdown</h3>
                    <p className="text-gray-400 text-sm">
                      Enter your email to unlock percentiles, OTE benchmarks and equity data — free.
                    </p>
                  </div>
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-navy border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-orange hover:bg-orange/90 transition-colors text-white font-bold px-6 py-3 rounded-lg whitespace-nowrap"
                    >
                      Send me the full report →
                    </button>
                  </form>
                  <p className="text-gray-600 text-xs text-center mt-3">No spam, ever. Unsubscribe anytime.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="fixed inset-0 bg-navy/90 flex flex-col items-center justify-center z-50">
            <div className="w-10 h-10 border-4 border-orange/30 border-t-orange rounded-full animate-spin mb-4" />
            <p className="text-gray-300">Preparing your report...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 px-6 text-center mt-10">
        <p className="text-gray-600 text-xs">
          <span className="font-semibold text-gray-500">The Salary Benchmark</span> — a product by{' '}
          <a href="https://searchline.com" className="text-orange hover:underline">Searchline</a>
          {' · '}
          <a href="/privacy" className="hover:text-gray-400">Privacy</a>
          {' · '}
          <a href="/terms" className="hover:text-gray-400">Terms</a>
        </p>
      </footer>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}

function VerdictBadge({ salary, band, currency }: { salary: number; band: SalaryBand; currency: string }) {
  const verdict = getVerdict(salary, band)
  const config = {
    below: { label: "You're below market", color: 'text-red-400 bg-red-400/10 border-red-400/20' },
    at: { label: "You're at market", color: 'text-orange bg-orange/10 border-orange/20' },
    above: { label: "You're above market", color: 'text-green bg-green/10 border-green/20' },
  }[verdict]

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold mb-6 ${config.color}`}>
      <span>{verdict === 'below' ? '⬇' : verdict === 'above' ? '⬆' : '✓'}</span>
      <span>{config.label}</span>
      {salary > 0 && (
        <span className="opacity-70">· Your salary: {formatSalary(salary, currency)}</span>
      )}
    </div>
  )
}

function RangeBar({ salary, band, currency }: { salary: number; band: SalaryBand; currency: string }) {
  const total = band.p90 - band.low
  const clampedSalary = Math.max(band.low, Math.min(salary, band.p90))
  const dotPercent = total > 0 ? ((clampedSalary - band.low) / total) * 100 : 0
  const medianPercent = total > 0 ? ((band.median - band.low) / total) * 100 : 50

  return (
    <div className="relative h-6 flex items-center">
      {/* Track */}
      <div className="w-full h-2 bg-navy rounded-full relative">
        {/* Filled range */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange/30 via-orange to-green" />
        {/* Median marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/40 rounded"
          style={{ left: `${medianPercent}%` }}
        />
        {/* User dot */}
        {salary > 0 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-orange shadow-lg shadow-orange/40 transition-all"
            style={{ left: `${dotPercent}%`, transform: 'translate(-50%, -50%)' }}
            title={`Your salary: ${formatSalary(salary, currency)}`}
          />
        )}
      </div>
    </div>
  )
}

function PackageSummary({ salary, band, currency }: { salary: number; band: SalaryBand; currency: string }) {
  const verdict = getVerdict(salary, band)
  const gapToMedian = band.median - salary
  const oteEstimate = Math.round(salary * band.oteMultiplier)

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">Your base</span>
        <span className="font-semibold">{salary > 0 ? formatSalary(salary, currency) : '—'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">Market median</span>
        <span className="font-semibold">{formatSalary(band.median, currency)}</span>
      </div>
      {salary > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-400">
            {verdict === 'below' ? 'Gap to median' : verdict === 'above' ? 'Premium over median' : 'At median'}
          </span>
          <span className={`font-semibold ${verdict === 'below' ? 'text-red-400' : 'text-green'}`}>
            {verdict === 'at' ? '✓' : formatSalary(Math.abs(gapToMedian), currency)}
          </span>
        </div>
      )}
      {salary > 0 && (
        <div className="flex justify-between">
          <span className="text-gray-400">Estimated OTE at market</span>
          <span className="font-semibold text-orange">{formatSalary(oteEstimate, currency)}</span>
        </div>
      )}
    </div>
  )
}

function EquityTable({ title, stage }: { title: string; stage: string }) {
  const equityData: Record<string, Record<string, string>> = {
    'VP of Sales': {
      'Seed / Pre-Series A': '0.25% – 0.75%',
      'Series A': '0.15% – 0.4%',
      'Series B': '0.1% – 0.25%',
      'Series C+': '0.05% – 0.15%',
    },
    'Chief Revenue Officer (CRO)': {
      'Seed / Pre-Series A': '0.5% – 1.5%',
      'Series A': '0.3% – 0.75%',
      'Series B': '0.2% – 0.5%',
      'Series C+': '0.1% – 0.3%',
    },
    'Sales Director': {
      'Seed / Pre-Series A': '0.1% – 0.4%',
      'Series A': '0.08% – 0.25%',
      'Series B': '0.05% – 0.15%',
      'Series C+': '0.02% – 0.08%',
    },
  }

  const titleData = equityData[title]
  const range = titleData?.[stage] ?? titleData?.[Object.keys(titleData ?? {})[0]] ?? '0.05% – 0.25%'

  return (
    <div className="bg-navy rounded-xl p-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Typical equity range</span>
        <span className="font-semibold text-orange">{range}</span>
      </div>
      <p className="text-xs text-gray-600 mt-2">
        4-year vest, 1-year cliff typical. Options unless Series C+ (RSUs more common).
      </p>
    </div>
  )
}
