// ==================== 坦克类 ====================

class Tank {
    /**
     * 创建一个坦克
     * @param {number} x - X位置
     * @param {number} y - Y位置
     * @param {string} type - 坦克类型 (player, normal, heavy, elite, boss)
     */
    constructor(x, y, type = TANK_TYPE.PLAYER) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = CONFIG.PLAYER_TANK.SIZE;
        this.angle = 0; // 坦克朝向 - 仅支持上下左右四个方向：0(上) 90(右) 180(下) 270(左)

        // 设置坦克属性
        this.setupAttributes();

        // 速度
        this.vx = 0;
        this.vy = 0;

        // 射击
        this.lastFireTime = Date.now();  // 初始化为当前时间戳
        this.isShielded = false; // 无敌护盾
        this.multiShot = false; // 多发子弹
        this.fireRateMultiplier = 1; // 射速倍数

        // AI系统（仅敌坦克）
        this.isPlayerTank = type === TANK_TYPE.PLAYER;
        this.targetX = x;
        this.targetY = y;
        this.moveTimer = 0;
        this.dodgeChance = 0;
        this.isFrozen = false; // 冰冻状态
        this.dodgeTimer = 0;

        // 状态
        this.isAlive = true;
        this.shouldFire = false;  // 敌坦克射击标志
    }

    /**
     * 设置坦克属性
     */
    setupAttributes() {
        if (this.type === TANK_TYPE.PLAYER) {
            this.health = this.maxHealth = CONFIG.PLAYER_TANK.HEALTH;
            this.speed = CONFIG.PLAYER_TANK.SPEED;
            this.fireRate = CONFIG.PLAYER_TANK.FIRE_RATE;
            this.bulletSpeed = CONFIG.PLAYER_TANK.BULLET_SPEED;
            this.color = '#00FFFF';
        } else {
            const config = CONFIG.ENEMY_TANKS[this.type];
            this.health = this.maxHealth = config.HEALTH;
            this.speed = config.SPEED;
            this.fireRate = config.FIRE_RATE;
            this.bulletSpeed = config.BULLET_SPEED;
            this.color = config.COLOR;
            this.dodgeChance = config.DODGE_CHANCE || 0;
        }
    }

    /**
     * 更新坦克
     * @param {number} deltaTime - 时间差（秒）
     * @param {Array} obstacles - 障碍物数组 [[x,y,size,type], ...]
     * @param {Tank} playerTank - 玩家坦克（用于AI）
     */
    update(deltaTime, obstacles = [], playerTank = null) {
        if (!this.isAlive) return;

        // 冰冻状态下速度降低
        const speedMultiplier = this.isFrozen ? 0.3 : 1;

        // 玩家坦克控制
        if (this.isPlayerTank) {
            // 键盘输入处理在Game类中
        } else {
            // AI敌坦克行为
            this.shouldFire = false;  // 重置射击标志
            this.updateAI(deltaTime, playerTank);
        }

        // 移动
        let newX = this.x + this.vx * deltaTime * speedMultiplier;
        let newY = this.y + this.vy * deltaTime * speedMultiplier;

        // 碰撞检测
        if (!this.checkObstacleCollision(newX, newY, obstacles)) {
            this.x = newX;
            this.y = newY;
        }

        // 边界检查
        this.x = clamp(this.x, this.size / 2, CONFIG.CANVAS_WIDTH - this.size / 2);
        this.y = clamp(this.y, this.size / 2, CONFIG.CANVAS_HEIGHT - this.size / 2);
    }

    /**
     * 更新敌坦克AI
     * @param {number} deltaTime - 时间差
     * @param {Tank} playerTank - 玩家坦克
     */
    updateAI(deltaTime, playerTank) {
        if (!playerTank) return;

        // 移动逻辑 - 每2秒改变一次目标
        this.moveTimer += deltaTime;
        if (this.moveTimer > 2) {  // deltaTime是秒，所以2秒不是2000
            this.moveTimer = 0;
            const dist = distance(this.x, this.y, playerTank.x, playerTank.y);

            if (dist > 200) {
                // 距离太远，靠近玩家
                this.targetX = playerTank.x + randomRange(-100, 100);
                this.targetY = playerTank.y + randomRange(-100, 100);
            } else {
                // 靠近了，随意移动
                this.targetX = this.x + randomRange(-150, 150);
                this.targetY = this.y + randomRange(-150, 150);
            }

            // 限制目标在地图范围内
            this.targetX = clamp(this.targetX, this.size, CONFIG.CANVAS_WIDTH - this.size);
            this.targetY = clamp(this.targetY, this.size, CONFIG.CANVAS_HEIGHT - this.size);
        }

        // 计算移动方向（只支持四向）
        const dist = distance(this.x, this.y, this.targetX, this.targetY);
        if (dist > 5) {
            const angle = getAngle(this.x, this.y, this.targetX, this.targetY);
            const angleDeg = radiansToDegrees(angle);
            
            // 将角度转换为四个方向（选择最接近的一个）
            let moveDir = 'none';
            if (angleDeg >= -45 && angleDeg < 45) {
                moveDir = 'right';  // 向右
            } else if (angleDeg >= 45 && angleDeg < 135) {
                moveDir = 'down';   // 向下
            } else if (angleDeg >= 135 || angleDeg < -135) {
                moveDir = 'left';   // 向左
            } else {
                moveDir = 'up';     // 向上
            }
            
            // 应用运动（通过 setMovement）
            const moveSpeed = this.speed * (this.isFrozen ? 0.3 : 1);
            switch (moveDir) {
                case 'up':
                    this.vx = 0;
                    this.vy = -moveSpeed;
                    break;
                case 'down':
                    this.vx = 0;
                    this.vy = moveSpeed * 0.5;
                    break;
                case 'left':
                    this.vx = -moveSpeed;
                    this.vy = 0;
                    break;
                case 'right':
                    this.vx = moveSpeed;
                    this.vy = 0;
                    break;
            }
        } else {
            this.vx = this.vy = 0;
        }

        // 根据玩家位置调整方向
        const dist2 = distance(this.x, this.y, playerTank.x, playerTank.y);
        if (dist2 < 500) {  // 视野范围
            const angle = getAngle(this.x, this.y, playerTank.x, playerTank.y);
            const angleDeg = radiansToDegrees(angle);
            
            // 转换为四向（选择最接近的方向）
            // 数学坐标系到Canvas坐标系的映射
            if (angleDeg >= -45 && angleDeg < 45) {
                this.angle = 0;  // 右（东）
            } else if (angleDeg >= 45 && angleDeg < 135) {
                this.angle = 270;  // 上（北）
            } else if (angleDeg >= 135 || angleDeg < -135) {
                this.angle = 180;  // 左（西）
            } else {
                this.angle = 90;  // 下（南）
            }

            // 标记应该射击 - 返回给Game处理
            this.shouldFire = true;
        }
    }

    /**
     * 检查与障碍物的碰撞
     * @param {number} x, y - 新位置
     * @param {Array} obstacles - 障碍物
     * @returns {boolean} 是否碰撞
     */
    checkObstacleCollision(x, y, obstacles) {
        for (const obs of obstacles) {
            // obs: [x, y, size, type]
            if (obs[3] === 'water' && this.type !== TANK_TYPE.PLAYER) {
                // 敌坦克无法通过水体
                if (checkRectCollision(x - this.size / 2, y - this.size / 2, this.size, this.size,
                    obs[0], obs[1], obs[2], obs[2])) {
                    return true;
                }
            } else if (obs[3] !== 'water' || this.type === TANK_TYPE.PLAYER) {
                // 其他障碍物或玩家通过水体（速度降低）
                if (this.type === TANK_TYPE.PLAYER && obs[3] === 'water') {
                    this.speed = CONFIG.PLAYER_TANK.SPEED * 0.7;
                } else if (checkRectCollision(x - this.size / 2, y - this.size / 2, this.size, this.size,
                    obs[0], obs[1], obs[2], obs[2])) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 设置移动方向（玩家坦克）
     * @param {string} direction - 方向 ('up', 'down', 'left', 'right', 'none')
     */
    setMovement(direction) {
        if (!this.isPlayerTank) return;

        const speed = CONFIG.PLAYER_TANK.SPEED;

        // 四向移动（方向键直接控制移动方向，身体朝向移动方向）
        switch (direction) {
            case 'up':
                this.vx = 0;
                this.vy = -speed;
                this.angle = 270;  // 身体朝向上（Canvas坐标系）
                break;
            case 'down':
                this.vx = 0;
                this.vy = speed * 0.5;  // 倒车速度较慢
                this.angle = 90;  // 身体朝向下
                break;
            case 'left':
                this.vx = -speed;
                this.vy = 0;
                this.angle = 180;  // 身体朝向左
                break;
            case 'right':
                this.vx = speed;
                this.vy = 0;
                this.angle = 0;  // 身体朝向右
                break;
            case 'none':
                this.vx = 0;
                this.vy = 0;
                break;
        }
    }

    /**
     * 旋转坦克方向（四向）
     * @param {string} direction - 方向 ('up', 'down', 'left', 'right')
     */
    rotateTank(direction) {
        switch (direction) {
            case 'up':
                this.angle = 270;
                break;
            case 'down':
                this.angle = 90;
                break;
            case 'left':
                this.angle = 180;
                break;
            case 'right':
                this.angle = 0;
                break;
        }
    }

    /**
     * 开火（受限发射）
     * @returns {Bullet|Array<Bullet>} 子弹或子弹数组
     */
    fire() {
        // 计算发射点（炮管前端）
        const rad = degreesToRadians(this.angle);
        const bulletOffset = this.size / 2 + 15;
        const fireX = this.x + Math.cos(rad) * bulletOffset;
        const fireY = this.y + Math.sin(rad) * bulletOffset;

        const bullets = [];

        if (this.multiShot) {
            // 三发子弹（角度偏差15度）
            const angles = [
                this.angle - 15,
                this.angle,
                this.angle + 15
            ];
            for (const angle of angles) {
                bullets.push(new Bullet(
                    fireX, fireY, angle,
                    this.isPlayerTank ? 'player' : 'enemy',
                    this.bulletSpeed
                ));
            }
        } else {
            // 单发子弹
            bullets.push(new Bullet(
                fireX, fireY, this.angle,
                this.isPlayerTank ? 'player' : 'enemy',
                this.bulletSpeed
            ));
        }

        return bullets;
    }

    /**
     * 受伤
     * @param {number} damage - 伤害值
     */
    takeDamage(damage) {
        if (this.isShielded) return; // 无敌护盾保护
        this.health -= damage;
        if (this.health <= 0) {
            this.isAlive = false;
            this.health = 0;
        }
    }

    /**
     * 治疗
     * @param {number} amount - 治疗量
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * 绘制坦克
     * @param {CanvasRenderingContext2D} ctx - 绘制上下文
     */
    draw(ctx) {
        if (!this.isAlive) return;

        // 绘制坦克主体和炮塔
        drawTank(ctx, this.x, this.y, this.angle, this.color, this.size);

        // 绘制无敌盾
        if (this.isShielded) {
            ctx.save();
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.7, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 绘制生命值条（仅敌方）
        if (!this.isPlayerTank) {
            const barWidth = this.size;
            const barHeight = 4;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.size / 2 - 15;

            // 背景
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // 生命值
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

            // 边框
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }

        // 冰冻效果
        if (this.isFrozen) {
            ctx.save();
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    /**
     * 获取坦克信息
     * @returns {Object} 坦克信息
     */
    getInfo() {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
            angle: this.angle,
            health: this.health,
            maxHealth: this.maxHealth,
            isAlive: this.isAlive,
            isShielded: this.isShielded,
            multiShot: this.multiShot
        };
    }
}
