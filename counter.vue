<template>
    <div>
        <span class="count">{{ count }}</span>
        <button @click="increment">Increment</button>
    </div>
</template>

<script>
export default {
    props: {
        outsideCount: {
            type: Number,
            default: 0,
        },
    },
    data () {
        return {
            count: 0
        }
    },

    methods: {
        increment () {
            this.count++;
            this.$emit('change', this.count);
        }
    },

    created() {
        this.count = this.outsideCount;
    },
};
</script>
