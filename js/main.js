// ==================== 主程序入口 ====================

let game = null;

/**
 * 初始化游戏
 */
function initializeGame() {
    const canvas = document.getElementById('gameCanvas');
    game = new Game(canvas);

    // 调整Canvas大小
    canvas.width = CONFIG.CANVAS_WIDTH;
    canvas.height = CONFIG.CANVAS_HEIGHT;

    // 设置事件监听
    setupUIEventListeners();
}

/**
 * 设置UI事件监听
 */
function setupUIEventListeners() {
    // 主菜单按钮
    document.getElementById('singlePlayerBtn').addEventListener('click', () => {
        showDifficultyMenu();
        currentGameMode = GAME_MODE.SINGLE;
    });

    document.getElementById('coopBtn').addEventListener('click', () => {
        showDifficultyMenu();
        currentGameMode = GAME_MODE.COOP;
    });

    // 难度选择按钮
    document.getElementById('easyBtn').addEventListener('click', () => {
        startGame(currentGameMode, DIFFICULTY.EASY);
    });

    document.getElementById('normalBtn').addEventListener('click', () => {
        startGame(currentGameMode, DIFFICULTY.NORMAL);
    });

    document.getElementById('hardBtn').addEventListener('click', () => {
        startGame(currentGameMode, DIFFICULTY.HARD);
    });

    document.getElementById('hellBtn').addEventListener('click', () => {
        startGame(currentGameMode, DIFFICULTY.HELL);
    });

    // 游戏中按钮
    document.getElementById('startBtn').addEventListener('click', () => {
        if (game && !game.running) {
            if (game.gameState.state === GAME_STATE.MENU) {
                showMainMenu();
            } else {
                game.gameState.setState(GAME_STATE.PLAYING);
                game.startGameLoop();
            }
        }
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        if (game) {
            game.togglePause();
            updatePauseButtonText();
        }
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        if (game) {
            game.stopGameLoop();
            game.gameState.restart();
            game.setupLevel();
            game.startGameLoop();
        }
    });

    // 结束菜单按钮
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (game && game.gameState.currentLevel < 10) {
            game.gameState.nextLevel();
            game.setupLevel();
            game.startGameLoop();
            hideEndMenu();
        } else {
            showMainMenu();
            hideEndMenu();
        }
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
        if (game) {
            game.stopGameLoop();
        }
        showMainMenu();
        hideEndMenu();
    });
}

// 游戏模式存储
let currentGameMode = GAME_MODE.SINGLE;

/**
 * 显示主菜单
 */
function showMainMenu() {
    const mainMenu = document.getElementById('mainMenu');
    mainMenu.classList.remove('hidden');
}

/**
 * 隐藏主菜单
 */
function hideMainMenu() {
    const mainMenu = document.getElementById('mainMenu');
    mainMenu.classList.add('hidden');
}

/**
 * 显示难度菜单
 */
function showDifficultyMenu() {
    hideMainMenu();
    const difficultyMenu = document.getElementById('difficultyMenu');
    difficultyMenu.classList.remove('hidden');
}

/**
 * 隐藏难度菜单
 */
function hideDifficultyMenu() {
    const difficultyMenu = document.getElementById('difficultyMenu');
    difficultyMenu.classList.add('hidden');
}

/**
 * 显示结束菜单
 */
function showEndMenu(isVictory) {
    const endMenu = document.getElementById('endMenu');
    const endTitle = document.getElementById('endTitle');
    const endMessage = document.getElementById('endMessage');
    const nextBtn = document.getElementById('nextBtn');
    const finalKillCount = document.getElementById('finalKillCount');
    const finalScoreValue = document.getElementById('finalScoreValue');

    const info = game.gameState.getInfo();

    if (game.gameState.currentLevel === 10 && isVictory) {
        endTitle.textContent = '游戏通关！';
        endMessage.innerHTML = `恭喜！您已完成全部 10 个关卡<br>最终得分: <span id="finalScore">${info.score}</span>`;
        nextBtn.style.display = 'none';
    } else if (isVictory) {
        endTitle.textContent = '关卡胜利！';
        endMessage.innerHTML = `关卡 ${info.level} 完成！<br>消灭敌坦克: ${info.kills}`;
        nextBtn.style.display = 'block';
        nextBtn.textContent = game.gameState.currentLevel < 10 ? '下一关' : '返回菜单';
    } else {
        endTitle.textContent = '游戏失败';
        endMessage.innerHTML = `基地已沦陷！<br>消灭敌坦克: ${info.kills}`;
        nextBtn.style.display = 'none';
    }

    finalKillCount.textContent = info.kills;
    finalScoreValue.textContent = info.score;

    endMenu.classList.remove('hidden');
}

/**
 * 隐藏结束菜单
 */
function hideEndMenu() {
    const endMenu = document.getElementById('endMenu');
    endMenu.classList.add('hidden');
}

/**
 * 开始游戏
 * @param {string} mode - 游戏模式
 * @param {string} difficulty - 难度
 */
function startGame(mode, difficulty) {
    hideDifficultyMenu();
    if (game) {
        game.initGame(mode, difficulty);
        updateUIFromGame();
    }
}

/**
 * 更新暂停按钮文本
 */
function updatePauseButtonText() {
    const pauseBtn = document.getElementById('pauseBtn');
    if (game.gameState.state === GAME_STATE.PAUSED) {
        pauseBtn.textContent = '继续';
    } else {
        pauseBtn.textContent = '暂停';
    }
}

/**
 * 游戏主循环 - 更新UI
 */
function gameUIUpdateLoop() {
    if (!game || game.gameState.state === GAME_STATE.MENU) {
        requestAnimationFrame(gameUIUpdateLoop);
        return;
    }

    updateUIFromGame();

    // 检查游戏状态变化
    if (game.gameState.state === GAME_STATE.LEVEL_COMPLETE) {
        game.stopGameLoop();
        showEndMenu(true);
    } else if (game.gameState.state === GAME_STATE.GAME_OVER) {
        if (game.gameState.currentLevel === 10) {
            game.stopGameLoop();
            showEndMenu(true);
        } else if (game.gameState.baseHealth <= 0) {
            game.stopGameLoop();
            showEndMenu(false);
        }
    }

    requestAnimationFrame(gameUIUpdateLoop);
}

/**
 * 从游戏中更新UI
 */
function updateUIFromGame() {
    if (!game) return;

    const info = game.gameState.getInfo();

    // 更新关卡信息
    document.getElementById('levelInfo').textContent = `${info.level}/10`;

    // 更新敌坦克数
    document.getElementById('enemyCount').textContent = `${info.totalEnemies - info.enemiesRemaining}/${info.totalEnemies}`;

    // 更新击杀数
    document.getElementById('killCount').textContent = info.kills;

    // 更新分数
    document.getElementById('scoreInfo').textContent = info.score;

    // 更新激活道具
    updatePowerupDisplay(info.powerups);

    // 更新游戏状态文本
    const statusDiv = document.getElementById('gameStatus');
    let statusText = '';
    let statusClass = 'status playing';

    switch (game.gameState.state) {
        case GAME_STATE.PLAYING:
            statusText = '游戏进行中...';
            statusClass = 'status playing';
            break;
        case GAME_STATE.PAUSED:
            statusText = '已暂停';
            statusClass = 'status gameover';
            break;
        case GAME_STATE.GAME_OVER:
            statusText = '游戏失败';
            statusClass = 'status gameover';
            break;
        case GAME_STATE.LEVEL_COMPLETE:
            statusText = '关卡完成！';
            statusClass = 'status victory';
            break;
    }

    statusDiv.textContent = statusText;
    statusDiv.className = statusClass;

    // 更新暂停按钮
    if (game.gameState.state === GAME_STATE.PAUSED) {
        document.getElementById('pauseBtn').textContent = '继续';
    } else if (game.gameState.state === GAME_STATE.PLAYING) {
        document.getElementById('pauseBtn').textContent = '暂停';
    }
}

/**
 * 更新激活道具显示
 * @param {Array} powerups - 激活道具数组
 */
function updatePowerupDisplay(powerups) {
    const powerupInfo = document.getElementById('powerupInfo');

    if (powerups.length === 0) {
        powerupInfo.innerHTML = '<p style="color: #999;">无激活道具</p>';
        return;
    }

    let html = '';
    for (const powerup of powerups) {
        const remaining = (powerup.getRemainingTime() / 1000).toFixed(1);
        const progress = powerup.getProgress();
        const typeNames = {
            shield: '无敌护盾',
            multi: '多发子弹',
            speed: '射速加快',
            freeze: '冰冻'
        };

        const typeName = typeNames[powerup.type] || powerup.type;

        html += `
            <div style="margin-bottom: 10px;">
                <div style="font-weight: bold; color: #1e3c72;">${typeName}</div>
                <div style="background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; background: linear-gradient(90deg, #FFD700, #FFA500); width: ${progress}%;"></div>
                </div>
                <div style="font-size: 0.8em; color: #666; margin-top: 2px;">${remaining}秒</div>
            </div>
        `;
    }

    powerupInfo.innerHTML = html;
}

/**
 * 页面加载完成后的初始化
 */
window.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    showMainMenu();
    gameUIUpdateLoop();

    // 防止右键菜单
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // 防止浏览器缩放
    document.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
        }
    });
});

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
    if (game && game.running) {
        game.stopGameLoop();
    }
});
