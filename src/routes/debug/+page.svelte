<script lang="ts">
    import { createNewGameManager, gameManager } from "$lib/Static";
    import Connecting from "$lib/components/Connecting.svelte";
    import Judging from "$lib/components/Judging.svelte";
    import type { Message, UUID } from "$lib/Types";
    import Scorecard from "$lib/components/Scorecard.svelte";

    createNewGameManager("Joe Obama")

    gameManager.hosting = true;
    gameManager.recievePlayers([
        {
            name: "Joe Biden",
            emoji: "🎉",
            score: 17,
            uuid: <UUID>"ONE"
        },
        {
            name: "Joe Biden",
            emoji: "🎉",
            score: 17,
            uuid: <UUID>"ONE"
        },
        {
            name: "Joe Biden",
            emoji: "🎉",
            score: 17,
            uuid: <UUID>"ONE"
        },
        {
            name: "Joe Biden",
            emoji: "🎉",
            score: 17,
            uuid: <UUID>"ONE"
        },
        {
            name: "Joe Biden",
            emoji: "🎉",
            score: 17,
            uuid: <UUID>"ONE"
        },
        {
            name: "Joe Biden",
            emoji: "🎉",
            score: 47,
            uuid: <UUID>"ONE"
        },
        {
            name: "IDK Someone with a really 'long name'",
            emoji: "🎉",
            score: 17,
            uuid: <UUID>"ONE"
        },
        {
            name: "mantantania",
            emoji: "💚💚💚⚠️",
            score: -1000,
            uuid: <UUID>"ONE"
        },
    ], true)

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