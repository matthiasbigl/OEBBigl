import type { PageServerLoad } from './$types';
import { getJourneys } from '$lib/server/hafas';

const parseProducts = (value: string | null): string[] => {
	if (!value) return [];
	return value
		.split(',')
		.map((product) => product.trim())
		.filter(Boolean);
};

const parseMaxTransfers = (value: string | null): number | null => {
	if (value === null || value === '') return null;
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const load: PageServerLoad = async ({ url }) => {
	const from = url.searchParams.get('from') ?? '';
	const to = url.searchParams.get('to') ?? '';
	const when = url.searchParams.get('when') ?? undefined;
	const isArrival = url.searchParams.get('isArrival') === 'true';
	const products = parseProducts(url.searchParams.get('products'));
	const maxTransfers = parseMaxTransfers(url.searchParams.get('maxTransfers'));
	const directionParam = url.searchParams.get('direction');
	const context = url.searchParams.get('context') ?? undefined;
	const direction = directionParam === 'next' || directionParam === 'prev' ? directionParam : undefined;

	let result = null;

	if (from && to) {
		result = await getJourneys(from, to, {
			when,
			isArrival,
			products,
			maxTransfers,
			context,
			direction
		}, '/journeys');
	}

	return {
		from,
		to,
		when: when ?? null,
		isArrival,
		products,
		maxTransfers,
		result
	};
};
