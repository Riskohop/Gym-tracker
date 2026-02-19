<script lang="ts">
	import type { Snippet } from 'svelte';
	import { haptic } from '$lib/utils/calc';

	interface Props {
		ondelete: () => void;
		children: Snippet;
	}

	let { ondelete, children }: Props = $props();

	let startX = $state(0);
	let currentX = $state(0);
	let swiping = $state(false);
	let el: HTMLDivElement | undefined = $state();

	const threshold = 80;
	const offset = $derived(swiping ? Math.min(0, currentX - startX) : 0);
	const isDeleting = $derived(Math.abs(offset) > threshold);

	function handleTouchStart(e: TouchEvent) {
		startX = e.touches[0].clientX;
		swiping = true;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!swiping) return;
		currentX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		if (isDeleting) {
			haptic('medium');
			ondelete();
		}
		swiping = false;
		startX = 0;
		currentX = 0;
	}
</script>

<div class="relative overflow-hidden rounded-xl">
	<!-- Delete background -->
	<div class="absolute inset-0 flex items-center justify-end px-6 bg-slate-700/80 rounded-xl">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-slate-300">
			<path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
		</svg>
	</div>

	<!-- Content -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={el}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		class="relative transition-transform duration-150"
		style="transform: translateX({offset}px);"
	>
		{@render children()}
	</div>
</div>
