angular.module('service.export', ['service.tools']).service('Export', function($rootScope, $filter, Tools) {
    var exportData = [],
        fragment,
        progress = 0,
        total;
    this.g = function() {
        Tools.communicateSP($rootScope.sPort, new Buffer([0x36, 0x01]));
    };
    this.b = function(buf) {
        console.time('export');
        exportData = [];
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
                str = '';
            str += buf.toString('hex', start, start + 7) + ','; //cardid
            str += buf.toString('hex', start + 8, start + 10) + '-' + buf.toString('hex', start + 10, start + 11) + '-' + buf.toString('hex', start + 11, start + 12) + ' '; //yyyy-MM-dd
            str += buf.toString('hex', start + 12, start + 13) + ':' + buf.toString('hex', start + 13, start + 14) + ':' + buf.toString('hex', start + 14, start + 15); //HH:mm:ss
            exportData.push(str);
        }
        Tools.communicateSP($rootScope.sPort, new Buffer([0x36, 0x01, 0x63]));
        Tools.showLog('信息传输中,请勿断开! ' + progress + '/' + total);
    };
    this.s = function(buf) {
        for (var i = 0, len = total - progress; i < len; i++) {
            progress++;
            var start = fragment * i + 2,
                str = '';
            str += buf.toString('hex', start, start + 7) + ','; //cardid
            str += buf.toString('hex', start + 8, start + 9) + '-' + buf.toString('hex', start + 10, start + 11) + '-' + buf.toString('hex', start + 11, start + 12) + ' '; //yyyy-MM-dd
            str += buf.toString('hex', start + 12, start + 13) + ':' + buf.toString('hex', start + 13, start + 14) + ':' + buf.toString('hex', start + 14, start + 15); //HH:mm:ss
            exportData.push(str);
        }
        Tools.communicateSP($rootScope.sPort, new Buffer('5A04', 'hex'));
    };
    this.save = function(buf) {
        var filename = buf.readUInt16BE(2).toString() + ' ' + $filter('date')(new Date(), 'MM-dd');
        fs.writeFile('./AppData/' + filename + '.txt', exportData.join('\r\n'), 'utf8', function(err) {
            exportData = [];
            Tools.showLog('导出完毕! ' + progress + '/' + total);
            console.timeEnd('export');
        });
    };
});