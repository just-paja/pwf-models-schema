Schema manager for pwf models suiteable for frontend. Loads schema of a model and its' relations from server. Also includes [schema](#preloaderresourceschema) resource for [pwf-preloader](https://github.com/just-paja/pwf-preloader).

# Requirements
* [pwf.js](https://github.com/just-paja/pwf.js)
* [pwf-config](https://github.com/just-paja/pwf-config)
* [pwf-models](https://github.com/just-paja/pwf-models)
* [pwf-async-compat](https://github.com/just-paja/pwf-async-compat)

# Installation
```bash
bower install pwf-models-schema
```

```html
<!DOCTYPE html>
<html>
<head>
  <script type="text/javascript" src="bower/pwf.js/lib/pwf.js">
  <!-- Include dependencies -->
  <script type="text/javascript" src="bower/pwf-models-schema/lib/schema.js">
  <script type="text/javascript">
    pwf.schema.check('ModelName', function() {
      v(pwf.model.get('ModelName'));
    });
  </script>
</head>
</html>
```

# Usage
Schema very few methods. For example of server API to serve models, see [fudjan-api](https://github.com/just-paja/fudjan-api)

## Methods
### is_ready()
Waits for pwf-model, pwf-config and pwf-async-compat on module register

### check(model, next)
Checks certain ```model``` and its' relations. If it does not exist, it's loaded from server. When loading is finished, ```next``` callback is fired from [pwf-queue](https://github.com/just-paja/pwf-queue). If model schema is already loading, it will not trigger another request to server, just add ```next``` to queue.

```javascript
pwf.schema.check('MyModelName', function() {
  v('MyModelName schema was loaded');
})
```

### check_rels(model, next)
Check all relations of ```model```. If some of them does not exist, it's loaded from server via [#check](#check). ```next``` callback is fired immediately when loading is finished with first argument ```err``` representing error message.

```javascript
pwf.schema.check_rels('MyModelName', function(err) {
  v('Loading of relations for MyModelName is finished', err);
})
```

### get_event_for_model(model)
Returns queue event name for ```model```.

## preloader.resource.schema
It is a supplementary resource for [preloader](https://github.com/just-paja/pwf-preloader), so you can preload schemas with ease and display progress. It inherits from [preloader.resource.ajax](https://github.com/just-paja/pwf-preloader#preloaderresourceajax). Usage is same as any other [preloader.resource](https://github.com/just-paja/pwf-preloader#preloaderresource).

### Attributes
```javascript
{
  // Name of model to load
  'model':'StringNameOfModel'
}
```
