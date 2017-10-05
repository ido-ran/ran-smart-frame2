from google.appengine.ext import ndb

def default_json_serializer(obj):
    """Default JSON serializer."""
    import calendar, datetime

    if isinstance(obj, datetime.datetime):
        if obj.utcoffset() is not None:
            obj = obj - obj.utcoffset()
        millis = int(
            calendar.timegm(obj.timetuple()) * 1000 +
            obj.microsecond / 1000
        )
        return millis
    raise TypeError('Not sure how to serialize %s' % (obj,))

# I'll use this method to serialize objects instead of the complex json.dumps.
# this seem to be more compsable, still not the best.
def clone_for_json(obj):
    import calendar, datetime
    clone = obj.to_dict()
    for attr, val in clone.items():
        # logging.info("attr {0} type:{1}".format(attr, type(val)))
        if (isinstance(val, datetime.datetime)):
            clone[attr] = int(
                calendar.timegm(val.timetuple()) * 1000 +
                val.microsecond / 1000
            )
        elif (isinstance(val, ndb.Key)):
            clone[attr] = val.id()

    # Add the entity numeric id.
    clone['id'] = obj.key.id()
    return clone
