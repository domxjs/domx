import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";


@customElement('dx-p1')
export class DxP1 extends LitElement {
  render() {
    return html`<h1>Page 1</h1>`;
  }
}

@customElement('dx-p2')
export class DxP2 extends LitElement {
  render() {
    return html`<h1>Page 2</h1>`;
  }
}

