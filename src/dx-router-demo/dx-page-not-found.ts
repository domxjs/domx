import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import { dxStyles } from "./dxStyles";


@customElement("dx-page-not-found")
class DxPageNotFound extends LitElement {

    static styles= [
      dxStyles, 
      css`
        :host{
          display: block;
          max-width: 100%;
          margin: 0;
          background: red;
          color: white;
          width: 100%;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
        }
      `
    ];

    pageName:string|null = null;

    render() {
      return html`
        <h1>Page Not Found</h1>
        <p>
          The page you are looking for was not found.
          ${this.pageName ? html`
            <b>Page name: ${this.pageName}</b>
          `: html``}
        </p>
        <div>
            <button @click="${this.closeButtonClicked}">Close</button>
          <button @click="${this.backButtonClicked}">Back</button>
        </div>
      `;
    }

    closeButtonClicked() {
      this.remove();
    }

    backButtonClicked() {
        window.history.back();
    }
}


declare global {
  interface HTMLElementTagNameMap {
    'dx-page-note-found': DxPageNotFound
  }
}
