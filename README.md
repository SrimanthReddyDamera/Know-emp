# Know-Emp — Knowledge Base Management System

A full-stack internal knowledge base platform for organizations to manage employees and share knowledge efficiently. Built with **Next.js**, **Supabase**, and **TypeScript**.

## Features

- **Role-Based Access Control** — Admin, Employee, and Tech Support roles with dedicated dashboards
- **Knowledge Base** — Create, search, and manage knowledge entries with an approval workflow
- **Employee Management** — Admins can create, edit, and manage employee accounts
- **AI Chat Assistant** — Integrated AI-powered chat widget for quick answers
- **Responsive Design** — Works seamlessly on desktop and mobile devices
- **Secure Authentication** — Email/password auth with password reset support

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS + shadcn/ui
- **AI Integration:** Groq API
- **Deployment:** Vercel

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GROQ_API_KEY=your_groq_api_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Deployment

This project is deployed on **Vercel**. For detailed deployment instructions, see [DEPLOY.md](./DEPLOY.md).
