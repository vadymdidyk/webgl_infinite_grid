module.exports = {
  plugins: [
    require('autoprefixer')({ overrideBrowserslist: ['> 0.5%'] }),
    require('cssnano')({ preset: 'default' })
  ]
};