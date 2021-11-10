<script context="module">
	export const prerender = true;
	let links = ["https://media3.giphy.com/media/LUxTEh4UHV7DFgvVM3/giphy.gif?cid=790b7611cea78ada1c1b90d49f94344538cf0d30c74655da&rid=giphy.gif",
	"https://media1.giphy.com/media/FyoaJE2iah7WYeyxWr/giphy.gif?cid=790b7611e9f908968367b40926a42ef5495b15974f1acc7e&rid=giphy.gif",
	"https://media0.giphy.com/media/2tNvsKkc0qFdNhJmKk/giphy.gif?cid=790b7611f06905cc2a90453c84f22a85c230ddd26994062c&rid=giphy.gif",
	"https://media1.giphy.com/media/RhS1f7JwQaek6YZi1Y/giphy.gif?cid=790b76113b64b59968c1ffde17e518823673a7a3b400052b&rid=giphy.gif"]
	
</script>


<svelte:head>
	<title>ToriaTova.Dev</title>
</svelte:head>

<section>
	<div>
		<h1 class="title">Welcome to my portfolio!</h1>
	</div>
</section>

<style>
	@import url('https://fonts.googleapis.com/css?family=Montserrat');
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}
	.title {
	background: url(https://media3.giphy.com/media/LUxTEh4UHV7DFgvVM3/giphy.gif?cid=790b7611cea78ada1c1b90d49f94344538cf0d30c74655da&rid=giphy.gif);
	background-size: contain;
	-webkit-background-clip: text;
    background-clip: text;
	color: transparent;
	text-transform: uppercase;
	font-size: 6rem;
	line-height: 1.1;
}

@media (max-width: 720px) {
	.title{
		font-size: 2rem;
	}
}


</style>
