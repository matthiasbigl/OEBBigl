import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getJourneys, type JourneySearchOptions } from '$lib/server/hafas';

const parseProducts = (value: string | null): string[] => {
	if (!value) return [];
	return value
		.split(',')
		.map(product => product.trim())
		.filter(Boolean);
};

const parseMaxTransfers = (value: string | null): number | null => {
	if (!value) return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const GET: RequestHandler = async ({ url }) => {
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');

	if (!from || !to) {
		return json({ error: 'Missing required parameters `from` and `to`.' }, { status: 400 });
	}

	const when = url.searchParams.get('when');
	const isArrival = url.searchParams.get('isArrival') === 'true';
	const products = parseProducts(url.searchParams.get('products'));
	const maxTransfers = parseMaxTransfers(url.searchParams.get('maxTransfers'));
	const directionParam = url.searchParams.get('direction');
	const context = url.searchParams.get('context');

	const options: JourneySearchOptions = {
		when: when ?? undefined,
		isArrival,
		products,
		maxTransfers,
		direction: directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined,
		context: context ?? undefined
	};

	const result = await getJourneys(from, to, options, '/api/journeys');

	return json(result, {
		headers: {
			'Cache-Control': 'no-store'
		}
	});
};
