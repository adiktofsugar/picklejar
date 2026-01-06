# syncing

The syncing mechanism is as follows:

## SyncMain

- set SyncDate to current timestamp
- for each source, run "SyncSource"

These can be run concurrently, as objects (photos) are relative to a source, and there is no need for multiple sources to all be synced at the same time.

### Same timestamp

if a scheduled run happened at the same time as a user initiated run, they could generate the same timestamp.
this would mostly be an issue for the problem below, of being a useless run
ideally there's some way to cancel workflows so 2 can't run at the same time

### Useless run

if a scheduled run happened and then a user initiated run triggered while it was running, it would do extra, pointless work...unless an object was _just_ added.

## SyncSource (S3)

- listobjects
- for each object (from listobjects), check if the "key" exists in the database
  - if the key is present
    - and the hash is the same
      - update date_synced to SyncDate
    - and the hash is different
      - update date_synced to SyncDate
      - update hash
      - delete photo metadata (like lat/lng)
      - queue CalculatePhotoMetadata
  - if the key is not present
    - insert new row with date_synced set to SyncDate
- for all objects (in database) with matching source_id and date_synced != SyncDate
  - select objects with the same hash and source_id and date_synced = SyncDate
  - if there are 0 matches
    - delete object
  - if there is 1 match
    - this is a rename
    - update to the new object and drop that one
  - if there is >1 match
    - this is an ambiguous rename
    - create row in "pending_renames" with original_object_id set to this one, and candidate_object_ids set to the new ones
- update date_synced to SyncDate (on the source)

# RE: renaming strategy

The goal is to keep any metadata associated with the original object id. For instance, if there was a comment associated with this object id, they would be orphaned / deleted if we just dropped the original. Instead, we want to transfer it to a new one.

# RE: multiple matches

When there are multiple matches, we can either:

- choose the best match based on heuristics
- allow the user to choose
  The correct choice seems to be both. If there's an obvious choice based on heuristics we should just do the rename. There will be no loss of data, although it could be surprising to see the metadata moved to the target if we get it wrong.

## User choice

This seems like the better choice. However, there are potential downsides. Since, in the meantime, we will essentially hide the original, it's possible the new candidates will accumulate their own metadata. This is a problem if one of them is later chosen to be the match, since we'd need to update their metadata to reference the original, which could mean merging. To prevent this, we'll need to not allow metadata to be added, or, if the user chooses this object as the rename target, to destroy either the new data or the old.

## Heuristics

The main downside to this is that it can be wrong. On the other hand, there are some that would be obvious.

- key = key + "Copy"
  - this is almost definitely _not_ a rename. we could remove this from the candidate list
- the created_date is the same
  - this is almost definitely the correct candidate
