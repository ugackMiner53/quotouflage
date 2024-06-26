<script lang="ts">
    import { createNewGameManager, gameManager } from "$lib/Static";
    import Connecting from "$lib/components/Connecting.svelte";
    import Judging from "$lib/components/Judging.svelte";
    import type { Message } from "$lib/Types";

    createNewGameManager("josh")

    gameManager.recieveMessages([
        <Message>{author: "uuid1", message: "I love cheese", topic: "uuid3"},
        <Message>{author: "uuid1", message: "I eat bagels", topic: "uuid3"},
        <Message>{author: "uuid1", message: "Give me money", topic: "uuid3"},
        <Message>{author: "uuid1", message: "I want honey", topic: "uuid3"},
        <Message>{author: "uuid1", message: "orange peel", topic: "uuid3"},
        <Message>{author: "uuid1", message: "I jumped in the back of the truck and then the mean man got me and it was really sad", topic: "uuid3"},
        <Message>{author: "uuid1", message: "who cares", topic: "uuid3"},
        <Message>{author: "uuid1", message: "give lots of things now please", topic: "uuid3"},
        <Message>{author: "uuid1", message: "quotouflage", topic: "uuid3"},
        <Message>{author: "uuid1", message: "funny funkadelix mod!!!! ", topic: "uuid3"},
    ])
</script>

<div class="fullscreen">

    <Judging topic={{about: "uuid1", judge: "uuid2", topic: "LOLING", uuid: "uuid3"}} />
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