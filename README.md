# Projet Démineur Multijoueur

## Introduction
Ce projet a débuté durant l'été 2022, avant d'être repris en main et terminé en 2024. Sa première version "finie" date du 29/12/2024.

C'est un site internet lancé à l'aide de NodeJS et Fastify, permetant de lancer des parties de démineur en multijoueur : soit en coopération, ou bien en affrontement.

Le tout a été rédigé en TypeScript, et les parties communiquent avec le serveur à l'aide de Websockets.

## Points à améliorer

Des choses à modifier, qui arriveront peut-être dans un futur proche !

- Accessibilité : créer un tutoriel 
- Mettre à jour Fastify vers la version 5
- Supprimer toutes les références à JQuery
- Ajouter de nouveaux modes
- Documenter un maximum le code

## Lancer le serveur en dév

### Serveur NodeJS 
```bash
npm run start:watch
```

Lance `nodemon`, et permet de réactualiser le serveur dès qu'une modification de code est effectuée.

### Compiler le TypeScript
```bash
npm run compile
```

Les scripts JS du navigateur sont aussi rédigés en TypeScript, et doivent donc être recompilés en JavaScript. 