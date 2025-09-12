import { json } from '@sveltejs/kit';
import { searchStations } from '$lib/server/hafas';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	
	if (!query || query.trim().length < 2) {
		return json({ stations: [] });
	}
	
	try {
		const stations = await searchStations(query.trim());
		return json({ stations });
	} catch (error) {
		console.error('Station search error:', error);
		return json({ 
			stations: [],
			error: 'Failed to search stations'
		}, { status: 500 });
	}
};
