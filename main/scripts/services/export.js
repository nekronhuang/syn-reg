angular.module('service.export', ['service.tools']).service('Export', ['$rootScope', 'Tools',
    function($rootScope, Tools) {
        var exportData = '',
            fragment,
            progress = 0,
            total;
        this.g = function() {
            Tools.communicateSP($rootScope.sPort, new Buffer([0x36, 0x01]));
        };
        this.b = function(buf) {
            console.time('export');
            fragment = buf[2];
            progress = 0;
            total = buf.readUInt32BE(3);
            Tools.communicateSP($rootScope.sPort, new Buffer([0x36, 0x01, 0x63]));
            Tools.showLog('信息传输中,请勿断开! ' + progress + '/' + total);
        };
        this.c = function(buf) {
            for (var i = 0, len = (buf.length - 2) / fragment; i < len; i++) {
                progress++;
                var start = fragment * i + 2,
                    end = start + fragment;
                var now = buf.toString('hex', start, end);
            }
            Tools.communicateSP($rootScope.sPort, new Buffer([0x36, 0x01, 0x63]));
            Tools.showLog('信息传输中,请勿断开! ' + progress + '/' + total);
        };
        this.s = function(buf) {
            for (var i = 0, len = total - progress; i < len; i++) {
                progress++;
                var start = fragment * i + 2,
                    end = start + fragment;
                var now = buf.toString('hex', start, end);
            }
            Tools.showLog('导出完毕! ' + progress + '/' + total);
            console.timeEnd('export');
            // var filename = buf.slice(2, 26).toString();
            // fs.appendFile('./AppData/' + filename + '.txt', exportData, 'utf8', function(err) {
            //     exportData = '';
            //     Tools.showLog('导出完毕!');
            // });
        }
    }
]);