import { LitElement, html, customElement, property, css } from 'lit-element';
import logoUrl from "./favicon.svg";

/**
 * 
 */
@customElement('hbr-utils')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      max-width: 800px;
      margin: auto;
      font-family: arial;
    }
    h1 {
      margin: 0;
    }
    img {
      width: 200px;
      margin: auto;
    }
  `

  render() {
    return html`
      <h1>Harbor Utils</h1>
      <img src="${logoUrl}"/>    
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'hbr-utils': MyElement
  }
}
