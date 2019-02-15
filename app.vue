<template>
    <div>
        <Counter @change="onCounterChange"
            :outside-count="value"/>
        <div @click="e2etest"
            >Counter value is {{value}} now</div>
        <div id="e2etest"
            v-if="e2eVsibile">
            Haha, now e2e test is invoked together with unit test
        </div>
    </div>
</template>

<script>
import Counter from './counter';
export default {
    components: {
        Counter,
    },
    data() {
        return {
            value: 1,
            e2eVsibile: false,
        };
    },
    methods: {
        onCounterChange(value) {
            this.value = value;
        },
        e2etest() {
            this.e2eVsibile = !this.e2eVsibile;
        },
    },
};
</script>
