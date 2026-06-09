# Tianfu Digital Humanities Corpus

This directory is the local storage root for the Tianfu Digital Humanities Corpus.

## Layers

- `papers/`: academic papers and bibliographic metadata.
- `gazetteers/`: Sichuan gazetteers, city/county gazetteers, and extracted gazetteer entities.
- `ancient_books/`: Bashu classical texts, OCR outputs, chapter structures, and extracted entities.
- `wechat_articles/`: imported WeChat public account articles.
- `web_resources/`: crawled public web resources from universities, museums, heritage databases, and government sites.
- `images/`: images related to heritage, maps, books, buildings, and fieldwork.
- `maps/`: GIS files, GeoJSON, shapefiles, tiles, and administrative boundaries.
- `multimedia/`: audio, video, oral history, lecture recordings, and exhibitions.
- `imports/`: raw user uploads before parsing.
- `processed/`: cleaned text, chunks, entity extraction, and embedding jobs.
- `exports/`: graph, corpus, and analysis exports.

Every imported item should have a manifest file that follows `manifest.schema.json`.
