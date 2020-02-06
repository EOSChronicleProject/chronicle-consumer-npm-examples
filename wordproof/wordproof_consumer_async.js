'use strict';

const program        = require('commander');
const ConsumerServer = require('chronicle-consumer');
const mariadb        = require('mariadb');

program
    .option('--network [value]', 'EOSIO blockchain name', 'telos')
    .option('--host [value]', 'Binding address', '0.0.0.0')
    .option('--port [value]', 'Websocket server port', '8855')
    .option('--ack [value]', 'Ack every X blocks', '10')
    .option('--contracts [value]', 'Comma-separated list of WP contracts', 'wordtokeneos')
    .parse(process.argv);


var contractsMap = new Map();
program.contracts.split(',').forEach(function(c) {
    contractsMap.set(c, true);
});

for(let value of contractsMap.keys()) {
    console.log('Scanning for wordproof contract: ' + value);
}

var pendingTasks = new Array();

const pool = mariadb.createPool({
    host     : 'localhost',
    user     : 'wordproof',
    password : 'Xizeed8i',
    database : 'wordproof'
});

const server = new ConsumerServer({host: program.host,
                                   port: program.port,
                                   ackEvery: program.ack,
                                   async: true});


server.on('fork', function(data) {
    let block_num = data['block_num'];
    console.log('fork: ' + block_num);
    
    pendingTasks.push(
        pool.getConnection()
            .then(conn => {
                return
                conn.query('DELETE FROM STAMPS WHERE network=? AND block_num>=?',
                           [program.network, block_num])
                    .then(res => {
                        conn.release();
                    })
                    .catch(err => {
                        conn.release();
                        console.error(err);
                    });
            })
    );
    
    return Promise.all(pendingTasks).then(() => {
        pendingTasks = new Array();
        console.log('fork: ' + block_num + ' all pending tasks finished');
    });
});
                    




server.on('tx', function(data) {
    let trace = data.trace;
    if(trace.status == 'executed') {
        for(let i=0; i< trace.action_traces.length; i++) {
            let atrace = trace.action_traces[i];
            if(contractsMap.get(atrace.act.account) &&
               atrace.receipt.receiver == atrace.act.account &&
               atrace.act.name == 'stamp') {
                
                let d = atrace.act.data;
                console.log('tx: ' + trace.id + ' from: ' + d.from );

                let block_time = data['block_timestamp'].replace('T', ' ');

                pendingTasks.push(
                    pool.getConnection()
                        .then(conn => {
                            return conn.query(
                                'INSERT INTO STAMPS (network, block_num, block_time, trx_id, contract, ' +
                                    ' stamp_from, stamp_to, stamp_hash, stamp_memo) ' +
                                    'VALUES(?,?,?,?,?,?,?,?,?)',
                                [program.network, data['block_num'], block_time, trace.id, atrace.act.account,
                                 d.from, d.to, d.hash, d.memo])
                                .then(res => {
                                    conn.release();
                                })
                                .catch(err => {
                                    conn.release();
                                    console.error(err);
                                });
                        }));
            }           
        }
    }    
});


server.on('ackBlock', function(bnum) {
    return Promise.all(pendingTasks).then(() => {
        pendingTasks = new Array();
    });
});


server.on('connected', function() {
    console.log('CONNECTED');
});

server.on('disconnected', function() {
    console.log('DISCONNECTED');
});

server.start();

console.log('started');

