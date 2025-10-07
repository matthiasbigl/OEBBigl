export type TimelineDetail = {
	label: string;
	value: string;
	emphasis?: boolean;
};

export type TimelineNode = {
	id?: string;
	title: string;
	subtitle?: string;
	time?: string;
	details?: TimelineDetail[];
	variant?: 'default' | 'transfer' | 'arrival' | 'departure';
};
