import {html, render, TemplateResult} from "lit-html";
export { fixture, html, FixtureElement};

interface FixtureElement extends HTMLElement {
    restore: Function
};
  
function fixture<T>(html:TemplateResult): FixtureElement & T {
  const fixture = document.createElement("div");
  fixture.setAttribute("fixture", "");
  document.body.appendChild(fixture);

  render(html, fixture);
  const el = fixture.firstElementChild as FixtureElement & T;

  el.restore = () => {el.remove(); fixture.remove();}
  return el;
};