angular.module('service.parser', []).service('Parser', function() {
    var self = this,
        cache = new Buffer(512),
        nowLength,
        totalLength;
    clear();
    this.flow = false;

    this.normal = function(emitter, newBuffer) {
        newBuffer.copy(cache, nowLength);
        nowLength = nowLength + newBuffer.length;
        if (!totalLength) {
            var start = Array.prototype.indexOf.call(cache, 0x23);
            if (start >= 0) {
                var test = cache.readUInt16BE(start + 1),
                    verify = cache.readInt16BE(start + 3);
                if ((test + verify) == 0) {
                    totalLength = test;
                    if (start) {
                        cache.copy(cache, 0, start, nowLength);
                    }
                } else {
                    clear();
                }
            } else {
                clear();
            }
        }
        if (nowLength >= totalLength + 6) {
            if (cache[totalLength + 5] == 0x25) {
                if (self.flow) {
                    emitter.emit('flow', cache.slice(5, 5 + totalLength));
                } else {
                    emitter.emit('data', cache.slice(5, 5 + totalLength));
                }
            }
            clear();
        }
    };

    function clear() {
        nowLength = 0;
        totalLength = 0;
        cache.fill(0);
    };
});