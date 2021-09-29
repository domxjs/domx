import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import "@vanillawc/wc-markdown";
import logoUrl from "./favicon.svg";
import { Router } from "@domx/router";
import { dxStyles } from "./dx-router-demo/dxStyles";
import "./dx-router-demo/dx-router-demo";
import "@domx/router/domx-route";

/**
 * 
 */
@customElement('dx-web')
export class DxWeb extends LitElement {
  static styles = dxStyles;

  render() {
    return html`      
      <domx-route
        pattern="/"
        element="dx-readme"
      ></domx-route>
      <domx-route
        pattern="/demo(/*routeTail)"
        element="dx-router-demo"
      ></domx-route>
    `
  }
}

@customElement("dx-readme")
class DxReadme extends LitElement {
  static styles = DxWeb.styles;

  render() {
    return html`
      <a class="nav-link" href="/demo/page1">Router Demo</a>
      <img class="logo" src="${logoUrl}"/>
      <wc-markdown
        src="https://raw.githubusercontent.com/domxjs/domx/master/README.md"
      ></wc-markdown>
    `;
  }
}


declare global {
  interface HTMLElementTagNameMap {
    'dx-web': DxWeb
  }
}
