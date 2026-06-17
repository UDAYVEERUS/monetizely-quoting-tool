# Monetizely Quoting Tool

A professional SaaS quoting tool built with Next.js, Prisma, and TypeScript. Create, manage, and share product pricing quotes with customers.

## Features

- **Product Catalog Management**: Create products, pricing tiers, and features
- **Feature Matrix**: Visually manage which features are included, add-ons, or unavailable for each tier
- **Multi-Step Quote Builder**: Intuitive form for creating custom quotes
- **Flexible Pricing Models**: Support for fixed, per-seat, and percentage-based add-on pricing
- **Term-Based Discounts**: Automatic discount calculations for annual and two-year terms
- **Shareable Quote Links**: Generate public links to share quotes with customers
- **Professional Quote Documents**: Clean, printable quote view with full pricing breakdown

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma ORM** - Database access and migrations
- **SQLite** - Local development database (easily swappable to PostgreSQL)
- **Tailwind CSS** - Utility-first styling
- **Jest** - Unit testing
- **Playwright** - End-to-end testing

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- SQLite3 (usually pre-installed)

### Installation

1. **Clone the repository**
   ```bash
   cd monetizely-quoting-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Seed sample data** (optional)
   ```bash
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## Project Structure

```
app/
  ├── catalog/              # Product and pricing catalog pages
  │   ├── page.tsx         # List products
  │   ├── new/             # Create new product
  │   └── [id]/            # Product detail with feature matrix
  ├── quotes/              # Quote management and sharing
  │   ├── page.tsx         # List all quotes
  │   ├── new/             # Quote builder
  │   └── [shareToken]/    # Shareable quote view
  ├── api/                 # API routes
  │   ├── products/
  │   ├── quotes/
  │   └── ...
  └── layout.tsx           # Root layout

components/
  ├── catalog/             # Catalog-related components
  │   ├── TiersList.tsx
  │   ├── FeaturesList.tsx
  │   └── FeatureMatrix.tsx
  └── quotes/              # Quote-related components
      ├── QuoteBuilder.tsx
      ├── QuotePreview.tsx
      └── QuoteDocument.tsx

lib/
  ├── pricing.ts           # All pricing calculation logic
  ├── prisma.ts            # Prisma client singleton
  └── utils.ts             # Utility functions

prisma/
  ├── schema.prisma        # Database schema
  └── seed.ts              # Sample data seeding

tests/
  ├── unit/pricing.test.ts # Unit tests for pricing logic
  └── e2e/quote-flow.test.ts # End-to-end tests
```

## Running Tests

### Unit Tests
```bash
npm test                    # Run all tests
npm run test:watch        # Watch mode for development
```

### End-to-End Tests
```bash
npm run test:e2e          # Run Playwright tests
npx playwright codegen    # Record new tests
```

## Database Schema

### Key Models

- **Product** - SaaS product with name and description
- **Tier** - Pricing tier (e.g., Starter, Pro, Enterprise)
- **Feature** - Product feature that can be included or add-on
- **TierFeature** - Junction table defining feature availability and pricing
- **Quote** - Customer quote with line items and add-ons
- **QuoteLineItem** - Individual line items in a quote
- **QuoteAddon** - Add-ons selected for a specific quote

## Pricing Calculation

The pricing module (`lib/pricing.ts`) handles all calculations:

### Base Price
- **Monthly**: `basePricePerSeat × seats × 1`
- **Annual**: `basePricePerSeat × seats × 12 × 0.85` (15% discount)
- **Two-Year**: `basePricePerSeat × seats × 24 × 0.75` (25% discount)

### Add-on Pricing Models
1. **FIXED**: `price × months in term`
2. **PER_SEAT**: `price × seats × months in term`
3. **PERCENTAGE**: `(percentage / 100) × base_price_before_discount`

### Total
`(base_price + sum_of_addons) × (1 - discount_percent / 100)`

## Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV="development"
```

For production with Vercel Postgres:
```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NODE_ENV="production"
```

## API Endpoints

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create a product
- `GET /api/products/[id]/feature-matrix` - Get feature matrix
- `PATCH /api/products/[id]/tier-features/[tfId]` - Update tier-feature

### Quotes
- `POST /api/quotes` - Create a quote

### Tiers
- `POST /api/products/[id]/tiers` - Create a tier
- `GET /api/products/[id]/tiers/list` - List tiers

### Features
- `POST /api/products/[id]/features` - Create a feature
- `GET /api/products/[id]/tiers/[tierId]/features` - List tier features

## Assumptions Made

1. **No authentication** - The app assumes single-user access in development. In production, add user authentication.

2. **SQLite for dev, Postgres for production** - SQLite is file-based and perfect for development. Vercel recommends Vercel Postgres for production.

3. **Public quote sharing** - Quotes are publicly accessible via shareable tokens. No authentication is required to view quotes.

4. **Immutable quotes** - Once created, quotes cannot be edited. This ensures pricing accuracy and audit trails.

5. **Term discounts are fixed** - Annual discount is always 15%, two-year is always 25%. These could be made configurable per product if needed.

6. **Percentage add-ons apply to base price before discount** - When using percentage pricing for add-ons, the percentage is calculated against the undiscounted base price.

## Key Decisions and Why

### 1. Separate Pricing Module
**Decision**: All pricing logic is in a pure utility module (`lib/pricing.ts`)

**Why**: 
- Easy to test independently with Jest
- Can be used on the frontend and backend
- Clear separation of concerns
- Pricing rules are centralized and easy to modify

### 2. SQLite for Local Development
**Decision**: Use SQLite with file storage for dev, easily swappable to PostgreSQL

**Why**:
- No database setup required for developers
- Fast iteration during development
- Easy to reset by deleting the file
- Compatible with Vercel Postgres migration path

### 3. Multi-Step Quote Builder
**Decision**: Form broken into 5 steps instead of one large form

**Why**:
- Better UX for complex workflows
- Progressive disclosure of options
- Easier validation at each step
- Natural progression: info → product → add-ons → discount → review

### 4. Feature Matrix as Interactive Grid
**Decision**: Use a dynamic table with inline editing

**Why**:
- Intuitive visual representation of tier × feature combinations
- Inline pricing model and price inputs reduce clicks
- Auto-saves changes (could add manual save button)
- Easy to see the complete picture at once

### 5. Server-Side Quote Generation
**Decision**: Quotes are generated and stored on the server

**Why**:
- Ensures pricing accuracy (calculations happen server-side)
- Creates immutable audit trail
- Prevents tampering with prices on the client
- Line items are pre-calculated and stored

### 6. Share Token Instead of Quote ID
**Decision**: Use opaque UUID tokens for sharing instead of sequential IDs

**Why**:
- Prevents enumeration attacks
- Doesn't expose how many quotes have been created
- Unpredictable URLs
- Better security for sharing sensitive pricing

## What I'd Build Next (With More Time)

1. **User Authentication & Tenancy**
   - Multi-user support with user authentication
   - Organization/workspace support
   - Role-based access control (admin, sales, viewer)

2. **Quote Management**
   - Edit quotes (create new versions, not overwrite)
   - Quote versioning and history
   - Duplicate quote feature
   - Archive/soft-delete

3. **Customer Portal**
   - Accept/reject quotes with e-signature
   - Customer dashboard to view all shared quotes
   - Email notifications when quote is shared

4. **Advanced Pricing**
   - Custom pricing rules per customer
   - Volume discounts
   - Promotional codes
   - Currency support

5. **Analytics & Reporting**
   - Quote conversion tracking
   - Win/loss analysis
   - Revenue forecasting
   - Feature adoption metrics

6. **Integration**
   - Stripe/payment integration
   - Salesforce sync
   - Slack notifications
   - Webhook support for quote events

7. **Polish & Optimization**
   - Dark mode
   - Keyboard shortcuts
   - Quote templates
   - Bulk operations
   - Search and filtering
   - Export to PDF/Excel
   - Discount management UI

## Questions I'd Ask the Client

1. **Authentication**: Should this be a multi-user SaaS, or single-user?

2. **Quote Lifecycle**: Can quotes be edited after creation, or are they immutable?

3. **Pricing Rules**: Are the 15% annual and 25% two-year discounts fixed, or should they be configurable?

4. **Customer Accounts**: Do customers need accounts to view shared quotes, or should they be publicly accessible?

5. **Approval Workflows**: Is there a manager approval step before quotes are shared with customers?

6. **Integration**: Do you need integrations with CRM, ERP, or payment systems?

7. **Customization**: Should customers be able to add custom line items or notes to quotes?

8. **Compliance**: Are there audit, SOC2, or GDPR requirements?

9. **Scale**: What's the expected scale? (number of products, quotes per month, concurrent users?)

10. **Branding**: Should quotes be white-labeled or have company branding?

## Deployment

### To Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/repo.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com
   - Create new project from your GitHub repository
   - Set environment variables

3. **Set up Database**
   - Create a Vercel Postgres database
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations in the Vercel CLI or via script

4. **Deploy**
   ```bash
   npm run build
   npm run start
   ```

## Troubleshooting

### Database Issues
```bash
# Reset the database (dev only)
rm prisma/dev.db
npm run prisma:migrate
npm run seed
```

### Port Already in Use
```bash
# Use a different port
npm run dev -- -p 3001
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
npm run prisma:generate
```

## License

MIT
