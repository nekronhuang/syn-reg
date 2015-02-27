angular.module('service.advanced', ['service.tools']).service('Advanced', function($rootScope, Tools, $timeout) {
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
            Tools.communicateSP($rootScope.sPort, new Buffer('5C000000', 'hex'));
        }, 300);
        $timeout(function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('5000CF010010', 'hex'));
        }, 400);
    };
});