angular.module('service.format', ['service.tools']).service('Format', function($rootScope, $cacheFactory, Tools) {
    var myCache = $cacheFactory.get('myCache');
    this.c = function() {
        Tools.communicateSP($rootScope.sPort, Tools.indexInit());
    }
    this.s = function() {
        if ($rootScope.onForamt) {
            alert('放卡');
            Tools.communicateSP($rootScope.sPort, Tools.indexInit());
        } else {
            angular.element('#wPanel').scope().spWrite();
        }
    }
});