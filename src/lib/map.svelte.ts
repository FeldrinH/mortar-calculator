import { Map, ImageOverlay, CRS, Circle, Control, DomEvent, DomUtil, LatLng, Marker, Icon } from 'leaflet';

// TODO: Support multiple maps

const ActionButtonControl = Control.extend({
    options: {
        icon: '',
        title: '',
        action: '',
        position: 'topleft',
    },

    onAdd() {
        const container = DomUtil.create('div', 'leaflet-bar');

        (this as any)._isActive = false;
        (this as any)._button = this._createButton(this.options.icon, this.options.title, container, this._onClick);

        return container;
    },

    _createButton(icon: string, title: string, container: HTMLElement, fn: () => void) {
        const link = DomUtil.create('a', undefined, container);
        link.innerHTML = `<img src="${icon}" width="24" height="24" style="margin: 3px;">`;
        link.href = '#';
        link.title = title;

        link.setAttribute('role', 'button');
        link.setAttribute('aria-label', title);

        DomEvent.disableClickPropagation(link);
        DomEvent.on(link, 'click', DomEvent.stop);
        DomEvent.on(link, 'click', fn, this);
        DomEvent.on(link, 'click', (this as any)._refocusOnMap, this);

        return link;
    },

    _onClick() {
        if ((this as any)._isActive) {
            this.setAction(null);
        } else {
            this.setAction(this.options.action);
        }
    },

    setAction(newAction: string | null) {
    },

    updateActiveAction(action: string | null) {
        (this as any)._isActive = action === this.options.action;
        if ((this as any)._isActive) {
            (this as any)._button.style.backgroundColor = 'lightblue';
        } else {
            (this as any)._button.style.backgroundColor = null;
        }
    }
});

export interface Params {
    mortarX?: number
    mortarY?: number
    mortarElevation?: number
    targetX?: number
    targetY?: number
    targetElevation?: number
}

export function loadParams(): Params {
    const params = $state(JSON.parse(localStorage.getItem('mortar-calculator-params') ?? '{}'));
    return params;
}

export function saveParams(params: Params) {
    localStorage.setItem('mortar-calculator-params', JSON.stringify(params));
}

export function createMap(elementId: string, params: Params, getDispersion: () => number | undefined) {
    const map = new Map(elementId, {
        center: [5120, 5120],
        zoom: -3,
        minZoom: -4,
        maxZoom: 2,
        crs: CRS.Simple,
    });

    new ImageOverlay('/maps/serhiivka.png', [[0, 0], [10240, 10240]]).addTo(map);

    const mortarLatLng = new LatLng(params.mortarY ?? 0, params.mortarX ?? 0);
    const mortarMarker = new Marker(mortarLatLng, {
        icon: new Icon({ iconUrl: '/icons/mortar.png', iconSize: [24, 24] })
    }).addTo(map);

    const targetLatLng = new LatLng(params.targetY ?? 0, params.targetX ?? 0);
    const targetMarker = new Marker(targetLatLng, {
        icon: new Icon({ iconUrl: '/icons/shell.png', iconSize: [24, 24] })
    }).addTo(map);
    const targetDispersionMarker = new Circle(targetLatLng, {
        radius: 0,
        color: 'red',
    }).addTo(map);

    $effect(() => {
        targetDispersionMarker.setRadius(getDispersion() ?? 0);
    });

    const actionButtons = [
        new ActionButtonControl({
            icon: '/icons/mortar.png',
            title: 'Set mortar location',
            action: 'mortar',
        } as any),
        new ActionButtonControl({
            icon: '/icons/marker.png',            
            title: 'Add marker',
            action: 'marker',
        } as any)
    ];

    let action: string | null = null;

    function setAction(newAction: string | null) {
        console.log('set action ', newAction)
        action = newAction;
        for (const actionButton of actionButtons) {
            actionButton.updateActiveAction(action);
        }
    }

    for (const actionButton of actionButtons) {
        actionButton.setAction = setAction;
        actionButton.addTo(map);
    }

    map.on('click', event => {
        if (action === 'marker') {
            const marker = new Marker(event.latlng, {
                icon: new Icon({ iconUrl: '/icons/marker.png', iconSize: [24, 24] }),
                draggable: true,
            }).addTo(map);

            // TODO: Add controls to measure bearing and distance

            setAction(null);
        } else if (action === 'mortar') {
            mortarMarker.setLatLng(event.latlng);
            params.mortarX = event.latlng.lng;
            params.mortarY = event.latlng.lat;
            params.mortarElevation = 0; // TODO: Read from heightmap

            setAction(null);
        } else {
            targetMarker.setLatLng(event.latlng);
            targetDispersionMarker.setLatLng(event.latlng);
            params.targetX = event.latlng.lng;
            params.targetY = event.latlng.lat;
            params.targetElevation = 0; // TODO: Read from heightmap
        }
    });

    // TODO: Place marker
}