function(me, args) {
    var app = $$(this).app;
    $("#mergeattempts").show();
    $("#activity").show();
    $("#merges").show();
    updateTimestamps(app);
    updateViews(app);
}
