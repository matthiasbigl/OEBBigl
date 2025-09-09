<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let color: 'cyan' | 'green' | 'yellow' | 'white' = 'cyan';
	export let text: string = '';
	
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8', 
		lg: 'w-12 h-12'
	};
	
	const colorClasses = {
		cyan: 'border-cyan-400 border-t-transparent',
		green: 'border-green-400 border-t-transparent',
		yellow: 'border-yellow-400 border-t-transparent',
		white: 'border-white border-t-transparent'
	};
	
	const textColorClasses = {
		cyan: 'text-cyan-400',
		green: 'text-green-400',
		yellow: 'text-yellow-400',
		white: 'text-white'
	};
</script>

<div class="flex items-center justify-center gap-3">
	<div 
		class="animate-spin rounded-full border-2 {sizeClasses[size]} {colorClasses[color]}"
		role="status"
		aria-label="Loading"
	></div>
	{#if text}
		<span class="font-mono text-sm {textColorClasses[color]}">
			{text}
		</span>
	{/if}
</div>
