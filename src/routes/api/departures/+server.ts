import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTrainDepartures } from '$lib/server/hafas';

export const GET: RequestHandler = async ({ url }) => {
	const station = url.searchParams.get('station');
	
	// Return error if no station provided
	if (!station || station.trim() === '') {
		return json(
			{ 
				error: 'Station parameter is required',
				success: false,
				data: null
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

		// Success response
		return json({
			success: true,
			error: null,
			data: {
				station: station.trim(),
				location: result.location,
				departures: result.departures,
				timestamp: new Date().toISOString(),
				count: result.departures?.length || 0
			}
		}, {
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
				data: null
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
