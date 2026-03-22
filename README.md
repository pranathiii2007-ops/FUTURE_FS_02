# CRM Application 🚀

A modern, full-stack Customer Relationship Management (CRM) application built to be lightning-fast, secure, and user-friendly.

![Screenshot placeholder](https://via.placeholder.com/800x400?text=CRM+Application+Dashboard)

## ✨ Features

- **Secure Authentication**: Email and password authentication using Supabase.
- **Modern User Interface**: Designed with Tailwind CSS and Radix UI primitives for a sleek, responsive, and accessible experience.
- **Fast Performance**: Built on Vite and React (SWC) for rapid development and optimized production builds.
- **Type Safety**: Fully written in TypeScript to ensure code quality and prevent runtime errors.
- **End-to-End Testing**: Configured with Playwright and Vitest for reliable testing pipelines.
- **Theming**: Ships with Dark/Light mode support.

## 🛠 Tech Stack

- **Frontend Framework:** React 18, Vite
- **Styling & Components:** Tailwind CSS, shadcn/ui, Lucide React, Radix UI
- **Routing:** React Router v6
- **Data Fetching:** TanStack React Query
- **Backend & Database:** Supabase (Auth & PostgreSQL)
- **Forms & Validation:** React Hook Form, Zod
- **Testing:** Playwright, Vitest

## 📦 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (version 18+ recommended) and `npm` installed.

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   cd crm-buddy-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Set up your `.env` file at the root with your Supabase credentials.
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run locally at `http://localhost:8080/`.

## 📜 Available Scripts

- `npm run dev` - Starts the Vite development server.
- `npm run build` - Builds the application for production.
- `npm run preview` - Locally previews the production build.
- `npm run lint` - Runs ESLint to check for code issues.
- `npm run test` - Runs unit tests using Vitest.

## 🗂 Project Structure

```
├── src/
│   ├── components/   # Reusable UI components (shadcn/ui, layout)
│   ├── hooks/        # Custom React hooks
│   ├── integrations/ # Third-party service integrations (Supabase)
│   ├── lib/          # Helper utilities and libraries
│   ├── pages/        # Application routes and page views
│   └── App.tsx       # Root React component
├── tests/            # Playwright E2E tests
├── public/           # Static public assets
├── package.json      # Dependencies and scripts
└── vite.config.ts    # Vite bundler configuration
```

## 📄 License

This project is proprietary and confidential. unauthorized copying of any files via any medium is strictly prohibited.
