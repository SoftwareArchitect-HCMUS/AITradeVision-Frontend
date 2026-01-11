# AI Trade Vision Frontend

A modern, professional trading platform frontend built with React, TypeScript, and Tailwind CSS.

## Features

- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Authentication**: Login and registration pages with form validation
- **Responsive Design**: Mobile-first approach with dark theme
- **Type Safety**: Full TypeScript support
- **Form Handling**: React Hook Form with Zod validation

## Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **React Router** - Client-side routing
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Lucide Icons** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AITradeVision-Frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── Logo.tsx      # App logo component
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
├── pages/            # Page components
│   ├── Login.tsx
│   └── Register.tsx
└── main.tsx          # App entry point
```

## Theme

The app uses a dark theme inspired by financial/trading platforms with custom colors:
- Primary: Green tones for bullish indicators
- Secondary: Red tones for bearish indicators
- Neutral: Gray tones for balanced states

## Forms

Both login and registration forms include:
- Email validation
- Password strength requirements
- Real-time form validation
- Loading states
- Error handling

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Add proper form validation
4. Ensure responsive design
5. Test on multiple screen sizes

## License

This project is private and proprietary.