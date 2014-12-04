angular.module('controller.wPanel', ['service.write', 'service.read', 'service.tools']).controller('wPanelCtrl', ['$scope', '$filter', '$q', 'Tools', 'Write', 'Read',
    function($scope, $filter, $q, Tools, Write, Read) {
        $scope.input = [{
            key: 'auth',
            display: 'auth',
            value: '',
            visible: true,
            disabled: true
        }, {
            key: 'name',
            display: '姓名',
            value: '',
            visible: true,
            search: 'all'
        }, {
            key: 'gender',
            display: '性别',
            value: '',
            visible: true
        }, {
            key: 'continent',
            display: '大洲',
            value: '',
            visible: true
        }, {
            key: 'country',
            display: '国家',
            value: '',
            visible: true
        }, {
            key: 'province',
            display: '省份',
            value: '',
            visible: true
        }, {
            key: 'field',
            display: '行业',
            value: '',
            visible: true
        }, {
            key: 'company',
            display: '公司',
            value: '',
            visible: true,
            search: 'one'
        }, {
            key: 'department',
            display: '部门',
            value: '',
            visible: true
        }, {
            key: 'position',
            display: '职位',
            value: '',
            visible: true
        }, {
            key: 'address',
            display: '地址',
            value: '',
            visible: true
        }, {
            key: 'website',
            display: '网站',
            value: '',
            visible: true
        }, {
            key: 'email',
            display: '邮箱',
            value: '',
            visible: true
        }, {
            key: 'mobile',
            display: '手机',
            value: '',
            visible: true
        }, {
            key: 'number',
            display: '座机',
            value: '',
            visible: true
        }, {
            key: 'qq',
            display: 'QQ',
            value: '',
            visible: true
        }, ];
        $scope.questions = new Array(7);
        $scope.type = {
            kind: [{
                display: '观众',
                value: 'visitor'
            }, {
                display: 'VIP',
                value: 'vip'
            }, {
                display: '媒体',
                value: 'media'
            }, {
                display: '展商',
                value: 'exhibitor'
            }, {
                display: '工作人员',
                value: 'staff'
            }, ],
            value: ''
        }
        $scope.extraInput = [{
            display: '类型',
            key: 'regType',
            type: 'select',
            options: ['网络预登记', '微信', 'leadMarketing', 'call center', '现场登记', '团体']
        }, {
            display: '时间',
            key: 'regTime',
            type: 'text'
        }, {
            display: '专业',
            key: 'professional',
            type: 'checkbox'
        }, {
            display: '往届',
            key: 'revisit',
            type: 'checkbox'
        }, ]
        $scope.clearAll = function() {
            for (var i = 0, len = $scope.input.length; i < len; i++) {
                $scope.input[i].value = '';
            }
            for (var j = 0, len = $scope.questions.length; j < len; j++) {
                $scope.questions[j] = '';
            }
            for (var k = 0, len = $scope.extraInput.length; k < len; k++) {
                $scope.extraInput[k].value = null;
            }
            $scope.type.value = '';
            $scope.showTooltip = false;
        }
        $scope.spWrite = function() {
            var output = Tools.extractData($scope.input);
            Write.g(output);
        }
        $scope.spRead = function() {
            Read.g();
        }
        $scope.render = function(data) {
            try {
                var output = JSON.parse(data);
                Tools.renderData(output, $scope.input);
                $scope.$digest();
            } catch (e) {
                console.error('not json');
            }
        }
    }
]);