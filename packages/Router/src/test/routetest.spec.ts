import { describe, it, expect } from "@jest/globals";
import { Route, RouteData } from "../Router";
import {
    getRouteMatch
} from "../routeMatcher";


describe("DataElement index", () => {
    let currentTest:TestInput;

    const tests:Array<TestInput> = [{
        path: "/docs",
        url: "/docs",
        matches: true,
        routeParams: {},
        tail: null
    }, { // 1
        path: "/docs/faq",
        url: "/docs/faq",
        matches: true,
        routeParams: {},
        tail: null
    }, { // 2
        path: "/docs/:section",
        url: "/docs/faq",
        matches: true,
        routeParams: {section:"faq"},
        tail: null
    }, { // 3
        path: "/docs/:section/:subsection",
        url: "/docs/faq/install",
        matches: true,
        routeParams: {section: "faq", subsection: "install"},
        tail: null
    }, { // 4
        path: "/docs/:name-:mode",
        url: "/docs/dev-mode",
        matches: true,
        routeParams: {name: "dev", mode: "mode"},
        tail: null
    }, { // 5
        path: "/search/:query/p:page",
        url: "/search/france/p2",
        matches: true,
        routeParams: {query: "france", page: "2"},
        tail: null
    }, { // 6
        path: "/docs(/)",
        url: "/docs",
        matches: true,
        routeParams: {},
        tail: null
    }, { // 7
        path: "/docs(/)",
        url: "/docs/",
        matches: true,
        routeParams: {},
        tail: null
    }, { // 8
        path: "/docs/:section(/:subsection)",
        url: "/docs/faq",
        matches: true,
        routeParams: {section: "faq", subsection: null},
        tail: null
    }, { // 9
        path: "/docs/:section(/:subsection)",
        url: "/docs/faq/install",
        matches: true,
        routeParams: {section: "faq", subsection: "install"},
        tail: null
    }, { // 10
        path: "/docs(/:section)(/:subsection)",
        url: "/docs",
        matches: true,
        routeParams: {section: null, subsection: null},
        tail: null
    }, { // 11
        path: "/docs(/:section)(/:subsection)",
        url: "/docs/faq",
        matches: true,
        routeParams: {section: "faq", subsection: null},
        tail: null
    }, { // 12
        path: "/docs(/:section)(/:subsection)",
        url: "/docs/faq/install",
        matches: true,
        routeParams: {section: "faq", subsection: "install"},
        tail: null
    }, { // 13
        path: "/docs/*routeTail",
        url: "/docs/route/tail",
        matches: true,
        routeParams: {
            routeTail: "route/tail"
        },
        tail: null
    },  { // 14
        path: "/docs/:section/*routeTail",
        url: "/docs/faq/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            routeTail: "route/tail"
        },
        tail: null
    },  { // 15
        path: "/docs/:section/:subsection/*routeTail",
        url: "/docs/faq/install/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            subsection: "install",
            routeTail: "route/tail"
        },
        tail: null
    },  { // 16
        path: "/docs(/:section)(/:subsection)/*routeTail",
        url: "/docs/faq/install/route/tail",
        matches: true,
        routeParams: {
            section: "faq",
            subsection: "install",
            routeTail: "route/tail"
        },
        tail: {
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
        tail: {
            prefix: "/docs/faq/install",
            path: "/route/tail"
        }
    }];

    
    it("passes 0", () => {
        currentTest = tests[0];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 1", () => {
        currentTest = tests[1];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 2", () => {
        currentTest = tests[2];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 3", () => {
        currentTest = tests[3];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 4", () => {
        currentTest = tests[4];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 5", () => {
        currentTest = tests[5];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 6", () => {
        currentTest = tests[6];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 7", () => {
        currentTest = tests[7];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 8", () => {
        currentTest = tests[8];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 9", () => {
        currentTest = tests[9];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 10", () => {
        currentTest = tests[10];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 11", () => {
        currentTest = tests[11];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 12", () => {
        currentTest = tests[12];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 13", () => {
        currentTest = tests[13];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 14", () => {
        currentTest = tests[14];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 15", () => {
        currentTest = tests[15];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
    });
    it("passes 16", () => {
        currentTest = tests[16];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
        expect(result.tail).toStrictEqual(currentTest.tail);
    });
    it("passes 17", () => {
        currentTest = tests[17];
        const result = getRouteMatch(currentTest.path, currentTest.url);
        expect(result.matches).toBe(currentTest.matches);
        expect(result.routeData).toStrictEqual(currentTest.routeParams);
        expect(result.tail).toStrictEqual(currentTest.tail);
    });
});

interface TestInput {
    path: string,
    url: string,
    matches: boolean,
    routeParams: RouteData,
    tail:Route|null
}