---
title: "Deep learning for sparse-view CT reconstruction"
description: "A from-scratch PyTorch implementation of LEARN, an unrolled network in which every layer is one iteration of a reconstruction algorithm."
lang: en
date: 2023-12-15
permalink: /projects/sparse-view-ct-learn/
translation: /es/proyectos/tc-pocas-vistas-learn/
tags: [Inverse problems, CT reconstruction, Unrolled networks, PyTorch]
published: true
repository: "https://github.com/jhernandezga/CT_Reconstruction_LEARN_paper"
---

A research project supervised by Ishak Ayad (October – December 2023), in which I implemented the LEARN network from scratch in PyTorch and trained it to reconstruct CT slices from 64 projection views.

<figure>
  <img src="{{ '/assets/images/projects/learn/result-thorax.png' | relative_url }}" alt="Three panels: a thin 64-view sinogram, the reconstructed thorax slice, and the full-dose reference slice, which look nearly identical." loading="lazy">
  <figcaption><b>Fig. 1</b>From a 64-view sinogram (left) to the reconstruction (centre, SSIM 0.91), compared with the full-dose clinical reference (right). Thorax slice from the held-out test patient.</figcaption>
</figure>

## Context

Computed tomography reconstructs a slice of the body from its projections, the sinogram. Acquiring fewer projection views lowers the radiation dose, but it turns reconstruction into a severely ill-posed inverse problem: with too few views, classical filtered back-projection (FBP) fills the image with streak artefacts.

The classical answer is to add prior knowledge through a regularizer and solve an optimization problem:

```
x̂ = arg minₓ  ½ ‖A x − y‖² + R(x)
```

where `x` is the image, `y` the measured sinogram, and `A` the CT forward operator, which computes the projections of an image. Gradient descent on this objective gives the iteration

```
xₜ₊₁ = xₜ − α ( Aᵀ(A xₜ − y) + ∇R(xₜ) )
```

It works, but it needs hundreds of iterations, and `R` has to be designed by hand (total variation, for example).

## The model

LEARN (Learned Experts' Assessment-based Reconstruction Network, Chen et al., *IEEE Transactions on Medical Imaging*, 2018) **unrolls** a fixed number of these iterations into the layers of a network, and learns what was hand-designed: each layer gets its own step size and its own regularizer, trained end to end. In my implementation, layer `t` computes

```
xₜ₊₁ = xₜ − αₜ · B(A xₜ − y) − Rₜ(xₜ)
```

- **30 layers**, each with its own parameters; nothing is shared between layers.
- **`αₜ`** is a learnable step size, initialised at 0.1.
- **`Rₜ`** is a small CNN that plays the role of the regularizer's gradient: three 5 × 5 convolutions (1 → 48 → 48 → 1 channels) with ReLU activations.
- **`B`** maps the sinogram residual back to the image. I used the filtered back-projection operator (Ram-Lak filter) instead of the plain adjoint `Aᵀ`, which acts as a preconditioner and keeps the step well scaled.
- **`x₀`**, the starting image, is the FBP reconstruction of the sparse sinogram, streaks included.

`A` and FBP are ODL operators computed on the GPU by the ASTRA Toolbox and wrapped as PyTorch modules. The physics of the scanner is therefore part of every layer, and gradients flow through it during training.

{% include diagrams/learn.html lang='en' caption='<b>Fig. 2</b>The unrolled network. Every layer compares its current image with the measurements through the forward model (upper path) and applies a learned correction (lower path).' %}

## Data and simulation

- **Images:** full-dose 3 mm slices from the 2016 AAPM–Mayo Low-Dose CT Grand Challenge, used as ground truth. I trained on 25 random slices from each of eight patients and tested on a ninth, held-out patient. Each slice is normalised to [0, 1] and resized to 256 × 256.
- **Geometry:** a fan-beam scanner with 64 views spread over 360° and 800 detector elements, simulated with ODL.
- **Noise:** the starting FBP image is computed from a sinogram with simulated Poisson noise (incident intensity I₀ = 5 × 10⁶) and additive Gaussian noise (σ = 0.05), mimicking a low-dose acquisition.

## Training

- **Loss:** mean squared error between the network's output and the full-dose slice.
- **Optimizer:** Adam, learning rate 10⁻⁴, reduced to 10⁻⁵ by cosine annealing; batches of 16; up to 50 epochs.
- **Framework:** PyTorch Lightning, with TensorBoard to follow the loss and the reconstructed images during training.
- **Evaluation:** SSIM, PSNR and RMSE against the full-dose reference; separate scripts evaluate a checkpoint and reconstruct a single slice.

## Results and lessons

<figure>
  <img src="{{ '/assets/images/projects/learn/result-pelvis.png' | relative_url }}" alt="Three panels: a 64-view sinogram, the reconstructed pelvis slice, and the full-dose reference slice." loading="lazy">
  <figcaption><b>Fig. 3</b>Pelvis slice from the held-out patient: SSIM 0.92 from 64 views.</figcaption>
</figure>

From 64 views, the network recovers the anatomy of slices it never saw, with an SSIM of 0.91–0.92 against the full-dose reference and without the streaks of FBP. Fine details, such as the smallest vessels in the lungs, are smoothed. I then characterized how reconstruction quality degrades as the number of views decreases, a core challenge of limited-data inverse problems.

The main lesson is the value of keeping the forward model inside the network: the learned part only has to supply what the measurements cannot, rather than relearn the physics of the scanner. With 30 small CNNs and 30 step sizes, the network stays compact and interpretable, because each layer is still a step of an algorithm you can read.
