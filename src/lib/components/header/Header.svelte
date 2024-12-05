<script>
	import { page } from '$app/stores';
	import Social from '$lib/Social/Social.svelte';
</script>

<header>
	<div class="corner">
		<div class="corner">
			<a href="/">
				<img src='/home.png' alt="Home" />
			</a>
		</div>
	</div>

	<nav>
		<ul>
			<li class:active={$page.path === '/about'}><a href='/about'>About Me</a></li>
			<li class:active={$page.path === '/projects'}><a href='/projects'>Projects</a></li>
		</ul>

	</nav>

	<div class="corner social">
		<Social />
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		height: 4rem;
		align-items: center;
	}

	.corner {
		width: 3em;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: center;
		width: fit-content;
		height: 100%;
	}

	nav {
		display: flex;
		justify-content: center;
		margin-left: 9.9rem;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	.active a {
		color: var(--accent-color);
	}

	img {
		width: 2.5em;
		height: 2.5em;
		object-fit: contain;
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--accent-color);
	}

	@media (max-width: 720px) {
		nav {
			margin-left: 0;
		}

		.corner.social {
			display: none;
		}
	}
</style>
