var async = require('async'),
    sp = require('serialport');
angular.module('service.basic', ['service.write', 'service.read', 'service.tools', 'service.import', 'service.export', 'service.format', 'service.advanced', 'service.parser']).service('Basic', function($window, $rootScope, $filter, Tools, Write, Read, Import, Export, Format, Advanced, Parser, $timeout) {
    var sPorts;
    this.list = function(callback) {
        async.waterfall([
            function(next) {
                sp.list(function(err, _ports) {
                    var ports = _ports.filter(function(item, i) {
                        if (item.manufacturer == 'Silicon Laboratories') {
                            return true;
                        }
                    });
                    next(err, ports);
                });
            },
            function(ports, next) {
                //console.debug('>>>>>ports:', ports);
                var now = $rootScope.sPort ? $rootScope.sPort.path : null;
                sPorts = ports.map(function(item, i) {
                    if (item.comName == now) {
                        return $rootScope.sPort;
                    } else {
                        return new sp.SerialPort(item.comName, {
                            baudrate: 57600,
                            parser: Parser.normal
                        }, false);
                    }
                });
                next();
            },
            function(next) {
                var results = [];
                async.each(sPorts, function(item, cb) {
                    var index = sPorts.indexOf(item);
                    if (item.isOpen()) {
                        if ($rootScope.sPort.id == 1) {
                            results.push({
                                display: '读机器',
                                com: item.path,
                                readId: 1
                            });
                        } else {
                            results.push({
                                display: '写机器',
                                com: item.path
                            });
                        }
                        cb();
                    } else {
                        item.open(function(err) {
                            if (err) {
                                console.error(item.path, item, err);
                                cb();
                            } else {
                                var auto = true,
                                    date = new Date();
                                item.once('disconnect', function() {
                                    item.close(function() {
                                        sPorts.splice(index, 1);
                                        if (auto) {
                                            auto = false;
                                            cb();
                                        }
                                    });
                                }).once('error', function() {
                                    item.close(function() {
                                        sPorts.splice(index, 1);
                                        if (auto) {
                                            auto = false;
                                            cb();
                                        }
                                    });
                                }).once('data', function(buf) {
                                    auto = false;
                                    if (buf[2] == 0x77) {
                                        results.push({
                                            display: '写机器',
                                            com: item.path
                                        });
                                    } else if (buf[2] == 0x72) {
                                        results.push({
                                            display: '读机器',
                                            com: item.path,
                                            readId: 1
                                        });
                                    }
                                    cb();
                                });
                                Tools.communicateSP(item, Buffer.concat([
                                    new Buffer([0x34]),
                                    new Buffer($filter('date')(date, 'yyyyMMddHHmmss'), 'hex'),
                                    new Buffer([date.getDay()])
                                ]));
                                setTimeout(function() {
                                    if (auto) {
                                        console.info(item.comName + 'no answer.');
                                        cb();
                                    }
                                }, 3000);
                            }
                        });
                    }
                }, function(err) {
                    next(null, results);
                });
            }
        ], callback);
    };
    this.build = function(com, readId) {
        sPorts.forEach(function(item) {
            if (item.path == com) {
                $rootScope.sPort = item;
                $rootScope.sPort.id = readId ? readId : 0;
            } else {
                item.close(function(err) {});
            }
        });
        if ($rootScope.sPort) {
            $rootScope.sPort.removeAllListeners();
            $rootScope.sPort.on('data', function(buf) {
                var data = buf.toString('hex'),
                    status = data.substring(0, 4);
                if (status.substring(2, 4) == '62') {
                    Tools.showLog('通讯开始，请勿断开连接...');
                }
                if (status.substring(2, 4) == '66') {
                    console.error('error code', data);
                    Tools.showLog('通讯失败，请重新发送命令!');
                    if (status == '5f') {
                        Format.c();
                    }
                    return;
                }
                //console.debug('>>>>>buffer:', data);
                switch (status) {
                    case '3163':
                        Write.c();
                        break;
                    case '3173':
                        Write.s(buf);
                        break;
                    case '3273':
                        Read.s(buf);
                        break;
                    case '3473':
                        Import.s(buf);
                        break;
                    case '3573':
                        Format.s();
                        break;
                    case '3662':
                        Export.b(buf);
                        break;
                    case '3663':
                        Export.c(buf);
                        break;
                    case '3673':
                        Export.s(buf);
                        break;
                    case '3973':
                        Advanced.s9();
                        break;
                    case '3e73':
                        $rootScope.sPort.close(function(err) {
                            $rootScope.sPort = null;
                            $rootScope.showDialog('连接断开!');
                        });
                        break;
                    case '4273':
                        if ($rootScope.activePanel != 'sPanel') {
                            Tools.showLog('写入权限完成...');
                        }
                        break;
                    case '4373':
                        if ($rootScope.activePanel != 'sPanel') {
                            Advanced.auth(buf.slice(2));
                        }
                        break;
                    case '5173':
                        Advanced.init();
                        break;
                    case '5a73':
                        Export.save(buf);
                        break;
                    case '5c73':
                        Import.s();
                        break;
                }
            }).once('error', function() {
                $rootScope.$broadcast('disconnect');
            }).once('disconnect', function() {
                $rootScope.$broadcast('disconnect');
            });
        } else {
            $rootScope.$broadcast('disconnect');
        }
    };
    this.disconnect = function() {
        if ($rootScope.sPort) {
            Tools.communicateSP($rootScope.sPort, new Buffer('3e', 'hex'));
            $timeout(function() {
                if ($rootScope.sPort) {
                    $rootScope.sPort.close(function() {
                        $rootScope.sPort = null;
                    });
                }
            }, 500);
        } else {
            $rootScope.showDialog('未连接!');
        }
    };
    $window.onbeforeunload = function(event) { //f5
        if ($rootScope.sPort) {
            // Tools.communicateSP($rootScope.sPort, new Buffer('3e', 'hex'));
            $rootScope.sPort.close(function() {});
        }
    };
});
