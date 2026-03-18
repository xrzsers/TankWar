// ==================== 地图生成器 ====================

class MapGenerator {
    /**
     * 创建地图生成器
     * @param {number} width - 地图宽度
     * @param {number} height - 地图高度
     */
    constructor(width = CONFIG.CANVAS_WIDTH, height = CONFIG.CANVAS_HEIGHT) {
        this.width = width;
        this.height = height;
        this.gridSize = 50; // 网格大小
        this.obstacles = [];
    }

    /**
     * 生成地图
     * @param {number} density - 障碍物密度 (0-1)
     * @returns {Array} 障碍物数组 [[x, y, size, type], ...]
     */
    generate(density = 0.70) {
        this.obstacles = [];

        // 计算网格数
        const cols = Math.ceil(this.width / this.gridSize);
        const rows = Math.ceil(this.height / this.gridSize);

        // 基地保护区域（下方中央）
        const baseProtectionZone = {
            x: Math.floor(this.width / 2 / this.gridSize) - 3,
            y: Math.floor((this.height - 250) / this.gridSize),
            w: 6,
            h: 5
        };

        // 生成网格障碍物
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // 跳过基地保护区
                if (this.isInProtectionZone(col, row, baseProtectionZone)) {
                    continue;
                }

                // 根据密度决定是否放置障碍物
                if (Math.random() < density) {
                    const x = col * this.gridSize;
                    const y = row * this.gridSize;
                    const type = this.randomObstacleType();
                    this.obstacles.push([x, y, this.gridSize, type]);
                }
            }
        }

        // 添加边界障碍物
        this.addBoundaryObstacles();

        return this.obstacles;
    }

    /**
     * 检查是否在保护区域
     * @param {number} col, row - 网格坐标
     * @param {Object} zone - 保护区域
     * @returns {boolean}
     */
    isInProtectionZone(col, row, zone) {
        return col >= zone.x && col < zone.x + zone.w &&
               row >= zone.y && row < zone.y + zone.h;
    }

    /**
     * 随机障碍物类型
     * @returns {string} 类型
     */
    randomObstacleType() {
        const rand = Math.random();
        if (rand < 0.85) {
            return 'wall';    // 85%可破坏的墙体
        } else if (rand < 0.92) {
            return 'forest';  // 7%森林（无法破坏）
        } else {
            return 'water';   // 8%水体（无法破坏）
        }
    }

    /**
     * 添加边界障碍物
     */
    addBoundaryObstacles() {
        const borderSize = 20;
        const spacing = 60;

        // 上边界
        for (let x = 0; x < this.width; x += spacing) {
            this.obstacles.push([x, -borderSize, spacing, 'wall']);
        }

        // 下边界
        for (let x = 0; x < this.width; x += spacing) {
            this.obstacles.push([x, this.height, spacing, 'wall']);
        }

        // 左边界
        for (let y = 0; y < this.height; y += spacing) {
            this.obstacles.push([-borderSize, y, spacing, 'wall']);
        }

        // 右边界
        for (let y = 0; y < this.height; y += spacing) {
            this.obstacles.push([this.width, y, spacing, 'wall']);
        }
    }

    /**
     * 获取敌坦克生成点
     * @returns {Object} {x, y}
     */
    getEnemySpawnPoint() {
        // 在地图上方随机生成
        return {
            x: randomInt(50, this.width - 50),
            y: randomInt(50, 150)
        };
    }

    /**
     * 检查位置是否被障碍物阻挡
     * @param {number} x, y, size - 检查的矩形
     * @returns {boolean} 是否被阻挡
     */
    isBlocked(x, y, size) {
        for (const obs of this.obstacles) {
            if (checkRectCollision(x - size / 2, y - size / 2, size, size,
                obs[0], obs[1], obs[2], obs[2])) {
                return true;
            }
        }
        return false;
    }

    /**
     * 绘制地图
     * @param {CanvasRenderingContext2D} ctx - 绘制上下文
     */
    draw(ctx) {
        // 背景
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // 网格背景（可选）
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // 绘制障碍物
        for (const obs of this.obstacles) {
            drawObstacle(ctx, obs[0], obs[1], obs[2], obs[3]);
        }
    }

    /**
     * 清空地图
     */
    clear() {
        this.obstacles = [];
    }

    /**
     * 获取障碍物列表
     * @returns {Array} 障碍物数组
     */
    getObstacles() {
        return this.obstacles;
    }

    /**
     * 移除指定位置的障碍物
     * @param {number} x - 障碍物x坐标
     * @param {number} y - 障碍物y坐标
     * @returns {boolean} 是否移除成功
     */
    removeObstacle(x, y) {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            // 只能移除可破坏的墙体，不能移除森林和水体
            if (obs[3] === 'wall' && obs[0] === x && obs[1] === y) {
                this.obstacles.splice(i, 1);
                return true;
            }
        }
        return false;
    }
}
