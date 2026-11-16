# Diffusion Composition Lab

A buildless website for Krishiv and Parth's paper presentation.
No package installation or training is needed to use the interactive demo.

## Presentation structure

The 15 sections cover the paper, its evidence and our experiment:
introduction, motivation, score background, guidance, composition operators,
the original blue-dot examples, the score mismatch, the Gaussian mesh,
annealed MCMC, the Langevin demo, energy models, published evidence,
our MNIST setup, our pending results, and takeaways.

Krishiv presents sections 1-8. Parth presents sections 9-15. Each section
has speaker notes and source links. Paper results and our placeholders
are explicitly separated.

## Run locally

From this directory:

```text
python -m http.server 8765 --directory dist --bind 127.0.0.1
```

Open http://127.0.0.1:8765 in a browser. Use a local server rather than
double-clicking index.html, because the page loads JavaScript modules.

## Present

Click Present. Use Left and Right to move between sections and Escape to exit.
Use the section menu to jump. Notes are available in the header in both views.
The full two-person script is dist/speech_draft.md.

## Interactions

- Change each Gaussian mean and variance.
- Move the noise slider or animate it.
- View both score fields over evenly spaced x positions and noise levels.
- Rotate the mesh by dragging or using the arrow keys. Home resets the view.
- Change the uniform grid density and hide either surface.
- Move the noise slider to highlight cross-sections of the two surfaces.
- Switch between AND and A AND NOT B, with an alpha slider.
- Observe warnings for ratios with no finite integral.
- Run, pause, reset or single-step the Langevin particles.
- Load real MNIST grids, fill measurements and export/import results as JSON.

The Gaussian calculations are exact. The particle histogram is a finite
numerical simulation. There are no measured MNIST results in the initial site.
Result uploads remain in the browser tab until exported. To include them in
the deployed source by default, supply the exported results for a site update.

## Validation

```text
node check_math.mjs
```

The script checks the board example, score derivatives, the clean endpoint,
normalizability, high-noise ratios and a Monte Carlo Langevin variance.

## Sources and assets

Paper: https://proceedings.mlr.press/v202/du23a.html
Full text: https://arxiv.org/html/2302.11552v6
The class split and Gaussian lab are project adaptations.
The two PNG illustrations are AI-generated concept art, not experiment results.
The blue-dot examples are original figures by Du et al. They include products,
mixtures, negation and failure cases. See the source links in the figure gallery.
paper-2d.png comes from the authors' project page. negation_more.png,
rebuttal_mixture.png and rebuttal_failure_v2.png come from arXiv v6.
The cube-position values in the paper-evidence section come from Table 2.
The equations use native MathML for rendered mathematical notation.
No external math library or network request is needed to render them.
