<template>
  <q-page padding>
    <div class="group">
      <q-card>
        <q-card-title>Auth settings</q-card-title>
        <q-card-main>
          <q-field label="akey"><q-input v-model="akey" /></q-field>
          <q-field label="token"><q-input v-model="token" type="password" /></q-field>
        </q-card-main>
      </q-card>
      <q-card>
        <q-card-title>
          {{ $t('dashboard.LatestStats') }}
          <span slot="right"><q-btn icon="fas fa-sync" round flat @click="fetch" /></span>
        </q-card-title>
        <q-card-main>
          <q-list v-if="lastStats">
            <q-item>
              <q-item-side icon="fas fa-charging-station" />
              <q-item-main :label="lastStats.charging === 1 ? $t('dashboard.Charging') : $t('dashboard.NotCharging')" />
            </q-item>
            <q-item v-if="soc">
              <q-item-side icon="fas fa-battery-empty" />
              <q-item-main :label="soc.soc_display.toFixed(1) + '%'"
                           :sublabel="$t('dashboard.SocDisplay')"/>
            </q-item>
            <q-item>
              <q-item-side icon="fas fa-plug" />
              <q-item-main :label="`${(lastStats.dc_battery_power || 0.0).toFixed(1)} kW`"
                           :sublabel="$t('dashboard.DcBatteryPower')" />
            </q-item>
            <q-item>
              <q-item-side letter="V" />
              <q-item-main :label="`${(lastStats.dc_battery_voltage || 0.0).toFixed(1)} V`"
                           :sublabel="$t('dashboard.DcBatteryVoltage')" />
            </q-item>
            <q-item>
              <q-item-side letter="A" />
              <q-item-main :label="`${(lastStats.dc_battery_current || 0.0).toFixed(1)} A`"
                           :sublabel="$t('dashboard.DcBatteryCurrent')" />
            </q-item>
            <q-item>
              <q-item-side icon="fas fa-car-battery" />
              <q-item-main :label="`${(lastStats.aux_battery_voltage || 0.0).toFixed(1)} V`"
                           :sublabel="$t('dashboard.AuxBatteryVoltage')" />
            </q-item>
            <q-item>
              <q-item-side icon="fas fa-heart" />
              <q-item-main :label="`${(lastStats.soh || 0.0).toFixed(1)}%`"
                           :sublabel="$t('dashboard.SOH')" />
            </q-item>
            <q-item v-if="soc">
              <q-item-side icon="fas fa-battery-empty" />
              <q-item-main :label="soc.soc_bms.toFixed(1) + '%'"
                           :sublabel="$t('dashboard.SocBms')"/>
            </q-item>
          </q-list>
          <div v-else>No stats. Enter credentials and press refresh</div>
        </q-card-main>
      </q-card>
      <div id="map" v-show="location"></div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import Leaflet from 'leaflet'
import 'leaflet-fontawesome-markers'

export default {
  data () {
    return {
      lastStats: undefined,
      location: undefined,
      soc: undefined,
      akey: this.$q.localStorage.get.item('akey') || '',
      token: this.$q.localStorage.get.item('token') || '',
      map: undefined,
      mapMarker: undefined,
    }
  },
  created () {
    this.fetch()
  },
  watch: {
    akey (val) {
      this.$q.localStorage.set('akey', val)
    },
    token (val) {
      this.$q.localStorage.set('token', val)
    },
    locationAvailable (val) {
      if (val && !this.map) {
        this.$nextTick(this.initMap)
      }
    },
  },
  computed: {
    locationAvailable () {
      return this.location && this.location.longitude && this.location.latitude
    },
    geoLocation () {
      if (!this.locationAvailable) {
        return []
      }
      return [this.location.latitude, this.location.longitude]
    },
  },
  methods: {
    async fetch () {
      this.lastStats = undefined
      this.soc = undefined
      this.location = undefined

      this.lastStats = (await this.$http.get('/extended', {params: {akey: this.akey, token: this.token}})).data
      this.soc = (await this.$http.get('/soc', {params: {akey: this.akey, token: this.token}})).data
      this.location = (await this.$http.get('/location', {params: {akey: this.akey, token: this.token}})).data
    },
    refreshMarker () {
      if (!this.map) {
        return
      }
      if (this.mapMarker) {
        this.map.removeLayer(this.mapMarker)
      }
      if (this.locationAvailable) {
        this.mapMarker = Leaflet.marker(
          this.geoLocation,
          {
            icon: Leaflet.icon.fontAwesome({
              iconClasses: 'fas fa-car',
              markerColor: 'blue',
              iconColor: '#FFF',
              iconXOffset: -2,
              iconYOffset: 0,
            }),
            zIndexOffset: 1000,
          },
        ).addTo(this.map)
        this.map.fitBounds([this.geoLocation], {padding: [50, 50], maxZoom: 10})
      }
    },
    initMap () {
      this.map = Leaflet.map('map')
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
      this.refreshMarker()
    },
  },
}
</script>

<style scoped>
  #map {
    height: 350px;
    width: 100%;
    padding: 1rem;
  }
</style>

<style src="leaflet/dist/leaflet.css"></style>
<style src="leaflet-fontawesome-markers/L.Icon.FontAwesome.css"></style>
