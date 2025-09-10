<script lang="ts">
	
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let color: 'gray' | 'green' | 'orange' | 'white' = 'gray';
	export let text: string = '';
	
	const sizeClasses = {
		sm: 'w-3 h-3',
		md: 'w-6 h-6', 
		lg: 'w-8 h-8'
	};
	
	const colorClasses = {
		gray: 'border-gray-400',
		green: 'border-green-400',
		orange: 'border-orange-400',
		white: 'border-white'
	};
	
	const textColorClasses = {
		gray: 'text-gray-400',
		green: 'text-green-400',
		orange: 'text-orange-400',
		white: 'text-white'
	};
</script>

<div class="flex items-center justify-center gap-3">
	<!-- Retro-futuristic loading animation -->
	<div class="relative {sizeClasses[size]}">
		<!-- Outer rotating square -->
		<div class="absolute inset-0 border border-{colorClasses[color]} animate-spin" style="animation-duration: 2s;"></div>
		<!-- Inner rotating square -->
		<div class="absolute inset-1 border border-{colorClasses[color]} animate-spin opacity-60" style="animation-duration: 1.5s; animation-direction: reverse;"></div>
		<!-- Center dot -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="w-1 h-1 bg-{colorClasses[color]} animate-pulse"></div>
		</div>
	</div>
	
	{#if text}
		<span class="font-mono text-xs tracking-wider {textColorClasses[color]}">
			{text}
		</span>
	{/if}
</div>
