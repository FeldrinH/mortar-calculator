<script lang="ts">
    import 'leaflet/dist/leaflet.css';
    import { onMount } from "svelte";
    import { loadParams, saveParams, createMap } from "$lib/map.svelte";

    // TODO: Add other shell types

    // Taken from https://arma-mortar.com/
    const RINGS = [
        {
            'dispersion': 0x6,
            'table': [[0x32, 0x604, 13.2, 0x3d, 0x0], [0x64, 0x5c7, 13.2, 0x3f, 0.2], [0x96, 0x588, 0xd, 0x42, 0.2], [0xc8, 0x546, 12.8, 0x47, 0.2], [0xfa, 0x4ff, 12.6, 0x4e, 0.3], [0x12c, 0x4b1, 12.3, 0x5f, 0.6], [0x15e, 0x452, 11.7, 0x97, 0x1], [0x190, 0x3bb, 10.7, 0x0, 0x0]]
        },
        {
            'dispersion': 0xe,
            'table': [[0x64, 0x60b, 0x14, 0x1c, 0.1], [0xc8, 0x5d4, 19.9, 0x1b, 0.1], [0x12c, 0x59d, 19.7, 0x1d, 0.1], [0x190, 0x562, 19.5, 0x1f, 0.1], [0x1f4, 0x525, 19.2, 0x21, 0.2], [0x258, 0x4e1, 18.8, 0x23, 0.2], [0x2bc, 0x496, 18.3, 0x2a, 0.4], [0x320, 0x43d, 17.5, 0x39, 0.6], [0x384, 0x3ba, 16.1, 0x94, 1.8]]
        },
        {
            'dispersion': 0x18,
            'table': [[0xc8, 0x602, 26.6, 0xf, 0x0], [0x12c, 0x5e3, 26.5, 0x10, 0x0], [0x190, 0x5c3, 26.4, 0x10, 0x0], [0x1f4, 0x5a3, 26.3, 0x10, 0.1], [0x258, 0x582, 26.2, 0x10, 0.1], [0x2bc, 0x560, 0x1a, 0x11, 0.1], [0x320, 0x53d, 25.8, 0x12, 0.1], [0x384, 0x519, 25.5, 0x14, 0.1], [0x3e8, 0x4f2, 25.2, 0x14, 0.1], [0x44c, 0x4c9, 24.9, 0x16, 0.2], [0x4b0, 0x49c, 24.4, 0x17, 0.2], [0x514, 0x46c, 23.9, 0x1b, 0.3], [0x578, 0x434, 23.2, 0x1f, 0.4], [0x5dc, 0x3f1, 22.3, 0x2b, 0.6], [0x640, 0x390, 20.9, 0x6d, 1.9]]
        },
        {
            'dispersion': 0x20,
            'table': [[0x12c, 0x5fe, 31.7, 0xc, 0x0], [0x190, 0x5e7, 31.6, 0xb, 0x0], [0x1f4, 0x5d1, 31.6, 0xc, 0.1], [0x258, 0x5ba, 31.5, 0xc, 0.1], [0x2bc, 0x5a2, 31.4, 0xc, 0.1], [0x320, 0x58b, 31.3, 0xc, 0.1], [0x384, 0x573, 31.1, 0xd, 0.1], [0x3e8, 0x55a, 0x1f, 0xd, 0.1], [0x44c, 0x540, 30.8, 0xd, 0.1], [0x4b0, 0x526, 30.6, 0xd, 0.1], [0x514, 0x50b, 30.3, 0xe, 0.1], [0x578, 0x4ef, 30.1, 0xf, 0.2], [0x5dc, 0x4d1, 0x1d, 0x7, 0xf, 0.1], [0x640, 0x4b2, 29.4, 0x10, 0.2], [0x6a4, 0x491, 0x1d, 0x11, 0.2], [0x708, 0x46d, 28.5, 0x13, 0.2], [0x76c, 0x446, 0x1c, 0x15, 0.3], [0x7d0, 0x41b, 27.3, 0x1a, 0.4], [0x834, 0x3e7, 26.5, 0x1f, 0.5], [0x898, 0x3a3, 25.3, 0x2e, 0.9], [0x8fc, 0x321, 22.7, 0x0, 0x0]]
        },
        {
            'dispersion': 0x2a,
            'table': [[0x190, 0x5fb, 36.3, 0x9, 0x0], [0x1f4, 0x5ea, 36.2, 0x9, 0x0], [0x258, 0x5d8, 36.2, 0x9, 0.1], [0x2bc, 0x5c6, 36.1, 0x9, 0x0], [0x320, 0x5b4, 0x24, 0x9, 0x0], [0x384, 0x5a2, 35.9, 0x9, 0x0], [0x3e8, 0x590, 35.8, 0xa, 0x0], [0x44c, 0x57d, 35.7, 0xa, 0.1], [0x4b0, 0x569, 35.6, 0x9, 0.1], [0x514, 0x556, 35.4, 0xa, 0.1], [0x578, 0x542, 35.3, 0xa, 0.1], [0x5dc, 0x52e, 35.1, 0xb, 0.1], [0x640, 0x519, 34.9, 0xb, 0.1], [0x6a4, 0x503, 34.6, 0xb, 0.1], [0x708, 0x4ed, 34.4, 0xb, 0.1], [0x76c, 0x4d6, 34.1, 0xc, 0.1], [0x7d0, 0x4be, 33.8, 0xc, 0.1], [0x834, 0x4a4, 33.5, 0xd, 0.2], [0x898, 0x48a, 33.1, 0xe, 0.2], [0x8fc, 0x46e, 32.7, 0xf, 0.2], [0x960, 0x450, 32.2, 0x11, 0.2], [0x9c4, 0x42e, 31.7, 0x11, 0.3], [0xa28, 0x40a, 0x1f, 0x14, 0.3], [0xa8c, 0x3e1, 30.3, 0x19, 0.5], [0xaf0, 0x3ae, 29.2, 0x1f, 0.6], [0xb54, 0x366, 27.7, 0x40, 1.5]]
        }
    ];

    const params = loadParams();

    function onBeforeUnload() {
        saveParams(params);
    }

    const isValid = $derived(params.mortarX != undefined && params.mortarY != undefined && params.mortarElevation != undefined
        && params.targetX != undefined && params.targetY != undefined && params.targetElevation != undefined);
    
    const [distance, bearing] = $derived.by(() => {
        const deltaX =  params.targetX! - params.mortarX!;
        const deltaY =  params.targetY! - params.mortarY!;
        return [Math.sqrt(deltaX * deltaX + deltaY * deltaY), (3200 / Math.PI * Math.atan2(deltaX, deltaY) + 6400) % 6400];
    });
    const [ring, dispersion, elevation] = $derived.by(() => {
        for (let ringNumber = 0; ringNumber < RINGS.length; ringNumber++) {
            const ring = RINGS[ringNumber];
            const buffer = ringNumber === RINGS.length - 1 ? 0 : 100;
            if (ring.table[ring.table.length - 1][0] - buffer >= distance) {
                for (let i = 1; i < ring.table.length; i++) {
                    const previous = ring.table[i - 1];
                    const current = ring.table[i];
                    if (previous[0] <= distance && current[0] >= distance) {
                        const factor = (distance - previous[0]) / (current[0] - previous[0]);
                        const baseElev = previous[1] + (current[1] - previous[1]) * factor;
                        const dElev = previous[3] + (current[3] - previous[3]) * factor;
                        return [ringNumber, ring.dispersion, baseElev - (params.targetElevation! - params.mortarElevation!) / 100 * dElev];
                    }
                }
            }
        }
        return [undefined, undefined, undefined];
    });

    onMount(() => {
        createMap('map', params, () => dispersion);
    });
</script>

<svelte:window onbeforeunload={onBeforeUnload} />
<svelte:head>
    <title>Mortar Calculator</title> 
</svelte:head>

<div class="sidebar">
    <div class="panel">
        <h2>MORTAR</h2>
        <div class="input-row">
            <div class="label">
                X coordinate
                <span class="value">{params.mortarX?.toFixed(0)}</span>
            </div>
            <div class="label">
                Y coordinate
                <span class="value">{params.mortarY?.toFixed(0)}</span>
            </div>
        </div>
        <div class="label">
            Elevation
            <span class="value">{params.mortarElevation}</span>
        </div>
    </div>
    <div class="panel">
        <h2>TARGET</h2>
        <div class="input-row">
            <div class="label">
                X coordinate
                <span class="value">{params.targetX?.toFixed(0)}</span>
            </div>
            <div class="label">
                Y coordinate
                <span class="value">{params.targetY?.toFixed(0)}</span>
            </div>
        </div>
        <div class="label">
            Elevation
            <span class="value">{params.targetElevation}</span>
        </div>
    </div>
    <div class="panel output">
        {#if isValid}
            Distance: {distance.toFixed(1)} m<br>
            Ring: {ring == undefined ? "-" : ring}<br>
            Dispersion: {dispersion == undefined ? "-" : `${dispersion} m`}<br>
            Elevation: {elevation == undefined ? "-" : `${elevation.toFixed(0)} mil`}<br>
            Bearing: {bearing.toFixed(0)} mil<br>
        {/if}
    </div>
</div>
<div id="map" class="map"></div>

<style>
    :global(html, body) {
        width: 100%;
        height: 100%;
        margin: 0;
    }
    :global(body) {
        display: flex;
        font-family: sans-serif;
    }

    .sidebar {
        width: 290px;
        margin: 0 10px;
    }
    .panel {
        margin-bottom: 30px;
    }

    h2 {
        font-size: 2rem;
    }
    .input-row {
        display: flex;
        flex-direction: row;
        column-gap: 20px;
    }
    .label {
        display: flex;
        flex-direction: column;
        margin: 5px 0;
        font-size: 1.2rem;
    }
    .value {
        font-size: 2rem;
        width: 100px
    }

    .output {
        font-size: 2rem;
    }

    .map {
        flex-grow: 1;
    }
</style>
