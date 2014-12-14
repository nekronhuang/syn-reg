angular.module('service.export', ['service.tools']).service('Export', ['$rootScope', 'Tools',
    function($rootScope, Tools) {
        var exportData = '';
        this.g = function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('6'));
        }
        this.b = function(buf) {
            for (var i = 0, len = buf[2]; i < len; i++) {
                var now = buf.slice(16 * i + 3, 16 * i + 19),
                    cardid = now.toString('hex', 0, 7),
                    time = '20';
                time += now.toString('hex', 8, 9) + '-' + now.toString('hex', 9, 10) + '-' + now.toString('hex', 10, 11) + ' ';
                time += now.toString('hex', 11, 12) + ':' + now.toString('hex', 12, 13) + ':' + now.toString('hex', 13, 14);
                exportData += parseInt(cardid, 16).toString() + ',' + time + '\r\n';
            }
            setTimeout(function() {
                Tools.communicateSP($rootScope.sPort, new Buffer('6c'));
            }, 100);
            Tools.showLog('信息传输中,请勿断开!');
        }
        this.s = function(buf) {
            var filename = buf.slice(2, 26).toString();
            fs.appendFile('./AppData/' + filename + '.txt', exportData, 'utf8', function(err) {
                exportData = '';
                Tools.showLog('导出完毕!');
            });
        }
    }
]);