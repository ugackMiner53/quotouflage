<script lang="ts">
    import { createNewGameManager, gameManager } from "$lib/Static";
    import Connecting from "$lib/components/Connecting.svelte";
    import Judging from "$lib/components/Judging.svelte";
    import type { Message } from "$lib/Types";
    import Scorecard from "$lib/components/Scorecard.svelte";

</script>

<div class="fullscreen">
    <Scorecard />
</div>

<style>
    .fullscreen {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        position: fixed;
        /* background-color: magenta; */
    }

</style>