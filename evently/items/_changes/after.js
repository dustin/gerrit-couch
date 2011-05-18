function(me, args) {
    var app = $$(this).app;
    $("#mergeattempts").show();
    $("#activity").show();
    $("#merges").show();
    $("#collaboration").show();
    updateTimestamps(app);
    updateViews(app);
}
