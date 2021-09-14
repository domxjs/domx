

var optionalParam = /\((.*?)\)/g;
var namedParam    = /(\(\?)?:\w+/g;
var splatParam    = /\*\w+/g;
var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

export const pathToRegExp = (path:string) => {
    path = path.replace(escapeRegExp, '\\$&')
        .replace(optionalParam, '(?:$1)?')
        .replace(namedParam, function(match, optional) {
            return optional ? match : '([^/?]+)';
        })
        .replace(splatParam, '([^?]*?)');
    return new RegExp('^' + path + '(?:\\?([\\s\\S]*))?$');
};

export const extractParameters = (routeRegex:RegExp, url:string) => {
    var params = routeRegex.exec(url)?.slice(1) as string[];
    return params.map((param, i) => {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
    });
};

