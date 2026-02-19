<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, registerables, type ChartConfiguration } from 'chart.js';

	interface Props {
		data: { labels: string[]; values: number[] };
		label?: string;
		color?: string;
		type?: 'line' | 'bar';
	}

	let { data, label = '', color = '#f97316', type = 'line' }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chartInstance: Chart | undefined;

	Chart.register(...registerables);

	onMount(() => {
		return () => chartInstance?.destroy();
	});

	$effect(() => {
		if (!canvas || !data) return;
		chartInstance?.destroy();

		const config: ChartConfiguration = {
			type,
			data: {
				labels: data.labels,
				datasets: [
					{
						label,
						data: data.values,
						borderColor: color,
						backgroundColor: type === 'line' ? `${color}20` : `${color}80`,
						borderWidth: 2,
						fill: type === 'line',
						tension: 0.3,
						pointRadius: 3,
						pointBackgroundColor: color,
						pointBorderColor: 'transparent',
						borderRadius: type === 'bar' ? 6 : 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { intersect: false, mode: 'index' },
				plugins: {
					legend: { display: false },
					tooltip: {
						backgroundColor: '#0a0a0a',
						titleColor: '#e5e5e5',
						bodyColor: '#a3a3a3',
						borderColor: '#1c1c1c',
						borderWidth: 1,
						cornerRadius: 8,
						padding: 10,
						displayColors: false
					}
				},
				scales: {
					x: {
						grid: { color: 'rgba(255, 255, 255, 0.04)' },
						ticks: { color: '#525252', font: { size: 10 }, maxRotation: 45 }
					},
					y: {
						grid: { color: 'rgba(255, 255, 255, 0.04)' },
						ticks: { color: '#525252', font: { size: 10 } },
						beginAtZero: false
					}
				}
			}
		};

		chartInstance = new Chart(canvas, config);
	});
</script>

<div class="w-full h-48">
	<canvas bind:this={canvas}></canvas>
</div>
