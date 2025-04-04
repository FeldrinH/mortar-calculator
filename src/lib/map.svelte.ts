import { Map, ImageOverlay, CRS, Marker, Circle, CircleMarker, Control, DomEvent, DomUtil, type LatLngExpression, LatLng } from 'leaflet';

// TODO: Support multiple maps

const SimpleButtonControl = Control.extend({
    onAdd() {
        const container = DomUtil.create('div', 'leaflet-bar');

        (this as any)._button = this._createButton('M', 'Set mortar location', container, (this as any)._onClick);

        return container;
    },

    _createButton(html: string, title: string, container: HTMLElement, fn: () => void) {
        const link = DomUtil.create('a', undefined, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        link.setAttribute('role', 'button');
        link.setAttribute('aria-label', title);

        DomEvent.disableClickPropagation(link);
        DomEvent.on(link, 'click', DomEvent.stop);
        DomEvent.on(link, 'click', fn, this);
        DomEvent.on(link, 'click', (this as any)._refocusOnMap, this);

        return link;
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

    let setMortar = false;

    const mortarLatLng = new LatLng(params.mortarY ?? 0, params.mortarX ?? 0);
    const mortarMarker = new Circle(mortarLatLng, {
        radius: 10,
        color: 'blue',
    }).addTo(map);
    const mortarMarkerCenter = new CircleMarker(mortarLatLng, {
        radius: 4,
        color: 'blue',
        stroke: false,
        fillOpacity: 1,
    }).addTo(map);

    const targetLatLng = new LatLng(params.targetY ?? 0, params.targetX ?? 0);
    const targetMarker = new Circle(targetLatLng, {
        radius: 0,
        color: 'red',
    }).addTo(map);
    const targetMarkerCenter = new CircleMarker(targetLatLng, {
        radius: 4,
        color: 'red',
        stroke: false,
        fillOpacity: 1,
    }).addTo(map);

    $effect(() => {
        targetMarker.setRadius(getDispersion() ?? 0);
    });

    const SetMortar = SimpleButtonControl.extend({
        _onClick() {
            setMortar = true;
        }
    });
    new SetMortar({
        position: 'topleft'
    }).addTo(map);

    map.on('click', event => {
        if (setMortar) {
            mortarMarker.setLatLng(event.latlng);
            mortarMarkerCenter.setLatLng(event.latlng);
            params.mortarX = event.latlng.lng;
            params.mortarY = event.latlng.lat;
            params.mortarElevation = 0; // TODO: Read from heightmap

            setMortar = false;
        } else {
            targetMarker.setLatLng(event.latlng);
            targetMarkerCenter.setLatLng(event.latlng);
            params.targetX = event.latlng.lng;
            params.targetY = event.latlng.lat;
            params.targetElevation = 0; // TODO: Read from heightmap
        }
    });

    // TODO: Place marker
}