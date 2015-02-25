angular.module('service.import', ['service.tools']).service('Import', function($rootScope, $filter, $timeout, Tools) {
    this.g = function(input) {
        if (!localStorage.getItem('$expo')) {
            return $rootScope.showDialog('未设置展会信息!');
        }
        if (!input._id) {
            return $rootScope.showDialog('无公司id');
        }
        var expo = angular.fromJson(localStorage.getItem('$expo')),
            buf02 = [new Buffer('5C02', 'hex'), new Buffer(12), new Buffer(4), new Buffer(1)],
            buf04 = [new Buffer('5C04', 'hex'), new Buffer(2), new Buffer(12)];
        buf02[1].write(expo._id, 'hex');
        buf02[2].write($filter('date')((new Date(expo.start_date)), 'yyyyMMdd'), 'hex');
        buf02[3].writeUInt8(Number(expo.duration) || 1, 0);
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, Buffer.concat(buf02));
        }, 100);
        buf04[1].writeUInt16BE(input.number || 0, 0);
        buf04[2].write(input._id, 'hex');
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, Buffer.concat(buf04));
        }, 200);
    };
    this.s = function(buf) {
        Tools.showLog('导入完成!');
    };
});