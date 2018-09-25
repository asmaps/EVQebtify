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
          <span slot="right"><q-btn icon="fas fa-sync" round flat @click="fetchExtended" /></span>
        </q-card-title>
        <q-card-main>
          <q-list v-if="lastStats">
            <q-item>
              <q-item-side icon="fas fa-charging-station" />
              <q-item-main :label="lastStats.charging === 1 ? $t('dashboard.Charging') : $t('dashboard.NotCharging')" />
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
          </q-list>
          <div v-else>No stats. Enter credentials and press refresh</div>
        </q-card-main>
      </q-card>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  data () {
    return {
      lastStats: undefined,
      akey: this.$q.localStorage.get.item('akey') || '',
      token: this.$q.localStorage.get.item('token') || '',
    }
  },
  created () {
    this.fetchExtended()
  },
  watch: {
    akey (val) {
      this.$q.localStorage.set('akey', val)
    },
    token (val) {
      this.$q.localStorage.set('token', val)
    },
  },
  methods: {
    async fetchExtended () {
      this.lastStats = undefined
      this.lastStats = (await this.$http.get('/extended', {params: {akey: this.akey, token: this.token}})).data
    }
  },
}
</script>
