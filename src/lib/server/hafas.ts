import {createClient} from 'hafas-client'
import {profile as oebbProfile} from 'hafas-client/p/oebb/index.js'

const client = createClient(oebbProfile, 'doddlnet@gmail.com');

const DEFAULT_PRODUCTS: Record<string, boolean> = {
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

const sanitizeProducts = (products?: Record<string, boolean>) => {
	if (!products) return { ...DEFAULT_PRODUCTS };
	const normalizedEntries = Object.entries(DEFAULT_PRODUCTS).map(([key, value]) => [key, products[key] ?? value]);
	return Object.fromEntries(normalizedEntries) as Record<string, boolean>;
};

type HafasLocation = {
	id?: string;
	name?: string;
	products?: Record<string, boolean>;
};

type HafasRemark = {
	text?: string;
};

type HafasLine = {
	id?: string;
	name?: string;
	product?: string;
};

type HafasStop = {
	id?: string;
	name?: string;
	arrival?: string;
	departure?: string;
	platform?: string;
};

type HafasStopover = {
	stop?: HafasStop;
	arrival?: string;
	departure?: string;
	platform?: string;
};

type HafasLeg = {
	line?: HafasLine & { trainNumber?: string };
	departure?: string;
	departurePlatform?: string;
	arrival?: string;
	arrivalPlatform?: string;
	direction?: string;
	tripId?: string;
	remarks?: HafasRemark[];
	origin?: HafasStop;
	destination?: HafasStop;
	stopovers?: HafasStopover[];
};

type HafasJourney = {
	id?: string;
	legs?: HafasLeg[];
	departure?: string;
	arrival?: string;
	duration?: string;
	transfers?: number;
	remarks?: HafasRemark[];
};

type HafasDeparture = {
	when?: string;
	delay?: number;
	plannedWhen?: string;
	platform?: string;
	direction?: string;
	line?: HafasLine & { trainNumber?: string };
	tripId?: string;
	remarks?: HafasRemark[];
};


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

export interface JourneyStop {
	id: string | null;
	name: string | null;
	arrival?: string | null;
	departure?: string | null;
	platform?: string | null;
}

export interface JourneyLeg {
	lineName: string | null;
	product: string | null;
	trainNumber: string | null;
	departure: string | null;
	departurePlatform?: string | null;
	arrival: string | null;
	arrivalPlatform?: string | null;
	direction: string | null;
	tripId?: string | null;
	remarks?: string[];
	origin: JourneyStop | null;
	destination: JourneyStop | null;
	stopovers: JourneyStop[];
}

export interface JourneyOption {
	id: string;
	departure: string | null;
	arrival: string | null;
	durationMinutes: number;
	transfers: number;
	products: string[];
	legs: JourneyLeg[];
	remarks?: string[];
}

export interface JourneyPagination {
	hasNextPage: boolean;
	hasPrevPage: boolean;
	nextToken?: string | null;
	prevToken?: string | null;
	currentContext?: string | null;
	nextUrl?: string | null;
	prevUrl?: string | null;
	totalResults: number;
}

export interface JourneyMetadata {
	timestamp: string;
	totalCount: number;
	availableProducts: string[];
	format: 'journey-full' | 'journey-minimal';
}

export interface JourneySearchOptions {
	when?: Date | string;
	isArrival?: boolean;
	includeProducts?: Record<string, boolean>;
	products?: string[];
	maxTransfers?: number | null;
	results?: number;
	context?: string | null;
	direction?: 'next' | 'prev';
}

export interface JourneySearchResult {
	from: string;
	to: string;
	fromLocation?: Station;
	toLocation?: Station;
	journeys: JourneyOption[];
	pagination: JourneyPagination;
	metadata: JourneyMetadata;
	query: {
		from: string;
		to: string;
		when: string;
		isArrival: boolean;
		products: string[];
		maxTransfers: number | null;
	};
	error?: string;
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
function formatDepartures(departures: Departure[], format: 'full' | 'minimal'): Departure[] {
	if (format === 'minimal') {
		// Placeholder for future minimal formatting support.
		return departures.map(dep => ({ ...dep }));
	}
	return departures;
}

const parseDurationToMinutes = (
	duration?: string | null,
	departure?: string | null,
	arrival?: string | null
): number => {
	if (duration) {
		const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
		if (match) {
			const hours = match[1] ? parseInt(match[1], 10) : 0;
			const minutes = match[2] ? parseInt(match[2], 10) : 0;
			return hours * 60 + minutes;
		}
	}

	if (departure && arrival) {
		const depDate = new Date(departure);
		const arrDate = new Date(arrival);
		const minutes = Math.round((arrDate.getTime() - depDate.getTime()) / 60000);
		return minutes > 0 ? minutes : 0;
	}

	return 0;
};

const extractRemarkTexts = (remarks?: HafasRemark[]): string[] =>
	(remarks ?? [])
		.map(remark => remark.text)
		.filter((text): text is string => Boolean(text));

const buildJourneyId = (journey: HafasJourney, index: number): string => {
	if (journey.id) return journey.id;
	const fallbackParts = [
		journey.departure ?? '',
		journey.arrival ?? '',
		String(index)
	];
	return fallbackParts.filter(Boolean).join('-') || `journey-${index}`;
};

const collectAvailableProducts = (journeys: JourneyOption[]): string[] => {
	const productSet = new Set<string>();
	journeys.forEach(journey => {
		journey.products.forEach(product => {
			if (product) {
				productSet.add(product.toLowerCase());
			}
		});
	});
	return Array.from(productSet).sort();
};

const buildJourneyPaginationUrls = (
	baseUrl: string | undefined,
	queryParams: URLSearchParams,
	pagination: JourneyPagination
): JourneyPagination => {
	if (!baseUrl) {
		return pagination;
	}

	const updated: JourneyPagination = { ...pagination };

	if (pagination.nextToken) {
		const params = new URLSearchParams(queryParams);
		params.set('direction', 'next');
		params.set('context', pagination.nextToken);
		updated.nextUrl = `${baseUrl}?${params.toString()}`;
	}

	if (pagination.prevToken) {
		const params = new URLSearchParams(queryParams);
		params.set('direction', 'prev');
		params.set('context', pagination.prevToken);
		updated.prevUrl = `${baseUrl}?${params.toString()}`;
	}

	return updated;
};

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
	const pageSize = options.pageSize || options.results || 30;
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

		const stationLocations = Array.isArray(locations)
			? (locations as unknown as HafasLocation[])
			: [];

		return stationLocations.map(loc => ({
			id: loc.id ?? '',
			name: loc.name ?? '',
			products: loc.products ?? {}
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
		pageSize: options.pageSize || options.results || 45,
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

		const stationResult = locations[0];
		const station = (stationResult ?? {}) as HafasLocation;

		// Parse options with defaults
		const when = options.when ? new Date(options.when) : new Date();
		const duration = options.duration || 60; // Default 1 hour
		const pageSize = options.pageSize || options.results || 45;
		const page = options.page || 1;
		
		// For page-based pagination, calculate time offset
		const timeOffsetMinutes = options.page ? (page - 1) * pageSize * 2 : 0;
		const requestTime = new Date(when.getTime() + timeOffsetMinutes * 60 * 1000);
		
		// Request extra results to determine if there are more pages
		const requestResults = pageSize * 2;
		
		const products = options.includeProducts ? sanitizeProducts(options.includeProducts) : { ...DEFAULT_PRODUCTS };

		// 2) Get departures using hafas-client
		const departuresResponse = await client.departures(stationResult, {
			when: requestTime,
			duration: Math.max(duration, pageSize * 3),
			results: requestResults,
			products,
			remarks: false, // Disable detailed remarks to reduce data
			language: 'de'
		});

		// Convert hafas-client format to our interface
		const hafasDepartures = Array.isArray(departuresResponse.departures)
			? (departuresResponse.departures as unknown as HafasDeparture[])
			: [];

		const allDepartures: Departure[] = hafasDepartures.map(dep => {
			// Extract train name and number from format like "REX 7 (Zug-Nr. 29592)"
			const fullName = dep.line?.name ?? '';
			const trainNumberMatch = fullName.match(/\(Zug-Nr\.\s*(\d+)\)/);
			const trainNumber = trainNumberMatch ? trainNumberMatch[1] : null;
			const lineName = fullName.replace(/\s*\(Zug-Nr\.\s*\d+\)/, '').trim();
			const when = dep.when ?? dep.plannedWhen ?? new Date().toISOString();
			const tripId = dep.tripId ?? `${dep.line?.id ?? lineName}-${when}`;

			return {
				when,
				delay: dep.delay || 0,
				platform: dep.platform,
				direction: dep.direction,
				line: {
					id: dep.line?.id,
					name: lineName || dep.line?.name,
					trainNumber: trainNumber ?? undefined,
					product: dep.line?.product
				},
				remarks: (dep.remarks ?? [])
					.map(remark => remark.text)
					.filter((text): text is string => Boolean(text))
					.map(text => ({ text })),
				tripId
			};
		});

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
		const availableProducts = station.products 
			? Object.keys(station.products).filter(p => station.products?.[p]) 
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
				products: station.products || {}
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

export async function getJourneys(
	fromQuery: string,
	toQuery: string,
	options: JourneySearchOptions = {},
	baseUrl?: string
): Promise<JourneySearchResult> {
	const whenDate = options.when ? new Date(options.when) : new Date();
	const normalizedProducts = options.includeProducts ? sanitizeProducts(options.includeProducts) : { ...DEFAULT_PRODUCTS };
	const queryProducts = options.products ?? [];

	const baseQuery = {
		from: fromQuery,
		to: toQuery,
		when: whenDate.toISOString(),
		isArrival: Boolean(options.isArrival),
		products: queryProducts,
		maxTransfers: options.maxTransfers ?? null
	};

	const emptyResult: JourneySearchResult = {
		from: fromQuery,
		to: toQuery,
		journeys: [],
		pagination: {
			hasNextPage: false,
			hasPrevPage: false,
			totalResults: 0
		},
		metadata: {
			timestamp: new Date().toISOString(),
			totalCount: 0,
			availableProducts: [],
			format: 'journey-full'
		},
		query: baseQuery,
		error: undefined
	};

	if (!fromQuery || !toQuery) {
		emptyResult.error = 'Bitte Start- und Zielhaltestelle angeben';
		return emptyResult;
	}

	try {
		const [fromLocations, toLocations] = await Promise.all([
			client.locations(fromQuery, {
				results: 1,
				stops: true,
				addresses: false,
				poi: false
			}),
			client.locations(toQuery, {
				results: 1,
				stops: true,
				addresses: false,
				poi: false
			})
		]);

		const fromLocationRaw = fromLocations[0];
		const toLocationRaw = toLocations[0];

		if (!fromLocationRaw || !toLocationRaw) {
			return {
				...emptyResult,
				error: 'Keine passende Haltestelle gefunden'
			};
		}

		const fromLocation = (fromLocationRaw ?? {}) as HafasLocation;
		const toLocation = (toLocationRaw ?? {}) as HafasLocation;

		const journeyRequest: Record<string, unknown> = {
			results: options.results ?? 6,
			stopovers: true,
			products: normalizedProducts,
			transfers: options.maxTransfers ?? undefined,
			remarks: false,
			polylines: false,
			language: 'de'
		};

		if (options.isArrival) {
			journeyRequest.arrival = whenDate;
		} else {
			journeyRequest.departure = whenDate;
		}

		if (options.context) {
			if (options.direction === 'next') {
				journeyRequest.laterRef = options.context;
			} else if (options.direction === 'prev') {
				journeyRequest.earlierRef = options.context;
			}
		}

		const journeysResponse = await client.journeys(fromLocationRaw, toLocationRaw, journeyRequest);

		const hafasJourneys = Array.isArray(journeysResponse.journeys)
			? (journeysResponse.journeys as unknown as HafasJourney[])
			: [];

		const mappedJourneys: JourneyOption[] = hafasJourneys.map((journey, index) => {
			const legs: JourneyLeg[] = (journey.legs ?? []).map(leg => ({
				lineName: leg.line?.name ?? null,
				product: leg.line?.product ?? null,
				trainNumber: leg.line?.trainNumber ?? null,
				departure: leg.departure ?? null,
				departurePlatform: leg.departurePlatform ?? leg.origin?.platform ?? null,
				arrival: leg.arrival ?? null,
				arrivalPlatform: leg.arrivalPlatform ?? leg.destination?.platform ?? null,
				direction: leg.direction ?? null,
				tripId: leg.tripId ?? null,
				remarks: extractRemarkTexts(leg.remarks),
				origin: {
					id: leg.origin?.id ?? null,
					name: leg.origin?.name ?? null,
					arrival: leg.origin?.arrival ?? null,
					departure: leg.origin?.departure ?? leg.departure ?? null,
					platform: leg.origin?.platform ?? leg.departurePlatform ?? null
				},
				destination: {
					id: leg.destination?.id ?? null,
					name: leg.destination?.name ?? null,
					arrival: leg.destination?.arrival ?? leg.arrival ?? null,
					departure: leg.destination?.departure ?? null,
					platform: leg.destination?.platform ?? leg.arrivalPlatform ?? null
				},
				stopovers: (leg.stopovers ?? []).map(stopover => ({
					id: stopover.stop?.id ?? null,
					name: stopover.stop?.name ?? null,
					arrival: stopover.arrival ?? stopover.stop?.arrival ?? null,
					departure: stopover.departure ?? stopover.stop?.departure ?? null,
					platform: stopover.platform ?? stopover.stop?.platform ?? null
				}))
			}));

			const departure = journey.departure ?? legs[0]?.departure ?? null;
			const arrival = journey.arrival ?? legs[legs.length - 1]?.arrival ?? null;
			const durationMinutes = parseDurationToMinutes(journey.duration, departure, arrival);
			const transfers = typeof journey.transfers === 'number' ? journey.transfers : Math.max(0, legs.length - 1);
			const products = Array.from(new Set(legs.map(leg => leg.product).filter((product): product is string => Boolean(product))));
			const remarks = extractRemarkTexts(journey.remarks);

			return {
				id: buildJourneyId(journey, index),
				departure,
				arrival,
				durationMinutes,
				transfers,
				products,
				legs,
				remarks: remarks.length ? remarks : undefined
			};
		});

		const filteredJourneys = queryProducts.length
			? mappedJourneys.filter(journey =>
				journey.products.some(product => queryProducts
					.map(p => p.toLowerCase())
					.includes(product.toLowerCase()))
				)
			: mappedJourneys;

		const pagination: JourneyPagination = {
			hasNextPage: Boolean((journeysResponse as Record<string, unknown>).laterRef),
			hasPrevPage: Boolean((journeysResponse as Record<string, unknown>).earlierRef),
			nextToken: (journeysResponse as Record<string, unknown>).laterRef as string | undefined,
			prevToken: (journeysResponse as Record<string, unknown>).earlierRef as string | undefined,
			currentContext: (journeysResponse as Record<string, unknown>).context as string | undefined,
			totalResults: filteredJourneys.length
		};

		const searchParams = new URLSearchParams();
		searchParams.set('from', fromQuery);
		searchParams.set('to', toQuery);
		searchParams.set('when', whenDate.toISOString());
		if (options.isArrival) searchParams.set('isArrival', 'true');
		if (queryProducts.length) searchParams.set('products', queryProducts.join(','));
		if (options.maxTransfers !== null && options.maxTransfers !== undefined) {
			searchParams.set('maxTransfers', String(options.maxTransfers));
		}

		const paginationWithUrls = buildJourneyPaginationUrls(baseUrl, searchParams, pagination);
		const availableProducts = collectAvailableProducts(filteredJourneys);

		return {
			from: fromQuery,
			to: toQuery,
			fromLocation: {
				id: fromLocation.id ?? '',
				name: fromLocation.name ?? fromQuery,
				products: fromLocation.products ?? {}
			},
			toLocation: {
				id: toLocation.id ?? '',
				name: toLocation.name ?? toQuery,
				products: toLocation.products ?? {}
			},
			journeys: filteredJourneys,
			pagination: paginationWithUrls,
			metadata: {
				timestamp: new Date().toISOString(),
				totalCount: filteredJourneys.length,
				availableProducts,
				format: 'journey-full'
			},
			query: baseQuery,
			error: filteredJourneys.length === 0 ? 'Keine Verbindungen gefunden' : undefined
		};
	} catch (error) {
		console.error('Error fetching journeys:', error);
		return {
			...emptyResult,
			error: 'Fehler beim Laden der Verbindungen'
		};
	}
}

/**
 * Get arrivals for a station (if needed in the future)
 */
export async function getTrainArrivals(): Promise<TrainDeparturesResult> {
	// Similar implementation but for arrivals
	// Could be implemented later if needed
	throw new Error('Arrivals not implemented yet');
}
