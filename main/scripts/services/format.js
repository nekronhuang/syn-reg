angular.module('service.format', ['service.tools']).service('Format', ['$rootScope','$cacheFactory', 'Tools',
    function($rootScope, $cacheFactory,Tools) {
        var myCache=$cacheFactory.get('myCache');
        this.c = function() {
            Tools.communicateSP($rootScope.sPort, Tools.indexInit());
        }
        this.s = function() {
            myCache.get('wPanel').scope().spWrite();
        }
    }
]);