var ffi = require('ffi'),
    ref = require('ref'),
    RC = ffi.Library('dll_camera.dll', {
        GetDevice: ['int', []],
        StartDevice: ['bool', []],
        ReleaseDevice: ['void', []],
        ReleaseLostDevice: ['void', []],
        SetBeep: ['void', ['bool']],
        SetBeepTime: ['void', ['int']],
        setQRable: ['void', ['bool']],
        GetDecodeString: ['void', ['char *']]
    });

process.on('message', function(msg) {
    switch (msg.type) {
        case 1:
            if (RC.GetDevice() > 0) {
                RC.ReleaseDevice();
                RC.StartDevice();
                RC.SetBeepTime(100);
            }else{
                process.exit();
            }
            break;
        case 2:
            RC.setQRable(true);
            var buf = new Buffer(100),
                loop;
            buf.type = ref.types.CString;
            loop = setInterval(function() {
                RC.GetDecodeString(buf);
                if (ref.readCString(buf, 0)) {
                    RC.setQRable(false);
                    clearInterval(loop);
                    process.send({
                        type: 2,
                        content: ref.readCString(buf, 0)
                    });
                }
            }, 50);
            break;
    }
});