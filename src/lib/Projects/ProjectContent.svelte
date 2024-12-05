<script>
    import { fade, scale } from 'svelte/transition';
</script>

<style>
	.content-wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
		justify-content: space-evenly;
	}
</style>

<div class="content-wrapper" in:fade="{{ duration: 1000 }}" out:scale>
	<slot name="header">
		<p class="header">Unknown header</p>
	</slot>
	<slot name="description">
		<p class="description">Unknown description</p>
	</slot>
	<slot name="action-buttons">
		<span>No action</span>
	</slot>
</div>
