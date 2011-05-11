#!/usr/bin/env python
#
# Run this under a supervisor to make the stream go from gerrit to a
# couchdb.
#
# Set the following environment variables to make for useful:
#
#  COUCH_SERVER - url to CouchDB ( e.g. http://localhost:5984/ )
#  COUCH_DB     - db to contain the stuff (e.g. gerrit)
#  GERRIT_HOST  - hostname of review server (e.g. review.membase.org)
#

import os
import sys
import json
import time
import traceback
import subprocess

import couchdb

db = couchdb.Server(os.getenv('COUCH_SERVER'))[os.getenv('COUCH_DB')]

p = subprocess.Popen(['ssh', '-p', '29418',
                      '-oServerAliveInterval=5', os.getenv("GERRIT_HOST"),
                      'gerrit', 'stream-events'], stdout=subprocess.PIPE)

while True:
    line = p.stdout.readline()
    try:
        doc = json.loads(line)
        doc['ts'] = time.strftime("%Y-%m-%dT%H:%M:%S")
        print "Got", doc
        db.create(doc)
    except:
        print "Error processing", repr(line)
        traceback.print_exc()
        sys.exit(1)
