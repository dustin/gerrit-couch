function(theKey, values) {
    var result = {};
    values.forEach(function(p) {
        for (var k in p) {
            result[k] = (result[k] || 0) + p[k];
        }
    });
    return result;
}
