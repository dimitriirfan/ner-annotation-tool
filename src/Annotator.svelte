<script>
    import SavedSentence from './components/SavedSentence.svelte'
    let ready=false
    let input_text = ""

    let data = {
        classes: ["UNSET"],
        words:[{ sentenceNum: 0, word: "", class: "UNSET" }]
    }
    let showEntityDropdown = false

    let entities = {
        "UNSET" : {
            class: "UNSET",
            color: ""
        }
    }
    
    let selectedIndex=null
    let selectedEntity={word: "", class: ""}
    
    let newEntityClass
    let newEntityColor
    
    let sentenceIdArray = []
    let currentSentenceId = 0
    let selectedSentenceId = 0
    let selectedWordArray
    $: (selectedSentenceId), selectedWordArray = data.words.filter((item)=> item.sentenceNum === selectedSentenceId)
    

    const handleStartAnnotation = () => {
        const word_list = input_text.split(" ")
        let tempData
        if (currentSentenceId !== 0) {
            tempData=[...data.words]
        }
        data = {
            classes: ["UNSET"],
            words: word_list.map((word) => {
                return { sentenceNum: currentSentenceId, word: word, class: "UNSET" }
            }),
        }
        if (currentSentenceId !== 0) {
            data.words = tempData.concat(data.words)
        }
        data = data 
        ready = true
        selectedSentenceId = currentSentenceId
        sentenceIdArray.push(currentSentenceId)
        currentSentenceId += 1
        sentenceIdArray=sentenceIdArray
        console.log(data)
    }

    const handleEntityClick = (i) => {
        selectedEntity = data.words[i]
        selectedIndex = i
    }
    const handleAddNewEntity = () => {
        entities[newEntityClass] = {
            class: newEntityClass,
            color: newEntityColor
        }
        data.classes.push(newEntityClass)
        data = data
    }
    const handleDeleteEntity = (i) => {
        data.words[i].class = "UNSET"
        data = data
    }
    const handleExportData = () => {
        let json = JSON.stringify(data);
        json = [json];
        const blob1 = new Blob(json, { type: "text/plain;charset=utf-8" });
        const url = window.URL || window.webkitURL;
        const link = url.createObjectURL(blob1);
        let a = document.createElement("a");
        a.download = "Customers.txt";
        a.href = link;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    const handleShowEntity = () => {
        showEntityDropdown = !showEntityDropdown 
    } 
    const handleSelectEntity = (i, newClass) => {
        selectedWordArray[i].class = newClass
        data = data
    }
    const handleResetState = () => {
        showEntityDropdown = false
    }
    const handleDeleteSentence = (id) => {
        console.log(id)
        data.words = data.words.filter((item) => item.sentenceNum !== id)
        sentenceIdArray = sentenceIdArray.filter((item) => item !== id)
        data = data
        console.log(data)
    }

</script>

<svelte:window on:click={handleResetState}/>

<div class="flex">
    <div class="flex w-48 flex-col">
        <h1 class="mb-7 text-gray-900 font-bold text-2xl">Senteces</h1>
        <div>
            {#each sentenceIdArray as i, _ }
                <div on:click={() => { selectedSentenceId = i }} class="cursor-pointer group flex justify-between py-1 px-3 items-center group-hover:bg-gray-100">
                    <div>
                        Sentence {i}
                    </div>
                    <div on:click|stopPropagation={() => handleDeleteSentence(i)} class="cursor-pointer w-5 h-5 grid place-content-center text-white group-hover:bg-red-600 rounded">x</div>
                </div>
                
            {/each}
        </div>
    </div>
    <div class="flex-1 flex flex-col">
        <h1 class="mb-7 text-gray-900 font-bold text-2xl">Annotator</h1>
        <h2 class="text-gray-900 font-bold text-xl mb-3">Input Sentence</h2>
        <div>
            <textarea class="w-full" bind:value={input_text} cols="40" rows="5"></textarea>
        </div>
        <button class="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={handleStartAnnotation} >Start Annotation</button>
        <br>
    
        <div class="mb-3">
            <label for="">New Entity Class</label>
            <input type="text" bind:value={newEntityClass}> <br>
            <label for="">Color</label>
            <input type="text" bind:value={newEntityColor}>
            <button on:click={handleAddNewEntity}>Add</button>
        </div>

        <h2 class="text-gray-900 font-bold text-xl mb-3">Entities</h2>
        <div class="h-16 border-2 mb-3 p-3">
            <p class="sentence">
                {#each Object.entries(entities) as [_, entity]}
                    <span class="word-text px-1 py-2 mx-3" style="color: {entity.color}">{entity.class}</span>
                {/each}
            </p>
        </div>
        <h2 class="text-gray-900 font-bold text-xl mb-3">Annotate Sentence</h2>
        <div class="wrapper-annotator border-2 mb-3 p-3">
        {#if ready}
            <p class="sentence leading-10">
                {#each selectedWordArray as word, i}
                <span on:click|stopPropagation={handleShowEntity} class="word-text rounded mx-3 px-1 py-2" class:entity={word.class !== "UNSET"} style="background-color: {entities[word.class].color}" >
                    <span on:click={() => handleEntityClick(i)}>{word.word + " "}</span>
                    {#if word.class !== "UNSET"}
                        <span class="text-xs font-normal">
                            | {word.class}
                        </span>
                        <div on:click|stopPropagation={() => handleDeleteEntity(i)} class="annotation-close">
                            x
                        </div>
                    {/if}
                    {#if selectedIndex == i && showEntityDropdown}
                        <div  class="annotation-entity-dropdown rounded border-2 bg-white z-10">
                            {#each Object.entries(entities) as [_, entity]}
                                <div on:click={() => handleSelectEntity(i, entity.class)} class="text-gray-900 px-1 font-normal hover:bg-gray-100 bg-white">{entity.class}</div>
                            {/each}
                        </div>
                    {/if}
                    
                </span>
               
                {/each}
            </p>
        {/if}
    
        </div>
        <div class="flex justify-between align-middle">
            <div class="">
                <label for="">Update Text</label>
                <input type="text" bind:value={selectedEntity.word}>
            </div>
            <div class="flex gap-3">
                <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Reset</button>
                <button on:click={handleExportData} class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                    <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                    <span>Export</span>
                  </button>
            </div>
        </div>

    </div>
    
</div>

<style>
    .wrapper-annotator {
        min-height: 200px;
    }
	.sentence {
		display: inline;
		gap: 1em;
	}
	.word-text {
        position: relative;
	}
	.entity {
		color: white;
        font-weight: 500;
	}
	
	.word-text:hover {
		cursor: pointer;
	}
    .word-text:hover .annotation-close {
        visibility: visible;
    }
        
    .annotation-close {
        visibility: hidden;
        background: #f2f2f2;
        color: #333333;
        position: absolute;
        width: 10px;
        height: 10px;
        display: grid;
        place-content: center;
        top: -5px;
        right: -5px;
        border-radius: 50%;
        padding: 10px;
    }
    .annotation-entity-dropdown {
        position: absolute;
        left: 0;
        width: 80px;
        min-width: 100%;
    }
	
</style>
