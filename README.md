# lunshuffle ("Lieferzauber")

### 1. Build process

#### 1.1 Pre-Requirements

```
$ sudo npm install -g gulp
$ npm install
```

<br>
#### 1.2 Hints

##### Do not work in the /public folder, change only files in /assets!
###### Gulp will optimize the files and move them to /public

<br>
#### 1.3 Tasks

use this command to list all available tasks

```
$ gulp --tasks
```

##### 1.3.1 Main tasks

use `gulp build` for production or `gulp dev` for development


###### 2. Features to be added

- make ingredients & categories excludable
- add settings panel where you can adjust the level of randomness
- hardcore mode to hide all details
- mild mode to show all details (also the food selection...)