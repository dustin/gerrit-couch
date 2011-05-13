function(me, args) {
    var isChecked = $('#should_show_details:checked').val();
    var newval = isChecked ? "block" : "none";
    $('.extra-detail').css('display', newval);
    var app = $$(this).app;
    $("#mergeattempts").show();
    $("#activity").show();
    $("#merges").show();
    updateTimestamps(app);
    updateViews(app);
}
