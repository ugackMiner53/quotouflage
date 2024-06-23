<div class="popup">
    <section>
        <slot />
    </section>
</div>


<style>
    .popup {
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        z-index: 10;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .popup > section {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-evenly;
        width: 90%;
        height: 90%;
        border-radius: 24px;
        background: lightgray;
        border: 3px solid black;
    }
</style>