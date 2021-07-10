import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate';
import {auth, db} from '../services/firebase';

// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      user: null
    },
    getters: {
      getUser: (state) => state.user
    },
    mutations: {
      setUser: (state, user) => state.user = user
    },
    actions: {
      async login({commit}, form) {
        const cred = await auth().signInWithEmailAndPassword(form.email, form.password);
        const user = await db().collection('users').doc(cred.user.uid).get();
        commit('setUser', user.data());
      },
      async logout({commit}) {
        auth().signOut().then(() => {commit('setUser', null)})
      }
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING,
    plugins: [
      createPersistedState({
        key: 'dashapp'
      })
    ]
  })

  return Store
}
