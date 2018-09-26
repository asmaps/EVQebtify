<template>
  <q-page padding class="flex flex-center">
    <q-card>
      <q-card-title>{{ $t('auth.Login') }}</q-card-title>
      <q-card-main>
        <q-field :label="$t('auth.AKey')" :error="errorMsg.length > 0" :error-label="errorMsg">
          <q-input v-model="akey"/>
        </q-field>
        <q-field :label="$t('auth.Password')">
          <q-input v-model="pass" type="password" />
        </q-field>
        <div class="generic-margin text-right">
          <q-btn outline
                 color="positive"
                 icon="fas fa-sign-in-alt"
                 @click="login"
                 :label="$t('auth.Login')" />
        </div>
      </q-card-main>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data () {
    return {
      akey: '',
      pass: '',
      errorMsg: '',
    }
  },
  methods: {
    async login () {
      try {
        let response = await this.$http.post('/login', {akey: this.akey, password: this.pass})
        this.$q.localStorage.set('akey', this.akey)
        this.$q.localStorage.set('token', response.data.token)
        this.$router.push({name: 'dashboard'})
      } catch (error) {
        this.errorMsg = error.response.data.error.message
      }
    },
  },
}
</script>

<style>
</style>
