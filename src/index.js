const findParentDir = require('find-parent-dir')
const path = require('path')
const fs = require('fs')
const schema = require('../schemas/plugin.json')
const validateOptions = require('schema-utils')

const resolveOptionsCache = new Map()

const getCurrentWebpackResolveConfig = (context, configFileName = 'webpack.resolve.config.js') => {
  try {
    const dir = findParentDir.sync(context, 'package.json')

    let resolveOptions = resolveOptionsCache.get(dir)
    
    // Cache matched
    if (resolveOptions) {
      return resolveOptions
    }

    const resolveConfigPath = require.resolve(path.join(dir, configFileName))
    let config = require(resolveConfigPath)

    if (typeof config === 'function') {
      config = config()
    }
    if (typeof config !== 'object') {
      throw new Error()
    }
    
    resolveOptions = config.resolve

    resolveOptionsCache.set(dir, resolveOptions)

    return resolveOptions
  } catch (e) {
    // Do nothing if error occurs
    return {}
  }
}

class WebpackResolveConfigPlugin {
  constructor (options) {
    validateOptions(schema, options, 'WebpackResolveConfigPlugin')
    this.options = this.normalizeOptions(options)
  }

  normalizeOptions (options) {
    let include = options.include

    if (!Array.isArray(include)) {
      options.include = [
        include
      ]
    }
    let exclude = options.exclude
    
    if (!exclude) {
      options.exclude = []
    } else if (!Array.isArray(exclude)) {
      options.exclude = [
        exclude
      ]
    }
    
    return options
  }

  apply (compiler) {
    compiler.hooks.normalModuleFactory.tap('WebpackResolveConfigPlugin', normalModuleFactory => {
      normalModuleFactory.hooks.beforeResolve.tapAsync('WebpackResolveConfigPlugin', (data, callback) => {
        // Find the first match
        let option = this.options.include.find(
          option => option instanceof RegExp
            ? option.test(data.context)
            : option.match.test(data.context)
        )

        if (option && !this.options.exclude.some(regex => regex.test(data.context))) {
          const resolveOptions = getCurrentWebpackResolveConfig(data.context, option.file)

          if (Object.keys(resolveOptions).length > 0) {
            // Only use dependency's resolve options if it has any
            data.resolveOptions = resolveOptions            
          }
        }
  
        callback()
      })
    })
  }
}

module.exports = WebpackResolveConfigPlugin