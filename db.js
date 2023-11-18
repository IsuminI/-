var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Xptmxm1212!@',
    database: 'web'
});
db.connect();

module.exports = db;