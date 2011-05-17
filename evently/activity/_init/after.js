function(me, args) {
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

    showStreamGraph('activitychart', '#activity .legend', me.rows,
                    function(d) { return colors[d]; });

}