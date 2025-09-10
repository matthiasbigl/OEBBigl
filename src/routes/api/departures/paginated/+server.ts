import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	// This endpoint is deprecated - redirect to the unified departures endpoint
	const params = new URLSearchParams(url.searchParams);
	
	// Build redirect URL with all parameters
	const redirectUrl = `/api/departures?${params.toString()}`;
	
	return json(
		{
			error: 'This endpoint is deprecated',
			success: false,
			data: null,
			deprecation: {
				message: 'The /api/departures/paginated endpoint has been deprecated in favor of the unified /api/departures endpoint',
				newEndpoint: '/api/departures',
				redirectUrl: redirectUrl,
				migration: {
					description: 'All pagination functionality is now built into the main /api/departures endpoint',
					changes: [
						'Use /api/departures instead of /api/departures/paginated',
						'All existing parameters work the same way',
						'Response format is more comprehensive'
					]
				}
			}
		},
		{
			status: 301, // Moved Permanently
			headers: {
				'Location': redirectUrl,
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET',
				'Access-Control-Allow-Headers': 'Content-Type'
			}
		}
	);
};
