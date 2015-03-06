var async = require('async'),
    sp = require('serialport');
angular.module('service.basic', ['service.write', 'service.read', 'service.tools', 'service.import', 'service.export', 'service.format', 'service.advanced']).service('Basic', function($window, $rootScope, $filter, $cacheFactory, Tools, Write, Read, Import, Export, Format, Advanced, $timeout) {
    var myCache = $cacheFactory.get('myCache');
    this.list = function(callback) {
        async.waterfall([
            function(next) {
                sp.list(next);
            },
            function(ports, next) {
                console.debug('>>>>>ports:', ports);
                if (ports.length) {
                    var now = $rootScope.sPort ? $rootScope.sPort.path : null;
                    async.map(ports, function(item, cb) {
                        if (item.comName != now) {
                            var tmp = new sp.SerialPort(item.comName, {
                                baudrate: 57600,
                                parser: sp.parsers.custom()
                            }, false);
                            cb(null, tmp);
                        } else {
                            cb(null, $rootScope.sPort);
                        }
                    }, next);
                } else {
                    next(null, []);
                }
            },
            function(sPorts, next) {
                var results = [];
                async.each(sPorts, function(item, cb) {
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
                                    item.close(function(err) {
                                        console.error('error disconnect', err);
                                    });
                                    cb();
                                }).once('error', function() {
                                    item.close(function(err) {
                                        console.error('error closed', err);
                                    });
                                    cb();
                                }).on('data', function(buf) {
                                    console.debug('buf:', buf.toString('hex'));
                                    auto = false;
                                    if (buf[2] == 0x77) {
                                        results.push({
                                            display: '写机器',
                                            com: item.path
                                        });
                                        item.close(function(err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            cb();
                                        });
                                    } else if (buf[2] == 0x72) {
                                        results.push({
                                            display: '读机器',
                                            com: item.path,
                                            readId: 1
                                        });
                                        item.close(function(err) {
                                            if (err) {
                                                console.error(err);
                                            }
                                            cb();
                                        });
                                    }
                                });
                                Tools.communicateSP(item, Buffer.concat([
                                    new Buffer([0x34]),
                                    new Buffer($filter('date')(date, 'yyyyMMddHHmmss'), 'hex'),
                                    new Buffer([date.getDay()])
                                ]));
                                setTimeout(function() {
                                    if (auto) {
                                        item.close(function(err) {
                                            console.log('no back', err);
                                            cb();
                                        });
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
        async.series([
            function(cb) {
                if ($rootScope.sPort && $rootScope.sPort.path != com) {
                    $rootScope.sPort.close(function(err) {
                        $rootScope.sPort = null;
                        cb(err);
                    });
                } else {
                    cb();
                }
            }
        ], function(err) {
            if (err) console.error('cant close', err);
            if (!$rootScope.sPort) {
                $rootScope.sPort = new sp.SerialPort(com, {
                    baudrate: 57600,
                    parser: sp.parsers.custom()
                }, false);
                $rootScope.sPort.id = readId ? readId : 0;
                $rootScope.sPort.open(function(err) {
                    if (err) return $rootScope.sPort = null;
                });
                $rootScope.sPort.on('data', function(buf) {
                    var data = buf.toString('hex'),
                        status = data.substring(0, 4);
                    if (status.substring(2, 4) == '62') {
                        Tools.showLog('通讯开始，请勿断开连接...');
                    }
                    if (status.substring(2, 4) == '66') {
                        console.error('error code', data);
                        Tools.showLog('发送失败，请重新发送命令!');
                        if (status == '5f') {
                            Format.c();
                        }
                        return;
                    }
                    console.debug('>>>>>buffer:', data);
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
                    }
                }).once('error', function(err) {
                    myCache.get('sPanel').scope().error();
                    $rootScope.sPort.close(function(err) {
                        $rootScope.sPort = null;
                    });
                }).once('disconnect', function(err) {
                    myCache.get('sPanel').scope().error();
                    $rootScope.sPort.close(function(err) {
                        $rootScope.sPort = null;
                    });
                });
            }
        });
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
            $rootScope.sPort.close(function() {
                $rootScope.sPort = null;
            });
        }
    };
});