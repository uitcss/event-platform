# UUCSC Event Platform - Frontend

A modern, responsive web application built with React and Vite for managing and participating in events, contests, and tests. This frontend application connects to a backend API to provide a seamless user experience.

## 🚀 Features

- **User Authentication**: Secure login/logout functionality
- **Event Management**: Browse and participate in events
- **Contests**: Participate in coding/programming contests
- **Tests**: Take timed tests with question review functionality
- **Toast Notifications**: For user feedback and error handling

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Notifications**: React Toastify
- **State Management**: React Context API
- **Styling**: CSS Modules

## 📦 Prerequisites

- Node.js (v22.18.0)
- npm

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd event-platform/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your environment variables:
   ```env
   VITE_API_URL='http://localhost:4000'
   ```

## while deploying in vercel use framework preset: vite 

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🗂️ Project Structure

```
src/
├── Components/      # Reusable UI components
├── Pages/           # Page components
├── assets/          # Static assets (images, fonts, etc.)
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── App.jsx          # Main application component
├── App.css          # Global styles
├── Theme.css        # Theme variables and styles
└── main.jsx         # Application entry point
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📝 Environment Variables

| Variable      | Description                     | Required |
|---------------|---------------------------------|----------|
| VITE_API_URL  | Base URL for backend API        | Yes      |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/) + [React](https://reactjs.org/)
- Icons by [React Icons](https://react-icons.github.io/react-icons/)
- Toast notifications by [React Toastify](https://fkhadra.github.io/react-toastify/)
