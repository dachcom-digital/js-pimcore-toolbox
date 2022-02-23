import {GOOGLE_MAPS_DEFAULTS} from '../constants/defaults';
import {isString, isNumeric} from '../utils/helpers';

export default class GoogleMaps {

    constructor(map, options = {}) {
        this.map = map;
        this.options = Object.assign(GOOGLE_MAPS_DEFAULTS, options);

        this.setupGoogleMaps();
    }

    setupGoogleMaps() {

        let latLngBounds,
            listener,
            locations = JSON.parse(this.map.dataset.locations) || [],
            mapStyleUrl = this.map.dataset.mapstyleurl,
            markerIcon = this.map.dataset.markericon,
            showInfoWindowOnLoad = this.map.dataset.showInfoWindowOnLoad === '1',
            mapOptions = {
                center: new google.maps.LatLng(0, 0),
            };

        Object.entries(this.map.dataset).forEach(([name, value]) => {
            if (name.substring(0, 9) === 'mapoption') {
                name = name.replace('mapoption', '');
                name = name.charAt(0).toLowerCase() + name.slice(1);
                mapOptions[name] = isNumeric(value) ? parseInt(value) : value;
            }
        });

        this.mapInstance = new google.maps.Map(this.map, mapOptions);
        latLngBounds = new google.maps.LatLngBounds();

        if (isString(mapStyleUrl)) {
            fetch(mapStyleUrl)
                .then(response => response.json())
                .then(json => this.mapInstance.set('styles', json));
        }

        if (locations.length > 0) {

            locations.forEach((location) => {
                if (this.isValidLocation(location)) {
                    latLngBounds.extend(new google.maps.LatLng(location.lat, location.lng));
                    this.addMarker(location, markerIcon, showInfoWindowOnLoad);
                }
            });

            this.mapInstance.fitBounds(latLngBounds);

            listener = google.maps.event.addListener(this.mapInstance, 'idle', () => {
                let zoom = (typeof mapOptions.zoom === 'number' && (mapOptions.zoom % 1) === 0) ? mapOptions.zoom : 17;
                this.mapInstance.setZoom(zoom);
                google.maps.event.removeListener(listener);
            });
        }

    }

    isValidLocation(location) {
        return location.hasOwnProperty('lat')
            && location.hasOwnProperty('lng')
            && !isNaN(location.lat)
            && !isNaN(location.lng);
    }

    addMarker(location, markerIcon, showInfoWindowOnLoad) {
        let marker, infoWindow;

        if (!this.isValidLocation(location)) {
            return;
        }

        marker = new google.maps.Marker({
            position: {lat: location.lat, lng: location.lng},
            map: this.mapInstance,
            title: location.title,
            icon: markerIcon,
            contentLoaded: false,
        });

        if (location.hideInfoWindow !== true) {

            infoWindow = new google.maps.InfoWindow({
                content: this.options.emptyInfoWindowHtml,
            });

            marker.addListener('click', () => {
                infoWindow.open(this.mapInstance, marker);

                const data = new URLSearchParams();
                let language = document.documentElement.lang;

                data.append('language', language);
                Object.entries(location).forEach(([k, v]) => {
                    data.append(`mapParams[${k}]`, String(v));
                });


                if (marker.contentLoaded === false) {

                    fetch('/toolbox/ajax/gm-info-window', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: data,
                    })
                        .catch((error) => {
                            console.error('toolbox error: fetching info window');
                        })
                        .then(response => response.text())
                        .then((data) => {
                            marker.contentLoaded = true;
                            infoWindow.setContent(data);
                            this.mapInstance.setCenter(marker.getPosition());
                        });
                }
            });

            if (showInfoWindowOnLoad === true) {
                google.maps.event.trigger(marker, 'click');
            }
        }
    }

    resize() {
        const x = this.mapInstance.getZoom(),
            c = this.mapInstance.getCenter();
        google.maps.event.trigger(this.mapInstance, 'resize');
        this.mapInstance.setZoom(x);
        this.mapInstance.setCenter(c);
    }
}
