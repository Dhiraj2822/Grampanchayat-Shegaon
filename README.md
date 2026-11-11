# 🏛️ Digital Gram Panchayat Portal

A modern government website for Gram Panchayat built with React, TypeScript, and Supabase.

## ✅ Features

### Public Features
- **Home Page**: Hero carousel, flash news, statistics, Sarpanch message
- **About Us**: Village history, geography, demographics
- **Administration**: Elected body, staff, committees
- **Citizen Services**: Certificate applications, grievance submission, tax payment
- **Development**: Works list, GPDP, tenders
- **Schemes**: Central & state government schemes
- **Transparency**: RTI, Gram Sabha, BPL list
- **Gallery**: Photo & video gallery
- **Contact**: Office contact information

### Admin Features
- **Content Management System (CMS)**: Manage all public content
- **Certificate Management**: Process citizen applications
- **User Management**: Admin roles and permissions
- **Dashboard**: Statistics and activity overview

### Security
- Role-based access control (citizen, admin, super_admin)
- Budget/financial data restricted to admins only
- Login required for certificate applications
- Row Level Security (RLS) policies

## 🚀 Quick Start

### 1. Setup Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. For a fresh Shegaon project, run only the safe execution order documented
   below. Do not run Hallali seed/update files, cleanup scripts, recovery
   scripts, or verification queries.

### 2. Create Admin Users in Supabase

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create User"
3. Create Super Admin:
   - Email: `superadmin@gmail.com`
   - Password: Your choice
   - Copy the generated UUID
4. Do not copy admin UUIDs from `2025-12-14_seed.sql`. Create new Auth users in
   this Supabase project and use their generated UUIDs in the profiles table.

### Fresh Shegaon migration order

Run these files in this order:

1. `2025-12-14_schema.sql`
2. `2025-12-14_policies.sql`
3. `2025-12-14_storage.sql`
4. `2025-12-15_add_file_upload_support.sql`
5. `2025-12-15_create_missing_buckets.sql`
6. `2025-12-15_increase_bucket_limits.sql`
7. `2025-12-16_payment_system.sql`
8. `2025-12-16_update_cms_schemes.sql`
9. `2026-10-21_complete_cms_schema.sql`
10. `2026-10-21_user_role_management.sql`
11. `2026-10-21_rls_hardening.sql`
12. `2026-10-28_shegaon_application_compatibility.sql`
13. `2026-10-28_set_shegaon_defaults.sql`

Use `supabase/verification/2026-10-28_shegaon_verification.sql` afterward; it
is read-only. Do not run `2025-12-14_seed.sql`,
`2025-12-15_utf8_encoding_fix.sql`, `2025-12-16_cleanup_data.sql`,
`2025-12-15_update_certificate_tables.sql`,
`2026-10-21_auth_users_repair.sql`,
`2026-10-21_database_recovery.sql`, or
`2026-10-21_update_panchayat_name.sql` on a fresh Shegaon project.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

### 5. Deploy

```bash
npm run build
# Upload dist folder to Netlify, Vercel, or any static host
```

## 👥 User Roles

| Role | Access |
|------|--------|
| **citizen** | View public content, apply for certificates, submit grievances |
| **admin** | All citizen access + manage CMS content + process requests |
| **super_admin** | All admin access + manage users + view budget/financial data |

## 📊 Database Tables

### CMS Tables (Public Content)
- `cms_website_settings` - Site configuration
- `cms_elected_officials` - Elected body members
- `cms_staff` - GP staff members
- `cms_development_works` - Development projects
- `cms_schemes` - Government schemes
- `cms_flash_news` - Marquee news
- `cms_tenders` - Tender notices
- `cms_downloads` - Downloadable forms
- `cms_video_gallery` - Video content

### Citizen Tables (User Submissions)
- `cit_birth_certificate` - Birth certificate applications
- `cit_death_certificate` - Death certificate applications
- `cit_marriage_certificate` - Marriage certificate applications
- `cit_bpl_certificate` - BPL certificate applications
- `cit_no_dues_certificate` - No dues certificate applications
- `cit_property_tax_extract` - Property tax extract requests
- `cit_destitute_certificate` - Destitute certificate applications
- `cit_complaints` - Citizen grievances
- `cit_service_requests` - General service requests

## 🔧 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Deployment**: Netlify/Vercel (free tier)

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── GPHeader.tsx   # Main navigation
│   ├── GPFooter.tsx   # Footer
│   ├── ContentManagement.tsx  # CMS admin panel
│   ├── CertificateFormsPage.tsx  # Certificate forms (A-G)
│   └── ...            # Other page components
├── contexts/          # React contexts (Auth)
├── hooks/             # Custom React hooks
├── lib/               # Supabase client & utilities
├── types/             # TypeScript types
└── App2.tsx           # Main application

supabase/migrations/
├── 2025-12-14_schema.sql    # Database schema
├── 2025-12-14_policies.sql  # RLS policies
└── 2025-12-14_seed.sql      # Initial data
```

## 🧪 Testing Checklist

See TESTING_CHECKLIST.md for complete testing guide.

## 📝 Validation Rules

- **Mobile Number**: Must be exactly 10 digits
- **Email**: Must be @gmail.com address
- **Certificate Forms**: All required fields must be filled

## 💰 Cost: $0/month

This project runs entirely on Supabase's free tier:
- 500MB Database
- 1GB Storage
- 50,000 monthly active users
- Unlimited API requests

## 📄 License

This project is for Gram Panchayat use.
