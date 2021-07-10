<template>
    <div class="todo">
        <div class="todo__title">Todos</div>
        <div class="todo__items">
            <q-list>
                <q-item v-for="(todo, i) in todos" :key="i" class="q-py-none">
                    <q-form @submit="updateTodo(todo)" class="todo__item">
                        <q-checkbox v-model="todo.completed" ></q-checkbox>
                        <q-input v-model="todo.title" class="todo__item__input" borderless @blur="updateTodo(todo)" dense></q-input>
                    </q-form>
                </q-item>
                <q-item class="q-py-none">
                    <q-form @submit="addTodo" class="todo__item">
                        <q-checkbox disabled v-model="newTodoCheck"></q-checkbox>
                        <q-input v-model="newTodo" class="todo__item__input todo__item__input--new" ref="newTodo" @blur="addTodo"
                            :error="newTodoError" error-message="Required" dense></q-input>
                    </q-form>
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
            newTodo: '',
            newTodoCheck: false,
            newTodoError: false,
            prevTodos: []
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
                    this.prevTodos = JSON.parse(JSON.stringify(todos));
                })
        },
        async addTodo() {
            if(!this.newTodo.length) {
                this.newTodoError = true;
                setTimeout(() => {
                    this.newTodoError = false
                }, 3000)
                return;
            }
            let todo = {
                id: uuidv4(),
                title: this.newTodo,
                completed: false
            }

            await db().collection('todos').doc(todo.id).set(todo);
            this.todos.push(todo);
            this.prevTodos = JSON.parse(JSON.stringify(this.todos));
            this.newTodo = '';
            this.$refs['newTodo'].resetValidation();
        },
        async updateTodo(todo) {
            if(!todo.title.length) {
                this.deleteTodo(todo.id);
                return;
            }
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
    watch: {
        newTodo: function(val) {
            if(val && val.length > 0 && this.newTodoError) this.newTodoError = false;
        },
        todos: {
            deep: true,
            async handler(val) {
                let todosToUpdate = [];
                for(let i = 0; i < this.todos.length; i++) {
                    if(this.todos[i].completed != this.prevTodos[i].completed) {
                        todosToUpdate.push(this.todos[i]);
                    }
                }
                for(let todo of todosToUpdate) {
                    await this.updateTodo(todo);
                }
                this.prevTodos = JSON.parse(JSON.stringify(this.todos));
            }
        }
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
    height: 100vh;
    width: 100vw;

    &__title {
        position: fixed;
        top: 1.6rem;
        left: 50%;
        transform: translateX(-50%);
        font-size: 1.3rem;
        font-weight: 300;
    }

    &__items {
        margin-top: 5rem;
    }
    &__item {
        width: 100%;
        display: grid;
        grid-template-columns: 2rem 1fr;
        place-items: center;

        &__input {
            width: 90%;
            font-size: 1.1rem;

            &--new {
                transform: translateY(10px);
            }
        }
    }
}

</style>