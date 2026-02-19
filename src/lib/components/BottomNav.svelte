<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';
	import { settings } from '$lib/stores/settings';
	import { t } from '$lib/utils/i18n';
	import { haptic } from '$lib/utils/calc';

	const locale = derived(settings, ($s) => $s.locale);

	const navItems = [
		{ href: '/dashboard', icon: 'home', labelKey: 'nav.dashboard' },
		{ href: '/workouts', icon: 'dumbbell', labelKey: 'nav.workouts' },
		{ href: '/exercises', icon: 'list', labelKey: 'nav.exercises' },
		{ href: '/statistics', icon: 'chart', labelKey: 'nav.stats' },
		{ href: '/settings', icon: 'gear', labelKey: 'nav.settings' }
	];

	function isActive(path: string, href: string): boolean {
		if (href === '/dashboard') return path === '/' || path === '/dashboard';
		return path.startsWith(href);
	}

	function handleTap() {
		haptic('light');
	}
</script>

<nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border-subtle"
	style="padding-bottom: var(--safe-bottom, 0px);">
	<div class="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
		{#each navItems as item}
			{@const active = isActive($page.url.pathname, item.href)}
			<a
				href={item.href}
				onclick={handleTap}
				class="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 px-2 rounded-xl transition-all duration-200
					{active ? 'text-primary' : 'text-slate-500'}"
			>
				<div class="w-6 h-6 flex items-center justify-center {active ? 'scale-110' : ''} transition-transform">
					{#if item.icon === 'home'}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
							<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"/>
						</svg>
					{:else if item.icon === 'dumbbell'}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
							<path d="M6.5 6.5h11M6.5 17.5h11M4 10h16M4 14h16M2 10v4M22 10v4M6.5 6.5v11M17.5 6.5v11"/>
						</svg>
					{:else if item.icon === 'list'}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
							<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
						</svg>
					{:else if item.icon === 'chart'}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
							<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
						</svg>
					{:else if item.icon === 'gear'}
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
							<path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
							<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
						</svg>
					{/if}
				</div>
				<span class="text-[10px] font-medium leading-tight">{t(item.labelKey, $locale)}</span>
			</a>
		{/each}
	</div>
</nav>
