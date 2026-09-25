import { Router, type Request, type Response } from 'express';
import { WEATHER_API_KEY } from './config.ts';
import { redis } from './redis.ts';

type WeatherResponse = {
	city: string;
	temp: number;
	conditions: string;
};

type VisualCrossingResponse = {
	resolvedAddress: string;
	currentConditions: {
		temp: number;
		conditions: string;
	};
};

const weatherRouter = Router();

weatherRouter.get(
	'/:city',
	async (req: Request<{ city: string }>, res: Response) => {
		const city = encodeURIComponent(req.params.city);
		const key = `weather:${req.params.city.trim().toLowerCase()}`;

		try {
			let cached: string | null = null;
			try {
				cached = await redis.get(key);
			} catch (error) {
				console.error('Cache read failed', error);
			}

			if (cached) {
				console.log('Cache hit', key);
				return res.json(JSON.parse(cached));
			}

			console.log('Cache miss', key);

			const result = await fetch(
				`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${WEATHER_API_KEY}&contentType=json`,
				{
					signal: AbortSignal.timeout(5000),
				},
			);

			if (!result.ok) {
				if (result.status === 400) {
					return res.status(404).json({ error: 'City not found' });
				}

				console.error('Upstream error', result.status, await result.text());
				return res.status(502).json({ error: 'Weather service unavailable' });
			}

			const data: VisualCrossingResponse = await result.json();

			const apiData: WeatherResponse = {
				city: data.resolvedAddress,
				temp: data.currentConditions.temp,
				conditions: data.currentConditions.conditions,
			};

			try {
				await redis.set(key, JSON.stringify(apiData), {
					expiration: { type: 'EX', value: 600 },
				});
			} catch (error) {
				console.error('Cache save failed', error);
			}

			res.json(apiData);
		} catch (error) {
			console.error(error);

			const isTimeout = error instanceof Error && error.name === 'TimeoutError';
			res.status(isTimeout ? 504 : 502).json({
				error: isTimeout
					? 'Weather service timed out'
					: 'Weather service unavailable',
			});
		}
	},
);

export default weatherRouter;
