# Kanban Auth UI – Next.js + Tailwind CSS + NextAuth

A modern, responsive, and animated authentication UI for a Kanban board app. Built using Next.js, Tailwind CSS, NextAuth.js, Framer Motion, and Lucide Icons.

## Features

- Animated login and register pages
- Theme toggle (light/dark mode)
- Placeholder support for all fields
- Email/password authentication using NextAuth credentials provider
- Toast notifications for success and error messages
- Demo login option for instant access
- Fully responsive and mobile-friendly design
- Clean, modern, accessible UI

## Tech Stack

- **Next.js** – React framework for server-side rendering and routing
- **Tailwind CSS** – Utility-first CSS framework
- **NextAuth.js** – Authentication system
- **Framer Motion** – Animation library for smooth transitions
- **Lucide Icons** – Icon set
- **TypeScript** – Static typing
- **Custom Toast Hook** – For UI feedback

## Folder Structure

- `app/` – Contains login, register, dashboard pages
- `components/ui/` – Reusable UI components like Input, Button, Card
- `lib/` – Auth and helper utilities
- `pages/api/auth/` – NextAuth API route for credentials provider
- `public/` – Static assets
- `styles/` – Global styles

## Authentication Flow

1. Users register with name, email, and password.
2. On successful registration, they’re redirected to the login page.
3. On login, users are authenticated via NextAuth and redirected to the dashboard.

## Demo Credentials

Email: `demo@example.com`  
Password: `demopassword`

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/kanban-auth-ui.git
cd kanban-auth-ui
