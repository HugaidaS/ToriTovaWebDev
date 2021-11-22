<script>
import { gitHub, insta, linkedin } from "../../api/pictures";
</script>

<div class="social-block">
    <a href="https://www.instagram.com/vika_lindeman_webdev">
        <img src={insta} alt="Insta" />
    </a>
    <a href="https://github.com/Ellinsa">
        <img src={gitHub} alt="GitHub" />
    </a>
    <a href="https://www.linkedin.com/in/toriatovawebdev/">
        <img src={linkedin} alt="LinkedIn" />
    </a>
</div>

<style>
    .social-block{
        height: 3em;
        display: flex;
        flex-direction: row;
    }
    img{
		width: 2.5em;
		height: 2.5em;
		object-fit: contain;
	}
</style>