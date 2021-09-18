import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { applyDataElementRdtLogging } from "@domx/dataelement/applyDataElementRdtLogging";
import { applyEventMapLogging } from "@domx/dataelement";
import { Router, Route } from "@domx/router";
import { DomxRoute, RouteActiveChangedEvent } from "@domx/router/DomxRoute";
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

  @query("#subroute")
  $subroute:DomxRoute;

  render() {
    return html`
      <a class="nav-link" href="/">README</a>
      <h1>Router Demo</h1>
      <div>
        <a href="/demo/page1">Page 1</a> | 
        <a href="/demo/page1?a=b&c=some value">page1?a=b&c=some value</a> | 
        <a href="/demo/page2">Page 2</a> |
        <a href="/demo/page2/testValue">page2/testValue</a> |
        <a href="/demo/page2/page3">Page 3</a>
      </div>
      <div style="padding:1rem 0;">
        <button @click="${this.testNavigate}">Test.navigate</button>
      </div>
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
            id="subroute"
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

  testNavigate() {
    // alert("here:" + this.$subroute.element);
    this.$subroute.navigate({
      replaceState: true,
      routeParams: {
        "testParam": "foo"
      }
    });
  }

  routeActive(event:RouteActiveChangedEvent) {
    console.log(">>> route-active: /page2(/*routeTail):ACTIVE", event.detail);
  }

  routeInactive(event:RouteActiveChangedEvent) {
    console.log(">>> route-inactive: /page2(/*routeTail):INACTIVE", event.detail);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dx-router-demo': DxRouterDemo
  }
}
