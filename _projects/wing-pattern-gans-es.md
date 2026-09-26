---
title: "Generación de patrones de interferencia alar con GANs"
description: "Una práctica de verano de tres meses en el CNRS ETIS: modelos generativos para ampliar un conjunto escaso de imágenes usado para identificar moscas tsetsé."
lang: es
date: 2023-08-15
permalink: /es/proyectos/gan-patrones-alas/
translation: /projects/wing-pattern-gans/
tags: [Modelos generativos, GANs, Aumento de datos, PyTorch]
published: true
repository: "https://github.com/jhernandezga/Deep-based-generation-of-WIPS"
---

Una práctica de verano de tres meses (15 de mayo – 15 de agosto de 2023), realizada en mi segundo año en ENSEA dentro del equipo CELL del laboratorio CNRS ETIS, supervisada por Camille Simon Chane y Aymeric Histace. El [informe completo de la práctica (PDF, en inglés)]({{ '/assets/files/wips-internship-report.pdf' | relative_url }}) detalla todos los experimentos.

<figure>
  <img src="{{ '/assets/images/projects/wips/wip-example.jpg' | relative_url }}" alt="Primer plano del ala de un insecto con bandas magenta, verdes y amarillas producidas por la interferencia de la luz en la membrana." loading="lazy">
  <figcaption><b>Fig. 1</b>Un patrón de interferencia alar. Los colores se deben a la interferencia de la luz en la delgada membrana del ala y cambian de una especie a otra.</figcaption>
</figure>

## Contexto

Las moscas tsetsé (*Glossina*) transmiten la tripanosomiasis humana africana, o enfermedad del sueño. Saber qué especies están presentes en el terreno ayuda a orientar las campañas de vacunación y eliminación, pero hoy la identificación depende de unos pocos expertos y de técnicas destructivas y costosas, como el código de barras de ADN o la espectrometría de masas.

El proyecto Deeptera de ETIS identifica las especies a partir de los **patrones de interferencia alar** (WIPs), fotografiados sin dañar el espécimen y clasificados con deep learning ([Cannet et al., *Scientific Reports*, 2022](https://doi.org/10.1038/s41598-022-24522-w)). Los clasificadores son precisos, pero fallan con las especies raras. De las 5.516 imágenes de WIPs disponibles, 1.766 son de *Glossina*, repartidas en 23 especies: 18 tienen menos de 100 imágenes y algunas solo una o dos. El equipo había propuesto los modelos generativos para llenar esos vacíos; esta práctica fue la primera exploración de esa idea.

El objetivo era encontrar una arquitectura generativa adecuada para estas imágenes y usarla para ampliar ocho clases de *Glossina* poco representadas, con entre 20 y 96 imágenes cada una.

## El modelo

Una red generativa adversaria (GAN) enfrenta a dos redes. Un generador `G` convierte ruido aleatorio `z` en imágenes; un discriminador `D` intenta distinguirlas de las reales:

```
min_G max_D  𝔼ₓ[log D(x)] + 𝔼_z[log(1 − D(G(z)))]
```

En el óptimo, la distribución de las imágenes generadas es igual a la de las reales y el discriminador no puede hacerlo mejor que el azar. En la práctica, el entrenamiento es inestable y las GANs tienden al *colapso de modos*: el generador aprende a producir unas pocas imágenes convincentes una y otra vez.

## Lo que hice

- **Preparé los datos.** Corregí errores de etiquetado, archivos faltantes e imágenes RGB/RGBA mezcladas, construí una tabla de referencia limpia y un dataset de PyTorch, y redimensioné las imágenes a 256 × 116 píxeles (con relleno hasta 256 × 256).
- **Exploré arquitecturas** con el framework TorchGAN, primero sobre una sola especie de textura compleja (*Sergentomyia schwetzi*, 100 imágenes): autoencoders adversariales, DCGAN, BEGAN y GANs residuales (ResNet) con pérdida de Wasserstein y penalización de gradiente.
- **Combatí el colapso de modos.** La ResNet WGAN-GP capturaba bien la textura pero producía poca diversidad. Probé normalización espectral, PacGAN, regularización por entropía de variedad y un modelo condicional; la pérdida de divergencia de Wasserstein (WGAN-div) fue la que recuperó la diversidad manteniendo la textura y el color.
- **Entrené el modelo elegido** por separado para cada una de las ocho clases, entre 3.000 y 12.000 épocas cada una, un día o más de GPU por clase.

<div class="figure-grid">
  <figure><img src="{{ '/assets/images/projects/wips/arch-resnet-wdiv.jpg' | relative_url }}" alt="Ala generada con textura y color nítidos." loading="lazy"><figcaption>ResNet · W-div</figcaption></figure>
  <figure><img src="{{ '/assets/images/projects/wips/arch-resnet-wgp.jpg' | relative_url }}" alt="Ala generada con buena textura." loading="lazy"><figcaption>ResNet · WGAN-GP</figcaption></figure>
  <figure><img src="{{ '/assets/images/projects/wips/arch-dcgan-wgp.jpg' | relative_url }}" alt="Ala generada con textura granulada y desvaída." loading="lazy"><figcaption>DCGAN · WGAN-GP</figcaption></figure>
  <figure><img src="{{ '/assets/images/projects/wips/arch-aae.jpg' | relative_url }}" alt="Forma naranja borrosa, sin textura." loading="lazy"><figcaption>Autoencoder adv.</figcaption></figure>
</div>

| Arquitectura | Pérdida | FID ↓ |
| --- | --- | --- |
| ResNet | Divergencia de Wasserstein | **12,44** |
| ResNet | Wasserstein, penalización de gradiente | 13,14 |
| DCGAN | Wasserstein, penalización de gradiente | 20,02 |
| Autoencoder adversarial | MSE + Wasserstein | 57,19 |

La distancia de Fréchet Inception (FID) compara la distribución de 20 imágenes generadas con las 100 imágenes reales de *S. schwetzi*; cuanto más baja, más cercanas.

## Resultados

<figure class="figure-pair">
  <img src="{{ '/assets/images/projects/wips/tachinoides-real.jpg' | relative_url }}" alt="Cuatro alas reales de Glossina tachinoïdes con bandas magenta y verdes intensas." loading="lazy">
  <img src="{{ '/assets/images/projects/wips/tachinoides-generated.jpg' | relative_url }}" alt="Cuatro alas generadas con colores y formas similares pero detalle más suave." loading="lazy">
  <figcaption><b>Fig. 2</b>Alas reales (arriba) y generadas (abajo) de <em>Glossina tachinoïdes</em>, una clase con 94 imágenes de entrenamiento.</figcaption>
</figure>

- En las clases con unas 95 imágenes, las alas generadas recuperan la forma, el color y buena parte de la textura. En las clases con unas 20, se vuelven borrosas y la textura se aplana.
- El FID por clase varió entre 7,4 y 12,7.
- Los modelos no colapsaron: la mayor similitud estructural (SSIM) entre dos imágenes generadas se mantuvo en 0,66 o menos, lejos del umbral de 0,90 usado para detectar casi duplicados.
- Pero en las características de una ResNet-18 preentrenada, proyectadas con t-SNE, las imágenes generadas y las reales formaron **grupos separados en todas las clases**.

<figure class="narrow">
  <img src="{{ '/assets/images/projects/wips/tsne-tachinoides.jpg' | relative_url }}" alt="Gráfico t-SNE: las imágenes reales forman un grupo a la izquierda y las generadas un grupo separado a la derecha." loading="lazy">
  <figcaption><b>Fig. 3</b>t-SNE de las características de <em>G. tachinoïdes</em>: las imágenes reales (azul) y las generadas (verde) no se mezclan.</figcaption>
</figure>

## Lo que me llevo

Las comprobaciones habituales decían que los resultados eran buenos: un FID bajo, muestras convincentes, ningún duplicado. El espacio de características decía otra cosa: las alas generadas eran nuevas, pero no del todo alas de *Glossina* tal como las vería un clasificador. Por eso deben usarse con cuidado para aumentar datos, y la pregunta que importa, si realmente mejoran el clasificador, quedó abierta al final de la práctica.

Me enseñó a no fiarme de un solo número y a mirar directamente dónde están los datos.
