angular.module('service.tools', []).service('Tools', function($window, $rootScope, $cacheFactory) {
    var myCache = $cacheFactory.get('myCache');
    this.showLog = function(msg) {
        myCache.get('cPanel').add({
            date: Date.now(),
            msg: msg
        });
    };
    this.communicateSP = function(port, value) {
        if (port) {
            var x = value.length,
                y = -x,
                v = Buffer.concat([new Buffer([0x23, x >> 8, x, y >>> 0 >> 8, y >>> 0]), value, new Buffer([0x25])]);
            //console.debug('communicate:', v.toString('hex'));
            port.write(v, function(err) {
                if (err) throw err;
            });
        } else {
            $rootScope.showDialog('未连接!');
            if ($rootScope.activePanel != 'sPanel') {
                $rootScope.activePanel = 'sPanel';
            }
        }
    };
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
            for (var i = 0, len = 13 - initArray.length; i < len; i++) {
                initArray.push([255, 255, 0, 0]);
            }
            myCache.put('indexInit', new Buffer(initArray.reduce(function(a, b) {
                return a.concat(b);
            })));
        }
        return myCache.get('indexInit');
    };
    var fork = require('child_process').fork,
        // barcode = fork(path.dirname(process.execPath) + '/main/scripts/workers/barcode.js'),
        // laser = fork(path.dirname(process.execPath) + '/main/scripts/workers/laser.js'),
        rc = fork(path.dirname(process.execPath) + '/main/scripts/workers/rc.js');
    // barcode.on('message', function(msg) {
    //     $rootScope.$broadcast('fork', msg);
    // });
    // this.communicateBarcode = function(para) {
    //     barcode.send(para);
    // };
    // laser.on('message', function(msg) {
    //     console.log(msg);
    // });
    // this.communicateLaser = function(para) {
    //     laser.send(para);
    // };
    rc.on('message', function(msg) {
        $rootScope.$broadcast('rc', msg);
    });
    this.communicateRC = function(para) {
        rc.send(para);
    };
});