<script lang="ts">
    import { goto } from "$app/navigation";
    import { base } from "$app/paths";
    import { gameManager } from "$lib/Static";
    import type { Message, NetworkID, Topic, UUID } from "$lib/Types";
    import Judging from "$lib/components/Judging.svelte";
    import Scorecard from "$lib/components/Scorecard.svelte";
    import Writing from "$lib/components/Writing.svelte";
    import { onDestroy, onMount } from "svelte";

    if (!gameManager) {
        goto(`${base}/join`);
    }


    let writing = true;
    let currentTopicIndex = -1;
    let currentTopic : Topic|null; getNextTopic(); // Initialize outside of definition b/c nextTopic does not return

    let guessedUUID : NetworkID|null = null;

    const players = gameManager.players;
    const submittedPlayers = gameManager.submittedPlayers;
    
    //#region Writing
    const personalMessages : Message[] = [];
    

    function getNextTopic() {
        currentTopicIndex++;
        if (currentTopicIndex < gameManager.topics.length) {
            currentTopic = gameManager.topics[currentTopicIndex];
            if (currentTopic.judge === gameManager.self.networkId) {
                console.log(`I can tell that I should not be submitting for ${currentTopic.topic}, so I will skip it.`)
                getNextTopic();
            } else {
                console.log(`I believe I should be submitting for ${currentTopic.topic} because I am ${gameManager.self.networkId} which is not ${currentTopic.judge}`)
            }
        } else {
            currentTopic = null;
            gameManager.sendMessages(personalMessages);
        }
    }

    function submitAnswer(answer : string) {
        personalMessages.push({
            author: gameManager.self.networkId,
            topic: currentTopic!.uuid,
            message: answer
        });
        console.log(personalMessages);
        getNextTopic();
    }

    //#endregion

    //#region Judging

    function onJudging(event : CustomEventInit<UUID>) {
        console.log("Judging event bubbled up to game +page.svelte!");
        if (writing) {
            currentTopicIndex = 1;
        } else {
            currentTopicIndex++;
        }
        writing = false;
        guessedUUID = null;
        $submittedPlayers.clear();
        currentTopic = gameManager.uuidToTopic(event.detail!) ?? null;
    }

    function onGuess(event : CustomEventInit<NetworkID>) {
        console.log("Recieved guess of " + gameManager.networkIdToPlayer(event.detail!)?.name)
        if (currentTopic == null) return;
        
        guessedUUID = event.detail!;
        const guessedPlayer = gameManager.networkIdToPlayer(event.detail!) ?? null;
        
        if (guessedPlayer) guessedPlayer.score++;

        if (currentTopic?.about === guessedPlayer?.networkId) {
            const judgePlayer = gameManager.networkIdToPlayer(currentTopic.judge);
            if (judgePlayer) judgePlayer.score++;
        }

        // AI Clause here in the future
    }

    function onPlayerLeave(event : CustomEventInit<NetworkID>) {
        if (currentTopic?.judge == event.detail) {
            guessedUUID = <NetworkID>"NO NETWORK ID: JUDGE LEFT";
        }
    }


    function onContinue() {
        if (currentTopicIndex >= gameManager.topics.length && currentTopic == null) {
            console.log("Going back to lobby!");
            goto(`${base}/lobby`);
        }

        console.log("Recieved Continue, setting topic to null");
        currentTopic = null
    }

    //#endregion

    onMount(() => {
        gameManager.addEventListener("judging", onJudging);
        gameManager.addEventListener("guess", onGuess);
        gameManager.addEventListener("continue", onContinue);
        gameManager.addEventListener("leave", onPlayerLeave);
    })

    onDestroy(() => {
        gameManager.removeEventListener("judging", onJudging);
        gameManager.removeEventListener("guess", onGuess);
        gameManager.removeEventListener("continue", onContinue);
        gameManager.removeEventListener("leave", onPlayerLeave);
    })

</script>

<div class="fullscreen">
    {#if writing}
        {#if currentTopic}
            <Writing on:submit={(answer) => {
                submitAnswer(answer.detail);
            }} topic={currentTopic.topic} about={gameManager.networkIdToPlayer(currentTopic.about)} exampleMessage={undefined} />
        {:else}
            <div class="waiting">
                <h1>All of your answers have been submitted!</h1>
                <h2>We're just waiting on everyone else now!</h2>
                <div class="submittedPlayers">
                    {#each $players as player}
                        <p>{$submittedPlayers.has(player.networkId) ? "✅" : "❌"} {player.name}</p>
                    {/each}
                </div>
            </div>
        {/if}
    {:else}
        {#if currentTopic}
            <Judging topic={currentTopic} guessedPlayer={guessedUUID} on:continue={() => {gameManager.sendContinue()}} />
        {:else}
            <Scorecard finalRound={currentTopicIndex >= gameManager.topics.length} on:continue={() => {
                if (currentTopicIndex >= gameManager.topics.length) {
                    // End game here
                    gameManager.sendContinue();
                } else {
                    currentTopic = gameManager.topics[currentTopicIndex]; // This gets overwritten, but it saves a tmp var!
                    gameManager.sendJudging(currentTopic.uuid);
                }
            }} />
        {/if}
    {/if}
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

    .waiting {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        text-align: center;
        width: 100%;
        height: 100%;
    }
</style>