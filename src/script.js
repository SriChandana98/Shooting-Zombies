(function setup(window) {
  var document = window.document;
  Object.prototype.on = function(a, b) {
    this.addEventListener(a, b);
    return this;
  };
  Object.prototype.off = function(a, b) {
    this.removeEventListener(a, b);
    return this;
  };
  Array.prototype.remove = function(x) {
    let a = [];
    for (let i in this)
      if (i != x)
        a.push(this[i]);
    return a;
  };
  window.can = document.querySelector("canvas");
  window.ctx = window.can.getContext("2d");
  window.can.width = window.innerWidth;
  window.can.height = window.innerHeight;
  window.randInt = function(a, b) {
    if (a === void 0) return Math.round(Math.random());
    else if (b === void 0) return Math.floor(Math.random() * a);
    else return Math.floor(Math.random() * (b - a + 1) + a);
  };
  window.randFloat = function(a, b) {
    if (a === void 0) return Math.random();
    else if (b === void 0) return Math.random() * a;
    else return Math.random() * (b - a) + a;
  };
  window.rand = function(a, b) {
    return Array.isArray(a) ? a[Math.floor(Math.random() * a.length)] : window.randInt(a, b);
  };
}(window));

(function play(gameover) {
  var zombieKillCount = 0;
  can.style.cursor = "none";
  var mouse = {
    x: can.width / 2,
    y: -can.height
  };
  var player = {
    x: can.width / 2,
    y: can.height / 2,
    s: 20,
    mx: 0,
    my: 0,
    a: 0,
    d: 1,
    speed: 3,
    speak: false,
    say: function(s) {
      this.message = s;
      if (!this.speak)
        this.speak = true;
    },
    softcore: [
      "Revolver",
      "Shotgun",
      "Machine Gun",
      "Sniper Rifle"
    ],
    hardcore: [
      "Minigun",
      "Mega Shotgun",
      "Laser Gun",
      "Ring of Fire"
    ],
    weapon: "Revolver",
    applyWeaponProperties: function() {
      switch(this.weapon) {
        case "Revolver":
          this.magSize = 6;
          this.barrelSize = 1.5;
          this.bulletSize = 1;
          this.girth = 1;
          this.hits = 2;
          this.spray = 1;
          this.reloadTime = 0;
          this.velocity = 1;
          this.shade = 200;
          this.laser = false;
          this.fire = false;
          break;
        case "Shotgun":
          this.magSize = 9;
          this.barrelSize = 2;
          this.bulletSize = 0.75;
          this.girth = 1.2;
          this.spray = 3;
          this.hits = 1;
          this.reloadTime = 0;
          this.velocity = 1;
          this.shade = 100;
          this.laser = false;
          this.fire = false;
          break;
        case "Machine Gun":
          this.magSize = 30;
          this.barrelSize = 2;
          this.bulletSize = 1;
          this.girth = 1.2;
          this.hits = 1;
          this.spray = 1;
          this.reloadTime = 0;
          this.velocity = 0.75;
          this.shade = 100;
          this.fireRate = 10;
          this.laser = false;
          break;
        case "Sniper Rifle":
          this.magSize = 5;
          this.barrelSize = 2.5;
          this.bulletSize = 1.5;
          this.girth = 1;
          this.spray = 1;
          this.hits = Infinity;
          this.reloadTime = 0;
          this.velocity = 2;
          this.shade = 50;
          this.laser = false;
          this.fire = false;
          break;
        case "Mega Shotgun":
          this.magSize = 50;
          this.spray = 5;
          this.barrelSize = 2;
          this.bulletSize = 1;
          this.girth = 1.5;
          this.hits = 1;
          this.reloadTime = 0;
          this.velocity = 1.5;
          this.shade = 100;
          this.laser = false;
          this.fire = false;
          break;
        case "Minigun":
          this.magSize = 500;
          this.barrelSize = 2.5;
          this.bulletSize = 2;
          this.girth = 2;
          this.hits = 3;
          this.spray = 1;
          this.fireRate = 5;
          this.reloadTime = 0;
          this.velocity = 3;
          this.shade = 0;
          this.laser = false;
          break;
        case "Laser Gun":
          this.magSize = Infinity;
          this.barrelSize = 2;
          this.bulletSize = 2;
          this.girth = 1.5;
          this.spray = 1;
          this.fireRate = 20;
          this.hits = Infinity;
          this.velocity = 3;
          this.shade = 0;
          this.laser = true;
          break;
        case "Ring of Fire":
          this.magSize = 74;
          this.spray = 37;
          this.barrelSize = 0;
          this.bulletSize = 2;
          this.reloadTime = 0;
          this.hits = 2;
          this.shade = 0;
          this.girth = 0;
          this.fireRate = 5;
          this.velocity = 2;
          this.laser = true;
          this.fire = false;
      }
    },
    out: false,
    fire: false,
    showGun: true,
    showMode: true,
    hardcoreMode: 30,
    lives: 3,
    zombiesKilled: 0,
    bullets: [],
    fireRound: function(n) {
      if (n === void 0) n = 0;
      let a = Math.atan2(mouse.y - this.y, mouse.x - this.x);
      if (!this.out)
        this.bullets.push({
          x: this.weapon == "Ring of Fire" ? this.x : this.x + Math.cos(a) * 2 * this.s,
          y: this.weapon == "Ring of Fire" ? this.y : this.y + Math.sin(a) * 2 * this.s,
          hit: false,
          hits: 0,
          px: Math.cos(a + n),
          py: Math.sin(a + n)
        });
      if (this.showGun && this.bullets.length % this.magSize === 0) {
        this.out = true;
        this.say("Reload!");
      } else this.speak = false;
    }
  };
  player.applyWeaponProperties();
  var zombies = [];
  var Zombie = function() {
    let s = rand(20, 30);
    let a = rand(zombies.length < player.hardcoreMode ? 25 : 50) === 0;
    let sp = rand(zombies.length + 10) === 0;
    let speed = (sp ? 2 : 1) * randFloat(0, 0.5);
    speed += zombies.length / 20;
    let x = a ? rand(-s * rand(2, 10), can.width + s * rand(2, 10)) : rand([-s * rand(2, 10), can.width + s * rand(2, 10)]);
    let y = a ? rand([-s * rand(2, 10), can.height + s * rand(2, 10)]) : rand(-s * rand(2, 10), can.height + s * rand(2, 10));
    return {
      x: x,
      y: y,
      wx: x,
      wy: y,
      s: s,
      a: 0,
      d: 1,
      special: sp,
      color: [rand(50, 100), rand(100, 150), rand(50)],
      eyeColor: sp ? [255, 255, 255] : rand([
        [rand(200, 255), rand(20), rand(20)],
        [rand(20), rand(200, 255), rand(200, 255)],
        [rand(rand(200, 255)), rand(200, 255), rand(20)]
      ]),
      speed: speed < 2 * player.speed ? speed : player.speed * 1.5
    };
  };
  for (let i = 0; i < 10; i++)
    zombies.push(new Zombie());
  var shadow = {
    apply: function() {
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = -10;
      ctx.shadowOffsetY = 10;
    },
    reset: function() {
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
  };
  var Grass = function() {
    return {
      x: rand(can.width),
      y: rand(can.height),
      tx: rand(-3, 3),
      ty: rand(-5, -10),
      c: [0, rand(50, 100), 0]
    };
  };
  var grass = [];
  for (let i = 0; i < 100; i++)
    grass.push(new Grass());
  var frames = 0;
  
  var questions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correctOption: "Paris"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Earth", "Mars", "Venus", "Jupiter"],
      correctOption: "Mars"
    },
    {
      question: "You're 4th place right now in a race. What place will you be in when you pass the person in 3rd place?",
      options: [
            "1st",
            "2nd",
            "3rd",
           "None of the above"
      ],
      correctOption: "3rd"
    },
    {
      question: "How many months have 28 days?",
        options: [
            "2",
            "1",
            "All of them",
            "Depends if there's a leap year or not"
        ],
        correctOption: "All of them" 
    },
    {
      question: "The answer is really big. ",
      options: [
          "THE ANSWER.",
          "Really big.",
          "An elephant.",
          "The data given is insufficient."
      ],
      correctOption: "THE ANSWER." 
    },
    {
      question: "Divide 30 by half and add ten. ",
      options: [
          "40.5",
          "50",
          "70",
          "I know this is a trick question, so NONE. Ha!"
      ],
      correctOption: "70"
    },
    {
      question: "There are two clocks of different colors: The green clock is broken and doesn't run at all, but the yellow clock loses one second every 24 hours. Which clock is more accurate? ",
      options: [
          "The green clock",
          "The yellow clock",
          "Neither",
          "Both"
      ],
      correctOption: "The green clock" 
    },
    {
      question: "Who is responsible to measure the Project’s performance?",
      options: [
          "Scrum Master",
          "Delivery Manager",
          "Development Team",
          "Product Owner"
      ],
      correctOption: "Product Owner" 
    },
    {
      question: "What is a Sprint Review?",
      options: [
         "Activity to Introspect and Adapt",
         "Activity to improve Scrum Processes",
         "Activity to plan for the next Sprint",
         "Activity to plan for the release"
      ],
      correctOption: "Activity to plan for the next Sprint",  
    },
    {
      question: "Who should necessarily attend the Daily Standup meeting?",
      options: [
          "The Scrum Team",
          "The Development Team",
          "The Development Team and the Product Owner",
          "The Scrum Team and the Stakeholders"
      ],
      correctOption: "The Development Team" 
    },
    {
      question: "How many pillars does sikes hall have?",
      options: [
          "6",
          "9",
          "7",
          "8"
      ],
      correctOption: "8" 
    },
    {
      question: "What are Clemsons main colors?",
      options: [
          "Orange",
          "Purple",
          "White",
          "All of them"
      ],
      correctOption: "All of them" 
    },
    {
      question: "What is Clemson main library name?",
      options: [
          "Gunnin Architecture Library",
          "R.M Cooper Library",
          "Clemson Library",
          "None of the above"
      ],
      correctOption: "R.M Cooper Library"
    },
    {
      question: "Who is Clemson Football head coach?",
      options: [
          "Dabo Swinney",
          "Mario Critobal",
          "Dave Doeren",
          "None of the above"
      ],
      correctOption: "Dabo Swinney" 
    },
    {
      question: "What brand sponsors Clemson?",
      options: [
          "Adidas",
          "Under Armor",
          "Puma",
          "Nike"
      ],
      correctOption: "Nike"  
    },
    {
      question: "What is the Clemson motto?",
      options: [
          "Who shall separate us now?",
          "Reach for the Stars",
          "For the Land and its People",
          "The spirit makes the master"
      ],
      correctOption: "The spirit makes the master"  
    },
    {
      question: "The Clemson Tigers are based in which American state?",
      options: [
          "New York State",
          "Virginia",
          "Colorado",
          "South Carolina"
      ],
      correctOption: "South Carolina"  
    },
    {
      question: "The home field of the Clemson Tigers football team is known by what nickname?",
      options: [
          "Death Valley",
          "Hell's Kitchen",
          "Easy Street",
          "Struggle Street"
      ],
      correctOption: "Death Valley"   
    },
    {
      question: "What is P.A.W",
      options: [
          "Passionate About Winning",
          "Purpose, Aspiration, and Wisdom",
          "Positively Aiming for Success",
          "Profoundly Ambitious Winners"
      ],
      correctOption: "Passionate About Winning"   
    },
    {
      question: "Who is the world’s biggest producer of oil?",
      options: [
          "Saudi Arabia",
          "United States",
          "Canada",
          "United Arab Emirates"
      ],
      correctOption: "United States"   
    },
    {
      question: "Where would you find the world’s largest desert?",
      options: [
          "Saudi Arabia",
          "China",
          "Egypt",
          "Antartica"
      ],
      correctOption: "Antartica"   
    },
    {
      question: "What element is the periodic number 19, highlighted by the letter K?",
      options:[
          "Potassium",
          "Sodium",
          "Krypton",
          "Nickel"
      ],
      correctOption: "Potassium"   
    }

    // Add more questions and options as needed
  ];

  var canReload = false;

  var correctAnswer;

  // Function to show the custom dialog
  function showCustomDialog() { 
    if (player.bullets.length > 0 && player.showGun) {
  canReload = false; // Reset the reload state
  var randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  correctAnswer = randomQuestion.correctOption; // Store the correct answer
  document.getElementById('customDialog').classList.remove('hidden');
  document.getElementById('dialogQuestion').textContent = randomQuestion.question;

  var options= []
  var radioButtons = document.querySelectorAll('input[name="reloadOption"]');
  for (var i = 0; i < radioButtons.length; i++) {
    radioButtons[i].value = randomQuestion.options[i];
    document.getElementById('labelOption' + (i + 1)).textContent = randomQuestion.options[i];
    options.push(randomQuestion.options[i]);
    debugger
  }
  }
  /*$("#labelOption1").append(`${randomQuestion.options[0]}`);
  $("#labelOption2").append(`${randomQuestion.options[1]}`);*/
  
  

  }

  // Function to handle reloading based on the selected option
  function handleReload() {
    var selectedOption = document.querySelector('input[name="reloadOption"]:checked');
  if (selectedOption) {
    var optionValue = selectedOption.value;
    if (optionValue === correctAnswer) {
      // The selected option is correct, initiate gun reload immediately
      player.showGun = false;
      if (player.speak) player.speak = false;
      setTimeout(function() {
        player.out = false;
        player.bullets = [];
        player.showGun = true;
      }, player.reloadTime);
    } else {
      // The selected option is incorrect
      console.log("Selected option is incorrect:", optionValue);
    }
    // Close the dialog
    document.getElementById('customDialog').classList.add('hidden');
  } else {
    alert("Please select an option before confirming.");
  }
  }


  (function update() {
    ctx.beginPath();
    ctx.clearRect(0, 0, can.width, can.height);
    ctx.shadowColor = "black";
    shadow.reset();
    for (let i in grass) {
      let p = grass[i];
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgb(" + p.c + ")";
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.tx, p.y - p.ty);
      ctx.stroke();
    }
    ctx.strokeStyle = "black";
    if (!gameover) {
    for (let i in player.bullets) {
      p = player.bullets[i];
      if (!p.laser) shadow.apply();
      if (!p.hit) {
        ctx.beginPath();
        if (player.laser) {
          ctx.lineWidth = player.s / 10 * player.bulletSize;
          ctx.strokeStyle = "red";
          ctx.moveTo(p.x - p.px * player.s, p.y - p.py * player.s / 2);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        } else {
          ctx.fillStyle = "black";
          ctx.arc(p.x, p.y, player.s / 10 * player.bulletSize, 0, 2 * Math.PI);
          ctx.fill();
        }
        p.x += p.px * 10 * player.velocity;
        p.y += p.py * 10 * player.velocity;
      }
      shadow.apply();
      for (let x in zombies) {
        let z = zombies[x];
        if (p.x > z.x - z.s &&
           p.x < z.x + z.s &&
           p.y > z.y - z.s &&
           p.y < z.y + z.s &&
           !(z.x + z.s < 0 ||
           z.x - z.s > can.width ||
           z.y + z.s < 0 ||
           z.y - z.s > can.height) &&
           !p.hit) {
          p.hits++;
          if (p.hits == player.hits)
            p.hit = true;
          player.zombiesKilled++;
          zombieKillCount++;
          if (zombies.length == player.hardcoreMode && player.showMode) {
            player.say("Hardcore Mode Entered!");
            player.mark = frames;
            player.showMode = false;
          }
          zombies[x] = new Zombie();
          if (player.zombiesKilled % 10 === 0) {
            zombies.push(new Zombie());
            if (zombies.length == player.hardcoreMode) {
              player.weapon = rand(player.hardcore);
              player.applyWeaponProperties();
            }
          }
          if (z.special) {
            player.weapon = function() {
              let a = [];
              let w = zombies.length < player.hardcoreMode ? player.softcore : player.hardcore;
              for (let n = 0; n < w.length; n++)
                if (player.weapon != w[n])
                  a.push(w[n]);
              return rand(a);
            }();
            player.applyWeaponProperties();
            player.lives++;
            player.mark = frames;
            setTimeout(function() {
              player.out = false;
              player.bullets = [];
            });
            player.say("You found a " + player.weapon.toLowerCase() + "!");
          }
        }
      }
    }
    if (frames == player.mark + 500)
      player.speak = false;
    p = player;
    let a = Math.atan2(mouse.y - p.y, mouse.x - p.x);
    for (let x = -1; x <= 1; x += 2) {
      ctx.beginPath();
      ctx.lineWidth = p.s / 10;
      ctx.strokeStyle = p.weapon == "Ring of Fire" && !p.out ? "red" : "black";
      ctx.fillStyle = "rgb(150, 100, 50)";
      ctx.arc(p.x + p.s * Math.cos(a + x * 30 * Math.PI / 180) + x * p.a * Math.cos(a), p.y + p.s * Math.sin(a + x * 30 * Math.PI / 180) + x * p.a * Math.sin(a), p.s / 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    if (p.showGun) {
      ctx.beginPath();
      ctx.lineWidth = p.s / 2 * p.girth;
      ctx.strokeStyle = "rgb(" + [p.shade, p.shade, p.shade] + ")";
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * p.barrelSize * p.s, p.y + Math.sin(a) * p.barrelSize * p.s);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.lineWidth = p.s / 10;
    ctx.strokeStyle = p.weapon == "Ring of Fire" && !p.out ? "red" : "black";
    ctx.fillStyle = "rgb(150, 100, 50)";
    ctx.arc(p.x, p.y, p.s, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    shadow.reset();
    for (let x = -1; x <= 1; x += 2) {
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.s / 2, p.y + Math.sin(a + x * 35 * Math.PI / 180) * p.s / 2, p.s / 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.s / 2 + Math.cos(a) * p.s / 8, p.y + Math.sin(a + x * 35 * Math.PI / 180) * p.s / 2 + Math.sin(a) * p.s / 8, p.s / 8, 0, 2 * Math.PI);
      ctx.fill();
    }
    if (p.speak) {
      ctx.beginPath();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = p.s + "px creepster";
      ctx.fillText(p.message, p.x, p.y - p.s * 2);
    }
    if (p.fire && frames % p.fireRate === 0)
      switch(p.weapon) {
        case "Laser Gun":
          for (let i = -45; i <= 45; i += 45)
            p.fireRound(i / 10);
          break;
        default:
          p.fireRound();
      }
      p.x += p.mx * p.speed;
      p.y += p.my * p.speed;
      p.a += (p.mx === 0 && p.my === 0 ? 0 : 1) * p.speed / 2 * p.d;
      if (p.a < -5) p.d = 1;
      else if (p.a > 5) p.d = -1;
    }
    for (let i in zombies) {
      p = zombies[i];
      if (gameover) {
        a = rand() === 0;
        a = Math.atan2(p.wy - p.y, p.wx - p.x);
      } else a = Math.atan2(player.y - p.y, player.x - p.x);
      ctx.beginPath();
      shadow.apply();
      ctx.lineWidth = p.s / 10;
      ctx.fillStyle = "rgb(" + p.color + ")";
      for (let x = -1; x <= 1; x += 2) {
        ctx.beginPath();
        ctx.arc(p.x + Math.cos(a + x * 30 * Math.PI / 180) * p.s + x * p.a * Math.cos(a), p.y + Math.sin(a + x * 30 * Math.PI / 180) * p.s + x * p.a * Math.sin(a), p.s / 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      shadow.reset();
      for (let x = -1; x <= 1; x += 2) {
        ctx.beginPath();
        ctx.fillStyle = "rgb(" + p.eyeColor + ")";
        ctx.arc(p.x + Math.cos(a + x * 35 * Math.PI / 180) * p.s / 2, p.y + Math.sin(a + x * 35 * Math.PI / 180) * p.s / 2, p.s / 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      p.x += Math.cos(a) * p.speed;
      p.y += Math.sin(a) * p.speed;
      p.a += p.speed / 2 * p.d;
      if (p.a < -5) p.d = 1;
      else if (p.a > 5) p.d = -1;
      if (player.x + player.s > p.x - p.s &&
         player.x - player.s < p.x + p.s &&
         player.y + player.s > p.y - p.s &&
         player.y - player.s < p.y + p.s) {
        player.lives--;
        if (player.lives < 0) {
          if (!gameover) {
            let zom = new Zombie();
            zom.x = player.x;
            zom.y = player.y;
            zom.s = player.s;
            zom.speed = player.speed;
            zom.eyeColor = [255, 255, 255];
            zombies.push(zom);
          }
          gameover = true;
        } else zombies[i] = new Zombie();
      }
    }
    if (gameover) {
      can.style.cursor = "default";
      ctx.beginPath();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, can.width, can.height);
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.font = "100px creepster";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("YOU DIED! " + (player.zombiesKilled < 1 ? "No" : player.zombiesKilled.toLocaleString()) + " Zombie" + (player.zombiesKilled == 1 ? "" : "s") + " Killed", can.width / 2, can.height / 2);
      ctx.font = "50px creepster";
      ctx.fillText("PRESS ENTER TO RESTART", can.width / 2, 0.75 * can.height);
    } else {
      for (let i = 0; i < player.lives; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.fillStyle = "red";
        ctx.arc(i * 20 + 10, 10, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.fillStyle = "black";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = "20px roboto mono";
      ctx.fillText("Weapon: " + player.weapon, 0, 20);
      ctx.fillText((player.magSize - player.bullets.length) / player.spray + "/" + player.magSize / player.spray, 0, 40);
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.fillStyle = "red";
      ctx.arc(mouse.x, mouse.y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    frames++;

    ctx.fillStyle = "white";
    ctx.font = "20px roboto mono";
    ctx.fillText("Zombies Killed: " + zombieKillCount, 10, can.height - 30);

    requestAnimationFrame(update);
  }());
  can.on("mousedown", function() {
    switch(player.weapon) {
      case "Machine Gun":
      case "Minigun":
      case "Laser Gun":
      player.fire = true;   
    }
  }).on("mouseup", function() {
    switch(player.weapon) {
      case "Revolver":
      case "Sniper Rifle":
      case "Laser Gun":
        player.fireRound();
        break;
      case "Shotgun":
        for (let i = -1; i <= 1; i++)
          player.fireRound(i / 10);
      break;
      case "Mega Shotgun":
        for (let i = -2; i <= 2; i++)
          player.fireRound(i / 10);
        break;
      case "Ring of Fire":
        for (let i = -90; i <= 90; i += 5)
          player.fireRound(i);
      }
    player.fire = false;
  }).on("mousemove", function(e) {
    mouse.x = e.offsetX;
    mouse.y = e.offsetY;
  });
  var move = function(e) {
    if (gameover)
      switch(e.which || e.keyCode) {
        case 32:
        case 13:
          play(false);
          this.off("keydown", move);
      }
    else switch(e.which || e.keyCode) {
        case 37:
        case 65:
          player.mx = -1;
          break;
        case 39:
        case 68:
          player.mx = 1;
          break;
        case 38:
        case 87:
          player.my = -1;
          break;
        case 40:
        case 83:
          player.my = 1;
      }
  };
  window.on("resize", function() {
    can.width = this.innerWidth;
    can.height = this.innerHeight;
    for (let i in grass)
      grass[i] = new Grass();
  }).on("keydown", move)
    .on("keyup", function(e) {
    switch(e.which || e.keyCode) {
      case 37:
      case 65:
      case 39:
      case 68:
        player.mx = 0;
        break;
      case 38:
      case 87:
      case 40:
      case 83:
        player.my = 0;
        break;
      case 82:
        //if (player.bullets.length > 0) {

          /*if (canReload) {
            player.showGun = false;
          if (player.speak)
            player.speak = false;
          setTimeout(function() {
            player.out = false;
              player.bullets = [];
            player.showGun = true;
          }, player.reloadTime);
        } */
          showCustomDialog();
        //}
        break;
    }
  });
  document.getElementById('confirmButton').addEventListener('click', handleReload);

  /*document.getElementById('confirmButton').addEventListener('click', function() {
    var selectedOption = document.querySelector('input[name="reloadOption"]:checked');
  if (selectedOption) {
    var selectedOptionValue = selectedOption.value;
    if (selectedOptionValue === correctAnswer) {
      // The selected option is correct, set canReload to true
      canReload = true;
      console.log("Selected option is correct:", selectedOptionValue);
    } else {
      // The selected option is incorrect, do not reload
      console.log("Selected option is incorrect:", selectedOptionValue);
    }
    // Close the dialog
    document.getElementById('customDialog').classList.add('hidden');
  } else {
    alert("Please select an option before confirming.");
  }
  });*/

}(false));