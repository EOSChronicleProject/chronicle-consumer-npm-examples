'use strict';

const program        = require('commander');
const ConsumerServer = require('chronicle-consumer');
const mysql          = require('mysql');

program
    .option('--network [value]', 'EOSIO blockchain name', 'telos')
    .option('--host [value]', 'Binding address', '0.0.0.0')
    .option('--portHead [value]', 'Websocket server port for head data', '8855')
    .option('--portIrrev [value]', 'Websocket server port for irreversible data', '8856')
    .option('--ack [value]', 'Ack every X blocks', '10')
    .requiredOption('--accounts [value]', 'Comma-separated list of accounts')
    .parse(process.argv);


var accountsMap = new Map();
program.accounts.split(',').forEach(function(c) {
    accountsMap.set(c, true);
});

for(let value of accountsMap.keys()) {
    console.log('Scanning for wordproof contract: ' + value);
}


var last_irreversible_block = 0;

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'transfers',
    password : 'nuaKoh9m',
    database : 'transfers'
});
 
connection.connect(function(err) {if (err) throw error;});

const serverHead = new ConsumerServer({host: program.host,
                                       port: program.portHead,
                                       ackEvery: program.ack,
                                       async: false});

const serverIrrev = new ConsumerServer({host: program.host,
                                        port: program.portIrrev,
                                        ackEvery: program.ack,
                                        async: false});


serverHead.on('fork', function(data) {
    let block_num = data['block_num'];
    console.log('fork: ' + block_num);
    connection.query('DELETE FROM TRANSFERS WHERE network=? AND block_num>=?',
                     [program.network, block_num],
                     function (error, results, fields) {if (error) throw error;});
});
                    


function is_atrace_of_interest(atrace, callback) {
    if(atrace.receipt.receiver == atrace.act.account &&
       atrace.act.name == 'transfer' &&
       typeof atrace.act.data === 'object') {
        
        let d = atrace.act.data;
        if( 'from' in d && 'to' in d && 'quantity' in d &&
            (accountsMap.get(d.from) || accountsMap.get(d.to)) ) {
            let amt = d.quantity.split(' ');
            callback(atrace.act.account, d.from, d.to, amt[1], amt[0], d.memo);
        }
    }
}
    

serverHead.on('tx', function(data) {
    let trace = data.trace;
    if(trace.status == 'executed') {
        for(let i=0; i< trace.action_traces.length; i++) {
            let atrace = trace.action_traces[i];
            is_atrace_of_interest(
                atrace,
                function(contract, from, to, currency, amount, memo) {
                    console.log('head tx: ' + trace.id + ' ' + contract +
                                ' from: ' + from + ' to: ' + to + ' ' + currency + ' ' + amount);
                    
                    let block_num = data['block_num'];
                    let block_time = data['block_timestamp'].replace('T', ' ');
                    
                    connection.query(
                        'INSERT IGNORE INTO TRANSFERS (network, block_num, block_time, trx_id, irreversible, contract, ' +
                            ' currency, amount, tx_from, tx_to, memo) ' +
                            'VALUES(?,?,?,?,?,?,?,?,?,?,?)',
                        [program.network, block_num, block_time, trace.id,
                         (last_irreversible_block >= block_num ? 1:0), contract,
                         currency, amount, from, to, memo],
                         function (error, results, fields) {if (error) throw error;});
                });
        }
    }
});


serverHead.on('blockCompleted', function(data) {
    last_irreversible_block = data['last_irreversible'];
});


serverHead.on('connected', function() {
    console.log('CONNECTED Head');
});

serverHead.on('disconnected', function() {
    console.log('DISCONNECTED Head');
});

serverIrrev.on('tx', function(data) {
    let trace = data.trace;
    if(trace.status == 'executed') {
        for(let i=0; i< trace.action_traces.length; i++) {
            let atrace = trace.action_traces[i];
            is_atrace_of_interest(
                atrace,
                function(contract, from, to, currency, amount, memo) {
                    console.log('irrv tx: ' + trace.id + ' ' + contract +
                                ' from: ' + from + ' to: ' + to + ' ' + currency + ' ' + amount);
                    
                    let block_num = data['block_num'];
                    let block_time = data['block_timestamp'].replace('T', ' ');
                    
                    connection.query(
                        'INSERT INTO TRANSFERS (network, block_num, block_time, trx_id, irreversible, contract, ' +
                            ' currency, amount, tx_from, tx_to, memo) ' +
                            'VALUES(?,?,?,?,1,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE irreversible=1',
                        [program.network, block_num, block_time, trace.id, contract,
                         currency, amount, from, to, memo],
                        function (error, results, fields) {if (error) throw error;});                    
                });
        }
    }
});




serverHead.start();
serverIrrev.start();

console.log('started');

