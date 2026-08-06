# 🏢 Real Estate CRM / SaaS Platform — Master Brief & Role-Action Matrix

Assalam-o-Alaikum! Is document mein public website signup flow se lekar har role ke specific actions, creation hierarchy (kaun kisko add karega), aur poora workflow detail se Roman Urdu mein explain kiya gaya hai.

---

## 🌐 1. Public Website Signup & Workspace Creation Flow

Public website par koi bhi Real Estate Agency Owner aakar 14-day free trial workspace bana sakta hai.

### 📝 Signup Form (`OPEN A WORKSPACE`)
- **Fields**:
  - `AGENCY NAME`: e.g. *Meridian Estates*
  - `YOUR NAME`: e.g. *Hina Raza* (Owner Name)
  - `OFFICE CITY`: Select Dropdown (e.g. *Karachi*)
  - `WORK EMAIL`: `you@agency.com`
  - `PASSWORD`: `••••••••`
- **Action**: `Create workspace →` button click karne par.

### ⚙️ Backend Process on Signup (`/api/v1/auth/register-workspace`):
1. **Prisma Transaction** chalega:
   - Pehle `Agency` record create hoga (`status: TRIAL`, `14 days trial`, `tenancy ID` generated).
   - Phir `User` record create hoga (`role: AGENCY_OWNER`, `agencyId: agency.id`, hashed password).
   - Default `AgencySetting` aur default `RolePermission` records create honge.
2. System auto-login karke **JWT Access & Refresh Tokens** return karega.
3. Owner direct apne newly created **Agency Dashboard** par redirect ho jayega.

---

## 👥 2. Complete Hierarchy: Kaun Kisko Add Karega (Creation Chain)

```
[System Seed / Super Admin]
        │
        ├── 1. Creates Subscription Plans & System Settings
        └── 2. Can Manually Add/Suspend Agencies & Users
                │
                ▼
      [AGENCY_OWNER] (Created via Website Signup)
        │
        ├── Invites ➔ [OFFICE_MANAGER] (Branch Manager)
        ├── Invites ➔ [PROPERTY_MANAGER] (Rental Manager)
        └── Invites ➔ [AGENT] (Sales Agents)
                │
                ▼
      [OFFICE_MANAGER]
        │
        └── Can also Invite ➔ [AGENT] (Sales Agents)
```

---

## 🛠️ 3. Detailed Role-by-Role Actions & Permissions

---

### 🌐 ROLE 1: SUPER_ADMIN (Platform Owner)
- **Kaun Add Karta Hai?**: Database seeding se create hota hai.
- **Kisko Add Kar Sakta Hai?**: Manual Agencies (`+ Add agency`), Subscription Plans (`+ New plan`), aur Global Users.
- **Main Actions**:
  1. **Agencies Overview (`/agencies`)**: Tamam agencies ka status (`ACTIVE`, `PAST_DUE`, `SUSPENDED`, `TRIAL`), seats, listings, storage, aur MRR check karna/suspend karna.
  2. **Subscription Plans (`/subscription-plans`)**: Plans (Starter $99, Pro $349, Enterprise $899) aur 7 Feature Flags matrix configure karna.
  3. **Invoices Ledger (`/invoices`)**: Global billing, collected revenue ($14,269), overdue invoices ($3,395) dekna.
  4. **Vocabulary Configuration (`/categories-and-types`)**: System-wide Property Types, Listing Statuses, Amenities, aur Lead Sources add/edit karna.
  5. **Platform Reports (`/platform-reports`)**: Overall growth, retention (94%), churn %, revenue analytics report.
  6. **System Settings (`/system-settings`)**: Trial length (14 days), AWS S3 storage region, Stripe, Twilio, Mapbox keys, aur Maintenance Mode toggle karna.

---

### 👑 ROLE 2: AGENCY_OWNER (Agency Boss)
- **Kaun Add Karta Hai?**: Public Website Signup Form se banta hai.
- **Kisko Add Kar Sakta Hai?**: `OFFICE_MANAGER`, `PROPERTY_MANAGER`, aur `AGENT` ko invite kar sakta hai (`Team & roles`).
- **Main Actions**:
  1. **Agency Dashboard (`/dashboard`)**: Total properties (96), active listings (64), sold/rented (20), pipeline value (156 Cr), quarterly revenue (97 Cr), top performers leaderboard.
  2. **Team & Roles (`/team-and-roles`)**: Members invite karna (`+ Invite member`), role assign karna, aur **Permission Matrix** (`FULL`, `EDIT`, `VIEW`, `NONE`) configure karna.
  3. **Subscription & Billing (`/subscription`)**: Current plan (Enterprise $899/mo), usage limits (seats/listings/storage), VISA payment card update karna, invoices download karna.
  4. **Agency Settings (`/agency-settings`)**: Profile details, logo upload, brand color (`#0F281E`), custom domain (`listings.meridian.pk`), photo watermarking toggle, portal integrations (Zameen.com, Graana), email/SMS notification preferences.
  5. **Full Operational Control**: Properties, Clients, Viewings, Deals, Documents, Agents, aur Reports sab par FULL control.

---

### 👔 ROLE 3: OFFICE_MANAGER (Branch / Sales Floor Manager)
- **Kaun Add Karta Hai?**: `AGENCY_OWNER` add karta hai.
- **Kisko Add Kar Sakta Hai?**: `AGENT` team members ko add/invite kar sakta hai (`+ Invite agent`).
- **Main Actions**:
  1. **Office Dashboard (`/dashboard`)**: Branch-specific metrics (Clifton office), sales pipeline, lead conversion (34%), upcoming viewings.
  2. **Listing Approval Sign-off**: Agents ki banayi hui new property listings (prices & photos) ko verify karke approve karna tabhi listing live hogi (`requireManagerApproval`).
  3. **Lead Distribution**: Incoming unassigned leads (18 unassigned leads) ko agents ko assign karna.
  4. **Operations Management**: Viewings schedule karna, deals kanban pipeline view karna, documents manage karna.
  5. **Reports Export (`/reports`)**: Sales, Lettings, Agent Performance, Lead Conversion, Stock Position CSV & PDF reports export karna.
  - ❌ *Restricted*: Billing, Subscription, Agency Settings, and Team Permission Matrix are hidden.

---

### 🔑 ROLE 4: PROPERTY_MANAGER (Lettings & Rental Portfolio Lead)
- **Kaun Add Karta Hai?**: `AGENCY_OWNER` ya `OFFICE_MANAGER` add karta hai.
- **Kisko Add Kar Sakta Hai?**: Members add nahi kar sakta.
- **Main Actions**:
  1. **Lettings Desk (`/lettings-desk`)**: Rental properties (36 properties), active rental listings (22), rented units (9), open rental leads (12), rental pipeline (4.40 Cr).
  2. **Managed Stock (`/managed-stock`)**: Rental inventory manage karna, rental specs (beds, baths, rent price in Lac/mo).
  3. **Landlords & Tenants (`/landlords-and-tenants`)**: Landlords & Tenants contacts manage karna (17 contacts), stage progression (`New` → `Won`/`Lost`).
  4. **Tenancies Kanban (`/tenancies`)**: Rental lease deals pipeline (11 deals, 3.94 Cr pipeline) handle karna.
  5. **Rental Documents**: Lease contracts, floor plans, NOCs, payment receipts upload/manage karna.

---

### 🎯 ROLE 5: AGENT (Field Sales Representative)
- **Kaun Add Karta Hai?**: `AGENCY_OWNER` ya `OFFICE_MANAGER` add karta hai.
- **Kisko Add Kar Sakta Hai?**: Clients/Leads add kar sakta hai aur Properties submit kar sakta hai (manager approval ke baad live hogi).
- **Main Actions**:
  1. **My Day (`/my-day`)**: Agent ka personal dashboard (11 properties, 5 live deals, 27 Cr pipeline, personal viewings agenda).
  2. **My Listings (`/my-listings`)**: Agent ki apni properties list view karna, new property add karna (`+ Add property`).
  3. **My Leads (`/my-leads`)**: Agent ko assigned 6 leads manage karna, lead notes update karna, stage move karna (`NEW` → `QUALIFIED` → `NEGOTIATING`).
  4. **My Viewings (`/my-viewings`)**: Personal viewing appointments handle karna, status update karna (`SCHEDULED` → `CONFIRMED` → `COMPLETED`).
  5. **My Deals (`/my-deals`)**: Personal deals kanban pipeline update karna (`OFFER RECEIVED` → `NEGOTIATION` → `AGREEMENT` → `PAYMENT`).
  6. **My Commission (`/my-commission`)**: Personal commission tracker (1.5% rate, PKR 67.9 Lac commission booked, 53.2 Lac riding on live deals, next payout 05 Sep, payout statement download).

---

## 📊 Summary Comparison Matrix

| Action / Feature | SUPER_ADMIN | AGENCY_OWNER | OFFICE_MANAGER | PROPERTY_MANAGER | AGENT |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Website Public Signup** | ❌ (Seeded) | ✅ (Creates Workspace) | ❌ | ❌ | ❌ |
| **Add Team Members** | ✅ (Agencies) | ✅ (All Roles) | ✅ (Agents) | ❌ | ❌ |
| **Manage Billing & Plan** | ✅ (Global) | ✅ (Agency Plan) | ❌ | ❌ | ❌ |
| **Configure Agency Settings** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Approve Property Listings** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Manage Sales & Deals** | ❌ | ✅ | ✅ | ❌ | ✅ (Own Deals) |
| **Manage Rental Stock & Leases**| ❌ | ✅ | ✅ | ✅ | ❌ |
| **Personal Commission Tracker** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

### 🧠 Mind Status: 100% CRYSTAL CLEAR! 🎉
Public signup flow se lekar har role ke exact actions, permissions, aur creation chain [PROJECT_ARCHITECTURE_GUIDE.md](file:///d:/www/my-node-project/PROJECT_ARCHITECTURE_GUIDE.md) mein completely document ho chuke hain! 🚀
