---
title: "Deep learning para reconstrucción de tomografía con pocas vistas"
description: "Una implementación desde cero en PyTorch de LEARN, una red unrolled en la que cada capa es una iteración de un algoritmo de reconstrucción."
lang: es
date: 2023-12-15
permalink: /es/proyectos/tc-pocas-vistas-learn/
translation: /projects/sparse-view-ct-learn/
tags: [Problemas inversos, Reconstrucción de TC, Redes unrolled, PyTorch]
published: true
repository: "https://github.com/jhernandezga/CT_Reconstruction_LEARN_paper"
---

Un proyecto de investigación supervisado por Ishak Ayad (octubre – diciembre de 2023), en el que implementé desde cero en PyTorch la red LEARN y la entrené para reconstruir cortes de tomografía a partir de 64 proyecciones.

<figure>
  <img src="{{ '/assets/images/projects/learn/result-thorax.png' | relative_url }}" alt="Tres paneles: un sinograma estrecho de 64 vistas, el corte de tórax reconstruido y el corte de referencia de dosis completa, casi idénticos." loading="lazy">
  <figcaption><b>Fig. 1</b>De un sinograma de 64 vistas (izquierda) a la reconstrucción (centro, SSIM 0,91), comparada con la referencia clínica de dosis completa (derecha). Corte de tórax del paciente de prueba, no visto en el entrenamiento.</figcaption>
</figure>

## Contexto

La tomografía computarizada reconstruye un corte del cuerpo a partir de sus proyecciones, el sinograma. Adquirir menos vistas reduce la dosis de radiación, pero convierte la reconstrucción en un problema inverso muy mal condicionado: con muy pocas vistas, la retroproyección filtrada (FBP) clásica llena la imagen de artefactos en forma de rayas.

La respuesta clásica es añadir conocimiento previo mediante un regularizador y resolver un problema de optimización:

```
x̂ = arg minₓ  ½ ‖A x − y‖² + R(x)
```

donde `x` es la imagen, `y` el sinograma medido y `A` el operador directo de la tomografía, que calcula las proyecciones de una imagen. El descenso por gradiente sobre este objetivo da la iteración

```
xₜ₊₁ = xₜ − α ( Aᵀ(A xₜ − y) + ∇R(xₜ) )
```

Funciona, pero necesita cientos de iteraciones, y `R` hay que diseñarlo a mano (la variación total, por ejemplo).

## El modelo

LEARN (Learned Experts' Assessment-based Reconstruction Network, Chen et al., *IEEE Transactions on Medical Imaging*, 2018) **desenrolla** (*unrolling*) un número fijo de estas iteraciones en las capas de una red, y aprende lo que antes se diseñaba a mano: cada capa tiene su propio paso y su propio regularizador, entrenados de extremo a extremo. En mi implementación, la capa `t` calcula

```
xₜ₊₁ = xₜ − αₜ · B(A xₜ − y) − Rₜ(xₜ)
```

- **30 capas**, cada una con sus propios parámetros; ninguno se comparte entre capas.
- **`αₜ`** es un paso aprendible, inicializado en 0,1.
- **`Rₜ`** es una pequeña CNN que cumple el papel del gradiente del regularizador: tres convoluciones de 5 × 5 (1 → 48 → 48 → 1 canales) con activaciones ReLU.
- **`B`** lleva el residuo del sinograma de vuelta a la imagen. Usé el operador de retroproyección filtrada (filtro Ram-Lak) en lugar del adjunto `Aᵀ`, lo que actúa como precondicionador y mantiene el paso bien escalado.
- **`x₀`**, la imagen inicial, es la reconstrucción FBP del sinograma con pocas vistas, con sus rayas incluidas.

`A` y la FBP son operadores de ODL calculados en la GPU con ASTRA Toolbox y envueltos como módulos de PyTorch. La física del escáner forma parte de cada capa, y los gradientes la atraviesan durante el entrenamiento.

{% include diagrams/learn.html lang='es' caption='<b>Fig. 2</b>La red desenrollada. Cada capa compara su imagen actual con las mediciones a través del modelo directo (camino superior) y aplica una corrección aprendida (camino inferior).' %}

## Datos y simulación

- **Imágenes:** cortes de 3 mm de dosis completa del 2016 AAPM–Mayo Low-Dose CT Grand Challenge, usados como referencia. Entrené con 25 cortes aleatorios de cada uno de ocho pacientes y evalué en un noveno paciente, reservado. Cada corte se normaliza a [0, 1] y se redimensiona a 256 × 256.
- **Geometría:** un escáner de haz en abanico con 64 vistas repartidas en 360° y 800 elementos detectores, simulado con ODL.
- **Ruido:** la imagen FBP inicial se calcula a partir de un sinograma con ruido de Poisson simulado (intensidad incidente I₀ = 5 × 10⁶) y ruido gaussiano aditivo (σ = 0,05), imitando una adquisición de baja dosis.

## Entrenamiento

- **Pérdida:** error cuadrático medio entre la salida de la red y el corte de dosis completa.
- **Optimizador:** Adam, tasa de aprendizaje 10⁻⁴, reducida a 10⁻⁵ con *cosine annealing*; lotes de 16; hasta 50 épocas.
- **Framework:** PyTorch Lightning, con TensorBoard para seguir la pérdida y las imágenes reconstruidas durante el entrenamiento.
- **Evaluación:** SSIM, PSNR y RMSE frente a la referencia de dosis completa; scripts aparte evalúan un modelo guardado y reconstruyen un corte individual.

## Resultados y aprendizajes

<figure>
  <img src="{{ '/assets/images/projects/learn/result-pelvis.png' | relative_url }}" alt="Tres paneles: un sinograma de 64 vistas, el corte de pelvis reconstruido y el corte de referencia de dosis completa." loading="lazy">
  <figcaption><b>Fig. 3</b>Corte de pelvis del paciente de prueba: SSIM 0,92 a partir de 64 vistas.</figcaption>
</figure>

A partir de 64 vistas, la red recupera la anatomía de cortes que nunca vio, con un SSIM de 0,91–0,92 frente a la referencia de dosis completa y sin las rayas de la FBP. Los detalles finos, como los vasos más pequeños de los pulmones, quedan suavizados. Después analicé cómo se degrada la calidad de reconstrucción al reducir el número de vistas, uno de los retos centrales de los problemas inversos con datos limitados.

La lección principal es el valor de mantener el modelo directo dentro de la red: la parte aprendida solo tiene que aportar lo que las mediciones no pueden, en lugar de volver a aprender la física del escáner. Con 30 pequeñas CNN y 30 pasos, la red sigue siendo compacta e interpretable, porque cada capa sigue siendo un paso de un algoritmo que se puede leer.
