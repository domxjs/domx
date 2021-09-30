import { describe, it, expect } from "@jest/globals";
import { Route, RouteParams, Router } from "../Router";
import {
    getRouteMatch,
    routeMatches
} from "../routeMatcher";


describe("routeMatcher", () => {

    describe("routeMatches", () => {
        it("matches a route", () => {
            const matches = routeMatches("/docs", "/docs");
            expect(matches).toBe(true);
        });

        it ("matches a route after setting the Router.root", () => {
            Router.root = "/test";
            const matches = routeMatches("/docs", "/test/docs");
            expect(matches).toBe(true);
            Router._reset();
        });
        

    });

    describe("getRouteMatch", () => {        
        let currentTest:TestInput;

        const tests:Array<TestInput> = [{
            path: "/docs",
            url: "/docs",
            matches: true,
            routeParams: {},
            routeTailParam: {},
            tail: null
        }, { // 1
            path: "/docs/faq",
            url: "/docs/faq",
            matches: true,
            routeParams: {},
            routeTailParam: {},
            tail: null
        }, { // 2
            path: "/docs/:section-id",
            url: "/docs/faq",
            matches: true,
            routeParams: {"section-id":"faq"},
            routeTailParam: {},
            tail: null
        }, { // 3
            path: "/docs/:section/:subsection",
            url: "/docs/faq/install",
            matches: true,
            routeParams: {section: "faq", subsection: "install"},
            routeTailParam: {},
            tail: null
        }, { // 4/
            path: "/docs/d:name/:mode",
            url: "/docs/ddev/mode",
            matches: true,
            routeParams: {name: "dev", mode: "mode"},
            routeTailParam: {},
            tail: null
        }, { // 5
            path: "/search/:query/p:page",
            url: "/search/france/p2",
            matches: true,
            routeParams: {query: "france", page: "2"},
            routeTailParam: {},
            tail: null
        }, { // 6
            path: "/docs(/)",
            url: "/docs",
            matches: true,
            routeParams: {},
            routeTailParam: {},
            tail: null
        }, { // 7
            path: "/docs(/)",
            url: "/docs/",
            matches: true,
            routeParams: {},
            routeTailParam: {},
            tail: null
        }, { // 8
            path: "/docs/:section(/:subsection)",
            url: "/docs/faq",
            matches: true,
            routeParams: {section: "faq", subsection: null},
            routeTailParam: {},
            tail: null
        }, { // 9
            path: "/docs/:section(/:subsection)",
            url: "/docs/faq/install",
            matches: true,
            routeParams: {section: "faq", subsection: "install"},
            routeTailParam: {},
            tail: null
        }, { // 10
            path: "/docs(/:section)(/:subsection)",
            url: "/docs",
            matches: true,
            routeParams: {section: null, subsection: null},
            routeTailParam: {},
            tail: null
        }, { // 11
            path: "/docs(/:section)(/:subsection)",
            url: "/docs/faq",
            matches: true,
            routeParams: {section: "faq", subsection: null},
            routeTailParam: {},
            tail: null
        }, { // 12
            path: "/docs(/:section)(/:subsection)",
            url: "/docs/faq/install",
            matches: true,
            routeParams: {section: "faq", subsection: "install"},
            routeTailParam: {},
            tail: null
        }, { // 13
            path: "/docs/*routeTail",
            url: "/docs/route/tail",
            matches: true,
            routeParams: {},
            routeTailParam: {
                routeTail: "route/tail"
            },
            tail: null
        },  { // 14
            path: "/docs/:section/*routeTail",
            url: "/docs/faq/route/tail",
            matches: true,
            routeParams: {
                section: "faq"
                
            },
            routeTailParam: {
                routeTail: "route/tail"
            },
            tail: null
        },  { // 15
            path: "/docs/:section/:subsection/*routeTail",
            url: "/docs/faq/install/route/tail",
            matches: true,
            routeParams: {
                section: "faq",
                subsection: "install"                
            },
            routeTailParam: {
                routeTail: "route/tail"
            },
            tail: null
        },  { // 16
            path: "/docs(/:section)(/:subsection)/*routeTail",
            url: "/docs/faq/install/route/tail",
            matches: true,
            routeParams: {
                section: "faq",
                subsection: "install"                
            },
            routeTailParam: {
                routeTail: "route/tail"
            },
            tail: {
                prefix: "/docs/faq/install",
                path: "/route/tail",
                routeParams: {
                    section: "faq",
                    subsection: "install"
                }
            }
        },  { // 17
            path: "/docs(/:section)(/:subsection)(/*routeTail)",
            url: "/docs/faq/install/route/tail",
            matches: true,
            routeParams: {
                section: "faq",
                subsection: "install"                
            },
            routeTailParam: {
                routeTail: "route/tail"
            },
            tail: {
                prefix: "/docs/faq/install",
                path: "/route/tail",
                routeParams: {
                    section: "faq",
                    subsection: "install"
                }
            }
        }, { // 18
            path: "/docs",
            url: "/test/docs",
            matches: true,
            routeParams: {},
            routeTailParam: {},
            tail: null
        }, { // 19
            path: "/does/not/match",
            url: "/test/docs",
            matches: false,
            routeParams: {},
            routeTailParam: {},
            tail: null
        }];

        
        it("passes 0", () => {
            currentTest = tests[0];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 1", () => {
            currentTest = tests[1];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 2", () => {
            currentTest = tests[2];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 3", () => {
            currentTest = tests[3];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 4", () => {
            currentTest = tests[4];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 5", () => {
            currentTest = tests[5];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 6", () => {
            currentTest = tests[6];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 7", () => {
            currentTest = tests[7];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 8", () => {
            currentTest = tests[8];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 9", () => {
            currentTest = tests[9];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 10", () => {
            currentTest = tests[10];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 11", () => {
            currentTest = tests[11];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 12", () => {
            currentTest = tests[12];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 13", () => {
            currentTest = tests[13];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 14", () => {
            currentTest = tests[14];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 15", () => {
            currentTest = tests[15];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
        });
        it("passes 16", () => {
            currentTest = tests[16];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
            expect(result.tail).toStrictEqual(currentTest.tail);
        });
        it("passes 17", () => {
            currentTest = tests[17];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
            expect(result.tail).toStrictEqual(currentTest.tail);
        });
        it("passes 18", () => {
            Router.root = "/test";
            currentTest = tests[18];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
            expect(result.tail).toStrictEqual(currentTest.tail);
            Router._reset();
        });
        it("passes 19", () => {
            currentTest = tests[19];
            const result = getRouteMatch(currentTest.path, currentTest.url);
            expect(result.matches).toBe(currentTest.matches);
            expect(result.routeParams).toStrictEqual(currentTest.routeParams);
            expect(result.routeTailParam).toStrictEqual(currentTest.routeTailParam);
            expect(result.tail).toStrictEqual(currentTest.tail);
        });
    });
});

interface TestInput {
    path: string,
    url: string,
    matches: boolean,
    routeParams: RouteParams,
    routeTailParam: RouteParams,
    tail:Route|null
}