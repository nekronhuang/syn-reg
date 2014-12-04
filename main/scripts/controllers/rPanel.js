var path = require('path');

angular.module('controller.rPanel', ['service.tools', 'service.import', 'service.export']).controller('rPanelCtrl', ['$scope', 'Tools', 'Import', 'Export',
    function($scope, Tools, Import, Export) {
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
        $scope.clearAll = function() {
            for (var i = 0, len = $scope.input.length; i < len; i++) {
                $scope.input[i].value = '';
            }
        }
        $scope.loadList = function() {
            var elm = $('<input type="file" nwworkingdir="' + path.dirname(process.execPath) + '\\stable\\dat">');
            elm.trigger('click').change(function(e) {
                console.log(e.currentTarget.files[0].path)
            });
        }
    }
]);