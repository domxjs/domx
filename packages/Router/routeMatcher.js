export { routeMatches, getRouteMatch };
const routeMatches = (path, url) => pathToRegExp(path).test(url);
const getRouteMatch = (path, url) => {
    const pathRegex = pathToRegExp(path);
    const matches = pathRegex.test(url);
    let routeTail = null;
    if (!matches) {
        return {
            matches,
            routeData: {},
            tail: routeTail
        };
    }
    let names = [];
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
                const path = `/${values[i]}`;
                routeTail = {
                    prefix: url.substring(0, url.indexOf(path)),
                    path
                };
            }
            routeParams[name.substring(1, name.length)] = values[i];
        }
        return routeParams;
    }, {});
    return {
        matches,
        routeData: routeParams,
        tail: routeTail
    };
};
var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w+/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
const pathToRegExp = (path) => {
    path = path.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function (match, optional) {
        return optional ? match : '([^/?]+)';
    })
        .replace(splatParam, '([^?]*?)');
    return new RegExp('^' + path + '(?:\\?([\\s\\S]*))?$');
};
const extractParameters = (routeRegex, url) => {
    var params = routeRegex.exec(url)?.slice(1);
    return params.map((param, i) => {
        // Don't decode the search params.
        if (i === params.length - 1)
            return param || null;
        return param ? decodeURIComponent(param) : null;
    });
};
//# sourceMappingURL=routeMatcher.js.map