// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("game");
  }

  init() {
    // this is called before the scene is created
    // init variables
    // take data passed from other scenes
    // data object param {}
  }

  preload() {
    // load assets
    this.load.image("sky", "./public/assets/sky.png");
    this.load.image("ground", "./public/assets/platform.png");
    this.load.image("star", "./public/assets/star.png");
    this.load.image("bomb", "./public/assets/bomb.png");
    this.load.spritesheet("dude", "./public/assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // create game objects
    this.add.image(400, 300, "sky");

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate(function (child) {
      child.setBounceY(Phaser.Math.FloatBetween(1, 1));
      
    });

    this.bombs = this.physics.add.group();

    this.score = 0;
    this.gameOver = false;

    this.scoreText = this.add.text(16, 16, `Score: ${this.score}`, {
      fontSize: "32px",
      fill: "#000",
    });

    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      null,
      this
    );

    this.input.keyboard.on('keydown-R', () => { // al preisionar la tecla R la ecena se reinicia 
      this.scene.restart();
  });

    this.gameOverText = this.add.text(        // este codigo creo el texto pero no aun no lo muestra
    
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'GAME OVER',
      { fontSize: '64px', fill: '#ff0000' }
    ).setOrigin(0.5).setVisible(false);
     
    // Crea una variable para guardar el tiempo que queda. Comienza en 30 segundos
    this.timeLeft = 30; 
    //Muestra el tiempo en la esquina superior derecha.
this.timerText = this.add.text(780, 16, `Time: ${this.timeLeft}`, {
  fontSize: '32px',
  fill: '#000'
}).setOrigin(1, 0); //hace que el texto se alinee a la derecha.

//Este evento ejecuta la función onSecond() cada segundo.
this.timerEvent = this.time.addEvent({
  delay: 1000, // cada 1000 ms = 1 segundo
  callback: this.onSecond,
  callbackScope: this,
  loop: true
});
  }

  update() {
    // update game objects
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);

      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);

      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);

      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }

  collectStar(player, star) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      //  A new batch of stars to collect

      this.timeLeft = 30; // reiniciar el temporizador si recolectaste todas las estrellas
      this.timerText.setText(`Time: ${this.timeLeft}`);

      this.stars.children.iterate(function (child) {
        child.enableBody(true, child.x, 0, true, true);
      
      });

      var x =
        this.player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      var bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }

  hitBomb(player, bomb) {
    this.physics.pause();

    this.player.setTint(0xff0000);

    this.player.anims.play("turn");

    this.gameOver = true;

    this.gameOverText.setVisible(true);  // esta linea hace visble el texto cuando el player toca la bomba 
  } 
  // esta funcion se llama cada segundo. Resta tiempo, actualiza el texto, y verifica si llega a cero.
  onSecond() {
    if (!this.gameOver) {
      this.timeLeft--;
      this.timerText.setText(`Time: ${this.timeLeft}`);
  
      if (this.timeLeft <= 0) {
        this.physics.pause();
        this.player.setTint(0xff0000);
        this.player.anims.play('turn');
        this.gameOver = true;
        this.gameOverText.setVisible(true);
      }
    }
  }
}
