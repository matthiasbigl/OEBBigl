<script lang="ts">
	export let error: string;
</script>

<div class="w-full">
	<div class="border border-red-600 bg-black/60 backdrop-blur-sm">
		<!-- Error Header -->
		<div class="border-b border-red-600 px-4 py-2 bg-red-900/20">
			<div class="flex items-center space-x-2 text-xs text-red-400">
				<div class="w-2 h-2 bg-red-400 animate-pulse"></div>
				<span class="font-mono tracking-wider">SYSTEM.ERROR</span>
			</div>
		</div>
		
		<!-- Error Content -->
		<div class="p-4">
			<div class="space-y-2">
				<div class="text-lg font-bold text-red-400 font-mono">
					◯ ERROR.CODE: {error}
				</div>
				<div class="text-sm text-gray-400 font-mono">
					// System encountered an error processing request
				</div>
			</div>
		</div>
	</div>
</div>
