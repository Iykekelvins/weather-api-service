# Weather API Service

A REST API that returns current weather for any city. Results come from the
[Visual Crossing](https://www.visualcrossing.com/) API, are cached in Redis, and
clients are rate-limited per IP.

Built as part of the [roadmap.sh Weather API project](https://roadmap.sh/projects/weather-api-wrapper-service).

## Features

- Caches results in Redis for 10 minutes
- Rate-limits each IP to 30 requests per minute
- Returns clear JSON errors with correct status codes
- Keeps working if Redis goes down (no caching or rate limiting until it's back)

## Tech stack

Node.js, TypeScript, Express 5, Redis

## Getting started

Requires Node.js 22.18+ and a Redis database.

```bash
npm install
cp .env.example .env   # then fill in your values
npm run dev
```

The server runs on `http://localhost:3000`.

### Environment variables

| Variable          | Description                  |
| ----------------- | ---------------------------- |
| `WEATHER_API_KEY` | Your Visual Crossing API key |
| `REDIS_URL`       | Redis connection URL         |

## API

### `GET /weather/:city`

```bash
curl http://localhost:3000/weather/london
```

```json
{
	"city": "London, England, United Kingdom",
	"temp": 18,
	"conditions": "Partially cloudy"
}
```

### Errors

All errors return `{ "error": "message" }`.

| Status | Meaning                                            |
| ------ | -------------------------------------------------- |
| 404    | City not found                                     |
| 429    | Rate limit exceeded (see the `Retry-After` header) |
| 502    | Weather service unavailable                        |
| 504    | Weather service timed out                          |

## Project structure

```
index.ts       app setup
config.ts      environment variables and settings
redis.ts       Redis client
rateLimit.ts   rate-limit middleware
weather.ts     /weather routes
```
