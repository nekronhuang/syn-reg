angular.module('service.db', []).service('DB', function($rootScope) {
    var nedb = require('nedb');
    this.logs = new nedb({
        filename: './AppData/logs.db',
        autoload: true
    });
    this.local = new nedb({
        filename: './AppData/TCT.db',
        autoload: true
    });
});