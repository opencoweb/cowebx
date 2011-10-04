/*
	Copyright (c) 2004-2011, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

define(["dojo","dijit","dojox","dojo/date/locale","dojo/currency","dijit/form/HorizontalSlider","dijit/form/CurrencyTextBox","dojox/grid/cells/dijit"], function(dojo, dijit, dojox){
dojo.getObject("dojox.grid.tests.robot.structures", 1);
(function(){
/* builder delete begin
dojo.require("dojo.date.locale");

 builder delete end */
/* builder delete begin
dojo.require("dojo.currency");

 builder delete end */
/* builder delete begin
dojo.require("dijit.form.HorizontalSlider");

 builder delete end */
/* builder delete begin
dojo.require("dijit.form.CurrencyTextBox");

 builder delete end */
/* builder delete begin
dojo.require("dojox.grid.cells.dijit");

 builder delete end */
formatCurrency = function(inDatum){
	return isNaN(inDatum) ? '...' : dojo.currency.format(inDatum, this.constraint);
}
formatDate = function(inDatum){
	return dojo.date.locale.format(new Date(inDatum), this.constraint);
}
structure1 = [{
	defaultCell: { width: 8, editable: true, type: dojox.grid.cells._Widget, styles: 'text-align: right;'  },
	rows: [
		{ name: 'Id', field: 'id', editable: false /* Can't edit ID's of dojo.data items */ },
		{ name: 'Date', field: 'col8', width: 10,
			type: dojox.grid.cells.DateTextBox,
			formatter: formatDate,
			constraint: {formatLength: 'long', selector: "date"}},
		{ name: 'Priority', styles: 'text-align: center;', field: 'col1',
			type: dojox.grid.cells.ComboBox,
			options: ["normal", "note", "important"], width: 10},
		{ name: 'Mark', field: 'col2', width: 3, styles: 'text-align: center;',
			type: dojox.grid.cells.CheckBox},
		{
			field: 'col3', name: 'Status',
			styles: 'text-align: center;',
			type: dojox.grid.cells.Select,
			options: [ "new", "read", "replied" ]
		},
		{ name: 'Message', field: 'col4', styles: '', width: 'auto',
			type: dojox.grid.cells.Editor, editorToolbar: true },
		{ name: 'Amount', field: 'col5', formatter: formatCurrency, constraint: {currency: 'EUR'},
			widgetClass: dijit.form.CurrencyTextBox },
		{ name: 'Amount', field: 'col6', formatter: formatCurrency, constraint: {currency: 'EUR'},
			widgetClass: dijit.form.HorizontalSlider, width: 10}
	]
}];
})();
});
require(["dojox/grid/tests/robot/structures"]);
