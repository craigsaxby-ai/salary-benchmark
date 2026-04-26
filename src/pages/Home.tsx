import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center max-w-3xl mx-auto">
        <span className="text-orange text-sm font-semibold tracking-widest uppercase mb-4">
          Are you being paid what you're worth?
        </span>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          The Free B2B Sales Leadership<br className="hidden md:block" /> Salary Benchmark
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl">
          See how your compensation compares to 200+ senior sales leaders across SaaS, FinTech and B2B tech. Takes 60 seconds.
        </p>
        <button
          onClick={() => navigate('/benchmark')}
          className="bg-orange hover:bg-orange/90 transition-colors text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-orange/20 mb-4"
        >
          Check My Salary →
        </button>
        <p className="text-gray-500 text-sm">Anonymous · No account required · Instant results</p>
      </section>

      {/* How it works */}
      <section className="bg-card border-t border-b border-border py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: 'Enter your details',
                desc: 'Tell us your role, company stage and location. Takes under a minute.',
              },
              {
                num: '2',
                title: 'See your benchmark instantly',
                desc: 'Get an immediate view of where your salary sits in the market.',
              },
              {
                num: '3',
                title: 'Get the full breakdown',
                desc: 'Enter your email for percentiles, OTE benchmarks and equity data.',
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-orange/10 border border-orange/30 text-orange font-bold text-xl flex items-center justify-center mb-4">
                  {step.num}
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-10 px-6 text-center">
        <p className="text-gray-400 text-sm mb-4">Used by 200+ sales leaders at</p>
        <div className="flex flex-wrap justify-center gap-6 text-gray-500 font-semibold text-sm">
          {['Salesforce', 'HubSpot', 'Pipedrive', 'Gong', 'Outreach'].map((co) => (
            <span key={co} className="opacity-60 hover:opacity-100 transition-opacity">{co}</span>
          ))}
        </div>
      </section>

      {/* CTA repeat */}
      <section className="flex flex-col items-center px-6 pb-20 text-center">
        <button
          onClick={() => navigate('/benchmark')}
          className="bg-orange hover:bg-orange/90 transition-colors text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-orange/20"
        >
          Check My Salary →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-gray-500 text-sm mb-2">
          <span className="font-semibold text-white">The Salary Benchmark</span> — a product by{' '}
          <a href="https://searchline.com" className="text-orange hover:underline">Searchline</a>
        </p>
        <div className="flex justify-center gap-4 text-gray-600 text-xs">
          <a href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-gray-400 transition-colors">Terms</a>
        </div>
      </footer>
    </div>
  )
}
