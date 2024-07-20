
<script>
    import { fade } from "svelte/transition";
    import { PUBLIC_ADAPTER } from "$env/static/public";
    import { base } from "$app/paths";
</script>

<h1 in:fade={{delay: 300}} out:fade={{delay: 0, duration: 300}}>Privacy</h1>

<section in:fade={{delay: 300}} out:fade={{delay: 0, duration: 300}}>
    {#if PUBLIC_ADAPTER === "websocket"}
        <p>
            Quotouflage takes your privacy seriously.
            We don't collect any identifying information about you or use any tracking networks. 
            Depending on how the server is setup, your IP address may be logged by the owners of this website,
            but will not be shared with other players.
        </p>
        {:else if PUBLIC_ADAPTER === "trystero"}
        <p>
            Quotouflage takes your privacy seriously.
            We don't collect any identifying information about you or use any tracking networks.
            However, because matchmaking is done via the <a href="https://github.com/dmotz/trystero">trystero</a> network,
            details on how to connect to your computer may be spread and shared via third party services and relays.
            These details are usually limited to <a href="https://en.wikipedia.org/wiki/Session_Description_Protocol">SDP description packets</a>,
            which may (but usually don't) include your public IP address, private IP address, computer hostname, email address, and more (depending on your web browser's implementation).
        </p>
    {:else}
        <p>
            Quotouflage takes your privacy seriously,
            However, the game has been compiled with a custom network adapter,
            and we do not know how your data will be managed.
        </p>
    {/if}

    <p>
        Always make sure to check with the owners of this website to make sure that their privacy policy is the same.
        This software is licensed under the <a href="https://www.gnu.org/licenses/gpl-3.0.html">GNU GPL 3.0</a>, and should adhere to the license terms.
        Check the homepage for a link to the source code that the website is running!
    </p>
</section>

<a class="back" href="{base}/" in:fade={{delay: 300}} out:fade={{delay: 0, duration: 300}}>Go Back</a>

<style>
    h1 {
        font-size: 5vw;
        text-align: center;
    }

    section {
        display: flex;
        align-items: center;
        flex-direction: column;
    }

    p {
        text-align: center;
        max-width: 50vw;
        font-size: larger;

    }

    .back {
        position: absolute;
        bottom: 3vh;
        left: 3vw;
        font-size: 3vmax;
    }
</style>