# webpack-resolve-config-plugin
Take dependency's webpack resolve configuration into consideration when bundling it with Webpack.

## What is It For?
In some cases, you may want to resolve the code under node_modules with its own webpack resolve configuration. Assumes that you have the following project structure:
```
app
├── node_modules
|   └── dependency
|       ├── src
|       |   ├── containers
|       |   |   └── index.js
|       |   └── index.js
|       ├── index.js
|       └── webpack.resolve.config.js
├── src
├── index.js
└── webpack.config.js
```
Here is the example code of each file:
```javascript
// app/node_modules/dependency/src/containers/index.js
export default "containers in dependency"

// app/node_modules/dependency/src/index.js
import containers from "containers"
...

// app/node_modules/dependency/index.js
import app from "./src/index.js"
...

// app/node_modules/dependency/webpack.resolve.config.js
module.exports = {
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "src")
    ]
  }
}

// app/index.js
import "dependency"
...

// app/webpack.config.js
module.exports = {
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "src")
    ]
  }
}
```
If you run the app directly, webpack will fail with `Cannot resolve "containers" in "app/node_modules/dependency/index.js"` error because webpack resolve the code under dependency with the resolve options in app/webpack.config.js. In this case, you can use WebpackResolveConfigPlugin to make webpack resolve the dependency code with dependency's webpack resolve configuration.

## How does It Work?
When webpack try to resolve a dependency in a file, it will pass a context to the resolver. Context is the current directory of the file. For instance, context will be `app/node_modules/dependency/src` when webpack try to resolve `containers` dependency in `app/node_modules/dependency/src/index.js` file. WebpackResolveConfigPlugin hook into normalModuleFactory.beforeResolve to add dependency's own resolve confgurations to the resolveOptions passed to the resolver to make it resolve dependency based on current resolve config.

## How to Use It?
### Installation
First things first, install it with npm/yarn:
```shell
// via npm
npm install --save-dev webpack-resolve-config-plugin

// via yarn
yarn add -D webpack-resolve-config-plugin
```

### Put It in Your webpack.config.js
```javascript
const WebpackResolveConfigPlugin = require("webpack-resolve-config-plugin")

module.exports = {
  ...
  plugins: [
    new WebpackResolveConfigPlugin(options)
  ]
}
```

### Options
You can pass a hash of configuration options to WebpackResolveConfigPlugin. Allowed values are as follows:
* [`include`]. Only the context matched with the regex in `include` attribute will be resolved with its own configuration. The `include` attribute can be one of the following types:
  * Regex. A regex to test the resolve context.
  * Object. The options object must have a `match` key which is a regex. Beside this, you can also provides the resolve configuration file name of the dependency(Default value for this is `webpack.resolve.config.js`) with `file` key.
  * Array. It can be either an array of regex or an array of the above options object.
* [`exclude`]. Context matched with the regex in exclude will be ignored by WebpackResolveConfigPlugin. The `exlcude` attribute can be one of the following types:
  * Regex. A regex to test the resolve context.
  * Array. An array of regex.

**Notes** Exclude attribute has higher priority than the include attribute.

#### Example of Options
```javascript
{
  include: /dependency/,
  exlcude: /anotherdependency/
}

{
  include: {
    match: /dependency/,
    file: 'webpack.resolve.config.js'
  }
}

{
  include: [
    {
      match: /dependency1/,
      file: 'webpack.resolve.js'
    },
    {
       match: /dependency2/,
       file: 'webpack.resolve.config.js'
    }
  ],
  exlcude: [
    /dependency1/,
    /dependency2/
  ]
 }
```
### Webpack.resolve.config.js
The best practice to use WebpackResolveConfigPlugin is using a seperate configuration file for the resolve configuration(So the default webpack resolve configuration file is `webpack.resolve.config.js` instead of `webpack.config.js`). The reason for that is if you use a whole webpack configuration for the dependency, some dev dependencies of this package may needed to be installed to make it work.

The content of webpack.resolve.config.js is the exact same one documented in [Webpack DOC](https://webpack.js.org/configuration/resolve/).

Example:
```javascript
const path = require('path')

module.exports = {
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ]
  }
}
```
