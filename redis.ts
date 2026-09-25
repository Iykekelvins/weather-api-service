import { createClient } from 'redis';
import { REDIS_URL } from './config.ts';

export const redis = await createClient({
	url: REDIS_URL,
	disableOfflineQueue: true,
})
	.on('error', (err) => console.error('Redis error', err))
	.connect();
