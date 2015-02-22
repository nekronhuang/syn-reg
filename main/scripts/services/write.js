angular.module('service.write', ['service.tools', 'service.db']).service('Write', function($rootScope, $window, $cacheFactory, $http, Tools, DB) {
    var async = require('async'),
        doc;
    this.g = function(input, type) {
        console.log(input)
        doc = input;
        doc.reg_type = type;
        doc.reg_time = Date.now();
        var content = new Buffer(angular.toJson(input)),
            sections = parseInt($window.localStorage.getItem('$infoSections')),
            blank = new Buffer(sections * 48 - content.length),
            buf;
        blank.fill(0);
        buf = [new Buffer([0x31]), content, blank];
        Tools.communicateSP($rootScope.sPort, Buffer.concat(buf));
    };
    this.c = function() {
        if (!$window.localStorage.getItem('$index') || !$window.localStorage.getItem('$infoSections')) {
            return $rootScope.showDialog('请先初始化功能!');
        }
        Tools.communicateSP($rootScope.sPort, Tools.indexInit());
    };
    this.s = function(data) {
        var str = data.substring(2, 16);
        doc.cardid = str.toUpperCase();
        // parseInt(str, 16)
        Tools.showLog('写入完成...');
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
                var link = $window.sessionStorage.getItem('$server') + '/insert?computer=' + $window.localStorage.getItem('$computer');
                $http.post(link, doc, {
                    timeout: 1000
                }).success(next).error(next);
            }
        ], function(err) {
            if (err) console.error(err);
        });
    };
});