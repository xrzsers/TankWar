// ==================== 游戏引擎 ====================

class Game {
    /**
     * 创建游戏实例
     * @param {HTMLCanvasElement} canvas - Canvas元素
     */
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = CONFIG.CANVAS_WIDTH;
        this.height = CONFIG.CANVAS_HEIGHT;

        // 游戏对象
        this.gameState = new GameState();
        this.mapGenerator = null;
        this.playerTank = null;
        this.playerTank2 = null;
        this.enemyTanks = [];
        this.bullets = [];
        this.powerups = [];

        // 时间管理
        this.lastFrameTime = Date.now();
        this.deltaTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        // 波次管理
        this.waves = [];
        this.currentWaveIndex = 0;
        this.nextSpawnTime = 0;

        // 输入管理
        this.keys = {};
        this.lastSpacePress = 0;  // 防止连续发射
        this.spacePressDebounce = 100;  // 毫秒，防抖间隔
        this.setupEventListeners();

        // 游戏刻度 (游戏循环)
        this.running = false;
        this.gameLoop = null;
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            // 阻止默认行为（空格、方向键等）
            if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 's', 'a', 'd'].includes(key)) {
                e.preventDefault();
            }

            // P键暂停
            if (key === 'p') {
                this.togglePause();
            }
        });

        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;

            // 阻止默认行为
            if ([' ', 'arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'w', 's', 'a', 'd'].includes(key)) {
                e.preventDefault();
            }
        });

        // 防止页面滚动
        this.canvas.addEventListener('click', () => {
            this.canvas.focus();
        });
    }

    /**
     * 初始化新游戏
     * @param {string} mode - 游戏模式
     * @param {string} difficulty - 难度
     */
    initGame(mode = GAME_MODE.SINGLE, difficulty = DIFFICULTY.NORMAL) {
        this.gameState.initNewGame(mode, difficulty);
        this.setupLevel();
        this.startGameLoop();
    }

    /**
     * 设置关卡
     */
    setupLevel() {
        // 生成地图
        const levelData = this.gameState.levelData;
        this.mapGenerator = new MapGenerator(this.width, this.height);
        this.mapGenerator.generate(levelData.obstaclesDensity);

        // 创建玩家坦克
        if (this.playerTank === null) {
            this.playerTank = new Tank(150, 400, TANK_TYPE.PLAYER);
        }
        this.playerTank.x = 150;
        this.playerTank.y = 400;
        this.playerTank.health = this.playerTank.maxHealth;

        if (this.gameState.mode === GAME_MODE.COOP) {
            if (this.playerTank2 === null) {
                this.playerTank2 = new Tank(650, 400, TANK_TYPE.PLAYER);
            }
            this.playerTank2.x = 650;
            this.playerTank2.y = 400;
            this.playerTank2.health = this.playerTank2.maxHealth;
        }

        // 清空对象
        this.enemyTanks = [];
        this.bullets = [];
        this.powerups = [];

        // 设置波次
        this.setupWaves();
        this.currentWaveIndex = 0;
        this.nextSpawnTime = Date.now() + (this.waves[0]?.delay || 0);
    }

    /**
     * 设置敌坦克波次
     */
    setupWaves() {
        const levelData = this.gameState.levelData;
        this.waves = levelData.waves || [];
    }

    /**
     * 启动游戏循环
     */
    startGameLoop() {
        this.running = true;
        const loop = () => {
            if (this.running) {
                this.update();
                this.draw();
                this.gameLoop = requestAnimationFrame(loop);
            }
        };
        this.gameLoop = requestAnimationFrame(loop);
    }

    /**
     * 停止游戏循环
     */
    stopGameLoop() {
        this.running = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
    }

    /**
     * 暂停/继续游戏
     */
    togglePause() {
        if (this.gameState.state === GAME_STATE.PLAYING) {
            this.gameState.setState(GAME_STATE.PAUSED);
        } else if (this.gameState.state === GAME_STATE.PAUSED) {
            this.gameState.setState(GAME_STATE.PLAYING);
        }
    }

    /**
     * 更新游戏
     */
    update() {
        // 计算时间差
        const now = Date.now();
        this.deltaTime = Math.min((now - this.lastFrameTime) / 1000, 0.016); // 最多16ms
        this.lastFrameTime = now;

        // 计算FPS
        this.frameCount++;
        if (this.frameCount % 30 === 0) {
            this.fps = Math.round(1 / this.deltaTime);
        }

        if (this.gameState.state !== GAME_STATE.PLAYING) {
            return;
        }

        // 处理输入
        this.handleInput();

        // 生成敌坦克
        this.spawnEnemies();

        // 更新坦克
        const obstacles = this.mapGenerator.getObstacles();
        this.playerTank.update(this.deltaTime, obstacles);
        if (this.playerTank2) {
            this.playerTank2.update(this.deltaTime, obstacles);
        }

        for (let i = this.enemyTanks.length - 1; i >= 0; i--) {
            this.enemyTanks[i].update(this.deltaTime, obstacles, this.playerTank);

            // 处理敌坦克的射击（带防抖）
            if (this.enemyTanks[i].shouldFire) {
                const now = Date.now();
                // 为每个敌坦克设置不同的射击间隔（随机 500-1500 ms）
                const fireInterval = 500 + Math.floor(Math.random() * 1000);
                
                if (now - this.enemyTanks[i].lastFireTime > fireInterval) {
                    const bullets = this.enemyTanks[i].fire();
                    if (bullets) {
                        this.bullets.push(...(Array.isArray(bullets) ? bullets : [bullets]));
                    }
                    this.enemyTanks[i].lastFireTime = now;
                }
            }

            if (!this.enemyTanks[i].isAlive) {
                // 敌坦克死亡
                this.onEnemyTankDefeated(this.enemyTanks[i]);
                this.enemyTanks.splice(i, 1);
            }
        }

        // 更新子弹
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update(this.deltaTime);

            if (!this.bullets[i].isActive) {
                this.bullets.splice(i, 1);
            }
        }

        // 检查子弹碰撞
        this.checkBulletCollisions();

        // 更新道具
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            this.powerups[i].update(this.deltaTime);

            if (!this.powerups[i].isActive) {
                this.powerups.splice(i, 1);
            }
        }

        // 检查道具碰撞
        this.checkPowerupCollisions();

        // 更新冰冻状态中所有敌坦克
        if (this.gameState.isFrozen) {
            for (const tank of this.enemyTanks) {
                tank.isFrozen = true;
            }
        } else {
            for (const tank of this.enemyTanks) {
                tank.isFrozen = false;
            }
        }

        // 更新激活的道具
        this.gameState.updatePowerups();

        // 检查关卡完成
        if (this.enemyTanks.length === 0 && this.gameState.enemiesSpawned >= this.gameState.levelData.totalEnemies) {
            this.gameState.levelComplete();
        }

        // 检查游戏失败
        if (this.gameState.baseHealth <= 0) {
            this.gameState.setState(GAME_STATE.GAME_OVER);
        }
    }

    /**
     * 处理输入
     */
    handleInput() {
        // 玩家1控制 - 方向键移动，WASD转向
        let moveDirection = 'none';
        if (this.keys['arrowup']) {
            moveDirection = 'up';
        } else if (this.keys['arrowdown']) {
            moveDirection = 'down';
        } else if (this.keys['arrowleft']) {
            moveDirection = 'left';
        } else if (this.keys['arrowright']) {
            moveDirection = 'right';
        }

        this.playerTank.setMovement(moveDirection);

        // WASD 转向（四个方向）
        if (this.keys['w']) {
            this.playerTank.rotateTank('up');
        }
        if (this.keys['s']) {
            this.playerTank.rotateTank('down');
        }
        if (this.keys['a']) {
            this.playerTank.rotateTank('left');
        }
        if (this.keys['d']) {
            this.playerTank.rotateTank('right');
        }

        // 空格 - 受限射击（防抖）
        if (this.keys[' ']) {
            const now = Date.now();
            if (now - this.lastSpacePress > this.spacePressDebounce) {
                const bullets = this.playerTank.fire();
                if (bullets) {
                    this.gameState.stats.totalBulletsShot += Array.isArray(bullets) ? bullets.length : 1;
                    this.bullets.push(...(Array.isArray(bullets) ? bullets : [bullets]));
                }
                this.lastSpacePress = now;
            }
        }

        // 玩家2控制（双人模式）- IJKL移动，QWEXZ转向
        if (this.playerTank2) {
            let moveDirection2 = 'none';
            if (this.keys['i']) moveDirection2 = 'up';
            else if (this.keys['k']) moveDirection2 = 'down';
            else if (this.keys['j']) moveDirection2 = 'left';
            else if (this.keys['l']) moveDirection2 = 'right';

            this.playerTank2.setMovement(moveDirection2);

            if (this.keys['q']) {
                this.playerTank2.rotateTank('up');
            }
            if (this.keys['e']) {
                this.playerTank2.rotateTank('down');
            }
            if (this.keys['z']) {
                this.playerTank2.rotateTank('left');
            }
            if (this.keys['x']) {
                this.playerTank2.rotateTank('right');
            }

            if (this.keys['enter']) {
                const now = Date.now();
                if (now - this.lastSpacePress > this.spacePressDebounce) {
                    const bullets = this.playerTank2.fire();
                    if (bullets) {
                        this.gameState.stats.totalBulletsShot += Array.isArray(bullets) ? bullets.length : 1;
                        this.bullets.push(...(Array.isArray(bullets) ? bullets : [bullets]));
                    }
                    this.lastSpacePress = now;
                }
            }
        }
    }

    /**
     * 生成敌坦克
     */
    spawnEnemies() {
        if (this.currentWaveIndex >= this.waves.length) {
            return;
        }

        const now = Date.now();
        if (now >= this.nextSpawnTime) {
            const wave = this.waves[this.currentWaveIndex];
            const spawnPoint = this.mapGenerator.getEnemySpawnPoint();

            for (const type of wave.types) {
                const tank = new Tank(spawnPoint.x, spawnPoint.y, type);

                // 应用难度倍数
                const multiplier = CONFIG.DIFFICULTY_MULTIPLIERS[this.gameState.difficulty];
                tank.speed *= multiplier.enemySpeed;
                tank.fireRate *= multiplier.enemyFireRate;

                this.enemyTanks.push(tank);
                this.gameState.enemiesSpawned++;
            }

            // 下一波
            this.currentWaveIndex++;
            if (this.currentWaveIndex < this.waves.length) {
                const nextWave = this.waves[this.currentWaveIndex];
                this.nextSpawnTime = now + (nextWave.delay || 3000);
            }
        }
    }

    /**
     * 检查子弹碰撞
     */
    checkBulletCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.isActive) continue;

            // 与坦克碰撞
            if (bullet.owner === 'player') {
                // 玩家子弹 vs 敌坦克
                for (const enemyTank of this.enemyTanks) {
                    if (bullet.checkCollisionWithRect(
                        enemyTank.x - enemyTank.size / 2,
                        enemyTank.y - enemyTank.size / 2,
                        enemyTank.size,
                        enemyTank.size
                    )) {
                        enemyTank.takeDamage(10);
                        bullet.destroy();
                        this.gameState.stats.totalBulletHit++;
                        break;
                    }
                }
            } else {
                // 敌方子弹 vs 玩家坦克
                if (bullet.checkCollisionWithRect(
                    this.playerTank.x - this.playerTank.size / 2,
                    this.playerTank.y - this.playerTank.size / 2,
                    this.playerTank.size,
                    this.playerTank.size
                )) {
                    // 玩家坦克不受伤，但基地受伤
                    this.gameState.damageBase(10);
                    bullet.destroy();
                }

                if (this.playerTank2 && bullet.checkCollisionWithRect(
                    this.playerTank2.x - this.playerTank2.size / 2,
                    this.playerTank2.y - this.playerTank2.size / 2,
                    this.playerTank2.size,
                    this.playerTank2.size
                )) {
                    this.gameState.damageBase(10);
                    bullet.destroy();
                }
            }

            // 与基地碰撞
            if (bullet.owner === 'enemy') {
                if (checkCircleCollision(
                    bullet.x, bullet.y, bullet.size / 2,
                    CONFIG.BASE.X, CONFIG.BASE.Y, CONFIG.BASE.SIZE / 2
                )) {
                    this.gameState.damageBase(15);
                    bullet.destroy();
                }
            }

            // 与障碍物碰撞
            for (let j = 0; j < this.mapGenerator.getObstacles().length; j++) {
                const obs = this.mapGenerator.getObstacles()[j];
                if (bullet.checkCollisionWithRect(obs[0], obs[1], obs[2], obs[2])) {
                    // 所有砖块都阻挡子弹
                    bullet.destroy();
                    // 可破坏的墙体会被击碎
                    if (obs[3] === 'wall') {
                        this.mapGenerator.removeObstacle(obs[0], obs[1]);
                    }
                    break;
                }
            }

            // 子弹之间的碰撞（不同所有者）
            for (let j = i + 1; j < this.bullets.length; j++) {
                const other = this.bullets[j];
                if (other.owner !== bullet.owner && other.isActive) {
                    const dist = distance(bullet.x, bullet.y, other.x, other.y);
                    if (dist < bullet.size / 2 + other.size / 2) {
                        bullet.destroy();
                        other.destroy();
                        break;
                    }
                }
            }
        }
    }

    /**
     * 检查道具碰撞
     */
    checkPowerupCollisions() {
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const powerup = this.powerups[i];

            if (powerup.checkCollision(this.playerTank.x, this.playerTank.y, this.playerTank.size)) {
                this.gameState.activatePowerup(powerup.type, this.playerTank);
                powerup.destroy();
                this.gameState.addScore(5);
            } else if (this.playerTank2 && powerup.checkCollision(this.playerTank2.x, this.playerTank2.y, this.playerTank2.size)) {
                this.gameState.activatePowerup(powerup.type, this.playerTank2);
                powerup.destroy();
                this.gameState.addScore(5);
            }
        }
    }

    /**
     * 敌坦克被击败时
     * @param {Tank} tank - 被击败的坦克
     */
    onEnemyTankDefeated(tank) {
        this.gameState.incrementKills();

        // 计算分数
        let score = 10;
        switch (tank.type) {
            case TANK_TYPE.NORMAL:
                score = 10;
                break;
            case TANK_TYPE.HEAVY:
                score = 25;
                break;
            case TANK_TYPE.ELITE:
                score = 50;
                break;
            case TANK_TYPE.BOSS:
                score = 200;
                break;
        }
        this.gameState.addScore(score);

        // 生成随机道具
        if (Math.random() < 0.4) {
            const powerupTypes = [
                POWERUP_TYPE.SHIELD,
                POWERUP_TYPE.MULTI_SHOT,
                POWERUP_TYPE.SPEED_BOOST,
                POWERUP_TYPE.HEAL,
                POWERUP_TYPE.FREEZE
            ];
            const randomType = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
            this.powerups.push(new Powerup(tank.x, tank.y, randomType));
        }

        this.gameState.enemiesRemaining--;
    }

    /**
     * 绘制游戏
     */
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 绘制地图
        if (this.mapGenerator) {
            this.mapGenerator.draw(this.ctx);
        }

        // 绘制基地
        drawBase(
            this.ctx,
            CONFIG.BASE.X,
            CONFIG.BASE.Y,
            CONFIG.BASE.SIZE,
            '#FFD700',
            this.gameState.baseHealth < this.gameState.maxBaseHealth
        );

        // 绘制坦克
        this.playerTank.draw(this.ctx);
        if (this.playerTank2) {
            this.playerTank2.draw(this.ctx);
        }

        for (const tank of this.enemyTanks) {
            tank.draw(this.ctx);
        }

        // 绘制子弹
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx);
        }

        // 绘制道具
        for (const powerup of this.powerups) {
            powerup.draw(this.ctx);
        }

        // 绘制冰冻效果
        if (this.gameState.isFrozen) {
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // 绘制暂停界面
        if (this.gameState.state === GAME_STATE.PAUSED) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('暂停', this.width / 2, this.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('按 P 继续游戏', this.width / 2, this.height / 2 + 50);
        }

        // 不显示调试信息
    }

    /**
     * 绘制游戏信息
     */
    drawGameInfo() {
        // 背景面板
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(10, 10, 280, 160);
        
        // 边框
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(10, 10, 280, 160);

        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = 'bold 13px Arial';
        let y = 28;
        const lineHeight = 16;

        const info = this.gameState.getInfo();
        
        // 标题
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fillText('═══ 游戏信息 ═══', 20, y);
        y += lineHeight + 2;
        
        // 游戏信息
        this.ctx.fillStyle = '#00FF00';
        this.ctx.font = '12px Courier';
        this.ctx.fillText(`关卡: ${info.level}/10`, 20, y);
        this.ctx.fillText(`敌坦克: ${info.enemiesRemaining}`, 240 - 80, y);
        y += lineHeight;
        
        this.ctx.fillText(`基地: ${info.baseHealth}/${info.maxBaseHealth}`, 20, y);
        this.ctx.fillText(`已消灭: ${info.kills}`, 240 - 80, y);
        y += lineHeight;
        
        this.ctx.fillText(`得分: ${info.score}`, 20, y);
        this.ctx.fillText(`FPS: ${this.fps}`, 240 - 80, y);
        y += lineHeight;
        
        this.ctx.fillText(`活动坦克: ${this.enemyTanks.length}`, 20, y);
        this.ctx.fillText(`子弹: ${this.bullets.length}`, 240 - 80, y);
    }

    /**
     * 获取游戏信息
     * @returns {Object} 游戏信息
     */
    getGameInfo() {
        return this.gameState.getInfo();
    }

    /**
     * 获取当前状态
     * @returns {string} 游戏状态
     */
    getState() {
        return this.gameState.state;
    }
}
