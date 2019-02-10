# react-signal
Communication and state management library for React.

Currently being developed as part of a demo project hosted here: https://github.com/jsbuzz/todo-react-signal

## Create Namespaces
Namespaces manage state and facilitate publishing and subscribing to events.

```javascript
import { UpdateActive } from './events';

export const AppSpace = NameSpace.schema(() => ({
  activeTodos: [
    InitState, set(0),

    // update number of active todos
    UpdateActive, activeTodos => ({ active }) => active + activeTodos
  ]
}));
```

```jsx
<NameSpace schema={AppSpace} name="AppSpace">
  <Summary />
  <LastTodoEvent />
  <TodoApp title="Work" />
  <TodoApp title="Home" />
</NameSpace>
```

## Define state reducers with events
```javascript
import {
  NameSpace,
  InitState,
  set,
  modify
} from '../../react-signal/event-hive/namespace';
import { AddTodo, RemoveTodo, UpdateTodo, RestoreTodos } from './events';

const TodoSpace = NameSpace.schema((todoId = 0) => ({
  todos: [
    InitState, set(new Map()),
    
    // Add new todo
    AddTodo, modify(todos => ({ title }) => {
      const id = ++todoId;
      const todo = { id, title, done: false };

      todos.set(id, todo);
    }),
    
    // restore todos from cache
    RestoreTodos, modify(todos => ({ savedTodos }) => {
      savedTodos.forEach(todo => {
        todoId = todo.id;
        todos.set(todo.id, todo);
      });
    }),
    
    // remove a todo by id
    RemoveTodo, modify(todos => ({ id }) => todos.delete(id)),
    
    // update a todo by id
    UpdateTodo, modify(todos => ({ todo }) => todos.set(todo.id, todo))
  ]
}));
```


## Connect components to hosting namespace
**Connect to state**
```jsx
const Summary = ({ activeTodos }) => (
  <div className="todo-summary">
    <strong>Active todos:</strong> {activeTodos}
  </div>
);

export Connect(Summary, ({ activeTodos }) => ({ activeTodos }));
```

**Connect to events**
```jsx
import { AddTodo } from './events';

export const LastTodo = ({ title }) => (<div>Last todo added: {title}</div>);

export const LastTodoSignal = Signal(setProps => [
  AddTodo, ({ title }) => setProps({ title })
])(LastTodo);
```
