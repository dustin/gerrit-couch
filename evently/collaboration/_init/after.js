function(me, args) {
    var data = {}, totals = {}, projects = [];
    var ymax = 0, collab_max = 0, total = 0;
    me.rows.forEach(function (r) {
        for (var k in r.value) {
            var ob = data[k] || [];
            ob.push([r.key[0][1], r.value[k]]);
            data[k] = ob;
            r.value._total += r.value[k];

            totals[k] = (totals[k] || 0) + r.value[k];
            ymax = Math.max(ymax, totals[k]);
            collab_max = Math.max(collab_max, data[k].length);

            if (projects.indexOf(k) == -1) {
                projects.push(k);
            }
        }
    });
    for (var k in totals) {
        total += totals[k];
    }
    projects.sort(function(a, b) {
        var al = data[a].length, bl = data[b].length;
        if (al == bl) {
            return a > b ? -1 : 1;
        } else {
            return al - bl;
        }
    });

    var angle = pv.Scale.linear(0, total).range(0, Math.PI * 2);
    var named = 'collaborationchart';
    var w = $('#' + named).width();
    var h = w;
    var radius = pv.Scale.linear(0, collab_max).range(0, (w / 2));
    var color = projectColorizer(projects);
    var s = pv.Scale.linear(0, collab_max).range(0, 20);
    var legend_prefix = '#collaboration .legend';

    var vis = new pv.Panel()
        .canvas(named)
        .width(w)
        .height(h)
      .add(pv.Wedge)
        .data(projects)
        .left(w / 2)
        .top(h / 2)
        .angle(function(d) { return angle(totals[d]); })
        .outerRadius(function(c, d) { return radius(data[c].length);})
        .fillStyle(color)
        .strokeStyle(function() { return this.fillStyle().darker();})
        .lineWidth(1)
        .event("mouseover", function(d, p) {
            $(legend_prefix + " ." + projectToClass(d)).addClass("highlit");
        })
        .event("mouseout", function(d, p) {
            $(legend_prefix + " ." + projectToClass(d)).removeClass("highlit");
        });

    vis.render();

    // Update the legend
    $(legend_prefix).empty();
    projects.reverse();
    projects.forEach(function(k) {
        var people = data[k].length, changes = totals[k];
        var style = "";
        if (color(k).color) {
            style = "style='color: " + color(k).color + "'";
        }
        $(legend_prefix).append("<span class='" + projectToClass(k) + "' " + style + ">" +
                                k + "(" + people +"p, " + changes  + "c)</span> ");
    });
}