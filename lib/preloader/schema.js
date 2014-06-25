(function()
{
	var
		mod_name = 'preloader.resource.schema',
		mod = {
			'parents':['preloader.resource'],
			'uses':['schema'],

			'storage':{
				'content':null,
				'model':null,

				'opts':{
					'dataType':'json'
				}
			},

			'proto':{
				'create_helper':null
			},

			'public':{
				'preload':function(proto, next)
				{
					proto('update_status', 'loading');
					this.set('next', next);

					pwf.schema.check(this.get('model'), function(ctrl, proto) {
						return function(err, model) {
							if (err) {
								proto('update_status', 'failed', err);
							} else {
								proto('update_status', 'ready');
							}
						};
					}(this, proto));
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
