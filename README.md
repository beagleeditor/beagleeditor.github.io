# BeagleEditor - be-site branch
A code editor called BeagleEditor but this branch is for its site
## What is this?
This is the branch for BeagleEditor site and it doesn't contain any executable file
### How to visit site?
It is very simple. Just go to [this site](https://beaglesoftware.github.io/editor).

## Website development

The complete website is built with Vite and React. Main-site page content lives in `src/`, while documentation is authored in Markdown under `docs/` and rendered by the React documentation experience.

```sh
npm install
npm run dev
npm run build
npm run preview
```

The production build creates the static HTML route shells and bundles the complete website into `dist/` for GitHub Pages. The GitHub Actions workflow builds and deploys that output.
