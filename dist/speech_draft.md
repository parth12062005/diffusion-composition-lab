# Two-person speech draft

Allow about 12-15 minutes, including short demonstrations.
Krishiv presents sections 1-8. Parth presents sections 9-15.
Use Present on the website, then Left/Right or the section menu.
Notes stay available in presentation mode.

The blue-dot figures and the cube-position numbers are published paper results.
Our Gaussian lab is a teaching adaptation. Our MNIST results are pending.
Replace planned wording with measured findings only after the experiment.

## 1. Paper and project

Speaker: Krishiv

Our presentation is based on Reduce, Reuse, Recycle by Du and colleagues, published at ICML 2023. We will first explain the paper, then use a Gaussian example to inspect its central issue, and finally describe our MNIST experiment. Our experiment results are still pending. We will distinguish the authors' results from our own work throughout.

Sources: [Published paper](https://proceedings.mlr.press/v202/du23a.html).

## 2. Motivation and contributions

Speaker: Krishiv

The motivation is reuse. Suppose models already know different distributions. Can we combine their preferences at sampling time instead of training a new model for every combination? The paper identifies a mismatch in ordinary reverse sampling, uses annealed MCMC to explore composed targets, and introduces energy models when relative density values are needed. Our smaller study keeps the composition question and tests it using two digit experts.

Sources: [Introduction](https://arxiv.org/html/2302.11552v6#S1).

## 3. Diffusion experts and scores

Speaker: Krishiv

Each expert trains on its own data. We take a clean sample, choose a noise level, add noise and train a network to predict it. This prediction gives a score estimate. In one dimension, the score is the slope of log density: positive points right and negative points left. During generation, the expert evaluates the current sample and noise level. Its weights stay fixed. A score is local directional information, so a sampler is still needed to produce an entire distribution.

Sources: [Background: Sections 2.1–2.3](https://arxiv.org/html/2302.11552v6#S2).

## 4. Connection to guidance

Speaker: Krishiv

Guidance is a familiar example of combining models. The generator says what looks like data, while a noisy-image classifier pushes toward a requested label. With exact, consistent models and guidance strength one, Bayes' rule gives the correct conditional score. Classifier-free guidance replaces the classifier direction with a difference between conditional and unconditional scores. The predictions can come from one network. The paper asks how to go beyond this conditioning setup to more general compositions.

Sources: [Controllable generation: Section 2.4](https://arxiv.org/html/2302.11552v6#S2.SS4).

## 5. AND, OR and NOT

Speaker: Krishiv

For AND, multiply densities. The log of the product is a sum, so the scores add. For OR, mix densities. Its score needs density-dependent weights, rather than a simple average of the expert scores. For A AND NOT B, keep A as the base and divide by a power of B. This gives the A score minus alpha times the B score. These operations express soft preferences. In particular, the ratio must have a finite integral to define a probability distribution. Our experiment uses AND and NOT.

Sources: [Composition rules: Section 3](https://arxiv.org/html/2302.11552v6#S3).

## 6. Published blue-dot examples

Speaker: Krishiv

These blue points come from the paper. In the first figure, multiplication keeps the shared region, while addition includes alternatives. Compare the true result with reverse diffusion and HMC. The addition examples show how the generated geometry can change with the sampler. In the negation figure, A is the base and B marks a region to suppress. The top HMC example leaves a hole, and the lower one separates the remaining sides. The minus symbol represents a density ratio, not subtracting probability densities. Finally, the failure examples show why little or no overlap can make composition unsuccessful even with MCMC. Our digit split deliberately includes one shared class.

Presenter cue: Click multiplication/addition, negation and failure cases. Read the column labels because the main figure includes a true-target column while the appendix figures do not.

Sources: [Authors' original 2D figure](https://energy-based-model.github.io/reduce-reuse-recycle/materials/2d.png), [Synthetic appendices, arXiv v6](https://arxiv.org/html/2302.11552v6#A5).

## 7. The reverse-diffusion mismatch

Speaker: Krishiv

Here is the main distinction. Ordinary reverse diffusion needs the noisy versions of the clean product. That means multiply the clean densities first, then apply forward noise. Our two separate experts instead describe their own noisy distributions. Adding their scores gives the product of those separately noised distributions. Both products agree at the clean endpoint, but generally differ at noisy levels. Substituting the sum into the usual reverse update therefore changes its transitions. This problem can occur with perfect expert scores, so it is not necessarily a failure to train.

Sources: [Equations 11 and 12](https://arxiv.org/html/2302.11552v6#S4.E11).

## 8. Exact Gaussian demonstration

Speaker: Krishiv

The sliders control the mean and variance of each Gaussian. Purple is the product of the noisy experts, and the dark target comes from noising the clean product. The mesh shows both score fields over uniformly spaced positions and noise levels. Rotate it and move the noise slider to inspect a cross-section. For the board example, the clean product has variance one half. At the middle setting, the two noisy constructions have variances 0.5 and 0.875. At x equal to one, their scores are minus two and about minus 1.14. This symmetric example has a constant product across time, so it isolates the mismatch but does not need annealing. Try unequal widths to see a changing target. Parth will now explain the sampling method and the paper's experiments.

Presenter cue: Demo: board preset, rotate mesh, move t between 0 and 1, then select unequal widths. The Gaussian example is our teaching adaptation.

Sources: [Underlying mismatch in Section 4](https://arxiv.org/html/2302.11552v6#S4.E11).

## 9. Annealed MCMC

Speaker: Parth

We keep the valid composed scores and change the sampler. Start from the high-noise composed distribution. At one fixed noise level, run several MCMC updates. Then lower the noise level and carry the same particles forward. Repeat until the clean target. There are two loops: exploration within one level, and movement across levels. We do not retrain the networks or restart the particles at every level. Finite chains can still mix poorly, so this is an approximate method at a limited budget.

Sources: [Algorithm 1 and Section 4.1](https://arxiv.org/html/2302.11552v6#S4.SS1).

## 10. Langevin demonstration

Speaker: Parth

This demo isolates the inner loop at a fixed noise level. The score attracts particles toward higher density, while fresh random noise lets them spread. Their balance samples a distribution rather than finding only its peak. Click One update or Run Langevin and watch the histogram. Try a smaller step size. It reduces the discretization bias, but exploration can take more updates. Adding fresh sampling noise does not change t. The full annealed algorithm carries particles between levels; changing the controls here resets this fixed-level demonstration.

Presenter cue: Demo: start from the board preset, run Langevin, pause, reduce h and reset. A finite particle histogram fluctuates.

Sources: [Langevin updates and annealed sampling](https://arxiv.org/html/2302.11552v6#S4.SS1).

## 11. Energy-based parameterization

Speaker: Parth

The paper's second method is an energy model. Low energy means high density, and the score is minus the input gradient of the energy. Unlike a direct score network, this gives relative density values. MALA and adjusted HMC need that information to accept or reject proposed moves. Energy values also support further compositions such as mixtures, with care about normalizing constants. Computing the score through an input gradient costs more computation. Our MNIST study uses score networks and unadjusted Langevin. We should not claim to implement the energy branch or an acceptance correction.

Sources: [Energy models: Section 4.2](https://arxiv.org/html/2302.11552v6#S4.SS2).

## 12. Evidence reported by the authors

Speaker: Parth

The synthetic examples let us compare geometry with a known target. The paper also tests object positions, ImageNet classifier conditioning, and text and spatial image compositions. Here is one reported image result. For five cube-position conditions, its score model reaches 57.4 percent success with reverse diffusion, 60.2 with ULA and 71.1 with unadjusted HMC at matching score-evaluation budgets. These are the authors' numbers. This supports studying the sampler, but does not guarantee an improvement on every task or establish our MNIST outcome. Larger sampling budgets and input gradients cost computation.

Sources: [Authors' project page](https://energy-based-model.github.io/reduce-reuse-recycle/), [Table 2 and Section 5.2](https://arxiv.org/html/2302.11552v6#S5.SS2), [Limitations in Section 6](https://arxiv.org/html/2302.11552v6#S6).

## 13. Our MNIST setup

Speaker: Parth

Our adaptation trains A on digits zero and one, and B on one and six. Check both experts alone before composing them. AND should favour their shared digit one. A AND NOT B should suppress one and favour zero. These are hypotheses. We compare ordinary reverse diffusion with annealed Langevin using the same frozen networks, and include a matched expert-evaluation budget. Our tweaks are the step size, updates per level and NOT strength. Alpha zero is the A-only control. We record the training setup, initialization, hardware and seeds. In the high-noise limit, the AND product has covariance one half I, while NOT at alpha one half has covariance two I. Finite endpoints approximate those starting distributions.

Presenter cue: State the actual resolution, samples per class, network, training updates and schedule after training. Keep planned wording until results exist.

Sources: [Method adapted from Section 4.1](https://arxiv.org/html/2302.11552v6#S4.SS1).

## 14. Our MNIST results

Speaker: Parth

These spaces will contain our actual sample grids and measurements. First inspect the experts alone, then compare the AND and NOT outputs from both samplers. We use one as the target digit for AND and zero for NOT. All rates use all generated samples as the denominator. We also inspect readability and variety. Once the results arrive, explain which setting helped, which failed and what it cost. We will not claim exact image sampling or a universal sampler advantage from class accuracy alone.

Presenter cue: Results are pending. Replace this draft with the measured comparison. Add a real grid for each expert and method, fill N, alpha, seeds and the results table, and report an unsuccessful setting.

## 15. Takeaways and limits

Speaker: Parth

The paper explains why a valid score composition can mismatch the reverse diffusion path. It offers annealed MCMC and an energy-based extension. Our Gaussian example checks the reasoning exactly. Our MNIST study tests how sampler choice affects quality, class behaviour and cost with learned experts. We will report what helped and what failed, including a loss at the same compute budget if that occurs. Finite mixing, score errors and NOT instability remain limits. We are reproducing a small mechanism from the paper, not its complete image system. Thank you.

Sources: [Paper and discussion](https://arxiv.org/html/2302.11552v6#S6).

## Short answers for questions

Are the noisy expert scores useless?
No. They describe noisy experts and provide scores for composed intermediate targets when those targets can be normalized.

Does adding scores cause the failure?
The sum is a correct product score. Its noise path generally differs from the forward path ordinary reverse diffusion needs.

Are the mesh strands sample trajectories?
Each strand evaluates a score at one fixed spatial coordinate through time. Particle motion is a separate numerical demonstration.

Why does the symmetric Gaussian example need no annealing?
The opposite means cancel and both expert variances stay at one, so their product stays Normal(0,0.5). It isolates the mismatch rather than an annealing benefit.

Does the minus sign mean subtracting densities?
No. It represents a ratio relative to a base density. Its integral must be finite.

What is different about an energy network?
It provides relative density values as well as an input gradient. Adjusted samplers need those values to compute acceptance probabilities.

Does a high acceptance rate guarantee good mixing?
No. A chain can accept many small moves and still explore slowly.

Does AND guarantee ones, or NOT guarantee zeros?
No. Those are class-behaviour hypotheses. We must inspect real outputs and measure quality, variety and class rates.

Can a digit classifier prove exact MNIST sampling?
No. It measures one aspect of behaviour. The exact image product or ratio density is not known in our experiment.

What if Langevin loses at the matched budget?
Report the result and its limits. Step size, mixing, score error and computation can all matter.
