function(me, args) {
    var data = [];
    var ymax = 0, total = 0;
    me.rows.forEach(function (r) {
        r.value._total = 0;
        for (var k in r.value) {
            if (k[0] !== '_') {
                r.value._total += r.value[k];
            }
        }
        data.push([r.key[0][1], r.value]);
        ymax = Math.max(ymax, r.value._total);
        total += r.value._total;
    });
    data.sort(function(a, b) { return b[1]._total - a[1]._total; });

    var angle = pv.Scale.linear(0, data.length).range(Math.PI / 2, 5 * Math.PI / 2);
    var named = 'contributorchart';
    var w = $('#' + named).width();
    var h = w;
    var radius = pv.Scale.linear(0, ymax).range(0, w / 2);
    var color = pv.Colors.category19().by(function(d) { return d;});
    var legend_prefix = '#contributors .legend';

    var vis = new pv.Panel()
        .canvas(named)
        .width(w)
        .height(h)
      .add(pv.Wedge)
        .data(function(d) { return data ;})
        .left(200)
        .top(150)
        .angle(Math.PI / (data.length / 2))
        .startAngle(function(c, d) { return angle(this.index);})
        .outerRadius(function(c, d) { return radius(c[1]._total);})
        .fillStyle(pv.Colors.category19().by(function(d) { return d[0]; }))
        .strokeStyle(function() { return this.fillStyle().darker();})
        .lineWidth(1)
        .event("mouseover", function(d, p) {
            $(legend_prefix + " ." + d[0]).addClass("highlit");
        })
        .event("mouseout", function(d, p) {
            $(legend_prefix + " ." + d[0]).removeClass("highlit");
        })
      .add(pv.Wedge)
        .fillStyle(null)
        .strokeStyle(null)
        .outerRadius(function(c, d) { return radius(Math.max(ymax / 3, c[1]._total)); })
      .anchor("outer").add(pv.Label)
        .text(function(c, d) { return c[0]; })
        .textAlign("center")
        .textBaseline("bottom")
        .textAngle(function() { return this.anchorTarget().midAngle() + Math.PI / 2;});

    vis.render();

    // Update the legend
    $(legend_prefix).empty();
    data.forEach(function(ob) {
        var k = ob[0];
        var val = ob[1]._total;
        var style = "";
        if (color(k).color) {
            style = "style='color: " + color(k).color + "'";
        }
        $(legend_prefix).append("<span class='" + k + "' " + style + ">" +
                                k + "(" + val + ")</span> ");
    });
}