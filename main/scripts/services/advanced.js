angular.module('service.advanced', ['service.tools']).service('Advanced', ['$rootScope', 'Tools',
    function($rootScope, Tools) {
        this.g = function(hex) {
            Tools.communicateSP($rootScope.sPort, new Buffer(hex, 'hex'));
        }
        this.g9 = function() {
            Tools.communicateSP($rootScope.sPort, new Buffer('9'));
        }
        this.g5 = function() {}
        this.s9 = function() {
            Tools.showLog('清除完成!');
        }
    }
]);