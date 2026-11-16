# Diffusion Composition Lab

A buildless paper presentation by Krishiv Trivedi and Parth Sachdeva.

Run: python -m http.server 8765 --directory dist --bind 127.0.0.1
Open http://127.0.0.1:8765. A local server is needed for JavaScript modules.

Click Present. Use Left/Right or the section menu. Escape exits.
Notes remain available in the header. Krishiv covers sections 1-8 and
Parth covers sections 9-17. The full script is dist/speech_draft.md.

The 17 sections cover the paper, its original blue-dot examples, an exact
Gaussian mesh, annealed MCMC, energy models and three experiments:
- Tables in several colours AND red objects, with AND/OR/NOT rows.
- Classifier conditioning on digits: reverse, ULA and a MALA-labelled row.
- Stable Diffusion v1.5 text composition: house, red and NOT trees.

All supplied samples are embedded. CSS viewports remove whitespace and old
row captions without changing sample pixels. Full original sheets remain
available. experiments.json records the source dimensions and crop boxes.

The table AND uses 0.5sA + 0.5sB, defining a tempered product. This differs
from the full product in the Gaussian example. Findings are qualitative.
No aggregate accuracy, runtime or acceptance-rate claims are inferred.

PDF: dist/composition_presentation.pdf is the static website edition, with
all gallery figures, result rows, graph snapshots and both speakers' notes.

Check: node check_math.mjs

Sources: https://proceedings.mlr.press/v202/du23a.html and
https://arxiv.org/html/2302.11552v6. Blue-dot figures come from the authors'
project page and arXiv appendices. Cube-position values are from Table 2.
The three image result sheets were supplied by the user.
