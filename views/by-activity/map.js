function(doc) {
    var branch = '';
    if (doc.change) {
        branch = doc.change.branch;
    }
    var ob = {};
    ob[doc.project] = 1;
    emit([doc.type, doc.ts.split('T')[0], doc.project, branch], ob);
}
