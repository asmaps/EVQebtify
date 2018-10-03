<template>
  <div v-if="station">
    <div v-if="station.loading">
      <q-spinner-puff size="50px">{{ $t('station.loadingStation') }}</q-spinner-puff>
    </div>
    <div v-else>
      <q-card>
        <q-card-title>
          {{ station.name }}, {{ station.address.city }}
          <span slot="subtitle" v-if="station.operator || station.network">
            {{ station.operator || station.network || '' }}<span v-if="station.operator && station.network"> ({{ station.network }})</span>
          </span>
        </q-card-title>
        <q-card-media v-if="Array.isArray(station.photos) && station.photos.length > 0">
          <img :src="`${$http.defaults.baseURL}stationphoto?id=${station.photos[0].id}`" />
        </q-card-media>
        <q-card-main>
          <a target="_blank" :href="station.url">
            <i class="fas fa-external-link-alt"></i> {{ $t('station.showOnGE') }}
          </a>
          <p v-if="station.address" class="generic-margin">
            {{ station.address.street }}<br>
            {{ station.address.postcode }} {{ station.address.city }}
          </p>
          <h5>{{ $t('station.Chargepoints') }}</h5>
          <q-list>
            <q-item v-for="cp of station.chargepoints" :key="cp.type">
              <q-item-side>{{ cp.count }}x</q-item-side>
              <q-item-main :label="$t('station.chargepointtype.' + cp.type)" />
              <q-item-side right>{{cp.power}} kW</q-item-side>
            </q-item>
          </q-list>
          <p v-if="station.general_information" class="generic-margin">{{ station.general_information }}</p>
          <p v-if="station.location_description" class="generic-margin">{{ station.location_description }}</p>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      station: undefined,
      refreshStationCancel: undefined,
    }
  },
  computed: {
    rid () {
      return this.$route.params.stationId
    },
  },
  watch: {
    rid: {
      handler (val) {
        this.refreshStation()
      },
      immediate: true,
    },
  },
  methods: {
    async refreshStation () {
      if (this.refreshStationCancel) {
        this.refreshStationCancel()
        this.refreshStationCancel = undefined
      }
      if (this.rid) {
        this.station = {loading: true}
        try {
          let response = await this.$http.get('/station', {
            params: {id: this.rid},
            cancelToken: new this.$http.CancelToken(cancel => {
              this.refreshStationCancel = cancel
            }),
          })
          this.station = response.data
        } catch (error) {
          console.error({error})
          this.station = {error: true}
        }
      }
    },
  }
}
</script>

<style>
</style>
