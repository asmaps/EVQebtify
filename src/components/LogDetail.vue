<template>
  <div v-if="log">
    <div class="generic-margin">
      <q-btn color="primary"
             icon="fas fa-caret-left"
             :label="$t('BackToList')"
             @click="$router.push({name: 'log-list'})" />
    </div>
    <div v-if="log.loading">
      <q-spinner-puff size="50px">{{ $t('log.loadingLog') }}</q-spinner-puff>
    </div>
    <div v-else-if="log.error">
      {{ $t('log.Error') }}
    </div>
    <div v-else>
      <q-card>
        <q-card-title class="bg-light">{{ log.title }}</q-card-title>
        <q-card-main v-if="log.charge === 1">
          <h4><i class="text-positive fas fa-charging-station"></i> {{ $t('logs.ChargingStop') }}</h4>
        </q-card-main>
        <q-card-main v-else>
          <h4><i class="text-primary fas fa-car"></i> {{ $t('logs.Drive') }}</h4>
        </q-card-main>
        <q-card-main>
          <q-tabs>
            <q-tab slot="title" name="graph" icon="fas fa-chart-line" :label="$t('logs.Graph')"></q-tab>
            <q-tab default @select="$nextTick(() => initMap())" slot="title" name="map" icon="fas fa-map" :label="$t('logs.Map')"></q-tab>
            <q-tab-pane name="graph">
              <log-graph :data="graphData"></log-graph>
            </q-tab-pane>
            <q-tab-pane name="map">
              <div ref="map" id="map"></div>
            </q-tab-pane>
          </q-tabs>
        </q-card-main>
        <q-card-main>
          <div class="row justify-around">
            <div>
              <h5>{{ $t('logs.Date') }}</h5>
              {{ $moment.unix(log.start).format('LL') }}
            </div>
            <div>
              <h5>{{ $t('logs.StartTime') }}</h5>
              {{ $moment.unix(log.start).format('LTS') }}
            </div>
            <div>
              <h5>{{ $t('logs.EndTime') }}</h5>
              {{ $moment.unix(log.end).format('LTS') }}
            </div>
          </div>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
import LogGraph from 'components/LogGraph'
import Leaflet from 'leaflet'
import 'leaflet-fontawesome-markers'

export default {
  components: {
    LogGraph,
  },
  data () {
    return {
      log: undefined,
      refreshLogCancel: undefined,
      mapWidth: 0,
    }
  },
  computed: {
    rid () {
      return this.$route.params.logId
    },
    isCharge () {
      return parseInt(this.log.charge) === 1
    },
    graphData () {
      if (!this.log || !Array.isArray(this.log.stats)) {
        return []
      }

      let soc
      if (this.isCharge) {
        soc = this.log.stats.filter(el => (el.soc_display || el.soc_bms || el.dc_battery_power || el.battery_min_temperature || el.battery_max_temperature || el.battery_inlet_temperature))
      } else {
        soc = this.log.stats.filter(el => (el.soc_display || el.soc_bms || el.dc_battery_power || el.gps_speed || el.battery_min_temperature || el.battery_max_temperature || el.battery_inlet_temperature))
      }

      soc.sort((a, b) => a.timestamp - b.timestamp)
      let datasets = [
        {
          label: 'SOC Display %',
          borderColor: '#50f84f',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.soc_display),
        },
        {
          label: 'SOC BMS %',
          borderColor: '#f83be1',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.soc_bms),
        },
        {
          label: 'DC Battery Power kW',
          borderColor: '#324df8',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.dc_battery_power ? el.dc_battery_power * (this.isCharge ? -1 : 1) : el.dc_battery_power),
        },
        {
          label: 'Battery Temperature (Min) °C',
          borderColor: '#00b8ff',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.battery_min_temperature),
        },
        {
          label: 'Battery Temperature (Max) °C',
          borderColor: '#b31212',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.battery_max_temperature),
        },
        {
          label: 'Battery Temperature (Inlet) °C',
          borderColor: '#b31212',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.battery_inlet_temperature),
        },
      ]
      if (!this.isCharge) {
        datasets.push({
          label: 'Speed',
          borderColor: '#f81d28',
          fill: false,
          lineTension: 0,
          spanGaps: true,
          data: soc.map(el => el.gps_speed ? el.gps_speed * 3.6 : el.gps_speed),
        })
      }

      return {
        labels: soc.map(el => this.$moment.unix(el.timestamp).format('LTS')),
        datasets,
      }
    },
  },
  updated () {
    this.mapWidth = this.$refs.map.clientWidth
  },
  watch: {
    rid: {
      handler (val) {
        this.refreshLog()
      },
      immediate: true,
    },
    mapWidth () {
      this.handleMapResize()
    },
  },
  methods: {
    async refreshLog () {
      if (this.refreshLogCancel) {
        this.refreshLogCancel()
        this.refreshLogCancel = undefined
      }
      if (this.rid) {
        this.log = {loading: true}
        try {
          let response = await this.$http.get('/logdetail', {
            params: {id: this.rid},
            cancelToken: new this.$http.CancelToken(cancel => {
              this.refreshLogCancel = cancel
            }),
          })
          this.log = response.data
        } catch (error) {
          console.error({error})
          this.log = {error: true}
        }
      }
    },
    refreshLine () {
      if (!this.map || !this.log || !Array.isArray(this.log.stats)) {
        return
      }

      let points = this.log.stats.filter(el => el.latitude && el.longitude).map(el => [el.latitude, el.longitude])
      this.mapLine = Leaflet.polyline(points, {
        color: 'blue',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 0
      })
      this.mapLine.addTo(this.map)
      this.map.fitBounds(this.mapLine.getBounds(), {padding: [50, 50]})
    },
    initMap () {
      this.map = Leaflet.map('map')
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map)
      this.refreshLine()
    },
    handleMapResize () {
      if (this.map) {
        this.map.invalidateSize()
      }
      if (this.mapLine) {
        this.map.fitBounds(this.mapLine.getBounds(), {padding: [50, 50]})
      }
    },
  }
}
</script>

<style>
</style>

<style scoped>
  #map {
    height: 70vh;
    width: 100%;
    padding: 1rem;
  }
</style>
