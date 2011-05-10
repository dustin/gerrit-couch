function(data) {
    // $.log(data)
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
        return d;
    });

    return {
        items: items, jsonified: JSON.stringify(items)
    };
};