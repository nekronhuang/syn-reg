var path = require('path'),
    fs = require('fs'),
    nedb = require('nedb'),
    async = require('async');

angular.module('controller.rPanel', ['service.tools', 'service.import', 'service.export']).controller('rPanelCtrl', ['$rootScope', '$scope', 'Tools', 'Import', 'Export',
    function($rootScope, $scope, Tools, Import, Export) {
        var db;
        if (fs.existsSync('./AppData/companies.db')) {
            db = new nedb('./AppData/companies.db');
            db.loadDatabase(function(err) {
                if (err) {
                    db = null;
                    return console.error(err);
                }
            });
        }
        $scope.input = [{
            key: 'companyId',
            value: '',
            visible: false
        }, {
            key: 'company',
            display: '公司',
            value: '',
            visible: true
        }, {
            key: 'number',
            display: '公司电话',
            value: '',
            visible: true
        }, {
            key: 'contact',
            display: '联系人',
            value: '',
            visible: true
        }, {
            key: 'contactEmail',
            display: '联系人邮箱',
            value: '',
            visible: true
        }, {
            key: 'contactMobile',
            display: '联系人手机',
            value: '',
            visible: true
        }, ];
        $scope.spImport = function() {
            var output = Tools.extractData($scope.input);
            Import.g(output);
        }
        $scope.spExport = function() {
            Export.g();
        }
        $scope.indexSearch = function() {
            if (db) {
                var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
                db.findOne({
                    number: nowKeyWord
                }, function(err, doc) {
                    if (doc) {
                        console.log(doc);
                    } else {
                        $scope.clearAll();
                    }
                });
            } else {
                $rootScope.showDialog('请先导入展商名单!');
            }
        }
        $scope.prevSearch = function() {
            var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
            if (nowKeyWord > 0) {
                $scope.keyWord = nowKeyWord - 1;
            }
            $scope.indexSearch();
        }
        $scope.nextSearch = function() {
            var nowKeyWord = $scope.keyWord ? parseInt($scope.keyWord) : 0;
            $scope.keyWord = nowKeyWord + 1;
            $scope.indexSearch();
        }
        $scope.clearAll = function() {
            for (var i = 0, len = $scope.input.length; i < len; i++) {
                $scope.input[i].value = '';
            }
        }
        $scope.loadList = function() {
            var elm = $('<input type="file" nwworkingdir="' + path.dirname(process.execPath) + '\\stable\\dat">');
            elm.trigger('click').change(function(e) {
                fs.readFile(e.currentTarget.files[0].path, 'utf8', function(err, doc) {
                    var lines = doc.split('\r\n');
                    lines.pop();
                    async.series([
                        function(next) {
                            db = new nedb('./AppData/companies.db');
                            db.loadDatabase(next);
                        },
                        function(next) {
                            async.each(lines, function(item, cb) {
                                try {
                                    var line = angular.fromJson(item);
                                    line._id = line._id.$oid;
                                    db.insert(line, cb);
                                } catch (err) {
                                    cb(err);
                                }
                            }, next);
                        }
                    ], function(err) {
                        if (err) console.error(err);
                    });
                });
            });
        }
    }
]);