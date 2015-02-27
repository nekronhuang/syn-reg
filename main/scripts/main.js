var gui = require('nw.gui');

process.on('uncaughtException', function(e) {
    console.error('uncaughtException:   ' + e);
});

angular.module('syn-reg', ['app.controllers', 'app.services', 'app.directives', 'ngMaterial', 'ui.bootstrap']).run(function($window, $rootScope, $timeout, $cacheFactory, $mdToast) {
    $rootScope.showDialog = function(m) {
        $mdToast.show({
            template: '<md-toast>' + m + '</md-toast>',
            duration: 1000,
            position: 'top right'
        });
    }
    $window.onbeforeunload = function(event) {
        if ($rootScope.sPort) $rootScope.sPort.close(function() {});
    }
    // iconv.extendNodeEncodings();
    var myCache = $cacheFactory('myCache');
    myCache.put('sPanel', angular.element('#sPanel'));
    myCache.put('cPanel', angular.element('#cPanel'));
    $rootScope.sPort = null;
    $rootScope.onFormat = false;
    $rootScope.activePanel = 'wPanel';
    var win = gui.Window.get();
    win.show();
    $timeout(function() {
        angular.element('#loading-wrap').addClass('loaded');
    }, 2000);
}).controller('headerCtrl', function($rootScope, $scope) {
    $scope.isKeyShown = false;
    $scope.toggleKeyShown = function() {
        $scope.isKeyShown = !$scope.isKeyShown;
        if (!$scope.$$phase) {
            $scope.$digest();
        }
    };
    $scope.minimize = function() {
        gui.Window.get().minimize();
    };
    $scope.close = function() {
        gui.App.quit();
    };
    $scope.isKiosk = false;
    $scope.toggleMaximize = function() {
        $scope.isKiosk = !$scope.isKiosk;
        gui.Window.get().toggleKioskMode();
    };
}).controller('mainCtrl', function($scope) {
    $scope.jump = function(targetPanel) {
        $scope.activePanel = targetPanel;
    };
});;

angular.module('app.controllers', ['controller.wPanel', 'controller.rPanel', 'controller.sPanel', 'controller.cPanel']);

angular.module('app.services', ['service.write', 'service.read', 'service.export', 'service.import', 'service.format', 'service.advanced', 'service.basic']);