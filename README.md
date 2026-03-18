# 坦克大战 (TankWar)

Tank War - 一款经典街机风格的坦克战斗游戏，玩家需要控制坦克消灭敌方部队，保护自己的基地，并在一波又一波的攻击中存活下去。具有直观的控制、炫彩画面和激动人心的多人模式，为现代玩家重新诠释了经典的坦克战斗体验。

**该工程完全由AI生成** ✨

---

## 🎮 快速开始

### 最简单的方法 - 直接打开
```bash
# 用浏览器打开本项目的 index.html 文件即可
open index.html  # macOS
# 或用Chrome/Firefox浏览器直接打开这个文件
```

### 使用本地服务器（推荐）
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# 然后在浏览器访问 http://localhost:8000
```

---

## 📋 项目结构

```
TankWar/
├── index.html                 # 游戏主页面 (HTML + CSS)
├── js/
│   ├── types.js               # 类型定义和枚举
│   ├── config.js              # 游戏配置参数 (所有数值都在这)
│   ├── utils.js               # 工具函数库
│   ├── Vector2.js             # 向量运算类
│   ├── Bullet.js              # 子弹类
│   ├── Powerup.js             # 道具系统
│   ├── Tank.js                # 坦克类 (玩家 + 敌方)
│   ├── MapGenerator.js        # 随机地图生成
│   ├── GameState.js           # 游戏状态管理
│   ├── Game.js                # 游戏引擎核心
│   └── main.js                # UI交互 + 程序入口
├── 游戏策划文档.md            # 完整的游戏设计文档
├── IMPLEMENTATION.md          # 详细的实现说明
└── README.md                  # 本文件
```

---

## 🎯 核心特性

### 游戏模式
- ✅ 单人模式 - 一个玩家对阵敌方坦克
- ✅ 双人合作 - 两个玩家共同防守基地
- ✅ 4种难度 - 简单、普通、困难、地狱

### 游戏内容
- ✅ 10个关卡，难度逐级提升
- ✅ 4种敌坦克类型（普通/重装/精锐/Boss）
- ✅ 5种强化道具（无敌盾/多发子弹/射速加快/治疗/冰冻）
- ✅ 随机地图生成（墙体/森林/水体）
- ✅ 智能敌方AI（追踪/躲避/射击）

### 游戏机制
- ✅ 子弹相互抵消系统
- ✅ 基地耐久度系统
- ✅ 分数和统计系统
- ✅ 暂停和继续功能

---

## ⌨️ 游戏操作

### 单人模式
| 操作 | 按键 |
|------|------|
| 移动 | WASD |
| 转向 | 左右方向键 |
| 射击 | 空格 |
| 暂停 | P |

### 双人模式
**玩家1：** WASD(移动) + ← → (转向) + 空格(射击)  
**玩家2：** I/K(移动) + J/L(转向) + 回车(射击)

---

## 🛠️ 维护和开发指南

### 修改游戏参数

所有游戏数值都集中在 **`js/config.js`** 文件中，修改参数无需修改其他文件。

#### 例1：增加敌坦克难度

```javascript
// 在 js/config.js 中找到 CONFIG.ENEMY_TANKS
CONFIG.ENEMY_TANKS: {
    normal: {
        HEALTH: 25,      // 修改这里：改为30可增加难度
        SPEED: 120,      // 修改这里：改为150可加快速度
        FIRE_RATE: 0.8,  // 修改这里：改为1.2可提升射速
        // ...
    }
}
```

#### 例2：修改道具参数

```javascript
// 在 js/config.js 中找到 CONFIG.POWERUPS
CONFIG.POWERUPS: {
    shield: {
        DURATION: 8000,  // 修改这里：改为12000可延长无敌时间
        // ...
    }
}
```

#### 例3：修改玩家坦克属性

```javascript
// 在 js/config.js 中修改
CONFIG.PLAYER_TANK: {
    SPEED: 150,          // 修改移动速度
    FIRE_RATE: 1,        // 修改射击频率
    HEALTH: 100,         // 修改基地HP
    // ...
}
```

### 添加新关卡

在 `js/config.js` 中的 `CONFIG.LEVELS` 数组后面添加新关卡：

```javascript
{
    level: 11,           // 新关卡号
    name: '新关卡名称',
    totalEnemies: 15,    // 敌坦克总数
    waves: [
        { types: ['normal', 'normal'], delay: 0 },     // 第一波
        { types: ['heavy', 'heavy'], delay: 8000 },    // 第二波（延迟8秒）
        { types: ['elite', 'elite'], delay: 8000 }     // 第三波
    ],
    obstaclesDensity: 0.5  // 地图障碍物密度 0-1
}
```

### 修改难度系统

编辑 `CONFIG.DIFFICULTY_MULTIPLIERS` 来调整各难度的倍数：

```javascript
CONFIG.DIFFICULTY_MULTIPLIERS: {
    easy: {
        enemySpeed: 0.8,  // 敌坦克速度倍数
        enemyFireRate: 0.7,
        baseHealth: 120,  // 基地最大HP
        powerupSpawnChance: 1.2  // 道具生成率
    },
    // ... 其他难度
}
```

### 常见修改场景

| 场景 | 修改位置 | 说明 |
|------|---------|------|
| 关卡太难 | `DIFFICULTY_MULTIPLIERS.hard.baseHealth` | 增加基地HP |
| 道具稀少 | `POWERUPS.*.SPAWN_CHANCE` 或各类 `spawnChance` | 提高道具生成率 |
| 敌坦克太强 | `ENEMY_TANKS.*.HEALTH/FIRE_RATE` | 降低生命值或射速 |
| 玩家移动太慢 | `PLAYER_TANK.SPEED` | 增加速度值 |
| 基地太脆弱 | `CONFIG.BASE.HEALTH` 或 `maxBaseHealth` | 增加初始HP |

---

## 🚀 代码扩展指南

### 添加新道具类型

**步骤1：** 在 `js/types.js` 中定义新道具类型
```javascript
const POWERUP_TYPE = {
    // ... 现有道具
    LASER: 'laser'  // 新道具
};
```

**步骤2：** 在 `js/config.js` 中添加配置
```javascript
CONFIG.POWERUPS: {
    // ... 现有道具配置
    laser: {
        DURATION: 5000,
        COLOR: '#FF00FF',
        SPAWN_CHANCE: 0.1
    }
}
```

**步骤3：** 在 `js/Powerup.js` 的 `getEffectInfo()` 中添加描述
```javascript
laser: {
    name: '激光枪',
    duration: CONFIG.POWERUPS.laser.DURATION,
    description: '发射强力激光'
}
```

**步骤4：** 在 `js/Game.js` 的 `onEnemyTankDefeated()` 中添加生成几率
```javascript
const randomType = powerupTypes[...];  // 在数组中加入新类型
```

### 添加新敌坦克类型

**步骤1：** 在 `js/Tank.js` 中扩展坦克类
```javascript
// 在 setupAttributes() 中添加
} else if (this.type === TANK_TYPE.NEW_TYPE) {
    this.health = 35;
    this.speed = 130;
    // ... 其他属性
}
```

**步骤2：** 在关卡中使用
```javascript
// 在 CONFIG.LEVELS 中
waves: [
    { types: ['new_type'], delay: 5000 }
]
```

### 修改游戏地图大小

```javascript
// js/config.js
CONFIG.CANVAS_WIDTH: 1200,   // 改为宽度
CONFIG.CANVAS_HEIGHT: 900,   // 改为高度

// js/MapGenerator.js
this.gridSize = 60;  // 调整网格大小（影响地图精细度）
```

### 添加自定义AI行为

在 `js/Tank.js` 的 `updateAI()` 方法中修改敌坦克行为：

```javascript
if (this.type === TANK_TYPE.ELITE) {
    // 精锐坦克的AI
    // ... 现有逻辑 ...
    
    // 添加新行为：例如随机闪避
    if (Math.random() < 0.3) {
        this.targetX += randomRange(-200, 200);
    }
}
```

---

## 🔍 调试和测试

### 启用调试信息

游戏中已内置FPS和对象计数显示（左上角）：
- **FPS** - 帧率
- **敌坦克数** - 当前敌坦克数量
- **子弹数** - 当前子弹数量

### 浏览器控制台查看日志

打开 Chrome DevTools (F12) 的 Console 标签，可以看到关键事件的日志：
```
加载关卡 1: 训练营
关卡 1 完成！基地HP: 85/100
```

### 性能监控

在浏览器 DevTools 的 Performance 标签中可以监控：
- 帧率 (FPS)
- 内存占用
- CPU使用率

---

## 🎨 UI和视觉调整

### 修改颜色方案

所有颜色值采用十六进制，在各文件中修改：

```javascript
// js/Tank.js - 修改玩家坦克颜色
this.color = '#00FFFF';  // 青色

// js/config.js - 修改敌坦克颜色
normal: { COLOR: '#00FF00' }  // 绿色

// index.html - 修改页面背景
background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
```

### 修改游戏画布显示

```javascript
// index.html 中修改
width="1000" height="800"  // 改为其他分辨率
```

---

## 📊 性能优化提示

| 问题 | 解决方案 |
|------|---------|
| 游戏卡顿 | 1) 降低难度 2) 减少关卡敌坦克数 3) 关闭其他浏览器标签 |
| 内存占用高 | 减少同时出现的子弹和道具数量 |
| CPU占用高 | 关卡敌坦克数减少，或缩小地图 |
| 鼠标延迟 | 可能是浏览器问题，尝试换浏览器 |

---

## 🔄 版本更新流程

当修改配置后，测试步骤建议：

1. **单个参数测试** - 只改一个值，验证效果
2. **完整游戏测试** - 从第1关玩到第10关
3. **难度测试** - 测试所有4个难度
4. **合作模式测试** - 确保双人模式正常
5. **性能测试** - 检查FPS是否稳定60

---

## 🚧 后续开发建议

### 短期（容易实现）
- [ ] 添加游戏背景音乐（Web Audio API）
- [ ] 添加音效（射击、爆炸、死亡）
- [ ] 存储最高分到localStorage
- [ ] 添加键盘配置界面
- [ ] 添加暂停菜单（继续/重新开始/退出）

### 中期（中等难度）
- [ ] 游戏存档系统（保存进度）
- [ ] 成就系统（解锁特殊成就）
- [ ] 排行榜（本地前10名）
- [ ] 坦克皮肤系统（解锁不同外观）
- [ ] 关卡编辑器（让玩家创建自定义关卡）

### 长期（复杂功能）
- [ ] 网络对战（使用WebSocket）
- [ ] 在线排行榜（连接后端服务器）
- [ ] 故事模式（添加剧情和对话）
- [ ] 更多游戏模式（生存模式、时间竞速等）
- [ ] 手机版本（适配触摸屏）

### 扩展功能具体实现路径

#### 添加游戏背景音乐
```javascript
// 在 js/main.js 中添加
const bgm = new Audio('assets/bgm.mp3');
bgm.loop = true;
bgm.play();
```

#### 本地排行榜
```javascript
// 在 GameState.js 中添加
saveHighScore(score) {
    const scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push(score);
    scores.sort((a, b) => b - a);
    localStorage.setItem('scores', JSON.stringify(scores.slice(0, 10)));
}
```

#### 关卡编辑器基础
```javascript
// 新建文件 js/LevelEditor.js
class LevelEditor {
    constructor(canvas) {
        // 编辑器实现
    }
    exportLevel() {
        // 导出为JSON格式
    }
}
```

---

## 📱 移动设备适配

当前版本主要优化了桌面版本。如需手机适配：

1. 在 `index.html` 的 head 中已有 viewport meta 标签
2. 需要继续修改：
   - 键盘操作改为虚拟按钮或陀螺仪
   - CSS媒体查询适配小屏幕
   - Touch事件替代Mouse事件

---

## ❓ 常见问题解答

**Q: 如何修改关卡数量？**  
A: 编辑 `CONFIG.LEVELS` 数组的长度即可。修改后记得更新UI文案中的"10关"。

**Q: 敌坦克AI太智能？**  
A: 在 `js/Tank.js` 的 `updateAI()` 方法中降低 `dodgeChance` 值。

**Q: 想要无限关卡？**  
A: 在 `Game.js` 的 `nextLevel()` 中，不检查最大关卡数，而是动态生成关卡。

**Q: 游戏可以保存进度吗？**  
A: 目前不支持，可以使用 localStorage (浏览器本地存储) 实现。

**Q: 如何改变游戏速度？**  
A: 修改 `Game.js` 中的时间差（deltaTime）或各个对象的 SPEED 参数。

---

## 📞 技术支持

如在维护过程中遇到问题：

1. **检查浏览器控制台** - 查看是否有 JavaScript 错误
2. **查看注释** - 每个文件都有详细注释
3. **参考配置文档** - `js/config.js` 有所有配置说明
4. **查看实现文档** - `IMPLEMENTATION.md` 有详细的架构说明

---

## 📜 许可证

MIT License - 可自由使用和修改

---

**祝您开发愉快！** 🎮⚔️