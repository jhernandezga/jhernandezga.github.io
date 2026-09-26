---
title: "Generating wing interference patterns with GANs"
description: "A three-month summer internship at CNRS ETIS: generative models to augment a scarce image dataset used to identify tsetse flies."
lang: en
date: 2023-08-15
permalink: /projects/wing-pattern-gans/
translation: /es/proyectos/gan-patrones-alas/
tags: [Generative models, GANs, Data augmentation, PyTorch]
published: true
repository: "https://github.com/jhernandezga/Deep-based-generation-of-WIPS"
---

A three-month summer internship (15 May – 15 August 2023), done in my second year at ENSEA in the CELL team of the CNRS ETIS laboratory, supervised by Camille Simon Chane and Aymeric Histace. The [full internship report (PDF)]({{ '/assets/files/wips-internship-report.pdf' | relative_url }}) has every experiment in detail.

<figure>
  <img src="{{ '/assets/images/projects/wips/wip-example.jpg' | relative_url }}" alt="Close-up of an insect wing showing bands of magenta, green and yellow produced by light interference in the wing membrane." loading="lazy">
  <figcaption><b>Fig. 1</b>A wing interference pattern. The colours come from light interfering in the thin wing membrane, and they differ from one species to another.</figcaption>
</figure>

## Context

Tsetse flies (*Glossina*) transmit Human African Trypanosomiasis, or sleeping sickness. Knowing which species are present in the field helps target vaccination and elimination campaigns, but identification today depends on a few trained experts and on destructive, costly techniques such as DNA barcoding and mass spectrometry.

The ETIS Deeptera project identifies species instead from **wing interference patterns** (WIPs), photographed without damaging the specimen and classified with deep learning ([Cannet et al., *Scientific Reports*, 2022](https://doi.org/10.1038/s41598-022-24522-w)). The classifiers are precise, but they fail on rare species. Of the 5,516 WIP images available, 1,766 belong to *Glossina*, spread over 23 species: 18 of them have fewer than 100 images, and some only one or two. The team had proposed generative models as a way to fill those gaps; this internship was the first exploration of that idea.

The goal was to find a generative architecture suited to these images and use it to augment eight underrepresented *Glossina* classes, which had between 20 and 96 images each.

## The model

A generative adversarial network (GAN) sets two networks against each other. A generator `G` turns random noise `z` into images; a discriminator `D` tries to tell them apart from real ones:

```
min_G max_D  𝔼ₓ[log D(x)] + 𝔼_z[log(1 − D(G(z)))]
```

At the optimum, the distribution of generated images equals the distribution of real ones and the discriminator can do no better than chance. In practice, training is unstable, and GANs are prone to *mode collapse*: the generator learns to produce a few convincing images over and over.

## What I did

- **Prepared the data.** I corrected labelling errors, missing files and mixed RGB/RGBA images, built a clean reference table and a PyTorch dataset, and resized the images to 256 × 116 pixels (padded to 256 × 256).
- **Explored architectures** with the TorchGAN framework, first on a single species with intricate textures (*Sergentomyia schwetzi*, 100 images): adversarial autoencoders, DCGAN, BEGAN and residual (ResNet) GANs with the Wasserstein loss and gradient penalty.
- **Fought mode collapse.** The ResNet WGAN-GP captured texture well but produced little diversity. I tried spectral normalization, PacGAN, manifold-entropy regularization and a conditional model; the Wasserstein divergence loss (WGAN-div) was the one that restored diversity while keeping texture and colour.
- **Trained the selected model** separately for each of the eight classes, between 3,000 and 12,000 epochs each, a day or more of GPU time per class.

<div class="figure-grid">
  <figure><img src="{{ '/assets/images/projects/wips/arch-resnet-wdiv.jpg' | relative_url }}" alt="Generated wing with sharp texture and colour." loading="lazy"><figcaption>ResNet · W-div</figcaption></figure>
  <figure><img src="{{ '/assets/images/projects/wips/arch-resnet-wgp.jpg' | relative_url }}" alt="Generated wing with good texture." loading="lazy"><figcaption>ResNet · WGAN-GP</figcaption></figure>
  <figure><img src="{{ '/assets/images/projects/wips/arch-dcgan-wgp.jpg' | relative_url }}" alt="Generated wing with a washed-out, grainy texture." loading="lazy"><figcaption>DCGAN · WGAN-GP</figcaption></figure>
  <figure><img src="{{ '/assets/images/projects/wips/arch-aae.jpg' | relative_url }}" alt="Blurred orange shape with no texture." loading="lazy"><figcaption>Adv. autoencoder</figcaption></figure>
</div>

| Architecture | Loss | FID ↓ |
| --- | --- | --- |
| ResNet | Wasserstein divergence | **12.44** |
| ResNet | Wasserstein, gradient penalty | 13.14 |
| DCGAN | Wasserstein, gradient penalty | 20.02 |
| Adversarial autoencoder | MSE + Wasserstein | 57.19 |

The Fréchet Inception Distance (FID) compares the distribution of 20 generated images with the 100 real *S. schwetzi* images; lower is closer.

## Results

<figure class="figure-pair">
  <img src="{{ '/assets/images/projects/wips/tachinoides-real.jpg' | relative_url }}" alt="Four real Glossina tachinoïdes wings with vivid magenta and green bands." loading="lazy">
  <img src="{{ '/assets/images/projects/wips/tachinoides-generated.jpg' | relative_url }}" alt="Four generated wings with similar colours and shapes but softer detail." loading="lazy">
  <figcaption><b>Fig. 2</b>Real (top) and generated (bottom) wings of <em>Glossina tachinoïdes</em>, a class with 94 training images.</figcaption>
</figure>

- For the classes with around 95 images, the generated wings recover shape, colour and much of the texture. For the classes with about 20, they turn blurry and the texture flattens.
- The FID per class ranged from 7.4 to 12.7.
- The models did not collapse: the highest structural similarity (SSIM) between any two generated images stayed at or below 0.66, far from the 0.90 threshold used to flag near-duplicates.
- But in the features of a pretrained ResNet-18, projected with t-SNE, generated and real images formed **separate clusters in every class**.

<figure class="narrow">
  <img src="{{ '/assets/images/projects/wips/tsne-tachinoides.jpg' | relative_url }}" alt="t-SNE scatter plot: real images form a cluster on the left, generated images a separate cluster on the right." loading="lazy">
  <figcaption><b>Fig. 3</b>t-SNE of image features for <em>G. tachinoïdes</em>: real images (blue) and generated images (green) do not mix.</figcaption>
</figure>

## What I take from it

The usual checks said the results were good: a low FID, convincing samples, no duplicates. The feature space said something else: the generated wings were new, but not quite *Glossina* wings as a classifier would see them. So they have to be used for augmentation with care, and the question that matters, whether they actually improve the classifier, remained open at the end of the internship.

It taught me not to trust a single number, and to look directly at where the data lie.
