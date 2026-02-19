<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
		onclick?: () => void;
	}

	let { class: className = '', children, onclick }: Props = $props();
</script>

{#if onclick}
	<button
		type="button"
		class="glass rounded-2xl p-4 w-full text-left active:scale-[0.98] transition-transform {className}"
		{onclick}
	>
		{@render children()}
	</button>
{:else}
	<div class="glass rounded-2xl p-4 {className}">
		{@render children()}
	</div>
{/if}
