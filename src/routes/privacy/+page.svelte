
<script>
    import { fade } from "svelte/transition";
</script>

<h1 in:fade={{delay: 300}} out:fade={{delay: 0, duration: 300}}>Privacy</h1>

<h2>This page is NOT FINISHED YET</h2>

<section in:fade={{delay: 300}} out:fade={{delay: 0, duration: 300}}>
    <!-- Have this section change based on whether the game is compiled with trystero or socket.io -->
    <p>Quotouflage takes your privacy seriously. We don't collect any identifying information about you or use any tracking networks. However, certain personally identifiable information may be sent through the trystero network in order to faciliate matchmaking, and your IP address may be shared with other players when playing the game. If you're playing a hosted game, then the </p>
</section>

<style>
    h1 {
        font-size: 5vw;
        display: flex;
        justify-content: center;
    }
</style>