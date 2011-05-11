function(doc) {
    if (doc.type === "change-merged") {
        emit(doc.patchSet.number, 1);
    }
}
