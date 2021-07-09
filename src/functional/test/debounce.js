import sinon from 'sinon/lib/sinon.js';
import { expect } from 'chai';
import { debounce } from '../decorators';

class DebounceTest {

  @debounce(300)
  methodToDebounce(arg) {
    this.methodToCall(arg);
  }

  @debounce(300, {immediate: true})
  methodToDebounceImediately(arg) {
    this.methodToCall(arg);
  }

  methodToCall(arg) {}
}

describe("debounce", () => {
  describe("decorator", () => {
    
    it("debounces", () => {
      const clock = sinon.useFakeTimers();
      const testClass = new DebounceTest();
      const spy = sinon.spy(testClass, "methodToCall");
      testClass.methodToDebounce("foo");
      expect(spy.called).to.be.false;
      clock.tick(100);
      testClass.methodToDebounce("foo");
      expect(spy.called).to.be.false;
      clock.tick(100);
      expect(spy.called).to.be.false;
      clock.tick(200);
      expect(spy.callCount).to.be.equal(1);
      expect(spy.getCall(0).args[0]).to.be.equal("foo");
      testClass.methodToDebounce("bar");
      clock.tick(300);
      expect(spy.callCount).to.be.equal(2);
      expect(spy.getCall(1).args[0]).to.be.equal("bar");
      clock.restore();
    });

    it("supports the immediate option", () => {
      const clock = sinon.useFakeTimers();
      const testClass = new DebounceTest();
      const spy = sinon.spy(testClass, "methodToCall");
      testClass.methodToDebounceImediately("foo");
      expect(spy.callCount).to.be.equal(1);
      expect(spy.getCall(0).args[0]).to.be.equal("foo");     
      clock.tick(100);  
      testClass.methodToDebounceImediately("bar");
      expect(spy.callCount).to.be.equal(1);
      clock.tick(100);
      testClass.methodToDebounceImediately("bar");
      expect(spy.callCount).to.be.equal(1);
      clock.tick(300);
      testClass.methodToDebounceImediately("baz");
      expect(spy.callCount).to.be.equal(2);
      expect(spy.getCall(1).args[0]).to.be.equal("baz");     
      clock.restore();
    });
  });
});