var clock = 0;
const STEPTIME = 100;
var person = {
  attributes: {
    hygiene: 100,
    hunger: 100,
    energy: 100,
    bladder: 100
  },
  crits: 0,
  name: "Sid",
  lock: false
}

function getAttribute( name ) {
  return $('.' + name).text();
}

function log( message, type ) {
  $('.log').prepend('<li class="' + type + '">' + message + '</li>');
}

function bumpClock() {
  clock++;
  var days = clock / 3600;
  var remainder = clock % 3600;
  var hours = remainder / 60;
  remainder = remainder % 60;

   $('.clock').text(Math.floor(days) + 'd ' + Math.floor(hours) + 'h ' +  remainder + 'm');
}

$(document).ready( function() {
  log('Simulation started.', 'info');
  cycle();
  
} );

function cycle() {
  person.attributes.energy -= 0.1; // 15 hrs a da
  person.attributes.bladder -= 0.15 // 7 times a day is apparently the average
  if (person.attributes.hygiene > 0) {
    person.attributes.hygiene -= 0.05
  }
  bumpClock();
  setTimeout(cycle, STEPTIME);

  for (var key in person.attributes) {
    if (person.attributes.hasOwnProperty(key)) {
      var slider = $('.' + key);
      if(person.attributes[key] < 20) {
        slider.css('background-color', '#f00');
      } else if (person.attributes[key] > 90) {
        slider.css('background-color', '#0f0');
      } else {
        slider.css('background-color', '#999');
      }
      slider.text(Math.round(person.attributes[key]));
      slider.css('width', person.attributes[key] + '%');

      if (person.attributes[key] < 5) {
        // critical failure
        person.crits++;
        switch (key) {
          case "bladder":
            if (person.lock) {
              log(person.name + " wet the bed.", "critical");
            } else {
              log(person.name + " didn't get to the toilet in time.", "critical");
            }
            person.attributes.bladder = 100;
            person.attributes.hygiene -= (person.attributes.hygiene  * 0.25);
            break;
          case "hunger":
            log(person.name + " starved to death.", "critical");
            throw new Error("starvation");
            break;
          case "energy":
            log(person.name + " fell asleep where they stood!", "critical");
            sleepyTime();
            break;
        }

      }
    }
    calcMood();
    doThings();
  }
}

function calcMood() {
  var count = 0;
  var total = 0;
  for (var key in person.attributes) {
    if (person.attributes.hasOwnProperty(key)) {
      total += person.attributes[key];
      count++;
    }
  }
  var mood = (total / count);
  //mood = mood - ( mood * (person.crits / 100) );
  mood = Math.round(mood);
  $('.mood').text(mood);
  $('.mood').css('width', mood + '%');
}

function sleepyTime() {
  person.lock = true;

  person.attributes.energy += 0.2; // 7 hrs sleep
  if (person.attributes.energy < 90) {
    if (person.attributes.bladder < 20){
      if (person.attributes.energy > 80) {
        log(person.name + ' woke up needing the loo!');
        person.lock = false;
        return;
      }
    }
    setTimeout(sleepyTime, STEPTIME);
  } else {
    person.lock = false;
    log(person.name + " woke up.", "info");
  }
}

function doThings() {
    if (Math.random() > 0.05) {
      return;
    }
    var rand = Math.random() * 100;
  if (!person.lock) {
// x^2/100-10
    if (rand > (person.attributes.hygiene*2)) {
      log(person.name + ' went for a shower', 'shower');
      person.attributes.hygiene = Math.round(80 + (Math.random() * 20));
    } else if ((rand > person.attributes.energy) && person.attributes.energy < 25) {
      log(person.name + ' went to bed', 'info');
      sleepyTime();
    } else if (rand > person.attributes.bladder) {
      log(person.name + ' went to the loo.', 'info');
      person.attributes.bladder = 100;
    }
  }
}
