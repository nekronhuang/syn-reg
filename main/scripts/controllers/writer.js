angular.module('controller.wPanel', ['service.write', 'service.read', 'service.tools', 'service.db']).controller('wPanelCtrl', function($window, $document, $rootScope, $scope, $timeout, $filter, $http, $modal, Tools, Write, Read, writerInput, DB) {
    var async = require('async');
    $scope.states = writerInput.states;
    $scope.getIdSearch = function(val) {
        if (val && val.length == 10) {
            $http.get($window.sessionStorage.getItem('$server') + '/find/single?filter[id]=' + val, {
                timeout: 1000
            }).success(function(res, status) {
                if (status == 204) {
                    $scope.info.sur= '';
                    $scope.info.fir= '';
                    $scope.info.co= '';
                    $scope.info.pos= '';
                    $scope.info.qn=[0,0,0,0,0];
                    return $rootScope.showDialog('已登记!');
                }
                if (res.data) {
                    $scope.info = res.data;
                } else {
                    $rootScope.showDialog('无匹配!');
                }
            }).error(function() {
                $rootScope.showDialog('网络异常!');
            });
        }
    };
    $scope.getNameSearch = function(val) {
        if (!$scope.liveSearch) {
            return [];
        }
        return $http.get($window.sessionStorage.getItem('$server') + '/find/multi?filter[sur]=' + val, {
            timeout: 1000
        }).then(function(res) {
            if (res.data.data.length == 0) {
                $rootScope.showDialog('无匹配!');
            }
            return res.data.data;
        }, function(res) {
            $rootScope.showDialog('网络异常!');
            return [];
        });
    };
    $scope.getName = function(val) {
        $scope.info = val;
    };
    $scope.getCompanySearch = function(val) {
        if (!$scope.liveSearch) {
            return [];
        }
        return $http.get($window.sessionStorage.getItem('$server') + '/distinct?key=co&&filter[co]=' + val, {
            timeout: 1000
        }).then(function(res) {
            if (res.data.data.length == 0) {
                $rootScope.showDialog('无匹配!');
            }
            return res.data.data;
        }, function(res) {
            $rootScope.showDialog('网络异常!');
            return [];
        });
    };
    if ($window.localStorage.getItem('$infoInput')) {
        $scope.input = angular.fromJson($window.localStorage.getItem('$infoInput'));
    } else {
        $scope.input = writerInput.infoInput;
    }
    $scope.reg_type = writerInput.reg_type;
    $scope.authInput = writerInput.authInput;
    $scope.info = {
        sur: '',
        fir: '',
        co: '',
        pos: '',
        qn: [0, 0, 0, 0, 0],
        auth:new Array($scope.authInput.length)
    };
    $scope.clearAll = function() {
        $scope.info = {
            sur: '',
            fir: '',
            co: '',
            pos: '',
            qn: [0, 0, 0, 0, 0],
            auth:new Array($scope.authInput.length)
        };
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
    $scope.spWrite = function() {
        Write.g($scope.info, {
            reg_type: $scope.reg_type.value,
        });
    };
    $scope.spRead = function() {
        Read.g();
    };
    $scope.spAuth=function(){
        for (var i = 0, len = $scope.info.auth.length; i < len; i++) {
            if ($scope.info.auth[i]) {
                Tools.communicateSP($rootScope.sPort, new Buffer('430f', 'hex'));
                break;
            }
        }
    };
    $scope.printBadge = function() {
        var para = {
            method: '2',
            printname: $window.sessionStorage.getItem('$barcode'),
            page_w: '373',
            page_h: '353',
            content: {
                origin_h: '150',
                content_num: '0',
                content_core: []
            }
        };
        switch ($scope.reg_type.value) {
            case 0:
                para.content.content_core.push({
                    text: ($scope.info.sur + ' ' + $scope.info.fir).trim() || '参会代表',
                    size: '40',
                    style: '1',
                    space: '8',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.pos || '',
                    size: '14',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.co || '',
                    size: '14',
                    style: '0',
                    space: '8',
                    special: '0'
                });
                var arr = ['仅限3月12日 / 12th March Only', '仅限3月13日 / 13th March Only'],
                    temp = [];
                for (var i = 0, len = $scope.info.auth.length; i < len; i++) {
                    if ($scope.info.auth[i] && $scope.info.auth[i] != '00000000') {
                        temp.push(arr[i]);
                    }
                }
                if (temp.length == 1) {
                    para.content.content_core.push({
                        text: temp[0],
                        size: '7',
                        style: '0',
                        space: '0',
                        special: '0'
                    });
                }
                if (temp.length == 0) {
                    return $rootScope.showDialog('未选择权限!');
                }
                para.content.content_num = String(para.content.content_core.length);
                break;
            case 1:
                para.content.content_core.push({
                    text: ($scope.info.sur + ' ' + $scope.info.fir).trim() || '现场观众',
                    size: '40',
                    style: '1',
                    space: '8',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.pos || '',
                    size: '14',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.co || '',
                    size: '14',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_num = String(para.content.content_core.length);
                break;
            case 2:
            case 3:
            case 4:
                para.content.content_core.push({
                    text: ($scope.info.sur + ' ' + $scope.info.fir).trim() || $scope.reg_type.kind[$scope.reg_type.value].display,
                    size: '40',
                    style: '1',
                    space: '8',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.pos || '',
                    size: '14',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.co || '',
                    size: '14',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.reg_type.kind[$scope.reg_type.value].footer,
                    size: '14',
                    style: '0',
                    yPos: '323',
                    special: '1'
                });
                para.content.content_num = '4';
                break;
            case 5:
                para.content.content_core.push({
                    text: '媒 体',
                    size: '40',
                    style: '1',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: 'Media',
                    size: '30',
                    style: '1',
                    space: '15',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.co || '',
                    size: '12',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_num = '3';
                break;
            case 6:
                para.content.content_core.push({
                    text: '展 商',
                    size: '40',
                    style: '1',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: 'Exhibitor',
                    size: '30',
                    style: '1',
                    space: '10',
                    special: '0'
                });
                para.content.content_core.push({
                    text: $scope.info.co || '',
                    size: '12',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                //展位号填写在名字中
                para.content.content_core.push({
                    text: '展位号：' + ($scope.info.sur || ''),
                    size: '12',
                    style: '0',
                    space: '0',
                    special: '0'
                });
                para.content.content_num = '4';
                break;
            case 7:
                para.content.content_core.push({
                    text: '工作人员',
                    size: '40',
                    style: '1',
                    space: '0',
                    special: '0'
                });
                para.content.content_core.push({
                    text: 'Staff',
                    size: '30',
                    style: '1',
                    space: '0',
                    special: '0'
                });
                para.content.content_num = '2';
                break;
            case 8:
                para.content.origin_h = '169';
                para.content.content_core.push({
                    text: '工作证',
                    size: '40',
                    style: '1',
                    space: '0',
                    special: '0'
                });
                para.content.content_num = '1';
                break;
        }
        Tools.communicateBarcode(para);
    };
    $scope.printGuide = function() {
        Tools.communicateLaser({});
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
        today = today.getTime();
        var tomorrow = today + 1000 * 60 * 60 * 24;
        async.parallel({
            chinese: function(next) {
                DB.logs.count({
                    reg_time: {
                        $gte: today,
                        $lte: tomorrow
                    },
                    cy: {
                        $in: ['', '中国']
                    }
                }, next);
            },
            total: function(next) {
                DB.logs.count({
                    reg_time: {
                        $gte: today,
                        $lte: tomorrow
                    }
                }, next);
            }
        }, function(err, res) {
            if (err) console.error(err);
            var modalInstance = $modal.open({
                templateUrl: './views/todayStat.html',
                windowClass: 'remodal-like',
                scope: angular.extend($scope.$new(true), {
                    results: res
                })
            });
        });
    };
    $scope.startWorldCard = function() {
        $rootScope.showDialog('未启用!');
    };
    $scope.liveSearch = $window.localStorage.getItem('$liveSearch') ? false : true;
    $scope.modifySetting = function() {
        var modalInstance = $modal.open({
            templateUrl: './views/modifyItems.html',
            controller: 'modifySettingCtrl',
            windowClass: 'remodal-like',
            backdrop: 'static',
            resolve: {
                items: function() {
                    return $scope.input;
                },
                liveSearch: function() {
                    return $scope.liveSearch;
                }
            }
        });
        modalInstance.result.then(function(obj) {
            $window.localStorage.setItem('$input', angular.toJson(obj.items));
            if (obj.liveSearch) {
                $window.localStorage.removeItem('$liveSearch');
            } else {
                $window.localStorage.setItem('$liveSearch', 'off');
            }
            $scope.input = obj.items;
            $scope.liveSearch = obj.liveSearch;
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

    $document.keyup(function(evt) {
        var $basicInfo = angular.element('#basic-info .input-wrap'),
            $qnInfo = angular.element('#qn-info .input-wrap');
        switch (evt.keyCode) {
            case 83: //ctrl+s
                if (evt.ctrlKey) {
                    $scope.make();
                }
                break;
            case 49: //1
            case 50: //2
            case 51:
            case 52:
            case 53:
            case 54:
                if (evt.altKey) {
                    $qnInfo.eq(evt.keyCode - 49).find('input').focus();
                } else if (evt.ctrlKey) {
                    $basicInfo.eq(evt.keyCode - 49).find('input').focus();
                }
                break;
            case 112: //F1
                $scope.spWrite();
                break;
            case 113: //F2
                $scope.spRead();
                break;
            case 114:
                $scope.printBadge();
                break;
            case 115:
                $scope.printGuide();
                break;
            case 120: //F9
                $scope.clearAll();
                break;
            case 123: //F12
                angular.element('#wrapper .navbar').scope().toggleKeyShown();
                break;
        }
    });
    // $scope.$on('$destroy', function() {
    //     $document.off('keyup');
    // });
}).controller('modifySettingCtrl', function($scope, $modalInstance, items, liveSearch) {
    $scope.items = angular.copy(items);
    $scope.liveSearch = liveSearch;
    $scope.save = function() {
        $modalInstance.close({
            items: $scope.items,
            liveSearch: $scope.liveSearch
        });
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
}).service('writerInput', function($window) {
    this.infoInput = angular.fromJson($window.localStorage.getItem('$input')) || [{
        key: 'id',
        display: '编号',
        visible: true
    }, {
        key: 'sur',
        display: '姓',
        visible: true
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
        visible: true
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
    this.authInput = [{
        display: '3月12日会议',
        value: '00000111'
    }, {
        display: '3月13日会议',
        value: '00001111'
    }, ];
    this.reg_type = {
        kind: [{
            display: '参会代表',
        }, {
            display: '观众',
        }, {
            display: 'VIP买家',
            footer: 'VIP买家 VIP Buyer',
        }, {
            display: 'VIP贵宾',
            footer: 'VIP贵宾  VIP Guest',
        }, {
            display: '演讲嘉宾',
            footer: '演讲嘉宾  Speaker'
        }, {
            display: '媒体',
        }, {
            display: '展商',
        }, {
            display: '工作人员',
        }, {
            display: '工作证',
        }],
        value: 1 //choose after start
    };
    this.states = ['Afghanistan / 阿富汗', 'Aland Islands / 奥兰群岛', 'Albania / 阿尔巴尼亚', 'Algeria / 阿尔及利亚', 'American Samoa / 美属萨摩亚', 'Andorra / 安多拉', 'Angola / 安哥拉', 'Anguilla / 安圭拉岛', 'Antigua and Barbuda / 安提瓜和巴布达', 'Argentina / 阿根廷', 'Armenia / 亚美尼亚共和国', 'Aruba / 阿鲁巴岛', 'Australia / 澳大利亚', 'Austria / 奥地利', 'Azerbaijan / 阿塞拜疆', 'Bahamas / 巴哈马', 'Bahrain / 巴林', 'Bangladesh / 孟加拉国', 'Barbados / 巴巴多斯', 'Belarus / 白俄罗斯', 'Belgium / 比利时', 'Belize / 伯利兹', 'Benin / 贝宁共和国', 'Bermuda / 百慕大', 'Bhutan / 不丹', 'Bolivia / 玻利维亚', 'Bosnia and Herzegovina / 波黑', 'Botswana / 波斯瓦纳', 'Bouvet Island / 布韦岛', 'Brazil / 巴西', 'Brunei Darussalam / 文莱', 'Bulgaria / 保加利亚', 'Burkina Faso / 布基纳法索', 'Burundi / 布隆迪', 'Cambodia / 柬埔寨', 'Cameroon / 喀麦隆', 'Canada / 加拿大', 'Cape Verde / 佛得角', 'Cayman Islands / 开曼群岛', 'Central African Republic / 中非共和国', 'Chad / 乍得', 'Chile / 智利', 'China / 中国', 'Christmas Island / 圣诞岛', 'Cocos Islands / 科科斯群岛', 'Colombia / 哥伦比亚', 'Comoros / 科摩罗伊斯兰联邦共和国', 'Congo / 刚果', 'Congo, The Democratic Republic of the / 刚果共和国', 'Cook Islands / 库克群岛', 'Costa Rica / 哥斯达黎加', 'Cote D\'Ivoire / 科特迪瓦', 'Croatia / 克罗地亚', 'Cuba / 古巴', 'Cyprus / 塞浦路斯', 'Czech Republic / 捷克', 'Denmark / 丹麦', 'Djibouti / 吉布提', 'Dominica / 多米尼加', 'Dominican Republic / 多米尼加共和国', 'Ecuador / 厄瓜多尔', 'Egypt / 埃及', 'El Salvador / 萨尔瓦多', 'Equatorial Guinea / 赤道几内亚', 'Eritrea / 厄立特里亚', 'Estonia / 爱沙尼亚', 'Ethiopia / 埃塞俄比亚', 'Falkland Islands (Malvinas) / 马岛', 'Faroe Islands / 法罗群岛', 'Fiji / 斐济', 'Finland / 芬兰', 'France / 法国', 'French Guiana / 法属圭亚那', 'French Polynesia / 法属波利尼西亚', 'French Southern Territories / 法属南部领地', 'Gabon / 加蓬共和国', 'Gambia / 冈比亚', 'Georgia / 格鲁吉亚', 'Germany / 德国', 'Ghana / 加纳', 'Gibraltar / 直布罗陀', 'Greece / 希腊', 'Greenland / 格林兰岛', 'Grenada / 格林纳达', 'Guadeloupe / 瓜德罗普', 'Guam / 关岛', 'Guatemala / 危地马拉', 'Guernsey / 格恩西岛', 'Guinea / 几内亚', 'Guinea-Bissau / 几内亚比绍', 'Guyana / 圭亚那', 'Haiti / 海地', 'Heard Island and McDonald Islands / 赫德岛和麦克唐纳群岛', 'Holy See (Vatican City State) / 梵蒂冈', 'Honduras / 洪都拉斯', 'Hong Kong / 香港', 'Hungary / 匈牙利', 'Iceland / 冰岛', 'India / 印度', 'Indonesia / 印度尼西亚', 'Iran / 伊朗', 'Iraq / 伊拉克', 'Ireland / 爱尔兰', 'Isle of Man / 马恩岛', 'Israel / 以色列', 'Italy / 意大利', 'Jamaica / 牙买加', 'Japan / 日本', 'Jersey / 泽西岛', 'Jordan / 约旦', 'Kazakhstan / 哈萨克斯坦', 'Kenya / 肯尼亚', 'Kiribati / 基里巴斯共和国 ', 'Kuwait / 科威特', 'Kyrgyzstan / 吉尔吉斯共和国', 'Laos / 老挝', 'Latvia / 拉脱维亚', 'Lebanon / 黎巴嫩', 'Lesotho / 莱索托王国', 'Liberia / 利比里亚共和国', 'Libya / 利比亚', 'Liechtenstein / 列支敦士登', 'Lithuania / 立陶宛', 'Luxembourg / 卢森堡', 'Macau / 澳门', 'Macedonia / 马其顿', 'Madagascar / 马达加斯加', 'Malawi / 马拉维共和国', 'Malaysia / 马来西亚', 'Maldives / 马尔代夫', 'Mali / 马里', 'Malta / 马耳他', 'Marshall Islands / 马绍尔群岛', 'Martinique / 马提尼克岛', 'Mauritania / 毛里塔尼亚', 'Mauritius / 毛里求斯', 'Mayotte / 马约特岛', 'Mexico / 墨西哥', 'Micronesia / 密克罗尼西亚', 'Moldova / 摩尔多瓦', 'Monaco / 摩纳哥', 'Mongolia / 蒙古', 'Montenegro / 黑山共和国', 'Montserrat / 蒙特塞拉特', 'Morocco / 摩洛哥', 'Mozambique / 莫桑比克共和国', 'Myanmar / 缅甸', 'Namibia / 纳米比亚共和国 ', 'Nauru / 瑙鲁', 'Nepal / 尼泊尔', 'Netherlands / 荷兰', 'Netherlands Antilles / 荷属安的列斯群岛', 'New Caledonia / 新喀里多尼亚', 'New Zealand / 新西兰', 'Nicaragua / 尼加拉瓜', 'Niger / 尼日尔共和国', 'Nigeria / 尼日利亚', 'Niue / 纽埃', 'Norfolk Island / 诺福克岛', 'North Korea / 朝鲜', 'Northern Mariana Islands / 北马里亚那群岛', 'Norway / 挪威', 'Oman / 阿曼苏丹国', 'Pakistan / 巴基斯坦', 'Palau / 帕劳共和国 ', 'Palestinian Territory / 巴勒斯坦', 'Panama / 巴拿马', 'Papua New Guinea / 巴布亚新几内亚', 'Paraguay / 巴拉圭', 'Peru / 秘鲁', 'Philippines / 菲律宾', 'Pitcairn / 皮特凯恩群岛', 'Poland / 波兰', 'Portugal / 葡萄牙', 'Puerto Rico / 波多黎各', 'Qatar / 卡塔尔', 'Reunion / 留尼旺岛', 'Romania / 罗马尼亚', 'Russia / 俄罗斯', 'Rwanda / 卢旺达', 'Saint Barthelemy / 圣巴特岛', 'Saint Helena / 圣赫勒拿岛 ', 'Saint Kitts and Nevis / 圣基茨和尼维斯', 'Saint Lucia / 圣卢西亚', 'Saint Martin / 圣马丁', 'Saint Pierre and Miquelon / 圣皮埃尔和密克隆', 'Saint Vincent and the Grenadines / 圣文森特和格林纳丁斯', 'Samoa / 萨摩亚', 'San Marino / 圣马力诺', 'Sao Tome and Principe / 圣多美和普林西比民主共和国', 'Saudi Arabia / 沙特阿拉伯', 'Senegal / 塞内加尔', 'Serbia / 塞尔维亚共和国', 'Seychelles / 塞舌尔', 'Sierra Leone / 塞拉利昂', 'Singapore / 新加坡', 'Slovakia / 斯洛伐克', 'Slovenia / 斯洛文尼亚', 'Solomon Islands / 所罗门群岛', 'Somalia / 索马里', 'South Africa / 南非', 'South Georgia and the South Sandwich Islands / 南乔治亚岛和南桑威奇群岛', 'South Korea / 韩国', 'Spain / 西班牙', 'Sri Lanka / 斯里兰卡', 'Sudan / 苏丹', 'Suriname / 苏里南', 'Svalbard and Jan Mayen / 斯瓦尔巴群岛', 'Swaziland / 斯威士兰', 'Sweden / 瑞典', 'Switzerland / 瑞士', 'Syria / 叙利亚', 'Taiwan / 台湾', 'Tajikistan / 塔吉克斯坦', 'Tanzania / 坦桑尼亚', 'Thailand / 泰国', 'Timor-Leste / 东帝汶', 'Togo / 多哥', 'Tokelau / 托克劳群岛', 'Tonga / 汤加', 'Trinidad and Tobago / 特立尼达和多巴哥', 'Tunisia / 突尼斯', 'Turkey / 土耳其', 'Turkmenistan / 土库曼斯坦', 'Turks and Caicos Islands / 特克斯和凯科斯群岛', 'Tuvalu / 图瓦卢', 'Uganda / 乌干达', 'Ukraine / 乌克兰', 'United Arab Emirates / 阿拉伯联合酋长国', 'United Kingdom / 英国', 'United States / 美国', 'United States minor outlying islands / 美国本土外小岛屿', 'Uruguay / 乌拉圭', 'Uzbekistan / 乌兹别克斯坦', 'Vanuatu / 瓦努阿图', 'Venezuela / 委内瑞拉', 'Vietnam / 越南', 'Virgin Islands, British / 英属维京群岛', 'Virgin Islands, U.S. / 美属维京群岛', 'Wallis and Futuna / 瓦利斯与富图纳', 'Western Sahara / 西撒哈拉', 'Yemen / 也门', 'Zambia / 赞比亚', 'Zimbabwe / 津巴布韦', 'Unclear /  不确定'];
});