import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    'Seed / Pre-Series A': { low: 75000, median: 85000, high: 100000, p90: 115000, oteMultiplier: 1.6 },
    'Series A':            { low: 95000, median: 110000, high: 125000, p90: 145000, oteMultiplier: 1.7 },
    'Series B':            { low: 115000, median: 130000, high: 150000, p90: 170000, oteMultiplier: 1.7 },
    'Series C+':           { low: 140000, median: 160000, high: 185000, p90: 210000, oteMultiplier: 1.8 },
    'Scale-up (100-500 employees)': { low: 145000, median: 165000, high: 190000, p90: 215000, oteMultiplier: 1.7 },
    'Enterprise (500+ employees)':  { low: 160000, median: 190000, high: 220000, p90: 250000, oteMultiplier: 1.5 },
    'PE-backed':                    { low: 155000, median: 185000, high: 215000, p90: 245000, oteMultiplier: 1.6 },
    'Privately owned (non-PE)':     { low: 130000, median: 155000, high: 180000, p90: 205000, oteMultiplier: 1.5 },
    'Listed / Public (IPO)':        { low: 165000, median: 195000, high: 230000, p90: 265000, oteMultiplier: 1.5 },
  },
  'Chief Revenue Officer (CRO)': {
    'Seed / Pre-Series A': { low: 90000, median: 110000, high: 135000, p90: 155000, oteMultiplier: 1.6 },
    'Series A':            { low: 110000, median: 130000, high: 150000, p90: 175000, oteMultiplier: 1.6 },
    'Series B':            { low: 140000, median: 155000, high: 180000, p90: 210000, oteMultiplier: 1.7 },
    'Series C+':           { low: 165000, median: 195000, high: 225000, p90: 265000, oteMultiplier: 1.7 },
    'Scale-up (100-500 employees)': { low: 175000, median: 205000, high: 235000, p90: 275000, oteMultiplier: 1.6 },
    'Enterprise (500+ employees)':  { low: 200000, median: 240000, high: 285000, p90: 330000, oteMultiplier: 1.5 },
    'PE-backed':                    { low: 195000, median: 235000, high: 280000, p90: 325000, oteMultiplier: 1.6 },
    'Privately owned (non-PE)':     { low: 165000, median: 200000, high: 240000, p90: 280000, oteMultiplier: 1.4 },
    'Listed / Public (IPO)':        { low: 210000, median: 255000, high: 305000, p90: 360000, oteMultiplier: 1.5 },
  },
  'Sales Director': {
    'Seed / Pre-Series A': { low: 45000, median: 55000, high: 70000, p90: 82000, oteMultiplier: 1.5 },
    'Series A':            { low: 60000, median: 72000, high: 85000, p90: 98000, oteMultiplier: 1.5 },
    'Series B':            { low: 72000, median: 84000, high: 100000, p90: 115000, oteMultiplier: 1.6 },
    'Series C+':           { low: 85000, median: 100000, high: 120000, p90: 138000, oteMultiplier: 1.6 },
    'Scale-up (100-500 employees)': { low: 90000, median: 108000, high: 128000, p90: 145000, oteMultiplier: 1.5 },
    'Enterprise (500+ employees)':  { low: 105000, median: 125000, high: 148000, p90: 168000, oteMultiplier: 1.5 },
    'PE-backed':                    { low: 100000, median: 120000, high: 142000, p90: 162000, oteMultiplier: 1.5 },
    'Privately owned (non-PE)':     { low: 85000, median: 105000, high: 128000, p90: 148000, oteMultiplier: 1.4 },
    'Listed / Public (IPO)':        { low: 108000, median: 128000, high: 152000, p90: 175000, oteMultiplier: 1.5 },
  },
  'Chief Commercial Officer (CCO)': {
    'Seed / Pre-Series A': { low: 72000, median: 83000, high: 100000, p90: 115000, oteMultiplier: 1.4 },
    'Series A':            { low: 90000, median: 107000, high: 125000, p90: 145000, oteMultiplier: 1.5 },
    'Series B':            { low: 112000, median: 132000, high: 150000, p90: 170000, oteMultiplier: 1.5 },
    'Series C+':           { low: 140000, median: 162000, high: 188000, p90: 215000, oteMultiplier: 1.5 },
    'Scale-up (100-500 employees)': { low: 148000, median: 170000, high: 198000, p90: 225000, oteMultiplier: 1.5 },
    'Enterprise (500+ employees)':  { low: 168000, median: 210000, high: 255000, p90: 295000, oteMultiplier: 1.4 },
    'PE-backed':                    { low: 162000, median: 200000, high: 242000, p90: 282000, oteMultiplier: 1.5 },
    'Privately owned (non-PE)':     { low: 140000, median: 175000, high: 215000, p90: 250000, oteMultiplier: 1.3 },
    'Listed / Public (IPO)':        { low: 175000, median: 220000, high: 268000, p90: 310000, oteMultiplier: 1.4 },
  },
  'Head of Sales': {
    'Seed / Pre-Series A': { low: 55000, median: 65000, high: 82000, p90: 95000, oteMultiplier: 1.5 },
    'Series A':            { low: 70000, median: 82000, high: 98000, p90: 112000, oteMultiplier: 1.6 },
    'Series B':            { low: 85000, median: 98000, high: 115000, p90: 132000, oteMultiplier: 1.6 },
    'Series C+':           { low: 100000, median: 116000, high: 135000, p90: 155000, oteMultiplier: 1.6 },
    'Scale-up (100-500 employees)': { low: 108000, median: 125000, high: 145000, p90: 165000, oteMultiplier: 1.5 },
    'Enterprise (500+ employees)':  { low: 125000, median: 145000, high: 168000, p90: 190000, oteMultiplier: 1.5 },
    'PE-backed':                    { low: 118000, median: 138000, high: 160000, p90: 182000, oteMultiplier: 1.5 },
    'Privately owned (non-PE)':     { low: 100000, median: 120000, high: 142000, p90: 162000, oteMultiplier: 1.4 },
    'Listed / Public (IPO)':        { low: 128000, median: 150000, high: 175000, p90: 198000, oteMultiplier: 1.5 },
  },
  'Regional Sales Director': {
    'Seed / Pre-Series A': { low: 55000, median: 68000, high: 82000, p90: 95000, oteMultiplier: 1.5 },
    'Series A':            { low: 70000, median: 85000, high: 100000, p90: 115000, oteMultiplier: 1.6 },
    'Series B':            { low: 85000, median: 100000, high: 118000, p90: 135000, oteMultiplier: 1.6 },
    'Series C+':           { low: 100000, median: 118000, high: 140000, p90: 160000, oteMultiplier: 1.6 },
    'Scale-up (100-500 employees)': { low: 105000, median: 122000, high: 145000, p90: 165000, oteMultiplier: 1.5 },
    'Enterprise (500+ employees)':  { low: 120000, median: 142000, high: 168000, p90: 192000, oteMultiplier: 1.5 },
    'PE-backed':                    { low: 115000, median: 135000, high: 160000, p90: 185000, oteMultiplier: 1.5 },
    'Privately owned (non-PE)':     { low: 98000, median: 118000, high: 142000, p90: 165000, oteMultiplier: 1.4 },
    'Listed / Public (IPO)':        { low: 122000, median: 145000, high: 172000, p90: 198000, oteMultiplier: 1.5 },
  },
  'Sales Manager': {
    'Seed / Pre-Series A': { low: 38000, median: 48000, high: 60000, p90: 70000, oteMultiplier: 1.4 },
    'Series A':            { low: 45000, median: 57000, high: 70000, p90: 82000, oteMultiplier: 1.5 },
    'Series B':            { low: 52000, median: 65000, high: 80000, p90: 92000, oteMultiplier: 1.5 },
    'Series C+':           { low: 60000, median: 75000, high: 92000, p90: 108000, oteMultiplier: 1.5 },
    'Scale-up (100-500 employees)': { low: 62000, median: 78000, high: 95000, p90: 110000, oteMultiplier: 1.5 },
    'Enterprise (500+ employees)':  { low: 70000, median: 88000, high: 108000, p90: 125000, oteMultiplier: 1.4 },
    'PE-backed':                    { low: 68000, median: 85000, high: 104000, p90: 120000, oteMultiplier: 1.4 },
    'Privately owned (non-PE)':     { low: 58000, median: 73000, high: 90000, p90: 105000, oteMultiplier: 1.3 },
    'Listed / Public (IPO)':        { low: 72000, median: 90000, high: 110000, p90: 128000, oteMultiplier: 1.4 },
  },
  'SDR Manager': {
    'Seed / Pre-Series A': { low: 35000, median: 45000, high: 58000, p90: 68000, oteMultiplier: 1.35 },
    'Series A':            { low: 42000, median: 52000, high: 65000, p90: 75000, oteMultiplier: 1.4 },
    'Series B':            { low: 48000, median: 60000, high: 74000, p90: 85000, oteMultiplier: 1.4 },
    'Series C+':           { low: 55000, median: 68000, high: 82000, p90: 95000, oteMultiplier: 1.35 },
    'Scale-up (100-500 employees)': { low: 55000, median: 68000, high: 83000, p90: 95000, oteMultiplier: 1.35 },
    'Enterprise (500+ employees)':  { low: 62000, median: 75000, high: 90000, p90: 105000, oteMultiplier: 1.3 },
    'PE-backed':                    { low: 58000, median: 72000, high: 87000, p90: 100000, oteMultiplier: 1.3 },
    'Privately owned (non-PE)':     { low: 48000, median: 60000, high: 74000, p90: 85000, oteMultiplier: 1.3 },
    'Listed / Public (IPO)':        { low: 62000, median: 76000, high: 92000, p90: 107000, oteMultiplier: 1.3 },
  },
  'Revenue Director': {
    'Seed / Pre-Series A': { low: 70000, median: 85000, high: 100000, p90: 115000, oteMultiplier: 1.6 },
    'Series A':            { low: 85000, median: 100000, high: 118000, p90: 135000, oteMultiplier: 1.6 },
    'Series B':            { low: 100000, median: 118000, high: 140000, p90: 160000, oteMultiplier: 1.65 },
    'Series C+':           { low: 120000, median: 145000, high: 170000, p90: 195000, oteMultiplier: 1.65 },
    'Scale-up (100-500 employees)': { low: 125000, median: 148000, high: 175000, p90: 200000, oteMultiplier: 1.6 },
    'Enterprise (500+ employees)':  { low: 145000, median: 175000, high: 205000, p90: 235000, oteMultiplier: 1.55 },
    'PE-backed':                    { low: 140000, median: 170000, high: 200000, p90: 230000, oteMultiplier: 1.6 },
    'Privately owned (non-PE)':     { low: 118000, median: 142000, high: 168000, p90: 192000, oteMultiplier: 1.5 },
    'Listed / Public (IPO)':        { low: 150000, median: 180000, high: 215000, p90: 248000, oteMultiplier: 1.5 },
  },
  'Enterprise Account Executive': {
    'Seed / Pre-Series A': { low: 60000, median: 72000, high: 88000, p90: 100000, oteMultiplier: 1.8 },
    'Series A':            { low: 70000, median: 84000, high: 100000, p90: 115000, oteMultiplier: 1.9 },
    'Series B':            { low: 80000, median: 96000, high: 115000, p90: 130000, oteMultiplier: 1.9 },
    'Series C+':           { low: 95000, median: 112000, high: 132000, p90: 150000, oteMultiplier: 2.0 },
    'Scale-up (100-500 employees)': { low: 98000, median: 115000, high: 135000, p90: 155000, oteMultiplier: 1.9 },
    'Enterprise (500+ employees)':  { low: 110000, median: 130000, high: 155000, p90: 178000, oteMultiplier: 1.8 },
    'PE-backed':                    { low: 105000, median: 125000, high: 148000, p90: 170000, oteMultiplier: 1.8 },
    'Privately owned (non-PE)':     { low: 88000, median: 105000, high: 125000, p90: 145000, oteMultiplier: 1.7 },
    'Listed / Public (IPO)':        { low: 112000, median: 132000, high: 158000, p90: 182000, oteMultiplier: 1.8 },
  },
  'Strategic Account Executive': {
    'Seed / Pre-Series A': { low: 75000, median: 92000, high: 110000, p90: 126000, oteMultiplier: 2.0 },
    'Series A':            { low: 88000, median: 108000, high: 128000, p90: 148000, oteMultiplier: 2.0 },
    'Series B':            { low: 100000, median: 120000, high: 142000, p90: 162000, oteMultiplier: 2.1 },
    'Series C+':           { low: 115000, median: 138000, high: 162000, p90: 185000, oteMultiplier: 2.1 },
    'Scale-up (100-500 employees)': { low: 118000, median: 142000, high: 168000, p90: 192000, oteMultiplier: 2.0 },
    'Enterprise (500+ employees)':  { low: 130000, median: 158000, high: 188000, p90: 218000, oteMultiplier: 2.0 },
    'PE-backed':                    { low: 125000, median: 152000, high: 182000, p90: 210000, oteMultiplier: 2.0 },
    'Privately owned (non-PE)':     { low: 108000, median: 132000, high: 158000, p90: 182000, oteMultiplier: 1.9 },
    'Listed / Public (IPO)':        { low: 135000, median: 162000, high: 192000, p90: 222000, oteMultiplier: 2.0 },
  },
  'default': {
    'default': { low: 80000, median: 105000, high: 135000, p90: 158000, oteMultiplier: 1.5 },
  },
}

const LOCATION_MULTIPLIERS: Record<string, number> = {
  'London / UK': 1.0,
  'New York / US East': 1.4,
  'San Francisco / US West': 1.5,
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
  if (salary < band.median * 0.9) return 'below'
  if (salary > band.median * 1.1) return 'above'
  return 'at'
}

// ─── Component ────────────────────────────────────────────────────────────────

interface FormState {
  title: string
  stage: string
  industry: string
  location: string
  salary: string
  ote: string
  currency: 'GBP' | 'USD'
  gender: string
  equityType: string
  vestingSchedule: string
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
    ote: '',
    currency: 'GBP',
    gender: '',
    equityType: '',
    vestingSchedule: '',
  })

  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [band, setBand] = useState<SalaryBand | null>(null)

  const isFormComplete =
    form.title && form.stage && form.industry && form.location && form.salary

  const userSalary = parseInt(form.salary.replace(/[^0-9]/g, ''), 10) || 0
  const userOte = parseInt(form.ote.replace(/[^0-9]/g, ''), 10) || 0

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
    // Persist lead to Supabase — fire-and-forget, non-blocking
    if (supabase) {
      supabase.from('benchmark_leads').insert({
        email,
        job_title: form.title,
        company_stage: form.stage,
        industry: form.industry,
        location: form.location,
        current_salary: form.salary,
        current_ote: form.ote || null,
        currency: form.currency,
        gender: form.gender || null,
        equity_type: form.equityType || null,
        vesting_schedule: form.vestingSchedule || null,
      }).then(({ error }) => {
        if (error) console.error('[benchmark] lead save failed:', error)
        else console.log('[benchmark] lead saved')
      })
    }
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
                      'Chief Revenue Officer (CRO)',
                      'Chief Commercial Officer (CCO)',
                      'VP of Sales',
                      'Revenue Director',
                      'Head of Sales',
                      'Sales Director',
                      'Regional Sales Director',
                      'Sales Manager',
                      'SDR Manager',
                      'Enterprise Account Executive',
                      'Strategic Account Executive',
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
                    <optgroup label="Venture-backed">
                      {['Seed / Pre-Series A','Series A','Series B','Series C+','Scale-up (100-500 employees)'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Established">
                      {['Enterprise (500+ employees)','PE-backed','Privately owned (non-PE)','Listed / Public (IPO)'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown />
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className={labelClass}>Gender</label>
                <div className="relative">
                  <select
                    value={form.gender}
                    onChange={(e) => setField('gender', e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
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

              {/* OTE */}
              <div>
                <label className={labelClass}>
                  Current Total OTE{' '}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <p className="text-xs text-gray-500 mb-2">Base + variable/bonus — leave blank if salary only</p>
                <div className="flex gap-2">
                  <div className="bg-navy border border-border rounded-lg px-3 py-3 text-sm font-semibold text-gray-500 min-w-[64px] flex items-center justify-center">
                    {form.currency === 'GBP' ? '£ GBP' : '$ USD'}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 200,000"
                    value={form.ote}
                    onChange={(e) => setField('ote', e.target.value)}
                    className="flex-1 bg-navy border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange transition-colors"
                  />
                </div>
              </div>

              {/* Equity / Shares */}
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-semibold text-white mb-3">Shares & Equity <span className="text-gray-500 font-normal text-xs">(optional)</span></p>

                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Equity Type</label>
                    <div className="relative">
                      <select value={form.equityType} onChange={(e) => setField('equityType', e.target.value)} className={selectClass}>
                        <option value="">Select equity type</option>
                        <option value="Stock Options (EMI)">Stock Options (EMI)</option>
                        <option value="Stock Options (Non-EMI)">Stock Options (Non-EMI)</option>
                        <option value="RSUs (Restricted Stock Units)">RSUs (Restricted Stock Units)</option>
                        <option value="Phantom Shares">Phantom Shares</option>
                        <option value="Growth Shares">Growth Shares</option>
                        <option value="Co-invest / MBO Equity">Co-invest / MBO Equity (PE)</option>
                        <option value="None">No equity</option>
                      </select>
                      <ChevronDown />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Vesting Schedule</label>
                    <div className="relative">
                      <select value={form.vestingSchedule} onChange={(e) => setField('vestingSchedule', e.target.value)} className={selectClass}>
                        <option value="">Select vesting schedule</option>
                        <option value="4-year vest, 1-year cliff">4-year vest, 1-year cliff (standard)</option>
                        <option value="3-year vest, 1-year cliff">3-year vest, 1-year cliff</option>
                        <option value="3-year vest, 6-month cliff">3-year vest, 6-month cliff</option>
                        <option value="2-year vest, no cliff">2-year vest, no cliff</option>
                        <option value="1-year vest, fully accelerated">1-year vest, fully accelerated</option>
                        <option value="Immediate vest">Immediate vest</option>
                        <option value="Not applicable">Not applicable</option>
                      </select>
                      <ChevronDown />
                    </div>
                  </div>
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

        {/* ── STEP 2: Teaser + Email Gate ── */}
        {step === 'results' && band && (
          <div>
            {/* Role summary line */}
            <p className="text-sm text-gray-400 mb-5">
              Based on{' '}
              <span className="text-white font-medium">{form.title}</span>
              {' · '}
              <span className="text-white font-medium">{form.stage}</span>
              {' · '}
              <span className="text-white font-medium">{form.location}</span>
            </p>

            {/* Verdict pill — no salary numbers */}
            <VerdictPill salary={userSalary} band={band} />

            {/* Blurred preview of the report */}
            <div className="relative mt-6 mb-4 overflow-hidden rounded-2xl">
              <div className="bg-card border border-border rounded-2xl p-6 blur-[6px] select-none pointer-events-none">
                <div className="h-3 bg-navy rounded mb-4 w-2/3" />
                <div className="h-6 bg-navy rounded mb-6" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-navy rounded-xl p-4">
                      <div className="h-2 bg-gray-700 rounded mb-2 w-2/3" />
                      <div className="h-5 bg-gray-600 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent rounded-2xl" />
            </div>

            {/* Email capture */}
            <div className="bg-card border border-orange/20 rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-5">
                <h3 className="font-bold text-lg mb-1">Your salary report is ready.</h3>
                <p className="text-gray-400 text-sm">
                  Enter your email below to unlock your personalised benchmark.
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
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
                    Unlock my report →
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  By submitting, you agree to receive your salary report and occasional career insights from Searchline. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        )}

        {/* ── STEP 3: Full Results (revealed after email) ── */}
        {step === 'full' && band && (
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Benchmark</h1>
            <p className="text-gray-400 mb-8">
              Based on <span className="text-white font-medium">{form.title}</span> at a{' '}
              <span className="text-white font-medium">{form.stage}</span> company in{' '}
              <span className="text-white font-medium">{form.location}</span>
            </p>

            {/* Success banner */}
            <div className="bg-green/10 border border-green/30 text-green rounded-xl px-5 py-3 mb-6 text-sm font-medium">
              ✓ Full report also sent to your email
            </div>

            {/* Underpaid Verdict — top of results */}
            <UnderpaidVerdict salary={userSalary} ote={userOte} band={band} currency={form.currency} />

            {/* Range bar */}
            <div className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-6">
              {/* Base salary row */}
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-6">Base Salary Range</h2>
                <RangeBar salary={userSalary} band={band} currency={form.currency} />
              </div>

              {/* OTE row */}
              {userOte > 0 ? (
                <div>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">OTE Benchmark</h2>
                  <p className="text-xs text-gray-500 mb-4">
                    Market OTE for your role:{' '}
                    <span className="text-gray-300">{formatSalary(Math.round(band.low * band.oteMultiplier), form.currency)}</span>
                    {' — '}
                    <span className="text-gray-300">{formatSalary(Math.round(band.high * band.oteMultiplier), form.currency)}</span>
                    {' (median: '}
                    <span className="text-orange font-semibold">{formatSalary(Math.round(band.median * band.oteMultiplier), form.currency)}</span>
                    {')'}
                  </p>
                  <RangeBar
                    salary={userOte}
                    band={{
                      low: Math.round(band.low * band.oteMultiplier),
                      median: Math.round(band.median * band.oteMultiplier),
                      high: Math.round(band.high * band.oteMultiplier),
                      p90: Math.round(band.p90 * band.oteMultiplier),
                      oteMultiplier: band.oteMultiplier,
                    }}
                    currency={form.currency}
                    isOte
                  />
                  <OteVerdictBadge userOte={userOte} band={band} currency={form.currency} />
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Add your OTE above to see how your variable pay compares →
                </p>
              )}
            </div>

            {/* Pay Component Breakdown */}
            <PayComponentBreakdown
              salary={userSalary}
              ote={userOte}
              band={band}
              currency={form.currency}
              equityType={form.equityType}
            />

            {/* Similar Profiles */}
            <SimilarProfiles
              title={form.title}
              stage={form.stage}
              location={form.location}
              salary={userSalary}
              ote={userOte}
              band={band}
              currency={form.currency}
            />

            {/* Percentile visualizer — base salary */}
            <PercentileVisualizer
              salary={userSalary}
              band={band}
              currency={form.currency}
              isOte={false}
            />

            {/* Percentile visualizer — OTE */}
            {userOte > 0 && (
              <PercentileVisualizer
                salary={userOte}
                band={band}
                currency={form.currency}
                isOte
              />
            )}

            {/* Equity + package */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Equity Benchmarks</h2>
                <EquityTable title={form.title} stage={form.stage} />
              </div>
              <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Package vs Market</h2>
                <PackageSummary salary={userSalary} band={band} currency={form.currency} />
              </div>
            </div>

            {/* Why Join Searchline */}
            <div className="bg-[#0A0F1E] border border-[#1E2740] rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-bold mb-6">Why join Searchline?</h2>
              <div className="space-y-5">
                {[
                  {
                    icon: '🤖',
                    title: 'Talk to Erica, our AI career coach',
                    desc: "Have a 10-minute conversation about your career goals. Erica learns what you want and matches you to opportunities you'd actually want — not just any role.",
                  },
                  {
                    icon: '🎯',
                    title: 'Get matched, not spammed',
                    desc: 'We only reach out when a role genuinely fits your profile. No recruitment noise. Just relevant opportunities from companies looking for someone exactly like you.',
                  },
                  {
                    icon: '📊',
                    title: 'Your career, always on record',
                    desc: 'Every achievement, course, and win in one place. Erica uses it to find you better opportunities and help you prepare for interviews.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="font-semibold text-sm mb-1">{item.title}</div>
                      <div className="text-gray-400 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="https://candidate-portal-taupe.vercel.app/signup"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-6 bg-orange hover:bg-orange/90 transition-colors text-white font-bold text-center py-3 rounded-xl"
              >
                Talk to Erica — it's free →
              </a>
              <p className="text-xs text-gray-500 text-center mt-2">
                Join thousands of senior sales professionals already on Searchline
              </p>
            </div>

            {/* Data disclaimer */}
            <div className="bg-[#0A0F1E] border border-[#1E2740] rounded-xl p-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-600 text-gray-500 text-[10px] font-bold leading-none">i</span>
                <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wide">About this data</h3>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Benchmarks are based on our initial survey of 150+ B2B sales leaders and publicly available compensation data from published salary guides and industry research. Data covers B2B SaaS and tech roles in the UK and US.
              </p>
              <p className="text-gray-500 text-xs leading-relaxed mt-2">
                Updated quarterly. Individual salaries vary based on company performance, equity, location within region, and negotiation.
              </p>
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

            {/* Feedback section */}
            <div className="bg-card border border-border rounded-2xl p-6 mt-6">
              <h2 className="text-lg font-bold mb-1">Your feedback is important</h2>
              <p className="text-gray-400 text-sm mb-4">
                What else would you like to know? If we like your idea we'll build it for you and let you know once it's ready to review.
              </p>
              {feedbackSent ? (
                <div className="bg-green/10 border border-green/30 rounded-xl px-4 py-3 text-green text-sm font-medium text-center">
                  ✓ Thanks for your feedback — we'll be in touch if we build it!
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!feedbackText.trim()) return
                    if (supabase) {
                      await supabase.from('benchmark_feedback').insert({
                        email: email || null,
                        feedback: feedbackText.trim(),
                        job_title: form.title || null,
                        company_stage: form.stage || null,
                      }).then(({ error }) => {
                        if (error) console.error('[feedback] save failed:', error)
                      })
                    }
                    setFeedbackSent(true)
                  }}
                  className="flex flex-col gap-3"
                >
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="e.g. I'd love to see bonus structures, pension contributions, or a comparison by gender..."
                    rows={4}
                    className="w-full bg-navy border border-border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange transition-colors resize-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!feedbackText.trim()}
                    className="self-end bg-orange hover:bg-orange/90 disabled:bg-orange/30 disabled:cursor-not-allowed transition-colors text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
                  >
                    Send feedback →
                  </button>
                </form>
              )}
            </div>
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

function VerdictPill({ salary, band }: { salary: number; band: SalaryBand }) {
  const verdict = getVerdict(salary, band)
  const config = {
    below: { label: "You're below market", color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: '⬇' },
    at: { label: "You're at market", color: 'text-orange bg-orange/10 border-orange/20', icon: '✓' },
    above: { label: "You're above market", color: 'text-green bg-green/10 border-green/20', icon: '⬆' },
  }[verdict]

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full px-4 py-2 text-sm font-semibold mb-2 ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  )
}

function RangeBar({ salary, band, currency, isOte = false }: { salary: number; band: SalaryBand; currency: string; isOte?: boolean }) {
  const scaleMin = isOte ? 80000 : 50000
  const scaleMax = isOte ? 1000000 : 400000
  const span = scaleMax - scaleMin

  const pct = (v: number) => Math.min(100, Math.max(0, ((v - scaleMin) / span) * 100))

  const dotPos = salary > 0 ? pct(salary) : -1

  // Subtle tick marks at each percentile — no labels (avoids overlap)
  const p75 = Math.round((band.median + band.high) / 2)
  const tickPositions = [pct(band.low), pct(band.median), pct(p75), pct(band.p90)]

  return (
    <div className="mb-8">
      {/* Bar */}
      <div className="relative h-3 rounded-full bg-gradient-to-r from-red-500 via-orange to-green">
        {/* Subtle tick marks — no labels */}
        {tickPositions.map((pos, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-px bg-white/15"
            style={{ left: `${pos}%` }}
          />
        ))}
        {/* User dot + value callout */}
        {dotPos >= 0 && (
          <div
            className="absolute"
            style={{ left: `${dotPos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            {/* Callout label above dot */}
            <div
              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#1a2e3d] border border-orange/40 rounded-md px-2 py-0.5 whitespace-nowrap text-xs font-semibold text-white shadow"
            >
              {formatSalary(salary, currency)}
            </div>
            <div className="w-5 h-5 rounded-full bg-white border-2 border-orange shadow-lg shadow-orange/40" />
          </div>
        )}
      </div>

      {/* Scale endpoints */}
      <div className="flex justify-between text-[10px] text-gray-600 mt-2">
        <span>{formatSalary(scaleMin, currency)}</span>
        <span>{formatSalary(scaleMax, currency)}</span>
      </div>
    </div>
  )
}

// ─── Ordinal helper ─────────────────────────────────────────────────────────

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ─── Percentile calculator ────────────────────────────────────────────────────

function calcPercentile(salary: number, band: SalaryBand, scaleMin: number, scaleMax: number): number {
  if (salary <= 0) return 0
  const p75 = Math.round((band.median + band.high) / 2)
  if (salary < band.low)    return Math.max(1,  Math.round((salary - scaleMin) / (band.low - scaleMin) * 25))
  if (salary < band.median) return Math.round(25 + ((salary - band.low)    / (band.median - band.low))  * 25)
  if (salary < p75)         return Math.round(50 + ((salary - band.median) / (p75 - band.median))       * 25)
  if (salary < band.p90)   return Math.round(75 + ((salary - p75)          / (band.p90 - p75))          * 15)
  return Math.min(99, Math.round(90 + ((salary - band.p90) / (scaleMax - band.p90)) * 9))
}

// ─── Percentile Visualizer ────────────────────────────────────────────────────

function PercentileVisualizer({
  salary, band, currency, isOte = false,
}: {
  salary: number; band: SalaryBand; currency: string; isOte?: boolean
}) {
  const scaleMin = isOte ? 80000  : 50000
  const scaleMax = isOte ? 1000000 : 400000
  const span = scaleMax - scaleMin
  const pct  = (v: number) => Math.min(100, Math.max(0, ((v - scaleMin) / span) * 100))

  const p75        = Math.round((band.median + band.high) / 2)
  const oteBand    = isOte ? {
    low: Math.round(band.low * band.oteMultiplier),
    median: Math.round(band.median * band.oteMultiplier),
    high: Math.round(band.high * band.oteMultiplier),
    p90: Math.round(band.p90 * band.oteMultiplier),
    oteMultiplier: band.oteMultiplier,
  } : band
  const activeBand = isOte ? oteBand : band
  const activeP75  = isOte ? Math.round((oteBand.median + oteBand.high) / 2) : p75

  const percentile = calcPercentile(salary, activeBand, scaleMin, scaleMax)
  const dotPos     = salary > 0 ? pct(salary) : -1

  const markers = [
    { label: '25th', value: activeBand.low },
    { label: '50th', value: activeBand.median },
    { label: '75th', value: activeP75 },
    { label: '90th', value: activeBand.p90 },
  ]

  const contextText =
    percentile >= 90 ? `Top ${100 - percentile}% — exceptional for your role and stage`
    : percentile >= 75 ? `You're ahead of ${percentile}% of professionals in this role`
    : percentile >= 50 ? `Above the median — solid positioning for your stage`
    : percentile >= 25 ? `Below market median — room to negotiate`
    : `Below the 25th percentile — significantly under market rate`

  const percentileColour =
    percentile >= 75 ? 'text-green' : percentile >= 50 ? 'text-orange' : 'text-red-400'

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        {isOte ? 'Your OTE Percentile' : 'Your Salary Percentile'}
      </p>

      {salary > 0 ? (
        <>
          {/* Big number + context */}
          <div className="flex items-end gap-4 mb-1">
            <span className={`text-7xl font-black leading-none ${percentileColour}`}>
              {ordinal(percentile)}
            </span>
            <div className="mb-2 leading-snug">
              <div className="text-white font-semibold text-sm">percentile</div>
              <div className="text-gray-500 text-xs">for your role &amp; stage</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-6">{contextText}</p>

          {/* Gradient bar */}
          <div className="relative h-3 rounded-full bg-gradient-to-r from-red-500 via-orange to-green mb-2">
            {markers.map((m) => (
              <div
                key={m.label}
                className="absolute top-0 bottom-0 w-px bg-white/15"
                style={{ left: `${pct(m.value)}%` }}
              />
            ))}
            {/* Glowing user dot */}
            <div
              className="absolute w-5 h-5 rounded-full bg-white border-2 border-orange"
              style={{
                left: `${dotPos}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 4px rgba(253,128,46,0.25), 0 0 12px 4px rgba(253,128,46,0.4)',
              }}
            />
          </div>

          {/* Scale endpoints */}
          <div className="flex justify-between text-[10px] text-gray-600 mb-5">
            <span>{formatSalary(scaleMin, currency)}</span>
            <span>{formatSalary(scaleMax, currency)}</span>
          </div>

          {/* Reference row — 4 percentile values */}
          <div className="grid grid-cols-4 gap-2">
            {markers.map((m) => (
              <div key={m.label} className="bg-navy rounded-xl p-3 text-center">
                <div className="text-[10px] text-gray-500 mb-1">{m.label}</div>
                <div className="text-xs font-bold text-gray-300 whitespace-nowrap">
                  {formatSalary(m.value, currency)}
                </div>
              </div>
            ))}
          </div>
          {isOte && (
            <p className="text-[10px] text-gray-600 mt-3">
              OTE = Base + on-target variable/bonus. Assumes standard commission structure.
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-600 text-sm">Enter your {isOte ? 'OTE' : 'salary'} to see your percentile ranking.</p>
      )}
    </div>
  )
}

// ─── Package Summary ─────────────────────────────────────────────────────────

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

function OteVerdictBadge({ userOte, band, currency }: { userOte: number; band: SalaryBand; currency: string }) {
  const oteLow = Math.round(band.low * band.oteMultiplier)
  const oteHigh = Math.round(band.high * band.oteMultiplier)
  const verdict: 'below' | 'at' | 'above' = userOte < oteLow ? 'below' : userOte > oteHigh ? 'above' : 'at'
  const config = {
    below: { label: 'Your OTE is below market', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: '⬇' },
    at: { label: 'Your OTE is at market', color: 'text-orange bg-orange/10 border-orange/20', icon: '✓' },
    above: { label: 'Your OTE is above market', color: 'text-green bg-green/10 border-green/20', icon: '⬆' },
  }[verdict]

  return (
    <div className={`inline-flex items-center gap-2 border rounded-full px-3 py-1.5 text-xs font-semibold mt-3 ${config.color}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
      <span className="opacity-70">· Your OTE: {formatSalary(userOte, currency)}</span>
    </div>
  )
}

// ─── Underpaid Verdict ───────────────────────────────────────────────────────

function UnderpaidVerdict({
  salary, ote, band, currency,
}: {
  salary: number; ote: number; band: SalaryBand; currency: string
}) {
  const marketBase = band.median
  const marketOte  = Math.round(band.median * band.oteMultiplier)

  type Verdict = 'underpaid' | 'at' | 'above'
  const classify = (user: number, market: number): Verdict | null => {
    if (user <= 0) return null
    const r = user / market
    if (r < 0.85) return 'underpaid'
    if (r > 1.15) return 'above'
    return 'at'
  }

  const baseVerdict  = classify(salary, marketBase)
  const oteVerdict   = classify(ote, marketOte)

  const headlines: Record<string, string> = {
    'underpaid-null':     'You appear to be underpaid on base salary.',
    'underpaid-underpaid':'You appear to be underpaid on both base salary and OTE.',
    'underpaid-at':       'You appear to be underpaid on base salary, but competitive on OTE.',
    'underpaid-above':    'Your base salary is below market, but your OTE is above average.',
    'at-null':            'Your base salary is at market rate.',
    'at-at':              'Your compensation is broadly in line with market rate.',
    'at-underpaid':       'Your base salary is at market, but your OTE is below the typical range.',
    'at-above':           'Your base is at market and your OTE is above average — strong package.',
    'above-null':         'Your base salary is above market rate — well positioned.',
    'above-above':        'Both your base and OTE are above market rate — excellent package.',
    'above-at':           'Your base salary is above market, with OTE at the typical rate.',
    'above-underpaid':    'Your base is above market, but your variable pay is below typical for your role.',
  }

  const key = `${baseVerdict ?? 'null'}-${oteVerdict ?? 'null'}`
  const headline = headlines[key] ?? 'Your compensation has been benchmarked against current market data.'

  const overallVerdict: Verdict =
    (baseVerdict === 'underpaid' || oteVerdict === 'underpaid') ? 'underpaid' :
    (baseVerdict === 'above' && (oteVerdict === 'above' || oteVerdict === null)) ? 'above' : 'at'

  const border   = overallVerdict === 'underpaid' ? 'border-red-400/50' : overallVerdict === 'above' ? 'border-green/50' : 'border-orange/50'
  const heading  = overallVerdict === 'underpaid' ? 'text-red-400'      : overallVerdict === 'above' ? 'text-green'      : 'text-orange'
  const bg       = overallVerdict === 'underpaid' ? 'bg-red-400/5'      : overallVerdict === 'above' ? 'bg-green/5'      : 'bg-orange/5'

  const pillCfg = (v: Verdict | null) =>
    v === 'underpaid' ? { color: 'text-red-400 bg-red-400/10 border-red-400/20',  icon: '↓' } :
    v === 'above'     ? { color: 'text-green bg-green/10 border-green/20',        icon: '↑' } :
    v === 'at'        ? { color: 'text-orange bg-orange/10 border-orange/20',     icon: '≈' } :
                        { color: 'text-gray-500 bg-gray-500/10 border-gray-500/20', icon: '—' }

  const basePill = pillCfg(baseVerdict)
  const otePill  = pillCfg(oteVerdict)

  const totalSalary = ote > 0 ? ote : salary
  const totalMarket = ote > 0 ? marketOte : marketBase
  const totalPill   = pillCfg(classify(totalSalary, totalMarket))

  return (
    <div className={`${bg} border ${border} rounded-2xl p-6 mb-6`}>
      <h2 className={`text-xl font-bold mb-2 ${heading}`}>{headline}</h2>
      <p className="text-gray-400 text-sm mb-4">
        Benchmark: {formatSalary(marketBase, currency)} median base · {formatSalary(marketOte, currency)} median OTE
      </p>
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold ${basePill.color}`}>
          <span>{basePill.icon}</span> Base
        </span>
        <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold ${otePill.color}`}>
          <span>{otePill.icon}</span> OTE{ote === 0 ? ' (not entered)' : ''}
        </span>
        <span className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold ${totalPill.color}`}>
          <span>{totalPill.icon}</span> Total Package
        </span>
      </div>
    </div>
  )
}

// ─── Pay Component Breakdown ──────────────────────────────────────────────────

function PayComponentBreakdown({
  salary, ote, band, currency, equityType,
}: {
  salary: number; ote: number; band: SalaryBand; currency: string; equityType: string
}) {
  const marketBase     = band.median
  const marketOte      = Math.round(band.median * band.oteMultiplier)
  const marketVariable = marketOte - marketBase
  const userVariable   = ote > 0 ? ote - salary : null
  const estimatedOte   = ote === 0 && salary > 0 ? Math.round(salary * band.oteMultiplier) : null

  type Status = 'Above' | 'At market' | 'Below' | 'N/A'
  const statusCfg: Record<Status, string> = {
    'Above':    'text-green bg-green/10 border-green/20',
    'At market':'text-orange bg-orange/10 border-orange/20',
    'Below':    'text-red-400 bg-red-400/10 border-red-400/20',
    'N/A':      'text-gray-500 bg-gray-500/10 border-gray-500/20',
  }

  const getStatus = (user: number | null, market: number): Status => {
    if (user === null || user <= 0) return 'N/A'
    const r = user / market
    if (r < 0.85) return 'Below'
    if (r > 1.15) return 'Above'
    return 'At market'
  }

  const gapPct = (user: number, market: number) => {
    const d = ((user - market) / market) * 100
    return (d > 0 ? '+' : '') + d.toFixed(1) + '%'
  }

  const baseStatus     = getStatus(salary > 0 ? salary : null, marketBase)
  const variableStatus = getStatus(userVariable, marketVariable)
  const oteStatus      = getStatus(ote > 0 ? ote : (estimatedOte ?? null), marketOte)

  const baseRatio = salary > 0 ? salary / marketBase : null
  const oteRatio  = ote > 0    ? ote / marketOte      : null

  const verdictLine =
    baseRatio === null ? 'Enter your salary to see a full breakdown.' :
    baseRatio < 0.85 && oteRatio !== null && oteRatio >= 0.85
      ? 'Your OTE is competitive, but your base salary is slightly below the typical range for similar roles.' :
    baseRatio < 0.85
      ? 'Your base salary is below market for this role and stage — there may be room to negotiate.' :
    baseRatio > 1.15
      ? 'Your base salary is above the market median — you are well positioned.' :
      'Your compensation is broadly in line with the market for this role and stage.'

  const Row = ({
    label, userValue, marketValue, status, note,
  }: {
    label: string
    userValue: React.ReactNode
    marketValue: React.ReactNode
    status: Status
    note?: React.ReactNode
  }) => (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-gray-300 font-medium">{label}</span>
      <span className="text-sm text-white font-semibold text-right min-w-[90px]">{userValue}</span>
      <span className="text-xs text-gray-500 text-right min-w-[90px]">{marketValue}{note}</span>
      <span className={`text-[10px] font-semibold border rounded-full px-2 py-0.5 whitespace-nowrap ${statusCfg[status]}`}>
        {status}
      </span>
    </div>
  )

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">Pay Component Breakdown</h2>
      <p className="text-xs text-gray-500 mb-4">Your package vs market across each component</p>

      <div className="mb-1">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 pb-1.5 mb-1 border-b border-border">
          <span className="text-[10px] text-gray-600 uppercase tracking-wide">Component</span>
          <span className="text-[10px] text-gray-600 uppercase tracking-wide text-right min-w-[90px]">Yours</span>
          <span className="text-[10px] text-gray-600 uppercase tracking-wide text-right min-w-[90px]">Market median</span>
          <span className="text-[10px] text-gray-600 uppercase tracking-wide">Status</span>
        </div>

        <Row
          label="Base Salary"
          userValue={salary > 0 ? formatSalary(salary, currency) : '—'}
          marketValue={formatSalary(marketBase, currency)}
          status={baseStatus}
          note={salary > 0 ? <span className="text-gray-600 ml-1">({gapPct(salary, marketBase)})</span> : undefined}
        />
        <Row
          label="Variable / Commission"
          userValue={userVariable !== null ? formatSalary(userVariable, currency) : <span className="text-gray-600 text-xs">— Not provided</span>}
          marketValue={formatSalary(marketVariable, currency)}
          status={variableStatus}
        />
        <Row
          label="Total OTE"
          userValue={ote > 0
            ? formatSalary(ote, currency)
            : estimatedOte
              ? <span className="text-gray-500 text-xs">~{formatSalary(estimatedOte, currency)} (est.)</span>
              : '—'}
          marketValue={formatSalary(marketOte, currency)}
          status={oteStatus}
        />
        <Row
          label="Equity"
          userValue={<span className="text-xs text-gray-400">{equityType || 'Not specified'}</span>}
          marketValue={<span className="text-xs">Varies by stage</span>}
          status="N/A"
        />
        <Row
          label="Benefits / Pension"
          userValue={<span className="text-xs text-gray-500">—</span>}
          marketValue={<span className="text-xs">5–8% pension, car allowance varies</span>}
          status="N/A"
        />
      </div>

      <p className="text-xs text-gray-500 italic mt-3 pt-3 border-t border-border/40">{verdictLine}</p>
    </div>
  )
}

// ─── Similar Profiles ─────────────────────────────────────────────────────────

function SimilarProfiles({
  title, stage, location, band, currency,
}: {
  title: string; stage: string; location: string; salary: number; ote: number; band: SalaryBand; currency: string
}) {
  const teamSizeMap: Record<string, string> = {
    'Seed / Pre-Series A': '5–20 people',
    'Series A': '20–80 people',
    'Series B': '50–200 people',
    'Series C+': '150–500 people',
    'Scale-up (100-500 employees)': '100–500 people',
    'Enterprise (500+ employees)': '500+ people',
    'PE-backed': '50–500 people',
    'Privately owned (non-PE)': 'Varies',
    'Listed / Public (IPO)': '500+ people',
  }

  const getPeerGroup = (t: string): string => {
    const ic       = ['Enterprise Account Executive', 'Strategic Account Executive', 'SDR Manager', 'Sales Manager']
    const senior   = ['Chief Revenue Officer (CRO)', 'Chief Commercial Officer (CCO)', 'VP of Sales', 'Revenue Director']
    const commercial = ['Sales Director', 'Head of Sales', 'Regional Sales Director']
    if (ic.includes(t))         return 'Individual contributor / front-line management'
    if (senior.includes(t))     return 'Senior sales leadership'
    if (commercial.includes(t)) return 'Commercial leadership'
    return 'Sales leadership'
  }

  const getProfileCount = (t: string, s: string): number => {
    const base: Record<string, number> = {
      'Sales Manager': 220,
      'Sales Director': 180,
      'Head of Sales': 160,
      'VP of Sales': 120,
      'Regional Sales Director': 100,
      'Enterprise Account Executive': 140,
      'Strategic Account Executive': 80,
      'SDR Manager': 110,
      'Revenue Director': 75,
      'Chief Revenue Officer (CRO)': 60,
      'Chief Commercial Officer (CCO)': 45,
    }
    const mult: Record<string, number> = {
      'Series A': 1.3, 'Series B': 1.2, 'Series C+': 1.1,
      'Scale-up (100-500 employees)': 1.0, 'Enterprise (500+ employees)': 0.9,
      'Seed / Pre-Series A': 0.7, 'PE-backed': 0.8,
      'Privately owned (non-PE)': 0.85, 'Listed / Public (IPO)': 0.6,
    }
    return Math.round((base[t] ?? 80) * (mult[s] ?? 1.0))
  }

  const isDefault      = !SALARY_DATA[title]
  const teamSize       = teamSizeMap[stage] ?? 'Varies'
  const peerGroup      = getPeerGroup(title)
  const profileCount   = getProfileCount(title, stage)
  const medianBase     = band.median
  const medianOte      = Math.round(band.median * band.oteMultiplier)

  const attrs = [
    { label: 'Role',      value: title || 'Not specified' },
    { label: 'Stage',     value: stage || 'Not specified' },
    { label: 'Location',  value: location || 'Not specified' },
    { label: 'Team size', value: teamSize },
    { label: 'Peer group', value: peerGroup },
  ]

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-1">People Like You</h2>
      <p className="text-xs text-gray-500 mb-5">
        Based on similar profiles: {title}, {stage}, {location}
      </p>

      {isDefault && (
        <div className="bg-orange/5 border border-orange/20 rounded-xl px-4 py-2 text-xs text-orange mb-4">
          Limited matching data available. We are using the closest available peer group.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Left: profile attributes */}
        <div className="space-y-3">
          {attrs.map((a) => (
            <div key={a.label}>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{a.label}</div>
              <div className="text-sm text-white">{a.value}</div>
            </div>
          ))}
        </div>
        {/* Right: median numbers */}
        <div className="bg-navy rounded-xl p-5 flex flex-col justify-center space-y-4">
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Peer Median Base</div>
            <div className="text-3xl font-black text-orange">{formatSalary(medianBase, currency)}</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Peer Median OTE</div>
            <div className="text-3xl font-black text-white">{formatSalary(medianOte, currency)}</div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-600 mt-4">
        Comparison based on {profileCount} comparable profiles in our dataset.
      </p>
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
