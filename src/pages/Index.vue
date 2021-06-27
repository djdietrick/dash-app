<template>
  <q-page class="flex flex-center">
    <transition name="fade" mode="out-in">
        <q-btn round icon="home" v-if="selectedComponent != 'home'" @click="selectedComponent = 'home'" 
          class="home__btn" color="white" text-color="black"></q-btn>
    </transition>
    <transition name="fade" mode="out-in">
        <component :is="selectedComponent" @select="handleSelect"/>
    </transition>
  </q-page>
</template>

<script>
import Home from './Home.vue';
import Grocery from './Grocery.vue';
import Cleaning from './Cleaning.vue';
import Todo from './Todo.vue';
export default {
  name: 'Index',
  data() {
    return {
      selectedComponent: 'home'
    }
  },
  components: {
    'home': Home,
    'grocery': Grocery,
    'cleaning': Cleaning,
    'todo': Todo
  },
  methods: {
    handleSelect(val) {
      this.selectedComponent = val;
    }
  }
}
</script>

<style lang="scss" scoped>
.home__btn {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 3;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>