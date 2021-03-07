# This page intentionally left blank 
> An over-engineered "Hello world" for websites.

Using the first thing any IT engineer does when getting to know a new system to exemplify the underlying complexity of needing a new website.

This project contains examples of some of the capabilities a full-stack developer should have. It covers topics for the areas within frontend, backend, operations, continuous integration and continuous deployment.

The user story this project tries to address is:
As a visitor to my mail-only domain
I want to see a clear message indicating that nothing is to be found on said domain
So that I know it's intentionally left blank

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=YnkDK_intentionally-left-blank&metric=alert_status)](https://sonarcloud.io/dashboard?id=YnkDK_intentionally-left-blank)
![Health Check Status](https://img.shields.io/endpoint?color=a&url=https%3A%2F%2Fshieldsio.mastdi.workers.dev%2Fshields%2Fcklw9viae000001mtbhtu9ucn)

# Getting started
- TODO: public/index.html
- TODO: Cloudflare

# Features
In addition to the page displaying a clear message to the visitor, this project covers:
- robots.txt
- security.txt
- sitemap
- static code analysis using SonarCloud
- continuous deployment using GitHub actions
- security and serverless using Cloudflare Workers
- health check monitoring using Postman

# Road map
- automated tests
- more documentation

# Configuration
By using the raw index.html it requires no configuration. 

If the page should be deployed to Cloudflare Workers the wrangler.toml should be updated according to [their documentation](https://developers.cloudflare.com/workers/).

# Licensing 
MIT