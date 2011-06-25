function(doc) {
    if (doc.ts && !doc.ignored) {
        var ob = {};
        ob[doc.type] = 1;
        var branch = '';
        if (doc.change) {
            branch = doc.change.branch;
        }
        emit([doc.ts.split('T')[0], doc.type, doc.project, branch], ob);
    }
};
