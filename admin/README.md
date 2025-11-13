# Event Platform Admin Panel

A comprehensive admin interface for managing the UUCSC event platform, built with React, Vite, and Material-UI.

## Features

- 🔐 Secure authentication system
- 📊 Dashboard for event management
- 📝 Question and round management
- 👥 User administration
- 📊 Results tracking and validation
- 🔄 Real-time updates
- 🎨 Responsive design

## Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v7
- **Data Visualization**: Recharts
- **Form Handling**: Formik & Yup
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd admin
   npm install
   ```
3. Create a `.env` file in the root directory with your environment variables:
   ```env
   VITE_API_URL='http://localhost:4000/api'
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── Components/       # Reusable UI components
├── Context/         # React context providers
├── pages/           # Page components
│   ├── Login/       # Login page
│   ├── EventSettings/ # Event configuration
│   ├── RoundsManagement/ # Manage event rounds
│   ├── UploadQuestions/ # Question management
│   ├── UserManagement/ # User administration
│   ├── ValidatingAnswers/ # Answer validation
│   └── Results/     # View and manage results
├── assets/          # Static assets
├── api.js           # API configuration
└── App.jsx          # Main application component
```

## Authentication

The admin panel uses JWT-based authentication. Protected routes will redirect unauthenticated users to the login page.

## API Integration

The application communicates with a backend API. The base URL and endpoints are configured in `src/api.js`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for API requests | `http://localhost:4000/api` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request


