

## Vue.js

Vue.js disables environment varialbes that don't begin with `VUE_APP`.

You can modify `vue.config.js` to disable this functionality:

```
module.exports = {
    configureWebpack: config => {
        const prefixRE = /^VERIDA_/;
        Object.keys(process.env).forEach(key => {
            if (prefixRE.test(key)) {
                config.plugins[1].definitions['process.env'][key] = JSON.stringify(process.env[key]);
            }
        });
    }
}
```