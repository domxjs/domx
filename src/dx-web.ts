import { LitElement, html, css } from "lit";
import { customElement, query } from "lit/decorators.js";
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

  @query("wc-markdown")
  $markdown:HTMLElement;

  readmeSrc = "https://raw.githubusercontent.com/domxjs/domx/master/README.md";

  connectedCallback() {
    super.connectedCallback();
    this.updateMarkdownSrc();    
  }

  render() {
    return html`
      <a class="nav-link" href="/demo/page1">Router Demo</a>
      <img class="logo" src="${logoUrl}"/>
      <wc-markdown src="${this.readmeSrc}"></wc-markdown>
    `;
  }

  // the wc-markdown element needs to refresh after re-inserting into the DOM
  updateMarkdownSrc() {
    (this.$markdown as any)?.setSrc(this.readmeSrc);
  }

}


declare global {
  interface HTMLElementTagNameMap {
    'dx-web': DxWeb
  }
}
