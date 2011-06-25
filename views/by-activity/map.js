function(doc) {
    var branch = '';
    if (doc.change) {
        branch = doc.change.branch;
    }
    if (!doc.ignored) {
        emit([doc.type, doc.ts.split('T')[0], doc.project, branch], 1);
    }
}
