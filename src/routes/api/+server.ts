import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const apiDocs = {
		title: "🚄 Cyber Bahnhof API",
		description: "RESTful API for Austrian train departure data using ÖBB HAFAS",
		version: "2.0.0",
		baseUrl: "/api",
		endpoints: {
			"/api/departures": {
				method: "GET",
				description: "Unified endpoint for train departures with comprehensive filtering, pagination, and formatting options",
				parameters: {
					station: {
						type: "string",
						required: true,
						description: "Station name (e.g., 'Wien Hauptbahnhof', 'Salzburg Hbf')"
					},
					when: {
						type: "string (ISO 8601)",
						required: false,
						description: "Start time for departures (default: now)"
					},
					duration: {
						type: "number",
						required: false,
						description: "Time window in minutes (default: 60)"
					},
					results: {
						type: "number", 
						required: false,
						description: "Maximum number of results (legacy parameter, use pageSize instead)"
					},
					page: {
						type: "number",
						required: false,
						default: 1,
						description: "Page number for pagination (starts at 1)"
					},
					pageSize: {
						type: "number",
						required: false,
						default: 15,
						max: 100,
						description: "Number of results per page (max 100)"
					},
					filter: {
						type: "string",
						required: false,
						description: "Comma-separated product types (e.g., 'regional,suburban,nationalExpress')"
					},
					format: {
						type: "string",
						required: false,
						default: "full",
						options: ["full", "minimal"],
						description: "Response format - 'minimal' for lightweight responses, 'full' for complete data"
					}
				},
				examples: [
					"/api/departures?station=Wien Hauptbahnhof",
					"/api/departures?station=Wien Hauptbahnhof&when=2025-09-10T14:00:00Z&duration=120",
					"/api/departures?station=Wien Hauptbahnhof&page=2&pageSize=10",
					"/api/departures?station=Wien Hauptbahnhof&filter=regional,suburban&format=minimal",
					"/api/departures?station=Salzburg Hbf&page=1&pageSize=20&filter=nationalExpress,national&format=full&when=2025-09-10T14:00:00Z"
				],
				response: {
					full_format: {
						success: "boolean",
						error: "string | null", 
						data: {
							station: "string",
							location: "object",
							departures: "array",
							pagination: {
								hasMore: "boolean",
								currentWhen: "string (ISO)",
								duration: "number",
								totalResults: "number",
								currentPage: "number",
								pageSize: "number",
								hasNextPage: "boolean",
								hasPrevPage: "boolean",
								nextPageUrl: "string | null",
								prevPageUrl: "string | null"
							},
							metadata: {
								timestamp: "string (ISO)",
								totalCount: "number",
								filteredCount: "number",
								appliedFilters: "array",
								availableProducts: "array",
								format: "string"
							}
						}
					},
					minimal_format: {
						station: "string",
						departures: "array (simplified departure objects)",
						count: "number",
						pagination: {
							currentPage: "number",
							pageSize: "number",
							hasNextPage: "boolean",
							hasPrevPage: "boolean",
							nextPageUrl: "string | null",
							prevPageUrl: "string | null"
						},
						timestamp: "string (ISO)"
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
