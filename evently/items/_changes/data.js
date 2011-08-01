function(data) {
    // $.log(data)
    var app = $$(this).app;
    var md5 = app.require("vendor/couchapp/lib/md5");

    function avatarURL(email, size) {
        return 'http://cdn.libravatar.org/avatar/' + md5.hex(email) +
            '.jpg?s=' + size + "&d=retro";
    }

    var items = data.rows.map(function(r) {
        var d = r.doc;
        d.actor.img = avatarURL(d.actor.email, 32);
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
                'img': {'url': avatarURL(d.change.owner.email, 20),
                        'alt': d.change.owner.email,
                        'title': d.change.owner.name},
                'comment': commentParts.join("\n"),
                'link': d.change.url,
                'linktext': d.change.subject
            };
            d.approvals_h = approvals.sort(function(a, b) {
                return (b.key > a.key) ? -1 : 1;
            });
            d.has_approvals = approvals.length > 0;
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

        var seenUsers = { };
    var users = [ ];
    data.rows.forEach(function(r) {
        var d = r.doc;
        if (!seenUsers[d.actor.email]) {
            seenUsers[d.actor.email] = true;

            var user = d.actor;
            user.url = avatarURL(d.actor.email, 32);
            users.push(user);
        }
    });

    return {
        items: items, users: users, jsonified: JSON.stringify(items)
    };
};