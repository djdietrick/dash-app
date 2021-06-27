<template>
    <div class="auth">
        <q-card class="auth__card">
            <q-form @submit="submit">
                <q-input v-model="email" label="Email"></q-input>
                <q-input v-model="password" label="Password" type="password"></q-input>
                <q-btn label="Login" size="lg" type="submit" class="q-mt-lg auth__btn" color="green-12"></q-btn>
            </q-form>
        </q-card>
    </div>
</template>

<script>
import {mapActions} from 'vuex';
export default {
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        ...mapActions(['login']),
        async submit() {
            await this.login({
                email: this.email, 
                password: this.password
            });
            this.$router.push('/').catch(() => {});
        }
    }
}
</script>

<style lang="scss" scoped>

.auth {
    display: grid;
    place-items: center;
    height: 100vh;
    &__card {
        width: 80vw;
        padding: 1rem;
    }
    &__btn {
        left: 50%;
        transform: translateX(-50%);
    }
}
    
</style>