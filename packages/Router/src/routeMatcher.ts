import { Router, Route, RouteParams, RouteMatch } from "./Router";
export { routeMatches, getRouteMatch };


const prependRoot = (url:string) => {
    const root = Router.root;

    if (root === "/") {
        return url;
    }

    if (url.indexOf(root) === 0) {
        url = url.replace(root, "");
    }
    return url;
}

const routeMatches = (path:string, url:string):boolean => pathToRegExp(path).test(prependRoot(url));     

const getRouteMatch = (path:string, url:string):RouteMatch => {
    url = prependRoot(url);
    const pathRegex = pathToRegExp(path);
    const matches = pathRegex.test(url);     
    let routeTail:Route|null = null;
    if (!matches) {
        return {
            matches,
            routeParams: {},
            tail: routeTail
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
                const value = values[i];
                const path = value ? `/${(value as string) || ""}` : "";
                const prefix = value ? url.substring(0, url.indexOf(path)) : url;
                routeTail = {
                    prefix,
                    path
                };
            }
            routeParams[name.substring(1, name.length)] = values[i];
        }
        return routeParams;
    }, {} as RouteParams);

    return {
        matches,
        routeParams: routeParams,
        tail: routeTail
    };
};


var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

const pathToRegExp = (path:string) => {
    path = path.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function(match, optional) {
            return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, '([^?]*?)');
    return new RegExp('^' + path + '(?:\\?([\\s\\S]*))?$');
};

const extractParameters = (routeRegex:RegExp, url:string) => {
    var params = routeRegex.exec(url)?.slice(1) as string[];
    return params.map((param, i) => {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
    });
};
