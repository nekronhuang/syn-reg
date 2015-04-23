angular.module('service.read', ['service.tools']).service('Read', function($rootScope, $cacheFactory, Tools) {
    var myCache=$cacheFactory.get('myCache');
    this.g = function() {
        Tools.communicateSP($rootScope.sPort, new Buffer([0x32]));
    };
    this.s = function(buf) {
        var data = buf.toString('utf8',2).replace(/\0/g, '');
        if (data=='') {
            Tools.showLog('读取完成,该卡为空!');
            return;
        }
        console.log(data);
        myCache.get('wPanel').render(data);
        Tools.showLog('读取完成!');
    };
});