import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { applyDataElementRdtLogging } from "@domx/dataelement/applyDataElementRdtLogging";
import { applyEventMapLogging } from "@domx/dataelement";
import { Router, Route } from "@domx/router";
import { RouteActiveChangedEvent } from "@domx/router/DomxRoute";
import "./dx-pages";
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
        <a href="/demo/page1?a=b&c=some value">page1?a=b&c=some value</a> | 
        <a href="/demo/page2">Page 2</a> |
        <a href="/demo/page2/testValue">page2/testValue</a> |
        <a href="/demo/page2/page3">Page 3</a>
      </span>
      <domx-route
        .parentRoute="${this.parentRoute}"
        pattern="/(page1)"
        element="dx-p1"
      ></domx-route>
      <domx-route
        .parentRoute="${this.parentRoute}"
        pattern="/page2(/:testParam)"
        element="dx-p2"
      ></domx-route>
      <domx-route
        .parentRoute="${this.parentRoute}"
        pattern="/page2(/*routeTail)"
        element="dx-p2"
        @route-active="${this.routeActive}"
        @route-inactive="${this.routeInactive}"
      >
        <domx-route
            pattern="/page3"
            element="dx-p4"
          ></domx-route>
      </domx-route>
      <domx-route
        .parentRoute="${this.parentRoute}"
        pattern="/page2/page3"
        element="dx-p3"
        append-to=".highlight">
      </domx-route>
      <div class="highlight">
        <h3>Container</h3>
      </div>
    `
  }

  routeActive(event:RouteActiveChangedEvent) {
    console.log(">>> /page2(/*routeTail):ACTIVE", event.detail);
  }

  routeInactive(event:RouteActiveChangedEvent) {
    console.log(">>> /page2(/*routeTail):INACTIVE", event.detail);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dx-router-demo': DxRouterDemo
  }
}
