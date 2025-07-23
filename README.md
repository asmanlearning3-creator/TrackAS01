# TrackAS - Automated Logistics Tracking System

🚚 **TrackAS** is a comprehensive logistics tracking and management system that automates the entire shipment lifecycle from registration to delivery. Built with modern web technologies and designed for scalability.

## 🌟 Features

### Dual Business Models
- **Subscription Model**: For logistics companies with their own fleet (VCODE-based assignment)
- **Pay-Per-Shipment Model**: For businesses needing on-demand logistics services

### Automated Operations
- ✅ **Automated Registration Processing** (24-48 hour verification)
- ✅ **VCODE Generation** for subscription vehicles
- ✅ **Smart Shipment Assignment** based on proximity, capacity, and ratings
- ✅ **Real-time Notifications** (Email, WhatsApp, SMS)
- ✅ **Payment Processing** for pay-per-shipment model
- ✅ **Performance Analytics** and operator ratings

### Key Components
- **Company Registration** (Subscription & Pay-per-shipment models)
- **Vehicle & Operator Management**
- **Shipment Creation & Tracking**
- **Live GPS Tracking**
- **Proof of Delivery**
- **Analytics Dashboard**
- **Automated Notifications**

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase account
- Git

### Automated Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd trackas

# Run automated setup
./scripts/setup.sh
```

The setup script will:
- Install all dependencies
- Setup environment configuration
- Configure Git hooks
- Create development scripts
- Setup Prettier and ESLint

### Manual Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Environment
VITE_NODE_ENV=development

# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

### GitHub Secrets (for CI/CD)
```
SUPABASE_PROJECT_ID=your_project_id
SUPABASE_ACCESS_TOKEN=your_access_token
SUPABASE_SERVICE_KEY=your_service_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID_STAGING=staging_project_id
VERCEL_PROJECT_ID_PRODUCTION=production_project_id
SLACK_WEBHOOK_URL=your_slack_webhook
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SENDGRID_API_KEY=your_sendgrid_key
```

## 🛠 Development Scripts

### Available Commands
```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run preview            # Preview production build

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint errors
npm run format             # Format with Prettier
npm run format:check       # Check formatting
npm run type-check         # TypeScript type checking

# Testing
npm run test               # Run tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Run tests with coverage

# Database
npm run db:generate        # Generate TypeScript types
npm run db:reset           # Reset local database
npm run db:migrate         # Push migrations to database
npm run db:seed            # Seed database with sample data
```

### Development Workflow Scripts
```bash
# Start full development environment
./scripts/dev.sh

# Build and test for production
./scripts/build.sh

# Deploy to staging/production
./scripts/deploy.sh staging
./scripts/deploy.sh production

# Monitor system health
./scripts/monitor.sh

# Backup database
./scripts/backup.sh
```

## 🏗 Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

### Project Structure
```
trackas/
├── src/
│   ├── components/         # React components
│   ├── context/           # React context providers
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── services/          # API services
│   └── types/             # TypeScript type definitions
├── scripts/               # Automation scripts
├── supabase/             # Database migrations and config
├── .github/workflows/    # CI/CD workflows
└── public/               # Static assets
```

## 🤖 Automation Features

### 1. Registration Processing
- **Automatic verification** after 24-48 hours
- **TIN/Business registration** validation
- **Vehicle documentation** verification
- **Driver license** cross-checking

### 2. VCODE Generation
- **Unique vehicle codes** for subscription model
- **Automatic assignment** to approved vehicles
- **Format**: `[Company][VehicleType][Timestamp]`

### 3. Shipment Assignment
#### Subscription Model
- Automatic assignment to company's registered vehicles
- VCODE-based routing
- Capacity and proximity matching

#### Pay-Per-Shipment Model
- Multi-operator matching
- Rating-based prioritization
- 15-minute acceptance window
- Automatic reassignment on rejection

### 4. Real-time Notifications
- **Email notifications** for all stakeholders
- **WhatsApp integration** for customers
- **SMS alerts** for urgent updates
- **In-app notifications** for operators

### 5. Payment Automation
- **Dynamic pricing** calculation
- **Automatic invoicing** for pay-per-shipment
- **Payment processing** notifications
- **Earnings reporting** for operators

## 🔄 Automated Workflows

### CI/CD Pipeline
1. **Code Quality Checks** (Lint, Type-check, Format)
2. **Automated Testing** with coverage reports
3. **Security Auditing** of dependencies
4. **Database Migrations** on deployment
5. **Multi-environment Deployment** (Staging/Production)
6. **Release Creation** with automated versioning

### Database Automation
- **Hourly verification processing**
- **5-minute shipment assignment cycles**
- **Real-time notification dispatch**
- **Daily rating calculations**
- **Weekly payment processing**

### Monitoring & Alerts
- **Health check endpoints**
- **Performance monitoring** with Prometheus/Grafana
- **Error tracking** and alerting
- **Slack notifications** for deployments

## 📊 Operational Flow

### 1. Company Registration
- Complete registration form
- Upload required documents
- Automatic verification (24-48 hours)
- Approval notification

### 2. Vehicle/Operator Registration
- Register vehicles with capacity details
- Driver verification and licensing
- VCODE generation (subscription model)
- Activation notification

### 3. Shipment Lifecycle
1. **Creation** → Logistics company creates shipment
2. **Assignment** → Automatic operator matching
3. **Confirmation** → Notifications to all parties
4. **Pickup** → GPS tracking begins
5. **Transit** → Real-time location updates
6. **Delivery** → Proof of delivery upload
7. **Payment** → Automatic processing (pay-per-shipment)
8. **Feedback** → Customer and operator ratings

## 🐳 Docker Development

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services included:
- **TrackAS App** (Port 5173)
- **PostgreSQL** (Port 5432)
- **Redis** (Port 6379)
- **Nginx** (Ports 80/443)
- **Prometheus** (Port 9090)
- **Grafana** (Port 3001)

## 📈 Monitoring & Analytics

### System Monitoring
- **Application health** endpoints
- **Database performance** metrics
- **API response times**
- **Error rate tracking**

### Business Analytics
- **Shipment success rates**
- **Operator performance** metrics
- **Route optimization** insights
- **Cost savings** reports

## 🚀 Deployment

### Staging Deployment
```bash
git push origin develop
# Automatically deploys to staging environment
```

### Production Deployment
```bash
git push origin main
# Automatically deploys to production with:
# - Database migrations
# - Zero-downtime deployment
# - Automatic rollback on failure
```

### Manual Deployment
```bash
./scripts/deploy.sh production
```

## 🔐 Security

- **Environment variable** encryption
- **Database access** controls
- **API rate limiting**
- **Input validation** and sanitization
- **HTTPS enforcement**
- **Regular security audits**

## 📝 API Documentation

The system provides RESTful APIs for:
- Company and operator registration
- Shipment management
- Real-time tracking
- Payment processing
- Analytics and reporting

API documentation is available at `/docs` when running the development server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- 📧 Email: support@trackas.app
- 📚 Documentation: [docs.trackas.app](https://docs.trackas.app)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/trackas/issues)

---

**Owner of this Documentation**: Vipul Sharma

Built with ❤️ for the logistics industry
