<script>
	export let project;
    import ProjectContent from "./ProjectContent.svelte";
	import { fade } from 'svelte/transition';
	let isHidden=false;

</script>

<style>
	.card-wrapper{
		margin: 1rem;
		background-color: var(--pure-white);
		height: 250px;
		width: 300px;
		z-index: 1;
		color: black;
		background-position: center;
		background-repeat: no-repeat;
		background-size: cover;
	}
	.card-content{
		background-color: #1b1922e7;
		color: bisque;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		border: 1px solid var(--accent-color);
		height: 100%;
		width: 100%;
	}

	.action-buttons{
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		justify-content: space-around;
	}
	:global(.card-wrapper) { opacity: .9; transition: all .4s ; cursor: pointer; border-radius: 4px;}
	:global(.card-wrapper):hover { opacity: 1; transform: scale(1.07) }
</style>

<div class="card-wrapper" style="background-image: url({project.img});" on:mouseenter={()=>isHidden=true} on:mouseleave={()=>isHidden=false} >
	<div class:card-content={isHidden}>
		<!-- Somewhere here is error -->
		{#if isHidden}
			{#if project.name}
				<ProjectContent>
					<p slot="header">{project.name}</p>
					<p slot="description">{project.description}</p>
					<div slot="action-buttons" class="action-buttons">
						<a href={project.src}>View Website</a>
						<a href={project.github}>Source Code</a>
					</div>
				</ProjectContent>
			{:else}
				 <h2 transition:fade="{{ duration: 1000 }}">Coming soon</h2>
			{/if}
		{/if}
	</div>
</div>

 
<!-- markup (zero or more items) goes here -->