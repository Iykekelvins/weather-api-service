function requireEnv(name: string) {
	const value = process.env[name];
	if (!value) {
		console.error(`Missing environment variable: ${name}`);
		process.exit(1);
	}
	return value;
}

export const WEATHER_API_KEY = requireEnv('WEATHER_API_KEY');
export const REDIS_URL = requireEnv('REDIS_URL');
export const RATE_LIMIT = 30;
