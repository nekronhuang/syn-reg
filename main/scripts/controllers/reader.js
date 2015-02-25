var path = require('path'),
    fs = require('fs'),
    async = require('async');

angular.module('controller.rPanel', ['service.tools', 'service.import', 'service.export']).controller('rPanelCtrl', function($window, $rootScope, $scope, $http, Tools, Import, Export, readerInput) {
    $scope.info = {};
    $scope.input = readerInput.infoInput;
    $scope.expoInfo = angular.fromJson($window.localStorage.getItem('$expo'));
    $scope.spImport = function() {
        Import.g($scope.info);
    };
    $scope.spExport = function() {
        Export.g();
    };
    $scope.indexSearch = function() {
        $http.get('http://localhost:8888/exhibitors/' + $scope.keyWord.toUpperCase(), {
            timeout: 1000
        }).success(function(res) {
            $scope.info = res.data;
            console.log(res);
        }).error(function() {
            $rootScope.showDialog('请先导入展商名单!');
        });
    };
    $scope.prevSearch = function() {
        var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
        if (nowKeyWord > 0) {
            $scope.keyWord = nowKeyWord - 1;
        }
        $scope.indexSearch();
    };
    $scope.nextSearch = function() {
        var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
        $scope.keyWord = nowKeyWord + 1;
        $scope.indexSearch();
    };
    $scope.clearAll = function() {
        $scope.info = {};
    };
}).service('readerInput', function() {
    this.infoInput = [{
        key: '_id',
        display: 'id'
    }, {
        key: 'number',
        display: '编号'
    }, {
        key: 'name',
        display: '公司名',
    }, {
        key: 'booth',
        display: '展位号',
    }, ];
});