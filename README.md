# Reaction Maps with n-gram matching

![XKCD 2260 - Reaction Maps](https://imgs.xkcd.com/comics/reaction_maps_2x.png)

<sup>&#xa9; Randall Monroe, 2020</sup>

Reaction maps, AKA homophones with US cities. This version uses 3 phonemes at the ends of city names (from GeoNames' gazetteer data) to reconstruct sentences that sound similar.

Use it here! [maps.lam.io](http://maps.lam.io)

The method is simple, and I've attempted to justify it [in this post](//lam.io/projects/x2260) from some statistics that I encountered.

On the live site, the following is used:

1. A 3M-place subset of [the `US.zip` Geonames Gazetteer dataset](http://download.geonames.org/export/dump/) was converted to phonemes. The ASCII column (column 3) was split into words and compared against [the CMU Pronouncing Dictionary](http://www.speech.cs.cmu.edu/cgi-bin/cmudict) and, for missing entries, transcribed using [CMU g2p-seq2seq](https://github.com/cmusphinx/g2p-seq2seq).
2. Phoneme-to-phoneme similarity came from [Stefan Frisch's 1996 doctoral thesis: SIMILARITY AND FREQUENCY IN PHONOLOGY](http://www.cas.usf.edu/~frisch/Frisch96.pdf). Vowels matching was guessed by myself. See the original matrix on page 40 of Frisch's thesis and the one used here at [`M.csv`](./M.csv).
3. The database encodes the relationships between:
	- Places `pl` and their terminal 3-grams `ng3` (and the ngram's phonemes `ph`),
	- The top 40 similar `ng3` for each `ng3` via `ng_ng_w`
	- Between dictionary words `dict` and their phonemes `dict_ph`.

The full SQL database can be found [here, on Google Drive](https://drive.google.com/open?id=1Gtl9JNqIM4oE_NVFs-3GyuGbcPbikU67)

The server uses `expressjs` to serve pages. To launch, run `node server.js`. To build, run `npx webpack`. The site pulls from the OSM public tileserver at the moment, so don't go too crazy.