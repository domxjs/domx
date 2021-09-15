import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { applyDataElementRdtLogging } from "@domx/dataelement/applyDataElementRdtLogging";
import { Router, DomxRoute } from "@domx/router";
import { Route } from "@domx/router/Router";


applyDataElementRdtLogging();

/**
 * 
 */
@customElement('dx-router-demo')
export class DxRouterDemo extends LitElement {
  static styles = css`
    :host {
      background: #0d1117;
      color: #c9d1d9;
      display: flex;
      flex-direction: column;
      padding: 1rem;
      max-width: 800px;
      margin: auto;
      margin-bottom: 5rem;
      font-family: roboto, arial;      
    }
    h1 {
      margin: 0;
    }
    table {      
      width: 100%;
      border-collapse: collapse;    
    }
    th, td {
      padding: 1rem 1rem;
      border-bottom: 1px solid #333;
    }
    a {
      color: #4283db;
    }
  `;
  
  // @property({type:Object})
  static properties = {
    poopyRoute: {type: Object, attribute:false}
  };

  poopyRoute:Route|null = null;

  connectedCallback() {
    super.connectedCallback();
    Router.init();
  }

  render() {
    return html`
      <h1>Router Demo</h1>
      <domx-route
        pattern="/"
        element="dx-p1"
      ></domx-route>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dx-router-demo': DxRouterDemo
  }
}
