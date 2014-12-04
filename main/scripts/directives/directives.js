angular.module('app.directives',[]).directive('ngNicescroll', ['$parse',
    function($parse) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attr) {
                var fn = $parse(attr.ngNicescroll);
                var options = fn(scope) || {
                    cursorwidth: 7
                };
                element.niceScroll(options);
            }
        }
    }
]);