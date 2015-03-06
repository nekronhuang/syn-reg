angular.module('controller.cPanel', []).controller('cPanelCtrl', function($scope, $element) {
    $scope.info = [];
    $scope.add = function(info) {
        $scope.info.unshift(info);
        if ($scope.info.length > 20) {
            $scope.info.pop();
        }
        $scope.$digest();
    };
});