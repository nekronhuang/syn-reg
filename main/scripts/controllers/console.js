angular.module('controller.cPanel', []).controller('cPanelCtrl', function($scope,$cacheFactory) {
    var myCache = $cacheFactory.get('myCache');
    myCache.put('cPanel', $scope);
    $scope.info = [];
    $scope.add = function(info) {
        $scope.info.unshift(info);
        if ($scope.info.length > 20) {
            $scope.info.pop();
        }
        $scope.$digest();
    };
});