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
  - Next.js 14
  - Tailwind CSS
  - Shadcn UI Components
  - TypeScript

- **Backend**:
  - Convex (Backend-as-a-Service)
  - OpenAI API Integration
  - Clerk Authentication
  - Razorpay Payment Processing
  - Resend Email Service

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm package manager
- OpenAI API key
- Clerk account
- Convex account
- Razorpay account
- Resend account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/waypoint.git
cd waypoint
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and configuration values

4. Start the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenAI
OPENAI_API_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Convex
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Resend
RESEND_API_KEY=

# Next.js
NEXT_PUBLIC_APP_URL=
```

## Development

### Project Structure

```
waypoint/
├── app/                 # Next.js app directory
├── components/          # React components
├── convex/             # Convex backend functions
├── lib/                # Utility functions and shared code
├── public/             # Static assets
└── styles/             # Global styles
```

### Key Workflows

1. **Travel Plan Generation**:
   - User inputs travel preferences
   - AI generates personalized itinerary
   - System processes in batches for optimal performance

2. **User Management**:
   - Secure authentication via Clerk
   - User credit system for plan generation
   - Collaborative access management

3. **Payment Processing**:
   - Secure payment handling with Razorpay
   - Credit system for premium features

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy the main branch

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
