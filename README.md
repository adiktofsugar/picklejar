# Pickle Jar - a photo library

The goal is to have a cloudflare site that sources all the actual photos (videos, music, whatever) from an s3 compatible source.

There will be lots of pickle metaphors and wordplay. Key ideas for naming:

- preservation
- pickling
- jars and other glassware

It (will) have:

- search (based on ai generated description)
- location filter
- date filter
- albums (which can _probably_ be shared)

# Metadata

Any metadata (like albums, ai generated descriptions, etc.) will be saved to a root ".picklejar/" key and will reference the images by their key. That means renaming them will remove the metadata, unless I can figure out how to detect renames.
