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
        <ul>
            <li v-for="item in items"
                :key="item.a + '-' + item.b">
                {{ item.a + '-' + item.b }}
            </li>
        </ul>
        <button @click="removeSecond" id="xx"></button>
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
            items: [{
                a: 1,
                b: 1,
            }, {
                a: 0,
                b: 0,
            }, {
                a: 3,
                b: 3,
            }]
        };
    },
    methods: {
        onCounterChange(value) {
            this.value = value;
        },
        e2etest() {
            this.e2eVsibile = !this.e2eVsibile;
        },
        removeSecond() {
            const items = this.items;
            this.items = [0, 2].map(x => {
                items[x].a *= x;
                items[x].b *= x;
                return items[x];
            });
        },
    },
};
</script>
