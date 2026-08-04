#!/usr/bin/env sh

# abort on errors
set -e

# get the origin 
ORIGIN=$(git config --get remote.origin.url)
echo $ORIGIN

# build
# Force the Groq key empty regardless of a local .env — anything in the
# bundle is public, and this is a production deploy.
VITE_GROQ_API_KEY="" npm run build

# navigate into the build output directory
cd dist

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git checkout -B main
# merge into the existing examples/ (Vite already copied public/examples/DEAN.osdpi
# there); trailing /. copies contents instead of nesting a new examples/ dir inside it
cp -r ../../examples/. examples
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f $ORIGIN main:gh-pages

cd -

