<script lang="ts">
	import { toastMessage } from '$lib/stores/app';
</script>

{#if $toastMessage}
	<div class="fixed top-12 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
		<div class="px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg backdrop-blur-lg
			{$toastMessage.type === 'success' ? 'bg-success/90 text-white' : ''}
			{$toastMessage.type === 'error' ? 'bg-danger/90 text-white' : ''}
			{$toastMessage.type === 'info' ? 'bg-primary/90 text-white' : ''}">
			{$toastMessage.text}
		</div>
	</div>
{/if}

<style>
	@keyframes slide-down {
		from { opacity: 0; transform: translate(-50%, -20px); }
		to { opacity: 1; transform: translate(-50%, 0); }
	}
	.animate-slide-down {
		animation: slide-down 0.2s ease-out;
	}
</style>
