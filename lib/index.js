var _ = require('lodash'),
  i18n = require('i18n-2');

var internals = {
  defaults: {
    locales: ['en'],
    directory: './locales',
    subdomain: true,
    cookie: 'lang',
    readQuery: true,
    extension: '.json'
  }
};

var getSyntheticRequestForI18n2 = function(request, settings){
  var req = {
    host:  request.info.host,
    headers: {
      host: request.info.host
    },
    cookies: request.cookies ? request.cookies : {},
  };
  if (settings.readQuery) {
    req.query = request.query;
  }
  if (request.raw.req.headers['accept-language']) {
    req.headers['accept-language'] = request.raw.req.headers['accept-language'];
  }
  // Reading lang from session too if set
  if (request.session && request.session.get) {
    var locale = request.session.get(settings.name);
    if (locale) {
      req.cookies[settings.name] = locale;
    }
  }
  return req;
};

var getLocalesListWithHostDomainPreferred = function(settings, req){
  var host = req.host;
  if (host.indexOf('www.') === 0) {
    host = host.substr(4);
  }
  if (settings.domains[host]) {
    var locales = [ settings.domains[host] ];
    for (var i = 0, l = settings.locales.length; i < l; i++) {
      if (settings.locales[i] !== settings.domains[host]) {
        locales.push(settings.locales[i]);
      }
    }
    return locales;
  }
  return settings.locales;
};

var getAssignI18nToRequestFunction = function(settings){
  return function assignI18nToRequest(request, next) {
    if (request.route.plugins.hasOwnProperty('hapi18n') && request.route.plugins.hapi18n === false){
      return next();
    }

    var i18nSettings = _.clone(settings);
    i18nSettings.request = getSyntheticRequestForI18n2(request, settings);

    if (settings.domains) {
      i18nSettings.locales = getLocalesListWithHostDomainPreferred(settings, req);
    }

    request.i18n = new i18n(i18nSettings);
    next();
  };
};

var assignI18nMethodToViewContext = function (request, next) {
  var response = request.response;
  if (request.i18n && response.variety === 'view') {
    response.source.context = response.source.context || {};
    response.source.context.i18n = {};
    i18n.registerMethods(response.source.context.i18n, request);
  }
  next();
};

exports.register = function (plugin, options, next) {
  var settings = _.extend(internals.defaults, options || {});

  var assignI18nToRequest = getAssignI18nToRequestFunction(settings);
  plugin.ext('onPreHandler', assignI18nToRequest);
  plugin.ext('onPreResponse', assignI18nMethodToViewContext);

  next();
};

exports.register.attributes = {
  pkg: require('./../package.json')
};