---
title: "Solidaria App: a mobile network for mutual aid"
description: "An Android app, built with Flutter and Firebase, that connects people in need with people willing to help. My project for the Object-Oriented Programming course at Universidad Nacional de Colombia."
lang: en
date: 2020-07-05
permalink: /projects/solidaria-app/
translation: /es/proyectos/solidaria-app/
tags: [Object-oriented design, Flutter, Firebase, Mobile apps]
published: true
repository: "https://github.com/jhernandezga/Proyecto-POO-Economia-Solidaria"
---

In the Object-Oriented Programming course at Universidad Nacional de Colombia (first semester of 2020), each of us had to propose and develop a project that applied object-oriented programming to help with a social problem. The problem, the idea and the way to build it were up to us.

I chose to work on how help was reaching people during the first COVID-19 lockdown, and built Solidaria App: an Android app, written in Dart with Flutter and backed by Firebase, that works as a small social network for the *economía solidaria*, the solidarity economy. The project poster is in the [repository](https://github.com/jhernandezga/Proyecto-POO-Economia-Solidaria).

<figure>
  <img src="{{ '/assets/images/projects/solidaria/screens.jpg' | relative_url }}" alt="Four phone screenshots: a feed of help offers, a feed of requests, a carousel of shared experiences, and a chat conversation." loading="lazy">
  <figcaption><b>Fig. 1</b>Offers of help, requests, shared experiences and a chat between two users.</figcaption>
</figure>

## Context

The project was written in the middle of the first COVID-19 lockdown. By May 2020, unemployment in Colombia had risen to 21.4 %, 10.9 points higher than a year before (DANE), and many families could no longer cover their basic needs.

Help did exist, from the government, organisations and individuals, but it was scattered across social networks and rarely reached the people who needed it most. They often did not know which programmes were available, and had nowhere to say what they needed.

## The idea

A single platform where people offering help and people who need it can find each other, built around the solidarity economy: donations, barter and volunteer work rather than profit. The app lets users:

- **publish offers of help**, their own or a third party's, with contact information;
- **publish a need**;
- **talk directly** through a chat between the person in need and the person willing to help;
- **share cases**: short stories of help given or received, shown as a carousel.

<figure class="narrow">
  <img src="{{ '/assets/images/projects/solidaria/login.jpg' | relative_url }}" alt="Login screen of Solidaria App next to a list of its four functions." loading="lazy">
  <figcaption><b>Fig. 2</b>The login screen and the four things the app lets you do, from the project poster.</figcaption>
</figure>

## Object-oriented design

The app started from a class model, designed before any of the interface:

- **`User`** holds the profile and the actions: publish an offer, publish a need, publish a case, send a message.
- **`Publication`** is an abstract class with what every post shares (identifier, title, content, date, author). **Need** and **Help** specialise it; an offer of help adds contact details, a subtitle, an image and a like counter.
- **`Case`** is a shared experience with an image, and **`Chat`** is a conversation between two users.

<figure>
  <img src="{{ '/assets/images/projects/solidaria/model.jpg' | relative_url }}" alt="UML class diagram with Usuario, Chat, Publicacion, Necesidad, Ayuda and Caso, showing inheritance from Publicacion and publish associations from Usuario." loading="lazy">
  <figcaption><b>Fig. 3</b>The class model (in Spanish): <em>Usuario</em> publishes <em>Necesidad</em>, <em>Ayuda</em> and <em>Caso</em>; both kinds of publication inherit from <em>Publicacion</em>.</figcaption>
</figure>

Encapsulation shows up in small places too. A chat room needs the same identifier whichever of the two users opens it, so `Chat` builds it privately from both names in a fixed order:

```dart
String _createChatRoomId(String a, String b) {
  if (a.codeUnitAt(0) > b.codeUnitAt(0)) {
    return "${b}_$a";
  } else {
    return "${a}_$b";
  }
}
```

## Architecture

- **Flutter and Dart** for the interface, with the `provider` package for state.
- **Firebase Authentication** for sign-up and login. A `Wrapper` widget listens to the authentication state and sends the user either to the login flow or to the home page.
- **Cloud Firestore** as the database, with separate collections for users, needs, offers of help, cases and chat rooms, streamed live to the lists in the app.
- **Firebase Storage** for the images attached to posts, picked from the phone.

<figure>
  <img src="{{ '/assets/images/projects/solidaria/structure.jpg' | relative_url }}" alt="Navigation diagram: App leads to Wrapper, which leads to LoginPage and RegisterPage for anonymous users, or to HomePage and its lists, publication, card, chat and case pages for authenticated users." loading="lazy">
  <figcaption><b>Fig. 4</b>Navigation: the <em>Wrapper</em> splits anonymous and authenticated users; the home page leads to the lists of offers and needs, the cases and the chats.</figcaption>
</figure>

## How the work went

1. **Problem.** Looking at how help was reaching people during the lockdown, and where it was not.
2. **Solution.** Comparing a few alternatives and settling on an Android app.
3. **Tools.** Learning Dart, Flutter and Firebase, which were new to me.
4. **Design.** Writing the functional requirements, the class model and the navigation of the app.
5. **Build.** Implementing, testing and fixing, then presenting it in a poster and publishing the code.

## Results and lessons

The app met its goals: a working network in which a person with a need and a person willing to help can find each other and talk. It was published as free software so that others could improve it or use it as a base for something larger.

The poster ended with a list of what was still missing: donations inside the app, finding people who need help nearby, notifications, user preferences, faster image loading, and a more polished design.

It was an exercise in turning a class diagram into software that other people could use, and a reminder that the technical part is the easy half: the hard part is reaching the people the tool is for.
