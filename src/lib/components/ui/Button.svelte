<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'danger' | 'filter' | 'filter-active' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let onClick: (() => void) | undefined = undefined;
	export let disabled = false;
	export let title = '';

	const variants = {
		primary: 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]',
		secondary: 'bg-slate-800/50 border-2 border-cyan-500/30 text-cyan-100 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
		danger: 'bg-red-600/50 hover:bg-red-500/70 text-white border border-red-400/30 hover:border-red-400',
		filter: 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white border border-purple-400/30 hover:border-cyan-400/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)]',
		'filter-active': 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
	};

	const sizes = {
		sm: 'px-3 py-1 text-xs',
		md: 'px-6 py-2 text-sm',
		lg: 'px-8 py-4 text-lg'
	};

	$: baseClasses = 'font-bold rounded-lg transition-all duration-300 font-mono cursor-pointer hover:cursor-pointer';
	$: variantClasses = variants[variant];
	$: sizeClasses = sizes[size];
	$: disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
</script>

<button
	class="{baseClasses} {variantClasses} {sizeClasses} {disabledClasses}"
	on:click={onClick}
	{disabled}
	{title}
>
	<slot />
</button>
