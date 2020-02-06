# chronicle-consumer NPM examples

This repository contains a number of examples and usage patterns for
[`chronicle-consumer`](https://www.npmjs.com/package/chronicle-consumer)
module for Node.js.

This development is sponsored by [Telos
blockchain](https://www.telos.net/) community as part of [Worker
Proposal #95](https://chainspector.io/governance/worker-proposals/95).

[Chronicle](https://github.com/EOSChronicleProject/eos-chronicle) is a
software package for receiving and decoding the data flow that is
exported by `state_history_plugin` of `nodeos`, the blockchain node
daemon [developed by Block One](https://developers.eos.io/).

## Chronicle setup

A [separate
repository](https://github.com/EOSChronicleProject/chronicle-tutorial)
will provide a tutorial for setting up and troubleshooting a Chronicle
installation. For the time being, refer to [Chronicle
README](https://github.com/EOSChronicleProject/eos-chronicle/blob/master/README.md)
for detailed instructions.

All examples were tested under Ubuntu 18.10 server. Later versions of
Ubuntu should also work. If Ubuntu 18.04 is your only option, follow
the Ubuntu 18.04 installation for Chronicle, which requires additional
steps.

In addition to Chronicle and nodeos setup, MariaDB server and Node.js
12.x are installed. The examples shoudl also run flawlessly under
Node.js 13.x.

```
apt update && apt install -y mariadb-server

curl -sL https://deb.nodesource.com/setup_12.x | bash -
apt install -y nodejs
cd /opt/eosio_light_api/wsapi
npm install
```


## Wordproof stamps database

[Wordproof](https://wordproof.io/) is a blockchain project which was
also sponsored by Telos Works, and it's prviding a simple interface
for anyone to place a SHA256 hash of their original documents onto the
blockchain. This allows them prove the authorship, and is very
important in protecting the intellectual property rights.

The example in `wordproof` folder consists of the following files:

* `wordproof_db.sql` defines the stamps table in a MariaDB database.

* `wordproof_consumer_sync.js` is a Chronicle consumer working in
  synchronous mode, and using synchronous `mysql` module for Node.js.

* `wordproof_consumer_async.js` is a Chronicle consumer working in
  asynchronous mode, and using `mariadb` module for Node.js which is
  only offering asynchronous Promise API.

Synchronous mode is easier in implementation and
troubleshooting. However, if a large volume of data has to be
processed, asynchronous mode provides better scalability, and allows
writing into several MariaDB connections concurrently.

Wordproof data is not that large to see the benefit of asynchronous
mode, but this example aims establishing a pattern for other projects
to use.

The scripts use the following settings as default, and they are
possible to change with command-line options:

* Blockchain name: `telos`;
* Websocket server binding address: `0.0.0.0`;
* Websocket server port for Chronicle to connect: 8855;
* Acknowledgement every 10 blocks;
* Contract name: `wordtokeneos`.


Recommended Chronicle configuration:

```
host = 127.0.0.1
port = 8080
mode = scan
plugin = exp_ws_plugin
exp-ws-host = 127.0.0.1
exp-ws-port = 8855
exp-ws-bin-header = true
skip-block-events = true
exp-ws-max-unack = 200
skip-table-deltas = yes
```






# License and copyright

Copyright 2020 cc32d9@gmail.com

```
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```



















