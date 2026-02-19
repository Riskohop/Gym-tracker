<script lang="ts">
	interface Props {
		class?: string;
		lines?: number;
	}

	let { class: className = 'h-4', lines = 1 }: Props = $props();
</script>

{#each Array(lines) as _, i}
	<div class="skeleton {className} {i === lines - 1 && lines > 1 ? 'w-3/4' : ''}"></div>
{/each}
