function(doc) {
    if (doc.type === "change-merged") {
        emit([doc.ts.split('T')[0], doc.change.project, doc.change.branch], 1);
    }
}
