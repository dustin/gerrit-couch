function(data) {
    // $.log(data)
    var app = $$(this).app;
    var md5 = app.require("vendor/couchapp/lib/md5");

    function gravatarURL(email, size) {
        return 'http://www.gravatar.com/avatar/' + md5.hex(email) +
            '.jpg?s=' + size + "&d=retro";
    }

    var items = data.rows.map(function(r) {
        var d = r.doc;
        d.actor.img = gravatarURL(d.actor.email, 32);
        if (d.change) {
            var commentParts = [];
            var approvals = [];
            for (var i = 0; d.approvals && i < d.approvals.length; ++i) {
                var a = d.approvals[i];
                if (a.value != '0') {
                    commentParts.push(a.description + ": " + a.value);
                    var theClass = (a.value < 0 ? "negative" : "positive");
                    if (a.type == 'VRIF') {
                        approvals.push('<img alt="' + a.value + '"' +
                                       ' src="images/VRIF' +
                                       (a.value > 0 ? "%2b" : "") + a.value + '.png"' +
                                      '/>');
                    } else if (a.type == 'CRVW') {
                        approvals.push('<span class="review ' + theClass + '">' +
                                       (a.value > 0 ? "+" : "") + a.value + '</span>');
                    }
                }
            }
            if (d.comment != '') {
                commentParts.push(d.comment);
            }
            d.extra = {
                'img': {'url': gravatarURL(d.change.owner.email, 20),
                        'alt': d.change.owner.email,
                        'title': d.change.owner.name},
                'comment': commentParts.join("\n"),
                'link': d.change.url,
                'linktext': d.change.subject
            };
            d.approvals_h = approvals.sort(function(a, b) {
                return (a.key > b.key) ? -1 : 1;
            });
            d.has_approvals = approvals.length > 1;
        }

        if (d.refUpdate) {
            d.extra = {
                linktext: 'branch "' + d.refUpdate.refName + '" was updated',
                link: 'http://review.membase.org/#q,status:open+project:' +
                    d.project + '+branch:' + d.refUpdate.refName + ',n,z'
            };
        }
        if (d.abandoner && d.reason) {
            d.extra.comment = d.reason;
        }
        d.when = d.ts;
        return d;
    });

    return {
        items: items, jsonified: JSON.stringify(items)
    };
};