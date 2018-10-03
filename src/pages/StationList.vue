<template>
  <q-page padding class="row gutter-sm">
    <div class="col-xs-12 col-sm-6 col-lg-3" v-if="this.$route.name !== 'station-list'">
      <router-view></router-view>
    </div>
    <div class="col">
      <q-list>
        <q-list-header>{{ $t('station.ChargingStationsNearYou') }}</q-list-header>
        <q-item :to="{name: 'station-detail', params: {stationId: station.ge_id}}"
                link
                v-for="station of stations"
                :key="station.ge_id">
          <q-item-side>{{ parseFloat(station.distance).toFixed(1) }} km</q-item-side>
          <q-item-main :label="`${station.name} ( ${station.address.city} ${station.operator || station.network || '' })`" />
        </q-item>
        <q-item v-if="loadingStations"><q-spinner-puff /> {{ $t('Loading') }}...</q-item>
      </q-list>
    </div>
    <div class="col-xs-12 col-sm-6 col-xl-4">
      <div ref="map" id="map" v-show="mapMarkers !== undefined"></div>
    </div>
  </q-page>
</template>

<script>
import Leaflet from 'leaflet'
import 'leaflet-fontawesome-markers'

export default {
  data () {
    return {
      stations: [],
      deviceLocation: undefined,
      locationWatchID: undefined,
      loadingStations: true,
      map: undefined,
      mapMarkers: undefined,
      mapWidth: 0,
    }
  },
  created () {
    if ('geolocation' in window.navigator) {
      this.locationWatchID = window.navigator.geolocation.watchPosition(this.updateLocation)
      navigator.geolocation.getCurrentPosition(this.updateLocation)
    }
  },
  updated () {
    this.mapWidth = this.$refs.map.clientWidth
  },
  beforeDestroy () {
    if (this.locationWatchID) {
      window.navigator.geolocation.clearWatch(this.locationWatchID)
    }
  },
  computed: {
    locationAvailable () {
      return this.deviceLocation !== undefined
    },
  },
  watch: {
    async deviceLocation (val) {
      this.loadingStations = true
      this.stations = (await this.$http.get('/stations', {params: {lng: val.longitude, lat: val.latitude}})).data
      this.loadingStations = false
    },
    stations () {
      this.refreshMarkers()
    },
    locationAvailable: {
      handler (val) {
        if (val && !this.map) {
          this.$nextTick(this.initMap)
        }
      },
      immediate: true,
    },
    mapWidth () {
      this.handleMapResize()
    }
  },
  methods: {
    updateLocation (position) {
      this.deviceLocation = position.coords
    },
    refreshMarkers () {
      if (!this.map) {
        return
      }
      if (this.mapMarkers) {
        this.map.removeLayer(this.mapMarkers)
      }
      let markers = []
      if (this.deviceLocation) {
        markers.push(Leaflet.marker(
          [this.deviceLocation.latitude, this.deviceLocation.longitude],
          {
            icon: Leaflet.icon.fontAwesome({
              iconClasses: 'fas fa-crosshairs',
              markerColor: 'green',
              iconColor: '#FFF',
              iconXOffset: -2,
              iconYOffset: 0,
            }),
            zIndexOffset: 1000,
          },
        ))
      }
      if (this.stations) {
        for (let station of this.stations) {
          let marker = Leaflet.marker(
            station.coordinates,
            {
              icon: Leaflet.icon.fontAwesome({
                iconClasses: 'fas fa-charging-station',
                markerColor: 'blue',
                iconColor: '#FFF',
                iconXOffset: -2,
                iconYOffset: 0,
              }),
              zIndexOffset: 1000,
            },
          )
          marker.bindPopup(station.name)
          marker.on('click', () => this.$router.push({name: 'station-detail', params: {stationId: station.ge_id}}))
          markers.push(marker)
        }
      }
      if (markers.length > 0) {
        this.mapMarkers = Leaflet.featureGroup(markers)
        console.log({markers, bounds: this.mapMarkers.getBounds()})
        this.mapMarkers.addTo(this.map)
        this.map.fitBounds(this.mapMarkers.getBounds(), {padding: [50, 50], maxZoom: 12})
      }
    },
    initMap () {
      this.map = Leaflet.map('map')
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
      this.refreshMarkers()
    },
    handleMapResize () {
      if (this.map) {
        this.map.invalidateSize()
      }
      if (this.mapMarkers) {
        this.map.fitBounds(this.mapMarkers.getBounds(), {padding: [50, 50], maxZoom: 12})
      }
    },
  }
}
</script>

<style scoped>
  #map {
    height: 70vh;
    width: 100%;
    padding: 1rem;
  }
</style>

<style>
</style>
