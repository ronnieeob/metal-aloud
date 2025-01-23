# Metal Aloud API Documentation

## Authentication

### Login
```typescript
POST /api/auth/login
{
  email: string;
  password: string;
}
```

### Register
```typescript
POST /api/auth/register
{
  email: string;
  password: string;
  name: string;
  role: 'user' | 'artist';
}
```

## Songs

### Get Songs
```typescript
GET /api/songs
Query params:
  - artistId?: string
  - genre?: string
  - limit?: number
```

### Upload Song
```typescript
POST /api/songs
{
  title: string;
  artist: string;
  album?: string;
  audioFile: File;
  coverImage: File;
  price: number;
}
```

## Copyright

### Register Copyright
```typescript
POST /api/copyright/register
{
  songId: string;
  type: 'automatic' | 'manual';
}
```

### Check Status
```typescript
GET /api/copyright/status/:id
```

## Subscriptions

### Create Subscription
```typescript
POST /api/subscriptions
{
  planId: string;
  interval: 'monthly' | 'yearly';
}
```

### Cancel Subscription
```typescript
POST /api/subscriptions/:id/cancel
```

## Error Responses

```typescript
{
  error: string;
  code: number;
  details?: any;
}
```

## Rate Limits

- 100 requests per minute for regular endpoints
- 5 requests per minute for auth endpoints
- 50 requests per minute for API endpoints

## WebSocket Events

```typescript
// Connect
socket.connect()

// Listen for events
socket.on('message', (data) => {})
socket.on('notification', (data) => {})

// Send message
socket.emit('message', {
  recipientId: string;
  content: string;
})
```