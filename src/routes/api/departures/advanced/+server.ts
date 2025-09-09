import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTrainDepartures } from '$lib/server/hafas';
import { filterDepartures } from '$lib/utils/filterUtils';

export const GET: RequestHandler = async ({ url }) => {
	const station = url.searchParams.get('station');
	const filterParam = url.searchParams.get('filter'); // Comma-separated product types
	const format = url.searchParams.get('format') || 'json'; // json or minimal
	
	// Return error if no station provided
	if (!station || station.trim() === '') {
		return json(
			{ 
				error: 'Station parameter is required. Usage: /api/departures?station=Wien Hauptbahnhof&filter=regional,suburban',
				success: false,
				data: null,
				examples: {
					basic: '/api/departures?station=Wien Hauptbahnhof',
					filtered: '/api/departures?station=Wien Hauptbahnhof&filter=regional,suburban',
					minimal: '/api/departures?station=Wien Hauptbahnhof&format=minimal'
				}
			}, 
			{ status: 400 }
		);
	}

	try {
		const result = await getTrainDepartures(station.trim());
		
		// If we got an error from the HAFAS service
		if (result.error) {
			return json(
				{
					error: result.error,
					success: false,
					data: null
				},
				{ status: 404 }
			);
		}

		// Parse filter parameter
		let activeFilters = new Set<string>();
		if (filterParam) {
			const filters = filterParam.split(',').map(f => f.trim().toLowerCase());
			activeFilters = new Set(filters);
		}

		// Apply filters if specified
		const departures = result.departures || [];
		const filteredDepartures = filterParam 
			? filterDepartures(departures, activeFilters)
			: departures;

		// Build response based on format
		if (format === 'minimal') {
			// Minimal format for lightweight responses
			const minimalDepartures = filteredDepartures.map(dep => ({
				line: dep.line?.name || dep.line?.id,
				direction: dep.direction,
				time: dep.when,
				delay: dep.delay ? Math.floor(dep.delay / 60) : 0, // Convert to minutes
				platform: dep.platform,
				product: dep.line?.product
			}));

			return json({
				station: result.location?.name || station.trim(),
				departures: minimalDepartures,
				count: minimalDepartures.length,
				timestamp: new Date().toISOString()
			});
		}

		// Full format response
		const response = {
			success: true,
			error: null,
			data: {
				station: station.trim(),
				location: result.location,
				departures: filteredDepartures,
				metadata: {
					timestamp: new Date().toISOString(),
					totalCount: departures.length,
					filteredCount: filteredDepartures.length,
					appliedFilters: Array.from(activeFilters),
					availableProducts: result.location?.products 
						? Object.keys(result.location.products).filter(p => result.location?.products?.[p]) 
						: []
				}
			}
		};

		return json(response, {
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		});

	} catch (error) {
		console.error('API Error:', error);
		
		return json(
			{
				error: 'Internal server error occurred while fetching departures',
				success: false,
				data: null,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
