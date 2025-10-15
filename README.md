# Affiliate Dashboard

A production-ready affiliate dashboard built with Next.js 15, Drizzle ORM, and Tailwind CSS. Features a black/white UI design with comprehensive affiliate management capabilities.

## Features

- **Authentication**: JWT-based login system with secure cookies
- **Route Protection**: Middleware-based authentication for all protected routes
- **Affiliate Management**: Track affiliate codes, referral links, and brand connections
- **Dashboard Analytics**: View visits, conversions, and conversion rates
- **Referral Link Generator**: Create branded referral links using `https://talaash.thejaayveeworld.com`
- **Responsive Design**: Mobile-first design with sidebar navigation
- **Database Integration**: PostgreSQL with Drizzle ORM

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: JWT with jose
- **Password Hashing**: bcryptjs
- **Icons**: Lucide React

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://postgres.segkkqnqwgttzqlsaruz:Jaayveeworld@aws-1-ap-south-1.pooler.supabase.com:6543/postgres"
AUTH_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
TALAASH_PUBLIC_BASE_URL="https://talaash.thejaayveeworld.com"
```

### 3. Database Setup

Generate and run database migrations:

```bash
# Generate migration files
npm run db:generate

# Apply migrations to database
npm run db:migrate

# Seed the database with test data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Test Credentials

After running the seed script, you can log in with:

- **Email**: `affiliate@example.com`
- **Password**: `password123`

## Project Structure

```
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── links/           # Referral links management
│   │   ├── account/         # Account settings
│   │   └── layout.tsx       # Dashboard layout with sidebar
│   ├── api/
│   │   ├── auth/            # Authentication endpoints
│   │   ├── affiliate/       # Affiliate data endpoints
│   │   └── links/           # Link management endpoints
│   ├── login/               # Public login page
│   └── page.tsx             # Redirects to dashboard
├── components/              # Reusable UI components
├── db/
│   ├── client.ts           # Database connection
│   └── schema.ts           # Database schema
├── lib/
│   ├── auth.ts             # Authentication utilities
│   └── affiliates.ts       # Affiliate data functions
├── scripts/
│   └── seed.ts             # Database seeding script
└── middleware.ts           # Route protection middleware
```

## Database Schema

The application extends your existing schema with new affiliate-related tables:

- **affiliates**: Main affiliate records linked to users
- **affiliate_brands**: Links affiliates to brands (ventures)
- **affiliate_links**: Per-brand referral links with custom codes
- **referral_visits**: Tracks link visits and traffic
- **referral_conversions**: Records conversions and purchases

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Affiliate Data
- `GET /api/affiliate/me` - Get current affiliate data and stats
- `GET /api/links` - Get affiliate's referral links
- `POST /api/links` - Create new referral link

## Features Overview

### Dashboard
- **KPI Cards**: Display total visits, conversions, and conversion rate
- **Referral Code**: Show primary affiliate code
- **Link Generator**: Create and copy referral links
- **Brand Grid**: Display connected brands with logos

### Link Management
- View all referral links
- Copy links to clipboard
- See link status (active/inactive)
- Track associated brands

### Account Settings
- View affiliate information
- See account creation date
- Monitor connected brands
- Track active links

## Security Features

- JWT-based authentication with secure HTTP-only cookies
- Password hashing with bcryptjs
- Route protection via middleware
- Server-side session validation
- SQL injection protection via Drizzle ORM

## Deployment

1. Set up your production environment variables
2. Run database migrations: `npm run db:migrate`
3. Build the application: `npm run build`
4. Start the production server: `npm start`

## Development

- **Linting**: `npm run lint`
- **Formatting**: `npm run format`
- **Database**: `npm run db:generate` and `npm run db:migrate`

## License

Private project for Jaayvee World affiliates.