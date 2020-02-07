CREATE DATABASE publicdomain;

CREATE USER 'publicdomain'@'localhost' IDENTIFIED BY 'VohSei6o';
GRANT ALL ON publicdomain.* TO 'publicdomain'@'localhost';
grant SELECT on publicdomain.* to 'publicdomainro'@'%' identified by 'publicdomainro';

use publicdomain;


CREATE TABLE HASHLINKS
(
 network       VARCHAR(15) NOT NULL,
 block_num     BIGINT NOT NULL,
 block_time    DATETIME NOT NULL,
 trx_id        VARCHAR(64) NOT NULL,
 hashed_by     VARCHAR(13) NULL,
 hash_id       VARCHAR(64) NOT NULL,
 target        TEXT
)  ENGINE=InnoDB;


CREATE UNIQUE INDEX HASHLINKS_I01 ON HASHLINKS (trx_id);
CREATE INDEX HASHLINKS_I02 ON HASHLINKS (network, block_num);
CREATE INDEX HASHLINKS_I03 ON HASHLINKS (network, hashed_by, block_num);
CREATE INDEX HASHLINKS_I04 ON HASHLINKS (network, hash_id(16));
CREATE INDEX HASHLINKS_I05 ON HASHLINKS (network, target(16));


