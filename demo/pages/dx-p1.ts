import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DomxRoute } from "@domx/router";

/**
 * 
 */
@customElement('dx-p1')
export class DxP1 extends LitElement {
  static styles = css`
  `

  render() {
    return html`
      <h1>Page 1</h1>
    `
  }
}

