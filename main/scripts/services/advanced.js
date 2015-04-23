angular.module('service.advanced', ['service.tools']).service('Advanced', function($rootScope,$cacheFactory, Tools, $timeout) {
    var myCache = $cacheFactory.get('myCache');
    this.g = function(hex) {
        Tools.communicateSP($rootScope.sPort, new Buffer(hex, 'hex'));
    };
    this.g9 = function() {
        Tools.communicateSP($rootScope.sPort, new Buffer('9'));
    };
    this.s9 = function() {
        Tools.showLog('清除完成!');
    };
    this.init = function() {
        Tools.communicateSP($rootScope.sPort, new Buffer('50EEEF000101', 'hex')); //机器功能
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('50E0E0020C0401', 'hex')); //展会02+id+start_date+duration
        }, 100);
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('50E1E104020C', 'hex')); //展商04+number+id
        }, 200);
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('5C000305', 'hex'));
        }, 300);
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('5000CF010010', 'hex'));
        }, 400);
    };
    this.auth = function(buf) {
        var range;
        for (var i = 0; i < 12; i++) {
            var b = buf.slice(i * 4, i * 4 + 4);
            if (b[2] >> 3 == 4) {
                range = [b[0], b[1]];
                break;
            }
        }
        if (range) {
            var arr = myCache.get('wPanel').info.auth,
                str = '',
                temp = [],
                target = new Buffer(1),
                block = new Buffer(16);
            for (var i = 0, len = arr.length; i < len; i++) {
                if (arr[i]) {
                    str += arr[i];
                }
            }
            for (var i = 0, len = str.length / 8; i < len; i++) {
                temp.push(parseInt(str.substring(i * 8, i * 8 + 8), 2));
            }
            var j = 0,
                max = Math.ceil(temp.length / 16);
            for (var start = range[0] * 4, end = range[1] * 4; start <= end; start++) {
                block.fill(0);
                target.writeUInt8(start, 0);
                if (j >= max) {
                    break;
                }
                (new Buffer(temp.slice(j * 16, j * 16 + 16))).copy(block);
                var command = [
                    new Buffer('42', 'hex'),
                    target,
                    block
                ];
                Tools.communicateSP($rootScope.sPort, Buffer.concat(command));
                j++;
            }
        } else {
            $rootScope.showDialog('该卡无权限功能!');
        }
    };
});