function(me, args) {
    var data = [];
    var prev = undefined;
    var offset = -1;
    me.rows.forEach(function(r) {
        var k = [r.key[0], r.key[1]];
        if (prev === undefined || k[0] != prev[0] || k[1] != prev[1]) {
            prev = k;
            ++offset;
            data.push({key: k, value: {}});
        }
        data[offset].value[r.key[2]] = r.value;
    });
    showStreamGraph('mergechart', "#merges .legend", data);
}
