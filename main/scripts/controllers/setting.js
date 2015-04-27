angular.module('controller.sPanel', ['service.basic', 'service.advanced']).controller('connectSettingsCtrl', function($rootScope, $scope, $window, $http, Basic, Tools) {
    $scope.spCheck = {
        text: '请点击...',
        visible: false,
        result: []
    };
    $scope.disconnect = function() {
        Basic.disconnect();
        $scope.spCheck.text = '请点击...';
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
    $scope.list = function(e) {
        e.preventDefault();
        e.stopPropagation();
        $scope.spCheck.visible = false;
        $scope.spCheck.text = '扫描中...';
        if (!$scope.spCheck.visible) {
            Basic.list(function(err, results) {
                if (err) throw err;
                if (results.length) {
                    $scope.spCheck.result = results;
                    $scope.spCheck.visible = true;
                } else {
                    $scope.spCheck.text = '请点击...';
                }
                $scope.$digest();
            });
        }
    };
    $scope.$on('disconnect', function() {
        $scope.disconnect();
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
            if (status == 204) {
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
        Tools.communicateBarcode({
            method: '0'
        });
    };
    $scope.setupPrinter = function() {
        $window.sessionStorage.setItem('$barcode', $scope.barcode);
        $window.sessionStorage.setItem('$laser', $scope.laser);
        $rootScope.showDialog('保存完毕!');
    };
    // $scope.searchPrinter();
    $scope.$emit('ready');
    // $scope.$on('fork', function(evt, msg) {
    //     if (msg.name) {
    //         $scope.printer = msg.name.split(',');
    //     }
    //     $scope.$emit('ready');
    // });
}).controller('expoSettingsCtrl', function($window, $scope, $rootScope, settingConfig) {
    $scope.save = function() {
        $window.localStorage.setItem('$expo', angular.toJson($scope.expoSettings));
        $rootScope.showDialog('保存完毕');
    };
    if ($window.localStorage.getItem('$expo')) {
        $scope.expoSettings = angular.fromJson($window.localStorage.getItem('$expo'));
    } else {
        $scope.expoSettings = settingConfig.expo;
    }
}).controller('indexSettingsCtrl', function($scope, $rootScope, $cacheFactory, Tools, settingConfig) {
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
    $scope.indexSettings = localStorage.getItem('$index') ? angular.fromJson(localStorage.getItem('$index')) : settingConfig.index;
}).controller('extraSettingsCtrl', function($rootScope, $scope, $window, Advanced) {
    var gui = require('nw.gui');
    $scope.clear = function() {
        Advanced.g9();
    };
    $scope.debug = function() {
        Advanced.g($scope.hex);
    };
    $scope.showDev = function() {
        gui.Window.get().showDevTools();
    };
    $scope.clean = function() {
        gui.App.clearCache();
        $window.localStorage.removeItem('$index');
        $window.localStorage.removeItem('$infoSections');
        $window.localStorage.removeItem('$expo');
    };
}).service('settingConfig', function() {
    this.index = [{
        'start': '0',
        'end': '2',
        'fn': '00001',
        'aes': {
            'type': '00',
            'needInit': false
        },
        'keyA': '0001',
        'keyB': '0001'
    }, {
        'start': '3',
        'end': '11',
        'fn': '00010',
        'aes': {
            'type': '01',
            'needInit': false
        },
        'keyA': '0000',
        'keyB': '0000'
    }, {
        'start': '12',
        'end': '12',
        'fn': '00011',
        'aes': {
            'type': '01',
            'needInit': false
        },
        'keyA': '0010',
        'keyB': '0010'
    }, {
        'start': '14',
        'end': '14',
        'fn': '00100',
        'aes': {
            'type': '01',
            'needInit': false
        },
        'keyA': '0000',
        'keyB': '0000'
    }, {
        'start': '13',
        'end': '13',
        'fn': '00101',
        'aes': {
            'type': '01',
            'needInit': false
        },
        'keyA': '0010',
        'keyB': '0010'
    }];
    this.expo = {
        _id: '54ed88d0faab2c1ede3a56c4',
        name: 'TCT ASIA',
        full_name: '亚洲3D打印、增材制造展览会 TCT亚洲峰会',
        year: '2015',
        duration: 60,
        start_date: '2015-02-12'
    };
});