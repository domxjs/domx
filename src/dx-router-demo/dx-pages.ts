import { QueryParams } from "@domx/router/Router";
import { Route } from "@domx/Router";
import "@domx/router/domx-route";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

const dxStyles = css`
em, .loud {
  background-color: #cfc776;
  color: black;
}
a {
  color: white;
}
`;

@customElement('dx-p1')
export class DxP1 extends LitElement {
  static styles = dxStyles;
  
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
  static styles = dxStyles;


  @property({type:Object, attribute:false})
  parentRoute:Route|null = null;

  @property({type:String})
  testParam:string|null = null;

  @property({type:String})
  routeTail:string|null = null;

  render() {
    return html`
      <h1>Page 2</h1>
      <span>routeParam:testParam: <span class="loud">${this.testParam}</span></span><br>
      <span>routeParam:routeTail: <span class="loud">${this.routeTail}</span></span>
      <hr>
      Parent:<br>
      prefix: <span class="loud">${this.parentRoute?.prefix}</span>
      path: <span class="loud">${this.parentRoute?.path}</span>
    `;
  }
}

@customElement('dx-p3')
export class DxP3 extends LitElement {
  static styles = dxStyles;

  render() {
    return html`
      <h1>Page 2 / Page 3</h1>
    `;
  }
}

@customElement('dx-p4')
export class DxP4 extends LitElement {
  static styles = dxStyles;

  
  render() {
    return html`
      <h1>Page 4</h1>
      <em class="loud">DOM subroute; linked from page2/page3</em>
    `;
  }
}


@customElement('dx-p5')
export class DxP5 extends LitElement {
  static styles = dxStyles;

  render() {
    return html`
      <h1>Page 5</h1>
      
      <div>
        <a href="/demo/page5/page1">Page 1</a> | 
        <a href="/demo/page5/page2">Page 2</a>
      </div>
      <p>
        Testing internal routes (navigate back test)
      </p>
      <domx-route
        pattern="/demo/page5/page1"
        element="dx-p1"
      ></domx-route>
      <domx-route
        pattern="/demo/page5/page2"
        element="dx-p2"
      ></domx-route>
    `;
  }
}
