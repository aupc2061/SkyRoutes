# SkyRoutes Frontend with External Express Backend

This directory contains the frontend code for the SkyRoutes application, configured to work with a separate Express backend server.

## Setup Instructions

### 1. Configure Backend Connection

The frontend is configured to connect to the Express backend running at `http://localhost:5000/api`. If your backend is running on a different URL, update the `EXPRESS_BACKEND_URL` in `lib/api-config.ts`.

### 2. Authentication

Authentication now uses JWT tokens with the Express backend:

- Token is stored in localStorage
- API requests automatically include the token in the Authorization header
- Authentication state is managed through the AuthProvider

### 3. API Requests

Use the `api` client from `lib/api-client.ts` for all API requests. Examples:

```typescript
// GET request
const data = await api.get('flights/search', { params });

// POST request
const result = await api.post('bookings', bookingData);

// Other methods: put, patch, delete
```

### 4. User Authentication

Use the `useAuth` hook to access authentication functionality:

```typescript
import { useAuth } from '@/components/providers/auth-provider';

function YourComponent() {
  const { user, loading, login, logout, isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <p>Please log in</p>;
  }
  
  return <p>Welcome, {user.name}!</p>;
}
```

## Development Process

1. Start the Express backend:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```
   npm run dev
   ```

3. The frontend will connect to the Express backend API at the configured URL.

## Important Files

- `lib/api-config.ts`: Configuration for the backend connection
- `lib/api-client.ts`: API client for making requests to the backend
- `lib/auth-service.ts`: Authentication service for login/logout
- `components/providers/auth-provider.tsx`: Context provider for authentication
