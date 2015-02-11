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
			var
				loading = [],

				self = this;


			this.is_ready = function()
			{
				return pwf.has('module', ['config', 'async']) && pwf.has('class', 'model');
			};


			this.get_event_for_model = function(model)
			{
				return 'pwf-model-schema-loaded.' + model;
			};


			this.check = function(model, go)
			{
				var
					jobs  = [],
					model = model.replace(/^\:\:/, ''),
					def = pwf.get_class(model),
					url;

				if (!def) {
					if (loading.indexOf(model) < 0) {
						url = pwf.config.get('models.url.schema');

						if (typeof url == 'string') {
							url = url.replace('{model}', model);
							loading.push(model);

							jobs.push(function(next) {
								pwf.comm.get(url, {}, next);
							});

							jobs.push(function(res, next) {
								pwf.reg_class(model, {
									'parents':['model'],
									'static':{
										'attrs':res.data
									}
								});

								next();
							});
						} else throw new Error('schema:check:undefined:models.schema.url');
					}
				}

				jobs.push(function(next) {
					pwf.wait_for('class', model, next);
				});

				jobs.push(function(next) {
					self.check_rels(model, next);
				});

				pwf.async.waterfall(jobs, function(err) {
					var index = loading.indexOf(model);

					if (~index) {
						loading.splice(index, 1);
					}

					if (go instanceof Function) {
						go(err);
					}
				});
				return this;
			};


			this.check_rels = function(model, next)
			{
				var
					extra_models = [],
					attrs = pwf.get_class(model).get_attrs();

				for (var i = 0; i < attrs.length; i++) {
					if (attrs[i].type == 'model' || attrs[i].type == 'collection') {
						var
							m = attrs[i].model,
							def = pwf.get_class(m);

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
							next(err, pwf.get_class(model));
						};
					}(this, model, next));

				} else {
					next(null, pwf.get_class(model));
				}

				return this;
			};

		};


	/// Register, because we have existing pwf
	if (typeof pwf == 'object') {
		pwf.reg_module(mod_name, mod, mod_inst);
	}

	/// Export module because we may be inside nodejs.
	if (typeof process != 'undefined') {
		module.exports = mod;
	}
})();
