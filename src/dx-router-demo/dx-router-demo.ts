import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { applyDataElementRdtLogging } from "@domx/dataelement/applyDataElementRdtLogging";
import { applyEventMapLogging } from "@domx/dataelement";
import { Router, DomxRoute } from "@domx/router";
import "./dx-pages";
import { Route } from "@domx/router/Router";
import { dxStyles } from "./dxStyles";


// applyEventMapLogging();
applyDataElementRdtLogging();

/**
 * 
 */
@customElement('dx-router-demo')
export class DxRouterDemo extends LitElement {
  static styles = dxStyles;

  @property({type:Object, attribute: false})
  parentRoute:Route;

  render() {
    return html`
      <a class="nav-link" href="/">README</a>
      <h1>Router Demo</h1>
      <span>
        <a href="/demo/page1">Page 1</a> | 
        <a href="/demo/page2">Page 2</a>
      </span>
      <domx-route
        .parentRoute="${this.parentRoute}"
        pattern="/(page1)"
        element="dx-p1"
      ></domx-route>
      <domx-route
        .parentRoute="${this.parentRoute}"
        pattern="/page2"
        element="dx-p2"
      ></domx-route>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dx-router-demo': DxRouterDemo
  }
}
