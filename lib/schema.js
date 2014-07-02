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
				return pwf.mi(['model', 'config', 'async']);
			};


			this.get_event_for_model = function(model)
			{
				return 'pwf-model-schema-loaded.' + model;
			};


			this.check = function(model, next)
			{
				var
					model = model.replace(/^\:\:/, ''),
					def = pwf.model.get(model);

				if (typeof def == 'undefined' || def === null) {
					var ctx = {
						'next':next,
						'model':model
					};

					pwf.queue.on(this.get_event_for_model(model), function(pack) {
						next(pack.response.err, pack.response);
					}, ctx);

					if (loading.indexOf(model) < 0) {
						var url = pwf.config.get('models.url.schema');
						loading.push(model);

						if (typeof url == 'string') {
							url = url.replace('{model}', model);

							pwf.comm.get(url, {}, function(ctrl, model) {
								return function(err, response) {
									if (err === null) {
										pwf.model.register(model, {
											'attrs':response.data
										});

										ctrl.check_rels(model, function(ctrl, model_name) {
											return function(err, model) {
												pwf.queue.fire(ctrl.get_event_for_model(model_name), {
													'err':err,
													'model_name':model_name,
													'model':model
												});
											};
										}(ctrl, model));
									} else {
										pwf.queue.fire(ctrl.get_event_for_model(model), {'err':err});
									}
								};
							}(this, model));
						} else throw new Error('Please define models.schema.url as string.');
					}
				} else {
					this.check_rels(model, next);
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
