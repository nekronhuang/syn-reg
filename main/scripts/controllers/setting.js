angular.module('controller.sPanel', ['service.basic', 'service.advanced']).controller('sPanelCtrl', function($scope) {
    $scope.error = function() {
        $scope.$broadcast('error');
    };
}).controller('connectSettingsCtrl', function($rootScope, $scope, $window, $http, Basic, Tools) {
    $scope.spCheck = {
        text: '请点击...',
        visible: false,
        result: []
    };
    $scope.disconnect = function() {
        Basic.disconnect();
        $scope.spCheck.text = '请点击...';
    };
    $scope.list = function(e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.spCheck.text = '扫描中...';
        if (!$scope.spCheck.visible) {
            Basic.list(function(err, results) {
                if (err) return console.error('list', err);
                if (results.length) {
                    $scope.spCheck.result = results;
                    $scope.spCheck.visible = true;
                    $scope.$digest();
                } else {
                    $scope.spCheck.text = '请点击...';
                    $scope.$digest();
                }
            });
        }
    };
    $scope.$on('error', function() {
        $scope.spCheck.text = '请点击...';
        $scope.$digest();
    });
    $scope.build = function(item) {
        $scope.spCheck.text = item.display;
        $scope.spCheck.visible = false;
        Basic.build(item.com, item.readId);
    };
    $scope.server = angular.fromJson($window.localStorage.getItem('$server')) || {};
    $scope.computer = $window.localStorage.getItem('$computer');
    $scope.testLink = function() {
        $window.localStorage.setItem('$server', angular.toJson($scope.server));
        var server = 'http://' + $scope.server.ip + ':' + $scope.server.port;
        $http.get(server + '/link?computer=' + $scope.computer, {
            timeout: 1000
        }).success(function(res, status) {
            if (res.data) {
                $window.localStorage.setItem('$computer', res.data);
                $scope.computer = res.data;
            }
            if(status==204){
                $window.localStorage.removeItem('$computer');
                $scope.computer = null;
            }
            $window.sessionStorage.setItem('$server', server);
            $rootScope.showDialog('网络可用!');
        }).error(function() {
            $rootScope.showDialog('网络异常!');
        });
    };
    $scope.searchPrinter = function() {
        Tools.communicatePrinter({
            method: '0'
        });
    };
    $scope.setupPrinter = function() {
        $window.sessionStorage.setItem('$barcode', $scope.barcode);
        $window.sessionStorage.setItem('$laser', $scope.laser);
        //Tools.communicatePrinter({method:'1',printname:$window.sessionStorage.getItem('$barcode')})
    };
    $scope.searchPrinter();
    $scope.$on('fork', function(evt, msg) {
        if (msg.name) {
            $scope.printer = msg.name.split(',');
        }
    });
}).controller('expoSettingsCtrl', function($window, $scope, $rootScope) {
    $scope.save = function() {
        $window.localStorage.setItem('$expo', angular.toJson($scope.expoSettings));
        $rootScope.showDialog('保存完毕');
    };
    if ($window.localStorage.getItem('$expo')) {
        $scope.expoSettings = angular.fromJson($window.localStorage.getItem('$expo'));
    } else {
        $scope.expoSettings = {
            _id: '54ed88d0faab2c1ede3a56c4',
            name: 'TCT ASIA',
            full_name: '亚洲3D打印、增材制造展览会 TCT亚洲峰会',
            year: '2015',
            duration: 60,
            start_date: '2015-02-12'
        };
    }
}).controller('indexSettingsCtrl', function($scope, $rootScope, $cacheFactory, Tools) {
    var myCache = $cacheFactory.get('myCache');
    $scope.add = function() {
        $scope.indexSettings.push({
            start: '0',
            end: '0',
            fn: '00000',
            aes: {
                type: '00',
                needInit: false,
            },
            keyA: '0000',
            keyB: '0000'
        });
    };
    $scope.del = function(i) {
        if ($scope.indexSettings.length > 1) {
            $scope.indexSettings.splice(i, 1);
        }
    };
    $scope.save = function() {
        myCache.remove('indexInit');
        var infoSections = 0,
            settings = $scope.indexSettings;
        for (var i = 0, len = settings.length; i < len; i++) {
            var item = settings[i];
            if (item.fn == '00010') {
                infoSections += parseInt(item.end) - parseInt(item.start) + 1;
            }
        }
        localStorage.setItem('$infoSections', infoSections);
        localStorage.setItem('$index', angular.toJson($scope.indexSettings));
        $rootScope.showDialog('保存完毕');
    };
    $scope.init = function() {
        Tools.communicateSP($rootScope.sPort, new Buffer('51', 'hex'));
    };
    $scope.indexSettings = localStorage.getItem('$index') ? angular.fromJson(localStorage.getItem('$index')) : [{
        "start": "0",
        "end": "4",
        "fn": "00001",
        "aes": {
            "type": "00",
            "needInit": false
        },
        "keyA": "0001",
        "keyB": "0001"
    }, {
        "start": "7",
        "end": "7",
        "fn": "00010",
        "aes": {
            "type": "01",
            "needInit": false
        },
        "keyA": "0000",
        "keyB": "0010"
    }, {
        "start": "5",
        "end": "6",
        "fn": "00011",
        "aes": {
            "type": "00",
            "needInit": false
        },
        "keyA": "0010",
        "keyB": "0010"
    }, {
        "start": "8",
        "end": "13",
        "fn": "00010",
        "aes": {
            "type": "01",
            "needInit": false
        },
        "keyA": "0010",
        "keyB": "0010"
    }, {
        "start": "14",
        "end": "14",
        "fn": "00100",
        "aes": {
            "type": "01",
            "needInit": true
        },
        "keyA": "0000",
        "keyB": "0000"
    }];
}).controller('extraSettingsCtrl', function($rootScope, $scope, Advanced) {
    $scope.clear = function() {
        Advanced.g9();
    };
    $scope.debug = function() {
        Advanced.g($scope.hex);
    };
    $scope.showDev=function(){
        require('nw.gui').Window.get().showDevTools();
    };
});