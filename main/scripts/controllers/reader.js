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
    $scope.indexSearch = function(val) {
        var key;
        if (val) {
            key = val;
        } else {
            key = $scope.keyWord.toUpperCase();
        }
        $http.get($window.sessionStorage.getItem('$server') + '/exhibitors/' + key, {
            timeout: 1000
        }).success(function(res) {
            $scope.info = res.data;
        }).error(function() {
            $rootScope.showDialog('网络异常!');
        });
    };
    $scope.prevSearch = function() {
        var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
        if (nowKeyWord > 0) {
            $scope.keyWord = nowKeyWord - 1;
        }
        $scope.indexSearch($scope.keyWord);
    };
    $scope.nextSearch = function() {
        var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
        $scope.keyWord = nowKeyWord + 1;
        $scope.indexSearch($scope.keyWord);
    };
    $scope.clearAll = function() {
        $scope.info = {};
    };
// var ffi = require('ffi'),
//     ref = require('ref'),
//     RC = ffi.Library('dll_camera.dll', {
//         GetDevice: ['int', []],
//         StartDevice: ['bool', []],
//         ReleaseDevice: ['void', []],
//         ReleaseLostDevice: ['void', []],
//         SetBeep: ['void', ['bool']],
//         SetBeepTime: ['void', ['int']],
//         setQRable: ['void', ['bool']],
//         GetDecodeString: ['void', ['char *']]
//     });

// RC.ReleaseDevice();
// RC.StartDevice();
// RC.SetBeepTime(100);
// RC.setQRable(true);

// var buf = new Buffer(100),
//     loop;
// buf.type = ref.types.CString;
// loop = setInterval(function() {
//     console.log('check');
//     RC.GetDecodeString(buf);
//     if (ref.readCString(buf, 0)) {
//         // RC.setQRable(false);
//         // clearInterval(loop);
//         console.log(buf);
//         console.log(ref.readCString(buf, 0))
//     }
// }, 50);
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