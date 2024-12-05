<script>
	import Loader from '$lib/components/Loader/Loader.svelte';

	import { queryForDocuments } from '../../api/functions.js';
	import { onMount } from 'svelte';
	import Project from './Project.svelte';

	let projects = [];

	onMount(async () => {
		projects = await queryForDocuments();
		console.log(projects);
	});
</script>

<div class="content">
	{#each projects as project}
		<Project project={project} />
	{:else}
		<Loader />
	{/each}
</div>

<style>
	.content {
		width: 100%;
		color: white;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		text-align: center;
	}
</style>
