# Backend - Database

## Problem Statememnt
Difficult to setup Postgresql database for the app as it is very heavy and not user friendly

## Context
We were using Postgresql as our database for the CRUD app due to its efficiancy in data storage and data query speed. However, the installation is difficult and we have to run a separate postgresql server in the client's local machine which can be avoided by our other options

## Options Considered
- JSON
- SQLITE3
- CSV

## Option Chosen
### Sqlite3
It was chosen because of the following reasons : 
- It is the only relational database in our options
- Installation is very easy
- We can inforce the constraints for UUID - unique user identification number an also inforce foreign key constraints (which helps in data validation)
- Our dataset is small so query times won't matter
- Our dataset is small so data storage would not be a concern 
