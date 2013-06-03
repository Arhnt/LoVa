Ext.define('Loto.view.UsersChart', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.usersChart',
    title: 'График регистраций',
    height: '600',
    tbar: [
        { xtype: 'button', name: "month", text: 'Month' },
        { xtype: 'button', name: "year", text: 'Year' }
    ],    
    items: [
      {
    	xtype: "chart",
    	store:{
    	    proxy: new Ext.data.HttpProxy({
    	        url: '/admin/users/chart/month/ajax/',
    	        reader: {
    	            type: 'json',
    	            root: 'data'
    	        }
    	    }),
			model:Ext.define("MyModel", {
				extend:"Ext.data.Model",
				fields:[
					"date",
					{name: "registered", type: 'int'},
					{name: "referals", type: 'int'}
				]
			}),
    	    autoLoad: true
		},
    	animate: false,
        style: 'background:#fff',
        theme: 'Base:gradients',
        width: 800,
        height: 200,
        layout: 'fit',
    	axes:[
				{
					type:"Numeric",
					position:"left",
					fields:["registered", "referals"],
					grid: true,
					minimum:0,
					maximum: 10,
					minorTickSteps: 1
				},
				{
					type:"Category",
					position:"bottom",
					fields:["date"]
				}
			],
			series:[
				{
					type:"line",
					axis:"left",
					stacked:true,
					xField:"date",
					yField:["registered"]
				},
				{
					type:"column",
					axis:"left",
					stacked:true,
					xField:"date",
					yField:["referals"],
			     	style: {
			            opacity: 0.5
			        }				
				}
			]
    	
      }
	]
/*
    */
 });
