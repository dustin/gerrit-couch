function(me, args) {
    var app = $$(this).app;

    var data = [];
    var total_items = 0;
    for (var i = 0; i < me.rows.length; ++i) {
        data[me.rows[i].key] = me.rows[i].value;
        total_items += me.rows[i].value;
    }

    showBarChart('mergeattempt', data, total_items);
}