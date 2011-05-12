function(me, args) {
    var app = $$(this).app;

    var projects = [];
    me.rows.forEach((function(r) {
        if (projects.indexOf(r.key[1]) == -1) {
            projects.push(r.key[1]);
        }
    }));
    projects.sort();

    var dateMap = {};
    var dateList = [];
    for (var i = 0; i < me.rows.length; ++i) {
        var d = me.rows[i].key[0];
        if (!dateMap[d]) {
            dateList.push(d);
        }
        var ob = (dateMap[d] || [undefined, {}])[1];
        ob[me.rows[i].key[1]] = me.rows[i].value;
        dateMap[d] = [i, ob];
    }

    var ymax = 0;
    for (var d in dateMap) {
        var sum = 0;
        for (var k in dateMap[d][1]) {
            sum += dateMap[d][1][k];
        }
        ymax = Math.max(sum, ymax);
    }

    /* Sizing and scales. */
    var w = $('#merges').width() - 40,
        h = 150,
        x = pv.Scale.linear(0, dateList.length - 1).range(0, w),
        y = pv.Scale.linear(0, ymax).range(0, h),
        color = pv.Colors.category19().by(function(d) { return d;});


    /* The root panel. */
    var vis = new pv.Panel()
        .canvas('mergechart')
        .width(w)
        .height(h)
        .bottom(20)
        .left(20)
        .right(10)
        .top(5);

    /* X-axis and ticks. */
    vis.add(pv.Rule)
        .data(dateList)
        .bottom(-5)
        .height(0)
        .left(function() { return x(this.index); })
      .anchor("bottom").add(pv.Label)
        .textStyle("#aaa")
        .text(function(d) {
            var a = d.split('-');
            return parseInt(a[1]) + '-' + parseInt(a[2]);
        });

    vis.add(pv.Layout.Stack)
        .offset("wiggle")
        .layers(projects)
        .values(dateList)
        .x(function(d) { return x(dateList.indexOf(d));})
        .y(function(d, p) {
            var rv = (dateMap[d] || [0, {}])[1][p] || 0;
            return y(rv);})
      .layer.add(pv.Area)
        .event("mouseover", function(d, p) {
            $("#merges .legend .proj-" + p).addClass("highlit");
        })
        .event("mouseout", function(d, p) {
            $("#merges .legend .proj-" + p).removeClass("highlit");
        })
        .cursor("pointer")
        .fillStyle(function(d, p) { return color(p); })
        .strokeStyle(function() { return this.fillStyle().alpha(.5);});

    /* Y-axis and ticks. */
    vis.add(pv.Rule)
        .data(y.ticks(3))
        .visible(function() { return this.index > 0; })
        .bottom(y)
        .strokeStyle("rgba(128,128,128,0)")
      .anchor("left").add(pv.Label)
        .textStyle("#aaa")
        .text(y.tickFormat);

    vis.render();

        // Update the legend
    var mostRecent = dateMap[dateList[dateList.length - 1]][1];
    $("#merges .legend").empty();
    projects.forEach(function(k) {
        var val = mostRecent[k] || 0;
        $('#merges .legend').append("<span class='proj-" + k + "' style='color: "
                                    + color(k).color + "'>" + k + "(" + val+ ")</span> ");
    });
}
