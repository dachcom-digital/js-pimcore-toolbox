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
            fetch(mapStyleUrl).then((json) => {
                this.mapInstance.set('styles', json);
            });
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

        // todo
        this.checkElementEnvironment();

        if (this.options.centerMapOnResize === true) {
            window.addEventListener('resize.toolbox.googleMap', (ev) => this.checkResizeContext(ev));
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
                content: '<div class="info-window"><div class="loading"></div></div>',
            });

            marker.addListener('click', function () {
                infoWindow.open(this.mapInstance, marker);
                if (marker.contentLoaded === false) {

                    const data = new FormData();
                    data.append('language', HTMLElement.lang);
                    // todo: submit location
                    data.append('mapParams', '');

                    fetch('/toolbox/ajax/gm-info-window', {
                        method: 'POST',
                        body: data,
                    })
                        .catch((error) => {
                            console.error('toolbox error: fetching info window');
                        })
                        .then(response => response.json())
                        .then((data) => {
                            marker.contentLoaded = true;
                            infoWindow.setContent(data.responseText);
                            this.mapInstance.setCenter(marker.getPosition());
                        });
                }
            });

            if (showInfoWindowOnLoad === true) {
                google.maps.event.trigger(marker, 'click');
            }
        }
    }

    checkElementEnvironment() {

        // todo: use methods?

        // var _ = this;
        //
        // // special treatment for a re-init map inside accordion and tabs
        // if (this.options.theme === 'bootstrap3' || this.options.theme === 'bootstrap4') {
        //     $(document).on('shown.bs.collapse', function (ev) {
        //         var $target = $(ev.target);
        //         if ($target && $.contains($target[0], _.$map[0])) {
        //             var x = _.mapInstance.getZoom(),
        //                 c = _.mapInstance.getCenter();
        //             google.maps.event.trigger(_.mapInstance, 'resize');
        //             _.mapInstance.setZoom(x);
        //             _.mapInstance.setCenter(c);
        //         }
        //     }).on('shown.bs.tab shown-tabs.bs.tab-collapse', function (ev) {
        //         var $target = $($(ev.target).attr('href'));
        //         if ($target && $.contains($target[0], _.$map[0])) {
        //             var x = _.mapInstance.getZoom(),
        //                 c = _.mapInstance.getCenter();
        //             google.maps.event.trigger(_.mapInstance, 'resize');
        //             _.mapInstance.setZoom(x);
        //             _.mapInstance.setCenter(c);
        //         }
        //     });
        // }
    }

    checkResizeContext(ev) {
        const x = this.mapInstance.getZoom(),
            c = this.mapInstance.getCenter();
        google.maps.event.trigger(this.mapInstance, 'resize');
        this.mapInstance.setZoom(x);
        this.mapInstance.setCenter(c);
    }
}
