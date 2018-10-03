<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: {
    data: Object,
  },
  data () {
    return {
      options: {
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
      }
    }
  },
  mounted () {
    this.renderChart(this.data, this.options)
  }
}
</script>

<style>
</style>
