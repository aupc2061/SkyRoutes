# SkyRoutes - Flight Booking Application

A modern, full-stack web application for flight booking and airline management. Built with Next.js, TypeScript, and Tailwind CSS for the frontend, and Express/Node.js for the backend. SkyRoutes offers a seamless experience for customers to search, book, and manage flights.

![SkyRoutes Banner](https://i.imgur.com/placeholder.png)

## 🏗️ Project Structure

This project has been organized into two main parts:

1. **Frontend** (`frontend` directory): A Next.js application for the user interface
2. **Backend** (`backend` directory): An Express API server for handling data operations

```
flight-booking/
├── frontend/           # Next.js frontend application
│   ├── ai/             # AI integration
│   ├── app/            # Next.js app directory
│   ├── components/     # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── models/         # Data models
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
└── backend/            # Express.js backend application
    └── src/
        ├── middleware/ # Express middleware
        ├── models/     # Mongoose models
        ├── routes/     # API routes
        └── utils/      # Utility functions
           
```

## 🚀 Features

### Flight Management
- **Flight Search**: Advanced search functionality with filters for dates, destinations, and prices
- **Real-time Flight Status**: Monitor flight status, delays, and gate changes
- **Flight Details**: Comprehensive information about flights, including aircraft details and amenities

### Booking System
- **Streamlined Booking Process**: User-friendly interface for booking flights
- **Seat Selection**: Interactive seat map for choosing preferred seats
- **Electronic Tickets**: Generate and download PDF tickets
- **Booking Management**: View and manage current bookings

### User Features
- **User Authentication**: Secure JWT-based authentication system
- **User Profiles**: Manage personal information and preferences
- **Flight Reviews & Ratings**: Read and submit reviews for flights
- **Travel History**: View past and upcoming flight details

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15.2.3 with TypeScript
- **UI Components**: Custom UI components using Radix UI primitives
- **Styling**: Tailwind CSS
- **Authentication**: Custom JWT-based authentication
- **PDF Generation**: jsPDF for ticket generation

### Backend
- **Server**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Integration**: Amadeus Flight API
- **Security**: bcrypt for password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- MongoDB
- npm or yarn

### Installation & Setup

#### Backend (Express)

1. Navigate to backend directory and install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skyroutes
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:9002
AMADEUS_API_KEY=your_amadeus_api_key
AMADEUS_API_SECRET=your_amadeus_api_secret
```

3. Start the backend server:
```bash
npm run dev
```

The server will be available at `http://localhost:5000/api`.

#### Frontend (Next.js)

1. Navigate to frontend directory and install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env.local` file with:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:9002`
```

The application will be available at `http://localhost:9002`.

## 🧪 Testing

The backend includes test scripts to verify API functionality:

```bash
cd backend
node test.js         # Run all tests
node testReviews.js  # Test specifically the reviews endpoints
```

## 🔄 API Reference

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in an existing user

### Flights
- `GET /api/flights` - Search flights
- `GET /api/flights/:id` - Get flight details

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details

### Reviews
- `GET /api/reviews` - Get flight reviews
- `POST /api/reviews` - Create a new review

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## ✨ Additional Features

### AI Travel Assistant
- **Smart Recommendations**: AI-powered suggestions for flights based on user preferences
- **24/7 Support**: Automated assistance for common queries and issues

## 🏗️ Project Architecture

The application follows a modern architecture with separation of concerns:

1. **User Interface Layer**: Next.js frontend with React components
2. **API Layer**: Express.js backend with RESTful endpoints
3. **Data Layer**: MongoDB database with Mongoose schemas
4. **External Services Layer**: Integration with Amadeus API for flight data

## 🔐 Authentication Flow

1. User registers or logs in through the frontend
2. Backend validates credentials and issues a JWT token
3. Frontend stores the token in local storage
4. Token is included in the Authorization header for authenticated requests
5. Backend middleware validates the token for protected routes

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
