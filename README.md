# TruckFlow - Logistics Management Platform

A comprehensive logistics and transportation management platform with role-based authentication and real-time tracking capabilities.

## Features

### Authentication System
- **Role-based Authentication**: Support for three user types:
  - **Logistics Companies**: Manage shipments, operators, and analytics
  - **Transport Operators**: Accept jobs, manage deliveries, and track vehicles
  - **Customers**: Book shipments and track deliveries

- **Secure Login/Registration**: Each user type has a dedicated login interface
- **Password Reset**: Forgot password functionality with email verification
- **User Profiles**: Comprehensive user profile management with role-specific fields

### User Roles & Capabilities

#### Logistics Companies
- Create and manage shipments
- Operator management and verification
- Real-time analytics and reporting
- Company registration and verification
- Fleet management

#### Transport Operators
- View and accept available jobs
- Manage active shipments
- Vehicle registration and verification
- Real-time location tracking
- Earnings and performance analytics

#### Customers
- Book shipments
- Track deliveries in real-time
- View shipment history
- Manage delivery addresses
- Rate and review service

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd truckflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Supabase**
   - Create a Supabase account at [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the `.env.example` file to `.env`
   - Add your Supabase URL and anon key to the `.env` file

4. **Run database migrations**
   ```bash
   # Apply the migrations to create the user_profiles table
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Open [http://localhost:5173](http://localhost:5173)
   - Choose your role (Logistics, Operator, or Customer)
   - Sign up or sign in to access the platform

### Demo Mode
If you don't want to set up Supabase immediately, you can use the demo mode by clicking "Try Demo Mode" on the login page. This allows you to explore the interface without authentication.

## Authentication Setup

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Schema
The application requires a `user_profiles` table that extends Supabase auth with role-specific information. Run the included migration to set this up:

```sql
-- See supabase/migrations/20250115000000_add_user_profiles.sql
```

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   │   ├── Login.tsx
│   │   ├── LogisticsLogin.tsx
│   │   ├── OperatorLogin.tsx
│   │   ├── CustomerLogin.tsx
│   │   └── PasswordReset.tsx
│   ├── Dashboard.tsx
│   ├── Header.tsx
│   └── ...
├── context/
│   ├── AuthContext.tsx # Authentication state management
│   ├── AppContext.tsx
│   └── DatabaseContext.tsx
├── lib/
│   └── supabase.ts     # Supabase configuration
└── types/              # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.