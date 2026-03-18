# Environment Configuration

This project uses environment variables to configure API endpoints and WebSocket connections for different environments.

## Setup Instructions

### 1. Copy Environment Template
```bash
cp .env.example .env
```

### 2. Configure for Development
Edit `.env` file for local development:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# WebSocket Configuration  
VITE_WS_BASE_URL=ws://localhost:8080/ws/notifications

# Environment (development/production)
VITE_NODE_ENV=development
```

### 3. Configure for Production
Edit `.env` file for production deployment:

```env
# API Configuration
VITE_API_BASE_URL=https://ai-mshm-backend.onrender.com/api/v1

# WebSocket Configuration  
VITE_WS_BASE_URL=wss://ai-mshm-backend.onrender.com/ws/notifications

# Environment (development/production)
VITE_NODE_ENV=production
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for all API endpoints | `https://ai-mshm-backend.onrender.com/api/v1` |
| `VITE_WS_BASE_URL` | WebSocket server URL | `wss://ai-mshm-backend.onrender.com/ws/notifications` |
| `VITE_NODE_ENV` | Environment mode | `development` |

## Files Using Environment Variables

- `src/services/apiClient.ts` - Main API client configuration
- `src/services/authService.ts` - Authentication endpoints
- `src/services/notificationService.ts` - Notification endpoints
- `src/context/NotificationContext.tsx` - WebSocket connection
- `vite.config.ts` - Development proxy configuration

## Security Notes

⚠️ **Important**: The `.env` file is included in `.gitignore` to prevent sensitive configuration from being committed to version control.

- Never commit `.env` files to git
- Use `.env.example` as a template for new developers
- Production values should be set in your deployment environment, not in code

## Development vs Production

### Development Mode
- Uses Vite proxy to route `/api` requests to backend
- WebSocket connects to `ws://localhost:8080`
- Hot module replacement enabled

### Production Mode  
- No proxy used (direct API calls)
- WebSocket connects to `wss://ai-mshm-backend.onrender.com`
- Optimized build configuration
