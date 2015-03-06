angular.module('service.write', ['service.tools', 'service.db']).service('Write', function($rootScope, $window, $cacheFactory, $http, Tools, DB) {
    var async = require('async'),
        doc,
        myCache = $cacheFactory.get('myCache'),
        self = this;
    this.buffer = new Buffer(parseInt($window.localStorage.getItem('$infoSections')) * 48 + 1);
    this.g = function(input, extra) {
        doc = angular.copy(input);
        doc.reg_type = extra.reg_type;
        doc.reg_time = Date.now();
        var content = {
            sur: input.sur || '观众',
            fir: input.fir || '',
            co: input.co || '',
            pos: input.pos || ''
        };
        self.buffer.fill(0);
        self.buffer[0] = 0x31;
        self.buffer.write(angular.toJson(content), 1);
        Tools.communicateSP($rootScope.sPort, self.buffer);
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
        myCache.get('wPanel').scope().spAuth();
        async.parallel([
            function(next) {
                DB.logs.update({
                    cardid: doc.cardid
                }, {
                    $set: doc
                }, {
                    upsert: true
                }, next);
            },
            function(next) {
                var link = $window.sessionStorage.getItem('$server') + '/update?computer=' + $window.localStorage.getItem('$computer');
                $http.post(link, doc, {
                    timeout: 1000
                }).success(function() {
                    next();
                }).error(next);
            }
        ], function(err) {
            if (err) console.error(err);
        });
    };
});