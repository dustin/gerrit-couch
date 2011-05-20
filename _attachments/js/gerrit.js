function parseISO8601(timestamp) {
    var regex = new RegExp("^([\\d]{4})-([\\d]{2})-([\\d]{2})T([\\d]{2}):([\\d]{2}):([\\d]{2})$");
    var matches = regex.exec(timestamp);
    if(matches != null) {
        return new Date(
            Date.UTC(
                parseInt(matches[1], 10),
                parseInt(matches[2], 10) - 1,
                parseInt(matches[3], 10),
                parseInt(matches[4], 10),
                parseInt(matches[5], 10),
                parseInt(matches[6], 10)
            )
        );
    }
    return null;
}

// Mostly stolen from utils, but my timestamps are slightly different.
function myPretty(ts) {
    var date = parseISO8601(ts),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if (isNaN(day_diff)) return ts;
    return day_diff < 1 && (
        diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "yesterday" ||
        day_diff < 21 && day_diff + " days ago" ||
        day_diff < 45 && Math.ceil( day_diff / 7 ) + " weeks ago" ||
        time;
}

var colorMemo = {};

function projectColorizer(a) {
    var def = pv.Colors.category19().by(function(d) {return d;});
    function rv(x) {
        if (!colorMemo[x]) {
            colorMemo[x] = def(x);
        }
        return colorMemo[x];
    };

    if (a) {
        var elements = a.slice(0);
        elements.sort();
        elements.forEach(rv);
    }

    return rv;
}

function showStreamGraph(canv, legend_prefix, rows, color) {
    var projects = [];
    var dateMap = {};
    var ymax = 0;
    rows.forEach((function(r) {
        var sum = 0;
        dateMap[r.key[r.key.length-1]] = r.value;
        for (var k in r.value) {
            if (projects.indexOf(k) == -1) {
                projects.push(k);
            }
            sum += r.value[k];
        }
        ymax = Math.max(sum, ymax);
    }));
    projects.sort();

    if (!color) {
        color = projectColorizer(projects);
    }

    var dateList = rows.map(function(r) { return r.key[r.key.length-1]; });

    /* Sizing and scales. */
    var w = $('#merges').width() - 40,
        h = 150,
        x = pv.Scale.linear(0, dateList.length - 1).range(0, w),
        y = pv.Scale.linear(0, ymax).range(0, h);

    /* The root panel. */
    var vis = new pv.Panel()
        .canvas(canv)
        .width(w)
        .height(h)
        .bottom(20)
        .left(20)
        .right(10)
        .top(5);

    /* X-axis and ticks. */
    vis.add(pv.Rule)
        .data(x.ticks())
        .bottom(-5)
        .height(0)
        .left(function(n) { return x(n); })
        .anchor("bottom").add(pv.Label)
        .textStyle("#aaa")
        .visible(function(d) { return d == Math.ceil(d); })
        .text(function(d) {
            var a = dateList[d].split('-');
            return parseInt(a[1]) + '-' + parseInt(a[2]);
        });

    vis.add(pv.Layout.Stack)
        .offset("wiggle")
        .layers(projects)
        .values(dateList)
        .order("inside-out")
        .x(function(d) { return x(dateList.indexOf(d));})
        .y(function(d, p) {
            var rv = (dateMap[d] || {})[p] || 0;
            return y(rv);})
        .layer.add(pv.Area)
        .event("mouseover", function(d, p) {
            $(legend_prefix + " ." + p).addClass("highlit");
        })
        .event("mouseout", function(d, p) {
            $(legend_prefix + " ." + p).removeClass("highlit");
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
    var mostRecent = dateMap[dateList[dateList.length - 1]];
    $(legend_prefix).empty();
    projects.forEach(function(k) {
        var val = mostRecent[k] || 0;
        var style = "";
        if (color(k).color) {
            style = "style='color: " + color(k).color + "'";
        }
        $(legend_prefix).append("<span class='" + k + "' " + style + ">" +
                                k + "(" + val + ")</span> ");
    });
}

function refreshTimestamps() {
    updateTimestamps();
    setTimeout(refreshTimestamps, 60000);
}

function updateTimestamps(app) {
    $('.timestamp').each(function() {
        $(this).text(myPretty($(this).attr("title")));
    });
}

function updateViews(app) {
    $("#activitychart").evently("activity", app);
    $("#mergechart").evently("merges", app);
    $("#collaborationchart").evently("collaboration", app);
    $("#activity").show();
    $("#merges").show();
    $("#collaboration").show();

    $("#loading").hide();
    $("#footer").show();
}