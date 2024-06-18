name: 'Test'
on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

# This allows a subsequently queued workflow run to interrupt previous runs
concurrency:
  group: '${{ github.workflow }} @ ${{ github.event.pull_request.head.label || github.head_ref || github.ref }}'
  cancel-in-progress: true

jobs:
  lint:
    name: 'Run Linter'
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v3
      - name: 'Setup Node'
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'yarn'
      - name: 'Install Dependencies'
        run: yarn install
      - name: 'Run Linter'
        run: yarn lint
  unittest:
    name: 'Run Unit Tests'
    runs-on: ubuntu-latest
    steps:
      - name: 'Checkout Repository'
        uses: actions/checkout@v3
      - name: 'Setup Node'
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'yarn'
      - name: 'Install Dependencies'
        run: yarn install
      - name: 'Run Unit Tests'
        run: yarn test