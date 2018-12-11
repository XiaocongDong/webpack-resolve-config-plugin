# webpack-resolve-config-plugin
Take dependency's webpack resolve configuration into consideration when bundling it with Webpack.

## What is it for?
In some cases, you may want to resolve the code under node_modules with its own webpack resolve configuration. Let's say you have the following project structure:
```javascript
app
├── node_modules
|   └── dependency
|       ├── src
|       |   ├── containers
|       |   |   └── index.js
|       |   └── index.js
|       ├── index.js
|       └── webpack.config.js
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

// app/node_modules/dependency/webpack.config.js
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
If you run the app directly, webpack will fail with `Cannot resolve "containers" in "app/node_modules/dependency/index.js"` error because webpack resolve the code under dependency with the resolve options in app/webpack.config.js. In this case, you can use WebpackResolveConfigPlugin to help webpack resolve the dependency code with dependency's webpack resolve configuration.

## How to use it?
### Installation
First things first, install it with npm/yarn:
```shell
// via npm
npm install --save-dev webpack-resolve-config-plugin

// via yarn
yarn add -D webpack-resolve-config-plugin
```
### Put it in your webpack.config.js
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
* [`test`] test attribute can be the following types:
  * Regex. A regex to test the resolve context. When webpack try to resolve a dependency in a file, it will pass a context to the resolver. Context is the current directory of the file. For instance, context is `app/node_modules/dependency/src` when webpack try to resolve `containers` dependency in `app/node_modules/dependency/src/index.js` file.
  * Object. The options object must have a `match` key which serves the same purpose as above Regex. Beside this, you can also provides the resolve configuration name of the dependency(Default value for this is `webpack.config.js`) with `file` key.
  * Array. It can be an array of the above options object.
#### Example of Options
```javascript
// regex
{
  test: /dependency/
}

// object
{
  test: {
    match: /dependency/,
    file: 'webpack.resolve.config.js'
  }
}

// array
{
  test: [
    {
      match: /dependency1/,
      file: 'webpack.resolve.js'
    },
    {
       match: /dependency2/,
       file: 'webpack.resolve.config.js'
    }
  ]
 }
```
