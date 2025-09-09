<script lang="ts">
	import Button from '../ui/Button.svelte';
	
	export let stationName: string;
	export let onSearch: (station: string) => void;

	let inputValue = stationName;

	const handleSubmit = () => {
		onSearch(inputValue);
	};
</script>

<div class="max-w-2xl mx-auto mb-12">
	<form on:submit|preventDefault={handleSubmit} class="relative">
		<div class="relative group">
			<input 
				type="text" 
				bind:value={inputValue}
				placeholder="Bahnhof eingeben..."
				class="w-full px-6 py-4 bg-slate-800/50 border-2 border-cyan-500/30 rounded-lg text-cyan-100 placeholder-cyan-300/50 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 backdrop-blur-sm font-mono text-lg"
			>
			<div class="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
		</div>
		<div class="mt-4 flex justify-center">
			<Button variant="primary" size="lg" onClick={handleSubmit}>
				&gt;&gt; SCAN DEPARTURES &lt;&lt;
			</Button>
		</div>
	</form>
</div>
