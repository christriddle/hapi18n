// Load modules

var Hoek = require('hoek'),
    i18n = require('i18n');


// Declare internals

var internals = {};

internals.defaults = {
  cookie: 'lang',
  locales:['en', 'fr'],
  defaultLocale: 'en',
  directory: './locales',
  updateFiles: false,

  name: 'i18n',
  cookieOptions: {
    path: '/'
  },
  viewKey: '__',
  pluralViewKey: '__n'
};

exports.register = function (pack, options, next) {
    
  //Hoek.assert(typeof pack.state === 'function', 'Plugin permissions must allow state');
  //Hoek.assert(typeof pack.helper === 'function', 'Plugin permissions must allow helper');

  var settings = Hoek.applyToDefaults(internals.defaults, options || {});
  i18n.configure(settings);

  //pack.state(settings.name, settings.cookieOptions);
  //pack.helper(settings.viewKey, function () {});
  //pack.helper(settings.pluralViewKey, function () {});

  /**
   * Add to view context
   */
  pack.ext('onPreResponse', function (request, next) {

    if (!request.route.plugins.hasOwnProperty('hapi18n')
      || request.route.plugins.hapi18n !== false) {

      var req = {
        headers: {},
        cookies: {}
      };
      if (request.raw.req.headers['accept-language']) {
        req.headers['accept-language'] = request.raw.req.headers['accept-language'];
      }

      var response = request.response();
      if (response.varieties && response.varieties.view) {

        var i18nexport = {};
        i18n.init(req, i18nexport, function() {
          response.view.context = response.view.context || {};
          response.view.context[settings.viewKey] = function () {
            return i18n.__.apply(i18nexport, arguments);
          };
          response.view.context[settings.pluralViewKey] = function () {
            return i18n.__n.apply(i18nexport, arguments);
          };
          next();
        });

      } else {
        return next();
      }

    } else {
      return next();
    }
  });

  next();
};