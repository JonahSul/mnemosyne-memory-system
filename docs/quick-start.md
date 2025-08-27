---
id: quick-start
title: Quick Start
---

This Quick Start shows how to run the documentation site locally and how to build and publish it to GitHub Pages. It assumes you have Node.js (>=16) and npm installed.

1) Clone the repo

  git clone https://github.com/JonahSul/mnemosyne-memory-system.git
  cd mnemosyne-memory-system

2) Install dependencies

  npm ci

3) Run the docs site locally (development server)

  npm start

Open http://localhost:3000 to view the site. The docs live at the site root.

4) Build the site for production

  npm run build

Built static files will be in the ./build directory.

5) Deploy with the provided GitHub Action

Push to main to trigger the GitHub Actions workflow to build and publish the site to GitHub Pages (gh-pages branch). The site will be available at:

  https://JonahSul.github.io/mnemosyne-memory-system/

Notes:
- This PR intentionally does not move existing docs files. If you want the sidebar/categories to reference specific existing docs filenames, we can follow up with a mapping PR that reorganizes or adds lightweight index files to map to current filenames.