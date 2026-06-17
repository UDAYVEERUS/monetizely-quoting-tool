export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Monetizely Quoting Tool
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Create professional quotes and manage your SaaS pricing with ease
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <a
          href="/catalog"
          className="card text-center hover:shadow-lg transition-shadow"
        >
          <div className="mb-4 text-4xl">📦</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Catalog Setup</h2>
          <p className="text-gray-600">
            Configure products, pricing tiers, and feature matrices
          </p>
        </a>

        <a
          href="/quotes"
          className="card text-center hover:shadow-lg transition-shadow"
        >
          <div className="mb-4 text-4xl">📄</div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Quote Builder</h2>
          <p className="text-gray-600">
            Create and share professional quotes with customers
          </p>
        </a>
      </div>
    </div>
  );
}
