<script lang="ts">
    import { goto } from "$app/navigation";
    import { gameManager } from "$lib/Static";
    import type { Message, Player, Topic, UUID } from "$lib/Types";
    import Judging from "$lib/components/Judging.svelte";
    import Scorecard from "$lib/components/Scorecard.svelte";
    import Writing from "$lib/components/Writing.svelte";
    import { writable } from "svelte/store";

    if (!gameManager) {
        goto("/join");
    }


    let writing = true;
    let currentTopicIndex = -1;
    let currentTopic : Topic|null; getNextTopic(); // Initialize outside of definition b/c nextTopic does not return

    let guessedUUID : UUID|null = null;

    const players = gameManager.players;
    const submittedPlayers = writable(new Set<UUID>())
    
    //#region Writing
    const personalMessages : Message[] = [];
    

    function getNextTopic() {
        currentTopicIndex++;
        if (currentTopicIndex < gameManager.topics.length) {
            currentTopic = gameManager.topics[currentTopicIndex];
            if (currentTopic.judge === gameManager.self.uuid) {
                console.log(`I can tell that I should not be submitting for ${currentTopic.topic}, so I will skip it.`)
                getNextTopic();
            } else {
                console.log(`I believe I should be submitting for ${currentTopic.topic} because I am ${gameManager.self.uuid} which is not ${currentTopic.judge}`)
            }
        } else {
            currentTopic = null;
            gameManager.sendMessages(personalMessages);
        }
    }

    function submitAnswer(answer : string) {
        personalMessages.push({
            author: gameManager.self.uuid,
            topic: currentTopic!.uuid,
            message: answer
        });
        console.log(personalMessages);
        getNextTopic();
    }

    //#endregion

    //#region Judging

    gameManager.addEventListener("judging", onJudging);
    gameManager.addEventListener("guess", onGuess);
    gameManager.addEventListener("continue", onContinue);
    gameManager.addEventListener("messageAuthor", onMessageAuthor)

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

    function onGuess(event : CustomEventInit<UUID>) {
        console.log("Recieved guess of " + gameManager.uuidToPlayer(event.detail!)?.name)
        if (currentTopic == null) return;
        
        guessedUUID = event.detail!;
        const guessedPlayer = gameManager.uuidToPlayer(event.detail!) ?? null;
        
        if (guessedPlayer) guessedPlayer.score++;

        if (currentTopic?.about === guessedPlayer?.uuid) {
            const judgePlayer = gameManager.uuidToPlayer(currentTopic.judge);
            if (judgePlayer) judgePlayer.score++;
        }

        // AI Clause here in the future
    }

    function onMessageAuthor(event : CustomEventInit<UUID>) {
        $submittedPlayers.add(event.detail!);
        $submittedPlayers = $submittedPlayers;
    }


    function onContinue() {
        if (currentTopicIndex >= gameManager.topics.length && currentTopic == null) {
            console.log("Going back to lobby!");
            // Without this, the event listeners get registered multiple times, leading to multiple score additions
            // TODO: Not do it this way. If this gets missed for any reason (which it shouldn't), then we have an event listener mess!
            gameManager.removeEventListener("judging", onJudging);
            gameManager.removeEventListener("guess", onGuess);
            gameManager.removeEventListener("continue", onContinue);
            gameManager.removeEventListener("messageAuthor", onMessageAuthor);
            goto("/lobby");
        }

        console.log("Recieved Continue, setting topic to null");
        currentTopic = null
    }

    //#endregion

</script>

<div class="fullscreen">
    {#if writing}
        {#if currentTopic}
            <Writing on:submit={(answer) => {
                submitAnswer(answer.detail);
            }} topic={currentTopic.topic} about={gameManager.uuidToPlayer(currentTopic.about)} exampleMessage={undefined} />
        {:else}
            <div class="waiting">
                <h1>All of your answers have been submitted!</h1>
                <h2>We're just waiting on everyone else now!</h2>
                <div class="submittedPlayers">
                    {#each $players as player}
                        <p>{$submittedPlayers.has(player.uuid) ? "✅" : "❌"} {player.name}</p>
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