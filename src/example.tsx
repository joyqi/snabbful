import { attributesModule, eventListenersModule, init, jsx, toVNode } from 'snabbdom';
import { initComponent } from './component/init';
import { ref } from './component/state';

const component = initComponent([attributesModule, eventListenersModule]);
const patch = init([attributesModule, eventListenersModule]);

interface Param {
    value: string
    count: number
}

function View(param: Param) {
    return <div>{ param.value }</div>;
}

function Input(param: Param) {
    const click = () => {
        param.value = '';
        ref(param).emit('click');
    };

    return <p>
        <input attrs={{
            readonly: 1,
            value: param.value
        }}></input>
        <button on={{ click }}>Reset</button>
    </p>;
}

const [ViewComponent, viewState] = component(View, { value: '', count: 0 });
const [InputComponent, inputState] = component(Input, { value: '', count: 0 });

ref(inputState).watch(() => {
    console.log(inputState.value);
});

ref(inputState).on('click', () => {
    console.log('click');
});

document.querySelector('input')?.addEventListener('input', function() {
    viewState.value = this.value;
    inputState.value = this.value;
});

patch(toVNode(document.querySelector('#example-panel') as Element), <ViewComponent></ViewComponent>);
patch(toVNode(document.querySelector('#example-input') as Element), <InputComponent></InputComponent>);