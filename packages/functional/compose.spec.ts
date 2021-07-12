import { describe, it, expect } from "@jest/globals";
import { compose, composeAsync } from "./compose";


describe("compose", () => {

    // JCH HERE _ TRYING TO PROVE THE ORDER OF EXECUTION
    it("runs multiple functions in order", () => {
        const returnValue = compose(
            (x: number) => x + 2,
            (x: number) => x * 3
        )(1);
        expect(returnValue).toBe(5);
    });

    it("can run compose asyncronously", async () => {
        const promiseTwo = Promise.resolve(3);

        async function asyncFunction(x: number) : Promise<number> {
            const y = await promiseTwo;
            return x * y 
        }
       
        const returnValue = await composeAsync(
            (x: number) => x + 2,
            asyncFunction
        )(1);
        
        expect(returnValue).toBe(5);
    });
});