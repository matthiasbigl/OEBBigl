import {createClient} from 'hafas-client'
import {profile as oebbProfile} from 'hafas-client/p/oebb/index.js'

const client = createClient(oebbProfile, 'doddlnet@gmail.com');

export interface Departure {
	when: string;
	delay?: number;
	platform?: string;
	direction?: string;
	line?: {
		id?: string;
		name?: string;
		trainNumber?: string;
		product?: string;
	};
	remarks?: Array<{
		text: string;
	}>;
	tripId: string;
}

export interface Station {
	id: string;
	name: string;
	products?: Record<string, boolean>;
}

export interface TrainDeparturesResult {
	station: string;
	stopId?: string;
	departures: Departure[];
	location?: Station;
	error?: string;
	pagination: {
		hasMore: boolean;
		nextWhen?: string;
		currentWhen: string;
		duration: number;
		totalResults: number;
		// Page-based pagination
		currentPage?: number;
		pageSize?: number;
		hasNextPage?: boolean;
		hasPrevPage?: boolean;
		nextPageUrl?: string;
		prevPageUrl?: string;
	};
	metadata: {
		timestamp: string;
		totalCount: number;
		availableProducts: string[];
		format: 'full' | 'minimal';
	};
}

export interface DepartureOptions {
	when?: Date | string;
	duration?: number; // minutes
	results?: number;
	includeProducts?: Record<string, boolean>;
	// Pagination options
	page?: number;
	pageSize?: number;
	// Filtering options
	filter?: string[]; // Product types to include
	// Response format options
	format?: 'full' | 'minimal';
}

/**
 * Filter departures based on product types (server-side)
 * This is used for API filtering to reduce data transfer and improve performance.
 * Works in combination with client-side filtering for maximum flexibility.
 */

function filterDepartures(departures: Departure[], filters: string[]): Departure[] {
	if (!filters || filters.length === 0) return departures;
	
	const filterSet = new Set(filters.map(f => f.toLowerCase()));
	return departures.filter(departure => {
		const productType = departure.line?.product?.toLowerCase();
		return productType && filterSet.has(productType);
	});
}

/**
 * Format departures based on the requested format
 */
function formatDepartures(departures: Departure[], format: 'full' | 'minimal'): any[] {
	if (format === 'minimal') {
		return departures.map(dep => ({
			line: dep.line?.name || dep.line?.id,
			direction: dep.direction,
			time: dep.when,
			delay: dep.delay ? Math.floor(dep.delay / 60) : 0, // Convert to minutes
			platform: dep.platform,
			product: dep.line?.product,
			tripId: dep.tripId
		}));
	}
	return departures;
}

/**
 * Calculate pagination parameters
 */
function calculatePagination(
	options: DepartureOptions,
	departures: Departure[],
	allDeparturesCount: number,
	baseUrl?: string
): TrainDeparturesResult['pagination'] {
	const page = options.page || 1;
	const pageSize = options.pageSize || options.results || 15;
	const hasNextPage = allDeparturesCount > pageSize;
	const hasPrevPage = page > 1;
	
	let nextPageUrl: string | undefined;
	let prevPageUrl: string | undefined;
	
	if (baseUrl) {
		const urlParams = new URLSearchParams();
		if (options.when) urlParams.set('when', typeof options.when === 'string' ? options.when : options.when.toISOString());
		if (options.duration) urlParams.set('duration', options.duration.toString());
		if (options.filter?.length) urlParams.set('filter', options.filter.join(','));
		if (options.format) urlParams.set('format', options.format);
		urlParams.set('pageSize', pageSize.toString());
		
		if (hasNextPage) {
			urlParams.set('page', (page + 1).toString());
			nextPageUrl = `${baseUrl}?${urlParams.toString()}`;
		}
		
		if (hasPrevPage) {
			urlParams.set('page', (page - 1).toString());
			prevPageUrl = `${baseUrl}?${urlParams.toString()}`;
		}
	}
	
	return {
		hasMore: hasNextPage,
		currentWhen: (options.when ? new Date(options.when) : new Date()).toISOString(),
		duration: options.duration || 60,
		totalResults: departures.length,
		currentPage: page,
		pageSize: pageSize,
		hasNextPage,
		hasPrevPage,
		nextPageUrl,
		prevPageUrl
	};
}
export async function searchStations(query: string): Promise<Station[]> {
	try {
		const locations = await client.locations(query, { 
			results: 5,
			stops: true,
			addresses: false,
			poi: false
		});
		
		return locations.map((loc: any) => ({
			id: loc.id,
			name: loc.name,
			products: (loc as any).products || {}
		}));
	} catch (error) {
		console.error('Error searching stations:', error);
		return [];
	}
}

/**
 * Get train departures for a station with comprehensive filtering and pagination support
 */
export async function getTrainDepartures(
	stationQuery: string, 
	options: DepartureOptions = {},
	baseUrl?: string
): Promise<TrainDeparturesResult> {
	const defaultMetadata = {
		timestamp: new Date().toISOString(),
		totalCount: 0,
		filteredCount: 0,
		appliedFilters: options.filter || [],
		availableProducts: [],
		format: options.format || 'full' as const
	};

	const defaultPagination = {
		hasMore: false,
		currentWhen: new Date().toISOString(),
		duration: options.duration || 60,
		totalResults: 0,
		currentPage: options.page || 1,
		pageSize: options.pageSize || options.results || 15,
		hasNextPage: false,
		hasPrevPage: false
	};

	try {
		console.log('Searching for station:', stationQuery, 'with options:', options);
		
		// 1) Find stations using hafas-client
		const locations = await client.locations(stationQuery, { 
			results: 1,
			stops: true,
			addresses: false,
			poi: false
		});
		
		console.log('HAFAS client locations response:', JSON.stringify(locations, null, 2));

		if (!locations.length) {
			return {
				station: stationQuery,
				error: 'Keine Haltestelle gefunden',
				departures: [],
				pagination: defaultPagination,
				metadata: defaultMetadata
			};
		}

		const station = locations[0];

		// Parse options with defaults
		const when = options.when ? new Date(options.when) : new Date();
		const duration = options.duration || 60; // Default 1 hour
		const pageSize = options.pageSize || options.results || 15;
		const page = options.page || 1;
		
		// For page-based pagination, calculate time offset
		const timeOffsetMinutes = options.page ? (page - 1) * pageSize * 2 : 0;
		const requestTime = new Date(when.getTime() + timeOffsetMinutes * 60 * 1000);
		
		// Request extra results to determine if there are more pages
		const requestResults = pageSize * 2;
		
		// Default products - can be overridden
		const defaultProducts = {
			nationalExpress: true,
			national: true, 
			interregional: true,
			regional: true,
			suburban: true,
			bus: true,
			ferry: true,
			subway: true,
			tram: true,
			onCall: true
		};
		
		const products = options.includeProducts || defaultProducts;

		// 2) Get departures using hafas-client
		const departuresResponse = await client.departures(station, {
			when: requestTime,
			duration: Math.max(duration, pageSize * 3),
			results: requestResults,
			products: products,
			remarks: false, // Disable detailed remarks to reduce data
			language: 'de'
		});

		// console.log('HAFAS client departures response:', JSON.stringify(departuresResponse, null, 2));

		// Convert hafas-client format to our interface
		const allDepartures = departuresResponse.departures?.map((dep: any) => {
			// Extract train name and number from format like "REX 7 (Zug-Nr. 29592)"
			const fullName = dep.line?.name || '';
			const trainNumberMatch = fullName.match(/\(Zug-Nr\.\s*(\d+)\)/);
			const trainNumber = trainNumberMatch ? trainNumberMatch[1] : null;
			const lineName = fullName.replace(/\s*\(Zug-Nr\.\s*\d+\)/, '').trim();

			return {
				when: dep.when,
				delay: dep.delay || 0,
				platform: dep.platform,
				direction: dep.direction,
				line: {
					id: dep.line?.id,
					name: lineName || dep.line?.name,
					trainNumber: trainNumber,
					product: dep.line?.product
				},
				remarks: [],
				tripId: dep.tripId
			};
		}) || [];

		// 3) Apply filtering if specified
		const filteredDepartures = options.filter?.length 
			? filterDepartures(allDepartures, options.filter)
			: allDepartures;

		// 4) Apply pagination
		const startIndex = 0; // We already offset the time for page-based pagination
		const endIndex = Math.min(startIndex + pageSize, filteredDepartures.length);
		const paginatedDepartures = filteredDepartures.slice(startIndex, endIndex);

		// 5) Format departures based on requested format
		const formattedDepartures = formatDepartures(paginatedDepartures, options.format || 'full');

		// 6) Calculate pagination info
		const pagination = calculatePagination(options, paginatedDepartures, filteredDepartures.length, baseUrl);
		
		// Add time-based pagination info
		if (paginatedDepartures.length > 0) {
			const lastDeparture = paginatedDepartures[paginatedDepartures.length - 1];
			pagination.nextWhen = lastDeparture.when;
		}

		// 7) Build metadata
		const availableProducts = (station as any).products 
			? Object.keys((station as any).products).filter(p => (station as any).products?.[p]) 
			: [];

		const metadata = {
			timestamp: new Date().toISOString(),
			totalCount: allDepartures.length,
			filteredCount: filteredDepartures.length,
			appliedFilters: options.filter || [],
			availableProducts,
			format: options.format || 'full' as const
		};

		return {
			station: stationQuery,
			stopId: station.id,
			departures: formattedDepartures,
			location: {
				id: station.id || '',
				name: station.name || '',
				products: (station as any).products || {}
			},
			pagination,
			metadata
		};
	} catch (error) {
		console.error('Error fetching train data:', error);
		return {
			station: stationQuery,
			error: 'Fehler beim Laden der Abfahrten',
			departures: [],
			pagination: defaultPagination,
			metadata: defaultMetadata
		};
	}
}

/**
 * Get arrivals for a station (if needed in the future)
 */
export async function getTrainArrivals(stationQuery: string): Promise<TrainDeparturesResult> {
	// Similar implementation but for arrivals
	// Could be implemented later if needed
	throw new Error('Arrivals not implemented yet');
}
