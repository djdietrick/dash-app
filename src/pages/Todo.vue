<template>
    <div class="todo fit">
        <div class="todo__items">
            <q-list>
                <q-item v-for="(todo, i) in todos" :key="i">
                    <q-item-section>
                        <q-checkbox v-model="todo.completed" />
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<script>
import {db} from '../services/firebase';
import {v4 as uuidv4} from 'uuid';

export default {
    data() {
        return {
            todos: [],
            newTodo: ''
        }
    },
    methods: {
        async fetchTodos() {
            return db().collection('todos').get()
                .then((snapshot) => {
                    let todos = [];
                    snapshot.forEach(doc => {
                        todos.push({
                            id: doc.id,
                            ...doc.data()
                        })
                    })
                    this.todos = todos;
                })
        },
        async addTodo() {
            if(!this.$refs['newTodo'].validate()) {
                console.log("Complete form");
                return;
            }
            let todo = {
                id: uuidv4(),
                title: this.newTodo,
                completed: false
            }

            await db().collection('todos').doc(todo.id).set(todo);
            this.todos.push(todo);
            this.newTodo = '';
        },
        async updateTodo(todo) {
            await db().collection('todos').doc(todo.id).set(todo);
            for(let i = 0; i < this.todos.length; i++) {
                if(this.todos[i].id === todo.id) {
                    this.todos[i] = todo;
                    return;
                }
            }
        },
        async deleteTodo(id) {
            await db().collection('todos').doc(id).delete();
            return new Promise((resolve, reject) => {
                for(let i = 0; i < this.todos.length; i++) {
                    if(this.todos[i].id === id) {
                        this.todos.splice(i, 1);
                        return resolve();
                    }
                }
                resolve();
            })
            
        },
        async pergeTodos() {
           let todosToDel = [];
           for(let todo of this.todos) {
               if(todo.completed) todosToDel.push(todo.id)
           }
           for(let id of todosToDel) {
               await this.deleteTodo(id);
           }
        }
    },
    unmounted() {
        this.pergeTodos();
    },
    async created() {
        this.$q.loading.show();
        await this.fetchTodos();
        await this.pergeTodos();
        this.$q.loading.hide();
    }
}
</script>

<style lang="scss" scoped>

.todo {
    &__items {
        margin-top: 5rem;
    }
}

</style>