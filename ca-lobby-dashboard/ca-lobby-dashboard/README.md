# CA Lobby Dashboard

A secure, modern dashboard application built with Next.js 14, TypeScript, Tailwind CSS, and Clerk authentication.

## Features

- 🔐 **Secure Authentication** - Powered by Clerk
- 🎨 **Modern UI** - Built with Tailwind CSS
- ⚡ **Fast Performance** - Next.js 14 with Turbopack
- 📱 **Responsive Design** - Works on all devices
- 🚀 **Vercel Ready** - Optimized for deployment

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Clerk account ([Sign up here](https://clerk.com))

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo-url>
cd ca-lobby-dashboard
npm install
```

2. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

3. **Configure Clerk:**
   - Go to [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Copy your API keys
   - Update `.env.local` with your keys (NEVER commit this file):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

4. **Run the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Protected dashboard page
│   ├── sign-in/           # Sign-in page
│   ├── sign-up/           # Sign-up page
│   ├── layout.tsx         # Root layout with ClerkProvider
│   └── page.tsx           # Landing page
├── middleware.ts          # Clerk middleware for route protection
└── ...
```

## Authentication Flow

1. **Landing Page** (`/`) - Shows sign-in/sign-up options
2. **Authentication** - Handled by Clerk
3. **Dashboard** (`/dashboard`) - Protected page showing user info
4. **Automatic Redirects** - Authenticated users go to dashboard

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Import your repository
4. Add environment variables (see DEPLOYMENT.md)
5. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page URL | No |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page URL | No |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in | No |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up | No |

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk
- **Deployment:** Vercel

## 🔒 Security

- **Environment Variables:** Never commit `.env.local` files to version control
- **API Keys:** Keep Clerk keys secure and rotate them regularly
- **GitIgnore:** All `.env*` files are automatically ignored by git

## Next Steps

To get your dashboard fully functional:

1. **Get Clerk API Keys:**
   - Sign up at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your keys to `.env.local`

2. **Customize the Dashboard:**
   - Edit `src/app/dashboard/page.tsx`
   - Add your business logic
   - Integrate with your APIs

3. **Deploy:**
   - Follow the deployment guide in `DEPLOYMENT.md`
   - Add environment variables to Vercel
   - Test your production deployment

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.