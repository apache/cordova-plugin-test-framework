# Cordova Labs

> Caution: Safety Goggles are Recommended!

## Purpose

The purpose of this repo is for experimental code. Examples include demo apps,
native api explorations, or anything really that does not fit in an existing Cordova platform.

## Project Organization

> Everyone works on a branch

`master` branch should *never* have content.

Each project should create a separate branch to work on. There are major benefits
to this practice:

- Each project has an isolate git history, which allows for easy migration to
  a new git repository;
- Working directory is not polluted with the files of other projects.
- Projects will not step on each others toes.

## Migrating Repositories

One day, you labs project may grow up and need it's own repository.
You can easily move all of your Git history to your new repository with the
following steps:

    # cd to labs and checkout your project's branch
    git checkout my-branch

    # add your new repository as a remote
    git add remote my-remote <url>

    # currently, my-remote should be empty (no commits)

    # push my-branch to my-remote's master branch
    git push my-remote my-branch:master

    # now clone your new project (my-remote)
    git clone <url>
