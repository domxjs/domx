import { describe, it, expect } from "@jest/globals";
import { pipe, pipeAsync } from "../pipe";


describe("pipe", () => {

    it("runs multiple functions in order", () => {
        const returnValue = pipe(
            (x: number) => x + 2,
            (x: number) => x * 3
        )(1);
        expect(returnValue).toBe(9);
    });

    it("can run pipe asyncronously", async () => {
        const promiseTwo = Promise.resolve(3);

        async function asyncFunction(x: number) : Promise<number> {
            const y = await promiseTwo;
            return x * y 
        }
       
        const returnValue = await pipeAsync(
            (x: number) => x + 2,
            asyncFunction
        )(1);
        
        expect(returnValue).toBe(9);
    });

    it("can use any argument types", () => {
        const returnValue = pipe<any>(
            text => parseInt(text),
            num => num + 1,
            num => String(num) + " - it worked"
        )("1")

        expect(returnValue).toBe("2 - it worked");
    });
});
