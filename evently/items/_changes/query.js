function() {
    if (window.location.hash) {
        var project = window.location.hash.substring(1);
        return {
            "view" : "by-project",
            "descending" : "true",
            "limit" : 30,
            "include_docs": true,
            "startkey": [project, {}],
            "endkey": [project]
        };
    } else {
        return {
            "view" : "recent-items",
            "descending" : "true",
            "limit" : 30,
            "include_docs": true
        };
    }
};
