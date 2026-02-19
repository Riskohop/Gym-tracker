<script lang="ts">
	import type { Snippet } from 'svelte';
	import { haptic } from '$lib/utils/calc';

	interface Props {
		open: boolean;
		onclose: () => void;
		title?: string;
		children: Snippet;
	}

	let { open, onclose, title = '', children }: Props = $props();

	function handleBackdropClick() {
		haptic('light');
		onclose();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
		<!-- Backdrop -->
		<button
			type="button"
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={handleBackdropClick}
			aria-label="Close"
		></button>

		<!-- Content -->
		<div class="relative w-full max-w-lg mx-auto animate-modal-in">
			<div class="glass rounded-t-3xl sm:rounded-3xl p-6 pb-8 m-0 sm:m-4"
				style="padding-bottom: calc(2rem + var(--safe-bottom, 0px));">
				{#if title}
					<h2 class="text-lg font-semibold mb-4">{title}</h2>
				{/if}
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes modal-in {
		from { opacity: 0; transform: translateY(100px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-modal-in {
		animation: modal-in 0.25s ease-out;
	}
</style>
