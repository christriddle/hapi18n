# hapi18n

I18n plugin for hapi

## Getting Started
Install **hapi18n** by either running `npm install hapi18n` in your sites working directory or add 'hapi18n' to the dependencies section of the 'package.json' file and run npm install.

### Required permissions
**hapi18n** requires the following permissions to be granted on the server for the plugin to work correctly: NONE yet

### What you get
In your route handlers :
```js
handler: function () {
  this.reply(
    this.i18n.__("My localized string")
  );
}
```

In your templates :
```js
  <%= i18n.__("My localized string") %>
```



### Available options
```js
hapi18n: {
    // Available locales
    locales: ['en', 'fr', 'es', 'de'],

    // The path to the directory of your locale files
    directory: './locales',

    // Locale files extension
    extension: '.json',

    // Add missing locale keys to your files when true
    devMode: false,

    // Wether to check the locale from the subdomain
    // ex : http://es.domain.com
    subdomain: true,

    // Wether to check the locale from this cookie name
    cookie: 'lang',
}
```
