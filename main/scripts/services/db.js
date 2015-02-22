angular.module('service.db', []).service('DB', function($rootScope) {
    var nedb=require('nedb');
    this.companies=new nedb({
        filename: './AppData/companies.db',
        autoload: true
    });
    this.logs=new nedb({
        filename: './AppData/logs.db',
        autoload: true
    });
});