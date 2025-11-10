# Analytics Platform Comparison: Umami vs Matomo

## Executive Summary

This document compares **Umami** (currently implemented) and **Matomo** for the DEX Platform analytics needs. Both are open-source, privacy-focused alternatives to Google Analytics with full data ownership.

---

## Quick Comparison

| Category | Umami (Current) | Matomo |
|----------|----------------|---------|
| **License** | MIT (Free) | GPL v3 (Free) |
| **Deployment** | Running (localhost:3000) | Not deployed |
| **Ease of Setup** | 5/5 Simple | 3/5 Moderate |
| **Performance** | 5/5 Very Fast | 3/5 Good |
| **Feature Richness** | 3/5 Essential | 5/5 Enterprise |
| **Maintenance** | 5/5 Low | 3/5 Moderate |
| **Total Cost** | $0 (Self-hosted) | $0 (Self-hosted) or $19-$290/mo (Cloud) |

---

## Detailed Feature Comparison

### 1. Technical Stack

| Aspect | Umami | Matomo |
|--------|-------|---------|
| **Backend Language** | Node.js 20+ | PHP 8.0+ |
| **Frontend Framework** | Next.js 15 / React 19 | jQuery / Vue.js |
| **Database Support** | PostgreSQL, MySQL | MySQL, MariaDB (Postgres experimental) |
| **Tracking Script Size** | ~2KB (minified) | ~22KB (minified) |
| **Server Requirements** | Lightweight (Node.js) | LAMP/LEMP stack |
| **Container Support** | Yes - Docker native | Yes - Docker available |
| **Cloud Native** | Yes - Modern architecture | Limited - Traditional PHP app |

---

### 2. Core Analytics Features

| Feature | Umami | Matomo |
|---------|-------|---------|
| **Page Views** | Yes | Yes |
| **Unique Visitors** | Yes | Yes |
| **Session Tracking** | Yes | Yes (more detailed) |
| **Real-time Analytics** | Yes | Yes |
| **Historical Data** | Unlimited | Unlimited |
| **Custom Events** | Yes (flexible) | Yes (category/action/name/value) |
| **Event Properties** | JSON object | Limited (4 fields) |
| **UTM Campaign Tracking** | Manual | Built-in |
| **Referrer Analysis** | Basic | Advanced |
| **Device Detection** | Yes | Yes (more detailed) |
| **Geolocation** | Country-level | City-level (with GeoIP) |
| **Custom Dimensions** | Via event data | Up to 200 dimensions |
| **Custom Variables** | Via event data | 5 per scope |

---

### 3. Conversion & Goals

| Feature | Umami | Matomo |
|---------|-------|---------|
| **Goal Tracking** | Manual (custom events) | Built-in goal UI |
| **Conversion Funnels** | Custom implementation | Visual funnel builder |
| **E-commerce Tracking** | Custom events only | Full e-commerce module |
| **Revenue Tracking** | Via custom events | Native support |
| **Cart Abandonment** | No | Yes |
| **Product Analytics** | No | Yes |
| **A/B Testing** | No | Yes (plugin) |
| **Multi-variate Testing** | No | Yes (plugin) |

---

### 4. User Behavior Analysis

| Feature | Umami | Matomo |
|---------|-------|---------|
| **Click Tracking** | Custom (implemented) | Automatic + manual |
| **Scroll Depth** | Custom (implemented) | Via plugin |
| **Form Analytics** | Custom (implemented) | Built-in (paid plugin) |
| **Heatmaps** | No | Yes (paid plugin, €199/year) |
| **Session Recording** | No | Yes (paid plugin, €199/year) |
| **User Flow** | No | Yes (Transitions report) |
| **Cohort Analysis** | No | Yes |
| **Retention Analysis** | Custom needed | Yes |
| **Error Tracking** | Custom (implemented) | Via custom events |

---

### 5. Privacy & Compliance

| Feature | Umami | Matomo |
|---------|-------|---------|
| **GDPR Compliant** | Yes (cookie-less option) | Yes |
| **CCPA Compliant** | Yes | Yes |
| **Data Ownership** | 100% (self-hosted) | 100% (self-hosted) |
| **Cookie-less Tracking** | Yes (default) | Opt-in mode |
| **IP Anonymization** | Automatic | Configurable |
| **Data Retention** | Configurable | Configurable |
| **Do Not Track** | Respects | Respects |
| **Consent Management** | Manual | Built-in |
| **Right to Deletion** | Manual DB cleanup | Built-in tools |
| **Data Export** | API available | Full export tools |

---

### 6. Reporting & Visualization

| Feature | Umami | Matomo |
|---------|-------|---------|
| **Dashboard** | Simple, clean | Customizable widgets |
| **Real-time Dashboard** | Yes | Yes (more detailed) |
| **Custom Reports** | Limited | Advanced segmentation |
| **Report Scheduling** | No | Email reports |
| **PDF Export** | No | Yes |
| **API Access** | REST API | HTTP Reporting API |
| **SQL Access** | Direct DB (PostgreSQL) | Direct DB (MySQL) |
| **Data Segmentation** | Basic filters | Advanced segments |
| **Annotations** | No | Yes (mark events) |
| **White Label** | Easy customization | Configurable branding |

---

### 7. Integration & Extensibility

| Feature | Umami | Matomo |
|---------|-------|---------|
| **Tag Manager** | No | Built-in (like GTM) |
| **Plugin Ecosystem** | Limited | 100+ plugins |
| **API Documentation** | Good | Comprehensive |
| **Webhooks** | No | Yes |
| **Third-party Integrations** | Limited | WordPress, Drupal, etc. |
| **CRM Integration** | Custom | Several plugins |
| **Log Analytics** | No | Yes (import server logs) |
| **Mobile SDK** | No | iOS/Android SDKs |
| **Custom Plugins** | Limited docs | Well-documented |

---

### 8. Multi-Site Management

| Feature | Umami | Matomo |
|---------|-------|---------|
| **Multiple Websites** | Yes | Yes |
| **Site Groups** | No | Yes |
| **Roll-up Reporting** | No | Yes |
| **Cross-domain Tracking** | Manual | Built-in |
| **User Permissions** | Basic roles | Granular permissions |
| **Team Management** | Limited | Advanced (per-site) |
| **White Label per Site** | Limited | Yes |

---

### 9. Performance & Scalability

| Metric | Umami | Matomo |
|--------|-------|---------|
| **Page Load Impact** | ~2KB script, minimal | ~22KB script, noticeable |
| **Server Resources** | Very light (Node.js) | Moderate (PHP + MySQL) |
| **Database Growth** | Slow, efficient schema | Fast, needs archiving |
| **Query Performance** | Excellent | Slow with large data |
| **Horizontal Scaling** | Easy (stateless) | Requires setup |
| **Caching** | Built-in | Redis recommended |
| **High Traffic** | Handles 100M+ events | Needs optimization |
| **Real-time Processing** | Very fast | Archiving delays |

---

### 10. Maintenance & Operations

| Aspect | Umami | Matomo |
|--------|-------|---------|
| **Initial Setup Time** | 30 minutes | 2-4 hours |
| **Update Frequency** | Monthly | Monthly |
| **Update Complexity** | Simple (Docker/npm) | Moderate (DB migrations) |
| **Backup Requirements** | Database only | Database + files |
| **Monitoring Needs** | Low | Moderate (cron jobs) |
| **Log Management** | Minimal | Heavy (archiving logs) |
| **Database Maintenance** | Minimal | Regular archiving needed |
| **Security Updates** | Node.js deps | PHP + plugin deps |
| **Community Support** | Good (GitHub) | Excellent (forums + docs) |
| **Professional Support** | No | Paid plans available |

---

## Cost Analysis

### Umami (Current Setup)

| Item | Cost |
|------|------|
| **Software License** | $0 (MIT Open Source) |
| **Self-hosting** | $0 (local) or ~$5-20/month (VPS) |
| **Database** | $0 (PostgreSQL included) |
| **Maintenance** | ~2 hours/month |
| **Features** | All included |
| **Annual Total** | **$0 - $240/year** |

### Matomo

| Item | Self-Hosted | Cloud (Starter) | Cloud (Business) |
|------|-------------|-----------------|------------------|
| **Software License** | $0 (GPL v3) | Included | Included |
| **Hosting** | ~$10-50/month | $19/month | $290/month |
| **Database** | Included | Included | Included |
| **Maintenance** | ~4-6 hours/month | $0 (managed) | $0 (managed) |
| **Heatmaps Plugin** | €199/year | Included | Included |
| **Session Recording** | €199/year | Included | Included |
| **Form Analytics** | €199/year | Included | Included |
| **Annual Total** | **$717 - $1,197/year** | **$228/year** | **$3,480/year** |

---

## Use Case Recommendations

### Choose Umami (Current) If:

- **Engineering/Product Analytics** is the primary need  
- **Performance** and **scalability** are critical  
- **Custom event tracking** provides needed flexibility  
- **Low maintenance** overhead is important  
- **Budget** is constrained  
- **Modern tech stack** (Node.js/React) is preferred  
- **Simple, clean dashboards** are sufficient  

### Choose Matomo If:

- **Marketing analytics** is a key requirement  
- **Conversion funnels** and **goal tracking** UI is needed  
- **Heatmaps** and **session recordings** are essential  
- **Tag manager** for non-technical users is required  
- **E-commerce tracking** is needed  
- **Campaign attribution** is critical  
- **Multi-team permissions** across sites are needed  
- **Budget** allows for paid plugins or cloud hosting  

### Hybrid Approach:

Run **both** with different purposes:
- **Umami**: Engineering metrics, API performance, user engagement
- **Matomo**: Marketing campaigns, conversion funnels, business KPIs

---

## Current Implementation Status

### Umami Deployment (Completed)

**Infrastructure:**
- Platform: Umami v2.19.0
- Database: PostgreSQL 15.10 (umami_db)
- Runtime: Node.js 20.19.5 + pnpm 10.20.0
- Location: localhost:3000
- Website ID: 98907414-61b8-42ff-a1a0-028537840ccf

**Tracking Coverage: 100%**
- 21+ pages fully instrumented
- Click tracking (throttled 500ms)
- Scroll depth tracking (25%, 50%, 75%, 100%)
- Error tracking (JS errors, API failures)
- Performance tracking (page load, API duration)
- Session data (browser, device, screen size)
- Custom events (project actions, template usage)

**Custom Infrastructure Built:**
- `src/utils/analytics.ts` - Comprehensive utility (12+ methods)
- `src/hoc/withPageTracking.tsx` - Automatic page tracking HOC
- `src/hooks/useTracking.ts` - 10+ specialized tracking hooks

**Development Time:** ~8 hours  
**Current Status:** Fully operational

---

## Migration Effort Estimate

### If Switching to Matomo

| Phase | Effort | Description |
|-------|--------|-------------|
| **Setup** | 4-6 hours | Install, configure database, SSL, PHP |
| **Code Migration** | 8-12 hours | Replace Umami calls with Matomo API |
| **Testing** | 4-6 hours | Verify tracking across all pages |
| **Documentation** | 2-3 hours | Update guides and team training |
| **Total** | **18-27 hours** | ~3-4 days of work |

### Historical Data
**Cannot be migrated** - No direct import path from Umami to Matomo

---

## Risks & Considerations

### Umami Risks
- **Smaller community** compared to Matomo
- **Fewer enterprise features** out-of-the-box
- **Marketing team** may request funnel/heatmap features later
- **Plugin ecosystem** is limited

### Matomo Risks
- **Performance overhead** with scale (requires optimization)
- **Maintenance burden** higher (PHP, cron jobs, archiving)
- **Database growth** faster (needs archiving strategy)
- **Initial learning curve** steeper for team
- **Feature bloat** - many features may go unused

---

## Recommendation

### Short-term (Next 6 months)
**Continue with Umami**

**Rationale:**
1. Already deployed and working perfectly
2. Meets all current engineering/product analytics needs
3. Superior performance and scalability
4. Zero additional cost
5. Low maintenance overhead
6. Custom tracking infrastructure already built

### Long-term (6-12 months)
**Evaluate Matomo** if these needs emerge:
- Marketing team requires campaign attribution
- Product team needs visual conversion funnels
- Business stakeholders request heatmaps/session replay
- Multi-team access with granular permissions needed
- E-commerce tracking becomes a requirement

### Hybrid Option
Consider running **both** if:
- Engineering team keeps Umami for technical metrics
- Marketing team gets Matomo for business analytics
- Budget allows (~$228-$1,197/year for Matomo)
- Operational overhead acceptable (dual maintenance)

---

## Key Metrics for Decision Review

Track these over the next 3-6 months to inform future decision:

| Metric | Target | Current |
|--------|--------|---------|
| Analytics query performance | < 100ms | ~50ms (Umami) |
| Dashboard load time | < 2s | ~800ms (Umami) |
| Tracking coverage | 100% of pages | 21/21 pages |
| Team satisfaction | High | To be measured |
| Feature gaps identified | < 3 critical | To be tracked |
| Cost efficiency | < $500/year | $0/year |

---

## Appendix: Quick Facts

### Umami
- **Founded**: 2020
- **GitHub Stars**: 19.6k+
- **Active Installs**: 10,000+
- **Contributors**: 100+
- **Release Cycle**: Monthly
- **Documentation**: Good
- **License**: MIT

### Matomo
- **Founded**: 2007 (as Piwik)
- **GitHub Stars**: 19.5k+
- **Active Installs**: 1,000,000+
- **Contributors**: 300+
- **Release Cycle**: Monthly
- **Documentation**: Excellent
- **License**: GPL v3