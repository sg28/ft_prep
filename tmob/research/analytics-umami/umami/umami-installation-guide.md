# Umami Analytics Setup with T-Mobile Developer Portal

A comprehensive guide for setting up Umami web analytics locally and integrating it with a React application for complete user behavior tracking.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation Process](#installation-process)
- [Database Setup](#database-setup)
- [Umami Configuration](#umami-configuration)
- [T-Mobile App Integration](#t-mobile-app-integration)
- [Analytics Implementation](#analytics-implementation)
- [Running the Applications](#running-the-applications)
- [Troubleshooting](#troubleshooting)
- [Features & Tracking](#features--tracking)

## Overview

This setup demonstrates how to:
- Install and configure Umami v2.19.0 locally
- Set up PostgreSQL database
- Integrate comprehensive analytics tracking into a React/TypeScript application
- Monitor real-time user behavior, API performance, and engagement metrics

**Final Result:**
- **Umami Dashboard**: `http://localhost:3000/dashboard`
- **T-Mobile Developer Portal**: `http://localhost:8080/`

## Technical Challenges We Encountered

This section documents the real-world issues we faced during installation and how we resolved them:

### Node.js Version Management Issues

**Problem**: nvm (Node Version Manager) was causing PATH conflicts and installation issues
**Solution**: Switched to Homebrew for more reliable Node.js installation

```bash
# What didn't work:
nvm install 20
nvm use 20
# Result: Command not found errors, PATH issues

# What worked:
brew install node@20
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

### PATH Configuration Challenges

**Problem**: Even after installing Node.js and pnpm, commands weren't recognized
**Root Cause**: macOS wasn't finding the executables in the Homebrew installation path

**Critical Solution**: Every terminal session requires explicit PATH configuration:
```bash
# This must be run in every new terminal session
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

### Package Manager Compatibility

**Problem**: Umami uses pnpm, not npm
**Issues Encountered**:
- Build failures when trying to use npm
- Dependency resolution conflicts
- Lock file mismatches

**Solution**: Strict pnpm usage throughout:
```bash
# Install pnpm globally after Node.js setup
npm install -g pnpm

# Always use pnpm for Umami commands
pnpm install    # NOT npm install
pnpm run build  # NOT npm run build
pnpm run dev    # NOT npm run dev
```

### Database Permission Issues

**Problem**: PostgreSQL permission errors during migration
**Specific Error**: `permission denied for schema public`

**Complete Fix**:
```bash
# Required permissions that aren't obvious
psql -d umami -c "GRANT ALL PRIVILEGES ON DATABASE umami TO umami;"
psql -d umami -c "GRANT ALL ON SCHEMA public TO umami;"
psql -d umami -c "ALTER SCHEMA public OWNER TO umami;"
```

### Build Process Complexities

**Problem**: Umami build process has multiple interdependent steps
**What We Learned**: The build process must complete in this exact order:

1. Environment check (`check-env`)
2. Database setup (`build-db`)
3. Database validation (`check-db`)  
4. Tracker script build (`build-tracker`)
5. Geographic database download (`build-geo`)
6. Next.js application build (`build-app`)

**Critical Issue**: If any step fails, the entire build fails, but error messages aren't always clear.

### Docker Desktop Restrictions

**Problem**: Corporate environment blocked Docker Desktop usage
**Impact**: Couldn't use official Docker Compose setup
**Solution**: Manual Homebrew installation of all dependencies

### Prisma CLI Issues

**Problem**: `prisma` command not found during build
**Root Cause**: Global CLI not installed, only local dependency
**Solution**: Use npx for Prisma commands:
```bash
npx prisma migrate deploy
npx prisma generate
```

### Port Conflicts

**Problem**: Multiple applications competing for port 3000
**Behavior**: Umami automatically uses alternative ports (3001, 3002) when 3000 is busy
**Solution**: Check actual port in startup logs and update tracking script URLs accordingly

### Next.js Standalone Configuration

**Problem**: Production build warning about standalone output
**Error**: `"next start" does not work with "output: standalone" configuration`
**Workaround**: Use development mode (`pnpm run dev`) instead of production start

### Environment Variable Persistence

**Problem**: Environment variables not persisting between terminal sessions
**Solution**: Either add to shell profile or re-export in each session:
```bash
# Option 1: Add to ~/.zshrc (permanent)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc

# Option 2: Export in each session (what we documented)
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

### Git Repository Management Issues

**Problem**: Umami repository was treated as a Git submodule instead of regular files
**Specific Issue**: After copying Umami to research directory, Git showed:
```
modified:   research/analytics-umami/umami (untracked content)
```
**Root Cause**: Nested `.git` directory created submodule reference instead of tracking actual files

**Complete Resolution**:
```bash
# Remove submodule reference
git rm --cached research/analytics-umami/umami

# Remove nested git directory
rm -rf research/analytics-umami/umami/.git

# Add as regular files
git add research/analytics-umami/umami

# Commit all source code and customizations
git commit -m "Add Umami analytics setup with installation guide and source code"
```

**Complete Git Workflow**:
```bash
# 1. Initial status showed submodule issue
git status
# On branch tmo/main
# modified: research/analytics-umami/umami (untracked content)

# 2. Remove submodule reference  
git rm --cached research/analytics-umami/umami
# rm 'research/analytics-umami/umami'

# 3. Remove nested Git directory
rm -rf research/analytics-umami/umami/.git

# 4. Add all files as regular content
git add research/analytics-umami/umami

# 5. Commit everything
git commit -m "Add Umami analytics setup with installation guide and source code"
# [tmo/main 4bfc6b0] Add Umami analytics setup with installation guide and source code
# 1481 files changed, 1385 insertions(+), 243 deletions(-)

# 6. Push to remote repository
git push origin tmo/main
# Enumerating objects: 1484, done.
# Writing objects: 100% (1481/1481), 1.49 MiB | 390.00 KiB/s, done.
```

**Result**: Successfully committed 1,481 files (1.49 MiB) including complete Umami source code, installation guide, and all customizations to the remote repository

### Tracking Verification Challenges

**Problem**: Unclear if tracking was working without authentication
**Discovery Process**: 
```bash
# Test tracking endpoint directly
curl -X POST "http://localhost:3000/api/send" \
  -H "Content-Type: application/json" \
  -d '{"type":"event","payload":{"website":"98907414-61b8-42ff-a1a0-028537840ccf"}}'

# Success response: {"beep":"boop"}
```

**Verification Method**: Direct API testing confirmed tracking was working before dashboard login

### Port Auto-Assignment Behavior

**Problem**: Confusion when Umami started on different ports
**Behavior Observed**:
- First attempt: Port 3000 busy → Auto-assigned to 3001
- Later attempts: Port 3000 available → Used port 3000
- **Issue**: Frontend tracking script hardcoded to port 3000

**Solution**: Always check startup logs for actual port:
```
⚠ Port 3000 is in use by process 48198, using available port 3001 instead.
✓ Ready in 3.9s
- Local: http://localhost:3001
```

## Lessons Learned

1. **Homebrew > nvm**: More reliable for macOS development environments
2. **PATH Management**: Critical for tool availability - must be explicit
3. **pnpm Requirement**: Umami specifically needs pnpm, not npm
4. **Database Permissions**: PostgreSQL requires specific schema-level permissions
5. **Build Dependencies**: Each build step depends on previous steps completing successfully
6. **Development vs Production**: Development mode is more forgiving for local setups

## Prerequisites

### Required Software
- **macOS** (this guide is macOS-specific)
- **Homebrew** package manager
- **Git** for version control
- **Terminal** access

### System Requirements & Versions Used

**Node.js Ecosystem:**
- Node.js 20.19.5 (via Homebrew `node@20`)
- npm 10.8.2 (bundled with Node.js)
- pnpm 10.20.0 (installed globally via npm)

**Database:**
- PostgreSQL 15.10 (via Homebrew `postgresql@15`)
- Database encoding: UTF8
- Connection pooling: Built-in

**Umami Application:**
- Umami v2.19.0
- Next.js 15.4.7
- React 19.0.0
- Prisma 6.7.0
- TypeScript 5.5.3

**System Resources:**
- macOS (Apple Silicon/Intel)
- 4GB+ RAM recommended
- 2GB+ free disk space
- Homebrew package manager

## Installation Process

### Step 1: Install Node.js via Homebrew

Since we encountered issues with nvm, we used Homebrew for a clean Node.js installation:

```bash
# Install Node.js 20
brew install node@20

# Add Node.js to PATH
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Verify installation
node --version  # Should show v20.19.5
npm --version   # Should show 10.8.2
```

### Step 2: Install pnpm Package Manager

Umami uses pnpm for dependency management:

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version  # Should show 10.20.0
```

### Step 3: Clone and Setup Umami

```bash
# Navigate to your projects directory
cd /Users/sghosh61/Documents/

# Clone Umami repository (if not already present)
git clone https://github.com/umami-software/umami.git
cd umami

# Install dependencies
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm install
```

## Database Setup Options

Umami supports **three different database systems**. Choose the one that best fits your needs:

- **PostgreSQL** (Recommended for production)
- **MySQL/MariaDB** (Good performance, widely supported)
- **ClickHouse** (Optimized for analytics, best for high-volume data)

### Option 1: PostgreSQL Setup (Used in this guide)

**Minimum Version**: PostgreSQL 12.14+

```bash
# Install PostgreSQL 15 via Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to PATH
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"

# Create the database
createdb umami

# Create user and grant permissions
psql -d umami -c "CREATE USER umami WITH PASSWORD 'umami';"
psql -d umami -c "GRANT ALL PRIVILEGES ON DATABASE umami TO umami;"
psql -d umami -c "GRANT ALL ON SCHEMA public TO umami;"
psql -d umami -c "ALTER SCHEMA public OWNER TO umami;"
```

**Environment Variable:**
```bash
DATABASE_URL=postgresql://umami:umami@localhost:5432/umami
```

### Option 2: MySQL/MariaDB Setup

**Minimum Versions**: MySQL 8.0+ or MariaDB 10.5+

```bash
# Install MySQL via Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Create database and user
mysql -u root -p
```

**In MySQL console:**
```sql
CREATE DATABASE umami;
CREATE USER 'umami'@'localhost' IDENTIFIED BY 'umami_password';
GRANT ALL PRIVILEGES ON umami.* TO 'umami'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Environment Variable:**
```bash
DATABASE_URL=mysql://umami:umami_password@localhost:3306/umami
```

### Option 3: ClickHouse Setup (Advanced)

**Best for**: High-volume analytics, data warehousing

```bash
# Install ClickHouse via Homebrew
brew install clickhouse

# Start ClickHouse service
brew services start clickhouse

# Create database
clickhouse-client --query "CREATE DATABASE umami"
```

**Environment Variable:**
```bash
DATABASE_URL=clickhouse://default:@localhost:8123/umami
```

### Database Comparison

| Database | Best For | Pros | Cons |
|----------|----------|------|------|
| **PostgreSQL** | General use, production | Reliable, feature-rich, excellent performance | Requires more setup |
| **MySQL/MariaDB** | Shared hosting, familiarity | Widely supported, easy setup | Less advanced features |
| **ClickHouse** | High-volume analytics | Optimized for analytics queries, very fast | More complex, overkill for small sites |

### Switching Databases

To switch database types after initial setup:

1. **Update Environment Variable**: Change `DATABASE_URL` format
2. **Rebuild Database Schema**: Run `pnpm run build-db`
3. **Run Migrations**: Database will be set up automatically

## Umami Configuration

### Step 1: Environment Configuration

Create `.env` file in the umami directory:

```bash
# /Users/sghosh61/Documents/umami/.env
DATABASE_URL=postgresql://umami:umami@localhost:5432/umami
APP_SECRET=umami-development-secret-key-change-in-production
```

### Step 2: Build Umami Application

```bash
cd /Users/sghosh61/Documents/umami
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm run build
```

This command will:
- Check environment variables
- Build database schema
- Run database migrations (13 migrations applied)
- Build tracking script
- Download geo database
- Build Next.js application
- Create default admin user (`admin` / `umami`)

### Step 3: Start Umami in Development Mode

```bash
cd /Users/sghosh61/Documents/umami
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
pnpm run dev
```

**Umami will be available at**: `http://localhost:3000`

## T-Mobile App Integration

### Step 1: Add Umami Tracking Script to HTML

**File**: `/Users/sghosh61/Documents/IDP/code-base/frontend/dex-platform-ui/index.html`

Add the Umami tracking script to the `<head>` section:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>T-Mobile Developer Portal</title>
    
    <!-- Umami Analytics - Add this line -->
    <script async src="http://localhost:3000/script.js" 
            data-website-id="98907414-61b8-42ff-a1a0-028537840ccf"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**What this does:**
- Loads Umami tracking script asynchronously
- Automatically tracks page views, sessions, and navigation
- Connects your app to Umami using the unique website ID

### Step 2: Create Custom Analytics Utility

**File**: `/Users/sghosh61/Documents/IDP/code-base/frontend/dex-platform-ui/src/utils/analytics.ts`

```typescript
// Enhanced Analytics Utility for T-Mobile Developer Portal
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, any>) => void;
      identify: (userData?: Record<string, any>) => void;
    };
  }
}

class Analytics {
  private static isEnabled = true;

  // Track custom events
  static track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled || !window.umami) return;
    
    try {
      window.umami.track(eventName, {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  // Track project-related actions
  static trackProject(action: string, data?: Record<string, any>) {
    this.track(`project-${action}`, {
      category: 'project',
      ...data
    });
  }

  // Track API calls with performance metrics
  static trackApiCall(endpoint: string, method: string, status: number, duration?: number) {
    this.track('api-call', {
      category: 'api',
      endpoint,
      method,
      status,
      duration,
      success: status >= 200 && status < 300
    });
  }

  // Track user engagement
  static trackEngagement(action: string, element: string, data?: Record<string, any>) {
    this.track('user-engagement', {
      category: 'engagement',
      action,
      element,
      ...data
    });
  }

  // Track authentication events
  static trackAuth(action: 'login' | 'logout' | 'session-start' | 'session-end', data?: Record<string, any>) {
    this.track(`auth-${action}`, {
      category: 'authentication',
      ...data
    });
  }

  // Track errors
  static trackError(errorType: string, context: string, errorDetails?: Record<string, any>) {
    this.track('error', {
      category: 'error',
      type: errorType,
      context,
      ...errorDetails
    });
  }

  // Identify user session
  static identify(userData?: Record<string, any>) {
    if (!this.isEnabled || !window.umami) return;
    
    try {
      window.umami.identify(userData);
    } catch (error) {
      console.warn('Analytics identification failed:', error);
    }
  }
}

export default Analytics;
```

### Step 3: Integrate Analytics in React Components

**File**: `/Users/sghosh61/Documents/IDP/code-base/frontend/dex-platform-ui/src/App.tsx`

Add session tracking to your main App component:

```tsx
import { useEffect } from 'react';
import Analytics from './utils/analytics';

function App() {
  useEffect(() => {
    // Track application start
    Analytics.trackAuth('session-start');
    Analytics.identify({ 
      userAgent: navigator.userAgent,
      language: navigator.language,
      timestamp: new Date().toISOString()
    });

    // Track session end on page unload
    const handleBeforeUnload = () => {
      Analytics.trackAuth('session-end');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    // Your existing App JSX
  );
}

export default App;
```

### Step 4: Track Component Interactions

**Example**: `/Users/sghosh61/Documents/IDP/code-base/frontend/dex-platform-ui/src/pages/Accelerators/MyProjects/index.tsx`

```tsx
import Analytics from '../../../utils/analytics';

export default function MyProjects() {
  const handleRefresh = async () => {
    const startTime = performance.now();
    
    try {
      Analytics.trackProject('refresh-start');
      
      // Your existing refresh logic
      const data = await fetchProjects();
      
      const duration = performance.now() - startTime;
      Analytics.trackProject('refresh-success', { 
        projectCount: data.length,
        duration: Math.round(duration)
      });
      
    } catch (error) {
      Analytics.trackError('projects-refresh-failed', 'MyProjects', { 
        error: error.message 
      });
    }
  };

  const handleProjectClick = (projectId: string) => {
    Analytics.trackEngagement('click-project', 'project-card', { 
      projectId 
    });
  };

  return (
    // Your existing component JSX with onClick handlers
  );
}
```

### Step 5: Track API Performance

**File**: `/Users/sghosh61/Documents/IDP/code-base/frontend/dex-platform-ui/src/services/starterKitApi.ts`

```typescript
import Analytics from '../utils/analytics';

export const starterKitApi = {
  async getProjects() {
    const startTime = performance.now();
    const endpoint = '/api/projects';
    
    try {
      const response = await fetch(endpoint);
      const duration = performance.now() - startTime;
      
      Analytics.trackApiCall(endpoint, 'GET', response.status, duration);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      const duration = performance.now() - startTime;
      Analytics.trackApiCall(endpoint, 'GET', 0, duration);
      Analytics.trackError('api-call-failed', endpoint, { error: error.message });
      throw error;
    }
  }
};
```

### Step 6: Add Website in Umami Dashboard

1. **Login to Umami**: `http://localhost:3000/dashboard`
   - Username: `admin`
   - Password: `umami`

2. **Add Website**:
   - Go to Settings → Websites
   - Click "Add Website"
   - **Name**: T-Mobile Developer Portal
   - **Domain**: `localhost:8080`
   - **Save** to get Website ID: `98907414-61b8-42ff-a1a0-028537840ccf`

3. **Configure Tracking**:
   - Copy the Website ID
   - Update `index.html` with the correct `data-website-id`

## How the Connection Works

### Data Flow Overview

```
T-Mobile App (localhost:8080)
       ↓
   [Umami Script Loads]
       ↓
[Automatic + Custom Events]
       ↓
 POST to localhost:3000/api/send
       ↓
   [Umami Server Processes]
       ↓
  [PostgreSQL Database]
       ↓
[Real-time Dashboard Updates]
```

### What Gets Tracked Automatically

1. **Page Views**: Every route change in your React app
2. **Sessions**: User session start/end
3. **Device Info**: Browser, OS, screen resolution
4. **Geographic Data**: Based on IP address (using GeoLite2 database)
5. **Referrers**: Where users came from

### What Gets Tracked Custom

1. **Project Operations**: Create, read, update, delete actions
2. **API Performance**: Response times, success/error rates  
3. **User Interactions**: Button clicks, modal opens, form submissions
4. **Authentication Events**: Login, logout, session management
5. **Error Tracking**: Application errors with context

### Verification Steps

1. **Check Script Loading**: 
   ```bash
   curl -I http://localhost:3000/script.js
   # Should return 200 OK
   ```

2. **Test Tracking Endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/send \
     -H "Content-Type: application/json" \
     -d '{"type":"event","payload":{"website":"98907414-61b8-42ff-a1a0-028537840ccf"}}'
   # Should return {"beep":"boop"}
   ```

3. **View Real-time Data**: Navigate your app and check Umami dashboard for immediate updates

## Final Verification Steps

### Complete System Check

**1. Verify All Services Running:**
```bash
# Check PostgreSQL
brew services list | grep postgresql
# Should show: postgresql@15 started

# Check Umami process
lsof -ti:3000
# Should return process ID (e.g., 50311)

# Check T-Mobile app
lsof -ti:8080  
# Should return process ID (e.g., 51301)
```

**2. Test Full Integration Chain:**
```bash
# Test Umami tracking endpoint
curl -s -X POST "http://localhost:3000/api/send" \
  -H "Content-Type: application/json" \
  -d '{"type":"event","payload":{"website":"98907414-61b8-42ff-a1a0-028537840ccf"}}'

# Expected response: {"beep":"boop"}
```

**3. Visual Verification:**
- Open `http://localhost:8080/` → T-Mobile Developer Portal loads
- Navigate between pages (/, /my-projects, /api-docs)
- Open `http://localhost:3000/login` → Umami login page
- Login with admin/umami → Dashboard shows real-time activity
- Check realtime page: `/websites/98907414-61b8-42ff-a1a0-028537840ccf/realtime`

**4. Confirm Tracking Working:**
- Active visitors should show "1" when you're using the app
- Page views should increment as you navigate
- Geographic data should appear (based on your IP location)
- Device information should be captured (browser, OS, screen size)

### Success Indicators

**System is fully operational when you see:**
- PostgreSQL service running without errors
- Umami responds with HTTP 307 redirect (normal behavior)  
- T-Mobile app loads without console errors
- Tracking API returns `{"beep":"boop"}`
- Real-time dashboard shows your activity
- No "command not found" errors in any terminal

## Analytics Implementation

### Enhanced Tracking Features

**Automatic Tracking:**
- Page views and navigation
- User sessions (login/logout)
- API calls with performance metrics
- Error monitoring
- Device and browser information

**Custom Event Tracking:**
```typescript
// Examples of implemented tracking
Analytics.trackProject('fetch-success', { projectCount: data.length })
Analytics.trackApiCall(endpoint, method, status, duration)
Analytics.trackEngagement('expand-project', 'project-card', { projectId })
Analytics.trackError('projects-fetch-failed', context, errorDetails)
```

**Modified Components:**
- `App.tsx`: Session and authentication tracking
- `MyProjects/index.tsx`: Project interaction tracking  
- `starterKitApi.ts`: API performance monitoring

## Running the Applications

### Required Services Running in Parallel

**To run Umami locally, you need these 3 components running simultaneously:**

1. **PostgreSQL Database Server** (background service)
2. **Umami Analytics Server** (Terminal 1 - port 3000)
3. **T-Mobile Developer Portal** (Terminal 2 - port 8080, optional for testing)

### Quick Status Check

```bash
# Check PostgreSQL service
brew services list | grep postgresql

# Check what's running on ports
lsof -ti:3000  # Umami
lsof -ti:8080  # T-Mobile app
```

### Terminal Setup Commands

**For each new terminal session, set the Node.js path:**
```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

### Step 1: Ensure PostgreSQL is Running

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@15

# Verify connection
psql -U sghosh61 -d umami_db -c "SELECT version();"
```

### Step 2: Start Umami Analytics

```bash
# Terminal 1: Start Umami (use correct path)
cd /Users/sghosh61/Documents/IDP/code-base/development/research/analytics-umami/umami
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Method 1: Background process (recommended)
nohup pnpm run dev > /dev/null 2>&1 &
# This returns process ID like [1] 50193

# Method 2: Foreground process
pnpm run dev
# Keep terminal open, shows real-time logs

# Available at: http://localhost:3000/dashboard
# Login: admin / umami
```

**Startup Process Details:**
```
⚠ Port 3000 is in use by process 48198, using available port 3001 instead.
   ▲ Next.js 15.4.7
   - Local:        http://localhost:3001
   - Network:      http://192.168.143.113:3001
   - Environments: .env

 ✓ Starting...
 ✓ Ready in 1.8s
```

**Important**: Check the actual port in startup logs and update your frontend tracking script if needed!

### Step 3: Start T-Mobile Developer Portal (Optional - for testing analytics)

```bash
# Terminal 2: Start T-Mobile App
cd /Users/sghosh61/Documents/IDP/code-base/frontend/dex-platform-ui
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
npm run dev

# Available at: http://localhost:8080/
```

### Complete Running System

**When all services are running, you should have:**

- **PostgreSQL**: Running as background service via Homebrew
- **Umami Dashboard**: `http://localhost:3000/dashboard` (admin/umami)
- **T-Mobile Portal**: `http://localhost:8080/` (with analytics tracking)

**Verification Commands:**
```bash
# Check all services are running
brew services list | grep postgresql  # Should show "started"
curl -s -I http://localhost:3000 | head -1  # Should return HTTP/1.1 200 OK
curl -s -I http://localhost:8080 | head -1  # Should return HTTP/1.1 200 OK
```

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. Command Not Found Errors**

**Node.js/npm/pnpm not found:**
```bash
# Check current PATH
echo $PATH

# Add Node.js to PATH (required for each terminal session)
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"

# Verify commands work
node --version
pnpm --version
```

**Prisma command not found:**
```bash
# Don't install globally, use npx instead
npx prisma migrate deploy
npx prisma generate

# Or use through pnpm
pnpm exec prisma migrate deploy
```

**2. Database Connection Issues**

**PostgreSQL:**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Fix permission errors
psql -d umami -c "GRANT ALL ON SCHEMA public TO umami;"
psql -d umami -c "ALTER SCHEMA public OWNER TO umami;"
```

**MySQL:**
```bash
# Check if MySQL is running
brew services list | grep mysql

# Fix connection errors
mysql -u root -p -e "GRANT ALL PRIVILEGES ON umami.* TO 'umami'@'localhost';"
```

**ClickHouse:**
```bash
# Check if ClickHouse is running
brew services list | grep clickhouse

# Test connection
clickhouse-client --query "SELECT 1"
```

**3. Port Already in Use**
- Umami uses port 3000
- T-Mobile app uses port 8080 
- If ports conflict, apps will automatically use alternative ports

**4. Docker Desktop Issues**
- We used Homebrew PostgreSQL instead of Docker due to organization restrictions
- This approach provides more control and fewer dependency issues

**5. Next.js Build Errors**
```bash
# Solution: Clean rebuild
cd /Users/sghosh61/Documents/umami
rm -rf .next
pnpm run dev
```

## 📈 Features & Tracking

### Real-Time Analytics Dashboard

**Metrics Available in Umami:**
- **Active Users**: Real-time visitor count
- **Page Views**: Route-based navigation tracking
- **Geographic Data**: User location information
- **Device Analytics**: Browser, OS, device type
- **Performance**: Page load times, API response times
- **Custom Events**: User interactions and business metrics

### Custom Event Categories

**Authentication Events:**
- Login/logout tracking
- Token refresh monitoring

**Project Management Events:**
- Project creation, deletion, viewing
- Project list refresh and expansion
- Project-related API calls

**Performance Events:**
- API response times
- Page load durations
- Component render times

**Engagement Events:**
- Button clicks and interactions
- Modal open/close actions
- Search and filter usage

**Error Events:**
- API failures with context
- Application errors with stack traces
- User experience issues

## Success Criteria

When everything is working correctly, you should see:

**In Umami Dashboard (`http://localhost:3000/dashboard`):**
- Real-time visitors: 1 (when you're using the app)
- Page views increasing as you navigate
- Custom events appearing in real-time
- Geographic and device data
- API performance metrics

**In T-Mobile App (`http://localhost:8080/`):**
- Full application functionality
- No console errors related to analytics
- Smooth user experience

## 📝 Development Notes

### Key Files Modified for Frontend Integration

**1. HTML Tracking Integration:**
- `index.html`: Added Umami tracking script with website ID

**2. Analytics Infrastructure:**
- `src/utils/analytics.ts`: Comprehensive analytics utility class
  - Custom event tracking methods
  - API performance monitoring
  - Error tracking with context
  - User identification and session management

**3. React Component Integration:**
- `src/App.tsx`: App-level session tracking and user identification
- `src/pages/Accelerators/MyProjects/index.tsx`: Component-level interaction tracking
- Other components: Button clicks, navigation events, user engagement

**4. API Monitoring:**
- `src/services/starterKitApi.ts`: API call performance tracking
- Request/response timing
- Success/failure rate monitoring
- Error context capture

**5. Integration Points:**
```typescript
// Automatic tracking (via script)
- Page views and navigation
- User sessions and device info
- Geographic and demographic data

// Custom tracking (via Analytics utility)
- Business logic events
- User interactions  
- API performance metrics
- Error monitoring with context
```

### Environment Variables
- `DATABASE_URL`: Database connection string (format depends on database type)
- `APP_SECRET`: Umami application secret key

### Database Configuration Examples

**PostgreSQL:**
```bash
DATABASE_URL=postgresql://umami:umami@localhost:5432/umami
```

**MySQL/MariaDB:**
```bash
DATABASE_URL=mysql://umami:umami_password@localhost:3306/umami
```

**ClickHouse:**
```bash
DATABASE_URL=clickhouse://default:@localhost:8123/umami
```

### Current Setup (PostgreSQL 15)
- **Host**: localhost:5432
- **Database Name**: umami
- **Username**: umami
- **Password**: umami

---

## 🎉 Conclusion

This setup provides a complete, self-hosted analytics solution that gives you full control over your data while providing comprehensive insights into user behavior, application performance, and business metrics.

The integration demonstrates advanced analytics implementation including custom event tracking, API monitoring, and real-time performance metrics - all while maintaining user privacy and data ownership.

## 🏗 Technical Architecture

### Complete Tech Stack
```
┌─────────────────────────────────────┐
│           Frontend Layer            │
├─────────────────────────────────────┤
│ T-Mobile Developer Portal           │
│ ├─ React 18.2.0 + TypeScript       │
│ ├─ Vite 7.1.12 (Build Tool)        │
│ ├─ Tailwind CSS 3.3.6              │
│ └─ Umami Tracking Script            │
├─────────────────────────────────────┤
│          Analytics Layer            │
├─────────────────────────────────────┤
│ Umami Analytics v2.19.0             │
│ ├─ Next.js 15.4.7 (Framework)      │
│ ├─ React 19.0.0 (UI Library)       │
│ ├─ Prisma 6.7.0 (Database ORM)     │
│ ├─ TypeScript 5.5.3 (Language)     │
│ └─ Node.js 20.19.5 (Runtime)       │
├─────────────────────────────────────┤
│          Database Layer             │
├─────────────────────────────────────┤
│ PostgreSQL 15.10                    │
│ ├─ Database: umami                  │
│ ├─ User: umami                      │
│ ├─ 13 Migration Files Applied       │
│ └─ GeoLite2 Geographic Database     │
├─────────────────────────────────────┤
│         Development Tools           │
├─────────────────────────────────────┤
│ Package Management: pnpm 10.20.0    │
│ Process Manager: Homebrew Services  │
│ Version Control: Git                │
│ Environment: macOS + Homebrew       │
└─────────────────────────────────────┘
```

### Build Process Breakdown

The Umami build process involves 6 critical steps:

1. **Environment Check** (`check-env`)
   - Validates `DATABASE_URL` and `APP_SECRET`
   - Ensures all required environment variables exist

2. **Database Schema Build** (`build-db`)
   - Copies database files based on detected database type
   - Generates Prisma client code
   - Creates TypeScript types for database models

3. **Database Validation** (`check-db`)
   - Tests database connection
   - Runs 13 migration files if needed
   - Creates default admin user (admin/umami)

4. **Tracking Script Build** (`build-tracker`)
   - Compiles client-side tracking JavaScript
   - Minifies and optimizes for performance
   - Creates `public/script.js` (the script your app loads)

5. **Geographic Database Setup** (`build-geo`)
   - Downloads MaxMind GeoLite2-City database
   - Enables location-based analytics
   - Saves to `geo/GeoLite2-City.mmdb`

6. **Next.js Application Build** (`build-app`)
   - Compiles 51 static pages
   - Optimizes React components
   - Creates production-ready application

**Performance Metrics from Our Build:**
- Build Time: ~26 seconds
- Bundle Size: 100KB base + components
- Database Migrations: 13 applied successfully
- Pages Generated: 51 static pages

---

**Setup Time**: 30-45 minutes (including troubleshooting)
**Maintenance**: Minimal - just keep PostgreSQL and Node.js services running
**Data Ownership**: 100% - all analytics data stays on your local machine
**Scalability**: Handles thousands of page views per day locally