<script lang="ts">
    import { PUBLIC_NETWORK_MODE } from "$env/static/public";
    import { createEventDispatcher } from "svelte";
    import Popup from "./Popup.svelte";

    export let gameCode : string;
    export let connectedPeers = 0;

    const dispatch = createEventDispatcher()
</script>

<Popup>
    <div>
        <h1>Connecting...</h1>
        <h3>We're doing our best to connect you to {gameCode}!</h3>
    </div>

    <div class="lds-default">
        <div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div /><div />
    </div>

    {#if PUBLIC_NETWORK_MODE === "trystero"}
        {#if connectedPeers > 0}
            <p>Currently connected to <b>{connectedPeers}</b> other players and waiting for a host!</p>
        {:else}
            <p>Looking for peers on {gameCode}...</p>
        {/if}

        <p>
            You're connecting using <a href="https://github.com/dmotz/trystero" target="_blank">trystero</a>. 
            For better connection times, try hosting Quotouflage yourself! 
            Instructions are on the <a href="https://github.com/ugackMiner53/quotouflage" target="_blank">Github</a>!
        </p>
    {:else if PUBLIC_NETWORK_MODE === "websocket"}
        <p>Currently connecting to the server...</p>

        <p>
            You're connecting using Websockets, the fastest and most stable method!
            Thank you for playing Quotouflage!
        </p>
    {:else}
        <p>
            You're connecting using {PUBLIC_NETWORK_MODE}, which is a custom configuration.
            Help requests on our <a href="https://github.com/ugackMiner53/quotouflage" target="_blank">Github</a> for custom network adapters will be ignored!
        </p>
    {/if}

    <button class="cancel" on:click={() => {dispatch("cancel")}}>Cancel</button>
</Popup>

<style>
    div {
        display: inherit;
        flex-direction: inherit;
        align-items: inherit;
    }

    p, h1, h3 {
        text-align: center;
    }

    .cancel {
        width: 20vw;
        height: 5vh;
        cursor: pointer;
        border: 3px dashed rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        transition: 0.3s;
    }

    .cancel:hover {
        border: 3px solid black;
    }

    /* #region CSS Spinner from https://loading.io/css licensed under CC0 */
    .lds-default,
    .lds-default div {
    box-sizing: border-box;
    }
    .lds-default {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
    }
    .lds-default div {
    position: absolute;
    width: 6.4px;
    height: 6.4px;
    background: currentColor;
    border-radius: 50%;
    animation: lds-default 1.2s linear infinite;
    }
    .lds-default div:nth-child(1) {
    animation-delay: 0s;
    top: 36.8px;
    left: 66.24px;
    }
    .lds-default div:nth-child(2) {
    animation-delay: -0.1s;
    top: 22.08px;
    left: 62.29579px;
    }
    .lds-default div:nth-child(3) {
    animation-delay: -0.2s;
    top: 11.30421px;
    left: 51.52px;
    }
    .lds-default div:nth-child(4) {
    animation-delay: -0.3s;
    top: 7.36px;
    left: 36.8px;
    }
    .lds-default div:nth-child(5) {
    animation-delay: -0.4s;
    top: 11.30421px;
    left: 22.08px;
    }
    .lds-default div:nth-child(6) {
    animation-delay: -0.5s;
    top: 22.08px;
    left: 11.30421px;
    }
    .lds-default div:nth-child(7) {
    animation-delay: -0.6s;
    top: 36.8px;
    left: 7.36px;
    }
    .lds-default div:nth-child(8) {
    animation-delay: -0.7s;
    top: 51.52px;
    left: 11.30421px;
    }
    .lds-default div:nth-child(9) {
    animation-delay: -0.8s;
    top: 62.29579px;
    left: 22.08px;
    }
    .lds-default div:nth-child(10) {
    animation-delay: -0.9s;
    top: 66.24px;
    left: 36.8px;
    }
    .lds-default div:nth-child(11) {
    animation-delay: -1s;
    top: 62.29579px;
    left: 51.52px;
    }
    .lds-default div:nth-child(12) {
    animation-delay: -1.1s;
    top: 51.52px;
    left: 62.29579px;
    }
    @keyframes lds-default {
    0%, 20%, 80%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.5);
    }
    }
    /* #endregion */
</style>