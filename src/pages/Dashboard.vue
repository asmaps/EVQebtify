<template>
  <q-page padding>
    <div class="row gutter-sm">
      <div class="col-xs-12 col-sm-6 col-xl-4">
        <q-card>
          <q-card-title>
            {{ $t('dashboard.LatestStats', {car: (settings || {}).car}) }}
            <span slot="right"><q-btn icon="fas fa-sync" round flat @click="fetch" /></span>
          </q-card-title>
          <q-card-main>
            <q-list v-if="lastStats">
              <q-item>
                <q-item-side icon="fas fa-charging-station" :color="lastStats.charging === 1 ? 'positive' : 'negative'" />
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
              <q-collapsible icon="fas fa-bars" :label="$t('dashboard.ShowAll')">
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
              </q-collapsible>
            </q-list>
            <div v-else>No stats. Enter credentials and press refresh</div>
          </q-card-main>
        </q-card>
      </div>
      <div class="col">
        <div ref="map" id="map" v-show="location"></div>
      </div>
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
      settings: undefined,
      soc: undefined,
      akey: this.$q.localStorage.get.item('akey'),
      token: this.$q.localStorage.get.item('token'),
      map: undefined,
      mapMarker: undefined,
    }
  },
  mounted () {
    this.fetch()
  },
  watch: {
    locationAvailable (val) {
      if (val && !this.map) {
        this.$nextTick(this.initMap)
      }
    },
    mapWidth () {
      if (this.map) {
        this.map.invalidateSize()
      }
    }
  },
  updated () {
    this.mapWidth = this.$refs.map.clientWidth
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
      this.settings = undefined

      try {
        this.lastStats = (await this.$http.get('/extended', {params: {akey: this.akey, token: this.token}})).data
        this.soc = (await this.$http.get('/soc', {params: {akey: this.akey, token: this.token}})).data
        this.settings = (await this.$http.get('/settings', {params: {akey: this.akey, token: this.token}})).data.settings
        this.location = (await this.$http.get('/location', {params: {akey: this.akey, token: this.token}})).data
      } catch (error) {
        if (error.response.status >= 400 && error.response.status < 500) {
          this.$router.push({name: 'login'})
        }
      }
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
        if (this.settings && this.settings.car) {
          this.mapMarker.bindPopup(this.settings.car)
        }
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
