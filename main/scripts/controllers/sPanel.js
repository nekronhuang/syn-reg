angular.module('controller.sPanel', ['service.basic', 'service.advanced']).controller('sPanelCtrl', ['$scope',
    function($scope) {
        $scope.error = function() {
            $scope.$broadcast('error');
        }
    }
]).controller('connectSettingsCtrl', ['$rootScope', '$scope', 'Basic',
    function($rootScope, $scope, Basic) {
        $scope.spCheck = {
            text: '请点击...',
            visible: false,
            result: []
        };
        $scope.disconnect = function() {
            Basic.disconnect();
            $scope.spCheck.text = '请点击...';
        }
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
        }
        $scope.$on('error', function() {
            $scope.spCheck.text = '请点击...';
            $scope.$digest();
        });
        $scope.build = function(item) {
            $scope.spCheck.text = item.display;
            $scope.spCheck.visible = false;
            Basic.build(item.com, item.readId);
        }
    }
]).controller('expoSettingsCtrl', ['$scope', '$rootScope',
    function($scope, $rootScope) {
        $scope.save = function() {
            localStorage.setItem('$expo', JSON.stringify($scope.expoSettings));
            $rootScope.showDialog('保存完毕');
        }
        if (localStorage.getItem('$expo')) {
            $scope.expoSettings = JSON.parse(localStorage.getItem('$expo'));
        } else {
            $scope.expoSettings = [{
                key: '_id',
                display: 'ID',
                value: '536ed627672621f7fe7c5bd6'
            }, {
                key: 'name',
                display: '展会名',
                value: '上海科技活动周'
            }, {
                key: 'startDate',
                display: '开始日期',
                value: '2014-9-10'
            }, {
                key: 'duration',
                display: '持续天数',
                value: '30'
            }, {
                key: 'pass',
                display: '抽奖要求',
                value: '50'
            }];
        }
    }
]).controller('indexSettingsCtrl', ['$scope', '$rootScope','$cacheFactory',
    function($scope, $rootScope,$cacheFactory) {
        var myCache=$cacheFactory.get('myCache');
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
        }
        $scope.del = function(i) {
            if ($scope.indexSettings.length > 1) {
                $scope.indexSettings.splice(i, 1);
            }
        }
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
            localStorage.setItem('$index', JSON.stringify($scope.indexSettings));
            $rootScope.showDialog('保存完毕');
        }
        $scope.indexSettings = localStorage.getItem('$index') ? JSON.parse(localStorage.getItem('$index')) : [{
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
    }
]).controller('extraSettingsCtrl', ['$scope', 'Advanced',
    function($scope, Advanced) {
        $scope.clear = function() {
            Advanced.g9();
        }
        $scope.debug = function() {
            Advanced.g($scope.hex);
        }
    }
]);