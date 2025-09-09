import {createClient} from 'hafas-client'
import {profile as oebbProfile} from 'hafas-client/p/oebb/index.js'

const client = createClient(oebbProfile, 'biglmatthias@gmail.com');

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
}

/**
 * Search for stations by name
 */
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
 * Get train departures for a station
 */
export async function getTrainDepartures(stationQuery: string): Promise<TrainDeparturesResult> {
	try {
		console.log('Searching for station:', stationQuery);
		
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
				departures: []
			};
		}

		const station = locations[0];

		// 2) Get departures using hafas-client - optimized request
		const departuresResponse = await client.departures(station, {
			duration: 60, // 1 hour
			results: 15, // fewer results
			products: {
				// Only get trains and regional transport, exclude buses/trams/etc
				nationalExpress: true,
				national: true, 
				interregional: true,
				regional: true,
				suburban: true,
				bus: false,
				ferry: false,
				subway: false,
				tram: false,
				onCall: false
			},
			remarks: false // Disable detailed remarks to reduce data
		});

		console.log('HAFAS client departures response:', JSON.stringify(departuresResponse, null, 2));

		// Convert hafas-client format to our interface - simplified mapping
		const departures = departuresResponse.departures?.map((dep: any) => {
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
				remarks: [] // Empty array since we disabled remarks
			};
		}) || [];

		return {
			station: stationQuery,
			stopId: station.id,
			departures: departures as Departure[],
			location: {
				id: station.id || '',
				name: station.name || '',
				products: (station as any).products || {}
			}
		};
	} catch (error) {
		console.error('Error fetching train data:', error);
		return {
			station: stationQuery,
			error: 'Fehler beim Laden der Abfahrten',
			departures: []
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
