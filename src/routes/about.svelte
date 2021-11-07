<script context="module">
	import { browser, dev } from '$app/env';
	import Social from '$lib/Social/Social.svelte';
	import { home, photo } from '../app/pictures';

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
	<title>About Me</title>
</svelte:head>

<div class="content">
	<div class="about ">
		<img src={photo} alt="Me" class="photo ">
		<p>Hi, I am a frontend web developer with two years of experience with an emphasis on <span class="react ">React</span> and <span class="svelte ">Svelte</span>. 
			I also have basic knowledge of Node.js, Vue and C#</p>
	</div>
	<div class="skills ">
		<h2 class="">Skills:</h2> <p class="">HTML / CSS / SCSS / Javascript / Typescript / React / Svelte / Tailwind / Git</p>
	</div>
	<div class="about-social">		
		<Social/>
	</div>
</div>

<style>
.content { font-family: Poppins, sans-serif; font-size: 1.2rem; box-sizing: border-box; max-width: var(--column-width); text-align: initial; margin: 1rem; }
.skills { text-align: initial; margin: 0px; }
.skills h2 { color: rgb(107, 164, 238); font-size: 1.5rem; margin: 0px; }
.skills p { margin: 5px 0px; }
.about { display: flex; flex-direction: row; align-items: center; font-size: 1.9rem; }
.photo { height: 300px; width: 300px; border-radius: 10px; margin-right: 1.5rem; }
.react { color: rgb(97, 218, 251); }
.svelte { color: rgb(255, 62, 0); }
@media (max-width: 720px) {
  .photo { height: 200px; width: 200px; border-radius: 10px; margin: 0px; }
  .content { text-align: center; }
  .skills { margin-bottom: 1rem; }
  .about { flex-direction: column; align-items: center; font-size: 1.2rem; }
  .about-social{display: flex;flex: row;align-items: center;justify-content: center;}
}
@media (min-width: 720px){
		.about-social {
            display: none;
        }
	}
</style>
