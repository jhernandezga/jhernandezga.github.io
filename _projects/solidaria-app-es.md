---
title: "Solidaria App: una red móvil de ayuda mutua"
description: "Una app Android, hecha con Flutter y Firebase, que conecta a personas con necesidades con quienes están dispuestos a ayudar. Mi proyecto para la asignatura de Programación Orientada a Objetos de la Universidad Nacional de Colombia."
lang: es
date: 2020-07-05
permalink: /es/proyectos/solidaria-app/
translation: /projects/solidaria-app/
tags: [Diseño orientado a objetos, Flutter, Firebase, Apps móviles]
published: true
repository: "https://github.com/jhernandezga/Proyecto-POO-Economia-Solidaria"
---

En la asignatura de Programación Orientada a Objetos de la Universidad Nacional de Colombia (2020-1), cada estudiante debía plantear y desarrollar un proyecto que aplicara la programación orientada a objetos para ayudar con una problemática social. El problema, la idea y la forma de construirla quedaban a nuestra elección.

Decidí trabajar sobre cómo llegaban las ayudas a las personas durante la primera cuarentena por la COVID-19, y construí Solidaria App: una app Android, escrita en Dart con Flutter y respaldada por Firebase, que funciona como una pequeña red social para la economía solidaria. El póster del proyecto está en el [repositorio](https://github.com/jhernandezga/Proyecto-POO-Economia-Solidaria).

<figure>
  <img src="{{ '/assets/images/projects/solidaria/screens.jpg' | relative_url }}" alt="Cuatro capturas de pantalla: un listado de ayudas, un listado de publicaciones, un carrusel de casos y una conversación de chat." loading="lazy">
  <figcaption><b>Fig. 1</b>Ayudas, necesidades, casos compartidos y un chat entre dos usuarios.</figcaption>
</figure>

## Contexto

El proyecto se hizo en plena primera cuarentena por la COVID-19. En mayo de 2020 el desempleo en Colombia había llegado al 21,4 %, 10,9 puntos más que un año antes (DANE), y muchas familias ya no podían cubrir sus necesidades básicas.

Las ayudas existían, del gobierno, de organizaciones y de particulares, pero estaban dispersas en las redes sociales y rara vez llegaban a quienes más las necesitaban. Esas personas a menudo no conocían las ayudas vigentes y no tenían dónde expresar lo que necesitaban.

## La idea

Una sola plataforma donde quienes ofrecen ayuda y quienes la necesitan puedan encontrarse, pensada desde la economía solidaria: donaciones, trueque y trabajo voluntario, sin ánimo de lucro. La app permite:

- **publicar ayudas**, propias o de un tercero, con información de contacto;
- **publicar una necesidad**;
- **conversar directamente** por chat entre quien tiene una necesidad y quien está dispuesto a ayudar;
- **compartir casos**: historias breves de ayuda dada o recibida, en forma de carrusel.

<figure class="narrow">
  <img src="{{ '/assets/images/projects/solidaria/login.jpg' | relative_url }}" alt="Pantalla de ingreso de Solidaria App junto a la lista de sus cuatro funciones." loading="lazy">
  <figcaption><b>Fig. 2</b>La pantalla de ingreso y las cuatro funciones de la app, tomadas del póster del proyecto.</figcaption>
</figure>

## Diseño orientado a objetos

La app partió de un modelo de clases, diseñado antes que cualquier parte de la interfaz:

- **`Usuario`** guarda el perfil y las acciones: publicar una ayuda, publicar una necesidad, publicar un caso, enviar un mensaje.
- **`Publicación`** es una clase abstracta con lo que comparte cualquier publicación (identificador, título, contenido, fecha, autor). **Necesidad** y **Ayuda** la especializan; una ayuda añade datos de contacto, un subtítulo, una imagen y un contador de «me gusta».
- **`Caso`** es una experiencia compartida con imagen, y **`Chat`** es una conversación entre dos usuarios.

<figure>
  <img src="{{ '/assets/images/projects/solidaria/model.jpg' | relative_url }}" alt="Diagrama de clases UML con Usuario, Chat, Publicacion, Necesidad, Ayuda y Caso, con herencia desde Publicacion y asociaciones de publicación desde Usuario." loading="lazy">
  <figcaption><b>Fig. 3</b>El modelo de clases: <em>Usuario</em> publica <em>Necesidad</em>, <em>Ayuda</em> y <em>Caso</em>; ambos tipos de publicación heredan de <em>Publicacion</em>.</figcaption>
</figure>

El encapsulamiento aparece también en detalles pequeños. Una sala de chat necesita el mismo identificador la abra cualquiera de los dos usuarios, así que `Chat` lo construye en privado a partir de ambos nombres, en un orden fijo:

```dart
String _createChatRoomId(String a, String b) {
  if (a.codeUnitAt(0) > b.codeUnitAt(0)) {
    return "${b}_$a";
  } else {
    return "${a}_$b";
  }
}
```

## Arquitectura

- **Flutter y Dart** para la interfaz, con el paquete `provider` para el estado.
- **Firebase Authentication** para el registro y el ingreso. Un widget `Wrapper` escucha el estado de autenticación y lleva al usuario al flujo de ingreso o a la página principal.
- **Cloud Firestore** como base de datos, con colecciones separadas para usuarios, necesidades, ayudas, casos y salas de chat, que se transmiten en vivo a las listas de la app.
- **Firebase Storage** para las imágenes de las publicaciones, elegidas desde el teléfono.

<figure>
  <img src="{{ '/assets/images/projects/solidaria/structure.jpg' | relative_url }}" alt="Diagrama de navegación: App lleva a Wrapper, que lleva a LoginPage y RegisterPage para usuarios sin autenticación, o a HomePage y sus listas, publicaciones, tarjetas, chats y casos para usuarios autenticados." loading="lazy">
  <figcaption><b>Fig. 4</b>Navegación: el <em>Wrapper</em> separa a los usuarios sin autenticación de los autenticados; la página principal lleva a las listas de ayudas y necesidades, a los casos y a los chats.</figcaption>
</figure>

## Cómo avanzó el trabajo

1. **Problema.** Mirar cómo llegaban las ayudas a las personas durante la cuarentena, y dónde no llegaban.
2. **Solución.** Comparar algunas alternativas y quedarme con una app para Android.
3. **Herramientas.** Aprender Dart, Flutter y Firebase, que eran nuevos para mí.
4. **Diseño.** Escribir los requisitos funcionales, el modelo de clases y la navegación de la app.
5. **Construcción.** Implementar, probar y corregir; después presentarla en un póster y publicar el código.

## Resultados y aprendizajes

La app cumplió sus objetivos: una red funcional en la que una persona con una necesidad y alguien dispuesto a ayudar pueden encontrarse y conversar. Se publicó como software libre para que otros pudieran mejorarla o usarla como base de un proyecto más grande.

El póster terminaba con una lista de lo que faltaba: donaciones desde la propia app, encontrar a personas que necesitan ayuda cerca, notificaciones, preferencias de usuario, una carga de imágenes más rápida y un diseño más pulido.

Fue un ejercicio de convertir un diagrama de clases en software que otras personas pudieran usar, y un recordatorio de que la parte técnica es la mitad fácil: lo difícil es llegar a las personas para quienes se hace la herramienta.
