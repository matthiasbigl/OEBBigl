import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { JourneyOption, JourneySearchResult } from '$lib/server/hafas';

export interface JourneyFormState {
	from: string;
	to: string;
	date: string;
	time: string;
	isArrival: boolean;
	products: string[];
	maxTransfers: number | null;
}

export interface JourneySearchExtras {
	direction?: 'next' | 'prev';
	contextToken?: string | null;
}

const formatDatePart = (value: number): string => value.toString().padStart(2, '0');

const toDateInputValue = (date: Date): string => {
	return `${date.getFullYear()}-${formatDatePart(date.getMonth() + 1)}-${formatDatePart(date.getDate())}`;
};

const toTimeInputValue = (date: Date): string => {
	return `${formatDatePart(date.getHours())}:${formatDatePart(date.getMinutes())}`;
};

const createDefaultFormState = (): JourneyFormState => {
	const now = new Date();
	return {
		from: '',
		to: '',
		date: toDateInputValue(now),
		time: toTimeInputValue(now),
		isArrival: false,
		products: [],
		maxTransfers: null
	};
};

const combineDateTime = (date: string, time: string): Date => {
	if (!date) {
		return new Date();
	}
	const [year, month, day] = date.split('-').map(part => parseInt(part, 10));
	const [hour, minute] = (time || '00:00').split(':').map(part => parseInt(part, 10));
	return new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0, 0);
};

const sanitizeProducts = (products: string[]): string[] => {
	return Array.from(new Set(products.map(product => product.toLowerCase()).filter(Boolean)));
};

export const journeyForm = writable<JourneyFormState>(createDefaultFormState());
export const journeyResults = writable<JourneyOption[]>([]);
export const journeyPagination = writable<JourneySearchResult['pagination'] | null>(null);
export const journeyMetadata = writable<JourneySearchResult['metadata'] | null>(null);
export const journeyQuery = writable<JourneySearchResult['query'] | null>(null);
export const journeyError = writable<string | null>(null);
export const isJourneySearching = writable(false);

export const activeJourneyProductFilters = writable<Set<string>>(new Set());
export const maxJourneyTransfers = writable<number | null>(null);

export const filteredJourneys = derived(
	[journeyResults, activeJourneyProductFilters, maxJourneyTransfers],
	([$journeyResults, $productFilters, $maxTransfers]) => {
		let results = $journeyResults;

		if ($productFilters.size > 0) {
			results = results.filter(journey => {
				const productSet = new Set(
					journey.products
						.map((product: string) => product.toLowerCase())
						.filter(Boolean)
				);
				return Array.from($productFilters).some(product => productSet.has(product));
			});
		}

		if ($maxTransfers !== null && $maxTransfers >= 0) {
			results = results.filter(journey => journey.transfers <= $maxTransfers);
		}

		return results;
	}
);

export const totalJourneyFilters = derived(
	[activeJourneyProductFilters, maxJourneyTransfers],
	([$productFilters, $maxTransfers]) => $productFilters.size + ($maxTransfers !== null ? 1 : 0)
);

export const hasJourneyFilters = derived(
	totalJourneyFilters,
	($total) => $total > 0
);

const buildSearchParams = (formState: JourneyFormState, extras?: JourneySearchExtras): URLSearchParams => {
	const params = new URLSearchParams();

	params.set('from', formState.from.trim());
	params.set('to', formState.to.trim());

	const whenDate = combineDateTime(formState.date, formState.time);
	params.set('when', whenDate.toISOString());

	if (formState.isArrival) {
		params.set('isArrival', 'true');
	}

	if (formState.maxTransfers !== null && formState.maxTransfers >= 0) {
		params.set('maxTransfers', formState.maxTransfers.toString());
	}

	const products = sanitizeProducts(formState.products);
	if (products.length > 0) {
		params.set('products', products.join(','));
	}

	if (extras?.direction) {
		params.set('direction', extras.direction);
	}

	if (extras?.contextToken) {
		params.set('context', extras.contextToken);
	}

	return params;
};

const updateProductsFromFilters = (filters: Set<string>) => {
	const products = Array.from(filters);
	journeyForm.update(state => ({
		...state,
		products
	}));
};

export const journeyActions = {
	resetForm() {
		journeyForm.set(createDefaultFormState());
		activeJourneyProductFilters.set(new Set());
		maxJourneyTransfers.set(null);
	},

	updateForm(update: Partial<JourneyFormState>) {
		journeyForm.update(state => ({
			...state,
			...update,
			products: update.products ? sanitizeProducts(update.products) : state.products,
			maxTransfers: update.maxTransfers !== undefined ? update.maxTransfers : state.maxTransfers
		}));
	},

	setIsSearching(isSearching: boolean) {
		isJourneySearching.set(isSearching);
	},

	initializeFromData(result: JourneySearchResult | null) {
		if (!result) {
			journeyResults.set([]);
			journeyPagination.set(null);
			journeyMetadata.set(null);
			journeyQuery.set(null);
			journeyError.set(null);
			this.resetForm();
			this.setIsSearching(false);
			return;
		}

		journeyResults.set(result.journeys ?? []);
		journeyPagination.set(result.pagination ?? null);
		journeyMetadata.set(result.metadata ?? null);
		journeyQuery.set(result.query ?? null);
		journeyError.set(result.error ?? null);

		const whenDate = result.query?.when ? new Date(result.query.when) : new Date();
		const products = sanitizeProducts(result.query?.products ?? []);
		const formState: JourneyFormState = {
			from: result.query?.from ?? '',
			to: result.query?.to ?? '',
			date: toDateInputValue(whenDate),
			time: toTimeInputValue(whenDate),
			isArrival: Boolean(result.query?.isArrival),
			products,
			maxTransfers: result.query?.maxTransfers ?? null
		};

		journeyForm.set(formState);

		const productSet = new Set(products.map(product => product.toLowerCase()));
		activeJourneyProductFilters.set(productSet);
		maxJourneyTransfers.set(result.query?.maxTransfers ?? null);
		this.setIsSearching(false);
	},

	swapStations() {
		journeyForm.update(state => ({
			...state,
			from: state.to,
			to: state.from
		}));
	},

	handleJourneySearch(formValues?: JourneyFormState, extras?: JourneySearchExtras): string | null {
		if (!browser) return null;

		const formState = formValues ? {
			...formValues,
			products: sanitizeProducts(formValues.products)
		} : {
			...get(journeyForm),
			products: sanitizeProducts(get(journeyForm).products)
		};

		if (!formState.from || !formState.to) {
			return null;
		}

		journeyForm.set(formState);
		activeJourneyProductFilters.set(new Set(formState.products.map(product => product.toLowerCase())));
		maxJourneyTransfers.set(formState.maxTransfers ?? null);

		const params = buildSearchParams(formState, extras);
		const targetUrl = `/journeys?${params.toString()}`;

		this.setIsSearching(true);
		return targetUrl;
	},

	handlePagination(direction: 'next' | 'prev'): string | null {
		const pagination = get(journeyPagination);
		if (!pagination) return null;

		const token = direction === 'next' ? pagination.nextToken : pagination.prevToken;
		if (!token) return null;

		const formState = get(journeyForm);
		return this.handleJourneySearch(formState, {
			direction,
			contextToken: token
		});
	},

	toggleProductFilter(product: string) {
		if (!product) return;
		const normalized = product.toLowerCase();
		
		activeJourneyProductFilters.update(filters => {
			const next = new Set(filters);
			if (next.has(normalized)) {
				next.delete(normalized);
			} else {
				next.add(normalized);
			}
			return next;
		});
		
		// Sync with form after update
		const currentFilters = get(activeJourneyProductFilters);
		updateProductsFromFilters(currentFilters);
	},

	clearFilters() {
		activeJourneyProductFilters.set(new Set());
		maxJourneyTransfers.set(null);
		journeyForm.update(state => ({
			...state,
			products: [],
			maxTransfers: null
		}));
	},

	setMaxTransfers(value: number | null) {
		const numValue = value !== null && value >= 0 ? value : null;
		console.log('[journeyActions.setMaxTransfers] Setting value:', { input: value, normalized: numValue });
		maxJourneyTransfers.set(numValue);
		journeyForm.update(state => ({
			...state,
			maxTransfers: numValue
		}));
		console.log('[journeyActions.setMaxTransfers] Stores updated');
	},

	setResults(result: JourneySearchResult) {
		this.initializeFromData(result);
	}
};
