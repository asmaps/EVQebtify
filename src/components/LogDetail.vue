<template>
  <div v-if="log">
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
        <q-card-title>{{ $t('logs.startTime') }}</q-card-title>
        <q-card-main>
          {{ $moment.unix(log.start).format('LLLL') }}
        </q-card-main>
        <q-card-title>{{ $t('logs.endTime') }}</q-card-title>
        <q-card-main>
          {{ $moment.unix(log.end).format('LLLL') }}
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      log: undefined,
      refreshLogCancel: undefined,
    }
  },
  computed: {
    rid () {
      return this.$route.params.logId
    },
  },
  watch: {
    rid: {
      handler (val) {
        this.refreshLog()
      },
      immediate: true,
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
          let response = await this.$http.get('/log', {
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
  }
}
</script>

<style>
</style>
