var async = require('async'),
    sp = require('serialport');
angular.module('service.basic', ['service.write', 'service.read', 'service.tools', 'service.import', 'service.export', 'service.format', 'service.advanced']).service('Basic', ['$rootScope', '$filter', '$cacheFactory', 'Tools', 'Write', 'Read', 'Import', 'Export', 'Format', 'Advanced',
    function($rootScope, $filter, $cacheFactory, Tools, Write, Read, Import, Export, Format, Advanced) {
        this.list = function(callback) {
            async.waterfall([
                function(next) {
                    sp.list(next);
                },
                function(ports, next) {
                    console.debug('>>>>>ports:',ports);
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
                            if (typeof($rootScope.sPort.id) == 'string') {
                                results.push({
                                    display: '读机器',
                                    com: item.path,
                                    readId: $rootScope.sPort.id
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
                                    console.error('cant open' + item.path);
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
                                                com: item.path
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
                                                console.log('regular close', err);
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
        }
        this.build = function(com, readId) {
            var myCache = $cacheFactory.get('myCache');
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
                        console.debug('>>>>>buffer:',data);
                        if (status.substring(2,4)=='62') {
                            Tools.showLog('通讯开始，请勿断开连接');
                        }
                        if (status.substring(2,4)== '66') {
                            console.error('error code',data);
                            Tools.showLog('发送失败，请重新发送命令!');
                            if (status == '5f') {
                                Format.c();
                            }
                            return;
                        }
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
                            case '5173':
                                Advanced.init();
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
        }
        this.disconnect = function() {
            if ($rootScope.sPort) {
                $rootScope.sPort.close(function(err) {
                    $rootScope.sPort = null;
                    if (err) {
                        console.error(err);
                    }
                });
            } else {
                $rootScope.showDialog('未连接！');
            }
        }
    }
]);