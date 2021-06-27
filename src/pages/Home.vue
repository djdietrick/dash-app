<template>
    <div class="fit q-pa-lg home">
        <q-btn class="logout__btn" icon="logout" round @click="logoutUser"></q-btn>
        <q-btn v-for="(component, i) in components" :key="i" @click="emitComponent(i)"
            :icon="component.icon" :color="component.color" padding="lg"></q-btn>
    </div>
</template>

<script>
import {mapActions} from 'vuex';
export default {
    data() {
        return {
            components: [
                {
                    name: 'grocery',
                    label: 'Grocery',
                    icon: 'shopping_cart',
                    color: 'red-3'
                },
                {
                    name: 'cleaning',
                    label: 'Cleaning',
                    icon: 'cleaning_services',
                    color: 'green-12'
                },
                {
                    name: 'todo',
                    label: 'Todo',
                    icon: 'format_list_bulleted',
                    color: 'blue-6'
                }
            ]
        }
    },
    methods: {
        ...mapActions(['logout']),
        emitComponent(i) {
            this.$emit('select', this.components[i].name)
        },
        async logoutUser() {
            await this.logout();
            this.$router.push('/auth');
        }
    }
}
</script>

<style lang="scss" scoped>

.home {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2rem;
}

.logout__btn {
    position: fixed;
    top: 1rem;
    left: 1rem;
}
    
</style>