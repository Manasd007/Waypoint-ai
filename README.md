# Waypoint - AI-Powered Travel Planning Platform

Waypoint is a modern travel planning platform that uses artificial intelligence to create personalized travel itineraries. Built with cutting-edge technologies, it helps travelers plan their trips efficiently by generating detailed itineraries, recommendations, and travel insights.

## Features

- **AI-Powered Itinerary Generation**: Create detailed travel plans with just a simple prompt
- **Smart Recommendations**: Get personalized suggestions for activities, restaurants, and attractions
- **Collaborative Planning**: Share and collaborate on travel plans with friends and family
- **Expense Tracking**: Keep track of your travel budget and expenses
- **Interactive Maps**: Visualize your travel destinations and routes
- **Email Integration**: Share plans via email with a custom domain
- **Secure Authentication**: Protected user accounts and data management

## Tech Stack

- **Frontend**: 
  - Next.js 15
  - Tailwind CSS
  - Shadcn UI Components
  - TypeScript

- **Backend**:
  - Convex (Backend-as-a-Service)
  - Google Gemini AI Integration
  - Clerk Authentication
  - Razorpay Payment Processing
  - Resend Email Service

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- Google Gemini API key
- Clerk account
- Convex account
- Google Maps API key
- Razorpay account (optional)
- Resend account (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Manasd007/Waypoint-ai.git
cd Waypoint-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy `env.example` to `.env.local`
   - Fill in your API keys and configuration values

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# Google Maps API (Required)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Convex (Required)
NEXT_PUBLIC_CONVEX_URL=your_convex_url_here
CONVEX_DEPLOY_KEY=your_convex_deploy_key_here

# Next.js (Required)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Resend (Optional - for emails)
RESEND_API_KEY=your_resend_api_key_here

# Stripe (Optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Razorpay (Optional - for payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Google Gemini API (Required)
GOOGLE_GEMINI_API_KEY=AIza_your_gemini_api_key_here
```

### Required API Keys Setup

1. **Google Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env.local` file

2. **Clerk Authentication**:
   - Visit [Clerk Dashboard](https://dashboard.clerk.com/)
   - Create a new application
   - Copy the publishable and secret keys

3. **Convex Backend**:
   - Visit [Convex Dashboard](https://dashboard.convex.dev/)
   - Create a new project
   - Copy the deployment URL and deploy key

4. **Google Maps API**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API and Places API
   - Create an API key

## Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

### Project Structure

```
waypoint/
├── app/                 # Next.js app directory
├── components/          # React components
├── convex/             # Convex backend functions
├── lib/                # Utility functions and shared code
│   ├── gemini/         # Gemini AI integration
│   └── schemas.ts      # Data schemas
├── public/             # Static assets
└── styles/             # Global styles
```

### Key Workflows

1. **Travel Plan Generation**:
   - User inputs travel preferences
   - Gemini AI generates personalized itinerary
   - System processes in batches for optimal performance

2. **User Management**:
   - Secure authentication via Clerk
   - User credit system for plan generation
   - Collaborative access management

3. **Payment Processing**:
   - Secure payment handling with Razorpay
   - Credit system for premium features

4. **Weather Information**:
   - Real-time weather data via Gemini AI
   - Fallback mechanism for reliability

## Troubleshooting

### Common Issues

1. **ESLint Setup Error**:
   - The project now includes a proper `.eslintrc.json` configuration
   - Run `pnpm lint` to check for code issues

2. **Gemini API Key Error**:
   - Ensure `GOOGLE_GEMINI_API_KEY` is set in your `.env.local` file
   - Verify the API key is valid and has sufficient quota

3. **Environment Variables Not Loading**:
   - Make sure your `.env.local` file is in the root directory
   - Restart the development server after adding new variables

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy the main branch

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.