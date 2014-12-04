angular.module('service.write', ['service.tools']).service('Write', [
    '$rootScope','$cacheFactory', 'Tools',
    function($rootScope,$cacheFactory,Tools) {
        var myCache=$cacheFactory.get('myCache');
        this.g = function(input) {
            var content = new Buffer(JSON.stringify(input)),
                sections = parseInt(localStorage.getItem('$infoSections')),
                blank = new Buffer(sections * 48 - content.length),
                buf;
            blank.fill(0);
            buf = [new Buffer([0x31]), content, blank];
            Tools.communicateSP($rootScope.sPort, Buffer.concat(buf));
        }
        this.c = function() {
            Tools.communicateSP($rootScope.sPort, Tools.indexInit());
        }
        this.s = function(data) {
            var str = data.substring(2, 16),
                db_data = '"cardid":' + parseInt(str, 16).toString() + ',',
                input=myCache.get('wPanel').scope().input;
            for (var i = 0, len = input.length; i < len; i++) {
                var now = input[i];
                if (now.key == 'field' || now.key == 'number' || now.key == 'mobile') {
                    db_data += '"' + now.key + '":["' + now.value + '"],';
                } else {
                    db_data += '"' + now.key + '":"' + now.value + '",';
                }
            }
            db_data += '"type":0';
            db_data = '{' + db_data + '}';
            var obj = JSON.parse(db_data);
            Tools.showLog('写入完成...');
        }
    }
]);