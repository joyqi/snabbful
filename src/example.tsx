import { jsx } from 'snabbdom';
import { $, patchDom } from './helpers';
import { initComponent } from './component/init';
import { commit, watch } from './component/state';

const component = initComponent();

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

        commit(viewState, (s) => {
            s.value = '';
        });
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

watch(inputState, (k) => {
    console.log(k);
});

$<HTMLInputElement>('input')?.addEventListener('input', function() {
    viewState.value = this.value;
    inputState.value = this.value;
});

patchDom('#example-panel', <ViewComponent></ViewComponent>);
patchDom('#example-input', <InputComponent></InputComponent>);