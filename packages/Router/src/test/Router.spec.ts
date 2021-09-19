import { describe, it, expect, jest } from "@jest/globals";
import { Router } from "../Router";


describe("Router", () => {
    it("exists", () => {
        expect(Router).toBeDefined();
    })
    
    // look at other methods to test
    // outside links not handled
    // browser back button
});

/*
index.spec.ts - update

DomxRoute.spec.ts
    routeParams
    queryParams
    append-to
    inner route
    parentRoute
    tail
    route-active, route-inactive events
    navigate

MAY NOT NEED TESTS FOR THES
    DomxLocation.spec.ts
    DomxRouteData.spec.ts

OTHER PACKAGES TESTS
    RootState.snapshot
    rdt state (and url) pushes 
*/