/**
 * @projectDescription This is an experimental and unfinished JavaScript
 * library which will be capable of generating a full CRUD interface based on
 * a boto_web environment.
 *
 * @author    Ian Paterson
 * @namespace boto_web.ui.js
 */

/**
 * CRUD interface for simplified web application implementation based on a
 * boto_web environment.
 */
boto_web.ui = {
	/**
	 * Initializes the boto_web interface.
	 *
	 * @param {boto_web.Environment} env The current boto_web environment.
	 */
	init: function(env) {
		var self = boto_web.ui;

		self.node = $('<div/>')
			.addClass('boto_web')
			.appendTo('body');
		self.header = $('<div/>')
			.addClass('header')
			.appendTo(self.node);
		self.heading = $('<h1/>')
			.text('Database Management')
			.appendTo(self.header);
		self.nav = $('<ul/>')
			.addClass('nav')
			.appendTo(self.header);
		self.content = $('<div/>')
			.attr({id: 'content'})
			.appendTo(self.node);

		self.pages = {};
		// Merge homepage as a generated false API
		$.each($.merge([{href: 'home', name: 'Home', home: 1}], env.apis), function() {
			this.page = new boto_web.ui.Section(this, env);
			$('<a/>')
				.attr({href: '#' + this.page.href})
				.text(this.name)
				.appendTo($('<li/>').appendTo(self.nav));

			self.pages[this.href] = this.page;
		});

		env.models.User.all(function(o) { alert(o.length)} );
		env.models.User.get(env.user.id, function(o) { o.show_editor(); });
		//.show_editor();
	},

	Section: function(api, env) {
		var self = this;

		self.api = api;
		self.href = '/' + self.api.href;
		self.name = 'Database Management' + ((api.home) ? '' : ' &ndash; ' + self.api.name);

		self.node = $('<div/>')
			.attr({id: self.api.href})
			.text('Unfinished content placeholder for ' + self.api.name + ' page.')
			.addClass('page')
			.load(function() { boto_web.ui.heading.html(self.name) })
			.hide()
			.appendTo(boto_web.ui.node);
		self.content = $('<div/>')
			.attr({id: self.api.href + '_main'})
			.addClass('content')
			.appendTo(self.node)
		for (var i in self.api.methods) {
			switch (i) {
				case 'put':
				case 'post':
				case 'get':
					$('<a/>')
						.attr({href: '#' + self.href + '/' + i})
						.text(self.api.methods[i])
						.addClass('button')
						.appendTo(self.content)
				default:
					$('<div/>')
						.attr({id: self.api.href + '_' + i})
						.text('Please wait, loading.')
						.addClass('content')
						.hide()
						.load(function() { alert('loaded') })
						.appendTo(self.node)
			}
		}
	},

	BaseModelEditor: function(model, obj, opts) {
		var self = this;

		self.node = $('<div/>')
			.addClass('content')
			.appendTo(model.api.page.node);

		model.api.page.node.show();

		self.properties = model.api.properties;
		self.obj = obj;
		self.model = model;
		self.fields = [];

		$(self.properties).each(function() {
			var props = $.extend(this, {value: obj.properties[this.name]});
			var field;

			switch (this.type) {
				case 'string':
				case 'integer':
					field = new boto_web.ui.text(props)
						.read_only(false);
					break;
				case 'dateTime':
					field = new boto_web.ui.date(props)
						.read_only(false);
			}

			if (typeof field == 'undefined') return;

			self.fields.push(field);
			field.node.appendTo(self.node)
		});

		self.submit = function() {
			var self = this;
			var data = {id: self.obj.id};

			$(self.fields).each(function() {
				data[this.field.attr('name')] = this.field.val();
			});

			self.model.save(data);
		};

		$('<input/>')
			.attr({type: 'submit'})
			.text('Update')
			.click(function() { self.submit() })
			.appendTo(self.node);
	},


	/**
	 * Generic interface for all field types.
	 *
	 * @param {Object} properties HTML node properties.
	 */
	_field: function(properties) {
		var self = this;
		this.node = $('<div/>');
		this.label = $('<label/>').text(properties._label || '');
		this.field = $('<' + (properties._tagName || 'input') + '/>');
		this.text = $('<span/>');

		properties.id = properties.id || 'field_' + properties.name;

		for (p in properties) {
			var v = properties[p];

			if (p.indexOf('_') == 0)
				continue;

			//TODO More special cases needed (i.e. multiple choice items)
			switch (p) {
				case 'choices':
					for (i in v) {
						v[i].text = v[i].text || v[i].value;
						var opt = $('<option/>').attr(v[i]);

						this.field.append(opt)
					}
					break;
				default:
					this.field.attr(p, v);
			}
		}

		if (properties._default) {
			this.field.val(properties._default);
		}

		this.text.text(this.field.val());

		/**
		 * Switches the
		 */
		this.read_only = function(on) {
			if (on || typeof on == 'undefined') {
				this.field_container.hide();
				this.text.show();
			}
			else {
				this.text.hide();
				this.field_container.show();
			}

			return this;
		}

		this.field_container = $('<span/>').append(this.field);
		this.node.append(this.label, this.field_container, this.text);
		this.read_only();
	},

	/**
	 * @param {Object} properties HTML node properties.
	 */
	textarea: function(properties) {
		properties.innerHTML = properties.value;
		boto_web.ui._field.call(this, properties);
	},

	/**
	 * @param {Object} properties HTML node properties.
	 */
	text: function(properties) {
		boto_web.ui._field.call(this, properties);
	},

	/**
	 * @param {Object} properties HTML node properties.
	 */
	date: function(properties) {
		boto_web.ui._field.call(this, properties);

		this.datepicker = $(this.field).datepicker({
			showOn: 'both',
			showAnim: 'slideDown'
		});

	}
};

boto_web.Model.prototype.show_editor = function(opts) { return boto_web.ui.BaseModelEditor(boto_web.env.models[this.name], this, opts); }