<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header>
      <q-toolbar color="primary">
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="fas fa-bars" />
        </q-btn>

        <q-toolbar-title>
          {{ $t('nav.title') }}
          <div slot="subtitle">{{ $t('nav.subtitle') }}</div>
        </q-toolbar-title>
      </q-toolbar>
      <q-tabs>
        <q-route-tab
          icon="fas fa-home"
          :to="{name: 'dashboard'}"
          exact
          slot="title"
          :label="$t('nav.Dashboard')"
        />
        <q-route-tab
          icon="fas fa-list"
          :to="{name: 'log-list'}"
          slot="title"
          :label="$t('nav.Logs')"
        />
        <q-route-tab
          icon="fas fa-charging-station"
          :to="{name: 'station-list'}"
          slot="title"
          :label="$t('nav.Stations')"
        />
      </q-tabs>
    </q-layout-header>

    <q-layout-drawer
      v-model="leftDrawerOpen"
      content-class="bg-grey-2"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-list-header>{{ $t('nav.Links') }}</q-list-header>
        <q-item @click.native="openURL('https://evnotify.de')">
          <q-item-side icon="fas fa-home" />
          <q-item-main :label="$t('nav.EVNotifyHomepage')" sublabel="https://evnotify.de" />
        </q-item>
      </q-list>
    </q-layout-drawer>

    <q-page-container>
      <transition mode="out-in" :duration="300" enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <router-view />
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  data () {
    return {
      leftDrawerOpen: false,
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>

<style src="leaflet/dist/leaflet.css"></style>
<style src="leaflet-fontawesome-markers/L.Icon.FontAwesome.css"></style>
