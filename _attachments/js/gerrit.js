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

function showStreamGraph(canv, legend_prefix, rows, color, clickHandler) {
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
        .on("click", function(d, p) {
            clickHandler(projects[p]);
        })
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

function showActivityChart(app) {
    var types = [
        "patchset-created",
        "comment-added",
        "change-merged",
        "ref-updated",
        "change-abandoned",
        "change-restored"
    ];
    // Look up the colors from the CSS (as applied on the page).
    // We will use these to draw the graph
    var colors = {};
    for (var i = 0; i < types.length; ++i) {
        colors[types[i]] = $('.' + types[i]).css('color');
    }

    app.view('activity', {reduce: true, group_level: 1,
                          success: function(r) {
                              showStreamGraph('activitychart',
                                              '#activity .legend', r.rows,
                                              function(d) { return colors[d]; },
                                             function() {});
                          }});
}

function gotoProject(projectName) {
    window.history.pushState(projectName);
    window.location.hash = projectName;
    window.location.reload(true);
}

function drawCollaborationChart(rows) {
    var data = {}, totals = {}, projects = [];
    var ymax = 0, collab_max = 0, total = 0;
    rows.forEach(function (r) {
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

    var angle = d3.scale.linear().domain([0, total]).range([0, Math.PI * 2]);
    var named = 'collaborationchart';
    var w = $('#' + named).width();
    var h = w;
    var radius = d3.scale.linear().domain([0, collab_max]).range([0, (w / 2)]);
    var color = projectColorizer(projects);
    var s = d3.scale.linear().domain([0, collab_max]).range([0, 20]);
    var legend_prefix = '#collaboration .legend';

    var prev = 0;
    var angles = {};
    var collab_levels = [];
    // Initialize collab_levels -- map skips undefined vals.  :(
    for (var i = 0; i < collab_max; ++i) { collab_levels.push(0); }
    projects.forEach(function(p) {
        var a = angle(totals[p]);
        angles[p] = [prev, prev + a];
        collab_levels[data[p].length] = Math.max(totals[p] + (collab_levels[data[p].length] || 0));
        prev += a;
    });

    // Index the collaboration levels and remove 0 (since that's not helpful)
    collab_levels = collab_levels.map(function(a, i) { return [i, a || 0, a || 0]; }).slice(1);
    // Accumulate collaboration levels with the ones below
    for (var i = 0; i < collab_levels.length; ++i) {
        for (var j = i - 1; j >= 0; --j) {
            collab_levels[j][1] += collab_levels[i][1];
        }
    }
    prev = 0;
    var collab_angles = collab_levels.map(function(l) {
        var rv = [l[0], prev, prev + l[1]];
        prev += l[2];
        return rv;
    });

    $('#' + named).empty(); // Haven't quite figured out how to do this with D3
    var vis = d3.select('#' + named)
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
      .append("svg:g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    var arc = d3.svg.arc()
        .startAngle(function(d) { return angles[d][0]; })
        .endAngle(function(d) { return angles[d][1]; })
        .outerRadius(function(c, d) { return radius(data[c].length);});

    var arcLines = d3.svg.arc()
        .startAngle(function(d, p) { return angle(d[1]); })
        .endAngle(function(d, p) { return angle(d[2]); })
        .outerRadius(function(d, p) { return radius(d[0]);});

    vis.selectAll(".lines")
        .data(collab_angles)
      .enter().append("svg:path")
        .attr("class", "lines")
        .attr("d", arcLines);

    vis.selectAll(".slices")
        .data(projects)
      .enter().append("svg:path")
        .attr("class", "slices")
        .attr("d", arc)
        .attr('fill', function(p) { return color(p); })
        .on('click', function(d, p) {
            gotoProject(d);
        })
        .on('mouseover', function(d, p) {
            $(legend_prefix + " ." + projectToClass(d)).addClass("highlit");
        })
        .on('mouseout', function(d, p) {
            $(legend_prefix + " ." + projectToClass(d)).removeClass("highlit");
        });

    // Update the legend
    $(legend_prefix).empty();
    projects.reverse();
    projects.forEach(function(k) {
        var people = data[k].length, changes = totals[k];
        var style = "style='color: " + color(k) + "'";
        $(legend_prefix).append("<span class='" + projectToClass(k) + "' " + style + ">" +
                                k + "(" + people +"p, " + changes  + "c)</span> ");
    });
}

function showCollaborationChart(app) {
    app.view('contributor', {reduce: true, group_level: 1,
                             success: function(r) {
                                 drawCollaborationChart(r.rows);
                             }});
}

function showMergeChart(app) {
    app.view('by-activity', {reduce: true, group_level: 3,
                             startkey: ["change-merged"], endkey: ["change-merged", {}],
                             success: function(r) {
                                 var data = [];
                                 var prev = undefined;
                                 var offset = -1;
                                 r.rows.forEach(function(r) {
                                     var k = [r.key[0], r.key[1]];
                                     if (prev === undefined || k[0] != prev[0] || k[1] != prev[1]) {
                                         prev = k;
                                         ++offset;
                                         data.push({key: k, value: {}});
                                     }
                                     data[offset].value[r.key[2]] = r.value;
                                 });
                                 showStreamGraph('mergechart', "#merges .legend", data, null, gotoProject);
                             }});
}

function updateViews(app) {
    showActivityChart(app);
    showCollaborationChart(app);
    showMergeChart(app);
    $("#activity").show();
    $("#merges").show();
    $("#collaboration").show();

    $("#loading").hide();
    $("#footer").show();

    window.onpopstate = function(event) {
        window.location.reload(true);
    };
}
