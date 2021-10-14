<script>
    import SavedSentence from './components/SavedSentence.svelte'
    let ready=false
    let currentSentence = 0
    let selectedSentence = 0

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

    const handleStartAnnotation = () => {
        const word_list = input_text.split(" ")
        let tempData
        if (currentSentence !== 0) {
            tempData=[...data.words]
        }
        data = {
            classes: ["UNSET"],
            words: word_list.map((word) => {
                return { sentenceNum: currentSentence, word: word, class: "UNSET" }
            }),
        }
        if (currentSentence !== 0) {
            data.words = tempData.concat(data.words)
        }
        data = data 
        ready = true
        selectedSentence = currentSentence
        currentSentence += 1
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
    const handleSelectEntity = (i, sentence, newClass) => {
        data.words.filter((item)=> item.sentenceNum === sentence)[i].class = newClass
        data = data
    }
    const handleResetState = () => {
        showEntityDropdown = false
    }

</script>

<svelte:window on:click={handleResetState}/>

<div class="flex">
    <div class="flex w-48 flex-col">
        <h1 class="mb-7 text-gray-900 font-bold text-xl">Senteces</h1>
        <div>
            {#each Array(currentSentence) as _, i }
                <div class="cursor-pointer" on:click={() => { selectedSentence = i }} >Sentence {i}</div>
                
            {/each}
        </div>
    </div>
    <div class="flex-1">
        <h1 class="mb-7 text-gray-900 font-bold text-xl">Annotator</h1>
        <div>
            <textarea bind:value={input_text} cols="40" rows="5"></textarea>
        </div>
        <button on:click={handleStartAnnotation} >Start Annotation</button>
        <br>
    
        <div class="mb-3">
            <label for="">New Entity Class</label>
            <input type="text" bind:value={newEntityClass}> <br>
            <label for="">Color</label>
            <input type="text" bind:value={newEntityColor}>
            <button on:click={handleAddNewEntity}>Add</button>
        </div>
    
        <div class="h-16 border-2 mb-3 p-3">
            <p class="sentence">
                {#each Object.entries(entities) as [_, entity]}
                    <span class="word-text px-1 py-2 mx-3" style="color: {entity.color}">{entity.class}</span>
                {/each}
            </p>
        </div>
        <div class="wrapper-annotator border-2 mb-3 p-3">
        {#if ready}
            <p class="sentence leading-10">
                {#each data.words.filter((item)=> item.sentenceNum === selectedSentence) as word, i}
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
                                <div on:click={() => handleSelectEntity(i, selectedSentence, entity.class)} class="text-gray-900 px-1 font-normal hover:bg-gray-200 bg-white">{entity.class}</div>
                            {/each}
                        </div>
                    {/if}
                    
                </span>
               
                {/each}
            </p>
        {/if}
    
        </div>
        <div class="mb-3">
            <label for="">Update Text</label>
            <input type="text" bind:value={selectedEntity.word}>
        </div>
        <button>Reset</button>
        <button on:click={handleExportData}>Export</button>

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
