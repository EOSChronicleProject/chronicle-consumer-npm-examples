'use strict';

const program        = require('commander');
const ConsumerServer = require('chronicle-consumer');
const mysql          = require('mysql');

program
    .option('--host [value]', 'Binding address', '0.0.0.0')
    .option('--port [value]', 'Websocket server port', '8855')
    .option('--ack [value]', 'Ack every X blocks', '10')
    .parse(process.argv);


var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'trail',
    password : 'Ki6eibahSu',
    database : 'trail'
});
 
connection.connect(function(err) {if (err) throw err;});

const server = new ConsumerServer({host: program.host,
                                   port: program.port,
                                   ackEvery: program.ack,
                                   async: false});




server.on('tableRow', function(data) {
    console.log('row ' + (data.added?'added':'removed') + ': ' +
                data.kvo.code + ' ' + data.kvo.scope + ' ' + data.kvo.table + ' ' +
                data.kvo.primary_key);

    if(data.kvo.code == 'eosio.trail') {
        if(data.kvo.table == 'votereceipts' && data.added) {
            connection.query('INSERT INTO VOTERECEIPTS (voter, ballot_id, direction, weight) ' +
                             'VALUES(?,?,?,?) ' +
                             'ON DUPLICATE KEY UPDATE direction=?, weight=?',
                             [data.kvo.scope, data.kvo.value.ballot_id, data.kvo.value.directions[0],
                              data.kvo.value.weight,
                              data.kvo.value.directions[0], data.kvo.value.weight],
                             function (error, results, fields) {if (error) throw error;});
        }
        else if(data.kvo.table == 'balances' && data.added) {
            connection.query('INSERT INTO BALANCES (owner, tokens) ' +
                             'VALUES(?,?) ' +
                             'ON DUPLICATE KEY UPDATE tokens=?',
                             [data.kvo.value.owner, data.kvo.value.tokens,
                              data.kvo.value.tokens],
                             function (error, results, fields) {if (error) throw error;});
            
        }
    }
});
    


server.on('connected', function() {
    console.log('CONNECTED Head');
});

server.on('disconnected', function() {
    console.log('DISCONNECTED Head');
});


server.start();
console.log('started');

