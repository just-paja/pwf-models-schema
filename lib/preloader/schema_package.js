(function()
{
	var
		mod_name = 'preloader.resource.schema_package',
		mod = {
			'parents':['preloader.resource.ajax'],
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
				'create_helper':null,

				'downloaded':function(p)
				{
					var
						cont = this.get_content(),
						data = cont.data;

					for (var i = 0, len = data.length; i < len; i++) {
						pwf.reg_class(data[i]);
					}

					pwf.queue.fire('pwf-schema-loaded.' + this.get('name'));
				},
			},


			'public':{
				'get_src':function()
				{
					return this.get('src') ?
						this.get('src'):
						pwf.config.get('models.url.pack').replace('{name}', this.get('name'));
				}
			}
		};

	/// Register, because we have existing pwf
	if (typeof pwf == 'object') {
		pwf.reg_class(mod_name, mod);
	}

	/// Export module because we may be inside nodejs.
	if (typeof module == 'object') {
		module.exports = mod;
	}
})();
