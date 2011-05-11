function(data) {
    // $.log(data)
    var app = $$(this).app;
    var md5 = app.require("vendor/couchapp/lib/md5");
    var ownerPos = {
        'comment-added': 'author',
        'change-merged': 'submitter',
        'patchset-created': 'uploader',
        'change-abandoned': 'abandoner',
        'change-restored': 'restorer',
        'ref-updated': 'submitter'
    };

    var items = data.rows.map(function(r) {
        var d = r.value;
        d.actor = d[ownerPos[d.type]];
        d.actor.short_name = d.actor.name.split(' ')[0];
        if (d.change) {
            d.project = d.change.project;
        } else if(d.refUpdate) {
            d.project = d.refUpdate.project;
        }
        d.actor.img = 'http://www.gravatar.com/avatar/' + md5.hex(d.actor.email) + '.jpg?s=32';
        if (d.change) {
            var commentParts = [];
            for (var i = 0; d.approvals && i < d.approvals.length; ++i) {
                var a = d.approvals[i];
                if (a.value != '0') {
                    commentParts.push(a.description + ": " + a.value);
                }
            }
            if (d.comment != '') {
                commentParts.push(d.comment);
            }
            d.extra = {
                'comment': commentParts.join("\n"),
                'link': d.change.url,
                'linktext': d.change.subject
            };
            d.typetitle = commentParts.join("\n");
        }

        if (d.refUpdate) {
            d.extra = {
                linktext: 'branch "' + d.refUpdate.refName + '" was updated',
                link: 'http://review.membase.org/#q,status:open+project:' +
                    d.project + '+branch:' + d.refUpdate.refName + ',n,z'
            };
        }
        return d;
    });

    return {
        items: items, jsonified: JSON.stringify(items)
    };
};