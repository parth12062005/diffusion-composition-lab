# Two-person speech draft

Krishiv presents the introduction, Gaussian lab and Langevin demo.
Parth presents the MNIST experiment and the closing section.
Allow about 10 minutes. Spend more time on the sliders if the audience asks.
The image experiment has no measured results yet. Keep its wording as planned
work until the real results are inserted.

## Krishiv: Introduction

Our project is based on Reduce, Reuse, Recycle, an ICML 2023 paper by Du and
colleagues. The question is how to combine diffusion models after training.
We plan to train A on MNIST digits zero and one, and B on one and six.
We want AND to favour the shared digit one. We want A AND NOT B to suppress
one and favour zero. These are hypotheses that we will test.

Before looking at images, this website lets us inspect two Gaussian experts.
Their densities and scores are known exactly. That means we can understand a
sampling problem without blaming a neural network for learning badly.

## Krishiv: Gaussian lab

Here we control the mean and variance of each expert. Variance controls its
width. The noise slider applies the same forward corruption to both experts.
At zero we have the clean densities. At one we reach the fully noisy limit.

Move the probe point x. The teal and coral numbers are the two expert scores
at the current point and noise level. A score is the slope of log density.
It tells us a direction for changing the sample.

For AND, we multiply the densities. Taking a log turns the product into a
sum, so the scores add. The purple line is the score of the product of the
two noisy experts. This addition is mathematically correct.

But ordinary reverse diffusion needs the score of a different construction.
It needs us to take the clean product first, then add forward noise to that
product. The dashed line shows that score. Moving the noise slider shows
that the two routes generally give different intermediate distributions.

For the board example, A is Normal(-2,1) and B is Normal(2,1), with variance
as the second number. The clean product is Normal(0,0.5). At the displayed
middle level, noising the clean product gives variance 0.875. Multiplying
the separately noised experts gives variance 0.5. At x=1 their scores are
about -1.14 and -2. The reverse update receives the wrong score if we simply
substitute the expert sum into the usual sampler.

This special example has a constant product across noise levels. Its opposite
means cancel, and both expert variances stay at one. It proves the mismatch,
but does not demonstrate a benefit from annealing. Click Unequal widths to
see a product that actually changes with noise.

Switch to NOT to inspect subtraction. We keep A as the base and divide by
B raised to alpha. The score becomes sA minus alpha times sB. Some variance
and alpha settings produce a ratio whose integral is infinite. The warning
means there is no normalized Gaussian target for those settings. Subtraction
alone does not guarantee a valid probability distribution.

## Krishiv: Langevin demo and handoff

The particle demo holds the chosen noise level fixed. The histogram starts
from a broad distribution and the purple curve is the current exact target.
Click One update to inspect a single step, or Run Langevin to watch the
histogram change.

Each update moves using the current score and adds fresh random noise.
The score attracts particles toward high density. The noise lets them spread
and explore. Their balance produces a distribution rather than only a peak.
Adding that random noise does not change the diffusion noise level t.

Try a smaller step size. The long-run variance is closer to the target, but
exploration can take more updates. A finite update size creates bias, so we
should not call the result exact. The simulated histogram also fluctuates
because we have a finite number of particles.

Annealed sampling repeats this exploration at progressively lower noise
levels. This demo isolates one level so that the balance is easier to see.
The symmetric board example needs no annealing because its product is
already constant across t. I will now hand over to Parth for MNIST.

## Parth: MNIST setup

We will train A on zeros and ones, and B on ones and sixes. Each model learns
to predict noise added to its own training images. We use the same corruption
schedule for both models. Then we freeze their weights.

First we check the experts alone. A should produce readable zeros and ones.
B should produce readable ones and sixes. If the individual models already
fail, we cannot attribute all later problems to composition.

For AND, the shared class is one. For A AND NOT B, we hope to suppress that
shared class and favour zero. These density operations give soft preferences.
They do not enforce exact label sets. Negation can also push toward poor
images where B assigns tiny density, so quality matters as well as class rate.

## Parth: Experiment results

The sample areas are empty until we insert actual generated grids. We will
show each expert alone, then compare ordinary reverse diffusion and annealed
Langevin for AND and NOT. We should use the same number of samples and a
consistent selection rule, rather than showing only attractive examples.

We will record the fraction of ones for AND and the fraction of zeros for
NOT. We will also record predictions outside A's classes, manually unreadable
samples, sampling time and individual expert evaluations. A classifier alone
cannot establish that images look good or match the exact target density.

Our small tweaks are the step size, updates per noise level and alpha.
Alpha zero gives the A-only control. We will compare at a matched number
of expert evaluations and report runtime too. Starting distributions matter:
in the standard-normal high-noise limit, the AND product has variance 0.5.
The NOT ratio has variance 1/(1-alpha), which is 2 at alpha 0.5.

After results arrive, replace this paragraph with the measured comparison:
AND result: [FILL]. NOT result: [FILL]. Best tested setting and cost: [FILL].
Mention an unsuccessful setting and explain any quality-versus-cost tradeoff.

The website can load sample images and measurements locally. Export results
to save a JSON file, then import that file when presenting. Uploaded results
stay in the browser tab and do not automatically become part of the hosted
website.

## Parth: Closing

The Gaussian example gives us an exact explanation of the score mismatch.
MNIST tests the practical behaviour with learned experts. Our main comparison
keeps the networks frozen and changes the sampler.

The paper also offers energy models, adjusted samplers such as MALA, mixtures
and spatial composition. Those are outside our current experiment. A score
network does not directly supply the log-density differences needed by MALA.

Our findings will state what helped, what failed and what it cost. We should
report a loss at the same compute budget if that is what the experiment shows.
Thank you.

## Short answers for questions

Are noisy expert scores useless?
No. They describe the noisy experts. Their combination describes an
intermediate product or ratio when that target can be normalized.

Does adding scores cause the problem?
The sum is a correct product score. The problem is treating its noise path
as the forward path required by ordinary reverse diffusion.

Why does Langevin add noise at the clean level?
The randomness helps sample the clean distribution. Clean describes the
target data distribution, not an instruction to eliminate random updates.

Does NOT mean the complement of B?
We use a ratio relative to A. It is not a stand-alone generator of everything
outside B, and its integral must be finite to define a probability density.

Can we prove correct MNIST sampling from classifier accuracy?
No. Classifier accuracy measures one aspect of behaviour. We also inspect
quality and diversity, and keep the exact 1D example as a separate check.

## Sources

Main paper: https://proceedings.mlr.press/v202/du23a.html
Full text: https://arxiv.org/html/2302.11552v6
Products and negation: Section 3, Equations 8 and 10.
Score mismatch: Section 4, Equations 11 and 12.
Annealed MCMC: Section 4.1, Algorithm 1.
The Gaussian slider examples and MNIST split are our adaptations.
