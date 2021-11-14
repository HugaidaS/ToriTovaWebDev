<script context="module">
	import { browser, dev } from '$app/env';
	import Project from '$lib/Projects/Project.svelte';
	import { projects } from '../api/projects';
	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;
	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;
	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<div class="content">
	{#each projects as project}
		 <Project project={project}/>
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
