/**
 * Dynamic data model abstraction. Handles predefined data formats and data
 * types. Also caches data on client-side for simpler updates and lower memory
 * consumption.
 */
(function()
{
	var
		mod_name = 'schema',
		mod_inst = true,
		mod = function()
		{
			var loading = [];


			this.is_ready = function()
			{
				return pwf.mi(['model', 'config']);
			};


			this.check = function(model, next)
			{
				var
					model = model.replace(/^\:\:/, ''),
					def = pwf.model.get(model);

				if (typeof def == 'undefined' || def === null) {
					if (loading.indexOf(model) >= 0) {
						pwf.queue.on('model-registered.' + model, function(pack) {
							pack.data(null, pack.response);
						}, next);
					} else {
						var url = pwf.config.get('models.url_schema');
						loading.push(model);

						if (typeof url == 'string') {
							url = url.replace('{model}', model);

							pwf.comm.get(url, {}, function(ctrl, model, next) {
								return function(err, response) {
									if (!err) {
										pwf.model.register(model, {
											'attrs':response.data
										});

										ctrl.check(model, next);
									} else {
										next(err, null);
									}
								};
							}(this, model, next));
						} else throw new Error('Please define models.schema.url as string.');
					}
				} else {
					this.check_rels(model, function(next) {
						return function(err, model) {
							next(err, model);
						};
					}(next));
				}

				return this;
			};


			this.check_rels = function(model, next)
			{
				var
					extra_models = [],
					attrs = pwf.model.get_attrs(model);

				for (var i = 0; i < attrs.length; i++) {
					if (attrs[i].type == 'model' || attrs[i].type == 'collection') {
						var
							m = attrs[i].model,
							def = pwf.model.get(m);

						if (typeof def == 'undefined' || def === null) {
							extra_models.push(m);
						}
					}
				}

				if (extra_models.length) {
					var jobs = [];

					for (var i = 0; i < extra_models.length; i++) {
						jobs.push(function(ctrl, model) {
							return function(next) {
								ctrl.check(model, next);
							};
						}(this, extra_models[i]));
					}

					pwf.async.parallel(jobs, function(ctrl, model, next) {
						return function(err, results) {
							next(err, pwf.model.get(model));
						};
					}(this, model, next));

				} else {
					next(null, pwf.model.get(model));
				}

				return this;
			};

		};


	/// Register, because we have existing pwf
	if (typeof pwf == 'object') {
		pwf.register(mod_name, mod, mod_inst);
	}

	/// Export module because we may be inside nodejs.
	if (typeof process != 'undefined') {
		module.exports = mod;
	}
})();
