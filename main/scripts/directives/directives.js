angular.module('app.directives', []).directive('dateFormat', function($filter) {
    var dateFilter = $filter('date');
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            function formatter(value) {
                return dateFilter(value, 'yyyy-MM-dd HH:mm:ss');
            }

            function parser() {
                return ctrl.$modelValue;
            }
            ctrl.$formatters.push(formatter);
            ctrl.$parsers.unshift(parser);
        }
    };
});;