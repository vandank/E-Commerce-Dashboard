#!/usr/bin/env bash

# Frontend build
cd frontend-react
npm install
npm run build

# Backend setup
cd ../backend
pip install -r requirements.txt
