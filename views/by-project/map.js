function(doc) {
    if (doc.ts) {
        emit([doc.project, doc.ts], null);
    }
};
