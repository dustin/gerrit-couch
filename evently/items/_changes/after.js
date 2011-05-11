function(me, args) {
    var isChecked = $('#should_show_details:checked').val();
    var newval = isChecked ? "block" : "none";
    $('.extra-detail').css('display', newval);
    var app = $$(this).app;
    $("#mergeattempt").evently("mergeattempt", app);
    $("#mergeattempts").show();
}
