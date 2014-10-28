(function()
{
	var
		mod_name = 'preloader.resource.schema',
		mod = {
			'parents':['preloader.resource'],
			'uses':['config', 'schema'],

			'storage':{
				'content':null,
				'model':null,

				'opts':{
					'model':null,
					'dataType':'json'
				}
			},

			'proto':{
				'create_helper':null
			},

			'public':{
				'preload':function(p, next)
				{
					p('update_status', 'loading');
					this.set('next', next);

					pwf.schema.check(this.get('model'), function(err, model) {
						if (err) {
							p('update_status', 'failed', err);
						} else {
							p('update_status', 'ready');
						}
					});
				},

				'get_src':function()
				{
					return this.get('src') ?
						this.get('src'):
						pwf.config.get('models.url.schema').replace('{model}', this.get('model'));
				}
			}
		};

	/// Register, because we have existing pwf
	if (typeof pwf == 'object') {
		pwf.rc(mod_name, mod);
	}

	/// Export module because we may be inside nodejs.
	if (typeof module == 'object') {
		module.exports = mod;
	}
})();
