import type { Request, Response, NextFunction } from 'express';
import { RATE_LIMIT } from './config.ts';
import { redis } from './redis.ts';

export async function rateLimit(req: Request, res: Response, next: NextFunction) {
	const key = `ratelimit:${req.ip}`;

	try {
		const count = await redis.incr(key);
		if (count === 1) {
			await redis.expire(key, 60);
		}

		if (count > RATE_LIMIT) {
			const secondsLeft = await redis.ttl(key);
			res.set('Retry-After', String(secondsLeft));
			return res.status(429).json({ error: 'Too many requests, try again later' });
		}
	} catch (error) {
		console.error('Rate limit error', error);
	}

	next();
}
