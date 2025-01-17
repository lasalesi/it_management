frappe.ui.form.on('Communication', {
	refresh: function (frm) {
		cur_frm.add_custom_button('IT Ticket', function () { frm.trigger('make_ticket') }, 'Make');
		frm.trigger('load_ref_doc')
	},
	reference_name: function (frm) {
		frm.trigger('load_ref_doc');
	},
	load_ref_doc: function (frm) {
        // load the referenced document into locals to use them later, without delay
		if ((frm.doc.reference_doctype) && (frm.doc.reference_name)) {
			frappe.db.get_doc(frm.doc.reference_doctype, frm.doc.reference_name).then(
				(doc) => {
					if (locals.hasOwnProperty(frm.doc.reference_doctype)) {
						// add to documents of this type
						locals[frm.doc.reference_doctype][frm.doc.reference_name] = doc;
					}
					else {
						// or create a new dict with one entry
						locals[frm.doc.reference_doctype] = {
							[frm.doc.reference_name]: doc,
						}
					}
				}
			);
		}
	},
	make_ticket: function (frm) {
		let options = {
			'doctype': 'IT Ticket',
			'subject': frm.doc.subject,
			'description': frm.doc.content,
		};
		if ((frm.doc.reference_doctype) && (frm.doc.reference_name)) {
			if (frm.doc.reference_doctype === 'Customer') {
				options['customer'] = frm.doc.reference_name;
			}
			if (frm.doc.reference_doctype === 'Project') {
				options['project'] = frm.doc.reference_name;
				options['customer'] = locals['Project'][frm.doc.reference_name].customer;
			}
			if (frm.doc.reference_doctype === 'Task') {
				options['project'] = locals['Task'][frm.doc.reference_name].project;
			}
		}

		frappe.db.insert(options).then((doc) => {
			frappe.call({
				method: "frappe.email.relink",
				args: {
					"name": frm.doc.name,
					"reference_doctype": doc.doctype,
					"reference_name": doc.name
				},
				callback: function () {
					frm.refresh();
				}
			});
		});
	}
});
