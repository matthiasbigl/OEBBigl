import type { PageServerLoad, Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { getTrainDepartures } from '$lib/server/hafas';

export const load: PageServerLoad = async ({ url }) => {
	const stopName = url.searchParams.get('station') || 'Wien Hbf';
	return await getTrainDepartures(stopName);
};

export const actions: Actions = {
	search: async ({ request }) => {
		const data = await request.formData();
		const station = data.get('station')?.toString() || 'Wien Hbf';
		
		// Redirect to the same page with the new station parameter
		throw redirect(302, `/?station=${encodeURIComponent(station)}`);
	}
};