<script lang="ts">
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { settings } from '$lib/stores/settings';

	const locale = derived(settings, ($s) => $s.locale);
</script>

<div class="px-4 pt-14 pb-20 space-y-6" style="padding-top: calc(3.5rem + var(--safe-top, 0px));">
	<div class="flex items-center gap-3">
		<button
			class="p-2 rounded-xl bg-surface active:scale-90 transition-transform"
			onclick={() => goto('/settings')}
			aria-label="Back"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
		</button>
		<h1 class="text-xl font-bold">
			{$locale === 'ru' ? 'Политика конфиденциальности' : 'Privacy Policy'}
		</h1>
	</div>

	{#if $locale === 'ru'}
		<div class="prose prose-invert prose-sm max-w-none space-y-4">
			<section>
				<h2 class="text-lg font-semibold">Хранение данных</h2>
				<p class="text-slate-400">
					Gym Tracker хранит все данные исключительно на вашем устройстве с использованием
					технологии IndexedDB. Никакие данные не передаются на внешние серверы.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Сбор данных</h2>
				<p class="text-slate-400">
					Приложение не собирает, не отправляет и не обрабатывает персональные данные.
					У приложения нет серверной части, бэкенда или аналитики.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Cookies</h2>
				<p class="text-slate-400">
					Приложение не использует cookies. Настройки хранятся в localStorage вашего браузера.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Удаление данных</h2>
				<p class="text-slate-400">
					Вы можете удалить все данные приложения, очистив данные сайта в настройках браузера
					или удалив приложение с устройства.
				</p>
			</section>
		</div>
	{:else}
		<div class="prose prose-invert prose-sm max-w-none space-y-4">
			<section>
				<h2 class="text-lg font-semibold">Data Storage</h2>
				<p class="text-slate-400">
					Gym Tracker stores all data exclusively on your device using IndexedDB technology.
					No data is transmitted to external servers.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Data Collection</h2>
				<p class="text-slate-400">
					The application does not collect, send, or process any personal data.
					There is no server-side component, backend, or analytics.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Cookies</h2>
				<p class="text-slate-400">
					The application does not use cookies. Settings are stored in your browser's localStorage.
				</p>
			</section>

			<section>
				<h2 class="text-lg font-semibold">Data Deletion</h2>
				<p class="text-slate-400">
					You can delete all application data by clearing site data in your browser settings
					or by removing the app from your device.
				</p>
			</section>
		</div>
	{/if}
</div>
