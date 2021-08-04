import { html, TemplateResult } from "lit-html";
export { html, fixture };
interface FixtureElement extends HTMLElement {
    restore: Function;
    state: any;
    testPipeTap: Function;
    testFunction: Function;
    testPipeNext: Function;
    testSimple: Function;
    testError: Function;
    testTapError: Function;
    testDispatchEvent: Function;
}
declare function fixture(html: TemplateResult): FixtureElement;
//# sourceMappingURL=testHelpers.d.ts.map