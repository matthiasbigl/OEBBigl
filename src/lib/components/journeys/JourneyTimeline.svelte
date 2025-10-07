<script lang="ts">
	 import Timeline from '$lib/components/ui/Timeline.svelte';
	 import type { TimelineNode, TimelineDetail } from '$lib/components/ui/timelineTypes';
	import type { JourneyOption, JourneyLeg } from '$lib/server/hafas';

	export let journey: JourneyOption;

	const formatTime = (iso: string | null | undefined): string => {
		if (!iso) return '--:--';
		return new Date(iso).toLocaleTimeString('de-DE', {
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const formatServiceLabel = (leg: JourneyLeg): string => {
		const parts = [leg.lineName ?? leg.product ?? '---'];
		if (leg.trainNumber) parts.push(`#${leg.trainNumber}`);
		return parts.join(' ');
	};

	const buildDepartureDetails = (leg: JourneyLeg): TimelineDetail[] => {
		const details: TimelineDetail[] = [];
		details.push({
			label: 'BOARD',
			value: formatServiceLabel(leg),
			emphasis: true
		});
		details.push({
			label: 'DEPART',
			value: `${formatTime(leg.departure)} • ${leg.departurePlatform ?? '---'}`
		});
		if (leg.direction) {
			details.push({
				label: 'DIRECTION',
				value: leg.direction
			});
		}
		return details;
	};

	const buildTransferDetails = (leg: JourneyLeg): TimelineDetail[] => {
		const details: TimelineDetail[] = [];
		details.push({
			label: 'NEXT',
			value: formatServiceLabel(leg),
			emphasis: true
		});
		details.push({
			label: 'DEPART',
			value: `${formatTime(leg.departure)} • ${leg.departurePlatform ?? '---'}`
		});
		if (leg.direction) {
			details.push({
				label: 'DIRECTION',
				value: leg.direction
			});
		}
		return details;
	};

	$: timelineNodes = buildTimelineNodes(journey);

	function buildTimelineNodes(journey: JourneyOption): TimelineNode[] {
		const nodes: TimelineNode[] = [];
		const legs = journey.legs ?? [];
		const firstLeg = legs[0];
		const lastLeg = legs[legs.length - 1];

		if (firstLeg) {
			nodes.push({
				id: `${journey.id}-start`,
				title: firstLeg.origin?.name ?? 'START',
				variant: 'departure',
				time: formatTime(firstLeg.departure ?? journey.departure),
				details: buildDepartureDetails(firstLeg)
			});
		}

		for (let index = 1; index < legs.length; index += 1) {
			const leg = legs[index];
			const transferStation = leg.origin?.name ?? legs[index - 1]?.destination?.name ?? `TRANSFER ${index}`;
			nodes.push({
				id: `${journey.id}-transfer-${index}`,
				title: transferStation,
				time: formatTime(leg.departure),
				variant: 'transfer',
				details: buildTransferDetails(leg)
			});
		}

		if (lastLeg) {
			nodes.push({
				id: `${journey.id}-end`,
				title: lastLeg.destination?.name ?? 'DESTINATION',
				variant: 'arrival',
				time: formatTime(lastLeg.arrival ?? journey.arrival),
				details: [
					{
						label: 'ARRIVE',
						value: `${formatTime(lastLeg.arrival)} • ${lastLeg.arrivalPlatform ?? '---'}`
					},
					{
						label: 'DURATION',
						value: `${journey.durationMinutes} MIN`
					}
				]
			});
		}

		if (!nodes.length) {
			nodes.push({
				id: `${journey.id}-fallback-start`,
				title: 'ORIGIN',
				variant: 'departure',
				time: formatTime(journey.departure)
			});
			nodes.push({
				id: `${journey.id}-fallback-end`,
				title: 'DESTINATION',
				variant: 'arrival',
				time: formatTime(journey.arrival)
			});
		}

		return nodes;
	}
</script>

<Timeline nodes={timelineNodes} />
