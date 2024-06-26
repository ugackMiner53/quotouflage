<script lang="ts">
    import { goto } from "$app/navigation";
    import { gameManager } from "$lib/Static";
    import type { Message, Topic, UUID } from "$lib/Types";
    import Judging from "$lib/components/Judging.svelte";
    import Scorecard from "$lib/components/Scorecard.svelte";
    import Writing from "$lib/components/Writing.svelte";

    if (!gameManager) {
        goto("/join");
    }


    let writing = true;
    let currentTopicIndex = -1;
    let currentTopic : Topic|null; getNextTopic(); // Initialize outside of definition b/c nextTopic does not return


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
            gameManager.sendMessages(personalMessages);
            currentTopic = null;
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

    gameManager.addEventListener("judging", (event : CustomEventInit<UUID>) => {
        console.log("Judging event bubbled up to game +page.svelte!");
        if (writing) {
            currentTopicIndex = 1;
        } else {
            currentTopicIndex++;
        }
        writing = false;
        currentTopic = gameManager.uuidToTopic(event.detail!) ?? null;
    })

    gameManager.addEventListener("guess", (event : CustomEventInit<UUID>) => {
        console.log("Recieved guess of " + gameManager.uuidToPlayer(event.detail!)?.name)
        if (currentTopic == null) return;
        
        const guessedPlayer = gameManager.uuidToPlayer(event.detail!);
        
        if (guessedPlayer) guessedPlayer.score++;

        if (currentTopic?.about === guessedPlayer?.uuid) {
            const judgePlayer = gameManager.uuidToPlayer(currentTopic.judge);
            if (judgePlayer) judgePlayer.score++;
        }

        // AI Clause here in the future

        // This shows the scorecard
        currentTopic = null;
    })


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
            </div>
        {/if}
    {:else}
        {#if currentTopic}
            <Judging topic={currentTopic} />
        {:else}
            <Scorecard on:continue={() => {
                if (currentTopicIndex >= gameManager.topics.length) {
                    // End game here
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
        width: 100%;
        height: 100%;
    }
</style>