# linkProp &middot; [![Build Status](https://travis-ci.com/domxjs/domx.svg?branch=packages/linkProp)](https://travis-ci.com/domxjs/domx)

Contains methods for linking properties of dom elements with other dom elements.

Examples are using LitElement.

## Installation
```sh
npm install @domx/linkProp
```
## Methods
- `linkProp(element, prop, path?)`
- `linkSiblingProp(host, querySelector, prop, path?)`
- `linkVal(element, path)`
- `linkChecked(element, path)`

### A Note on `path`
The `path` is the property path to set on the target element. If ommited the `prop` value will be used. 

Path can be used to set deep properties so it can be something like: `state.someObject.someProperty`.
## Usage

### linkProp
The `linkProp` method links two element properties; usually from a child element to a parent element.
```js
class LinkPropTest extends LitElement {

    @property({type: Object})
    state = {foo: "bar"};

    render() {
        return html`
            <div id="testDiv" 
                @state-changed="${linkProp(this, "state")}"
                @state-path-changed="${linkProp(this, "foo", "state.foo")}"
            >
        `;
    }

    testMethod() {
        const testDiv = this.shadowRoot.querySelector("#testDiv");
        testDiv.state = {foo: "updated!"};
        testDiv.dispatchEvent(new CustomEvent("state-changed"));
        // this.state.foo === "updated!";

        testDiv.foo = "updated using a state path!";
        testDiv.dispatchEvent(new CustomEvent("state-path-changed"));
        // this.state.foo === "updated using a state path!";
    }
}
```


### linkSiblingProp
The `linkSiblingProp` method links two elements properties that are in the same shadowRoot.
```js
class LinkPropTest extends LitElement {

    render() {
        return html`
            <div id="firstElement"
                test-prop="initial value"
                @test-prop-changed="${linkSiblingProp(this, "#secondElement", "test-prop")}"
            >
            <div id="secondElement">
        `;
    }

    testMethod() {
        const firstElement = this.shadowRoot.querySelector("#firstElement");
        firstElement.setAttribute("test-prop", "updated value!");
        firstElement.dispatchEvent(new CustomEvent("test-prop-changed"));
        // #secondElement.test-prop === "updated value!"
    }
}
```

### linkVal
This is the same as `linkProp` but it uses `"value"` as the property to set.
This is useful for linking input values. 

### linkChecked
This is the same as `linkProp` but it uses `"checked"` as the property to set.
This is useful for linking checkbox values. 
