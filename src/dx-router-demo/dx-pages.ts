import { QueryParams } from "@domx/router/Router";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";


@customElement('dx-p1')
export class DxP1 extends LitElement {
  
  @property({type:Object, attribute:false})
  queryParams:QueryParams|null = null;

  render() {
    return html`
      <h1>Page 1</h1>
      queryParams:
      ${Object.keys(this.queryParams).map(p => html`
        ${p} = ${this.queryParams[p]}
      `)}
    `;
  }
}

@customElement('dx-p2')
export class DxP2 extends LitElement {

  @property({type:String})
  testParam:string|null = null;

  render() {
    return html`
      <h1>Page 2</h1>
      <span>routeParam:testParam = ${this.testParam}</span>
    `;
  }
}

@customElement('dx-p3')
export class DxP3 extends LitElement {
  render() {
    return html`
      <h1>Page 3</h1>
    `;
  }
}


