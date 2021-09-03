import { LitElement, html, customElement, property, css } from 'lit-element';
import "@vanillawc/wc-markdown";
import logoUrl from "./favicon.svg";

/**
 * 
 */
@customElement('pm-web')
export class MyElement extends LitElement {
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
    img.logo {
      width: 150px;
      margin: 2rem auto 3rem;
    }
    table {      
      width: 100%;
      border-collapse: collapse;    
    }
    th, td {
      padding: 0.5rem 1rem;
      border: 1px solid #555555;
    }
    a {
      color: #4283db;
    }
  `

  render() {
    return html`
      <img class="logo" src="${logoUrl}"/>
      <wc-markdown
        src="https://raw.githubusercontent.com/domxjs/domx/master/README.md"
      ></wc-markdown>   
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'pm-web': MyElement
  }
}
