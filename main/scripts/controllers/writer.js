var path = require('path'),
    edge = require('edge');
angular.module('controller.wPanel', ['service.write', 'service.read', 'service.tools','service.db']).controller('wPanelCtrl', function($window, $document, $rootScope, $scope, $filter, $q, $modal, Tools, Write, Read, writerInput, DB) {
    var async=require('async');
    $scope.info = {
        qn: new Array(7)
    };
    if ($window.localStorage.getItem('$infoInput')) {
        $scope.input = angular.fromJson($window.localStorage.getItem('$infoInput'));
    } else {
        $scope.input = writerInput.infoInput;
    }
    $scope.reg_type = writerInput.reg_type;
    $scope.clearAll = function() {
        $scope.info = {
            qn: new Array(7)
        };
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
    $scope.spWrite = function() {
        Write.g($scope.info, $scope.reg_type.value);
    };
    $scope.spRead = function() {
        Read.g();
    };
    $scope.printBadge = function() {

    };
    $scope.printGuide = function() {

    };
    $scope.make = function() {
        $scope.spWrite();
        $scope.printBadge();
        $scope.printGuide();
    };
    $scope.countLogs = function() {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);
        today.setMilliseconds(0);
        today=today.getTime();
        var tomorrow = today + 1000 * 60 * 60 * 24;
        async.parallel({
            chinese: function(next){
                DB.logs.count({
                    reg_time: {
                        $gte: today,
                        $lte: tomorrow
                    },
                    cy:{
                        $in:['','中国']
                    }
                }, next);
            },
            total:function(next){
                DB.logs.count({
                    reg_time: {
                        $gte: today,
                        $lte: tomorrow
                    }
                }, next);
            }
        },function(err,res){
            if(err) console.error(err);
            var modalInstance = $modal.open({
                templateUrl: './views/todayStat.html',
                windowClass: 'remodal-like',
                scope: angular.extend($scope.$new(true), {
                    results:res
                })
            });
            console.log(res,modalInstance);
        });
    };
    $scope.startWorldCard = function() {
        $rootScope.showDialog('未启用!');
    };
    $scope.modifySetting = function() {
        var modalInstance = $modal.open({
            templateUrl: './views/modifyItems.html',
            controller: 'modifySettingCtrl',
            windowClass: 'remodal-like',
            backdrop: 'static',
            resolve: {
                items: function() {
                    return $scope.input;
                }
            }
        });
        modalInstance.result.then(function(items) {
            $window.localStorage.setItem('$input', angular.toJson(items));
            $scope.input = items;
        }, function() {

        });
    };
    $scope.render = function(data) {
        try {
            var output = angular.fromJson(data);
            $scope.info = output;
            $scope.$digest();
        } catch (e) {
            console.error('not json');
        }
    };
    $document.keydown(function(evt) {
        evt.stopPropagation();
        var $basicInfo = angular.element('#basic-info .input-wrap'),
            $qnInfo = angular.element('#qn-info .input-wrap');
        // console.log(evt);
        switch (evt.keyCode) {
            case 83: //ctrl+s
                if (evt.ctrlKey) {
                    $scope.make();
                }
                break;
            case 49: //1
                if (evt.altKey) {
                    $qnInfo.eq(0).find('input').focus();
                } else if (evt.ctrlKey) {
                    $basicInfo.eq(0).find('input').focus();
                }
                break;
            case 50: //2
                if (evt.altKey) {
                    $qnInfo.eq(1).find('input').focus();
                } else if (evt.ctrlKey) {
                    $basicInfo.eq(1).find('input').focus();
                }
                break;
            case 51: //3
                if (evt.altKey) {
                    $qnInfo.eq(2).find('input').focus();
                } else if (evt.ctrlKey) {
                    $basicInfo.eq(2).find('input').focus();
                }
                break;
            case 112: //F1
                $scope.spWrite();
                break;
            case 113: //F2
                $scope.spRead();
                break;
            case 120: //F9
                $scope.clearAll();
                break;
            case 123: //F12
                angular.element('#wrapper .navbar').scope().toggleKeyShown();
                break;
        }
    });
}).controller('modifySettingCtrl', function($scope, $modalInstance, items) {
    $scope.items = angular.copy(items);
    $scope.save = function() {
        $modalInstance.close($scope.items);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}).service('writerInput', function() {
    this.infoInput = [{
        key: 'id',
        display: '编号',
        visible: true
    }, {
        key: 'sur',
        display: '姓',
        visible: true,
        search: 'all'
    }, {
        key: 'fir',
        display: '名',
        visible: true,
    }, {
        key: 'gen',
        display: '性别',
        visible: true
    }, {
        key: 'cont',
        display: '洲',
        visible: true
    }, {
        key: 'cy',
        display: '国家',
        visible: true
    }, {
        key: 'prov',
        display: '省市',
        visible: true
    }, {
        key: 'co',
        display: '公司',
        visible: true,
        search: 'one'
    }, {
        key: 'dept',
        display: '部门',
        visible: true
    }, {
        key: 'pos',
        display: '职位',
        visible: true
    }, {
        key: 'add',
        display: '地址',
        visible: true
    }, {
        key: 'web',
        display: '网站',
        visible: true
    }, {
        key: 'em',
        display: '邮箱',
        visible: true
    }, {
        key: 'mb',
        display: '手机',
        visible: true
    }, {
        key: 'tel',
        display: '座机',
        visible: true
    }, {
        key: 'qq',
        display: 'QQ',
        visible: false
    }];
    this.reg_type = {
        kind: [{
            display: '参会代表',
            value: 0
        }, {
            display: '观众',
            value: 1
        }, {
            display: 'VIP',
            value: 2
        }, {
            display: '媒体',
            value: 3
        }, {
            display: '展商',
            value: 4
        }, {
            display: '工作人员',
            value: 5
        }, {
            display: '工作证',
            value: 6
        }],
        value: 1
    };
});