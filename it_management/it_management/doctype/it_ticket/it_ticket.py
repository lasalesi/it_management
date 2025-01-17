# -*- coding: utf-8 -*-
# Copyright (c) 2019, IT-Geräte und IT-Lösungen wie Server, Rechner, Netzwerke und E-Mailserver sowie auch Backups, and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class ITTicket(Document):
    def onload(self):
        if self.contact:
            # load contact data to be displayed
            self.set_onload('contact_list', [frappe.get_doc("Contact", self.contact)])
