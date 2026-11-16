# Two-person speech draft

Krishiv: sections 1-8. Parth: sections 9-17.
Allow about 15 minutes, plus discussion.
The image grids are qualitative evidence; no aggregate metrics were supplied.

## 1. Paper and project

Speaker: Krishiv

Our presentation explains Reduce, Reuse, Recycle and then examines three experiments. We first use an exact Gaussian example to understand why composition can mismatch the usual reverse sampler. Our image experiments combine tables with red objects, add classifier conditioning to digits, and compose text prompts using Stable Diffusion. We will describe what the images show without inventing aggregate metrics.

## 2. Motivation and contributions

Speaker: Krishiv

The motivation is reuse. Existing models know different things. One of our experts knows tables in several colours, while another knows red objects. Their intersection favours red tables. The paper explains a sampling mismatch, applies annealed MCMC to composed targets, and introduces energy models when relative density values are needed. We test these ideas in three different settings.

## 3. Diffusion experts and scores

Speaker: Krishiv

Each expert trains on its own data. We take a clean sample, choose a noise level, add noise and train a network to predict it. This prediction gives a score estimate. In one dimension, the score is the slope of log density: positive points right and negative points left. During generation, the expert evaluates the current sample and noise level. Its weights stay fixed. A score is local directional information, so a sampler is still needed to produce an entire distribution.

## 4. Connection to guidance

Speaker: Krishiv

Guidance is a familiar example of combining models. The generator says what looks like data, while a noisy-image classifier pushes toward a requested label. With exact, consistent models and guidance strength one, Bayes' rule gives the correct conditional score. Classifier-free guidance replaces the classifier direction with a difference between conditional and unconditional scores. The predictions can come from one network. The paper asks how to go beyond this conditioning setup to more general compositions.

## 5. AND, OR and NOT

Speaker: Krishiv

For AND, multiply densities. The log of the product is a sum, so the scores add. For OR, mix densities. Its score needs density-dependent weights, rather than a simple average of the expert scores. For A AND NOT B, keep A as the base and divide by a power of B. This gives the A score minus alpha times the B score. These operations express soft preferences. In particular, the ratio must have a finite integral to define a probability distribution. Our experiment uses AND and NOT.

## 6. Published blue-dot examples

Speaker: Krishiv

These blue points come from the paper. In the first figure, multiplication keeps the shared region, while addition includes alternatives. Compare the true result with reverse diffusion and HMC. The addition examples show how the generated geometry can change with the sampler. In the negation figure, A is the base and B marks a region to suppress. The top HMC example leaves a hole, and the lower one separates the remaining sides. The minus symbol represents a density ratio, not subtracting probability densities. Finally, the failure examples show why little or no overlap can make composition unsuccessful even with MCMC. Our table and red-object experts deliberately share a concept.

Presenter cue: Click multiplication/addition, negation and failure cases. Read the column labels because the main figure includes a true-target column while the appendix figures do not.

## 7. The reverse-diffusion mismatch

Speaker: Krishiv

Here is the main distinction. Ordinary reverse diffusion needs the noisy versions of the clean product. That means multiply the clean densities first, then apply forward noise. Our two separate experts instead describe their own noisy distributions. Adding their scores gives the product of those separately noised distributions. Both products agree at the clean endpoint, but generally differ at noisy levels. Substituting the sum into the usual reverse update therefore changes its transitions. This problem can occur with perfect expert scores, so it is not necessarily a failure to train.

## 8. Exact Gaussian demonstration

Speaker: Krishiv

The sliders control the mean and variance of each Gaussian. Purple is the product of the noisy experts, and the dark target comes from noising the clean product. The mesh shows both score fields over uniformly spaced positions and noise levels. Rotate it and move the noise slider to inspect a cross-section. For the board example, the clean product has variance one half. At the middle setting, the two noisy constructions have variances 0.5 and 0.875. At x equal to one, their scores are minus two and about minus 1.14. This symmetric example has a constant product across time, so it isolates the mismatch but does not need annealing. Try unequal widths to see a changing target. Parth will now explain the sampling method and the paper's experiments.

Presenter cue: Demo: board preset, rotate mesh, move t between 0 and 1, then select unequal widths. The Gaussian example is our teaching adaptation.

## 9. Annealed MCMC

Speaker: Parth

We keep the valid composed scores and change the sampler. Start from the high-noise composed distribution. At one fixed noise level, run several MCMC updates. Then lower the noise level and carry the same particles forward. Repeat until the clean target. There are two loops: exploration within one level, and movement across levels. We do not retrain the networks or restart the particles at every level. Finite chains can still mix poorly, so this is an approximate method at a limited budget.

## 10. Langevin demonstration

Speaker: Parth

This demo isolates the inner loop at a fixed noise level. The score attracts particles toward higher density, while fresh random noise lets them spread. Their balance samples a distribution rather than finding only its peak. Click One update or Run Langevin and watch the histogram. Try a smaller step size. It reduces the discretization bias, but exploration can take more updates. Adding fresh sampling noise does not change t. The full annealed algorithm carries particles between levels; changing the controls here resets this fixed-level demonstration.

Presenter cue: Demo: start from the board preset, run Langevin, pause, reduce h and reset. A finite particle histogram fluctuates.

## 11. Energy-based parameterization

Speaker: Parth

The paper also learns an energy. The score gives a direction; an energy additionally gives relative density values. MALA and adjusted HMC need such values for acceptance and rejection. This costs more computation. Our digit result sheet includes a row labelled MALA, but the sheet alone does not establish which energy implementation or acceptance rates were used. We can explain the requirement without claiming that we verified unseen code.

## 12. Evidence reported by the authors

Speaker: Parth

These cube-position values are the authors' published results, not our numbers. At matching score-evaluation budgets, their score model reaches 57.4 percent with reverse diffusion, 60.2 with ULA and 71.1 with unadjusted HMC for five position constraints. They also study 2D densities, classifier guidance and text composition. Their results motivate our comparison, but do not guarantee that every example will improve.

## 13. Our three experiments

Speaker: Parth

We changed the original digit-intersection plan into a rendered-object experiment: tables in several colours and red objects. The digits now belong to a separate classifier-conditioning experiment. We also have a text-to-image study using house and red prompts. All results here come from the supplied image grids. No aggregate metrics, training code or timing logs were supplied, so our conclusions are qualitative.

## 14. Tables AND red objects

Speaker: Parth

Two separately trained experts: one on rendered tables in several colours, one on red objects. Their shared preference is a red table. Both AND rows use 0.5sA + 0.5sB, as labelled in the supplied grid. This corresponds to a tempered target proportional to sqrt(pA pB), not the full product used in the Gaussian teaching example. The annealed ULA row is more consistent in this displayed grid. The naive row already contains red tables, so the result supports a sample-quality comparison rather than an all-or-nothing success claim. Six displayed samples per row are qualitative evidence. Training budgets, sampler settings, runtime, energy calibration and aggregate metrics were not supplied.

Presenter cue: Show every row and describe both successful and ambiguous samples. Do not convert the displayed examples into an accuracy percentage.

## 15. Classifier conditioning

Speaker: Parth

Requested labels run from 0 to 9. An unconditional digit model is compared with classifier-guided reverse sampling, ULA and a MALA-labelled run. The conditioning rule adds the noisy classifier gradient to the generative score. This is the paper's Section 5.3 / Equation 14 adapted to digits. Conditioning visibly changes the outputs toward the requested labels. These single examples per target do not establish dataset-wide accuracy or a ranking of ULA and MALA. The image does not include classifier accuracy, guidance strength for the conditional rows, runtime, acceptance rates or the energy implementation used by MALA.

Presenter cue: Show every row and describe both successful and ambiguous samples. Do not convert the displayed examples into an accuracy percentage.

## 16. Text-to-image composition

Speaker: Parth

The supplied experiment uses Stable Diffusion v1.5. Five seed columns compare separate prompts, naive composition, latent ULA and a NOT-trees composition. This is a pretrained text-to-image reuse experiment. The figure alone does not specify prompt weights, guidance settings, a base-score correction or the latent update schedule. The effect is mixed across seeds. The naive baseline is already strong in several columns, so this grid does not establish a universal advantage for latent ULA. Prompt alignment scores, full prompt strings, matched compute and sampler logs were not supplied. Display labels below correct the source's stray references to tables; the original image is preserved.

Presenter cue: Show every row and describe both successful and ambiguous samples. Do not convert the displayed examples into an accuracy percentage.

## 17. Findings and limits

Speaker: Parth

The main lesson is that composition and sampling are separate choices. The table grid suggests improved consistency with annealed ULA, and classifier guidance makes the requested labels visible. The text-to-image comparison is mixed because the naive baseline already combines both concepts in several seeds. We should report those limits clearly. Averaged scores change the target, MALA needs an energy-based acceptance calculation, and image grids alone cannot establish accuracy, speed or a universal sampler advantage. Thank you.

