'use strict';

const program        = require('commander');
const ConsumerServer = require('chronicle-consumer');
const mysql          = require('mysql');

program
    .option('--network [value]', 'EOSIO blockchain name', 'telos')
    .option('--host [value]', 'Binding address', '0.0.0.0')
    .option('--port [value]', 'Websocket server port', '8855')
    .option('--ack [value]', 'Ack every X blocks', '10')
    .option('--accounts [value]', 'Comma-separated list of accounts', 'publicdomain')
    .parse(process.argv);


var accountsMap = new Map();
program.accounts.split(',').forEach(function(c) {
    accountsMap.set(c, true);
});

for(let value of accountsMap.keys()) {
    console.log('Scanning transfers for: ' + value);
}


var last_irreversible_block = 0;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'publicdomain',
    password : 'VohSei6o',
    database : 'publicdomain'
});
 
connection.connect(function(err) {if (err) throw err;});

const server = new ConsumerServer({host: program.host,
                                   port: program.port,
                                   ackEvery: program.ack,
                                   async: false});



server.on('fork', function(data) {
    let block_num = data['block_num'];
    console.log('fork: ' + block_num);
    connection.query('DELETE FROM HASHLINKS WHERE network=? AND block_num>=?',
                     [program.network, block_num],
                     function (error, results, fields) {if (error) throw error;});
});
                    


function is_atrace_of_interest(atrace, callback) {
}
    

server.on('tx', function(data) {
    let trace = data.trace;
    if(trace.status == 'executed') {
        for(let i=0; i< trace.action_traces.length; i++) {
            let atrace = trace.action_traces[i];
            if(atrace.receipt.receiver == atrace.act.account &&
               atrace.act.name == 'transfer' &&
               typeof atrace.act.data === 'object') {
        
                let d = atrace.act.data;
                if('from' in d && 'to' in d && 'memo' in d && accountsMap.get(d.to) &&
                   d.memo.match(/^([0-9A-F]{64})(\s|$)/i) ) {
                    let hashid = d.memo.substring(0, 63).toUpperCase();
                    let rest = d.memo.substring(64).replace(/^\s+/, '');
                    
                    console.log('tx: ' + trace.id + ' ' + hashid + ' ' + rest);
                    
                    let block_num = data['block_num'];
                    let block_time = data['block_timestamp'].replace('T', ' ');
                    
                    connection.query('INSERT INTO HASHLINKS (network, block_num, block_time, trx_id, ' +
                                     'hashed_by, hash_id, target) ' +
                                     'VALUES(?,?,?,?,?,?,?)',
                                     [program.network, block_num, block_time, trace.id,
                                      d.from, hashid, rest],
                                     function (error, results, fields) {if (error) throw error;});
                }
            }
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

