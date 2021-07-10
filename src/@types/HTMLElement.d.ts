interface HTMLElement {
    connectedCallback(): void;
    disconnectedCallback() : void;
    adoptedCallback() : void;
    attributeChangedCallback(name : String, oldValue: any, newValue: any) : void;
}