<script lang="ts">
	export let label: string;
	export let color: string = 'blue-400';
</script>

<div class="flex items-center space-x-3 mb-3">
	<div class="w-2 h-2 bg-{color} pulse-element"></div>
	<span class="text-xs text-gray-400 font-mono tracking-wider">{label}</span>
	<div class="flex-1 h-px bg-gray-700"></div>
</div>
