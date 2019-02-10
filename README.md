# react-signal
Communication and state management library for React

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
