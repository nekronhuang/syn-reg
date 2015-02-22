angular.module('service.import', ['service.tools']).service('Import', ['$rootScope', '$filter', 'Tools',
    function($rootScope, $filter, Tools) {
        this.g = function(input) {
            if(!localStorage.getItem('$expo')){
                return $rootScope.showDialog('未设置展会信息!');
            }
            var expo = angular.fromJson(localStorage.getItem('$expo')),
                date = new Date(),
                buf;
            buf = [new Buffer([0x34]), new Buffer($filter('date')(date, 'yyyyMMddhhmmss'), 'hex'), new Buffer([date.getDay() + 1, 26])];
            buf.push(new Buffer('536ed4ea672621f7fe7c5b73'.toUpperCase()))
            // buf.push(new Buffer(input.companyId.toUpperCase()));//公司ID
            buf.push(new Buffer([2 >> 8, 2 & 255, 24]));
            //buf.push(new Buffer([input.number>>8,input.number&255,24]));//公司编号+展会id长度
            buf.push(new Buffer(expo[0].value.toUpperCase())); //展会id
            buf.push(new Buffer($filter('date')((new Date(expo[2].value)), 'yyyyMMdd'), 'hex')); //起始日期
            buf.push(new Buffer([expo[3].value])); //展会天数
            Tools.communicateSP($rootScope.sPort, Buffer.concat(buf));
        }
        this.s = function(buf) {
            Tools.showLog('导入完成!');
        }
    }
]);