<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { settings } from '$lib/stores/settings';
	import { isLoading } from '$lib/stores/app';
	import { seedDatabase } from '$lib/db/seed';
	import { derived } from 'svelte/store';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}
	let { children }: Props = $props();

	const locale = derived(settings, ($s) => $s.locale);

	const hideNav = $derived(
		$page.url.pathname.startsWith('/workouts/') && $page.url.pathname !== '/workouts/'
	);

	onMount(async () => {
		settings.init();
		await seedDatabase($locale);
		isLoading.set(false);
	});
</script>

<div class="min-h-screen min-h-dvh">
	<main class="max-w-lg mx-auto {hideNav ? '' : 'pb-safe'}">
		<div class="page-enter">
			{@render children()}
		</div>
	</main>

	{#if !hideNav}
		<BottomNav />
	{/if}

	<Toast />
</div>
