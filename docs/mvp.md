# MVP

- manual sync
- sync goes through all sources
- sync populates D1 database with id,source_id,key,md5,date_created,latlng
- sync creates queue that can change a delete/add with the same md5 into a rename
- list photos
- sort by date
- filter by location
- map view
- description uploads
- vector search


## description generation

This might be better to do offline initially as I think it'll end up taking multiple days because of the limit... To handle this, we want a (bulk) description upload that takes the (current) keys and renames them to the md5 hashes.

To test the cloudfront version, we can have a "generate description" button.
