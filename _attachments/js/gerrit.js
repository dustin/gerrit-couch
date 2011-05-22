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
    var def = d3.scale.category20b();
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

function projectToClass(n) {
    return n.replace(/\//g, '-');
}

function showStreamGraph(canv, legend_prefix, rows, color) {
    var projects = [];
    var dateMap = {};
    rows.forEach((function(r) {
        var sum = 0;
        dateMap[r.key[r.key.length-1]] = r.value;
        for (var k in r.value) {
            if (projects.indexOf(k) == -1) {
                projects.push(k);
            }
            sum += r.value[k];
        }
    }));
    projects.sort();

    var keys = rows.map(function(r) { return r.key[r.key.length - 1]; });
    var values = projects.map(function(p) {
        return rows.map(function(r) {
            return r.value[p] || 0;
        }).map(function(d, i) {
            return { x: i, y: d};
        });});
    var data = d3.layout.stack().offset("wiggle")(values);

    var ymax = d3.max(data, function(d) {
        return d3.max(d, function(d) {
            return d.y0 + d.y;
        });
    });

    if (!color) {
        color = projectColorizer(projects);
    }

    /* Sizing and scales. */
    var w = $('#merges').width() - 40,
        h = 150,
        lmargin = 20, bmargin = 15,
        uh = h - bmargin; // usable height

    var area = d3.svg.area()
        .x(function(d, p) { return p * w / keys.length + lmargin; })
        .y0(function(d, p) { return uh - d.y0 * uh / ymax; })
        .y1(function(d, p) { return uh - (d.y + d.y0) * uh / ymax; });

    $('#' + canv).empty(); // Haven't quite figured out how to do this with D3
    var vis = d3.select('#' + canv)
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var x = d3.scale.linear()
        .domain([0, keys.length - 1])
        .range([0, w]);
    var y = d3.scale.linear()
        .domain([0, ymax])
        .range([uh, 0]);

    vis.selectAll(".xlabel")
        .data(x.ticks(4))
      .enter().append("svg:text")
        .attr('class', "xlabel")
        .attr("x", x)
        .attr("y", uh)
        .attr("dx", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) {
            if (keys[d]) {
                var a = keys[d].split('-');
                return parseInt(a[1]) + '-' + parseInt(a[2]);
            } else {
                return '';
            }});

    vis.selectAll(".ylabel")
        .data(y.ticks(4))
      .enter().append("svg:text")
        .attr('class', "ylabel")
        .attr("x", lmargin)
        .attr("y", y)
        .attr("dx", -3)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(function(d) { return d > 0 ? String(d) : ""; });

    vis.selectAll("path")
        .data(data)
      .enter().append("svg:path")
        .attr("fill", function(d, p) { return color(projects[p]); })
        .attr("d", area)
        .on("mouseover", function(d, p) {
            $(legend_prefix + " ." + projectToClass(projects[p])).addClass("highlit");
        })
        .on("mouseout", function(d, p) {
            $(legend_prefix + " ." + projectToClass(projects[p])).removeClass("highlit");
        });

    // Update the legend
    var mostRecent = dateMap[keys[keys.length - 1]];
    $(legend_prefix).empty();
    projects.forEach(function(k) {
        var val = mostRecent[k] || 0;
        var style = "style='color: " + color(k) + "'";
        $(legend_prefix).append("<span class='" + projectToClass(k) + "' " + style + ">" +
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