<template>
    <div class="sorry">
        <q-btn class="logout__btn" icon="logout" round @click="logoutUser"></q-btn>
        <div class="sorry__text">
            <div>You are not permissioned to view this app.</div>
        </div>
    </div>
</template>

<script>
import {mapActions} from 'vuex';
export default {
    methods: {
        ...mapActions(['logout']),
        async logoutUser() {
            await this.logout();
            this.$router.push('/auth').catch(() => {});
        }
    }
}
</script>

<style lang="scss" scoped>

.sorry {
    height: 100vh;
    width: 100vw;
    background-color: $red-3;
    display: grid;
    place-items: center;
    text-align: center;

    &__text {
        font-size: 3rem;
        font-weight: 300;
        color: white;
    }
}

.logout__btn {
    position: fixed;
    top: 1rem;
    left: 1rem;
    background-color: white;
}
    
</style>