<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onrefresh: () => Promise<void>;
		children: Snippet;
	}

	let { onrefresh, children }: Props = $props();

	let startY = $state(0);
	let pullDistance = $state(0);
	let refreshing = $state(false);
	let pulling = $state(false);

	const threshold = 60;
	const maxPull = 100;

	function handleTouchStart(e: TouchEvent) {
		if (window.scrollY === 0) {
			startY = e.touches[0].clientY;
			pulling = true;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (!pulling || refreshing) return;
		const diff = e.touches[0].clientY - startY;
		if (diff > 0) {
			pullDistance = Math.min(diff * 0.5, maxPull);
		}
	}

	async function handleTouchEnd() {
		if (pullDistance >= threshold && !refreshing) {
			refreshing = true;
			await onrefresh();
			refreshing = false;
		}
		pullDistance = 0;
		pulling = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	{#if pullDistance > 10 || refreshing}
		<div class="flex items-center justify-center py-3 transition-all"
			style="height: {refreshing ? 40 : pullDistance}px; opacity: {Math.min(1, pullDistance / threshold)}">
			<div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full
				{refreshing ? 'animate-spin' : ''}"
				style="transform: rotate({pullDistance * 3}deg)">
			</div>
		</div>
	{/if}
	{@render children()}
</div>
