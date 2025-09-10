import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTrainDepartures } from '$lib/server/hafas';

export const GET: RequestHandler = async ({ url }) => {
	const station = url.searchParams.get('station');
	const when = url.searchParams.get('when');
	const duration = url.searchParams.get('duration');
	const results = url.searchParams.get('results');
	const page = url.searchParams.get('page');
	const pageSize = url.searchParams.get('pageSize');
	const filter = url.searchParams.get('filter');
	const format = url.searchParams.get('format');
	
	// Return error if no station provided
	if (!station || station.trim() === '') {
		return json(
			{ 
				error: 'Station parameter is required',
				success: false,
				data: null,
				examples: {
					basic: '/api/departures?station=Wien Hauptbahnhof',
					withTime: '/api/departures?station=Wien Hauptbahnhof&when=2025-09-10T14:00:00Z&duration=120',
					paginated: '/api/departures?station=Wien Hauptbahnhof&page=2&pageSize=10',
					filtered: '/api/departures?station=Wien Hauptbahnhof&filter=regional,suburban&format=minimal',
					advanced: '/api/departures?station=Wien Hauptbahnhof&page=1&pageSize=20&filter=nationalExpress,national&format=full&when=2025-09-10T14:00:00Z'
				}
			}, 
			{ 
				status: 400,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			}
		);
	}

	// Validate pagination parameters
	const pageNum = page ? parseInt(page) : undefined;
	const pageSizeNum = pageSize ? parseInt(pageSize) : undefined;
	
	if ((pageNum && pageNum < 1) || (pageSizeNum && (pageSizeNum < 1 || pageSizeNum > 100))) {
		return json(
			{ 
				error: 'Invalid pagination parameters. Page must be >= 1, pageSize must be between 1 and 100',
				success: false,
				data: null
			}, 
			{ 
				status: 400,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			}
		);
	}

	// Validate format parameter
	const formatParam = format as 'full' | 'minimal' | undefined;
	if (format && !['full', 'minimal'].includes(format)) {
		return json(
			{
				error: 'Invalid format parameter. Must be "full" or "minimal"',
				success: false,
				data: null
			},
			{
				status: 400,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			}
		);
	}

	try {
		// Build options object
		const options: any = {};
		if (when) options.when = when;
		if (duration) options.duration = parseInt(duration);
		if (results) options.results = parseInt(results);
		if (pageNum) options.page = pageNum;
		if (pageSizeNum) options.pageSize = pageSizeNum;
		if (filter) options.filter = filter.split(',').map(f => f.trim().toLowerCase());
		if (formatParam) options.format = formatParam;
		
		// Generate base URL for pagination links
		const baseUrl = `${url.protocol}//${url.host}${url.pathname}?station=${encodeURIComponent(station.trim())}`;
		
		const result = await getTrainDepartures(station.trim(), options, baseUrl);
		
		// If we got an error from the HAFAS service
		if (result.error) {
			return json(
				{
					error: result.error,
					success: false,
					data: null
				},
				{ 
					status: 404,
					headers: {
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'GET',
						'Access-Control-Allow-Headers': 'Content-Type'
					}
				}
			);
		}

		// Success response - format depends on requested format
		const response = formatParam === 'minimal' ? {
			// Minimal response format
			station: result.location?.name || station.trim(),
			departures: result.departures,
			count: result.departures.length,
			pagination: {
				currentPage: result.pagination.currentPage,
				pageSize: result.pagination.pageSize,
				hasNextPage: result.pagination.hasNextPage,
				hasPrevPage: result.pagination.hasPrevPage,
				nextPageUrl: result.pagination.nextPageUrl,
				prevPageUrl: result.pagination.prevPageUrl
			},
			timestamp: result.metadata.timestamp
		} : {
			// Full response format
			success: true,
			error: null,
			data: {
				station: station.trim(),
				location: result.location,
				departures: result.departures,
				pagination: result.pagination,
				metadata: result.metadata
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
			{ 
				status: 500,
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET',
					'Access-Control-Allow-Headers': 'Content-Type'
				}
			}
		);
	}
};
