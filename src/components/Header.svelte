<script>
    import { FontAwesomeIcon } from 'fontawesome-svelte';
    import { faBars } from '@fortawesome/free-solid-svg-icons'
    import { sidebar_open } from '../utils/store'

    const handleOpenSideBar = () => {
        sidebar_open.set(true)

    }
</script>

<div class="md:bg-white p-5 mb-3 shadow-sm">
    <div class="container mx-auto flex items-center justify-between">
        <div on:click={handleOpenSideBar} class="md:hidden cursor-pointer grid p-1">
            <FontAwesomeIcon icon={faBars} size="lg" />
        </div>
        <div class="">
            <h1 class="text-2xl font-bold">Word By Word Annotation</h1>
        </div>
    </div>
</div>