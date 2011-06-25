function(doc) {
    if (doc.ts && !doc.ignored) {
        emit([doc.project, doc.ts], null);
    }
};
