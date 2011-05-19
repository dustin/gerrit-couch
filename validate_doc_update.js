function (newDoc, oldDoc, userCtx, secObj) {
    var v = require("vendor/couchapp/lib/validate").init(newDoc, oldDoc, userCtx, secObj);

    if (!v.isAdmin()) {
        log("UNAUTHORIZED MODIFICATION: " + newDoc._id + " as " + JSON.stringify(userCtx));
        v.forbidden("Only admin can prevent forest fires.");
    }
}
