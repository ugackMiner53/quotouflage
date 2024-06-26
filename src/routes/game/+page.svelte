<script lang="ts">
    import { gameManager } from "$lib/Static";
    import type { Message, Topic } from "$lib/Types";
    import Writing from "$lib/components/Writing.svelte";


    const personalMessages : Message[] = [];
    
    let currentTopic : Topic|null;
    let currentTopicIndex = 0;

    function getNextTopic() {
        currentTopicIndex++;
        if (currentTopicIndex < gameManager.topics.length) {
            currentTopic = gameManager.topics[currentTopicIndex];
            if (currentTopic.judge === gameManager.self.uuid) {
                getNextTopic();
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

</script>

<div class="fullscreen">
    {#if currentTopic}
        <Writing on:submit={(answer) => {
            submitAnswer(answer.detail);
        }} topic={currentTopic.topic} about={currentTopic.about} exampleMessage={undefined} />
    {:else}
        <div class="waiting">
            <h1>All of your answers have been submitted!</h1>
            <h2>We're just waiting on everyone else now!</h2>
        </div>
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