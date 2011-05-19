function(me, args) {
    var app = $$(this).app;
    $("#activity").show();
    $("#merges").show();
    $("#collaboration").show();
    updateTimestamps(app);
    updateViews(app);
}
