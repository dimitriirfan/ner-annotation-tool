<script>
	export let name;
	let ready=false

	let input_text = ""

	let data = {
		classes: ["UNSET"],
		words:[{ word: "", class: "UNSET" }]
	}
	

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
		data = {
			classes: ["UNSET"],
			words: word_list.map(word => {
				return { word: word, class: "UNSET" }
			})
		}
		ready = true
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
	const handleExportData = () => {
		let json = JSON.stringify(data);
		json = [json];
        const blob1 = new Blob(json, { type: "text/plain;charset=utf-8" });
		var url = window.URL || window.webkitURL;
		const link = url.createObjectURL(blob1);
		var a = document.createElement("a");
		a.download = "Customers.txt";
		a.href = link;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
</script>

<main>
	<textarea bind:value={input_text} cols="40" rows="5"></textarea>
	<button on:click={handleStartAnnotation} >Start Annotation</button>
	<br>

	<label for="">New Entity Class</label>
	<input type="text" bind:value={newEntityClass}> <br>
	<label for="">Color</label>
	<input type="text" bind:value={newEntityColor}>
	<button on:click={handleAddNewEntity}>Add</button>

	<div class="wrapper mb-3 classes-wrapper">
		<p class="sentence">
			{#each Object.entries(entities) as [_, entity]}
				<span style="color: {entity.color}">{entity.class}</span>
			{/each}
		</p>
	</div>
	<div class="wrapper mb-3 sentence-wrapper">
	{#if ready}
		<p class="sentence">
			{#each data.words as word, i}
				<span style="color: {entities[word.class].color}" on:click={() => handleEntityClick(i)}  class="entity">{word.word}</span>
			{/each}
		</p>
		{/if}
	</div>
	<input type="text" bind:value={selectedEntity.word}>
	<select bind:value={selectedEntity.class}>
		{#each data.classes as entityClass}
			<option value={entityClass}>{entityClass}</option>
		{/each}
	</select>
	<br>
	<button on:click={handleExportData}>Export</button>
</main>

<style>
	.mb-3 {
		margin-bottom: 1.125em
	}
	.wrapper {
		padding: 1em;
		border: 1px solid black;
	}
	.classes-wrapper {
		min-height: 50px;
	}
	.sentence-wrapper {
		min-height: 150px;
	}
	.sentence {
		display: inline-flex;
		gap: 1em;
	}
	.entity {
		border-radius: 5px;
		padding: 0.25em 0.75em;
	}
	
	.entity:hover {
		background: red;
		cursor: pointer;
	}
	
</style>


