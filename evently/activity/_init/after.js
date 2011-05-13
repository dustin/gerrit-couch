function(me, args) {
    var app = $$(this).app;

    var types = [
        "patchset-created",
        "comment-added",
        "change-merged",
        "ref-updated",
        "change-abandoned"
    ];
    // Look up the colors from the CSS (as applied on the page).
    // We will use these to draw the graph
    var colors = {};
    for (var i = 0; i < types.length; ++i) {
        colors[types[i]] = $('.' + types[i]).css('color');
    }

    var ymax = 0;

    // Compute the daily max
    me.rows.forEach(function (r) {
        var sum = 0;
        for (var k in r.value) {
            sum += r.value[k];
        }
        ymax = Math.max(sum, ymax);
    });

    var dateMap = {};
    for (var i = 0; i < me.rows.length; ++i) {
        dateMap[me.rows[i].key[0]] = i;
    }

    /* Sizing and scales. */
    var w = $('#activity').width() - 40,
        h = 150,
        x = pv.Scale.linear(0, me.rows.length - 1).range(0, w),
        y = pv.Scale.linear(0, ymax).range(0, h);

    /* The root panel. */
    var vis = new pv.Panel()
        .canvas('activitychart')
        .width(w)
        .height(h)
        .bottom(20)
        .left(20)
        .right(10)
        .top(5);

    /* X-axis and ticks. */
    vis.add(pv.Rule)
        .data(me.rows)
        .bottom(-5)
        .height(0)
        .left(function() { return x(this.index); })
      .anchor("bottom").add(pv.Label)
        .textStyle("#aaa")
        .text(function(d) {
            var a = d.key[0].split('-');
            return parseInt(a[1]) + '-' + parseInt(a[2]);
        });

    vis.add(pv.Layout.Stack)
        .offset("wiggle")
        .layers(types)
        .values(me.rows)
        .x(function(d) { return x(dateMap[d.key[0]]); })
        .y(function(d, p) { return y(d.value[p] || 0);})
      .layer.add(pv.Area)
        .event("mouseover", function(d, p) {
            $("#activity .legend ." + p).addClass("highlit");
        })
        .event("mouseout", function(d, p) {
            $("#activity .legend ." + p).removeClass("highlit");
        })
        .cursor("pointer")
        .fillStyle(function(d, p) { return colors[p];})
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
    var mostRecent = me.rows[me.rows.length - 1].value;
    types.forEach(function(k) {
        var val = mostRecent[k] || 0;
        $('#activity .legend .' + k).text(k + "(" + val+ ")");
    });
}