import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const apiDocs = {
		title: "🚄 Cyber Bahnhof API",
		description: "RESTful API for Austrian train departure data using ÖBB HAFAS",
		version: "1.0.0",
		baseUrl: "/api",
		endpoints: {
			"/api/departures": {
				method: "GET",
				description: "Get train departures for a station",
				parameters: {
					station: {
						type: "string",
						required: true,
						description: "Station name (e.g., 'Wien Hauptbahnhof', 'Salzburg Hbf')"
					}
				},
				examples: [
					"/api/departures?station=Wien Hauptbahnhof",
					"/api/departures?station=Salzburg Hbf",
					"/api/departures?station=Innsbruck Hbf"
				],
				response: {
					success: "boolean",
					error: "string | null", 
					data: {
						station: "string",
						location: "object",
						departures: "array",
						timestamp: "string (ISO)",
						count: "number"
					}
				}
			},
			"/api/departures/advanced": {
				method: "GET", 
				description: "Get train departures with filtering and format options",
				parameters: {
					station: {
						type: "string",
						required: true,
						description: "Station name"
					},
					filter: {
						type: "string",
						required: false,
						description: "Comma-separated product types (e.g., 'regional,suburban,nationalExpress')"
					},
					format: {
						type: "string",
						required: false,
						default: "json",
						options: ["json", "minimal"],
						description: "Response format - 'minimal' for lightweight responses"
					}
				},
				examples: [
					"/api/departures/advanced?station=Wien Hauptbahnhof",
					"/api/departures/advanced?station=Wien Hauptbahnhof&filter=regional,suburban",
					"/api/departures/advanced?station=Wien Hauptbahnhof&format=minimal",
					"/api/departures/advanced?station=Salzburg Hbf&filter=nationalExpress,national&format=minimal"
				],
				response: {
					success: "boolean",
					error: "string | null",
					data: {
						station: "string", 
						location: "object",
						departures: "array",
						metadata: {
							timestamp: "string (ISO)",
							totalCount: "number",
							filteredCount: "number", 
							appliedFilters: "array",
							availableProducts: "array"
						}
					}
				}
			}
		},
		transportTypes: {
			nationalExpress: "ICE/RJ (High-speed trains)",
			national: "IC/EC (Intercity trains)",
			interregional: "IR (Interregional trains)",
			regional: "REX/R (Regional trains)",
			suburban: "S-Bahn (Suburban trains)",
			bus: "Bus services",
			ferry: "Ferry services",
			subway: "U-Bahn (Underground)",
			tram: "Tram services",
			onCall: "On-call services"
		},
		errorCodes: {
			400: "Bad Request - Missing or invalid station parameter",
			404: "Not Found - Station not found or no departures available", 
			500: "Internal Server Error - Server error occurred"
		},
		notes: [
			"All times are in local Austrian time",
			"Delays are provided in seconds (convert to minutes by dividing by 60)",
			"Station names should be in German (e.g., 'Wien Hauptbahnhof' not 'Vienna Central')",
			"Product filtering is case-insensitive",
			"API responses include CORS headers for browser usage"
		]
	};

	return json(apiDocs, {
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET',
			'Access-Control-Allow-Headers': 'Content-Type'
		}
	});
};
