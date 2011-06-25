function(doc) {
    if (doc.ts && !doc.ignored) {
        emit(doc.ts, null);
    }
};
