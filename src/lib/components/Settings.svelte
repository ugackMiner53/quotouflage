<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Popup from "./Popup.svelte";
    import { getRandomTopic, topics, updateTopics } from "$lib/Utility";

    let _topics = "";
    getRandomTopic().then(() => { // This calls the load() script if it hasn't been loaded already
        _topics = topics!.join("\n");
    });

    const dispatch = createEventDispatcher()
    
    function saveTopics() {
        updateTopics(_topics.split("\n"));
        dispatch("save");
    }
</script>

<Popup>
    <h1>Settings</h1>

    <div>
        <label id="topicLabel" for="topics">Topic List</label>
        <textarea id="topics" placeholder="Enter custom topics here" bind:value={_topics} />
    </div>

    <button class="save" on:click={saveTopics}>SAVE</button>
</Popup>

<style>
    div {
        display: inherit;
        flex-direction: inherit;
        align-items: inherit;
    }

    h1 {
        font-size: 5vmax;
        text-align: center;
    }

    #topicLabel {
        font-size: 3vmax;
        font-weight: bold;
    }

    #topics {
        height: 50vh;
        width: 40vw;
        font-size: 2vmax;
        text-align: center;
    }

    .save {
        width: 20vw;
        height: 5vh;
        cursor: pointer;
        border: 3px dashed rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        transition: 0.3s;
        font-weight: 2vmax;
    }

    .save:hover {
        border: 3px solid black;
    }
</style>