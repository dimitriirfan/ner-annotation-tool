<script>
    import { FontAwesomeIcon } from 'fontawesome-svelte';
    import { faTimes } from '@fortawesome/free-solid-svg-icons'
    import { sidebar_open } from '../utils/store'
    import { createEventDispatcher } from 'svelte';

    export let sentenceIdArray
    export let selectedSentenceId

    const dispatch = createEventDispatcher();

    const handleSideBarClose = () => {
        sidebar_open.set(false)
    }


</script>

<div class="sidebar hidden md:flex w-48 flex-col ">
    <h1 class="mb-7 text-gray-900 font-bold text-2xl">Senteces</h1>
    <div>
        {#each sentenceIdArray as i, _ }
            <div on:click={() => { selectedSentenceId = i }} class="cursor-pointer group flex justify-between py-1 px-3 items-center group-hover:bg-gray-100">
                <div  class="{selectedSentenceId == i ? "text-gray-900" : "text-gray-400 "} font-medium group-hover:text-gray-900">
                    Sentence #{i+1}
                </div>
                <div class="text-gray-400 group-hover:text-red-600 group-hover:bg-gray-100 h-3 w-3 grid place-content-center p-3 cursor-pointer rounded-full" on:click|stopPropagation={() => dispatch('delete', ( {id : i}))}>
                    <FontAwesomeIcon icon={faTimes} size='sm'/>
                </div>
            </div>
            
        {/each}
    </div>
</div>

{#if $sidebar_open}
    <div class="p-5 sidebar w-72 flex-col fixed top-0 left-0 h-full bg-white z-20 md:hidden shadow-md border-2">
        <div class="mb-3 flex justify-between items-center">
            <div>
                <h1 class="text-gray-900 font-bold text-2xl">Senteces</h1>
            </div>
            <div on:click={handleSideBarClose} class="cursor-pointer grid p-1">
                <FontAwesomeIcon icon={faTimes} size='lg'/>
            </div>
        </div>
        <hr class="mb-3">
        <div>
            {#each sentenceIdArray as i, _ }
                <div on:click={() => { selectedSentenceId = i }} class="cursor-pointer group flex justify-between py-1 px-3 items-center group-hover:bg-gray-100">
                    <div class="text-gray-400 font-medium group-hover:text-gray-900">
                        Sentence #{i+1}
                    </div>
                    <div class="text-gray-400 group-hover:text-red-600 group-hover:bg-gray-100 h-3 w-3 grid place-content-center p-3 cursor-pointer rounded-full" on:click|stopPropagation={() => dispatch('delete', ( {id : i}))}>
                        <FontAwesomeIcon icon={faTimes} size='sm'/>
                    </div>
                </div>
                
            {/each}
        </div>
    </div>
{/if}

