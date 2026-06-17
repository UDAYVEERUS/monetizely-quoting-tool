export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent mb-4">
          Monetizely
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          Professional SaaS Quoting Tool
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Create stunning quotes, manage complex pricing models, and close deals faster with our intelligent quoting platform
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {/* Catalog Card */}
        <a
          href="/catalog"
          className="group card text-center hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300">
            <span className="text-3xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Catalog Setup</h2>
          <p className="text-gray-600 leading-relaxed">
            Build your product catalog with multiple tiers, features, and flexible pricing models. Control exactly what's included, what's add-on, and what's unavailable.
          </p>
          <div className="mt-4 inline-flex text-blue-600 font-semibold group-hover:gap-2 items-center gap-1">
            Get Started
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Quote Builder Card */}
        <a
          href="/quotes"
          className="group card text-center hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        >
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300">
            <span className="text-3xl">📄</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Quote Builder</h2>
          <p className="text-gray-600 leading-relaxed">
            Build customized quotes in minutes. Select products, tiers, add-ons, and discounts. Generate shareable links for your customers.
          </p>
          <div className="mt-4 inline-flex text-blue-600 font-semibold group-hover:gap-2 items-center gap-1">
            Create Quote
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      </div>

      {/* Stats Section */}
      <div className="grid gap-6 md:grid-cols-3 pt-8 border-t border-gray-200">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">∞</div>
          <p className="text-gray-600 mt-2">Unlimited Products</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">3</div>
          <p className="text-gray-600 mt-2">Pricing Models</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">100%</div>
          <p className="text-gray-600 mt-2">Shareable</p>
        </div>
      </div>
    </div>
  );
}
