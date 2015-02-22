angular.module('service.read', ['service.tools']).service('Read', ['$rootScope', '$cacheFactory', 'Tools',
    function($rootScope, $cacheFactory, Tools) {
        var myCache = $cacheFactory.get('myCache');
        this.g = function() {
            var length = 100,
                percent = 80;
            Tools.communicateSP($rootScope.sPort, new Buffer([0x32, length >> 8, length & 255, percent]));
        }
        this.s = function(buf) {
            if(!localStorage.getItem('$infoSections')){
                return $rootScope.showDialog('请先初始化!');
            }
            var sections = parseInt(localStorage.getItem('$infoSections')),
                data = buf.slice(0, 48 * sections).toString().replace(/\0/g, '');
            arr = [],
            read = {};
            if (isEmpty(buf,sections)) {
                Tools.showLog('读取完成,该卡为空!');
                return;
            }
            myCache.get('wPanel').scope().render(data.substring(2));
            Tools.showLog('读取完成!');
        }
        function isEmpty(buf,sections) {
            var blank = new Buffer([20, 28, 241, 185, 223, 142, 227, 250, 128, 136, 12, 105, 64, 228, 173, 99]).toString();
            for (var i = 0, len = sections * 48 / 16; i < len; i++) {
                if (buf.toString('utf8', 16 * i + 2, 16 * i + 18) != blank) {
                    return false;
                }
            }
            return true;
        }
    }
]);