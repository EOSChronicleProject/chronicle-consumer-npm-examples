CREATE DATABASE wordproof;

CREATE USER 'wordproof'@'localhost' IDENTIFIED BY 'Xizeed8i';
GRANT ALL ON wordproof.* TO 'wordproof'@'localhost';
grant SELECT on wordproof.* to 'wordproofro'@'%' identified by 'wordproofro';

use wordproof;


CREATE TABLE STAMPS
 (
 network           VARCHAR(15) NOT NULL,
 block_num         BIGINT NOT NULL,
 block_time        DATETIME NOT NULL,
 trx_id            VARCHAR(64) NOT NULL,
 contract          VARCHAR(13) NOT NULL,
 stamp_from        VARCHAR(13) NOT NULL,
 stamp_to          VARCHAR(13) NOT NULL,
 stamp_hash        VARCHAR(64) NOT NULL,
 stamp_memo        TEXT
) ENGINE=InnoDB;

CREATE UNIQUE INDEX STAMPS_I01 ON STAMPS (trx_id);
CREATE INDEX STAMPS_I02 ON STAMPS (network, block_num);
CREATE INDEX STAMPS_I03 ON STAMPS (network, stamp_from);
CREATE INDEX STAMPS_I04 ON STAMPS (stamp_hash(8));


