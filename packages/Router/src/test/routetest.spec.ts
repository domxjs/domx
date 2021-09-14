import { describe, it, expect } from "@jest/globals";
import { Route, RouteData } from "../Router";
import {
    pathToRegExp,
    extractParameters
} from "../routetest";


describe("DataElement index", () => {

    const tests:Array<TestInput> = [{
        path: "/docs",
        url: "/docs",
        matches: true,
        routeParams: {},
        routeTail: null
    }, { // 1
        path: "/docs/faq",
        url: "/docs/faq",
        matches: true,
        routeParams: {},
        routeTail: null
    }, { // 2
        path: "/docs/:section",
        url: "/docs/faq",
        matches: true,
        routeParams: {section:"faq"},
        routeTail: null
    }, { // 3
        path: "/docs/:section/:subsection",
        url: "/docs/faq/install",
        matches: true,
        routeParams: {section: "faq", subsection: "install"},
        routeTail: null
    }, { // 4
        path: "/docs/:name-:mode",
        url: "/docs/dev-mode",
        matches: true,
        routeParams: {name: "dev", mode: "mode"},
        routeTail: null
    }, { // 5
        path: "/search/:query/p:page",
        url: "/search/france/p2",
        matches: true,
        routeParams: {query: "france", page: "2"},
        routeTail: null
    }, { // 6
        path: "/docs(/)",
        url: "/docs",
        matches: true,
        routeParams: {},
        routeTail: null
    }, { // 7
        path: "/docs(/)",
        url: "/docs/",
        matches: true,
        routeParams: {},
        routeTail: null
    }, { // 8
        path: "/docs/:section(/:subsection)",
        url: "/docs/faq",
        matches: true,
        routeParams: {section: "faq", subsection: null},
        routeTail: null
    }, { // 9
        path: "/docs/:section(/:subsection)",
        url: "/docs/faq/install",
        matches: true,
        routeParams: {section: "faq", subsection: "install"},
        routeTail: null
    }, { // 10
        path: "/docs(/:section)(/:subsection)",
        url: "/docs",
        matches: true,
        routeParams: {section: null, subsection: null},
        routeTail: null
    }, { // 11
        path: "/docs(/:section)(/:subsection)",
        url: "/docs/faq",
        matches: true,
        routeParams: {section: "faq", subsection: null},
        routeTail: null
    }, { // 12
        path: "/docs(/:section)(/:subsection)",
        url: "/docs/faq/install",
        matches: true,
        routeParams: {section: "faq", subsection: "install"},
        routeTail: null
    }, { // 13
        path: "/docs/*routeTail",
        url: "/docs/route/tail",
        matches: true,
        routeParams: {
            routeTail: "route/tail"
        },
        routeTail: null
    },  { // 14
        path: "/docs/:section/*routeTail",
        url: "/docs/faq/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            routeTail: "route/tail"
        },
        routeTail: null
    },  { // 15
        path: "/docs/:section/:subsection/*routeTail",
        url: "/docs/faq/install/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            subsection: "install",
            routeTail: "route/tail"
        },
        routeTail: null
    },  { // 16
        path: "/docs(/:section)(/:subsection)/*routeTail",
        url: "/docs/faq/install/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            subsection: "install",
            routeTail: "route/tail"
        },
        routeTail: {
            prefix: "/docs/faq/install",
            path: "/route/tail"
        }
    },  { // 17
        path: "/docs(/:section)(/:subsection)(/*routeTail)",
        url: "/docs/faq/install/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            subsection: "install",
            routeTail: "route/tail"
        },
        routeTail: {
            prefix: "/docs/faq/install",
            path: "/route/tail"
        }
    }];

    const scratch = [{

        // OPTIONAL PARAMS

        // route tail
        // docs/:section -- 
        // docs/:section/:subsection -- docs/faq/installing/route/tail


    }];

    let currentTest:TestInput;
    
    it("passes 0", () => {
        currentTest = tests[0];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 1", () => {
        currentTest = tests[1];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 2", () => {
        currentTest = tests[2];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 3", () => {
        currentTest = tests[3];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 4", () => {
        currentTest = tests[4];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 5", () => {
        currentTest = tests[5];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 6", () => {
        currentTest = tests[6];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 7", () => {
        currentTest = tests[7];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 8", () => {
        currentTest = tests[8];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 9", () => {
        currentTest = tests[9];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 10", () => {
        currentTest = tests[10];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 11", () => {
        currentTest = tests[11];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 12", () => {
        currentTest = tests[12];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 13", () => {
        currentTest = tests[13];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 14", () => {
        currentTest = tests[14];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 15", () => {
        currentTest = tests[15];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
    });
    it("passes 16", () => {
        currentTest = tests[16];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
        expect(result.routeTail).toStrictEqual(currentTest.routeTail);
    });
    it("passes 17", () => {
        currentTest = tests[17];
        const result = testUrl(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeParams).toStrictEqual(currentTest.routeParams);
        expect(result.routeTail).toStrictEqual(currentTest.routeTail);
    });
});

interface TestInput {
    path: string,
    url: string,
    matches: boolean,
    routeParams: RouteData,
    routeTail:Route|null
}

interface TestReturn {
    matches:boolean,
    routeParams:RouteData,
    routeTail:Route|null
}



// jch need to handle tail, if user puts* then add it as a routeParam
// otherwise split it to create a prefix and path property
const testUrl = (path:string, url:string):TestReturn => {
    const pathRegex = pathToRegExp(path);
    const matches = pathRegex.test(url);     
    let routeTail:Route|null = null;
    if (!matches) {
        return {
            matches,
            routeParams: {},
            routeTail
        };
    }
    
    let names:Array<string|null> = [];
    const values = extractParameters(pathRegex, url);
    
    let pathToTest = path;
    if (pathToTest.indexOf("(") > -1) {
        pathToTest = path.replace(/\(/g, "").replace(/\)/g, "");
    }
    const urlRegex = pathToRegExp(pathToTest);
    if (urlRegex.test(pathToTest)) {
        names = extractParameters(pathRegex, pathToTest);
    }
    
    const routeParams = names.reduce((routeParams, name, i) => {
        if (name !== null) {
            if (name.substring(0, 1) === "*") {
                const path = `/${values[i] as string}`;
                routeTail = {
                    prefix: url.substring(0, url.indexOf(path)),
                    path
                };
            }
            routeParams[name.substring(1, name.length)] = values[i];
        }
        return routeParams;
    }, {} as RouteData);

    return {
        matches,
        routeParams,
        routeTail
    };
};

