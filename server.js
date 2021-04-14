'use strict';
const http = require('http');
const cors = require('cors')
const express = require('express');
const app = express();
const busboy = require('connect-busboy');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes, Op } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:root@localhost:5432/postgres');

sequelize.authenticate().then(() => {
	console.log('Connection has been established successfully.');
}).catch(err => {
	console.error('Unable to connect to the database:', err);
});

let server = http.createServer(app);
const port = 8085;

app.use(busboy());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

const Countries = sequelize.define('countries', {
	id: {
		type: DataTypes.NUMBER,
		allowNull: false,
		primaryKey: true
	},
	sortname: {
		type: DataTypes.STRING,
		allowNull: false
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	phonecode: {
		type: DataTypes.NUMBER,
		allowNull: false
	}
},
	{
		timestamps: false
	});

app.post('/getData', function (req, res) {

	let search = !req.body.search ? "" : req.body.search.toLowerCase();

	try {
		countRecords(search).then(result => {
			console.log("\n\nTotal Records: ", result.count + "\n\n");
			getRecords(req, search).then((data) => {
				return res.status(200).json({
					status: 200,
					count: result.count,
					data: JSON.parse(JSON.stringify(data)),
					message: "Success"
				});
			});
		});
	} catch (e) {
		return res.status(400).json({ status: 400, data: e, message: "No Data Found" });
	}

});

function getRecords(req, search) {
	return Countries.findAll({
		where: {
			[Op.or]: [
				{
					name: {
						[Op.iLike]: '%' + search + '%'
					}
				},
				// {
				// 	phonecode: {
				// 		[Op.like]: '%' + search + '%'
				// 	}
				// },
				{
					sortname: {
						[Op.like]: '%' + search + '%'
					}
				}
			]
		},
		limit: parseInt(req.body.limit),
		offset: parseInt(req.body.offset)
	})
}

function countRecords(search) {
	return Countries.findAndCountAll({
		where: {
			[Op.or]: [
				{
					name: {
						[Op.iLike]: '%' + search + '%'
					}
				},
				{
					sortname: {
						[Op.like]: '%' + search + '%'
					}
				}
			]
		}
	})
}

// Start server
function startServer() {
	server.listen(port, function () {
		console.log('Express server listening on ', port);
	});
}

setImmediate(startServer);