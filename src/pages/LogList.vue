<template>
  <q-page padding class="row gutter-sm">
    <div class="col-xs-12 col-sm-6 col-lg-3" v-if="this.$route.name !== 'log-list'">
      <router-view></router-view>
    </div>
    <div class="col">
      <q-list>
        <q-list-header>{{ $t('logs.Logs') }}</q-list-header>
        <q-item :to="{name: 'log-detail', params: {logId: log.id}}"
                link
                v-for="log of logs"
                :key="log.id">
          <q-item-main><pre>{{ JSON.stringify(log, null, 2) }}</pre></q-item-main>
        </q-item>
        <q-item v-if="loadingLogs"><q-spinner-puff /> {{ $t('Loading') }}...</q-item>
        <q-item v-else-if="logs.length === 0">{{ $t('logs.NoLogs') }}</q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      logs: [],
      loadingLogs: false,
    }
  },
  mounted () {
    this.fetchLogs()
  },
  methods: {
    async fetchLogs () {
      this.loadingLogs = true
      let response = await this.$http.get('/logs')
      this.logs = response.data
      this.loadingLogs = false
    }
  }
}
</script>

<style>
</style>
