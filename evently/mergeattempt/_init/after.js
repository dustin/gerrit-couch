function(me, args) {
    var app = $$(this).app;
    // var path = app.require("vendor/couchapp/lib/path").init(app.req);

    function showBar(named, data, total) {
        var vals = [];
        var labels = [];
        var max = 0;
            for (var i = 0; i < data.length; ++i) {
                if (data[i]) {
                    labels.push(i);
                    vals.push(data[i]);
                    max = Math.max(max, data[i]);
                }
            }

        var barWidth = 40;
        var w = (barWidth + 5) * labels.length;
        var h = 200;

        var vis = new pv.Panel()
            .canvas(named)
            .width(w)
            .height(h)
            .bottom(20)
            .left(20)
            .right(10)
            .top(5);

        var x = pv.Scale.linear(0, max).range(0, h);
        var y = pv.Scale.ordinal(pv.range(labels.length)).splitBanded(0, w, 4/5);

        function maybePercent(n) {
            if (total) {
                var percent = (100 * n) / total;
                var integerPart = Math.floor(percent);
                var decimalPart = Math.floor((percent - integerPart) * 100);
                var pstring = integerPart + "." + decimalPart;
                return " (" + pstring + "%)";
            } else {
                return "";
            }
        }

        var bar = vis.add(pv.Bar)
            .data(vals)
            .bottom(15)
            .width(barWidth - 7)
            .height(function(d) {return x(d);})
            .left(function() { return this.index * barWidth + 5; })
            .anchor("bottom").add(pv.Label)
            .textMargin(function(d) {
                var v = labels[this.index];
                var mag = Math.floor(Math.log(Math.max(2, v)) / Math.log(10));
                return -8 * (1 + mag);})
            .textAlign("left")
            .textBaseline("middle")
            .textAngle(-Math.PI / 2)
            .text(function() { return labels[this.index];})
            .anchor("bottom").add(pv.Label)
            .textMargin(10)
            .textAlign("left")
            .textBaseline("middle")
            .textAngle(-Math.PI / 2)
            .text(function() { return vals[this.index] +
                               maybePercent(vals[this.index]); });

        vis.add(pv.Rule)
            .bottom(15)
            .left(24)
            .right(6);

        vis.render();
    }

    var data = [];
    var total_items = 0;
    for (var i = 0; i < me.rows.length; ++i) {
        data[me.rows[i].key] = me.rows[i].value;
        total_items += me.rows[i].value;
    }

    showBar('mergeattempt', data, total_items);
}