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

function showBarChart(named, data, total) {
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

    var w = Math.max(150, $('#' + named).width() - 40);
    var barWidth = Math.max(20, Math.min(40, (w / labels.length) + 5));
    var h = 150;

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
        .left(5)
        .right(6);

    vis.render();
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
    $("#mergeattempt").evently("mergeattempt", app);
    $("#activitychart").evently("activity", app);
    $("#mergechart").evently("merges", app);
}