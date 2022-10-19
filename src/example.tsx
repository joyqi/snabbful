import { jsx } from "snabbdom";
import { $, patchDom } from "./helpers";
import { initComponent } from "./component/init";
import { useState } from "./component/state";

const component = initComponent();

interface Param {
    value: string
}

function View(param: Param) {
    return <div>{ param.value }</div>
}

function Input(param: Param) {
    const click = () => {
        param.value = '';
    }

    return <p>
        <input attrs={{
            readonly: 1,
            value: param.value
        }}></input>
        <button on={{ click }}>Reset</button>
    </p>
}

const [ViewComponent, viewState] = component(View, { value: '' });
const [InputComponent, inputState] = component(Input, { value: ''});

const [watch] = useState(inputState);

watch("value", () => {
    console.log(1111)
})

$<HTMLInputElement>('input')?.addEventListener('input', function() {
    viewState.value = this.value;
    inputState.value = this.value;
});

patchDom('#example-panel', <ViewComponent></ViewComponent>)
patchDom('#example-input', <InputComponent></InputComponent>)