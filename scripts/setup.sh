#!/bin/bash

# TrackAS - Automated Setup Script
# This script automates the initial setup of the TrackAS logistics system

set -e

echo "🚚 TrackAS - Logistics System Setup"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm ci
else
    echo "❌ npm not found. Please install Node.js first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "📥 Installing Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Supabase CLI $(supabase --version) found"

# Setup environment variables
if [ ! -f .env.local ]; then
    echo "🔧 Creating environment configuration..."
    cat > .env.local << EOL
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
EOL
    echo "⚠️  Please update .env.local with your Supabase credentials"
fi

# Setup Git hooks (if using husky)
if [ -d .git ]; then
    echo "🪝 Setting up Git hooks..."
    npx husky install
    npx husky add .husky/pre-commit "npm run precommit"
    npx husky add .husky/pre-push "npm run test && npm run type-check"
fi

# Setup Prettier configuration
if [ ! -f .prettierrc ]; then
    echo "🎨 Creating Prettier configuration..."
    cat > .prettierrc << EOL
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOL
fi

# Setup lint-staged configuration
if [ ! -f .lintstagedrc ]; then
    echo "🔍 Creating lint-staged configuration..."
    cat > .lintstagedrc << EOL
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
EOL
fi

# Create development scripts
mkdir -p scripts

cat > scripts/dev.sh << 'EOL'
#!/bin/bash
# Development startup script

echo "🚀 Starting TrackAS development environment..."

# Start Supabase local development
if [ -f supabase/config.toml ]; then
    echo "🗄️  Starting Supabase..."
    supabase start &
    SUPABASE_PID=$!
fi

# Start development server
echo "🌐 Starting Vite development server..."
npm run dev &
VITE_PID=$!

# Wait for processes
wait $VITE_PID $SUPABASE_PID
EOL

chmod +x scripts/dev.sh

cat > scripts/build.sh << 'EOL'
#!/bin/bash
# Production build script

echo "🏗️  Building TrackAS for production..."

# Run quality checks
echo "🔍 Running quality checks..."
npm run lint
npm run type-check
npm run format:check

# Run tests
echo "🧪 Running tests..."
npm run test

# Build application
echo "📦 Building application..."
npm run build

echo "✅ Build completed successfully!"
EOL

chmod +x scripts/build.sh

cat > scripts/deploy.sh << 'EOL'
#!/bin/bash
# Deployment script

set -e

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying TrackAS to $ENVIRONMENT..."

# Build application
./scripts/build.sh

# Deploy database migrations
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🗄️  Running database migrations..."
    supabase db push --linked
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
    vercel --prod
else
    vercel
fi

echo "✅ Deployment to $ENVIRONMENT completed!"
EOL

chmod +x scripts/deploy.sh

# Create monitoring script
cat > scripts/monitor.sh << 'EOL'
#!/bin/bash
# System monitoring script

echo "📊 TrackAS System Monitor"
echo "========================"

# Check application health
check_health() {
    local url=$1
    local name=$2
    
    if curl -s "$url/health" > /dev/null; then
        echo "✅ $name is healthy"
    else
        echo "❌ $name is down"
    fi
}

# Check different environments
check_health "https://trackas-staging.vercel.app" "Staging"
check_health "https://trackas.vercel.app" "Production"

# Check database connectivity
if command -v supabase &> /dev/null; then
    echo "🗄️  Checking database..."
    supabase status --no-color
fi

# Check for pending migrations
echo "📋 Checking for pending migrations..."
supabase db diff --schema public

echo "📈 System status check completed"
EOL

chmod +x scripts/monitor.sh

# Create backup script
cat > scripts/backup.sh << 'EOL'
#!/bin/bash
# Database backup script

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups"

mkdir -p $BACKUP_DIR

echo "💾 Creating database backup..."

# Backup database schema and data
supabase db dump --data-only > "$BACKUP_DIR/data_$DATE.sql"
supabase db dump --schema-only > "$BACKUP_DIR/schema_$DATE.sql"

# Compress backups
gzip "$BACKUP_DIR/data_$DATE.sql"
gzip "$BACKUP_DIR/schema_$DATE.sql"

echo "✅ Backup completed: $BACKUP_DIR/{data,schema}_$DATE.sql.gz"

# Clean old backups (keep last 10)
ls -t $BACKUP_DIR/*.gz | tail -n +11 | xargs -r rm

echo "🧹 Old backups cleaned"
EOL

chmod +x scripts/backup.sh

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run 'npm run dev' to start development"
echo "3. Use './scripts/dev.sh' for full development environment"
echo ""
echo "Available scripts:"
echo "- ./scripts/dev.sh     - Start development environment"
echo "- ./scripts/build.sh   - Build for production"
echo "- ./scripts/deploy.sh  - Deploy to staging/production"
echo "- ./scripts/monitor.sh - Monitor system health"
echo "- ./scripts/backup.sh  - Backup database"
echo ""