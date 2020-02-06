CREATE DATABASE transfers;

CREATE USER 'transfers'@'localhost' IDENTIFIED BY 'nuaKoh9m';
GRANT ALL ON transfers.* TO 'transfers'@'localhost';
grant SELECT on transfers.* to 'transfersro'@'%' identified by 'transfersro';

use transfers;


CREATE TABLE TRANSFERS
(
 network       VARCHAR(15) NOT NULL,
 block_num     BIGINT NOT NULL,
 block_time    DATETIME NOT NULL,
 trx_id        VARCHAR(64) NOT NULL,
 irreversible  TINYINT NOT NULL DEFAULT 0,
 contract      VARCHAR(13) NOT NULL,
 currency      VARCHAR(8) NOT NULL,
 amount        DOUBLE PRECISION NOT NULL,
 tx_from       VARCHAR(13) NULL,
 tx_to         VARCHAR(13) NOT NULL,
 memo          TEXT
)  ENGINE=InnoDB;


CREATE UNIQUE INDEX TRANSFERS_I01 ON TRANSFERS (trx_id);
CREATE INDEX TRANSFERS_I02 ON TRANSFERS (network, block_num);
CREATE INDEX TRANSFERS_I06 ON TRANSFERS (network, tx_from, contract, currency, block_num);
CREATE INDEX TRANSFERS_I07 ON TRANSFERS (network, tx_to, contract, currency, block_num);
CREATE INDEX TRANSFERS_I08 ON TRANSFERS (network, tx_to, block_num);
CREATE INDEX TRANSFERS_I09 ON TRANSFERS (network, tx_from, block_num);
CREATE INDEX TRANSFERS_I10 ON TRANSFERS (network, contract, block_num);


