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