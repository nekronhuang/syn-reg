# syn-reg

An example usage of nw.js, edge.js, node-serialport, node-ffi and angular.js.

## Setup
**Note: Only support Windows 32-bit**
Assuming the version of nw.js is 0.12.1.

### edge.js
1. npm install edge
2. cd node_modules\edge
3. nw-gyp rebuild --target=0.12.1 --arch=ia32 --target_arch=ia32 
4. copy build\release\edge.node lib\native\win32\ia32\0.12.0
5. edit lib\edge.js

```
//nw.js is based off IO.js v1.2.0
- [ /^0\.12\./, '0.12.0' ]
+ [ /1.2.0/, '0.12.0' ]
```    
### node-serialport
1. npm install serialport
2. cd node_modules\serialport
3. node-pre-gyp rebuild --runtime=node-webkit --target=0.12.1  --target_arch=ia32
4. edit package.json

```
//edit node_abi
- "module_path": "./build/{module_name}/v{version}/{configuration}/{node_abi}-{platform}-{arch}/",
+ "module_path": "./build/{module_name}/v{version}/{configuration}/node-webkit-v0.12.1-{platform}-{arch}/",
```

### node-ffi
1. npm install ref
2. npm install ffi
2. cd node_modules\ref
3. nw-gyp rebuild --target=0.12.1 --target_arch=ia32
2. cd ..\ffi
3. nw-gyp rebuild --target=0.12.1 --target_arch=ia32