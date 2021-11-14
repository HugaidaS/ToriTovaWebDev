<script>
    import { scale } from 'svelte/transition';
</script>

<style>
    .content-wrapper{
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        justify-content: space-evenly;
    }
    .action-buttons{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
        width: 100%;
    }
</style>

<div class="content-wrapper" in:scale="{{ duration: 1000 }}" out:scale>
    <slot name="header">
        <p class="header">Unknown header</p>
    </slot>
    <slot name="description">
        <p class="description">Unknown description</p>
    </slot>
    <slot name="action-buttons">
        <div class="action-buttons">
            <div>First button</div>
            <div>Second button</div>
        </div>
    </slot>
</div>