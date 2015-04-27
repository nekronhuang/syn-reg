angular.module('service.write', ['service.tools', 'service.common']).service('Write', function($rootScope, $window, $cacheFactory, $http, Tools, Common) {
    var async = require('async'),
        myCache = $cacheFactory.get('myCache'),
        _buffer = new Buffer(parseInt($window.localStorage.getItem('$infoSections')) * 48 + 1),
        doc;
    this.g = function(input, extra) {
        doc = angular.copy(input);
        if (!doc.cy) {
            doc.cy = '';
        }
        doc.reg_type = extra.reg_type;
        doc.reg_time = Date.now();
        var content = {
            id: input.id,
            sur: input.sur || '观众',
            fir: input.fir || '',
            co: input.co || '',
            pos: input.pos || '',
            reg_type: extra.reg_type
        };
        _buffer.fill(0);
        _buffer[0] = 0x31;
        _buffer.write(angular.toJson(content), 1);
        Tools.communicateSP($rootScope.sPort, _buffer);
    };
    this.c = function() {
        if (!$window.localStorage.getItem('$index') || !$window.localStorage.getItem('$infoSections')) {
            return $rootScope.showDialog('请先初始化功能!');
        }
        Tools.communicateSP($rootScope.sPort, Tools.indexInit());
    };
    this.s = function(buf) {
        var str = buf.toString('utf8', 2);
        doc.cardid = str.toUpperCase();
        Tools.showLog('写入完成...');
        myCache.get('wPanel').spAuth();
        async.parallel([
            function(next) {
                Common.logs.update({
                    id: doc.id
                }, {
                    $set: doc
                }, {
                    upsert: true
                }, next);
            },
            function(next) {
                var link = $window.sessionStorage.getItem('$server') + '/update?computer=' + $window.localStorage.getItem('$computer');
                $http.post(link, doc).success(function() {
                    next();
                }).error(next);
            }
        ], function(err) {
            if (err) throw err;
        });
    };
});