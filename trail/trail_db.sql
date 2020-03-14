CREATE DATABASE trail;

CREATE USER 'trail'@'localhost' IDENTIFIED BY 'Ki6eibahSu';
GRANT ALL ON trail.* TO 'trail'@'localhost';
grant SELECT on trail.* to 'trailro'@'%' identified by 'trailro';

use trail;

/* votereceipts table in eosio.trail 
   voter is scope */

CREATE TABLE VOTERECEIPTS
(
 voter         VARCHAR(13) NOT NULL,
 ballot_id     BIGINT UNSIGNED NOT NULL,
 direction     TINYINT UNSIGNED NOT NULL,
 weight        DOUBLE NOT NULL
)  ENGINE=InnoDB;


CREATE UNIQUE INDEX VOTERECEIPTS_I01 ON VOTERECEIPTS (voter, ballot_id);


/* balances table in eosio.trail
   owner is scope */

CREATE TABLE BALANCES
(
 owner         VARCHAR(13) PRIMARY KEY,
 tokens        DOUBLE NOT NULL
)  ENGINE=InnoDB;


 
