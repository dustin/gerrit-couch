function(doc) {
    var v = {};
    v[doc.type] = 1;
    emit(doc.ts.split('T')[0], v);
}
