import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getTrainDepartures } from '$lib/server/hafas';

export const load: PageServerLoad = async ({ url }) => {
	const stopName = url.searchParams.get('station') || 'Wien Hbf';
	const when = url.searchParams.get('when');
	const duration = url.searchParams.get('duration');
	const results = url.searchParams.get('results');
	
	// Build options object
	const options: any = {};
	if (when) options.when = when;
	if (duration) options.duration = parseInt(duration);
	if (results) options.results = parseInt(results);
	
	return await getTrainDepartures(stopName, options);
};

export const actions: Actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const station = data.get('station')?.toString() || 'Wien Hbf';
		
		// Redirect to the same page with the new station parameter
		throw redirect(302, `/?station=${encodeURIComponent(station)}`);
	}
};