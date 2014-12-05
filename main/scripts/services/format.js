angular.module('service.format', ['service.tools']).service('Format', ['$rootScope','$cacheFactory', 'Tools',
    function($rootScope, $cacheFactory,Tools) {
        var myCache=$cacheFactory.get('myCache');
        this.s = function() {
            if($rootScope.onForamt){
                alert('放卡');
                Tools.communicateSP($rootScope.sPort, Tools.indexInit());
            }else{
                myCache.get('wPanel').scope().spWrite();
            }
        }
    }
]);