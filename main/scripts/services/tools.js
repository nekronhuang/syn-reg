angular.module('service.tools', []).service('Tools', ['$rootScope', '$cacheFactory',
    function($rootScope, $cacheFactory) {
        var myCache = $cacheFactory.get('myCache');
        this.showLog = function(msg) {
            myCache.get('cPanel').scope().add({
                date: Date.now(),
                msg: msg
            });
        }
        this.communicateSP = function(port, value) {
            if (port) {
                var x = value.length,
                    y = -x,
                    v = Buffer.concat([new Buffer([0x23, x >> 8, x, y >>> 0 >> 8, y >>> 0]), value, new Buffer([0x25])]);
                port.write(v, function(err) {
                    if (err) return console.error('write', err);
                });
            } else {
                $rootScope.showDialog('未连接!');
                if ($rootScope.activePanel != 'sPanel') {
                    $rootScope.activePanel = 'sPanel';
                    myCache.get('sPanel').scope().active = 0;
                }
            }
        }
        this.indexInit = function() {
            if (!myCache.get('indexInit')) {
                var initArray = [
                        [0x35]
                    ],
                    settings = angular.fromJson(localStorage.getItem('$index'));
                for (var i = 0, len = settings.length; i < len; i++) {
                    var item = settings[i],
                        fnArray = new Array(4);
                    fnArray[0] = parseInt(item.start);
                    fnArray[1] = parseInt(item.end);
                    fnArray[2] = parseInt(item.fn + Number(item.aes.needInit).toString() + item.aes.type, 2);
                    fnArray[3] = parseInt(item.keyA + item.keyB, 2);
                    initArray.push(fnArray);
                }
                //default 12 + 0x35
                for (var i = 0, len = 13 - initArray.length; i < len; i++) {
                    initArray.push([255, 255, 0, 0]);
                }
                myCache.put('indexInit', new Buffer(initArray.reduce(function(a, b) {
                    return a.concat(b);
                })));
            }
            return myCache.get('indexInit');
        }
        this.renderData = function(obj, arr) {
            for (var i = 0, len = arr.length; i < len; i++) {
                var item = arr[i];
                if (obj[item.key]) {
                    item.value = obj[item.key];
                }
            }
        }
    }
]);