<script lang="ts">
	export let error: string;
</script>

<div class="max-w-4xl mx-auto mb-8">
	<div class="bg-red-900/30 border border-red-500/50 rounded-lg p-6 backdrop-blur-sm">
		<h3 class="text-red-400 font-bold font-mono text-xl">&gt; ERROR: {error}</h3>
	</div>
</div>
