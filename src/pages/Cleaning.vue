<template>
    <div class="cleaning fit">
        <q-btn round icon="add" class="add__btn" color="green-12" @click="add = true" text-color="black"></q-btn>
        <div class="cleaning__title">{{getTodaysDate()}}</div>
        <q-dialog v-model="add">
            <q-card class="add__card q-pa-lg">
                <div class="add__title q-mb-sm">New chore</div>
                <q-input v-model="newChore.title" label="Title" ref="title"
                    :rules="[val => val && val.length > 0 || 'Required']"></q-input>
                <q-input v-model="newChore.frequency" label="Frequency (in days)" ref="frequency"
                    :rules="[val => val && /^[-]?\d+$/.test(val) || 'Please enter a number']" lazy-rules></q-input>
                <q-btn label="add" color="green-12" class="q-mt-lg" text-color="black" @click="addChore"></q-btn>
            </q-card>
        </q-dialog>
        <q-dialog v-model="done">
            <q-card class="done__card q-pa-lg">
                <q-date
                    v-model="doneDate"
                    minimal
                />
                <q-btn label="add" color="green-12" text-color="black" @click="addDoneDate"></q-btn>
            </q-card>
        </q-dialog>
        <q-dialog v-model="edit">
            <q-card class="add__card q-pa-lg">
                <q-input v-model="editChore.title" label="Title" ref="title"
                    :rules="[val => val && val.length > 0 || 'Required']"></q-input>
                <q-input v-model="editChore.frequency" label="Frequency (in days)" ref="frequency"
                    :rules="[val => val && /^[-]?\d+$/.test(val) || 'Please enter a number']" lazy-rules></q-input>
                <q-btn label="Save" color="green-12" class="q-mt-lg" text-color="black" @click="updateChore(editChore)"></q-btn>
            </q-card>
        </q-dialog>
        <q-list class="chores">
            <q-item v-for="chore in chores" :key="chore.id" class="chore q-mx-lg q-my-md q-py-lg"
                :class="calcClass(chore)">
                <q-item-section>
                    <span class="chore__title">{{chore.title}}</span>
                </q-item-section>
                <q-item-section class="chore__text__container">
                    <span class="chore__text" v-if="chore.lastDone">{{getDueText(chore)}}</span>
                    <span class="chore__text" v-if="chore.lastDone">Last done {{formatLastDoneDate(chore.lastDone)}}</span>
                    <span class="chore__text" v-else>No history</span>
                </q-item-section>
                <q-item-section top side>
                    <div class="text-grey-8 q-gutter-xs">
                        <q-btn size="18px" flat dense round icon="done" @click="openDoneDialog(chore.id)"/>
                        <q-btn size="18px" flat dense round icon="more_vert">
                            <q-menu :offset="[-10, 5]">
                                <q-list>
                                    <q-item clickable >
                                        <q-item-section>History</q-item-section>
                                    </q-item>
                                    <q-item clickable @click="startEdit(chore)">
                                        <q-item-section>Edit</q-item-section>
                                    </q-item>
                                    <q-item clickable @click="deletePrompt(chore)">
                                        <q-item-section>Delete</q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                    </div> 
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>

<script>
import {v4 as uuidv4} from 'uuid';
import {db} from '../services/firebase';
import * as moment from 'moment';

export default {
    data() {
        return {
            chores: [],
            newChore: {
                title: '',
                frequency: ''
            },
            doneId: null,
            doneDate: null,
            add: false,
            done: false,
            editChore: {
                title: '',
                frequency: ''
            },
            edit: false
        }
    },
    methods: {
        async addChore() {
            if(!this.$refs['title'].validate() || !this.$refs['frequency'].validate()) {
                console.log("Complete form");
                return;
            }
            let chore = {
                id: uuidv4(),
                ...this.newChore,
                datesDone: [],
                lastDone: null
            }

            await db().collection('chores').doc(chore.id).set(chore);

            this.chores.push(chore);
            this.sortChores();
            this.add = false;
            this.newChore = {
                title: '',
                frequency: ''
            }
        },
        async fetchChores() {
            return db().collection('chores').get()
                .then((snapshot) => {
                    let chores = [];
                    snapshot.forEach(doc => {
                        chores.push({
                            id: doc.id,
                            ...doc.data()
                        })
                    })
                    this.chores = chores;
                    this.sortChores();
                })
        },
        async deleteChore(chore) {
            await db().collection('chores').doc(chore.id).delete();
            for(let i = 0; i < this.chores.length; i++) {
                if(this.chores[i].id === chore.id) {
                    this.chores.splice(i, 1);
                    return;
                }
            }
        },
        async updateChore(chore) {
            await db().collection('chores').doc(chore.id).set(chore);
            for(let i = 0; i < this.chores.length; i++) {
                if(this.chores[i].id === chore.id) {
                    this.chores[i] = chore;
                }
            }
            this.sortChores();
            this.edit = false;
        },
        async addDoneDate() {
            for(let i = 0; i < this.chores.length; i++) {
                if(this.chores[i].id === this.doneId) {
                    this.chores[i].datesDone.push(this.doneDate);
                    let latest = moment(this.doneDate);
                    for(let date of this.chores[i].datesDone) {
                        if(date == this.doneDate) {
                            this.done = false;
                            return;
                        };
                        if(moment(date) > latest) latest = moment(date);
                    }
                    this.chores[i].lastDone = latest.format('YYYY/MM/DD');
                    await db().collection('chores').doc(this.doneId).set(this.chores[i]);
                }
            }
            this.done = false;
            this.sortChores();
        },
        sortChores() {
            this.chores.sort((l, r) => {
                let ldiff = this.calcDiff(l);
                let rdiff = this.calcDiff(r);
                if(ldiff === rdiff) {
                    return l.title < r.title;
                }
                return ldiff > rdiff;
            })
        },
        openDoneDialog(id) {
            this.doneDate = moment().format('YYYY/MM/DD');
            this.doneId = id;
            this.done = true;
        },
        deletePrompt(chore) {
            this.$q.dialog({
                title: 'Are you sure?',
                cancel: true
            }).onOk(() => {
                this.deleteChore(chore);
            })
        },
        calcClass(chore) {
            //if(chore.lastDone === null || moment().diff(moment(chore.lastDone), 'days') === chore.frequency) return 'overdue';
            if(chore.lastDone === null) return 'overdue';
            let dueDate = moment(chore.lastDone).add(chore.frequency, 'days');
            let diff = dueDate.diff(moment().startOf('day'), 'days');
            if(diff <= 0) return 'overdue';
            else if(diff <= Math.min(Number(chore.frequency) / 2, 3)) return 'warning';
            else return 'safe';
        },
        getDueText(chore) {
            if(chore.lastDone === null) return 'Due today!'
            let dueDate = moment(chore.lastDone).add(chore.frequency, 'days');
            let diff = dueDate.diff(moment().startOf('day'), 'days');
            if(diff > 0) {
                return `Due in ${diff} day${diff > 1 ? 's' : ''}`;
            } else if(diff < 0) {
                return `Due ${Math.abs(diff)} day${Math.abs(diff) > 1 ? 's' : ''} ago`;
            } else {
                return 'Due today!';
            }
        },
        calcDiff(chore) {
            if(chore.lastDone === null) return 0;
            let dueDate = moment(chore.lastDone).add(chore.frequency, 'days');
            return dueDate.diff(moment().startOf('day'), 'days');
        },
        formatLastDoneDate(date) {
            return moment(date).format('M/DD');
        },
        startEdit(chore) {
            this.editChore = chore;
            this.edit = true;
        },
        getTodaysDate() {
            return moment().format('MMMM DD, YYYY');
        }
    },
    watch: {
        edit: function(val) {
            if(!val) {
                this.editChore = {
                    title: '',
                    frequency: ''
                }
            }
        }
    },
    async created() {
        this.$q.loading.show();
        await this.fetchChores();
        this.$q.loading.hide();
    }
}
</script>

<style lang="scss" scoped>

.add {
    &__title {
        font-size: 1.4rem;
        font-weight: 400;
        //color: $grey-8;
    }
    &__btn {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 3;
    }
    &__card {
        width: 85vw;
    }
}

.chore {
    background-color: $blue-grey-2;
    border-radius: 0.5rem;

    &__title {
        font-size: 1.4rem;
        font-weight: 300;
    }
    &__text {
        font-size: 0.8rem;
        color: $grey-7;

        &__container {
            display: grid;
            place-items: center;
        }
    }
}

.chores {
    margin-top: 5rem;
}

.cleaning {
    &__title {
        position: fixed;
        top: 1.6rem;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.3rem;
        font-weight: 300;
    }
}

.overdue {
    background-color: $red-3;
}
.warning {
    background-color: $lime-4;
}
.safe {
    background-color: $green-12;
}
    
</style>