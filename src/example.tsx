import { jsx, attributesModule, init, toVNode } from "snabbdom";
import { $ } from "./cash";
import { initComponent } from "./component";

const component = initComponent([attributesModule]);
const patch = init([attributesModule]);

interface Param {
    value: string
}

function View(param: Param) {
    return <div>{ param.value }</div>
}

function Input(param: Param) {
    return <input attrs={{
        readonly: 1,
        value: param.value
    }}></input>
}

const [ViewComponent, viewState] = component(View, { value: '' });
const [InputComponent, inputState] = component(Input, { value: ''});

$<HTMLInputElement>('input')?.addEventListener('input', function() {
    viewState.value = this.value;
    inputState.value = this.value;
});

patch(toVNode($('#example-panel') as Element), <ViewComponent></ViewComponent>)
patch(toVNode($('#example-input') as Element), <InputComponent></InputComponent>)