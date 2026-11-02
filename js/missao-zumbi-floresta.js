
import * as THREE from 'https://unpkg.com/three@0.154.0/build/three.module.js';

/* ==========================================================================
   MISSÃO ZUMBI — motor do jogo
   ========================================================================== */

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x102116, 0.0088);

const loader = new THREE.TextureLoader();

/* ---------- Texturas ---------- */
let treeTexture = null;
const forestVariationTextures = [];
const forestVariationUrls = [
  'https://static.vecteezy.com/system/resources/thumbnails/047/493/666/small/fresh-green-tree-png.png',
  'https://static.vecteezy.com/system/resources/thumbnails/023/570/042/small/green-tree-isolated-illustration-ai-generative-free-png.png'
];
let rockTexture = null;
let bushTexture = null;
let fireTexture = null;
const pickupTextures = { pistol: null, shotgun: null, shotgun12: null, rifle: null, smg: null, grenadeLauncher: null, medkit: null, scrap: null, greatsword: null };
const enemyTextures = { walker: null, rusher: null, dodger: null, tank: null, bloater: null, jumper: null, mimic: null, boss: null, entity: null, parasiteBoss: null, parasite: null, infectedParasite: null, necromancer: null, necromancerBoss: null, skeleton: null, wolf: null, werewolf: null, wolf_minion: null, shooter: null, npc: null };
let necromancerProjectileTexture = null;
const localForestTextures = {
  walker: 'fotos/zumbis/zumbi-normal.png',
  rusher: 'fotos/zumbis/inimigo-corredor.webp',
  dodger: 'fotos/zumbis/zumbi-esperto.png',
  tank: 'fotos/zumbis/zumbi-tank.png',
  bloater: 'fotos/zumbis/zumbi-explode.png',
  jumper: 'fotos/zumbis/zumbi que pula.png',
  mimic: 'fotos/chefes/mini chefe Mimic.webp',
  shooter: 'fotos/zumbis/zumbi-acido_atirador.png',
  boss: 'fotos/chefes/chefe-textura.png',
  entity: 'fotos/chefes/Demônio de Fumaça Carmesim.png',
  parasiteBoss: 'fotos/chefes/boss parasita.png',
  electrician: 'fotos/chefes/boss eletrico.png',
  parasite: 'fotos/zumbis/parasita andaando.png',
  infectedParasite: 'fotos/zumbis/parasita em zumbi, qualquer um.png',
  wolf: 'fotos/chefes/chefe-lobo_infernal.png',
  necromancerBoss: 'fotos/chefes/chefe-necromante.png',
  skeleton: 'fotos/zumbis/zumbi-esqueleo.png',
  wolf_minion: 'fotos/zumbis/lobo-zumbi.png',
};
const chestTextures = { closed: null, open: null };
const chests = [];
const chestSmokeEffects = [];
let mimicGreatswordDropped = false;
Object.entries(localForestTextures).forEach(([type, path]) => {
  loader.load(path, (texture) => {
    texture.premultiplyAlpha = false;
    enemyTextures[type] = texture;
  }, undefined, () => {});
});
for (const [key, path] of Object.entries({
  closed: 'fotos/itens/baus/bau-fechado.png',
  open: 'fotos/itens/baus/bau-aberto.png',
})) {
  loader.load(path, (texture) => {
    texture.premultiplyAlpha = false;
    chestTextures[key] = texture;
    chests.forEach((chest) => {
      chest.sprite.material.map = chest.opened ? chestTextures.open : chestTextures.closed;
      chest.sprite.material.needsUpdate = true;
    });
  }, undefined, (error) => console.error(`Falha ao carregar o sprite do baú (${path}).`, error));
}
for (const [key, path] of Object.entries({
  scrap: 'fotos/itens/recursos/sucata.png',
  greatsword: 'fotos/armas/Moonlight-greatsword.png',
})) {
  loader.load(path, (texture) => {
    texture.premultiplyAlpha = false;
    texture.encoding = THREE.sRGBEncoding;
    pickupTextures[key] = texture;
    pickups.filter((pickup) => pickup.userData.kind === key).forEach((pickup) => {
      pickup.material.map = texture;
      pickup.material.needsUpdate = true;
    });
  }, undefined, (error) => console.error(`Falha ao carregar o sprite da recompensa (${path}).`, error));
}
loader.load('fotos/municao/projetil-do-necromante.png', (texture) => {
  texture.premultiplyAlpha = false;
  necromancerProjectileTexture = texture;
}, undefined, () => {});

// Variações novas de árvores verdes. Se algum servidor bloquear a textura,
// a floresta mantém automaticamente as árvores antigas.
for (const url of forestVariationUrls) {
  const variationLoader = new THREE.TextureLoader();
  variationLoader.setCrossOrigin('anonymous');
  variationLoader.load(url, (texture) => {
    texture.premultiplyAlpha = false;
    forestVariationTextures.push(texture);
    rebuildForest();
// Segunda muralha visual bem distante. Ela fica fora da área jogável e serve apenas para fechar o horizonte.
const horizonForestGroup = new THREE.Group();
scene.add(horizonForestGroup);
function buildHorizonTrees() {
  const available = [treeTexture, ...forestVariationTextures].filter(Boolean);
  for (let i = 0; i < 150; i++) {
    const side = i % 4;
    const along = -190 + Math.random() * 380;
    const depth = 178 + Math.random() * 38;
    let x = 0, z = 0;
    if (side === 0) { x = along; z = -depth; }
    if (side === 1) { x = along; z = depth; }
    if (side === 2) { x = -depth; z = along; }
    if (side === 3) { x = depth; z = along; }
    const texture = available.length ? available[Math.floor(Math.random() * available.length)] : null;
    const tree = texture ? createSpriteTree(texture) : createFallbackTree();
    tree.position.set(x, tree.position.y - 1.5, z);
    tree.scale.multiplyScalar(0.85 + Math.random() * 0.55);
    tree.rotation.y = Math.random() * Math.PI * 2;
    horizonForestGroup.add(tree);
  }
}
buildHorizonTrees();

  }, undefined, () => {});
}

loader.load('fotos/municao/projetil-do-necromante.png', (t) => { necromancerProjectileTexture = t; });
const weaponTextures = { pistol: null, knife: null, shotgun: null, shotgun12: null, smg: null, rifle: null, doomSword: null, greatsword: null, grenadeLauncher: null };
let doomguyTexture = null;
let soldierTexture = null;
let frogTexture = null;
let playerGun = null;
let weaponRecoil = 0;
let weaponAnimationTime = 0;
const localWeaponTextures = {
  pistol: 'fotos/armas/pistola.gif',
  knife: 'fotos/armas/bastao-faca.png',
  shotgun: 'fotos/armas/magnum.webp',
  shotgun12: 'fotos/armas/shotgun.webp',
  smg: 'fotos/armas/submetralhadora.gif',
  rifle: 'fotos/armas/rifle.gif',
  doomSword: 'fotos/armas/spada-doom.webp',
  greatsword: 'fotos/armas/Moonlight-greatsword.png',
  grenadeLauncher: 'fotos/armas/lançagranadas.gif',
};
Object.entries(localWeaponTextures).forEach(([weaponId, path]) => {
  loader.load(path, (texture) => {
    texture.premultiplyAlpha = false;
    texture.encoding = THREE.sRGBEncoding;
    if (weaponId === 'grenadeLauncher') {
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.repeat.set(0.35, 0.415);
      texture.offset.set(0.325, 0);
    }
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    weaponTextures[weaponId] = texture;
    if (playerGun && camera && currentWeaponId === weaponId) {
      camera.remove(playerGun);
      playerGun = createWeaponMesh(weaponId);
      camera.add(playerGun);
    }
  }, undefined, (error) => console.error(`Falha ao carregar a textura da arma "${weaponId}" (${path}).`, error));
loader.load('fotos/personagens/doomguy-steregg.webp', (texture) => { texture.premultiplyAlpha = false; doomguyTexture = texture; if (doomguyNpc?.children[0]?.material) { doomguyNpc.children[0].material.map = texture; doomguyNpc.children[0].material.needsUpdate = true; } });
loader.load('fotos/personagens/npc-soldado.png', (texture) => { texture.premultiplyAlpha = false; soldierTexture = texture; if (scientistNpc?.children[0]?.material) { scientistNpc.children[0].material.map = texture; scientistNpc.children[0].material.needsUpdate = true; } });
loader.load('fotos/personagens/sapo-secreto.png', (texture) => { texture.premultiplyAlpha = false; texture.encoding = THREE.sRGBEncoding; frogTexture = texture; if (secretFrog?.children[0]?.material) { secretFrog.children[0].material.map = texture; secretFrog.children[0].material.needsUpdate = true; } }, undefined, (error) => console.error('Falha ao carregar a textura do sapo (fotos/personagens/sapo-secreto.png).', error));
});

loader.load('fotos/zumbis/zumbi-normal.png', (t) => { enemyTextures.walker = t; });
loader.load('fotos/zumbis/inimigo-corredor.webp', (t) => { enemyTextures.rusher = t; });
loader.load('fotos/zumbis/inimigo-esquivo.webp', (t) => { enemyTextures.dodger = t; });
loader.load('fotos/zumbis/inimigo-tanque.webp', (t) => { enemyTextures.tank = t; });
loader.load('fotos/chefes/necromante-textura.webp', (t) => { enemyTextures.necromancer = t; });
loader.load('fotos/chefes/chefe-lobo_infernal.png', (t) => { enemyTextures.wolf = t; });
loader.load('fotos/chefes/boss Lobisomem.png', (t) => {
  enemyTextures.werewolf = t;
  for (const enemy of enemies) {
    const data = enemy.userData;
    if (data.type === 'wolf' && data.wolfTransformed && data.sprite) {
      data.sprite.material.map = t;
      data.sprite.material.needsUpdate = true;
    }
  }
}, undefined, (error) => console.error('Falha ao carregar a textura do lobisomem.', error));
loader.load('fotos/chefes/chefe-textura.png', (t) => { enemyTextures.boss = t; });
loader.load('fotos/zumbis/zumbi-acido_atirador.png', (t) => { enemyTextures.shooter = t; });

loader.load('fotos/armas/pistola.gif', (t) => {
  if (!weaponTextures.pistol) weaponTextures.pistol = t;
  if (playerGun && camera && currentWeaponId === 'pistol') {
    camera.remove(playerGun);
    playerGun = createWeaponMesh('pistol');
    camera.add(playerGun);
  }
});
loader.load('fotos/armas/bastao-faca.png', (t) => {
  if (!weaponTextures.knife) weaponTextures.knife = t;
  if (playerGun && camera && currentWeaponId === 'knife') {
    camera.remove(playerGun);
    playerGun = createWeaponMesh('knife');
    camera.add(playerGun);
  }
});
loader.load('fotos/armas/magnum.webp', (t) => {
  if (!weaponTextures.shotgun) weaponTextures.shotgun = t;
  if (playerGun && camera && currentWeaponId === 'shotgun') {
    camera.remove(playerGun);
    playerGun = createWeaponMesh('shotgun');
    camera.add(playerGun);
  }
});
loader.load('fotos/armas/shotgun.webp', (t) => {
  if (!weaponTextures.shotgun12) weaponTextures.shotgun12 = t;
  if (playerGun && camera && currentWeaponId === 'shotgun12') {
    camera.remove(playerGun);
    playerGun = createWeaponMesh('shotgun12');
    camera.add(playerGun);
  }
});

loader.load('fotos/armas/submetralhadora.gif', (t) => {
  if (!weaponTextures.smg) weaponTextures.smg = t;
  if (playerGun && camera && currentWeaponId === 'smg') {
    camera.remove(playerGun);
    playerGun = createWeaponMesh('smg');
    camera.add(playerGun);
  }
});
loader.load('fotos/armas/fuzil.png', (t) => {
  if (!weaponTextures.rifle) weaponTextures.rifle = t;
  if (playerGun && camera && currentWeaponId === 'rifle') {
    camera.remove(playerGun);
    playerGun = createWeaponMesh('rifle');
    camera.add(playerGun);
  }
});
loader.load('fotos/cenario/arvore-textura.webp', (t) => {
  treeTexture = t;
  treeTexture.premultiplyAlpha = false;
  rebuildForest();
});
loader.load('fotos/cenario/pedra-textura.webp', (t) => { rockTexture = t; rebuildRocks(); });
loader.load('fotos/cenario/arbusto-textura.png', (t) => { bushTexture = t; rebuildBushes(); });
loader.load('fotos/cenario/fogueira-textura.webp', (t) => { fireTexture = t; rebuildCampfireFlame(); });
loader.load('fotos/municao/municao-pistola.webp', (t) => { pickupTextures.pistol = t; });
loader.load('fotos/municao/municao-shotgun.webp', (t) => { pickupTextures.shotgun = t; });
loader.load('fotos/municao/municao-rifle.webp', (t) => { pickupTextures.rifle = t; });
loader.load('fotos/municao/municao-submetralhadora.webp', (t) => { pickupTextures.smg = t; });
loader.load('fotos/itens/kit-medico.webp', (t) => { pickupTextures.medkit = t; });
loader.load('fotos/personagens/npc-soldado.png', (t) => { enemyTextures.npc = t; });
  loader.load('fotos/municao/municao-shotgun-12.webp', (t) => { pickupTextures.shotgun12 = t; });


loader.load('fotos/municao/lanca-granadas.png', (texture) => {
  texture.premultiplyAlpha = false;
  pickupTextures.grenadeLauncher = texture;
}, undefined, (error) => console.error('Falha ao carregar o sprite da munição do lança-granadas.', error));

/* ---------- Áudio ---------- */
const menuMusic = new Audio('som/musicas/musica menu.mp3');
menuMusic.loop = true;
const matchMusic = new Audio('som/musicas/musica 1.mp3');
const matchMusicTracks = ['som/musicas/musica 1.mp3', 'som/musicas/musica 2.mp3'];
let matchMusicTrackIndex = 0;
matchMusic.addEventListener('ended', () => {
  matchMusicTrackIndex = (matchMusicTrackIndex + 1) % matchMusicTracks.length;
  matchMusic.src = matchMusicTracks[matchMusicTrackIndex];
  matchMusic.load();
  if (gameStarted && !gameOver && !paused) tryPlay(matchMusic);
});
const shopMusic = new Audio('som/musicas/musica loja.mp3');
shopMusic.loop = true;

const gunshotSound = new Audio('som/efeitos/tiro.mp3');
gunshotSound.preload = 'auto';
gunshotSound.volume = 0.85;
const wolfRoarSound = new Audio('som/efeitos/urro-lobo.mp3');
const zombieDeathSound = new Audio('som/efeitos/morte-zumbi.mp3');
zombieDeathSound.preload = 'auto';
zombieDeathSound.volume = 0.75;
const knifeSwingSound = new Audio('som/efeitos/golpe-faca.mp3');
knifeSwingSound.preload = 'auto';
knifeSwingSound.volume = 0.7;
const youDiedSound = new Audio('som/efeitos/morte-jogador.mp3');
youDiedSound.preload = 'auto';
youDiedSound.volume = 0.9;
const itemGetSound = new Audio('som/efeitos/item-coletado.mp3');
itemGetSound.preload = 'auto';
itemGetSound.volume = 0.8;
const itemConfirmSound = new Audio('som/efeitos/confirmacao-item.mp3');
itemConfirmSound.preload = 'auto';
itemConfirmSound.volume = 0.8;
const localGameSounds = {
  shot: new Audio('som/efeitos/tiro.mp3'),
  shotHeavy: new Audio('som/efeitos/tiro-2.mp3'),
  reload: new Audio('som/efeitos/recarga.mp3'),
  reloadAlt: new Audio('som/efeitos/recarga.mp3'),
  explosion: new Audio('som/efeitos/som-de-explosao.mp3'),
  zombieExplosion: new Audio('som/efeitos/explosao zumbi.mp3'),
  purchase: new Audio('som/efeitos/som de compra 1.mp3'),
  bossMagic: new Audio('som/efeitos/magia boss necromante.mp3'),
  bossSummon: new Audio('som/efeitos/magia boss necromante.mp3'),
  bruteAttack: new Audio('som/efeitos/som de ataque zumbi brupamontes.mp3'),
  electricShock: new Audio('som/efeitos/som eletrecidade 1.mp3'),
  electricCharge: new Audio('som/efeitos/som eletrecidade 2.mp3'),
  wolfHowl: new Audio('som/efeitos/som lobo boss 1.mp3'),
  wolfDash: new Audio('som/efeitos/som lobo boss  2.mp3'),
  wolfPack: new Audio('som/efeitos/som lobo boss  3.mp3'),
  parasite: new Audio('som/efeitos/som parasita.mp3'),
  mimicCry: new Audio('som/efeitos/mimic som.mp3'),
  mimicDeath: new Audio('som/efeitos/mimic morte.mp3'),
  chestOpen: new Audio('som/efeitos/som bau abrindo.mp3'),
  greatswordMagic: new Audio('som/efeitos/som magia gretsword boatoa direiro.mp3'),
  frogInteract: new Audio('som/efeitos/som ao interagir com o sapo.mp3'),
  frogDeath: new Audio('som/efeitos/morte sapo.mp3'),
  pickup: new Audio('som/efeitos/som de compra 2.mp3'),
  campfire: new Audio('som/efeitos/som fogueira.mp3'),
};
localGameSounds.campfire.loop = true;

function tryPlay(audio) {
  audio.play().catch(() => { /* aguardando interação do usuário */ });
}

function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function playOneShot(baseAudio, volumeMultiplier = 1) {
  try {
    const instance = baseAudio.cloneNode(true);
    instance.volume = Math.min(1, soundVolume * effectsVolume * volumeMultiplier);
    instance.play().catch(() => {});
  } catch (e) { /* ignora falha de áudio */ }
}

/* ---------- Estado geral ---------- */
const SHOP_PRICES = { magnum: 85, shotgun12: 70, smg: 100, rifle: 135, heal: 15, ammo: 12, vest: 45, reload: 55, lifesteal: 65 };
const weaponDefs = {
  pistol: { id: 'pistol', name: 'Pistola', damage: 2.4, clipSize: 8, fireCooldown: 0.50, auto: false, cost: 0, key: '2' },
  knife: { id: 'knife', name: 'Canivete', damage: 5, clipSize: 999, fireCooldown: 0.35, auto: false, cost: 0, key: '1', melee: true, meleeRange: 4.6, meleeAngle: 0.35 },
  shotgun: { id: 'shotgun', name: 'Magnum', damage: 10.2, clipSize: 6, fireCooldown: 0.75, auto: false, cost: SHOP_PRICES.magnum, key: '4' },
  shotgun12: { id: 'shotgun12', name: '12', damage: 0.90, clipSize: 4, fireCooldown: 0.70, auto: false, cost: SHOP_PRICES.shotgun12, key: '3', pellets: 8, spread: 0.20 },
  smg: { id: 'smg', name: 'Submetralhadora', damage: 2.12, clipSize: 30, fireCooldown: 0.09, auto: true, cost: SHOP_PRICES.smg, key: '5' },
  rifle: { id: 'rifle', name: 'Rifle de Precisão', damage: 13.2, clipSize: 5, fireCooldown: 1.10, auto: false, cost: SHOP_PRICES.rifle, key: '6' },
  grenadeLauncher: { id: 'grenadeLauncher', name: 'Lança-granadas', damage: 110, clipSize: 8, fireCooldown: 0.9, auto: false, key: '7' },
  doomSword: { id: 'doomSword', name: 'Espada Doom', damage: 27, specialDamage: 30, clipSize: 999, fireCooldown: 1.8, meleeCooldown: 0.4, auto: false, key: '8', melee: true, meleeRange: 5.2, meleeAngle: 0.30 },
  greatsword: { id: 'greatsword', name: 'Greatsword', damage: 12, clipSize: 999, fireCooldown: 2.4, meleeCooldown: 0.58, auto: false, key: '9', melee: true, meleeRange: 5.6, meleeAngle: 0.32 },
};
const unlockedWeapons = new Set(['pistol', 'knife']);
let currentWeaponId = 'pistol';
const weaponAmmo = { pistol: weaponDefs.pistol.clipSize, knife: 999, shotgun: 0, shotgun12: 0, smg: 0, rifle: 0, doomSword: 999, greatsword: 999, grenadeLauncher: 0 };
let ammo = weaponAmmo.pistol;
let fireCooldownTimer = 0;
let weaponSpecialCooldownTimer = 0;
let mouseHeld = false;

const reserveAmmoMax = { pistol: 48, shotgun: 24, shotgun12: 20, smg: 120, rifle: 30, grenadeLauncher: 12 };
const reserveAmmoByWeapon = { pistol: 24, shotgun: 0, shotgun12: 0, smg: 0, rifle: 0, grenadeLauncher: 0 };
function getCurrentReserveAmmo() { return reserveAmmoByWeapon[currentWeaponId] ?? 0; }
function getReserveAmmoLimit(weaponId) { return reserveAmmoMax[weaponId] ?? 0; }
let pendingReloadAmount = 0;
let reloadingWeaponId = null;
let scrap = 0;

let isReloading = false;
let reloadDuration = 1.6;
let reloadTimer = 0;
const STARTING_PLAYER_HEALTH = 10;
const MAX_PLAYER_HEALTH = 20;

let isSprinting = false;
let damageMultiplier = 1;
let moveSpeedMultiplier = 1;

let paused = false;
let gameStarted = false;
let settingsOpenedFromMenu = false;
let playerHealth = STARTING_PLAYER_HEALTH;
let maxPlayerHealth = STARTING_PLAYER_HEALTH;
let currentWave = 1;
let enemiesThisWave = 0;
let enemiesToSpawnThisWave = 0;
let maxActiveEnemies = 100;
let bossThisWave = false;
let bossSpawned = false;
let score = 0;
let pauseOpenedByPointerUnlock = false;
let gameOver = false;
let bestWave = Number(localStorage.getItem('forestBestWave') || 0);
let vestLevel = 0;
let reloadPerkLevel = 0;
let lifestealLevel = 0;
let itemSpawnTimer = 0;
let nextItemAt = 42;
const forestPerks = { reload: 0.25, lifesteal: 1 };

/* ---------- Elementos DOM ---------- */
const mainMenuElement = document.getElementById('main-menu');
const gameUiElement = document.getElementById('game-ui');
const gameOverElement = document.getElementById('gameover-screen');
const playButton = document.getElementById('play-button');
const openSettingsFromMenuButton = document.getElementById('open-settings-from-menu');
const openCityMapButton = document.getElementById('open-city-map');
const gameoverRestartButton = document.getElementById('gameover-restart-button');
const gameoverScoreElement = document.getElementById('gameover-score');
const gameoverWaveElement = document.getElementById('gameover-wave');
const gameoverBestElement = document.getElementById('gameover-best');
const damageVignetteElement = document.getElementById('damage-vignette');
const healVignetteElement = document.getElementById('heal-vignette');
const damageSoundElement = document.getElementById('damage-sound');
let damageEffectUntil = 0;
let damageEffectTimer = null;
let lastDamageFeedbackAt = -Infinity;

const scoreElement = document.getElementById('score');
const scrapElement = document.getElementById('scrap-indicator');
const waveElement = document.getElementById('wave-counter');
const waveBannerElement = document.getElementById('forest-wave-banner');
const waveBannerTitleElement = document.getElementById('forest-wave-banner-title');
const waveBannerSubElement = document.getElementById('forest-wave-banner-sub');
const healthFillElement = document.getElementById('health-fill');
const healthValueElement = document.getElementById('health-value');
const healthBarElement = document.getElementById('health-bar');
const bossHealthContainerElement = document.getElementById('boss-health-container');
const bossHealthNameElement = document.getElementById('boss-health-name');
const bossHealthValueElement = document.getElementById('boss-health-value');
const bossHealthBarElement = document.getElementById('boss-health-bar');
const bossHealthFillElement = document.getElementById('boss-health-fill');
const gameNotificationElement = document.getElementById('game-notification');
const messageElement = document.getElementById('message');
const ammoIndicatorElement = document.getElementById('ammo-indicator');
const weaponAbilityIndicatorsElement = document.getElementById('weapon-ability-indicators');
const weaponSpecialCooldownFillElement = document.getElementById('weapon-special-cooldown-fill');
const weaponSpecialCooldownValueElement = document.getElementById('weapon-special-cooldown-value');
const settingsMenuElement = document.getElementById('settings-menu');
const shopMenuElement = document.getElementById('shop-menu');
const closeShopButton = document.getElementById('close-shop-button');
const buyShotgunButton = document.getElementById('buy-shotgun');
const buyShotgun12Button = document.getElementById('buy-shotgun12');
const buySmgButton = document.getElementById('buy-smg');
const buyRifleButton = document.getElementById('buy-rifle');
const buyLifeButton = document.getElementById('buy-life');
const buyVestButton = document.getElementById('buy-vest');
const buyAmmoButton = document.getElementById('buy-ammo');
const buyReloadPerkButton = document.getElementById('buy-reload-perk');
const buyLifestealPerkButton = document.getElementById('buy-lifesteal-perk');
const shopScrapValueElement = document.getElementById('shop-scrap-value');
const resumeButton = document.getElementById('resume-button');
const restartButton = document.getElementById('restart-button');
const sensitivitySlider = document.getElementById('sensitivity-slider');
const sensitivityValueElement = document.getElementById('sensitivity-value');
const volumeSlider = document.getElementById('volume-slider');
const volumeValueElement = document.getElementById('volume-value');
const musicVolumeSlider = document.getElementById('music-volume-slider');
const musicVolumeValueElement = document.getElementById('music-volume-value');
const effectsVolumeSlider = document.getElementById('effects-volume-slider');
const effectsVolumeValueElement = document.getElementById('effects-volume-value');

/* ---------- Renderer / câmera ---------- */
const sizes = { width: window.innerWidth, height: window.innerHeight };

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x0e150e);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(70, sizes.width / sizes.height, 0.1, 1200);
camera.position.set(0, 1.6, 0);
camera.rotation.order = 'YXZ';

const moon = new THREE.Sprite(new THREE.SpriteMaterial({
  color: new THREE.Color(2, 2, 2),
  transparent: true,
  depthTest: true,
  depthWrite: false,
  fog: false,
  toneMapped: false
}));
moon.scale.set(90, 90, 1);
moon.position.set(175, 350, -900);
moon.visible = false;
scene.add(moon);
loader.load('fotos/cenario/lua.png', (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  moon.material.map = texture;
  moon.material.needsUpdate = true;
  moon.visible = true;
}, undefined, (error) => console.error('Falha ao carregar a imagem da lua.', error));

let pitch = 0;
let yaw = 0;
let controlsEnabled = false;
let pointerSensitivity = 0.0025;
let soundVolume = 0.75;
let musicVolume = 1;
let effectsVolume = 1;
let aiming = false;
const normalFov = 70;
const aimFov = 48;
const audioContext = typeof AudioContext !== 'undefined' ? new AudioContext() : null;

/* ---------- Luzes ---------- */
scene.add(new THREE.AmbientLight(0xa8c6a0, 0.54));

const sunLight = new THREE.DirectionalLight(0xd9dfc0, 0.95);
sunLight.position.set(10, 18, 8);
scene.add(sunLight);

const fillLight = new THREE.DirectionalLight(0x6f9c78, 0.58);
fillLight.position.set(-8, 10, -12);
scene.add(fillLight);

const dangerLight = new THREE.PointLight(0xff2a2a, 0.6, 26);
dangerLight.position.set(0, 6, -20);
scene.add(dangerLight);

const ambientSmoke = new THREE.PointLight(0x6da37b, 0.4, 60);
ambientSmoke.position.set(0, 9, 0);
scene.add(ambientSmoke);

scene.background = new THREE.Color(0x102116);

/* ---------- Montanhas no horizonte (atrás da mata) ---------- */
function createMountain(height, radius, color) {
  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 9),
    new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0.03 })
  );
  mountain.position.y = height * 0.5 - 1.5;
  mountain.rotation.y = Math.random() * Math.PI;
  return mountain;
}
const mountainGroup = new THREE.Group();
const mountainColors = [0x3c453a, 0x38402f, 0x424a3c, 0x353d31, 0x2f362a];
// cadeias de montanhas nos 4 lados, bem atrás da linha de árvores
const mountainSides = [
  { axis: 'z', sign: -1 }, { axis: 'z', sign: 1 },
  { axis: 'x', sign: -1 }, { axis: 'x', sign: 1 },
];
for (const side of mountainSides) {
  for (let i = -3; i <= 3; i++) {
    const height = 30 + Math.random() * 26;
    const radius = 22 + Math.random() * 20;
    const along = i * 60 + (Math.random() - 0.5) * 20;
    const depth = 250 + Math.random() * 70;
    const mountain = createMountain(height, radius, mountainColors[Math.floor(Math.random() * mountainColors.length)]);
    if (side.axis === 'z') {
      mountain.position.set(along, 0, side.sign * depth);
    } else {
      mountain.position.set(side.sign * depth, 0, along);
    }
    mountainGroup.add(mountain);
  }
}
scene.add(mountainGroup);

/* ---------- Estrelas no céu ---------- */
const starsGeometry = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < 420; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 70 + Math.random() * 125;
  const y = 38 + Math.random() * 95;
  starPositions.push(
    Math.cos(angle) * radius,
    y,
    Math.sin(angle) * radius
  );
}
starsGeometry.setAttribute(
  'position',
  new THREE.Float32BufferAttribute(starPositions, 3)
);
const starsMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.45,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  fog: false
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);


/* ---------- Chão ---------- */
const floorGeometry = new THREE.PlaneGeometry(360, 360, 32, 32);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x315f3d, roughness: 0.82, metalness: 0.02 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -1.5, 0);
scene.add(floor);

const floorPatches = new THREE.Group();
const patchColors = [0x5a8f4d, 0x3e7a4a, 0x468757, 0x5c9d5a];
for (let i = 0; i < 24; i++) {
  const patch = new THREE.Mesh(
    new THREE.CircleGeometry(3 + Math.random() * 2.4, 20),
    new THREE.MeshBasicMaterial({ color: patchColors[Math.floor(Math.random() * patchColors.length)], transparent: true, opacity: 0.35 })
  );
  patch.rotation.x = -Math.PI / 2;
  patch.position.set((Math.random() - 0.5) * 300, -1.48, (Math.random() - 0.5) * 300);
  floorPatches.add(patch);
}
scene.add(floorPatches);

const staticColliders = [];
const decoRocks = new THREE.Group();
scene.add(decoRocks);
const rockSpots = [];
for (let i = 0; i < 34; i++) {
  rockSpots.push({
    x: (Math.random() - 0.5) * 290,
    z: (Math.random() - 0.5) * 290,
    scale: 0.9 + Math.random() * 1.1,
    rotY: Math.random() * Math.PI * 2,
  });
}
function createFallbackRock() {
  return new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.7, 0),
    new THREE.MeshStandardMaterial({ color: 0x7c7c78, roughness: 0.9, metalness: 0.05 })
  );
}
function createSpriteRock(texture) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(2.4, 1.9, 1);
  sprite.position.y = -0.65;
  return sprite;
}
function rebuildRocks() {
  decoRocks.clear();
  removeStaticCollidersByType('rock');
  for (const spot of rockSpots) {
    const rock = rockTexture ? createSpriteRock(rockTexture) : createFallbackRock();
    rock.position.x = spot.x;
    rock.position.z = spot.z;
    if (!rockTexture) rock.position.y = -1.25;
    rock.rotation.y = spot.rotY;
    rock.scale.multiplyScalar(spot.scale);
    decoRocks.add(rock);
    addStaticCollider(rock.position.x, rock.position.z, 1.25 * spot.scale, 'rock');
  }
}

function removeStaticCollidersByType(type) {
  for (let i = staticColliders.length - 1; i >= 0; i--) {
    if (staticColliders[i].type === type) staticColliders.splice(i, 1);
  }
}

function addStaticCollider(x, z, radius, type = 'prop') {
  staticColliders.push({ x, z, radius, type });
}

function resolveStaticCollisions(position, radius = 0.65) {
  for (const c of staticColliders) {
    const dx = position.x - c.x;
    const dz = position.z - c.z;
    const minDist = radius + c.radius;
    const distSq = dx * dx + dz * dz;
    if (distSq < minDist * minDist) {
      const dist = Math.sqrt(distSq) || 0.001;
      const push = (minDist - dist) / dist;
      position.x += dx * push;
      position.z += dz * push;
    }
  }
}

function pointHitsStaticCollider(position, radius = 0.18) {
  for (const c of staticColliders) {
    const dx = position.x - c.x;
    const dz = position.z - c.z;
    const minDist = radius + c.radius;
    if (dx * dx + dz * dz < minDist * minDist) return true;
  }
  return false;
}

const decoBushes = new THREE.Group();
scene.add(decoBushes);
const bushSpots = [];
for (let i = 0; i < 65; i++) {
  bushSpots.push({
    x: (Math.random() - 0.5) * 300,
    z: (Math.random() - 0.5) * 300,
    phase: Math.random() * Math.PI * 2,
    scale: 0.85 + Math.random() * 0.5,
  });
}
function createFallbackBush() {
  const bush = new THREE.Group();
  const clumps = 2 + Math.floor(Math.random() * 2);
  for (let c = 0; c < clumps; c++) {
    const clump = new THREE.Mesh(
      new THREE.SphereGeometry(0.65 + Math.random() * 0.45, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x35592f, roughness: 0.95 })
    );
    clump.position.set((Math.random() - 0.5) * 0.9, 0.42 + Math.random() * 0.25, (Math.random() - 0.5) * 0.9);
    bush.add(clump);
  }
  return bush;
}
function createSpriteBush(texture) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(3.3, 2.25, 1);
  sprite.position.y = 0.1;
  return sprite;
}
function rebuildBushes() {
  decoBushes.clear();
  for (const spot of bushSpots) {
    const bush = bushTexture ? createSpriteBush(bushTexture) : createFallbackBush();
    bush.position.x = spot.x;
    bush.position.z = spot.z;
    bush.position.y = bushTexture ? -1.4 : -1.5;
    bush.userData = { phase: spot.phase };
    bush.scale.multiplyScalar(spot.scale);
    decoBushes.add(bush);
  }
}
rebuildRocks();
rebuildBushes();

const decoDebris = new THREE.Group();
const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3a24, roughness: 0.75, metalness: 0.25 });
const crateMaterial = new THREE.MeshStandardMaterial({ color: 0x4b4536, roughness: 0.85, metalness: 0.1 });
for (let i = 0; i < 26; i++) {
  const isBarrel = Math.random() > 0.45;
  const prop = isBarrel
    ? new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 12), barrelMaterial)
    : new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), crateMaterial);
  prop.position.set((Math.random() - 0.5) * 260, isBarrel ? -0.95 : -1.05, (Math.random() - 0.5) * 260);
  prop.rotation.y = Math.random() * Math.PI;
  decoDebris.add(prop);
}
scene.add(decoDebris);

/* ---------- Fogueira (dá vida ao acampamento inicial) ---------- */
const campfireGroup = new THREE.Group();
const logMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a2f1d, roughness: 0.96
});
const logCutMaterial = new THREE.MeshStandardMaterial({
  color: 0xc29a62, roughness: 0.88
});
const logRingMaterial = new THREE.MeshBasicMaterial({
  color: 0x6d4a2e, transparent: true, opacity: 0.72
});

for (let i = 0; i < 5; i++) {
  const log = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.20, 1.7, 8),
    logMaterial
  );
  body.rotation.z = Math.PI / 2;
  log.add(body);

  // Pontas cortadas visíveis.
  for (const side of [-1, 1]) {
    const end = new THREE.Mesh(
      new THREE.CircleGeometry(0.19, 10),
      logCutMaterial
    );
    end.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    end.position.x = side * 0.855;
    log.add(end);

    // Anéis da madeira.
    for (let r = 0.055; r <= 0.14; r += 0.045) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r, r + 0.012, 12),
        logRingMaterial
      );
      ring.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      ring.position.x = side * 0.86;
      log.add(ring);
    }
  }

  // Pequenas faixas de casca.
  for (let k = 0; k < 3; k++) {
    const bark = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.025, 0.055),
      logMaterial
    );
    bark.position.set(
      (Math.random() - 0.5) * 1.2,
      0.18 + Math.random() * 0.03,
      0.17
    );
    bark.rotation.z = (Math.random() - 0.5) * 0.4;
    log.add(bark);
  }

  log.rotation.y = (i / 5) * Math.PI;
  log.position.y = 0.1 + (i % 2) * 0.06;
  campfireGroup.add(log);
}
const fireLight = new THREE.PointLight(0xff8c3d, 1.6, 14, 2);
fireLight.position.y = 0.8;
campfireGroup.add(fireLight);
const flameMesh = new THREE.Mesh(
  new THREE.ConeGeometry(0.35, 0.9, 8),
  new THREE.MeshBasicMaterial({ color: 0xff9a3d, transparent: true, opacity: 0.85 })
);
flameMesh.position.y = 0.55;
campfireGroup.add(flameMesh);
campfireGroup.position.set(6, -1.5, 10);
scene.add(campfireGroup);

function rebuildCampfireFlame() {
  if (!fireTexture) return;
  flameMesh.geometry.dispose();
  flameMesh.material.dispose();
  campfireGroup.remove(flameMesh);
  const flameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: fireTexture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  flameSprite.scale.set(1.6, 2.0, 1);
  flameSprite.position.y = 0.85;
  campfireGroup.add(flameSprite);
  campfireGroup.userData.flameSprite = flameSprite;
}

/* ---------- Cercas de acampamento ---------- */
const fenceGroup = new THREE.Group();
const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x6b5636, roughness: 0.85 });
function createFenceSegment() {
  const segment = new THREE.Group();

  const woodDark = new THREE.MeshStandardMaterial({
    color: 0x3b291d,
    roughness: 1
  });
  const woodLight = new THREE.MeshStandardMaterial({
    color: 0x6b4a2d,
    roughness: 0.95
  });

  // Três tábuas grossas, levemente irregulares.
  for (let p = 0; p < 3; p++) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 0.22, 0.14),
      p === 1 ? woodDark : woodLight
    );
    plank.position.set(
      (Math.random() - 0.5) * 0.08,
      0.32 + p * 0.48,
      (Math.random() - 0.5) * 0.04
    );
    plank.rotation.z = (Math.random() - 0.5) * 0.035;
    segment.add(plank);
  }

  const postGeometry = new THREE.CylinderGeometry(0.11, 0.14, 1.65, 7);

  const postLeft = new THREE.Mesh(postGeometry, woodDark);
  postLeft.position.set(-1.5, 0.35, 0);
  postLeft.rotation.z = (Math.random() - 0.5) * 0.08;

  const postRight = new THREE.Mesh(postGeometry, woodDark);
  postRight.position.set(1.5, 0.35, 0);
  postRight.rotation.z = (Math.random() - 0.5) * 0.08;

  segment.add(postLeft, postRight);

  // Pregos/metais pequenos dão mais detalhe sem virar outro objeto enorme.
  const nailMaterial = new THREE.MeshStandardMaterial({
    color: 0x171717,
    metalness: 0.8,
    roughness: 0.45
  });

  for (const x of [-0.95, 0.95]) {
    for (let y = 0.32; y <= 1.28; y += 0.48) {
      const nail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8),
        nailMaterial
      );
      nail.rotation.x = Math.PI / 2;
      nail.position.set(x, y, -0.085);
      segment.add(nail);
    }
  }

  return segment;
}
const fenceSpots = [];
const campfireX = 6;
const campfireZ = 10;
const fenceRadius = 6.2;
const fenceCount = 8;

for (let i = 0; i < fenceCount; i++) {
  const angle = (i / fenceCount) * Math.PI * 2 + Math.PI / 8;
  fenceSpots.push({
    x: campfireX + Math.cos(angle) * fenceRadius,
    z: campfireZ + Math.sin(angle) * fenceRadius,
    ry: angle + Math.PI / 2
  });
}

for (const spot of fenceSpots) {
  const fence = createFenceSegment();
  fence.position.set(spot.x, -1.5, spot.z);
  fence.rotation.y = spot.ry;
  fenceGroup.add(fence);
}
fenceGroup.scale.set(1.65, 1.65, 1.65);
scene.add(fenceGroup);

/* ---------- Faíscas da fogueira ---------- */
const campfireSparkGroup = new THREE.Group();
const campfireSparks = [];

for (let i = 0; i < 70; i++) {
  const spark = new THREE.Mesh(
    new THREE.SphereGeometry(0.045 + Math.random() * 0.035, 5, 5),
    new THREE.MeshBasicMaterial({
      color: Math.random() > 0.35 ? 0xffb347 : 0xffe08a,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
  );
  spark.userData = {
    life: Math.random(),
    speed: 0.65 + Math.random() * 1.35,
    driftX: (Math.random() - 0.5) * 0.7,
    driftZ: (Math.random() - 0.5) * 0.7,
    phase: Math.random() * Math.PI * 2
  };
  campfireSparkGroup.add(spark);
  campfireSparks.push(spark);
}
campfireSparkGroup.position.set(6, -1.5, 10);
scene.add(campfireSparkGroup);

function updateCampfireSparks(time, delta) {
  for (const spark of campfireSparks) {
    const d = spark.userData;
    d.life += delta * d.speed;

    if (d.life > 1) {
      d.life = 0;
      spark.position.set(
        (Math.random() - 0.5) * 1.1,
        0.25 + Math.random() * 0.18,
        (Math.random() - 0.5) * 1.1
      );
      d.speed = 0.65 + Math.random() * 1.35;
      d.driftX = (Math.random() - 0.5) * 0.7;
      d.driftZ = (Math.random() - 0.5) * 0.7;
    }

    const t = d.life;
    spark.position.y = 0.25 + t * (2.2 + Math.sin(time * 4 + d.phase) * 0.18);
    spark.position.x += d.driftX * delta * 0.45;
    spark.position.z += d.driftZ * delta * 0.45;
    spark.material.opacity = t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.3);
  }
}

/* ---------- Fumaça suave da fogueira ---------- */
const campfireSmokeGroup = new THREE.Group();
const campfireSmoke = [];

for (let i = 0; i < 18; i++) {
  const puff = new THREE.Mesh(
    new THREE.SphereGeometry(0.22 + Math.random() * 0.22, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0x77736d,
      transparent: true,
      opacity: 0.0,
      depthWrite: false
    })
  );
  puff.userData = {
    life: Math.random(),
    speed: 0.16 + Math.random() * 0.24,
    drift: (Math.random() - 0.5) * 0.45,
    phase: Math.random() * Math.PI * 2
  };
  campfireSmokeGroup.add(puff);
  campfireSmoke.push(puff);
}
campfireSmokeGroup.position.set(6, -1.5, 10);
scene.add(campfireSmokeGroup);

function updateCampfireSmoke(time, delta) {
  for (const puff of campfireSmoke) {
    const d = puff.userData;
    d.life += delta * d.speed;

    if (d.life > 1) {
      d.life = 0;
      puff.position.set(
        (Math.random() - 0.5) * 0.55,
        0.95 + Math.random() * 0.35,
        (Math.random() - 0.5) * 0.55
      );
      d.drift = (Math.random() - 0.5) * 0.45;
      puff.scale.setScalar(0.65 + Math.random() * 0.45);
    }

    const t = d.life;
    puff.position.y = 0.95 + t * 3.0;
    puff.position.x += (d.drift + Math.sin(time * 1.3 + d.phase) * 0.08) * delta;
    puff.position.z += Math.cos(time * 1.1 + d.phase) * delta * 0.025;
    puff.scale.setScalar(0.65 + t * 1.4);
    puff.material.opacity = Math.sin(t * Math.PI) * 0.18;
  }
}

/* ---------- Vagalumes / poeira suspensa (atmosfera viva) ---------- */
const fireflyGroup = new THREE.Group();
const fireflyMaterial = new THREE.SpriteMaterial({ color: 0xbdf27a, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
const fireflies = [];
for (let i = 0; i < 60; i++) {
  const firefly = new THREE.Sprite(fireflyMaterial.clone());
  firefly.scale.setScalar(0.12 + Math.random() * 0.1);
  const x = (Math.random() - 0.5) * 140;
  const z = (Math.random() - 0.5) * 140;
  firefly.position.set(x, 0.3 + Math.random() * 2.2, z);
  firefly.userData = { baseX: x, baseZ: z, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.4 };
  fireflyGroup.add(firefly);
  fireflies.push(firefly);
}
scene.add(fireflyGroup);

/* ---------- Floresta (usa arvore.webp assim que carrega) ---------- */
const forestGroup = new THREE.Group();
scene.add(forestGroup);
const barrierLimit = 152;
const doomguyClearing = { x: -132, z: -132, radius: 38 };
const forestSpots = [];
const forestRows = [0, 7, 15, 24, 34, 45, 56, 68, 82, 96, 112]; // várias camadas para fechar o horizonte
for (const rowOffset of forestRows) {
  for (let x = -barrierLimit; x <= barrierLimit; x += 8) {
    forestSpots.push({ x: x + (Math.random() - 0.5) * 4, z: -barrierLimit - rowOffset - Math.random() * 5 });
    forestSpots.push({ x: x + (Math.random() - 0.5) * 4, z: barrierLimit + rowOffset + Math.random() * 5 });
  }
  for (let z = -barrierLimit + 10; z <= barrierLimit - 10; z += 8.5) {
    forestSpots.push({ x: -barrierLimit - rowOffset - Math.random() * 5, z: z + (Math.random() - 0.5) * 4 });
    forestSpots.push({ x: barrierLimit + rowOffset + Math.random() * 5, z: z + (Math.random() - 0.5) * 4 });
  }
}

/* ---------- Cantos do mapa ---------- */
// Três cantos ficam mais fechados com árvores.
// No canto superior direito há apenas uma camada fina, deixando uma passagem visual.
const cornerLayers = [
  { cx: -1, cz: -1, layers: 3 },
  { cx: -1, cz:  1, layers: 3 },
  { cx:  1, cz: -1, layers: 4 },
  { cx:  1, cz:  1, layers: 3 },
];
for (const corner of cornerLayers) {
  for (let layer = 0; layer < corner.layers; layer++) {
    const baseX = corner.cx * (barrierLimit - 10 - layer * 6);
    const baseZ = corner.cz * (barrierLimit - 10 - layer * 6);
    for (let i = 0; i < 7; i++) {
      forestSpots.push({
        x: baseX + corner.cx * i * 5 + (Math.random() - 0.5) * 3,
        z: baseZ + corner.cz * i * 5 + (Math.random() - 0.5) * 3
      });
    }
  }
}

// Faixa extra de árvores nos quatro cantos para impedir que a câmera enxergue fora do cenário.
for (let ring = 0; ring < 4; ring++) {
  const d = 10 + ring * 7;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 0.5;
    const signs = [[-1,-1],[1,-1],[-1,1],[1,1]];
    for (const [sx, sz] of signs) {
      forestSpots.push({
        x: sx * (barrierLimit + d * Math.cos(a)) + (Math.random() - 0.5) * 4,
        z: sz * (barrierLimit + d * Math.sin(a)) + (Math.random() - 0.5) * 4
      });
    }
  }
}

for (let i = forestSpots.length - 1; i >= 0; i--) {
  const spot = forestSpots[i];
  if (Math.hypot(spot.x - doomguyClearing.x, spot.z - doomguyClearing.z) < doomguyClearing.radius) {
    forestSpots.splice(i, 1);
  }
}

for (const offset of [
  [-29, -8], [-24, -21], [-8, -31], [13, -30],
  [29, -13], [31, 11], [-12, 30],
  [-5, -5], [4, 3], [-3, 7],
  [-19, -17], [-2, -22], [-21, 2], [-15, 17], [13, -18]
]) {
  forestSpots.push({ x: doomguyClearing.x + offset[0], z: doomguyClearing.z + offset[1] });
}

function createFallbackTree() {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 1.3, 8),
    new THREE.MeshStandardMaterial({ color: 0x6d4d2f, roughness: 0.85 })
  );
  const leaves = new THREE.Mesh(
    new THREE.ConeGeometry(1.3, 2.2, 9),
    new THREE.MeshStandardMaterial({ color: 0x2d6e30, roughness: 0.6 })
  );
  trunk.position.y = 0.65;
  leaves.position.y = 1.5;
  tree.add(trunk, leaves);
  return tree;
}

function createSpriteTree(texture) {
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  const scale = 10.5 + Math.random() * 7.5;
  sprite.scale.set(scale * (1.05 + Math.random() * 0.3), scale * (1.05 + Math.random() * 0.2), 1);
  sprite.position.y = scale / 2 - 1.5;
  sprite.material.rotation = (Math.random() - 0.5) * 0.10;
  return sprite;
}

function rebuildForest() {
  forestGroup.clear();
  const available = [treeTexture, ...forestVariationTextures].filter(Boolean);
  for (const spot of forestSpots) {
    const texture = available.length ? available[Math.floor(Math.random() * available.length)] : null;
    const tree = texture ? createSpriteTree(texture) : createFallbackTree();
    tree.position.x = spot.x;
    tree.position.z = spot.z;
    if (!texture) tree.position.y = -1.5;
    tree.scale.multiplyScalar(1.05 + Math.random() * 0.38);
    tree.rotation.y = (Math.random() - 0.5) * 0.25;
    forestGroup.add(tree);
  }
}
rebuildForest();

/* ---------- Cenário abandonado: árvores secas, carros e sucata ---------- */
const abandonedScenery = new THREE.Group();
scene.add(abandonedScenery);

function createDryTree() {
  const tree = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x33241b, roughness: 1 });
  const barkLight = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 });
  const barkMid = new THREE.MeshStandardMaterial({ color: 0x453127, roughness: 1 });
  const barkDark = new THREE.MeshStandardMaterial({ color: 0x211713, roughness: 1 });

  function branchBetween(a, b, r1, r2, material, radial = 7) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const len = dir.length();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, len, radial), material);
    mesh.position.copy(va).add(vb).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return mesh;
  }

  // Tronco alto e levemente torto, com volume 3D.
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.72, 6.8, 10), trunkMat);
  trunk.position.y = 1.9;
  trunk.rotation.z = (Math.random() - 0.5) * 0.16;
  trunk.rotation.x = (Math.random() - 0.5) * 0.10;
  tree.add(trunk);

  // Raízes abertas em várias direções.
  const roots = [
    [-0.55,0.08,0.10,-1.0,0.15,-0.1], [0.52,0.08,0.08,1.0,0.1,0.05],
    [0.05,0.08,-0.62,0.1,0.1,-1.0], [-0.08,0.08,0.58,-0.15,0.1,1.0]
  ];
  for (const [ax,ay,az,bx,by,bz] of roots) tree.add(branchBetween([ax,ay,az],[bx,by,bz],0.08,0.23,barkDark,6));

  // Copa seca com galhos distribuídos em profundidade, não em uma única direção.
  const mainBranches = [
    [[0,4.0,0],[2.6,5.4,0.25],0.13,0.055],
    [[-0.1,4.15,0],[-2.7,5.55,-0.25],0.13,0.055],
    [[0.05,4.65,0],[1.65,6.55,1.35],0.11,0.045],
    [[-0.05,4.8,0],[-1.8,6.35,-1.25],0.11,0.045],
    [[0.12,5.1,0],[0.35,7.15,-0.15],0.10,0.04],
    [[0.0,3.55,0],[-1.25,4.8,1.55],0.14,0.05],
    [[0.0,3.75,0],[1.25,5.05,-1.6],0.14,0.05],
    [[0.0,5.55,0],[-0.8,7.05,1.7],0.08,0.035]
  ];

  for (const [a,b,r1,r2] of mainBranches) {
    tree.add(branchBetween(a,b,r2,r1,barkLight,8));
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(B,A).normalize();
    const mid = A.clone().lerp(B,0.62);
    // Duas ramificações secundárias saindo para lados diferentes.
    for (let side = -1; side <= 1; side += 2) {
      const perp = new THREE.Vector3(-dir.z, 0.35 * side, dir.x).normalize();
      const end = mid.clone().add(perp.multiplyScalar(0.75 + Math.random()*0.75));
      end.y += 0.45 + Math.random()*0.7;
      tree.add(branchBetween(mid.toArray(),end.toArray(),0.025,r2*0.58,barkMid,6));
      const tipStart = end.clone();
      const tipEnd = end.clone().add(new THREE.Vector3(
        (Math.random()-0.5)*0.9,
        0.45 + Math.random()*0.65,
        (Math.random()-0.5)*0.9
      ));
      tree.add(branchBetween(tipStart.toArray(),tipEnd.toArray(),0.012,r2*0.28,barkDark,5));
    }
  }

  // Pequenos galhos secos espalhados para quebrar a silhueta de poste.
  for (let i = 0; i < 18; i++) {
    const y = 4.0 + Math.random() * 3.0;
    const angle = Math.random() * Math.PI * 2;
    const len = 0.7 + Math.random() * 1.35;
    const start = [Math.cos(angle)*0.55, y, Math.sin(angle)*0.55];
    const end = [
      start[0] + Math.cos(angle)*(len),
      y + 0.25 + Math.random()*0.9,
      start[2] + Math.sin(angle)*(len)
    ];
    tree.add(branchBetween(start,end,0.012,0.035,barkDark,5));
  }

  // Marcas de casca em posições variadas.
  for (let i = 0; i < 10; i++) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.5 + Math.random()*0.75, 0.09),
      i % 2 ? barkDark : barkMid
    );
    strip.position.set((Math.random()-0.5)*0.45, 0.45+i*0.55, 0.43);
    strip.rotation.z = (Math.random()-0.5)*0.35;
    strip.rotation.y = (Math.random()-0.5)*0.35;
    tree.add(strip);
  }

  tree.rotation.y = Math.random()*Math.PI*2;
  tree.rotation.z = (Math.random()-0.5)*0.05;
  tree.scale.setScalar(1.45 + Math.random()*0.7);
  return tree;
}
function addDryTrees() {
  const spots = [
    [-42,-38], [35,-48], [62,-12], [-68,8],
    [48,42], [-50,54], [8,62], [-82,-62],
    [78,68], [-18,-72], [96,-35], [-95,35],
    [-112,-8], [112,10], [18,98], [-8,-102]
  ];

  for (const [x,z] of spots) {
    const tree = createDryTree();
    tree.position.set(x, -1.5, z);
    abandonedScenery.add(tree);
  }
}

function createBrokenCar() {
  const car = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x343834,
    roughness: 0.92,
    metalness: 0.2
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x0e1110,
    roughness: 1
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x10191a,
    roughness: 0.62,
    metalness: 0.22
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0x777873,
    roughness: 0.5,
    metalness: 0.7
  });
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0xffd98a,
    emissive: 0xff9b2f,
    emissiveIntensity: 0.35,
    roughness: 0.45
  });

  // Carroceria principal.
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 1.35, 2.5),
    bodyMat
  );
  body.position.y = 0.72;
  body.rotation.z = -0.025;
  car.add(body);

  // Saia inferior escura.
  const lowerBody = new THREE.Mesh(
    new THREE.BoxGeometry(5.75, 0.34, 2.58),
    darkMat
  );
  lowerBody.position.y = 0.28;
  car.add(lowerBody);

  // Cabine com para-brisa e laterais separados.
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(3.15, 1.18, 2.05),
    glassMat
  );
  cabin.position.set(-0.25, 1.68, 0);
  cabin.rotation.z = -0.035;
  car.add(cabin);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.25, 0.16, 2.12),
    bodyMat
  );
  roof.position.set(-0.25, 2.28, 0);
  roof.rotation.z = -0.035;
  car.add(roof);

  // Capô levantado, dando aparência de veículo abandonado.
  const hood = new THREE.Mesh(
    new THREE.BoxGeometry(1.65, 0.34, 2.32),
    bodyMat
  );
  hood.position.set(2.02, 1.12, 0);
  hood.rotation.z = -0.14;
  car.add(hood);

  // Tampa traseira levemente caída.
  const trunk = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 0.28, 2.25),
    bodyMat
  );
  trunk.position.set(-2.05, 1.18, 0);
  trunk.rotation.z = 0.08;
  car.add(trunk);

  // Para-choques.
  const frontBumper = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.48, 2.7),
    chromeMat
  );
  frontBumper.position.set(2.92, 0.44, 0);
  car.add(frontBumper);

  const rearBumper = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.42, 2.62),
    darkMat
  );
  rearBumper.position.set(-2.92, 0.45, 0);
  car.add(rearBumper);

  // Rodas.
  for (const x of [-1.85, 1.85]) {
    for (const z of [-1.3, 1.3]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.63, 0.63, 0.44, 14),
        darkMat
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.48, z);
      car.add(wheel);

      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.46, 10),
        chromeMat
      );
      hub.rotation.x = Math.PI / 2;
      hub.position.set(x, 0.48, z);
      car.add(hub);
    }
  }

  // Faróis.
  for (const z of [-0.78, 0.78]) {
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.28, 0.52),
      lampMat
    );
    lamp.position.set(2.88, 0.92, z);
    car.add(lamp);
  }

  // Retrovisores.
  for (const z of [-1.18, 1.18]) {
    const mirror = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.18, 0.16),
      darkMat
    );
    mirror.position.set(0.65, 1.75, z);
    car.add(mirror);
  }

  // Grade frontal.
  const grille = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.48, 1.1),
    darkMat
  );
  grille.position.set(2.94, 0.72, 0);
  car.add(grille);

  // Lataria amassada.
  const dent = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.14, 1.95),
    bodyMat
  );
  dent.position.set(1.62, 1.38, 0);
  dent.rotation.z = -0.28;
  car.add(dent);

  const rustMat = new THREE.MeshStandardMaterial({
    color: 0x6f321e, roughness: 1, metalness: 0.08
  });
  const redLampMat = new THREE.MeshStandardMaterial({
    color: 0x5a1010, emissive: 0x260000,
    emissiveIntensity: 0.18, roughness: 0.55
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x1b1d1c, roughness: 0.5, metalness: 0.7
  });

  // Ferrugem e chapas amassadas.
  for (const z of [-1.08, 1.08]) {
    const rustPatch = new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.16, 0.035), rustMat
    );
    rustPatch.position.set(-0.95, 0.95, z);
    rustPatch.rotation.z = -0.12;
    car.add(rustPatch);
  }

  const frontRust = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.65, 1.55), rustMat
  );
  frontRust.position.set(2.72, 0.72, 0);
  frontRust.rotation.z = 0.08;
  car.add(frontRust);

  // Lanternas traseiras.
  for (const z of [-0.78, 0.78]) {
    const rearLamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.3, 0.5), redLampMat
    );
    rearLamp.position.set(-2.86, 0.92, z);
    car.add(rearLamp);
  }

  // Maçanetas.
  for (const z of [-1.05, 1.05]) {
    for (const x of [-0.65, 0.85]) {
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.06, 0.05), handleMat
      );
      handle.position.set(x, 1.42, z);
      car.add(handle);
    }
  }

  // Escape quebrado.
  const exhaust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.15, 1.0, 8), darkMat
  );
  exhaust.rotation.z = Math.PI / 2;
  exhaust.position.set(-2.65, 0.25, -0.78);
  car.add(exhaust);

  // Rachaduras estilizadas no para-brisa.
  const crackMat = new THREE.MeshBasicMaterial({
    color: 0x7e8b8c, transparent: true, opacity: 0.48
  });
  for (const z of [-0.52, 0.0, 0.52]) {
    const crack = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.8, 0.025), crackMat
    );
    crack.position.set(1.31, 1.75, z);
    crack.rotation.z = (Math.random() - 0.5) * 0.7;
    car.add(crack);
  }

  car.rotation.y = -0.28;
  car.rotation.z = -0.04;
  car.scale.setScalar(1.58);
  return car;
}
function addBrokenCars() {
  const carSpots = [
    { x: -25, z: 22, r: 0.35 }
  ];

  for (const spot of carSpots) {
    const car = createBrokenCar();
    car.position.set(spot.x, -1.5, spot.z);
    car.rotation.y += spot.r;
    abandonedScenery.add(car);
  }
}

function createJunkPile() {
  const pile = new THREE.Group();

  const metal = new THREE.MeshStandardMaterial({
    color: 0x343836, roughness: 1, metalness: 0.15
  });
  const rust = new THREE.MeshStandardMaterial({
    color: 0x63351f, roughness: 1, metalness: 0.08
  });
  const rubber = new THREE.MeshStandardMaterial({
    color: 0x151716, roughness: 1
  });

  for (let i = 0; i < 7; i++) {
    const piece = new THREE.Mesh(
      new THREE.BoxGeometry(
        0.75 + Math.random() * 1.7,
        0.35 + Math.random() * 0.9,
        0.28 + Math.random() * 0.75
      ),
      i % 3 === 0 ? rust : metal
    );
    piece.position.set(
      (Math.random() - 0.5) * 2.8,
      0.12 + Math.random() * 0.55,
      (Math.random() - 0.5) * 2.1
    );
    piece.rotation.set(
      Math.random() * 0.6,
      Math.random() * Math.PI,
      Math.random() * 0.6
    );
    pile.add(piece);
  }

  for (let i = 0; i < 2; i++) {
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.18, 8, 14), rubber
    );
    tire.position.set(-0.7 + i * 1.1, 0.48 + i * 0.18, 0.15);
    tire.rotation.x = Math.PI / 2;
    tire.rotation.z = (Math.random() - 0.5) * 0.5;
    pile.add(tire);
  }

  return pile;
}
function addJunkPiles() {
  const spots = [
    [-18, 48], [72, 18], [-78, -48], [28, -82],
    [84, 52], [-48, -82]
  ];

  for (const [x,z] of spots) {
    const pile = createJunkPile();
    pile.position.set(x, -1.5, z);
    abandonedScenery.add(pile);
  }
}

addDryTrees();
addBrokenCars();
addJunkPiles();

const extraGroundDetail = new THREE.Group();

const stoneMaterials = [
  new THREE.MeshStandardMaterial({ color: 0x46443e, roughness: 1 }),
  new THREE.MeshStandardMaterial({ color: 0x59554c, roughness: 1 }),
  new THREE.MeshStandardMaterial({ color: 0x353632, roughness: 1 })
];

for (let i = 0; i < 38; i++) {
  const stone = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.5, 0),
    stoneMaterials[i % stoneMaterials.length]
  );
  let x = (Math.random() - 0.5) * 250;
  let z = (Math.random() - 0.5) * 250;
  if (Math.hypot(x - 6, z - 10) < 13) {
    x += 18;
    z += 12;
  }
  stone.position.set(x, -1.35, z);
  stone.rotation.set(
    Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5
  );
  extraGroundDetail.add(stone);
}

const branchMaterial = new THREE.MeshStandardMaterial({
  color: 0x2b2118, roughness: 1
});

for (let i = 0; i < 42; i++) {
  const branch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.07, 1.1 + Math.random() * 1.5, 5),
    branchMaterial
  );
  branch.position.set(
    (Math.random() - 0.5) * 250,
    -1.28,
    (Math.random() - 0.5) * 250
  );
  branch.rotation.set(
    Math.PI / 2 + (Math.random() - 0.5) * 0.4,
    Math.random() * Math.PI,
    (Math.random() - 0.5) * 0.35
  );
  extraGroundDetail.add(branch);
}

scene.add(extraGroundDetail);


function buildSceneryColliders() {
  removeStaticCollidersByType('scenery');

  const dryTreeSpots = [
    [-42,-38], [35,-48], [62,-12], [-68,8],
    [48,42], [-50,54], [8,62], [-82,-62],
    [78,68], [-18,-72], [96,-35], [-95,35],
    [-112,-8], [112,10], [18,98], [-8,-102]
  ];
  for (const [x,z] of dryTreeSpots) addStaticCollider(x, z, 1.35, 'scenery');

  // O único carro.
  addStaticCollider(-25, 22, 3.2, 'scenery');

  const junkSpots = [
    [-18, 48], [72, 18], [-78, -48], [28, -82],
    [84, 52], [-48, -82]
  ];
  for (const [x,z] of junkSpots) addStaticCollider(x, z, 1.4, 'scenery');

  // Cerca e fogueira são apenas decoração, sem colisão física.
}
buildSceneryColliders();

/* ---------- Elementos misturados do cenário ---------- */
function createAbandonedBarricade() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x4a3829, roughness: 1 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x343735, roughness: 0.95, metalness: 0.15 });
  for (let i = 0; i < 3; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.24, 0.28), wood);
    plank.position.set(0, 0.65 + i * 0.48, (i - 1) * 0.12);
    plank.rotation.z = (Math.random() - 0.5) * 0.08;
    g.add(plank);
  }
  for (const x of [-1.45, 1.45]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.28, 2.5, 0.28), metal);
    post.position.set(x, 0.55, 0);
    post.rotation.z = x > 0 ? -0.12 : 0.12;
    g.add(post);
  }
  g.scale.setScalar(1.25);
  return g;
}

function createBarrel() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.65, 1.25, 12),
    new THREE.MeshStandardMaterial({ color: 0x414543, roughness: 0.9, metalness: 0.2 })
  );
  body.position.y = 0.62;
  g.add(body);
  for (const y of [0.18, 1.08]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.06, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0x222625, roughness: 1 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
  }
  g.rotation.z = (Math.random() - 0.5) * 0.08;
  return g;
}

function createDeadSign() {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.11, 3.2, 7),
    new THREE.MeshStandardMaterial({ color: 0x37302a, roughness: 1 })
  );
  pole.position.y = 1.5;
  g.add(pole);
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.9, 0.10),
    new THREE.MeshStandardMaterial({ color: 0x45433b, roughness: 0.95, metalness: 0.1 })
  );
  sign.position.set(0, 2.55, 0);
  sign.rotation.z = -0.08;
  g.add(sign);
  g.rotation.y = Math.random() * Math.PI * 2;
  return g;
}

function addMixedProps() {
  const barricades = [[-38,8,0.2],[42,-20,-0.7],[18,56,1.1]];
  for (const [x,z,r] of barricades) {
    const b = createAbandonedBarricade();
    b.position.set(x,-1.5,z); b.rotation.y = r; abandonedScenery.add(b);
  }
  const barrels = [[-8,34],[30,34],[-55,-30],[68,5],[4,-62],[88,40]];
  for (const [x,z] of barrels) {
    const b = createBarrel();
    b.position.set(x,-1.5,z); b.scale.setScalar(1.15); abandonedScenery.add(b);
  }
  const signs = [[-58,65],[63,-38],[-82,12]];
  for (const [x,z] of signs) {
    const s = createDeadSign();
    s.position.set(x,-1.5,z); abandonedScenery.add(s);
  }
}
addMixedProps();


/* ---------- Jogador / arma ---------- */
function createWeaponMesh(weaponId) {
  const texture = weaponTextures[weaponId];
  if (texture) {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0.05, depthWrite: false });
    const layouts = {
      pistol: { w: 2.15, h: 1.13, pos: [-0.18, 0, -1.32], rot: [0, 0, 0] },
      knife: { w: 1.12, h: 1.12, pos: [0.24, 0.18, -1.20], rot: [0, 0, 0] },
      shotgun: { w: 1.04, h: 0.76, pos: [0.32, -0.14, -1.20], rot: [0, 0, 0] },
      shotgun12: { w: 1.30, h: 0.68, pos: [0, -0.16, -1.20], rot: [0, 0, 0] },
      smg: { w: 1.72, h: 0.98, pos: [0, 0, -1.20], rot: [0, 0, 0] },
      rifle: { w: 1.82, h: 0.94, pos: [0, 0, -1.20], rot: [0, 0, 0] },
      doomSword: { w: 1.85, h: 2.3, pos: [0.28, -0.22, -1.12], rot: [0, 0, 0] },
      greatsword: { w: 1.42, h: 2.9, pos: [0.24, -0.04, -1.15], rot: [0, 0, 0] },
      grenadeLauncher: { w: 2.6, h: 2.0, pos: [0.02, 0.16, -1.18], rot: [0, 0, 0] },
    };
    const layout = layouts[weaponId] || layouts.pistol;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(layout.w, layout.h), material);
    mesh.position.set(layout.pos[0], layout.pos[1] - 0.48, layout.pos[2]);
    mesh.rotation.set(...layout.rot);
    mesh.userData.basePosition = mesh.position.clone();
    return mesh;
  }
  const shapeByWeapon = {
    pistol: { size: [0.14, 0.1, 0.7], color: 0x1e1e1e },
    knife: { size: [0.05, 0.05, 0.55], color: 0xc7c7c7 },
    shotgun: { size: [0.2, 0.2, 1.5], color: 0x3b2a1c },
    shotgun12: { size: [0.2, 0.2, 1.5], color: 0x3b2a1c },
    smg: { size: [0.17, 0.2, 0.8], color: 0x2b2f26 },
    rifle: { size: [0.12, 0.14, 1.6], color: 0x333c2c },
    doomSword: { size: [0.13, 0.13, 1.5], color: 0x8d2424 },
    greatsword: { size: [0.16, 0.16, 1.7], color: 0x4b9cff },
    grenadeLauncher: { size: [0.42, 0.32, 1.3], color: 0x41513a },
  };
  const shape = shapeByWeapon[weaponId] || shapeByWeapon.pistol;
  const material = new THREE.MeshStandardMaterial({ color: shape.color, metalness: 0.85, roughness: 0.3 });
  const gun = new THREE.Mesh(new THREE.BoxGeometry(...shape.size), material);
  gun.position.set(0.05, -0.63, -1.0);
  gun.rotation.set(-0.1, 0.06, 0);
  gun.userData.basePosition = gun.position.clone();
  return gun;
}

const player = new THREE.Object3D();
player.position.set(0, 0, 0);
player.add(camera);
playerGun = createWeaponMesh(currentWeaponId);
camera.add(playerGun);
scene.add(player);

const fireflyCount = 54;
const fireflyOffsets = [];
const fireflyPositions = new Float32Array(fireflyCount * 3);
const fireflyGeometry = new THREE.BufferGeometry();
for (let i = 0; i < fireflyCount; i++) {
  const offset = {
    x: (Math.random() - 0.5) * 66,
    z: (Math.random() - 0.5) * 66,
    y: -0.4 + Math.random() * 4.8,
    phase: Math.random() * Math.PI * 2,
    drift: 0.25 + Math.random() * 0.75,
  };
  fireflyOffsets.push(offset);
  fireflyPositions[i * 3] = player.position.x + offset.x;
  fireflyPositions[i * 3 + 1] = offset.y;
  fireflyPositions[i * 3 + 2] = player.position.z + offset.z;
}
fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
const ambientFireflyPoints = new THREE.Points(
  fireflyGeometry,
  new THREE.PointsMaterial({
    color: 0xcfff89,
    size: 0.32,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  })
);
ambientFireflyPoints.frustumCulled = false;
scene.add(ambientFireflyPoints);

function updateAmbientFireflyPoints(time) {
  const positions = fireflyGeometry.attributes.position;
  for (let i = 0; i < fireflyCount; i++) {
    const offset = fireflyOffsets[i];
    const driftX = Math.sin(time * offset.drift + offset.phase) * 1.2;
    const driftZ = Math.cos(time * offset.drift * 0.8 + offset.phase) * 1.2;
    positions.setXYZ(
      i,
      player.position.x + offset.x + driftX,
      offset.y + Math.sin(time * 1.3 + offset.phase) * 0.55,
      player.position.z + offset.z + driftZ
    );
  }
  positions.needsUpdate = true;
  ambientFireflyPoints.material.opacity = 0.54 + Math.sin(time * 1.7) * 0.12;
}

function switchWeapon(id) {
  if (!unlockedWeapons.has(id) || id === currentWeaponId) return;
  // Canivete é uma arma normal de troca: pode entrar e sair dela pelas teclas 1/2/3...

  weaponAmmo[currentWeaponId] = ammo;
  if (isReloading) {
    isReloading = false;
    pendingReloadAmount = 0;
    reloadingWeaponId = null;
  }
  currentWeaponId = id;
  ammo = weaponAmmo[id];
  isReloading = false;
  fireCooldownTimer = 0;
  weaponSpecialCooldownTimer = 0;
  aiming = false;
  document.body.classList.remove('aiming');
  camera.fov = normalFov;
  camera.updateProjectionMatrix();
  camera.remove(playerGun);
  playerGun = createWeaponMesh(id);
  camera.add(playerGun);
  updateAmmoDisplay();
  updateShopButtons();
  updateWeaponAbilityIndicators();
  if (messageElement) messageElement.textContent = `Arma equipada: ${weaponDefs[id].name}`;
}

function buyWeapon(id) {
  const def = weaponDefs[id];
  if (!def || unlockedWeapons.has(id)) return;
  if (scrap < def.cost) {
    if (messageElement) messageElement.textContent = 'Sucata insuficiente para essa arma.';
    return;
  }
  scrap -= def.cost;
  unlockedWeapons.add(id);
  weaponAmmo[id] = def.clipSize;
  updateScrapDisplay();
  updateShopButtons();
  if (messageElement) messageElement.textContent = `${def.name} comprada! Tecla ${def.key} para equipar.`;
  switchWeapon(id);
}

function updateShopButtons() {
  if (buyShotgunButton) {
    const owned = unlockedWeapons.has('shotgun');
    buyShotgunButton.textContent = owned ? 'Adquirida' : `Comprar (${weaponDefs.shotgun.cost} sucata)`;
    buyShotgunButton.disabled = owned;
  }
  if (buyShotgun12Button) {
    const owned = unlockedWeapons.has('shotgun12');
    buyShotgun12Button.textContent = owned ? 'Adquirida' : `Comprar (${weaponDefs.shotgun12.cost} sucata)`;
    buyShotgun12Button.disabled = owned;
  }
  if (buySmgButton) {
    const owned = unlockedWeapons.has('smg');
    buySmgButton.textContent = owned ? 'Adquirida' : `Comprar (${weaponDefs.smg.cost} sucata)`;
    buySmgButton.disabled = owned;
  }
  if (buyRifleButton) {
    const owned = unlockedWeapons.has('rifle');
    buyRifleButton.textContent = owned ? 'Adquirida' : `Comprar (${weaponDefs.rifle.cost} sucata)`;
    buyRifleButton.disabled = owned;
  }
  if (shopScrapValueElement) shopScrapValueElement.textContent = `${scrap}`;
  const vestPrice = SHOP_PRICES.vest + vestLevel * 15;
  const reloadPrice = SHOP_PRICES.reload + reloadPerkLevel * 25;
  const lifestealPrice = SHOP_PRICES.lifesteal + lifestealLevel * 30;
  if (buyLifeButton) {
    buyLifeButton.textContent = `Comprar (${SHOP_PRICES.heal} sucata)`;
    buyLifeButton.disabled = scrap < SHOP_PRICES.heal || playerHealth >= maxPlayerHealth;
  }
  if (buyVestButton) {
    buyVestButton.textContent = `Comprar (${vestPrice} sucata)`;
    buyVestButton.disabled = scrap < vestPrice || maxPlayerHealth >= MAX_PLAYER_HEALTH;
  }
  if (buyAmmoButton) {
    const weapon = weaponDefs[currentWeaponId];
    buyAmmoButton.textContent = `Comprar (${SHOP_PRICES.ammo} sucata)`;
    buyAmmoButton.disabled = scrap < SHOP_PRICES.ammo || weapon.melee || getCurrentReserveAmmo() >= getReserveAmmoLimit(currentWeaponId);
  }
  if (buyReloadPerkButton) {
    buyReloadPerkButton.textContent = reloadPerkLevel >= 3 ? 'Nível máximo' : `Comprar (${reloadPrice} sucata)`;
    buyReloadPerkButton.disabled = scrap < reloadPrice || reloadPerkLevel >= 3;
  }
  if (buyLifestealPerkButton) {
    buyLifestealPerkButton.textContent = lifestealLevel >= 3 ? 'Nível máximo' : `Comprar (${lifestealPrice} sucata)`;
    buyLifestealPerkButton.disabled = scrap < lifestealPrice || lifestealLevel >= 3;
  }
}

buyShotgunButton?.addEventListener('click', () => buyWeapon('shotgun'));
buyShotgun12Button?.addEventListener('click', () => { buyWeapon('shotgun12'); playOneShot(localGameSounds.purchase, 0.9); });
buySmgButton?.addEventListener('click', () => { buyWeapon('smg'); playOneShot(localGameSounds.purchase, 0.9); });
buyRifleButton?.addEventListener('click', () => { buyWeapon('rifle'); playOneShot(localGameSounds.purchase, 0.9); });
buyLifeButton?.addEventListener('click', () => {
  if (scrap < SHOP_PRICES.heal || playerHealth >= maxPlayerHealth) return;
  scrap -= SHOP_PRICES.heal; playerHealth = Math.min(maxPlayerHealth, playerHealth + 3); playOneShot(localGameSounds.purchase, 0.9); updateHealthDisplay(); updateScrapDisplay(); updateShopButtons();
});
buyVestButton?.addEventListener('click', () => {
  const price = SHOP_PRICES.vest + vestLevel * 15;
  if (scrap < price || maxPlayerHealth >= MAX_PLAYER_HEALTH) return;
  scrap -= price; vestLevel += 1; maxPlayerHealth = Math.min(MAX_PLAYER_HEALTH, maxPlayerHealth + 2); playerHealth = Math.min(maxPlayerHealth, playerHealth + 2); playOneShot(localGameSounds.purchase, 0.9); updateHealthDisplay(); updateScrapDisplay(); updateShopButtons();
});
buyAmmoButton?.addEventListener('click', () => {
  const weapon = weaponDefs[currentWeaponId];
  if (scrap < SHOP_PRICES.ammo || weapon.melee || getCurrentReserveAmmo() >= getReserveAmmoLimit(currentWeaponId)) return;
  scrap -= SHOP_PRICES.ammo; reserveAmmoByWeapon[currentWeaponId] = Math.min(getReserveAmmoLimit(currentWeaponId), getCurrentReserveAmmo() + weapon.clipSize * 2); playOneShot(localGameSounds.purchase, 0.9); updateAmmoDisplay(); updateScrapDisplay(); updateShopButtons();
});
buyReloadPerkButton?.addEventListener('click', () => {
  const price = SHOP_PRICES.reload + reloadPerkLevel * 25;
  if (scrap < price || reloadPerkLevel >= 3) return;
  scrap -= price; reloadPerkLevel += 1; reloadDuration = Math.max(0.7, reloadDuration - forestPerks.reload); playOneShot(localGameSounds.purchase, 0.9); updateScrapDisplay(); updateShopButtons();
});
buyLifestealPerkButton?.addEventListener('click', () => {
  const price = SHOP_PRICES.lifesteal + lifestealLevel * 30;
  if (scrap < price || lifestealLevel >= 3) return;
  scrap -= price; lifestealLevel += 1; playOneShot(localGameSounds.purchase, 0.9); updateScrapDisplay(); updateShopButtons();
});
updateShopButtons();

/* ---------- Interface: sons e sliders ---------- */
function updateSettingsDisplay() {
  if (sensitivityValueElement) sensitivityValueElement.textContent = `${sensitivitySlider?.value ?? 8}`;
  if (volumeValueElement) volumeValueElement.textContent = `${volumeSlider?.value ?? 75}%`;
  if (musicVolumeValueElement) musicVolumeValueElement.textContent = `${musicVolumeSlider?.value ?? 100}%`;
  if (effectsVolumeValueElement) effectsVolumeValueElement.textContent = `${effectsVolumeSlider?.value ?? 100}%`;
}

function setPointerSensitivity(value) {
  pointerSensitivity = 0.0003 * value;
  updateSettingsDisplay();
}

function setSoundVolume(value) {
  soundVolume = value / 100;
  applyAudioVolumes();
}

function setMusicVolume(value) {
  musicVolume = value / 100;
  applyAudioVolumes();
}

function setEffectsVolume(value) {
  effectsVolume = value / 100;
  applyAudioVolumes();
}

function applyAudioVolumes() {
  const musicGain = soundVolume * musicVolume;
  const effectsGain = soundVolume * effectsVolume;
  menuMusic.volume = musicGain * 0.6;
  matchMusic.volume = musicGain * 0.5;
  shopMusic.volume = musicGain * 0.55;
  gunshotSound.volume = Math.min(1, effectsGain * 0.9);
  zombieDeathSound.volume = Math.min(1, effectsGain * 0.85);
  knifeSwingSound.volume = Math.min(1, effectsGain * 0.8);
  youDiedSound.volume = Math.min(1, effectsGain);
  itemGetSound.volume = Math.min(1, effectsGain * 0.9);
  itemConfirmSound.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.shot.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.shotHeavy.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.reload.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.reloadAlt.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.explosion.volume = Math.min(1, effectsGain);
  localGameSounds.zombieExplosion.volume = Math.min(1, effectsGain);
  localGameSounds.purchase.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.pickup.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.bossMagic.volume = Math.min(1, effectsGain * 0.9);
  localGameSounds.bossSummon.volume = Math.min(1, effectsGain);
  localGameSounds.bruteAttack.volume = Math.min(1, effectsGain);
  localGameSounds.electricShock.volume = Math.min(1, effectsGain);
  localGameSounds.electricCharge.volume = Math.min(1, effectsGain);
  localGameSounds.wolfHowl.volume = Math.min(1, effectsGain);
  localGameSounds.wolfDash.volume = Math.min(1, effectsGain);
  localGameSounds.wolfPack.volume = Math.min(1, effectsGain);
  localGameSounds.parasite.volume = Math.min(1, effectsGain);
  localGameSounds.mimicCry.volume = Math.min(1, effectsGain);
  localGameSounds.mimicDeath.volume = Math.min(1, effectsGain);
  localGameSounds.chestOpen.volume = Math.min(1, effectsGain);
  localGameSounds.frogInteract.volume = Math.min(1, effectsGain);
  localGameSounds.greatswordMagic.volume = Math.min(1, effectsGain);
  localGameSounds.frogDeath.volume = Math.min(1, effectsGain);
  localGameSounds.campfire.volume = Math.min(1, effectsGain * 0.35);
  if (damageSoundElement) damageSoundElement.volume = Math.min(1, effectsGain * 0.9);
  updateSettingsDisplay();
}

sensitivitySlider?.addEventListener('input', (e) => setPointerSensitivity(Number(e.target.value)));
volumeSlider?.addEventListener('input', (e) => setSoundVolume(Number(e.target.value)));
musicVolumeSlider?.addEventListener('input', (e) => setMusicVolume(Number(e.target.value)));
effectsVolumeSlider?.addEventListener('input', (e) => setEffectsVolume(Number(e.target.value)));
updateSettingsDisplay();
setPointerSensitivity(Number(sensitivitySlider?.value || 8));
setSoundVolume(Number(volumeSlider?.value || 75));
setMusicVolume(Number(musicVolumeSlider?.value || 100));
setEffectsVolume(Number(effectsVolumeSlider?.value || 100));

function playSound(frequency, duration = 0.08) {
  if (!audioContext) return;
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gain.gain.value = soundVolume * effectsVolume;
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

/* ---------- Inimigos ---------- */
const enemyColors = { walker: 0x4f2d2d, rusher: 0x7a0909, dodger: 0x31402d, tank: 0x2d392d, bloater: 0x8f4b20, jumper: 0xa8572c, boss: 0x8b0000, entity: 0x1d1b2a, shooter: 0x3a3a3a };
const bossEnemyTypes = new Set(['boss', 'wolf', 'necromancer', 'parasiteBoss', 'electrician', 'entity']);
const enemyTypes = ['walker', 'walker', 'walker', 'rusher', 'dodger', 'tank', 'shooter', 'bloater'];
const bullets = [];
const grenadeProjectiles = [];
const enemies = [];
const pickups = [];
const muzzleFlashes = [];
const enemyProjectiles = [];
const acidPuddles = [];
const entitySmokeClouds = [];
const entityBlastEffects = [];
const entityShroudGeometry = new THREE.SphereGeometry(1, 12, 10);
const entityShroudMaterials = [
  new THREE.MeshBasicMaterial({ color: 0x17151d, transparent: true, opacity: 0.58, depthWrite: false }),
  new THREE.MeshBasicMaterial({ color: 0x292431, transparent: true, opacity: 0.48, depthWrite: false }),
  new THREE.MeshBasicMaterial({ color: 0x39313f, transparent: true, opacity: 0.38, depthWrite: false })
];
const electricCharges = [];
const electricDetonations = [];
const electricBolts = [];
const enemySpeed = 0.115;
const bulletSpeed = 2.4;
let spawnTimer = 0;
let spawnInterval = 1.4;
const keys = { w: false, a: false, s: false, d: false, shift: false };
let playerVerticalVelocity = 0;
let playerGrounded = true;
let playerStunTimer = 0;
const playerJumpStrength = 7.5;
const playerGravity = 22;

const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
const touchMoveVector = { x: 0, z: 0 };
let touchSprintHeld = false;


function createEnemyHealthBar(type) {
  const isBig = type === 'tank' || type === 'mimic' || bossEnemyTypes.has(type);
  const width = isBig ? 2.0 : 1.6;
  const height = 0.16;
  const background = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ color: 0x2f1f1f }));
  const foreground = new THREE.Mesh(new THREE.PlaneGeometry(width, height * 0.75), new THREE.MeshBasicMaterial({ color: 0x7eff6d }));
  foreground.position.z = 0.01;
  const healthGroup = new THREE.Group();
  healthGroup.add(background, foreground);
  healthGroup.position.set(0, type === 'entity' ? 4.2 : isBig ? 3.6 : type === 'jumper' ? 2.1 : 2.4, 0);
  healthGroup.rotation.x = -Math.PI / 8;
  return { group: healthGroup, bar: foreground, width };
}

function createEntitySmokeShroud(enemyGroup) {
  const puffs = [];
  for (let row = 0; row < 7; row++) {
    const height = -2.6 + row * 0.86;
    for (let puffIndex = 0; puffIndex < 4; puffIndex++) {
      const angle = (puffIndex / 4) * Math.PI * 2 + row * 0.36;
      const radius = 1.05 + (row % 2) * 0.2 + Math.random() * 0.16;
      const puff = new THREE.Mesh(
        entityShroudGeometry,
        entityShroudMaterials[Math.floor(Math.random() * entityShroudMaterials.length)]
      );
      puff.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
      puff.scale.set(0.95 + Math.random() * 0.35, 0.9 + Math.random() * 0.35, 0.75 + Math.random() * 0.3);
      puff.userData = {
        basePosition: puff.position.clone(),
        baseScale: puff.scale.clone(),
        phase: Math.random() * Math.PI * 2
      };
      enemyGroup.add(puff);
      puffs.push(puff);
    }
  }
  return puffs;
}

function createEnemyMesh(type) {
  const textureKey = type === 'necromancer' ? 'necromancerBoss' : type;
  const texture = enemyTextures[textureKey];
  if (texture) {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.5 });
    const sprite = new THREE.Sprite(material);
    if (type === 'mimic') sprite.scale.set(3.8, 4.4, 1);
    else if (type === 'tank') sprite.scale.set(3.6, 4.8, 1);
    else if (type === 'boss') sprite.scale.set(4.4, 5.5, 1);
    else if (type === 'entity') sprite.scale.set(4.8, 5.8, 1);
    else if (type === 'parasiteBoss') sprite.scale.set(4.6, 5.2, 1);
    else if (type === 'electrician') sprite.scale.set(3.8, 5.0, 1);
    else if (type === 'necromancer') sprite.scale.set(4.2, 5.2, 1);
    else if (type === 'wolf') sprite.scale.set(5.8, 4.4, 1);
    else if (type === 'wolf_minion') sprite.scale.set(3.2, 2.4, 1);
    else if (type === 'jumper') sprite.scale.set(2.5, 2.8, 1);
    else if (type === 'skeleton') sprite.scale.set(2.8, 3.8, 1);
    else if (type === 'shooter') sprite.scale.set(3.6, 5.1, 1);
    else if (type === 'parasite') sprite.scale.set(2.2, 2.2, 1);
    else sprite.scale.set(3.0, 4.0, 1);
    return sprite;
  }
  if (bossEnemyTypes.has(type)) {
    const bossMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 4.6, 2.8),
      new THREE.MeshStandardMaterial({ color: enemyColors.boss, emissive: 0x5a0000, roughness: 0.7 })
    );
    return bossMesh;
  }
  const size = type === 'jumper' ? [1.6, 1.5, 1.2] : type === 'tank' ? [2.0, 2.5, 1.5] : [1.4, 1.8, 1.2];
  const fallback = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshStandardMaterial({ color: enemyColors[type] || 0x3c3c3c, emissive: type === 'rusher' ? 0x7a0909 : 0x1b0f0f, roughness: 0.8 })
  );
  if (type === 'jumper') fallback.position.y = -0.65;
  return fallback;
}

function getEnemyGroundY(type) {
  // O chão fica em Y=-1.5. O Y abaixo compensa metade da altura do sprite,
  // deixando os inimigos realmente apoiados no chão em vez de parecerem flutuar.
  if (type === 'boss') return 1.25;
  if (type === 'entity') return 1.35;
  if (type === 'parasiteBoss') return 1.15;
  if (type === 'electrician') return 1.0;
  if (type === 'necromancer') return 1.10;
  if (type === 'shooter') return 1.05;
  if (type === 'tank') return 0.50;
  if (type === 'mimic') return 0.70;
  if (type === 'wolf') return 0.70;
  if (type === 'wolf_minion') return -0.30;
  if (type === 'jumper') return -0.10;
  // Sprites normais agora são maiores, mas o grupo sobe exatamente o necessário
  // para os pés continuarem encostando no chão (Y=-1.5).
  return 0.50;
}

function addElectricianBackpack(enemyGroup) {
  const pack = new THREE.Group();
  pack.position.set(-1.08, 1.0, 0.12);
  pack.renderOrder = 1;

  const battery = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.9, 0.32),
    new THREE.MeshStandardMaterial({ color: 0x303a40, emissive: 0x12333b, emissiveIntensity: 0.7, metalness: 0.55, roughness: 0.42 })
  );
  pack.add(battery);

  const coilMaterial = new THREE.MeshStandardMaterial({ color: 0x72eaff, emissive: 0x17cfff, emissiveIntensity: 2.1, metalness: 0.45 });
  for (const x of [-0.22, 0.22]) {
    const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.72, 10), coilMaterial);
    coil.rotation.z = Math.PI / 2;
    coil.position.set(x, 0.08, 0.2);
    pack.add(coil);
  }

  const indicator = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xb6ffff })
  );
  indicator.position.set(0, -0.23, 0.22);
  pack.add(indicator);
  const glow = new THREE.PointLight(0x3feaff, 1.4, 5);
  glow.position.set(0, 0, 0.52);
  pack.add(glow);
  enemyGroup.add(pack);
}

function spawnEnemy(forceType = null, nearPosition = null, spawnOptions = {}) {
  const availableEnemyTypes = currentWave >= 6 ? [...enemyTypes, 'jumper', 'jumper'] : enemyTypes;
  const type = forceType || availableEnemyTypes[Math.floor(Math.random() * availableEnemyTypes.length)];
  const bossRank = bossEnemyTypes.has(type) ? getBossRank(currentWave) : (spawnOptions.bossRank || 1);
  const bossDamageMultiplier = bossEnemyTypes.has(type)
    ? getBossDifficultyScale(currentWave)
    : (spawnOptions.bossDamageMultiplier || 1);
  const enemy = createEnemyMesh(type);
  const enemyGroup = new THREE.Group();
  enemy.position.set(0, 0, 0);
  enemyGroup.add(enemy);

  const textureKey = type === 'necromancer' ? 'necromancerBoss' : type;
  if (!enemyTextures[textureKey]) {
    const eyeGlow = new THREE.PointLight(0xff5533, 0.7, 6);
    eyeGlow.position.set(0, 0.8, 0.6);
    enemy.add(eyeGlow);
  }

  // Velocidade: tanque é bem mais lento; corredor é bem mais rápido; esperto é ágil; boss é pesado; lobo é muito rápido.
  const baseSpeed = enemySpeed * (
    type === 'rusher' ? 1.3 :
    type === 'mimic' ? 0.8 :
    type === 'tank' ? 0.42 :
    type === 'boss' ? 0.5 :
    type === 'parasiteBoss' ? 0.62 :
    type === 'electrician' ? 0.68 :
    type === 'parasite' ? 1.35 :
    type === 'necromancer' ? 0.45 :
    type === 'wolf' || type === 'wolf_minion' ? 1.15 :
    type === 'shooter' ? 0.8 :
    type === 'dodger' ? 1.05 :
    type === 'jumper' ? 1.1 :
    0.9 // walker
  ) * (1 + Math.min(0.3, Math.max(0, currentWave - 15) * 0.012)) *
    (bossEnemyTypes.has(type) ? 0.8 + (bossRank - 1) * 0.08 : 1);
  // Vida: todos ficaram mais resistentes; chefes crescem a cada vez que aparecem.
  const baseHealthByType =
    type === 'mimic' ? 240 :
    type === 'boss' ? 75 + currentWave * 5 :
    type === 'entity' ? 210 + currentWave * 8 :
    type === 'parasiteBoss' ? 240 + currentWave * 5 :
    type === 'electrician' ? 190 + currentWave * 5 :
    type === 'necromancer' ? 300 + currentWave * 4 :
    type === 'wolf' ? 150 + currentWave * 4 :
    type === 'wolf_minion' ? 16 + currentWave * 2 :
    type === 'skeleton' ? 20 + currentWave * 2 :
    type === 'jumper' ? 30 + currentWave * 3 :
    type === 'shooter' ? 10 + Math.floor(currentWave / 4) :
    type === 'bloater' ? 16 + currentWave * 1.8 :
    type === 'tank' ? Math.floor(Math.random() * 25) + 30 :  // 25 a 30 — bem tanque
    type === 'rusher' ? Math.floor(Math.random() * 10) + 15 : // 10 a 15 — acima do normal
    type === 'dodger' ? Math.floor(Math.random() * 6) + 10 : // 4 a 10
    Math.floor(Math.random() * 6) + 10;                      // walker: 6 a 10
  const waveHealthMultiplier = Math.min(2.2, 1 + Math.max(0, currentWave - 1) * 0.035);
  const bossWaveMultiplier = bossEnemyTypes.has(type)
    ? getBossDifficultyScale(currentWave)
    : 1;
  const healthByType = Math.round(baseHealthByType * waveHealthMultiplier * bossWaveMultiplier);

  const { group: healthGroup, bar: healthBar, width: healthBarWidth } = createEnemyHealthBar(type);
  enemyGroup.add(healthGroup);
  const smokePuffs = type === 'entity' ? createEntitySmokeShroud(enemyGroup) : [];
  let jumpShadow = null;
  if (type === 'jumper') {
    jumpShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.9, 24),
      new THREE.MeshBasicMaterial({ color: 0x080b08, transparent: true, opacity: 0.58, depthWrite: false })
    );
    jumpShadow.rotation.x = -Math.PI / 2;
    jumpShadow.position.y = 0.025;
    jumpShadow.scale.set(1.25, 0.72, 1);
    enemyGroup.add(jumpShadow);
  }

  const angle = Math.random() * Math.PI * 2;
  if (nearPosition) {
    if (spawnOptions.exactPosition) {
      enemyGroup.position.set(nearPosition.x, getEnemyGroundY(type), nearPosition.z);
    } else {
      enemyGroup.position.set(
        nearPosition.x + Math.cos(angle) * 3,
        getEnemyGroundY(type),
        nearPosition.z + Math.sin(angle) * 3
      );
    }
  } else {
    // Chefes entram mais perto para continuarem visíveis na câmera do celular.
    const spawnRadius = bossEnemyTypes.has(type) ? 42 : 150;
    enemyGroup.position.set(
      player.position.x + Math.cos(angle) * spawnRadius + (Math.random() - 0.5) * 8,
      getEnemyGroundY(type),
      player.position.z + Math.sin(angle) * spawnRadius + (Math.random() - 0.5) * 8
    );
  }
  enemyGroup.userData = {
    alive: true, type, speed: baseSpeed,
    bossWave: bossEnemyTypes.has(type) ? currentWave : (spawnOptions.bossWave || 0),
    bossRank,
    bossDamageMultiplier,
    // "esperto" (dodger): dispara um desvio brusco de vez em quando, não fica sempre serpenteando
    dodgeTimer: 1.5 + Math.random() * 2,
    dodging: false,
    dodgeDuration: 0,
    dodgeSign: Math.random() > 0.5 ? 1 : -1,
    // boss/necromante/lobo: alternam entre avançar e usar habilidades especiais
    abilityState: 'idle',
    abilityTimer: bossEnemyTypes.has(type)
      ? getBossAbilityDelay({ bossRank }, 4, 6)
      : getWaveAbilityDelay(4, 6),
    abilityPhaseTimer: 0,
    summonsUsed: 0,
    shootTimer: getWaveAbilityDelay(1.5, 2.3, 0.025),
    shootCooldown: getWaveAbilityDelay(1.5, 2.2, 0.025),
    strafeTimer: 1.0 + Math.random() * 1.5,
    strafeSign: Math.random() > 0.5 ? 1 : -1,
    hitCooldown: 0,
    walkPhase: Math.random() * Math.PI * 2,
    groundY: enemyGroup.position.y,
    jumping: false,
    jumpHeight: 0,
    jumpVelocity: 0,
    jumpLanded: false,
    jumpCooldownTimer: 1.5 + Math.random() * 1.2,
    jumpDirection: new THREE.Vector3(),
    jumpShadow,
    sprite: enemy.isSprite ? enemy : enemy.children.find((child) => child.isSprite) || null,
    spriteBaseScale: enemy.isSprite ? enemy.scale.clone() : null,
    smokePuffs,
    summonedByWolfBoss: spawnOptions.summonedByWolfBoss === true,
    summonedByNecromancer: spawnOptions.summonedByNecromancer === true,
    wolfSpeedBoostTimer: 0,
    preyMarkTimer: 0,
    packState: 'idle',
    packStateTimer: 0,
    packSide: Math.random() > 0.5 ? 1 : -1,
    wolfSummonPendingTimer: 0,
    wolfTransformed: false,
    bloodTrails: [],
    preyMarkIndicator: null,
    health: healthByType, maxHealth: healthByType, healthBar, healthBarWidth, healthGroup,
    entityAttackIndex: 0,
    entityHidden: false,
    explosionCooldown: 2,
  };
  scene.add(enemyGroup);
  enemies.push(enemyGroup);
  updateBossHealthDisplay();
  return enemyGroup;
}

const necromancerSummonTypes = ['walker', 'walker', 'rusher', 'dodger', 'tank'];

function countNecromancerMinions() {
  return enemies.filter((enemy) => enemy.userData.alive && enemy.userData.summonedByNecromancer).length;
}

function getNecromancerMinionLimit(boss) {
  return Math.min(18, 2 + (boss.userData.bossRank || 1) * 2);
}

function summonNecromancerMinions(boss) {
  const rank = boss.userData.bossRank || 1;
  const availableSlots = getNecromancerMinionLimit(boss) - countNecromancerMinions();
  if (availableSlots <= 0) return 0;

  const maxSummons = rank <= 3 ? 1 : Math.min(6, 1 + Math.floor((rank - 2) / 2));
  const count = Math.min(1 + Math.floor(Math.random() * maxSummons), availableSlots);
  for (let i = 0; i < count; i++) {
    const type = Math.random() < 0.4
      ? 'skeleton'
      : necromancerSummonTypes[Math.floor(Math.random() * necromancerSummonTypes.length)];
    spawnEnemy(type, boss.position, {
      summonedByNecromancer: true,
      bossWave: boss.userData.bossWave,
      bossRank: rank,
      bossDamageMultiplier: boss.userData.bossDamageMultiplier
    });
  }
  return count;
}

function getMaxBossWolves(boss) {
  const data = boss.userData || boss;
  return Math.min(16, 3 + (data.bossRank || 1) * 2);
}

function countBossWolves() {
  return enemies.filter((enemy) => enemy.userData.alive &&
    enemy.userData.type === 'wolf_minion' && enemy.userData.summonedByWolfBoss).length;
}

function spawnBossWolvesFromEdge(boss, requestedCount) {
  const rank = boss.userData.bossRank || 1;
  const count = Math.min(requestedCount, getMaxBossWolves(boss) - countBossWolves());
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const edgeX = Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle)) ? Math.sign(Math.cos(angle)) * 158 : Math.random() * 250 - 125;
    const edgeZ = Math.abs(Math.sin(angle)) >= Math.abs(Math.cos(angle)) ? Math.sign(Math.sin(angle)) * 158 : Math.random() * 250 - 125;
    const entry = { x: edgeX, z: edgeZ };
    const minion = spawnEnemy('wolf_minion', entry, {
      summonedByWolfBoss: true,
      bossWave: boss.userData.bossWave,
      bossRank: rank,
      bossDamageMultiplier: boss.userData.bossDamageMultiplier
    });
    minion.userData.wolfSpeedBoostTimer = 6;
    minion.userData.preyMarkTimer = 7;
    minion.userData.packState = 'charge';
    minion.userData.packStateTimer = 2.2;
  }
  if (count > 0 && boss) {
    boss.userData.preyMarkTimer = 7;
    return count;
  }
  return 0;
}

function createWolfBloodTrail(bossData, startPosition, endPosition) {
  const marks = [];
  for (let i = 0; i < 3; i++) {
    const progress = (i + 1) / 4;
    const mark = new THREE.Mesh(
      new THREE.TorusGeometry(0.34 + i * 0.04, 0.065, 6, 14),
      new THREE.MeshBasicMaterial({ color: 0xb51f25, transparent: true, opacity: 0.85, depthWrite: false })
    );
    mark.rotation.x = Math.PI / 2;
    mark.position.set(
      startPosition.x + (endPosition.x - startPosition.x) * progress,
      -1.34,
      startPosition.z + (endPosition.z - startPosition.z) * progress
    );
    scene.add(mark);
    marks.push(mark);
  }
  bossData.bloodTrails.push({ meshes: marks, position: { x: endPosition.x, z: endPosition.z }, timer: 2.6 });
}

function updateWolfBloodTrails(bossData, delta) {
  for (let i = bossData.bloodTrails.length - 1; i >= 0; i--) {
    const trail = bossData.bloodTrails[i];
    trail.timer -= delta;
    trail.meshes.forEach((mark) => {
      mark.material.opacity = Math.max(0.15, Math.min(0.85, trail.timer * 0.32));
    });
    if (trail.timer > 0) continue;
    if (countBossWolves() < getMaxBossWolves(bossData)) {
      const minion = spawnEnemy('wolf_minion', trail.position, {
        summonedByWolfBoss: true,
        bossWave: bossData.bossWave,
        bossRank: bossData.bossRank,
        bossDamageMultiplier: bossData.bossDamageMultiplier
      });
      minion.userData.wolfSpeedBoostTimer = 4;
      minion.userData.preyMarkTimer = 5;
      if (messageElement) messageElement.textContent = 'Um lobo surgiu no rastro de sangue!';
    }
    trail.meshes.forEach((mark) => {
      scene.remove(mark);
      mark.geometry.dispose();
      mark.material.dispose();
    });
    bossData.bloodTrails.splice(i, 1);
  }
}

function showWolfPreyMark(bossData, duration) {
  bossData.preyMarkTimer = duration;
  if (!bossData.preyMarkIndicator) {
    bossData.preyMarkIndicator = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.07, 8, 28),
      new THREE.MeshBasicMaterial({ color: 0xff3030, transparent: true, opacity: 0.85, depthWrite: false })
    );
    bossData.preyMarkIndicator.rotation.x = Math.PI / 2;
    scene.add(bossData.preyMarkIndicator);
  }
  for (const enemy of enemies) {
    if (enemy.userData.type === 'wolf_minion' && enemy.userData.alive) {
      enemy.userData.preyMarkTimer = duration;
      enemy.userData.wolfSpeedBoostTimer = Math.max(enemy.userData.wolfSpeedBoostTimer, duration * 0.8);
    }
  }
}

function activeParasiteCount() {
  return enemies.filter((enemy) => enemy.userData.alive &&
    (enemy.userData.type === 'parasite' || enemy.userData.infectedParasite)).length;
}

function findNearestInfectableZombie(position, maxDistance = Infinity) {
  let nearest = null;
  let nearestDistance = maxDistance;
  for (const enemy of enemies) {
    const data = enemy.userData;
    if (!data.alive || data.infectedParasite || bossEnemyTypes.has(data.type) || data.type === 'parasite' || data.type === 'mimic') continue;
    const distance = enemy.position.distanceTo(position);
    if (distance < nearestDistance) {
      nearest = enemy;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function addInfectedParasiteVisual(host) {
  const data = host.userData;
  if (!data.infectedParasite || data.infectedParasiteVisual || !enemyTextures.infectedParasite) return;
  const worm = new THREE.Sprite(new THREE.SpriteMaterial({
    map: enemyTextures.infectedParasite,
    transparent: true,
    alphaTest: 0.5,
    depthWrite: false
  }));
  worm.scale.set(2.2, 2.0, 1);
  worm.position.set(0.42, 1.45, -0.04);
  worm.renderOrder = -1;
  host.add(worm);
  data.infectedParasiteVisual = worm;
}

function infectZombieWithParasite(host, parasite = null) {
  if (!host?.userData.alive || host.userData.infectedParasite) return false;
  if (!parasite && activeParasiteCount() >= 10) return false;

  const data = host.userData;
  const previousMaxHealth = data.maxHealth;
  data.infectedParasite = true;
  data.maxHealth = Math.round(previousMaxHealth * 1.5);
  data.health = Math.min(data.maxHealth, data.health + Math.round(previousMaxHealth * 0.5));
  if (data.sprite?.material?.color) data.sprite.material.color.setHex(0xff7777);
  addInfectedParasiteVisual(host);
  if (data.healthBar) {
    const ratio = data.health / data.maxHealth;
    data.healthBar.scale.x = ratio;
    data.healthBar.position.x = -data.healthBarWidth * 0.5 + (data.healthBarWidth * ratio) / 2;
  }

  if (parasite) {
    const parasiteIndex = enemies.indexOf(parasite);
    scene.remove(parasite);
    if (parasiteIndex >= 0) enemies.splice(parasiteIndex, 1);
  }
  if (messageElement) messageElement.textContent = 'Um zumbi foi infectado e ficou mais resistente!';
  return true;
}

function spawnParasite(position) {
  if (activeParasiteCount() >= 10) return false;
  spawnEnemy('parasite', position);
  return true;
}

/* ---------- Itens coletáveis (só surgem quando um zumbi morre) ---------- */
const pickupDefs = {
  pistol: { label: 'munição de pistola', color: 0xffe08a, amount: 28 },
  shotgun: { label: 'munição magnum', color: 0xffb238, amount: 9 },
  shotgun12: { label: 'munição de 12', color: 0x34b238, amount: 7 },
  rifle: { label: 'munição de rifle', color: 0x8fd0ff, amount: 6 },
  smg: { label: 'munição de metralhadora', color: 0xd6a4ff, amount: 22 },
  grenadeLauncher: { label: 'granadas', color: 0xff8b35, amount: 3 },
  medkit: { label: 'kit médico', color: 0x8fef4d },
};
const ammoPickupKinds = ['pistol', 'shotgun', 'shotgun12', 'rifle', 'smg', 'grenadeLauncher'];

function randomAmmoPickupKind() {
  const availableKinds = ammoPickupKinds.filter((kind) =>
    (kind !== 'grenadeLauncher' || unlockedWeapons.has(kind)) &&
    (reserveAmmoByWeapon[kind] ?? 0) < getReserveAmmoLimit(kind)
  );
  return availableKinds.length
    ? availableKinds[Math.floor(Math.random() * availableKinds.length)]
    : 'medkit';
}

function spawnPickupAt(position, kind, ignoreLimit = false) {
  if (pickups.length >= 10 && !ignoreLimit) return;
  const texture = pickupTextures[kind];
  let mesh;
  if (texture) {
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    mesh = new THREE.Sprite(material);
    const size = kind === 'grenadeLauncher' ? 1.9 : 1.4;
    mesh.scale.set(size, size, 1);
    if (kind === 'grenadeLauncher') {
      mesh.add(new THREE.PointLight(0xffa536, 1.6, 7));
    }
  } else {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: pickupDefs[kind].color, emissive: pickupDefs[kind].color, emissiveIntensity: 0.4 })
    );
  }
  mesh.position.set(position.x, 0.5, position.z);
  mesh.userData = { kind, bobOffset: Math.random() * Math.PI * 2, baseY: 0.5 };
  scene.add(mesh);
  pickups.push(mesh);
}

function spawnChestPickupAt(position, kind, value = 0) {
  const texture = pickupTextures[kind];
  const size = kind === 'greatsword' ? [0.85, 2.4] : [1.4, 1.4];
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: texture ? 0xffffff : kind === 'greatsword' ? 0x91e8d0 : 0x95a58c,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Sprite(material);
  mesh.scale.set(size[0], size[1], 1);
  mesh.position.set(position.x, 0.5, position.z);
  mesh.userData = { kind, value, bobOffset: Math.random() * Math.PI * 2, baseY: 0.5, noBob: true };
  scene.add(mesh);
  pickups.push(mesh);
}

function spawnChestSmoke(position) {
  const cloud = new THREE.Group();
  const puffs = [];
  for (let i = 0; i < 12; i++) {
    const material = new THREE.MeshBasicMaterial({ color: i % 2 ? 0x687065 : 0x92978a, transparent: true, opacity: 0.42, depthWrite: false });
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.52 + Math.random() * 0.35, 8, 7), material);
    const angle = Math.random() * Math.PI * 2;
    puff.position.set(Math.cos(angle) * Math.random() * 1.1, -0.5 + Math.random() * 1.2, Math.sin(angle) * Math.random() * 1.1);
    cloud.add(puff);
    puffs.push(puff);
  }
  cloud.position.set(position.x, 0, position.z);
  cloud.userData = { life: 0.9, age: 0, puffs };
  scene.add(cloud);
  chestSmokeEffects.push(cloud);
}

function updateChestSmoke(delta) {
  for (let i = chestSmokeEffects.length - 1; i >= 0; i--) {
    const cloud = chestSmokeEffects[i];
    cloud.userData.life -= delta;
    cloud.userData.age += delta;
    const progress = 1 - cloud.userData.life / 0.9;
    cloud.userData.puffs.forEach((puff, puffIndex) => {
      puff.position.y += delta * (0.8 + (puffIndex % 3) * 0.25);
      puff.material.opacity = Math.max(0, (1 - progress) * 0.42);
      puff.scale.setScalar(1 + progress * 1.8);
    });
    if (cloud.userData.life > 0) continue;
    scene.remove(cloud);
    cloud.traverse((part) => {
      part.geometry?.dispose();
      part.material?.dispose();
    });
    chestSmokeEffects.splice(i, 1);
  }
}

function spawnChest(count = 1) {
  let spawned = 0;
  for (let chestIndex = 0; chestIndex < count; chestIndex++) {
    let position = null;
    for (let attempt = 0; attempt < 80; attempt++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 9 + Math.random() * 12;
      const candidate = player.position.clone().add(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
      if (Math.abs(candidate.x) > 150 || Math.abs(candidate.z) > 150) continue;
      if (staticColliders.some((obstacle) => Math.hypot(candidate.x - obstacle.x, candidate.z - obstacle.z) < obstacle.radius + 2.2)) continue;
      if (chests.some((chest) => Math.hypot(candidate.x - chest.position.x, candidate.z - chest.position.z) < 5)) continue;
      position = candidate;
      break;
    }
    if (!position) continue;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: chestTextures.closed,
      transparent: true,
      alphaTest: 0.04,
      depthWrite: false
    }));
    sprite.scale.set(3.8, 3.2, 1);
    sprite.position.set(position.x, 0.1, position.z);
    scene.add(sprite);
    chests.push({ sprite, position, opened: false, openTimer: 0, outcome: null });
    spawned++;
  }
  if (spawned) showGameNotification(`${spawned} baús de suprimentos apareceram`, 'info');
}

function getNearbyChest() {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const chest of chests) {
    if (chest.opened) continue;
    const distance = Math.hypot(chest.position.x - player.position.x, chest.position.z - player.position.z);
    if (distance < nearestDistance) {
      nearest = chest;
      nearestDistance = distance;
    }
  }
  return nearestDistance < 3.6 ? nearest : null;
}

function interactWithChest() {
  const chest = getNearbyChest();
  if (!chest) return;
  chest.opened = true;
  chest.openTimer = 0.65;
  const roll = Math.random();
  chest.outcome = roll < 0.5 ? 'scrap' : roll < 0.75 ? 'ammo' : roll < 0.925 ? 'perk' : 'mimic';
  chest.sprite.material.map = chestTextures.open;
  chest.sprite.material.needsUpdate = true;
  playOneShot(localGameSounds.chestOpen, 1);
  if (chest.outcome === 'mimic') spawnChestSmoke(chest.position);
}

function updateChests(delta) {
  for (let i = chests.length - 1; i >= 0; i--) {
    const chest = chests[i];
    if (!chest.opened) continue;
    chest.openTimer -= delta;
    if (chest.openTimer > 0) continue;
    const position = chest.position.clone();
    scene.remove(chest.sprite);
    chest.sprite.material.dispose();
    chests.splice(i, 1);

    if (chest.outcome === 'mimic') {
      spawnEnemy('mimic', position, { exactPosition: true });
      playOneShot(localGameSounds.mimicCry, 1);
    } else if (chest.outcome === 'scrap') {
      const amount = Math.floor(Math.random() * 8) + 5;
      spawnChestPickupAt(position, 'scrap', amount);
      showGameNotification(`Baú: +${amount} sucata no chão`);
    } else if (chest.outcome === 'ammo') {
      const count = Math.floor(Math.random() * 2) + 3;
      for (let drop = 0; drop < count; drop++) {
        const kind = randomAmmoPickupKind();
        const offset = new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2);
        spawnPickupAt(position.clone().add(offset), kind, true);
      }
      showGameNotification(`Baú: ${count} caixas de munição no chão`, 'info');
    } else {
      const reward = Math.floor(Math.random() * 4);
      if (reward === 0) {
        damageMultiplier *= 1.25;
        showGameNotification('Bônus do baú: +25% de dano');
      } else if (reward === 1) {
        moveSpeedMultiplier *= 1.2;
        showGameNotification('Bônus do baú: +20% de velocidade');
      } else if (reward === 2) {
        reloadDuration *= 0.8;
        showGameNotification('Bônus do baú: recarga mais rápida');
      } else {
        playerHealth = Math.min(maxPlayerHealth, playerHealth + 2);
        updateHealthDisplay();
        showGameNotification('Bônus do baú: +2 vida');
      }
    }
  }
}

function dropLootForEnemy(type, position) {
  if (bossEnemyTypes.has(type)) {
    // chefes sempre deixam um bom saque
    spawnPickupAt(position.clone().add(new THREE.Vector3(-1.2, 0, 0)), 'medkit');
    spawnPickupAt(position.clone().add(new THREE.Vector3(1.2, 0, 0)), randomAmmoPickupKind());
    return;
  }
  const dropChance = {
    walker: 0.18, dodger: 0.28, rusher: 0.38, shooter: 0.45,
    bloater: 0.52, tank: 0.72, wolf_minion: 0.35
  }[type] ?? 0.30;
  if (Math.random() > dropChance) return;
  const medkitChance = type === 'tank' || type === 'bloater' ? 0.38 : type === 'shooter' ? 0.30 : 0.20;
  const kind = Math.random() < medkitChance ? 'medkit' : randomAmmoPickupKind();
  spawnPickupAt(position, kind);
}

function updatePickups(delta) {
  const t = performance.now() / 500;
  for (let i = pickups.length - 1; i >= 0; i--) {
    const pickup = pickups[i];
    if (!pickup.userData.noBob) {
      pickup.position.y = pickup.userData.baseY + Math.sin(t + pickup.userData.bobOffset) * 0.15;
    }
    pickup.rotation.y += delta * 0.6;

    if (pickup.position.distanceTo(player.position) < 2.4) {
      collectPickup(pickup.userData.kind, pickup);
      scene.remove(pickup);
      pickups.splice(i, 1);
    }
  }
}

function spawnTimedItem() {
  const angle = Math.random() * Math.PI * 2;
  const distance = 8 + Math.random() * 18;
  const position = player.position.clone().add(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
  const kind = Math.random() < 0.5 ? 'medkit' : randomAmmoPickupKind();
  spawnPickupAt(position, kind);
  if (messageElement) messageElement.textContent = 'Um item apareceu no mapa!';
}

function updateTimedItems(delta) {
  itemSpawnTimer += delta;
  if (itemSpawnTimer >= nextItemAt) {
    itemSpawnTimer = 0;
    spawnTimedItem();
  }
}

function drawForestMinimap() {
  const canvas = document.getElementById('forest-minimap');
  if (!canvas || !player) return;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 150, 150);
  context.fillStyle = 'rgba(25, 66, 29, .7)';
  context.fillRect(0, 0, 150, 150);
  const scale = 2.4;
  const center = 75;
  enemies.forEach(enemy => {
    const dx = (enemy.position.x - player.position.x) / scale;
    const dz = (enemy.position.z - player.position.z) / scale;
    if (Math.abs(dx) > 70 || Math.abs(dz) > 70) return;
    const isElite = bossEnemyTypes.has(enemy.userData.type) || enemy.userData.type === 'mimic';
    context.fillStyle = isElite ? '#ffcf55' : '#e85b4f';
    context.beginPath(); context.arc(center + dx, center + dz, isElite ? 5 : 3, 0, Math.PI * 2); context.fill();
  });
  context.save();
  context.translate(center, center);
  context.rotate(-player.rotation.y);
  context.shadowColor = '#b8ff78';
  context.shadowBlur = 14;
  context.strokeStyle = '#efffd6';
  context.lineWidth = 2;
  context.beginPath(); context.arc(0, 0, 9, 0, Math.PI * 2); context.stroke();
  context.fillStyle = '#b8ff78';
  context.beginPath();
  context.moveTo(0, -15); context.lineTo(-8, 9); context.lineTo(0, 5); context.lineTo(8, 9); context.closePath(); context.fill();
  context.restore();
}

function collectPickup(kind, pickup = null) {
  if (kind === 'medkit') {
    const previousHealth = playerHealth;
    playerHealth = Math.min(maxPlayerHealth, playerHealth + 2);
    updateHealthDisplay();
    showHealEffect();
    const healed = Math.round(playerHealth - previousHealth);
    showGameNotification(healed > 0 ? `+${healed} vida (kit médico)` : 'Vida já está cheia', healed > 0 ? 'reward' : 'info');
  } else if (kind === 'scrap') {
    const amount = pickup?.userData.value || 0;
    scrap += amount;
    updateScrapDisplay();
    showGameNotification(`+${amount} sucata`);
    playOneShot(localGameSounds.pickup, 0.9);
  } else if (kind === 'greatsword') {
    unlockedWeapons.add('greatsword');
    weaponAmmo.greatsword = 999;
    switchWeapon('greatsword');
    playOneShot(localGameSounds.frogInteract, 1);
    showGameNotification('Greatsword coletada — tecla 9');
  } else {
    const targetWeaponId = kind;
    const before = reserveAmmoByWeapon[targetWeaponId] ?? 0;
    reserveAmmoByWeapon[targetWeaponId] = Math.min(getReserveAmmoLimit(targetWeaponId), before + pickupDefs[kind].amount);
    const added = reserveAmmoByWeapon[targetWeaponId] - before;
    updateAmmoDisplay();
    showGameNotification(added > 0 ? `+${added} ${pickupDefs[kind].label}` : 'Reserva de munição cheia', added > 0 ? 'reward' : 'info');
  }
  playOneShot(kind === 'medkit' ? itemGetSound : localGameSounds.pickup, 0.9);
}

/* ---------- HUD ---------- */
function updateAmmoDisplay() {
  const weapon = weaponDefs[currentWeaponId];
  if (ammoIndicatorElement) {
    ammoIndicatorElement.dataset.weapon = currentWeaponId;
    ammoIndicatorElement.textContent = weapon.melee
      ? `${weapon.name}: corpo a corpo`
      : `${weapon.name}: ${ammo}/${weapon.clipSize} · Reserva: ${getCurrentReserveAmmo()}/${getReserveAmmoLimit(currentWeaponId)}`;
  }
}

function updateWeaponAbilityIndicators() {
  const weapon = weaponDefs[currentWeaponId];
  const isTrackedSword = currentWeaponId === 'doomSword' || currentWeaponId === 'greatsword';
  if (!weaponAbilityIndicatorsElement) return;
  weaponAbilityIndicatorsElement.hidden = !isTrackedSword;
  if (!isTrackedSword) return;

  const progress = 1 - Math.min(1, Math.max(0, weaponSpecialCooldownTimer) / weapon.fireCooldown);
  weaponSpecialCooldownFillElement.style.transform = `scaleX(${progress})`;
  weaponSpecialCooldownValueElement.textContent = weaponSpecialCooldownTimer > 0
    ? `${weaponSpecialCooldownTimer.toFixed(1)}s`
    : 'Pronto';
}

function updateScrapDisplay() {
  if (scrapElement) scrapElement.textContent = `Sucata: ${scrap}`;
  if (shopScrapValueElement) shopScrapValueElement.textContent = `${scrap}`;
}

function updateHealthDisplay() {
  const currentHealth = Math.max(0, Math.round(playerHealth));
  const maxHealth = Math.max(1, Math.round(maxPlayerHealth));
  const ratio = Math.max(0, Math.min(1, playerHealth / maxHealth));
  const healthColor = ratio <= 0.3 ? '#ff4e4e' : ratio <= 0.6 ? '#ffb238' : '#7afc8a';

  if (healthValueElement) {
    healthValueElement.textContent = `${currentHealth}/${maxHealth}`;
  }

  if (healthBarElement) {
    healthBarElement.setAttribute('aria-valuemax', `${maxHealth}`);
    healthBarElement.setAttribute('aria-valuenow', `${currentHealth}`);
  }
  if (healthFillElement) {
    healthFillElement.style.width = `${ratio * 100}%`;
    healthFillElement.style.background = `linear-gradient(90deg, ${healthColor} 0%, ${healthColor} 100%)`;
    healthFillElement.style.boxShadow = `0 0 18px ${healthColor}66`;
  }
}

function getRegularEnemiesForWave(wave) {
  const extraAfterWave10 = Math.floor(Math.max(0, wave - 10) / 2);
  const baseCount = Math.min(wave + 2 + extraAfterWave10, 100);
  return wave % 10 === 0 ? Math.max(0, baseCount - 1) : baseCount;
}

function getWaveAbilityDelay(minimum, maximum, pressureScale = 0.06) {
  const postWavePressure = Math.max(0, currentWave - 15);
  return Math.max(0.8, minimum + Math.random() * (maximum - minimum) - postWavePressure * pressureScale);
}

function getBossRank(wave = currentWave) {
  return Math.max(1, Math.floor(wave / 5));
}

function getBossDifficultyScale(wave = currentWave) {
  return 0.7 + (getBossRank(wave) - 1) * 0.15;
}

function getBossAbilityDelay(data, minimum, maximum, pressureScale = 0.06) {
  const rank = data.bossRank || 1;
  const cooldownScale = Math.max(0.65, 1.18 - (rank - 1) * 0.06);
  return getWaveAbilityDelay(minimum, maximum, pressureScale) * cooldownScale;
}

function getWaveSpawnInterval(wave) {
  return Math.max(0.75, 1.45 - Math.max(0, wave - 1) * 0.025);
}

function getWaveEnemyType(wave) {
  const postWavePressure = Math.max(0, wave - 15);
  const weights = [
    ['walker', Math.max(1, 12 - wave * 0.55)],
    ['wolf_minion', wave >= 9 ? Math.min(3.5, 1.1 + postWavePressure * 0.08) : 0],
    ['dodger', wave >= 3 ? Math.max(1, 5 - wave * 0.08) + postWavePressure * 0.045 : 0],
    ['rusher', wave >= 5 ? Math.max(1, 5 - wave * 0.07) + postWavePressure * 0.05 : 0],
    ['tank', wave >= 7 ? Math.max(1, 4.5 - wave * 0.05) + postWavePressure * 0.07 : 0],
    ['shooter', wave >= 10 ? Math.max(1, 4.5 - wave * 0.04) + postWavePressure * 0.075 : 0],
    ['bloater', wave >= 10 ? Math.max(1, 3.5 - wave * 0.03) + postWavePressure * 0.05 : 0],
  ];
  const available = weights.filter(([, weight]) => weight > 0);
  const totalWeight = available.reduce((total, [, weight]) => total + weight, 0);
  let roll = Math.random() * totalWeight;
  for (const [type, weight] of available) {
    roll -= weight;
    if (roll <= 0) return type;
  }
  return 'walker';
}

function updateWaveDisplay() {
  if (waveElement) waveElement.textContent = `Onda: ${currentWave}`;
}

function showForestWaveBanner(title, subtitle) {
  if (!waveBannerElement || !waveBannerTitleElement || !waveBannerSubElement) return;
  waveBannerTitleElement.textContent = title;
  waveBannerSubElement.textContent = subtitle;
  waveBannerElement.classList.add('visible');
  clearTimeout(showForestWaveBanner.timer);
  showForestWaveBanner.timer = setTimeout(() => {
    waveBannerElement.classList.remove('visible');
  }, 2600);
}

const randomizedBossTypes = ['wolf', 'necromancer', 'parasiteBoss', 'electrician', 'entity'];
const bossNames = { boss: 'Chefe Brutamontes', necromancer: 'Necromante', wolf: 'Lobo Infernal', parasiteBoss: 'O Hospedeiro', electrician: 'Eletricista', entity: 'Demônio da Fumaça', mimic: 'Mimic' };
function updateBossHealthDisplay() {
  const boss = enemies.find((enemy) =>
    enemy.userData.alive && (bossEnemyTypes.has(enemy.userData.type) || enemy.userData.type === 'mimic')
  );
  if (!boss) {
    bossHealthContainerElement.hidden = true;
    return;
  }

  const { type, health, maxHealth } = boss.userData;
  const maximum = Math.max(1, Math.round(maxHealth));
  const current = Math.max(0, Math.min(maximum, Math.ceil(health)));
  const ratio = Math.max(0, Math.min(1, health / maximum));
  bossHealthNameElement.textContent = type === 'wolf' && boss.userData.wolfTransformed
    ? 'Lobisomem'
    : bossNames[type] || 'Chefe';
  bossHealthValueElement.textContent = `${current} / ${maximum}`;
  bossHealthFillElement.style.width = `${ratio * 100}%`;
  bossHealthBarElement.setAttribute('aria-valuemax', `${maximum}`);
  bossHealthBarElement.setAttribute('aria-valuenow', `${current}`);
  bossHealthContainerElement.hidden = false;
}
let randomizedBossOrder = [];
let lastRandomBossType = null;

function resetBossOrder() {
  randomizedBossOrder = [];
  lastRandomBossType = null;
}

function shuffleBossTypes() {
  const shuffled = [...randomizedBossTypes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const index = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[index]] = [shuffled[index], shuffled[i]];
  }
  if (shuffled.length > 1 && shuffled[0] === lastRandomBossType) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

function selectBossForWave(wave) {
  if (wave === 5) return 'boss';
  if (randomizedBossOrder.length === 0) randomizedBossOrder = shuffleBossTypes();
  lastRandomBossType = randomizedBossOrder.shift();
  return lastRandomBossType;
}

let currentBossType = 'boss';

function startWave() {
  let scientistAppearsNow = false;
  spawnTimer = 0;
  spawnInterval = getWaveSpawnInterval(currentWave);
  bossThisWave = currentWave % 5 === 0;
  bossSpawned = false;
  enemiesThisWave = 0;
  enemiesToSpawnThisWave = getRegularEnemiesForWave(currentWave);
  if (currentWave % 5 === 0) spawnChest(2);
  updateWaveDisplay();
  if (currentWave >= SCIENTIST_APPEAR_WAVE && !scientistNpc && !scientistQuestDone) {
    spawnScientist();
    scientistAppearsNow = true;
  }
  if (bossThisWave) {
    currentBossType = selectBossForWave(currentWave);
    showForestWaveBanner('CHEFE SE APROXIMA', `${bossNames[currentBossType]} · ONDA ${currentWave}`);
    if (messageElement) {
      messageElement.textContent = `Onda ${currentWave}! ${enemiesToSpawnThisWave} zumbis + ${bossNames[currentBossType]}.`;
    }
    triggerBossChoice();
  } else {
    showForestWaveBanner(`ONDA ${currentWave}`, 'Sobreviva à horda');
    if (messageElement) messageElement.textContent = `Onda ${currentWave}! ${enemiesToSpawnThisWave} zumbis.`;
  }
  if (currentWave >= 15 && messageElement) {
    messageElement.textContent += ' A horda está ficando mais rápida e resistente.';
  }
  if (scientistAppearsNow && messageElement) {
    messageElement.textContent += ' Um soldado aguarda perto do carro com uma missão.';
  }
}

/* ---------- Combate ---------- */
function reloadWeapon() {
  const weapon = weaponDefs[currentWeaponId];
  if (weapon.melee) return;
  if (isReloading || ammo >= weapon.clipSize || gameOver) return;
  if (keys.shift && (keys.w || keys.a || keys.s || keys.d)) {
    if (messageElement) messageElement.textContent = 'Pare de correr para recarregar!';
    return;
  }
  if (getCurrentReserveAmmo() <= 0) {
    if (messageElement) messageElement.textContent = 'Sem munição de reserva! Ande sobre caixas de munição.';
    return;
  }
  ammo = weaponAmmo[currentWeaponId];
  isReloading = true;
  reloadingWeaponId = currentWeaponId;
  reloadTimer = 0;
  playOneShot(localGameSounds.reloadAlt, 0.9);
  pendingReloadAmount = Math.min(weapon.clipSize - ammo, getCurrentReserveAmmo());
  if (messageElement) messageElement.textContent = 'Recarregando arma...';
  updateAmmoDisplay();
}

function meleeAttack(weapon) {
  fireCooldownTimer = weapon.meleeCooldown || weapon.fireCooldown;
  weaponAttackDuration = ['doomSword', 'greatsword'].includes(weapon.id)
    ? weapon.meleeCooldown * 1.2
    : 0.32;
  weaponAttackTimer = weaponAttackDuration;
  playOneShot(knifeSwingSound, 0.85);
  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();
  camera.getWorldPosition(origin);
  camera.getWorldDirection(direction).normalize();

  let hitSomething = false;
  for (let j = enemies.length - 1; j >= 0; j--) {
    const enemy = enemies[j];
    if (!enemy.userData.alive) continue;
    const toEnemy = enemy.position.clone().sub(origin);
    const dist = toEnemy.length();
    if (dist > weapon.meleeRange) continue;
    if (toEnemy.normalize().dot(direction) < weapon.meleeAngle) continue; // precisa estar de frente
    hitSomething = true;
    applyDamageToEnemy(enemy, j, weapon.damage * damageMultiplier);
  }
  if (secretFrog && !frogDead) {
    const toFrog = secretFrog.position.clone().sub(origin).setY(0);
    const frogDirection = direction.clone().setY(0).normalize();
    const frogDistance = toFrog.length();
    if (frogDistance <= weapon.meleeRange && frogDistance > 0 && toFrog.normalize().dot(frogDirection) >= weapon.meleeAngle) {
      hitSomething = true;
      damageSecretFrog(weapon.damage * damageMultiplier);
    }
  }
  if (messageElement && !hitSomething) messageElement.textContent = 'Canivete (corpo a corpo) — chegue mais perto do zumbi.';

}

function spawnMuzzleFlash() {
  const flashLight = new THREE.PointLight(0xfff1b8, 3.2, 7, 2);
  flashLight.position.set(0.35, -0.35, -0.6);
  camera.add(flashLight);

  const flashMaterial = new THREE.SpriteMaterial({ color: 0xfff1b8, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthTest: false });
  const flashSprite = new THREE.Sprite(flashMaterial);
  flashSprite.scale.set(0.55, 0.55, 1);
  flashSprite.position.set(0.35, -0.35, -0.65);
  camera.add(flashSprite);

  muzzleFlashes.push({ light: flashLight, sprite: flashSprite, life: 0.06, maxLife: 0.06 });
}

let weaponAttackTimer = 0;
let weaponAttackDuration = 0.32;

function animateWeapon(delta) {
  if (!playerGun?.userData.basePosition) return;
  weaponAnimationTime += delta;
  const moving = keys.w || keys.a || keys.s || keys.d || Math.abs(touchMoveVector.x) > 0.01 || Math.abs(touchMoveVector.z) > 0.01;
  const bob = moving ? Math.sin(weaponAnimationTime * 8) * 0.018 : 0;
  const base = playerGun.userData.basePosition;
  weaponAttackTimer = Math.max(0, weaponAttackTimer - delta);
  const attackProgress = weaponAttackTimer > 0 ? 1 - weaponAttackTimer / weaponAttackDuration : 0;
  const swing = attackProgress > 0 ? Math.sin(attackProgress * Math.PI) : 0;
  weaponRecoil += (0 - weaponRecoil) * Math.min(1, delta * 12);
  playerGun.position.set(base.x + Math.sin(weaponAnimationTime * 4) * 0.006 - swing * 0.42, base.y + bob + swing * 0.16, base.z + weaponRecoil + swing * 0.18);
  playerGun.rotation.z = Math.sin(weaponAnimationTime * 3) * 0.012 + swing * 0.9;
  playerGun.rotation.x = -swing * 0.18;
}

function shoot() {
  if (gameOver || isReloading || paused || !gameStarted || fireCooldownTimer > 0) return;
  const weapon = weaponDefs[currentWeaponId];

  if (weapon.melee) {
    weaponRecoil += 0.025;
    meleeAttack(weapon);
    return;
  }

  if (ammo <= 0) {
    // Clique com o botão de tiro também inicia a recarga quando o pente está vazio.
    reloadWeapon();
    return;
  }
  ammo -= 1;
  weaponAmmo[currentWeaponId] = ammo;
  fireCooldownTimer = weapon.fireCooldown;
  weaponRecoil += weapon.melee ? 0.025 : 0.09;
  updateAmmoDisplay();
  playOneShot(weapon.id === 'shotgun12' ? localGameSounds.shotHeavy : localGameSounds.shot, weapon.id === 'smg' ? 0.24 : 0.28);
  spawnMuzzleFlash();

  const origin = new THREE.Vector3();
  const baseDirection = new THREE.Vector3();
  camera.getWorldPosition(origin);
  camera.getWorldDirection(baseDirection).normalize();

  if (weapon.id === 'grenadeLauncher') {
    const grenade = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x4f643c, emissive: 0x8c431e, emissiveIntensity: 0.6, roughness: 0.55 })
    );
    const light = new THREE.PointLight(0xff8b35, 1.3, 4);
    grenade.add(light);
    grenade.position.copy(origin).addScaledVector(baseDirection, 1.3);
    grenade.userData = {
      velocity: baseDirection.multiplyScalar(28).add(new THREE.Vector3(0, 3, 0)),
      fuse: 2.5,
      damage: weapon.damage * damageMultiplier,
    };
    scene.add(grenade);
    grenadeProjectiles.push(grenade);
    return;
  }

  const pelletCount = weapon.pellets || 1;
  for (let p = 0; p < pelletCount; p++) {
    const direction = baseDirection.clone();
    if (weapon.spread) {
      direction.x += (Math.random() - 0.5) * weapon.spread;
      direction.y += (Math.random() - 0.5) * weapon.spread;
      direction.z += (Math.random() - 0.5) * weapon.spread;
      direction.normalize();
    }
    const bulletGeometry = new THREE.SphereGeometry(0.14, 8, 8);
    const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xfff6d0 });
    const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
    bullet.position.copy(origin).add(direction.clone().multiplyScalar(1.2));
    bullet.userData = { velocity: direction, damage: weapon.damage * damageMultiplier };
    scene.add(bullet);
    bullets.push(bullet);

    // brilho sutil acompanhando o projétil
    const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xfff6c9, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthTest: false }));
    glowSprite.scale.set(0.4, 0.4, 1);
    bullet.add(glowSprite);
  }
}

function applyDamageToEnemy(enemy, index, damage, headshot = false) {
  enemy.userData.health -= damage;
  if (headshot && lifestealLevel > 0) {
    playerHealth = Math.min(maxPlayerHealth, playerHealth + forestPerks.lifesteal * lifestealLevel);
    updateHealthDisplay();
  }
  const ratio = Math.max(0, enemy.userData.health / enemy.userData.maxHealth);
  if (enemy.userData.healthBar) {
    enemy.userData.healthBar.scale.x = ratio;
    enemy.userData.healthBar.position.x = -enemy.userData.healthBarWidth * 0.5 + (enemy.userData.healthBarWidth * ratio) / 2;
    enemy.userData.healthBar.material.color.setHex(ratio < 0.35 ? 0xff4f4f : 0x7eff6d);
  }
  updateBossHealthDisplay();
  if (enemy.userData.health <= 0) {
    enemy.userData.alive = false;
    const deathPosition = enemy.position.clone();
    const deathType = enemy.userData.type;
    if (deathType === 'mimic') {
      playOneShot(localGameSounds.mimicDeath, 1);
      spawnForestBurst(deathPosition, 36, 0x8f352a);
      if (!mimicGreatswordDropped) {
        mimicGreatswordDropped = true;
        spawnChestPickupAt(deathPosition, 'greatsword');
        if (messageElement) messageElement.textContent = 'MIMIC DERROTADO: GREATSWORD NO CHÃO!';
      }
    }
    if (deathType === 'electrician') removeElectricChargesFromOwner(enemy.uuid);
    if (deathType === 'wolf') {
      if (enemy.userData.preyMarkIndicator) {
        scene.remove(enemy.userData.preyMarkIndicator);
        enemy.userData.preyMarkIndicator.geometry.dispose();
        enemy.userData.preyMarkIndicator.material.dispose();
      }
      for (const trail of enemy.userData.bloodTrails) {
        trail.meshes.forEach((mark) => {
          scene.remove(mark);
          mark.geometry.dispose();
          mark.material.dispose();
        });
      }
    }
    if (bloodBurstTypes.has(deathType)) spawnBloodBurst(deathPosition, deathType === 'tank' || bossEnemyTypes.has(deathType));
    if (boneBurstTypes.has(deathType)) spawnBoneBurst(deathPosition, deathType === 'wolf' || deathType === 'wolf_minion');
    if (deathType === 'necromancer') {
      spawnForestBurst(deathPosition, 72, 0x9d45ff);
      spawnForestBurst(deathPosition, 38, 0xd5a4ff);
      spawnBoneBurst(deathPosition, true);
      spawnNecromancerDeathEffect(deathPosition);
    }
    scene.remove(enemy);
    enemies.splice(index, 1);
    updateBossHealthDisplay();
    if (deathType === 'bloater' || deathType === 'jumper') {
      playOneShot(localGameSounds.zombieExplosion, 0.9);
      triggerForestExplosion(deathPosition, deathType === 'jumper' ? 6.2 : 7);
    }
    if (deathType === 'shooter') {
      spawnAcidDeathSplash(deathPosition);
      spawnAcidPuddle(deathPosition);
    }
    score += deathType === 'mimic' ? 90 : deathType === 'boss' || deathType === 'parasiteBoss' || deathType === 'electrician' ? 100 : deathType === 'jumper' ? 18 : deathType === 'tank' ? 20 : 10;
    if (questAccepted && !questDone) {
      questKills++;
      if (QUEST_ELITE_TYPES.has(deathType)) questEliteKills++;
      if (questKills >= QUEST_TARGET && questEliteKills >= QUEST_ELITE_TARGET) completeNpcQuest();
    }
    if (scientistQuestAccepted && !scientistQuestDone) {
      scientistQuestKills++;
      if (scientistQuestKills >= SCIENTIST_QUEST_TARGET) completeScientistQuest();
    }
    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const scrapDrop =
      deathType === 'mimic' ? randomInt(8, 12) :
      deathType === 'walker' ? randomInt(1, 3) :
      deathType === 'dodger' ? randomInt(2, 5) :
      deathType === 'rusher' ? randomInt(3, 6) :
      deathType === 'tank' ? randomInt(4, 8) :
      deathType === 'jumper' ? randomInt(3, 5) :
      deathType === 'boss' ? 12 + getBossRank(currentWave) * 4 :
      deathType === 'parasiteBoss' || deathType === 'electrician' || deathType === 'necromancer' ? 25 + getBossRank(currentWave) * 5 :
      deathType === 'wolf' ? 18 + getBossRank(currentWave) * 4 :
      deathType === 'wolf_minion' ? 5 :
      2;
    scrap += scrapDrop;
    if (scoreElement) scoreElement.textContent = `Pontuação: ${score}`;
    updateScrapDisplay();
    if (deathType === 'boss' && !unlockedWeapons.has('shotgun12')) {
      unlockedWeapons.add('shotgun12');
      weaponAmmo.shotgun12 = weaponDefs.shotgun12.clipSize;
      reserveAmmoByWeapon.shotgun12 = Math.min(getReserveAmmoLimit('shotgun12'), 8);
      updateShopButtons();
      showGameNotification('Nova arma: 12 desbloqueada — tecla 3');
    }
    dropLootForEnemy(deathType, deathPosition);
    playOneShot(zombieDeathSound, 0.85); // som de zumbi só toca quando ele morre
    return true;
  }
  if (headshot) showForestCombatFeedback(`HEADSHOT! +${Math.round(damage)}`, true);
  spawnForestBurst(enemy.position, headshot ? 8 : 4, headshot ? 0xffd34e : 0xb62d2d);
  return false;
}

function showGameNotification(text, tone = 'reward') {
  if (!gameNotificationElement) return;
  gameNotificationElement.textContent = text;
  gameNotificationElement.dataset.tone = tone;
  gameNotificationElement.classList.add('visible');
  clearTimeout(showGameNotification.timer);
  showGameNotification.timer = setTimeout(() => {
    gameNotificationElement.classList.remove('visible');
  }, 1900);
}

function showForestCombatFeedback(text, critical = false) {
  const element = document.getElementById('forest-combat-feedback');
  if (!element) return;
  element.textContent = text;
  element.style.color = critical ? '#ffcf55' : '#fff4c0';
  element.style.fontSize = critical ? '24px' : '18px';
  clearTimeout(showForestCombatFeedback.timer);
  showForestCombatFeedback.timer = setTimeout(() => { element.textContent = ''; }, 260);
}

const forestParticles = [];
const necromancerDeathEffects = [];
const maxForestParticles = 900;
const bloodBurstTypes = new Set(['walker', 'rusher', 'dodger', 'tank', 'jumper', 'boss']);
const boneBurstTypes = new Set(['skeleton', 'wolf', 'wolf_minion']);

function spawnForestBurst(position, count, color) {
  for (let i = 0; i < count; i += 1) {
    if (forestParticles.length >= maxForestParticles) {
      const oldest = forestParticles.shift();
      disposeForestParticle(oldest);
    }
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.045 + Math.random() * 0.055, 6, 5),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthWrite: false })
    );
    particle.position.copy(position).add(new THREE.Vector3(0, 1.1, 0));
    scene.add(particle);
    const duration = 0.5 + Math.random() * 0.5;
    forestParticles.push({
      mesh: particle,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 4 + 0.5, (Math.random() - 0.5) * 5),
      life: duration,
      duration,
    });
  }
}

function spawnBloodBurst(position, heavy = false) {
  const count = heavy ? 112 : 72;
  const bloodColors = [0x8f0714, 0xc51625, 0x5e0610, 0xe02d35];
  for (let i = 0; i < count; i += 1) {
    if (forestParticles.length >= maxForestParticles) {
      const oldest = forestParticles.shift();
      disposeForestParticle(oldest);
    }
    const radius = 0.045 + Math.random() * (heavy ? 0.11 : 0.075);
    const aspect = new THREE.Vector3(0.8, 1.35 + Math.random() * 1.6, 0.8);
    const drop = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 7, 6),
      new THREE.MeshBasicMaterial({
        color: bloodColors[Math.floor(Math.random() * bloodColors.length)],
        transparent: true,
        opacity: 1,
        depthWrite: false
      })
    );
    const angle = Math.random() * Math.PI * 2;
    const horizontalSpeed = (heavy ? 2.5 : 1.8) + Math.random() * (heavy ? 5 : 3.7);
    drop.position.copy(position).add(new THREE.Vector3(0, 1.2 + Math.random() * 1.1, 0));
    drop.userData.particleAspect = aspect;
    drop.scale.copy(aspect);
    scene.add(drop);
    const duration = 0.65 + Math.random() * 0.7;
    forestParticles.push({
      mesh: drop,
      velocity: new THREE.Vector3(
        Math.cos(angle) * horizontalSpeed,
        1.5 + Math.random() * (heavy ? 6 : 4.5),
        Math.sin(angle) * horizontalSpeed
      ),
      life: duration,
      duration
    });
  }
}

function spawnBoneBurst(position, heavy = false) {
  const count = heavy ? 14 : 9;
  for (let i = 0; i < count; i += 1) {
    if (forestParticles.length >= maxForestParticles) {
      const oldest = forestParticles.shift();
      disposeForestParticle(oldest);
    }
    const bone = new THREE.Group();
    const boneMaterial = new THREE.MeshStandardMaterial({
      color: i % 3 === 0 ? 0xd9cfad : 0xf0e8cf,
      roughness: 0.88,
      flatShading: true,
      emissive: 0x272113,
      emissiveIntensity: 0.18,
      transparent: true,
      opacity: 1,
      depthWrite: false
    });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.5, 6), boneMaterial);
    bone.add(shaft);
    for (const end of [-1, 1]) {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 7, 5), boneMaterial);
      joint.position.y = end * 0.22;
      bone.add(joint);
    }
    const angle = Math.random() * Math.PI * 2;
    const horizontalSpeed = (heavy ? 2.2 : 1.5) + Math.random() * (heavy ? 4 : 2.8);
    bone.position.copy(position).add(new THREE.Vector3(0, 1 + Math.random(), 0));
    bone.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    const duration = 1 + Math.random() * 0.8;
    scene.add(bone);
    forestParticles.push({
      mesh: bone,
      velocity: new THREE.Vector3(Math.cos(angle) * horizontalSpeed, 2.5 + Math.random() * (heavy ? 5 : 3.5), Math.sin(angle) * horizontalSpeed),
      spin: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8),
      life: duration,
      duration
    });
  }
}

function spawnNecromancerDeathEffect(position) {
  const ringGroup = new THREE.Group();
  const purpleRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.11, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xb34dff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  purpleRing.rotation.x = Math.PI / 2;
  ringGroup.add(purpleRing);
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.045, 6, 40),
    new THREE.MeshBasicMaterial({ color: 0xe1a1ff, transparent: true, opacity: 0.86, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  innerRing.rotation.x = Math.PI / 2;
  ringGroup.add(innerRing);
  const glow = new THREE.PointLight(0xa93cff, 6, 12, 1.7);
  glow.position.y = 1.2;
  ringGroup.add(glow);
  ringGroup.position.set(position.x, -1.42, position.z);
  scene.add(ringGroup);
  necromancerDeathEffects.push({ group: ringGroup, purpleRing, innerRing, glow, life: 0.9, duration: 0.9 });
}

function updateNecromancerDeathEffects(delta) {
  for (let i = necromancerDeathEffects.length - 1; i >= 0; i -= 1) {
    const effect = necromancerDeathEffects[i];
    effect.life -= delta;
    const progress = 1 - Math.max(0, effect.life) / effect.duration;
    const fade = Math.max(0, 1 - progress);
    effect.purpleRing.scale.setScalar(0.3 + progress * 4.2);
    effect.innerRing.scale.setScalar(0.3 + progress * 2.6);
    effect.purpleRing.material.opacity = fade * 0.95;
    effect.innerRing.material.opacity = fade * 0.85;
    effect.glow.intensity = fade * 6;
    if (effect.life <= 0) {
      scene.remove(effect.group);
      effect.group.traverse((part) => {
        if (part.geometry) part.geometry.dispose();
        if (part.material) part.material.dispose();
      });
      necromancerDeathEffects.splice(i, 1);
    }
  }
}

function spawnAcidDeathSplash(position) {
  spawnForestBurst(position, 64, 0x68ff26);
  spawnForestBurst(position, 30, 0xd9ff63);
  spawnForestBurst(position, 18, 0x218e28);
  for (const particle of forestParticles.slice(-112)) {
    if (particle.mesh.material && particle.mesh.material.color) {
      particle.velocity.y += 2.4 + Math.random() * 2;
      particle.duration += 0.35;
      particle.life += 0.35;
      particle.mesh.scale.multiplyScalar(1.25);
    }
  }
}

function updateForestParticles(delta) {
  for (let i = forestParticles.length - 1; i >= 0; i--) {
    const particle = forestParticles[i];
    particle.life -= delta;
    particle.velocity.y -= 7 * delta;
    particle.mesh.position.addScaledVector(particle.velocity, delta);
    const fade = Math.max(0, particle.life / particle.duration);
    particle.mesh.traverse((part) => {
      if (!part.material) return;
      const materials = Array.isArray(part.material) ? part.material : [part.material];
      materials.forEach((material) => {
        if ('opacity' in material) {
          material.transparent = true;
          material.opacity = fade;
        }
      });
    });
    const scale = 0.45 + fade * 0.55;
    const aspect = particle.mesh.userData.particleAspect;
    if (aspect) particle.mesh.scale.set(aspect.x * scale, aspect.y * scale, aspect.z * scale);
    else particle.mesh.scale.setScalar(scale);
    if (particle.spin) {
      particle.mesh.rotation.x += particle.spin.x * delta;
      particle.mesh.rotation.y += particle.spin.y * delta;
      particle.mesh.rotation.z += particle.spin.z * delta;
    }
    if (particle.life <= 0) {
      disposeForestParticle(particle);
      forestParticles.splice(i, 1);
    }
  }
}

function disposeForestParticle(particle) {
  scene.remove(particle.mesh);
  particle.mesh.traverse((part) => {
    if (part.geometry) part.geometry.dispose();
    if (part.material) {
      if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
      else part.material.dispose();
    }
  });
}

const doomCraterEffects = [];

function spawnDoomCrater(position) {
  const group = new THREE.Group();
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8138, transparent: true, opacity: 0.95,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 10, 64), ringMaterial);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.08;
  ring.scale.setScalar(0.1);
  group.add(ring);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.045, 7, 48),
    new THREE.MeshBasicMaterial({ color: 0xb8ff63, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = 0.1;
  innerRing.scale.setScalar(0.1);
  group.add(innerRing);

  const scorch = new THREE.Mesh(
    new THREE.CircleGeometry(1, 48),
    new THREE.MeshBasicMaterial({ color: 0x25170f, transparent: true, opacity: 0.5, depthWrite: false })
  );
  scorch.rotation.x = -Math.PI / 2;
  scorch.position.y = 0.015;
  scorch.scale.setScalar(0.1);
  group.add(scorch);

  const cracks = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.16;
    const length = 4.2 + Math.random() * 2.2;
    const bend = (Math.random() - 0.5) * 0.8;
    const points = [
      new THREE.Vector3(Math.cos(angle) * 0.4, 0.045, Math.sin(angle) * 0.4),
      new THREE.Vector3(Math.cos(angle + bend) * length * 0.62, 0.045, Math.sin(angle + bend) * length * 0.62),
      new THREE.Vector3(Math.cos(angle - bend * 0.35) * length, 0.045, Math.sin(angle - bend * 0.35) * length)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: i % 3 === 0 ? 0xb9ff66 : 0xff7b3c,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const crack = new THREE.Line(geometry, material);
    group.add(crack);
    cracks.push(crack);
  }

  const rocks = [];
  for (let i = 0; i < 14; i += 1) {
    const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.25;
    const size = 0.18 + Math.random() * 0.28;
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(size, 0),
      new THREE.MeshStandardMaterial({
        color: i % 3 === 0 ? 0x71805a : 0x51483b,
        roughness: 1,
        flatShading: true,
        emissive: i % 4 === 0 ? 0x38200d : 0x10130c,
        emissiveIntensity: 0.35
      })
    );
    rock.position.set(Math.cos(angle) * (0.6 + Math.random() * 1.2), 0.2, Math.sin(angle) * (0.6 + Math.random() * 1.2));
    rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    group.add(rock);
    rocks.push({
      mesh: rock,
      velocity: new THREE.Vector3(Math.cos(angle) * (2.2 + Math.random() * 3.6), 4.2 + Math.random() * 3.5, Math.sin(angle) * (2.2 + Math.random() * 3.6)),
      spin: new THREE.Vector3(Math.random() * 9, Math.random() * 9, Math.random() * 9)
    });
  }

  const dust = new THREE.Mesh(
    new THREE.SphereGeometry(1, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0x8b6041, transparent: true, opacity: 0.22, depthWrite: false })
  );
  dust.position.y = 0.65;
  dust.scale.set(0.8, 0.25, 0.8);
  group.add(dust);

  const light = new THREE.PointLight(0xff7431, 5, 11, 2);
  light.position.y = 1.2;
  group.add(light);
  group.position.set(position.x, -1.5, position.z);
  scene.add(group);
  doomCraterEffects.push({ group, ring, innerRing, scorch, cracks, rocks, dust, light, life: 1.3, duration: 1.3 });
}

function updateDoomCraterEffects(delta) {
  for (let i = doomCraterEffects.length - 1; i >= 0; i -= 1) {
    const effect = doomCraterEffects[i];
    effect.life -= delta;
    const progress = 1 - Math.max(0, effect.life) / effect.duration;
    const fade = Math.max(0, 1 - progress);
    const radius = 0.25 + Math.min(progress * 2.2, 1) * 5.5;
    effect.ring.scale.setScalar(radius);
    effect.innerRing.scale.setScalar(radius * 0.68);
    effect.ring.material.opacity = fade * 0.95;
    effect.innerRing.material.opacity = fade * 0.8;
    effect.scorch.scale.set(radius * 0.78, radius * 0.78, 1);
    effect.scorch.material.opacity = fade * 0.48;
    effect.cracks.forEach((crack) => { crack.material.opacity = fade * 0.85; });
    effect.dust.scale.set(radius * 0.42, 0.3 + progress * 0.9, radius * 0.42);
    effect.dust.material.opacity = fade * 0.2;
    effect.light.intensity = fade * 5;

    for (const debris of effect.rocks) {
      debris.velocity.y -= 10 * delta;
      debris.mesh.position.addScaledVector(debris.velocity, delta);
      debris.mesh.rotation.x += debris.spin.x * delta;
      debris.mesh.rotation.y += debris.spin.y * delta;
      debris.mesh.rotation.z += debris.spin.z * delta;
      debris.mesh.material.opacity = fade;
      debris.mesh.material.transparent = true;
    }

    if (effect.life <= 0) {
      scene.remove(effect.group);
      effect.group.traverse((part) => {
        if (part.geometry) part.geometry.dispose();
        if (part.material) {
          if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
          else part.material.dispose();
        }
      });
      doomCraterEffects.splice(i, 1);
    }
  }
}

const explosionEffects = [];

function spawnExplosionVisual(position, radius) {
  const effect = new THREE.Group();
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(1, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0xfff4b0, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  flash.position.y = 1;
  const fireball = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xff7028, transparent: true, opacity: 0.92, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  fireball.position.y = 1;
  const smoke = new THREE.Mesh(
    new THREE.SphereGeometry(1, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0x33241c, transparent: true, opacity: 0.48, depthWrite: false })
  );
  smoke.position.y = 1.3;
  const shockwave = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.075, 8, 48),
    new THREE.MeshBasicMaterial({ color: 0xffb84f, transparent: true, opacity: 0.98, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  shockwave.rotation.x = Math.PI / 2;
  shockwave.position.y = -1.25;
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.035, 6, 48),
    new THREE.MeshBasicMaterial({ color: 0xff5426, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = -1.22;
  const scorch = new THREE.Mesh(
    new THREE.CircleGeometry(1, 40),
    new THREE.MeshBasicMaterial({ color: 0x20170f, transparent: true, opacity: 0.55, depthWrite: false })
  );
  scorch.rotation.x = -Math.PI / 2;
  scorch.position.y = -1.44;
  effect.add(flash, fireball, smoke, shockwave, outerRing, scorch);
  const light = new THREE.PointLight(0xff7a30, 7, radius * 3, 1.6);
  light.position.y = 1;
  effect.add(light);
  effect.position.copy(position);
  scene.add(effect);
  explosionEffects.push({ group: effect, flash, fireball, smoke, shockwave, outerRing, scorch, light, life: 0.95, duration: 0.95, radius });
}

function updateExplosionEffects(delta) {
  for (let i = explosionEffects.length - 1; i >= 0; i--) {
    const effect = explosionEffects[i];
    effect.life -= delta;
    const progress = 1 - Math.max(0, effect.life) / effect.duration;
    const fade = Math.max(0, 1 - progress);
    const blastScale = 0.35 + Math.sin(Math.min(progress * 1.6, 1) * Math.PI / 2) * effect.radius * 0.55;
    effect.flash.scale.setScalar(blastScale * (1 - Math.min(progress * 2, 0.85)));
    effect.flash.material.opacity = Math.max(0, 1 - progress * 3.5);
    effect.fireball.scale.set(blastScale, blastScale * 0.85, blastScale);
    effect.fireball.material.opacity = fade * 0.92;
    effect.smoke.scale.setScalar(0.5 + progress * effect.radius * 0.72);
    effect.smoke.material.opacity = fade * 0.48;
    effect.shockwave.scale.setScalar(0.2 + progress * effect.radius * 0.85);
    effect.shockwave.material.opacity = fade * 0.98;
    effect.outerRing.scale.setScalar(0.1 + progress * effect.radius * 1.15);
    effect.outerRing.material.opacity = fade * 0.82;
    effect.scorch.scale.setScalar(0.25 + progress * effect.radius * 0.32);
    effect.scorch.material.opacity = Math.min(0.62, progress * 0.9);
    effect.light.intensity = fade * 7;
    if (effect.life <= 0) {
      scene.remove(effect.group);
      effect.group.traverse((part) => {
        if (part.geometry) part.geometry.dispose();
        if (part.material) part.material.dispose();
      });
      explosionEffects.splice(i, 1);
    }
  }
}

const pendingExplosionDamage = [];

function triggerForestExplosion(position, radius = 6, sourceEnemy = null, playerDamage = 2, enemyBaseDamage = 18) {
  playOneShot(localGameSounds.explosion, 1);
  spawnExplosionVisual(position, radius);
  spawnForestBurst(position, 72, 0xff5a21);
  spawnForestBurst(position, 44, 0xffd06a);
  spawnForestBurst(position, 38, 0x4b3024);
  spawnForestBurst(position, 24, 0xfff0b0);
  for (const other of enemies) {
    if (other === sourceEnemy || !other.userData.alive) continue;
    const distance = other.position.distanceTo(position);
    if (distance < radius) {
      const damage = Math.max(2, Math.round(enemyBaseDamage * (1 - distance / radius)));
      pendingExplosionDamage.push({ enemy: other, damage });
    }
  }
  if (secretFrog && !frogDead) {
    const distance = secretFrog.position.distanceTo(position);
    if (distance < radius) damageSecretFrog(Math.max(2, Math.round(enemyBaseDamage * (1 - distance / radius))));
  }
  if (playerDamage > 0 && player.position.distanceTo(position) < radius) damagePlayer(playerDamage);
  showForestCombatFeedback('EXPLOSÃO!', true);
}

function applyPendingExplosionDamage() {
  while (pendingExplosionDamage.length > 0) {
    const { enemy, damage } = pendingExplosionDamage.shift();
    const index = enemies.indexOf(enemy);
    if (index >= 0 && enemy.userData.alive) applyDamageToEnemy(enemy, index, damage);
  }
}

function spawnAcidPuddle(position) {
  const puddle = new THREE.Group();
  const darkPool = new THREE.Mesh(
    new THREE.CircleGeometry(2.8, 40),
    new THREE.MeshBasicMaterial({ color: 0x17391a, transparent: true, opacity: 0.88, depthWrite: false })
  );
  darkPool.rotation.x = -Math.PI / 2;
  darkPool.position.y = -1.43;
  const acidPool = new THREE.Mesh(
    new THREE.CircleGeometry(2.38, 40),
    new THREE.MeshBasicMaterial({ color: 0x69e92b, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  acidPool.rotation.x = -Math.PI / 2;
  acidPool.position.set(0, -1.41, 0);
  const centerGlow = new THREE.Mesh(
    new THREE.CircleGeometry(1.35, 32),
    new THREE.MeshBasicMaterial({ color: 0xc9ff65, transparent: true, opacity: 0.64, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  centerGlow.rotation.x = -Math.PI / 2;
  centerGlow.position.set(0.2, -1.39, -0.12);
  const rimPoints = [];
  for (let i = 0; i < 32; i++) {
    const angle = (i / 32) * Math.PI * 2;
    const unevenRadius = 2.35 + Math.sin(angle * 3) * 0.18 + Math.cos(angle * 5) * 0.12;
    rimPoints.push(new THREE.Vector3(Math.cos(angle) * unevenRadius, -1.37, Math.sin(angle) * unevenRadius));
  }
  const rimCurve = new THREE.CatmullRomCurve3(rimPoints, true);
  const rim = new THREE.Mesh(
    new THREE.TubeGeometry(rimCurve, 64, 0.075, 6, true),
    new THREE.MeshBasicMaterial({ color: 0xb8ff4a, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  const bubbles = [];
  for (let i = 0; i < 14; i++) {
    const bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 + Math.random() * 0.12, 8, 6),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0xd9ff70 : 0x49ff72, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 1.9;
    bubble.position.set(Math.cos(angle) * distance, -1.2 + Math.random() * 0.12, Math.sin(angle) * distance);
    bubble.userData.phase = Math.random() * Math.PI * 2;
    puddle.add(bubble);
    bubbles.push(bubble);
  }
  puddle.add(darkPool, acidPool, centerGlow, rim);
  const glow = new THREE.PointLight(0x72ff2e, 2.1, 8);
  glow.position.set(0, 0.3, 0);
  puddle.add(glow);
  puddle.position.set(position.x, 0, position.z);
  puddle.userData = { life: 5, age: 0, damageTimer: 0, damageRadius: 2.8, darkPool, acidPool, centerGlow, rim, glow, bubbles };
  scene.add(puddle);
  acidPuddles.push(puddle);
  spawnForestBurst(position, 20, 0x91ff3b);
  spawnForestBurst(position, 24, 0xd9ff70);
  spawnForestBurst(position, 12, 0x43ff9b);
}

function updateAcidPuddles(delta) {
  for (let i = acidPuddles.length - 1; i >= 0; i--) {
    const puddle = acidPuddles[i];
    puddle.userData.life -= delta;
    puddle.userData.age += delta;
    puddle.userData.damageTimer -= delta;
    const fade = Math.min(1, puddle.userData.life / 0.8);
    const pulse = 1 + Math.sin(clock.elapsedTime * 5 + i) * 0.045;
    const spreadIn = Math.min(1, puddle.userData.age / 0.22);
    puddle.userData.darkPool.scale.setScalar(spreadIn);
    puddle.userData.darkPool.material.opacity = fade * 0.88;
    puddle.userData.acidPool.scale.set(pulse * spreadIn, pulse * spreadIn, 1);
    puddle.userData.centerGlow.material.opacity = Math.max(0, fade * (0.5 + Math.sin(clock.elapsedTime * 7 + i) * 0.14));
    puddle.userData.acidPool.material.opacity = fade * (0.65 + Math.sin(clock.elapsedTime * 4 + i) * 0.08);
    puddle.userData.rim.material.opacity = fade * (0.8 + Math.sin(clock.elapsedTime * 6 + i) * 0.1);
    puddle.userData.glow.intensity = fade * (1.8 + Math.sin(clock.elapsedTime * 8 + i) * 0.35);
    for (const bubble of puddle.userData.bubbles) {
      bubble.position.y = -1.2 + Math.sin(clock.elapsedTime * 3.5 + bubble.userData.phase) * 0.18;
      const bubbleScale = 0.85 + Math.sin(clock.elapsedTime * 5 + bubble.userData.phase) * 0.18;
      bubble.scale.setScalar(bubbleScale);
    }
    if (puddle.position.distanceTo(player.position) < puddle.userData.damageRadius && puddle.userData.damageTimer <= 0) {
      damagePlayer(1);
      puddle.userData.damageTimer = 0.8;
      if (messageElement) messageElement.textContent = 'Você está pisando no ácido!';
    }
    if (puddle.userData.life <= 0) {
      scene.remove(puddle);
      puddle.traverse((part) => {
        if (part.geometry) part.geometry.dispose();
        if (part.material) part.material.dispose();
      });
      acidPuddles.splice(i, 1);
    }
  }
}

function fireElectricShock(boss) {
  playOneShot(localGameSounds.electricShock, 0.9);
  const start = boss.position.clone().add(new THREE.Vector3(0, 1.55, 0));
  const target = player.position.clone().add(new THREE.Vector3(0, 1.0, 0));
  const direction = new THREE.Vector3().subVectors(target, start);
  const distance = direction.length();
  direction.normalize();
  const end = start.clone().addScaledVector(direction, Math.min(distance, 12));
  const side = new THREE.Vector3(-direction.z, 0, direction.x);
  const points = [start];
  for (let i = 1; i < 7; i++) {
    const progress = i / 7;
    const jitter = (Math.random() - 0.5) * 1.1;
    points.push(start.clone().lerp(end, progress).addScaledVector(side, jitter));
  }
  points.push(end);
  const bolt = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({ color: 0x8df6ff, transparent: true, opacity: 0.95, linewidth: 3 })
  );
  bolt.renderOrder = 2;
  scene.add(bolt);
  electricBolts.push({ mesh: bolt, life: 0.2, duration: 0.2 });
  playSound(520, 0.14);
  if (distance <= 12) {
    damagePlayer(boss.userData.bossDamageMultiplier || 1);
    playerStunTimer = Math.max(playerStunTimer, 0.9);
    if (messageElement) messageElement.textContent = 'CHOQUE! Você foi paralisado!';
  } else if (messageElement) {
    messageElement.textContent = 'Uma descarga elétrica passou perto de você!';
  }
}

function placeElectricCharge(position, ownerUuid, bossRank = 1, damageMultiplier = 1) {
  playOneShot(localGameSounds.electricCharge, 0.85);
  const charge = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CircleGeometry(1.65, 32),
    new THREE.MeshBasicMaterial({ color: 0x153b48, transparent: true, opacity: 0.55, depthWrite: false })
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -1.43;
  charge.add(base);

  const warningRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.7, 0.12, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0x6ff4ff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  warningRing.rotation.x = Math.PI / 2;
  warningRing.position.y = -1.31;
  charge.add(warningRing);

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.055, 6, 24),
    new THREE.MeshBasicMaterial({ color: 0xd6ffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  innerRing.rotation.x = Math.PI / 2;
  innerRing.position.y = -1.28;
  charge.add(innerRing);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10),
    new THREE.MeshBasicMaterial({ color: 0xb5ffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending })
  );
  core.position.y = -0.8;
  charge.add(core);
  const glow = new THREE.PointLight(0x52eaff, 1.8, 6);
  glow.position.y = 0.2;
  charge.add(glow);
  charge.position.set(position.x, 0, position.z);
  const radius = 4.2 + (bossRank - 1) * 0.3;
  warningRing.scale.setScalar(radius / 4.2);
  base.scale.setScalar(radius / 4.2);
  charge.userData = { timer: 3.2, age: 0, warningRing, innerRing, core, glow, radius, ownerUuid, damageMultiplier };
  scene.add(charge);
  electricCharges.push(charge);
}

function removeElectricChargesFromOwner(ownerUuid) {
  for (let i = electricCharges.length - 1; i >= 0; i--) {
    const charge = electricCharges[i];
    if (charge.userData.ownerUuid !== ownerUuid) continue;
    scene.remove(charge);
    charge.traverse((part) => {
      if (part.geometry) part.geometry.dispose();
      if (part.material) {
        if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
        else part.material.dispose();
      }
    });
    electricCharges.splice(i, 1);
  }
}

function detonateElectricCharge(charge) {
  playOneShot(localGameSounds.electricShock, 0.9);
  const position = charge.position.clone();
  const radius = charge.userData.radius;
  const boltStart = new THREE.Vector3(position.x, 34, position.z);
  const boltEnd = new THREE.Vector3(position.x, 0.15, position.z);
  const boltPoints = [boltStart];
  for (let i = 1; i < 9; i++) {
    const progress = i / 9;
    boltPoints.push(new THREE.Vector3(
      position.x + (Math.random() - 0.5) * 1.8,
      THREE.MathUtils.lerp(boltStart.y, boltEnd.y, progress),
      position.z + (Math.random() - 0.5) * 1.8
    ));
  }
  boltPoints.push(boltEnd);
  const skyBolt = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(boltPoints),
    new THREE.LineBasicMaterial({ color: 0x9df7ff, transparent: true, opacity: 1, linewidth: 4 })
  );
  skyBolt.renderOrder = 3;
  scene.add(skyBolt);
  electricBolts.push({ mesh: skyBolt, life: 0.38, duration: 0.38 });
  scene.remove(charge);
  charge.traverse((part) => {
    if (part.geometry) part.geometry.dispose();
    if (part.material) {
      if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
      else part.material.dispose();
    }
  });

  const burst = new THREE.Group();
  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x60ecff, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  flash.position.y = 0.4;
  burst.add(flash);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.12, 8, 32),
    new THREE.MeshBasicMaterial({ color: 0xc4ffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.2;
  burst.add(ring);
  const light = new THREE.PointLight(0x51eaff, 4, 10);
  light.position.y = 0.6;
  burst.add(light);
  burst.position.copy(position);
  scene.add(burst);
  electricDetonations.push({ group: burst, flash, ring, light, life: 0.48, duration: 0.48, radius });
  spawnForestBurst(position, 32, 0x62eaff);
  if (player.position.distanceTo(position) < radius) {
    damagePlayer(2 * charge.userData.damageMultiplier);
    if (messageElement) messageElement.textContent = 'RAIO DO CÉU! Afaste-se do local marcado!';
  } else if (messageElement) {
    messageElement.textContent = 'O raio caiu no local marcado!';
  }
}

function updateElectricHazards(delta) {
  for (let i = electricCharges.length - 1; i >= 0; i--) {
    const charge = electricCharges[i];
    charge.userData.timer -= delta;
    charge.userData.age += delta;
    const pulse = 1 + Math.sin(charge.userData.age * 12) * 0.12;
    charge.userData.warningRing.scale.setScalar(pulse);
    charge.userData.warningRing.material.opacity = 0.45 + (Math.sin(charge.userData.age * 10) + 1) * 0.25;
    charge.userData.innerRing.rotation.z += delta * 2.8;
    charge.userData.core.scale.setScalar(0.8 + (Math.sin(charge.userData.age * 14) + 1) * 0.18);
    charge.userData.glow.intensity = 1.2 + (Math.sin(charge.userData.age * 12) + 1) * 0.9;
    if (charge.userData.timer <= 0) {
      detonateElectricCharge(charge);
      electricCharges.splice(i, 1);
    }
  }

  for (let i = electricDetonations.length - 1; i >= 0; i--) {
    const effect = electricDetonations[i];
    effect.life -= delta;
    const progress = 1 - effect.life / effect.duration;
    effect.flash.scale.setScalar(0.3 + progress * effect.radius * 0.7);
    effect.flash.material.opacity = Math.max(0, 0.72 * (1 - progress));
    effect.ring.scale.setScalar(0.5 + progress * effect.radius * 0.8);
    effect.ring.material.opacity = Math.max(0, 0.9 * (1 - progress));
    effect.light.intensity = 4 * (1 - progress);
    if (effect.life <= 0) {
      scene.remove(effect.group);
      effect.group.traverse((part) => {
        if (part.geometry) part.geometry.dispose();
        if (part.material) {
          if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
          else part.material.dispose();
        }
      });
      electricDetonations.splice(i, 1);
    }
  }

  for (let i = electricBolts.length - 1; i >= 0; i--) {
    const effect = electricBolts[i];
    effect.life -= delta;
    effect.mesh.material.opacity = Math.max(0, effect.life / effect.duration);
    if (effect.life <= 0) {
      scene.remove(effect.mesh);
      effect.mesh.geometry.dispose();
      effect.mesh.material.dispose();
      electricBolts.splice(i, 1);
    }
  }
}

function spawnEnemyProjectile(fromPosition, color = 0xb968ff, damage = 1, projectileSpeed = 0.55, showSprite = true, projectileType = 'necromancer') {
  const origin = fromPosition.clone();
  origin.y = projectileType === 'acid' ? 1.5 : 1.2;
  const target = player.position.clone().add(new THREE.Vector3(0, 1.2, 0));
  const direction = new THREE.Vector3().subVectors(target, origin).normalize();
  const projectile = new THREE.Object3D();
  if (showSprite) {
    if (projectileType === 'acid') {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0x69ff35, transparent: true, opacity: 0.82, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      orb.scale.set(1, 0.88, 1);
      projectile.add(orb);
      const innerOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.19, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xe7ff9c, transparent: true, opacity: 0.96, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      projectile.add(innerOrb);
      const energyRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.035, 6, 20),
        new THREE.MeshBasicMaterial({ color: 0xa8ff3e, transparent: true, opacity: 0.84, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      energyRing.rotation.x = Math.PI / 2;
      projectile.add(energyRing);
    } else if (projectileType === 'host-spit') {
      const glob = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0xd64b4b, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      projectile.add(glob);
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffc1a0, transparent: true, opacity: 0.95, depthWrite: false })
      );
      projectile.add(core);
    } else if (projectileType === 'entity-smoke') {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 14, 12),
        new THREE.MeshBasicMaterial({ color: 0x16131e, transparent: true, opacity: 0.92, depthWrite: false })
      );
      projectile.add(orb);
      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0x74617d, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false })
      );
      projectile.add(core);
    } else {
      const material = new THREE.SpriteMaterial({
        map: necromancerProjectileTexture || null,
        color,
        transparent: true,
        opacity: 0.95,
        alphaTest: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1.15, 1.15, 1);
      projectile.add(sprite);
    }
    const light = new THREE.PointLight(projectileType === 'acid' ? 0x80ff36 : color, projectileType === 'acid' ? 2.8 : 1.2, projectileType === 'acid' ? 9 : 5);
    projectile.add(light);
  }
  projectile.position.copy(origin);
  projectile.userData = { velocity: direction, life: 5, damage, projectileSpeed, projectileType, trailTimer: 0, animationTime: 0 };
  scene.add(projectile);
  enemyProjectiles.push(projectile);
  return projectile;
}

function updateEnemyProjectiles(delta) {
  for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
    const projectile = enemyProjectiles[i];
    const previousPosition = projectile.position.clone();
    const movement = (projectile.userData.projectileSpeed || 0.55) * delta * 60;
    const nextPosition = previousPosition.clone().addScaledVector(projectile.userData.velocity, movement);
    const playerTarget = player.position.clone().add(new THREE.Vector3(0, 1.2, 0));
    const segment = new THREE.Line3(previousPosition, nextPosition);
    const closestPoint = segment.closestPointToPoint(playerTarget, true, new THREE.Vector3());
    projectile.position.copy(nextPosition);
    projectile.userData.life -= delta;
    projectile.userData.animationTime += delta;
    if (projectile.userData.projectileType === 'acid') {
      projectile.userData.trailTimer -= delta;
      projectile.children[0]?.scale.setScalar(1 + Math.sin(projectile.userData.animationTime * 18) * 0.12);
      if (projectile.children[2]) projectile.children[2].rotation.z += delta * 5;
      if (projectile.userData.trailTimer <= 0) {
        spawnForestBurst(projectile.position, 2, 0x8dff47);
        projectile.userData.trailTimer = 0.12;
      }
    }
    if (closestPoint.distanceTo(playerTarget) < (projectile.userData.projectileType === 'acid' ? 1.3 : 1.6)) {
      damagePlayer(projectile.userData.damage || 1);
      if (projectile.userData.projectileType === 'host-spit') {
        if (activeParasiteCount() < 10) {
          spawnParasite(player.position);
          if (messageElement) messageElement.textContent = 'A cusparada feriu você e trouxe um parasita!';
        } else if (messageElement) {
          messageElement.textContent = 'A cusparada atingiu você, mas já há 10 parasitas ativos!';
        }
      } else if (projectile.userData.projectileType === 'acid') {
        spawnAcidPuddle(player.position);
        if (messageElement) messageElement.textContent = 'Uma bola de ácido explodiu perto de você!';
      } else if (messageElement) messageElement.textContent = 'Atingido por um projétil sombrio!';
      scene.remove(projectile);
      projectile.traverse((part) => {
        part.geometry?.dispose();
        if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
        else part.material?.dispose();
      });
      enemyProjectiles.splice(i, 1);
      continue;
    }
    if (projectile.userData.life <= 0) {
      scene.remove(projectile);
      projectile.traverse((part) => {
        part.geometry?.dispose();
        if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
        else part.material?.dispose();
      });
      enemyProjectiles.splice(i, 1);
    }
  }
}

function createEntitySmileIllusion(position, isReal = false) {
  if (!enemyTextures.entity) return null;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: enemyTextures.entity,
    transparent: true,
    opacity: isReal ? 1 : 0.28,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  sprite.scale.set(1.6, 1.9, 1);
  sprite.position.copy(position);
  sprite.userData = { baseScale: 1.6, isReal };
  scene.add(sprite);
  return sprite;
}

function clearEntitySmileIllusions(enemy) {
  if (!enemy.userData.smileIllusions) return;
  for (const illusion of enemy.userData.smileIllusions) {
    if (!illusion) continue;
    scene.remove(illusion);
    illusion.material?.dispose();
  }
  enemy.userData.smileIllusions = [];
}

function createEntitySmokeCloud(position, radius = 3.6, damageMultiplier = 1) {
  const cloud = new THREE.Group();
  const groundShadow = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 36),
    new THREE.MeshBasicMaterial({ color: 0x111018, transparent: true, opacity: 0.72, depthWrite: false })
  );
  groundShadow.rotation.x = -Math.PI / 2;
  groundShadow.position.y = -1.42;
  cloud.add(groundShadow);
  const puffs = [];
  for (let i = 0; i < 9; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 10),
      new THREE.MeshBasicMaterial({ color: i % 2 ? 0x211d29 : 0x39313f, transparent: true, opacity: 0.48, depthWrite: false })
    );
    const angle = (i / 9) * Math.PI * 2;
    const radius = 0.7 + Math.random() * 1.7;
    puff.position.set(Math.cos(angle) * radius, -0.8 + Math.random() * 0.9, Math.sin(angle) * radius);
    puff.scale.setScalar(0.8 + Math.random() * 0.8);
    puff.userData.phase = Math.random() * Math.PI * 2;
    cloud.add(puff);
    puffs.push(puff);
  }
  cloud.position.set(position.x, 0, position.z);
  cloud.userData = { life: 4.8, age: 0, damageTimer: 0, radius, damageMultiplier, groundShadow, puffs };
  scene.add(cloud);
  entitySmokeClouds.push(cloud);
}

function updateEntitySmokeClouds(delta) {
  for (let i = entitySmokeClouds.length - 1; i >= 0; i--) {
    const cloud = entitySmokeClouds[i];
    const data = cloud.userData;
    data.life -= delta;
    data.age += delta;
    data.damageTimer -= delta;
    const fade = Math.min(1, data.life / 0.7);
    data.groundShadow.material.opacity = fade * 0.72;
    for (const puff of data.puffs) {
      puff.position.y = -0.8 + Math.sin(data.age * 2.8 + puff.userData.phase) * 0.35;
      puff.material.opacity = fade * 0.48;
    }
    if (Math.hypot(player.position.x - cloud.position.x, player.position.z - cloud.position.z) < data.radius && data.damageTimer <= 0) {
      damagePlayer(1.2 * data.damageMultiplier);
      data.damageTimer = 0.8;
      if (messageElement) messageElement.textContent = 'A nuvem sombria está ferindo você! Saia dela!';
    }
    if (data.life <= 0) {
      scene.remove(cloud);
      cloud.traverse((part) => {
        part.geometry?.dispose();
        part.material?.dispose();
      });
      entitySmokeClouds.splice(i, 1);
    }
  }
}

function createEntityBlast(position) {
  const blast = new THREE.Group();
  const smoke = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0x211a29, transparent: true, opacity: 0.78, depthWrite: false })
  );
  smoke.position.y = 0.6;
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.07, 8, 36),
    new THREE.MeshBasicMaterial({ color: 0x8c7697, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -1.25;
  blast.add(smoke, ring);
  blast.position.copy(position);
  scene.add(blast);
  entityBlastEffects.push({ group: blast, smoke, ring, life: 0.42 });
}

function updateEntityBlastEffects(delta) {
  for (let i = entityBlastEffects.length - 1; i >= 0; i--) {
    const effect = entityBlastEffects[i];
    effect.life -= delta;
    const progress = 1 - Math.max(0, effect.life / 0.42);
    effect.smoke.scale.setScalar(0.4 + progress * 4.2);
    effect.ring.scale.setScalar(0.2 + progress * 4.3);
    effect.smoke.material.opacity = Math.max(0, (1 - progress) * 0.78);
    effect.ring.material.opacity = Math.max(0, (1 - progress) * 0.85);
    if (effect.life <= 0) {
      scene.remove(effect.group);
      effect.group.traverse((part) => {
        part.geometry?.dispose();
        part.material?.dispose();
      });
      entityBlastEffects.splice(i, 1);
    }
  }
}

function isEnemyHeadshot(enemy, position) {
  const visual = enemy.children[0];
  const height = visual?.isSprite
    ? visual.scale.y
    : visual?.geometry?.parameters?.height || 2;
  return position.y - enemy.position.y > height * 0.2;
}

function updateBullets(delta) {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    const specialWave = !!bullet.userData.specialWave;
    if (specialWave) {
      const step = bullet.userData.speed * delta;
      bullet.position.addScaledVector(bullet.userData.velocity, step);
      bullet.userData.travelled += step;
      const fade = Math.max(0.22, 1 - bullet.userData.travelled / bullet.userData.range);
      bullet.traverse((part) => {
        if (!part.material) return;
        const materials = Array.isArray(part.material) ? part.material : [part.material];
        for (const material of materials) {
          material.opacity = material.userData.baseOpacity * fade;
        }
      });
    } else {
      bullet.position.addScaledVector(bullet.userData.velocity, bulletSpeed);
    }
    if (pointHitsStaticCollider(bullet.position, specialWave ? 0.8 : 0.14)) {
      scene.remove(bullet); bullets.splice(i, 1); continue;
    }
    const outOfRange = specialWave ? bullet.userData.travelled > bullet.userData.range : bullet.position.distanceTo(camera.position) > 160;
    if (outOfRange) { scene.remove(bullet); bullets.splice(i, 1); continue; }
    if (secretFrog && !frogDead && !bullet.userData.hitFrog) {
      const toFrog = secretFrog.position.clone().sub(bullet.position).setY(0);
      let hitFrog = false;
      if (specialWave) {
        const waveDirection = bullet.userData.velocity.clone().setY(0).normalize();
        const forwardDistance = toFrog.dot(waveDirection);
        const sideDistance = toFrog.addScaledVector(waveDirection, -forwardDistance).length();
        hitFrog = forwardDistance > -1.5 && forwardDistance < 2.5 && sideDistance < 3.8;
      } else {
        hitFrog = toFrog.length() < 0.9;
      }
      if (hitFrog) {
        damageSecretFrog(bullet.userData.damage || 1);
        if (specialWave) bullet.userData.hitFrog = true;
        else { scene.remove(bullet); bullets.splice(i, 1); continue; }
      }
    }
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (!enemy.userData.alive || (specialWave && bullet.userData.hitEnemies.has(enemy.uuid))) continue;
      let hitByWave = false;
      if (specialWave) {
        const waveDirection = bullet.userData.velocity.clone().setY(0).normalize();
        const toEnemy = enemy.position.clone().sub(bullet.position).setY(0);
        const forwardDistance = toEnemy.dot(waveDirection);
        const sideDistance = toEnemy.addScaledVector(waveDirection, -toEnemy.dot(waveDirection)).length();
        hitByWave = forwardDistance > -1.5 && forwardDistance < 2.5 && sideDistance < 3.8;
      }
      if (specialWave ? hitByWave : bullet.position.distanceTo(enemy.position) < 1.5) {
        const headshot = !specialWave && isEnemyHeadshot(enemy, bullet.position);
        const damage = bullet.userData.damage || 1;
        applyDamageToEnemy(enemy, j, headshot ? damage * 2 : damage, headshot);
        if (specialWave) bullet.userData.hitEnemies.add(enemy.uuid);
        else { scene.remove(bullet); bullets.splice(i, 1); break; }
      }
    }
  }
}

function updateGrenadeProjectiles(delta) {
  for (let i = grenadeProjectiles.length - 1; i >= 0; i--) {
    const grenade = grenadeProjectiles[i];
    grenade.userData.velocity.y -= 10 * delta;
    grenade.position.addScaledVector(grenade.userData.velocity, delta);
    grenade.userData.fuse -= delta;
    grenade.rotation.x += delta * 8;
    grenade.rotation.z += delta * 5;

    const hitEnemy = enemies.some((enemy) => enemy.userData.alive && enemy.position.distanceTo(grenade.position) < 1.8);
    const hitWorld = grenade.position.y < -1.25 || pointHitsStaticCollider(grenade.position, 0.3);
    if (hitEnemy || hitWorld || grenade.userData.fuse <= 0) {
      const explosionPosition = grenade.position.clone();
      scene.remove(grenade);
      grenade.geometry.dispose();
      grenade.material.dispose();
      grenadeProjectiles.splice(i, 1);
      triggerForestExplosion(explosionPosition, 8, null, 0, grenade.userData.damage);
    }
  }
}

function updateEnemies(delta) {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    const data = enemy.userData;
    addInfectedParasiteVisual(enemy);
    const previousX = enemy.position.x;
    const previousZ = enemy.position.z;
    const speed = data.speed * delta * 60 *
      (data.wolfSpeedBoostTimer > 0 ? 1.5 : data.preyMarkTimer > 0 ? 1.3 : 1);
    data.wolfSpeedBoostTimer = Math.max(0, data.wolfSpeedBoostTimer - delta);
    data.preyMarkTimer = Math.max(0, data.preyMarkTimer - delta);
    const direction = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0);
    const distanceToPlayer = direction.length();

    if (distanceToPlayer > 0.1) {
      direction.normalize();

      // IA: separação — cada zumbi se afasta um pouco de vizinhos muito próximos,
      // isso evita que fiquem todos empilhados e faz o bando se espalhar de forma orgânica.
      const separation = new THREE.Vector3();
      for (let k = 0; k < enemies.length; k++) {
        if (k === i) continue;
        const other = enemies[k];
        const away = new THREE.Vector3().subVectors(enemy.position, other.position).setY(0);
        const dist = away.length();
        if (dist > 0 && dist < 2.4) {
          separation.add(away.normalize().multiplyScalar((2.4 - dist) / 2.4));
        }
      }
      direction.add(separation.multiplyScalar(0.9));

      if (data.type === 'jumper') {
        data.jumpCooldownTimer -= delta;
        if (!data.jumping && data.jumpCooldownTimer <= 0 && distanceToPlayer < 23 && distanceToPlayer > 4.5) {
          data.jumping = true;
          data.jumpVelocity = 7.5;
          data.jumpCooldownTimer = 2.8 + Math.random() * 0.7;
          data.jumpDirection.copy(direction).normalize();
          playOneShot(localGameSounds.bruteAttack, 0.7);
        }
        if (data.jumping) {
          data.jumpHeight += data.jumpVelocity * delta;
          data.jumpVelocity -= 18 * delta;
          if (data.jumpHeight <= 0) {
            data.jumpHeight = 0;
            data.jumpVelocity = 0;
            data.jumping = false;
            data.jumpLanded = true;
          }
        }
      }

      if (data.type === 'jumper') {
        direction.normalize();
        if (data.jumping) direction.copy(data.jumpDirection).multiplyScalar(1.7);
        else direction.multiplyScalar(1.05);

        if (data.jumpLanded) {
          data.jumpLanded = false;
          if (distanceToPlayer < 6.2) {
            applyDamageToEnemy(enemy, i, data.health);
            continue;
          }
        }
        if (!data.jumping && distanceToPlayer < 3.2) {
          applyDamageToEnemy(enemy, i, data.health);
          continue;
        }
      } else if (data.type === 'parasite') {
        const targetZombie = findNearestInfectableZombie(enemy.position);
        const target = targetZombie || player;
        direction.subVectors(target.position, enemy.position).setY(0);
        const distanceToTarget = direction.length();
        if (targetZombie && distanceToTarget < 2.2) {
          infectZombieWithParasite(targetZombie, enemy);
          continue;
        }
        direction.normalize();
        direction.multiplyScalar(1.25);
      } else if (data.type === 'wolf_minion') {
        if (data.packState === 'circle') {
          data.packStateTimer -= delta;
          const fromPlayer = new THREE.Vector3().subVectors(enemy.position, player.position).setY(0);
          if (fromPlayer.lengthSq() < 0.01) fromPlayer.set(1, 0, 0);
          const tangent = new THREE.Vector3(-fromPlayer.z, 0, fromPlayer.x).multiplyScalar(data.packSide);
          const radiusCorrection = (fromPlayer.length() - 6) * 0.18;
          direction.copy(tangent).addScaledVector(fromPlayer.normalize(), -radiusCorrection).normalize();
          if (data.packStateTimer <= 0) {
            data.packState = 'charge';
            data.packStateTimer = 1.35;
          }
        } else if (data.packState === 'charge') {
          data.packStateTimer -= delta;
          direction.normalize().multiplyScalar(1.65);
          if (data.packStateTimer <= 0) data.packState = 'idle';
        } else {
          direction.normalize();
          direction.multiplyScalar(data.preyMarkTimer > 0 ? 1.35 : 1);
        }
      } else if (data.type === 'dodger') {
        // "esperto": na maior parte do tempo avança reto, mas de vez em quando dispara um desvio brusco
        data.dodgeTimer -= delta;
        if (!data.dodging && data.dodgeTimer <= 0) {
          data.dodging = true;
          data.dodgeDuration = 0.45;
          data.dodgeSign = Math.random() > 0.5 ? 1 : -1;
        }
        if (data.dodging) {
          const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(data.dodgeSign);
          direction.add(perpendicular.multiplyScalar(1.6)).normalize();
          data.dodgeDuration -= delta;
          if (data.dodgeDuration <= 0) {
            data.dodging = false;
            data.dodgeTimer = 2 + Math.random() * 2.5;
          }
        }
      } else if (data.type === 'rusher') {
        direction.multiplyScalar(1.15);
      } else if (data.type === 'tank') {
        direction.multiplyScalar(0.85);
      } else if (data.type === 'boss') {
        direction.normalize();
        data.abilityTimer -= delta;

        if (data.abilityState === 'idle' && data.abilityTimer <= 0) {
          const canSummon = data.summonsUsed < 1 + data.bossRank && enemies.length < 40;
          const roll = Math.random();
          if (canSummon && roll < Math.min(0.5, 0.2 + (data.bossRank - 1) * 0.04)) {
            data.abilityState = 'summon';
          } else if (roll < 0.7) {
            data.abilityState = 'retreat';
            data.abilityPhaseTimer = 0.7;
          } else {
            data.abilityState = 'slam';
            data.abilityPhaseTimer = 0.5;
          }
        }

        if (data.abilityState === 'summon') {
          const summonCount = Math.min(5, 1 + Math.floor((data.bossRank - 1) / 2));
          for (let summonIndex = 0; summonIndex < summonCount; summonIndex++) {
            spawnEnemy('walker', enemy.position, {
              bossWave: data.bossWave,
              bossRank: data.bossRank,
              bossDamageMultiplier: data.bossDamageMultiplier
            });
          }
          data.summonsUsed += 1;
          if (messageElement) messageElement.textContent = 'O chefe convocou reforços!';
          data.abilityState = 'idle';
          data.abilityTimer = getBossAbilityDelay(data, 6, 9);
          direction.multiplyScalar(0.4);
        } else if (data.abilityState === 'retreat') {
          direction.multiplyScalar(-0.8);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            data.abilityState = 'charge';
            data.abilityPhaseTimer = 0.9;
            if (messageElement) messageElement.textContent = 'O chefe vai investir!';
          }
        } else if (data.abilityState === 'charge') {
          direction.multiplyScalar(2.8);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 5, 8);
          }
        } else if (data.abilityState === 'slam') {
          direction.multiplyScalar(0.05);
          if (distanceToPlayer < 6.5) {
            damagePlayer(data.bossDamageMultiplier);
            if (messageElement) messageElement.textContent = 'O chefe golpeou o chão!';
          }
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 6, 9);
          }
        } else {
          direction.multiplyScalar(0.85);
        }
      } else if (data.type === 'entity') {
        direction.normalize();
        data.abilityTimer -= delta;
        const smokeTime = performance.now() * 0.001;
        for (const puff of data.smokePuffs) {
          const { basePosition, baseScale, phase } = puff.userData;
          puff.position.set(
            basePosition.x + Math.sin(smokeTime + phase) * 0.12,
            basePosition.y + Math.sin(smokeTime * 1.7 + phase) * 0.16,
            basePosition.z + Math.cos(smokeTime * 0.8 + phase) * 0.12
          );
          const pulse = 1 + Math.sin(smokeTime * 2 + phase) * 0.06;
          puff.scale.set(baseScale.x * pulse, baseScale.y * pulse, baseScale.z * pulse);
        }
        data.explosionCooldown = Math.max(0, data.explosionCooldown - delta);
        data.smokeTrailTimer = (data.smokeTrailTimer ?? 0) - delta;
        if (data.smokeTrailTimer <= 0) {
          const puff = new THREE.Mesh(
            new THREE.SphereGeometry(0.55, 14, 12),
            new THREE.MeshBasicMaterial({ color: 0x0f1016, transparent: true, opacity: 0.45, depthWrite: false })
          );
          puff.position.copy(enemy.position);
          puff.position.y = 0.9;
          scene.add(puff);
          setTimeout(() => { scene.remove(puff); puff.geometry.dispose(); puff.material.dispose(); }, 260);
          data.smokeTrailTimer = 0.22;
        }

        if (distanceToPlayer < 4.6 && data.explosionCooldown <= 0) {
          const pushDirection = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0);
          if (pushDirection.lengthSq() < 0.01) pushDirection.set(1, 0, 0);
          pushDirection.normalize();
          player.position.addScaledVector(pushDirection, 7);
          damagePlayer(1.8 * data.bossDamageMultiplier);
          createEntityBlast(enemy.position);
          spawnForestBurst(enemy.position, 26, 0x342a40);
          data.explosionCooldown = 2.5;
          data.abilityTimer = Math.max(data.abilityTimer, 2.5);
          if (messageElement) messageElement.textContent = 'O Demônio da Fumaça explodiu e empurrou você!';
        }

        if (data.abilityState === 'idle' && data.abilityTimer <= 0) {
          const attacks = ['smokeBurst', 'blink', 'smokeCloud', 'smile'];
          data.abilityState = attacks[data.entityAttackIndex % attacks.length];
          data.entityAttackIndex += 1;
          data.abilityPhaseTimer = data.abilityState === 'blink' ? 0.62 : data.abilityState === 'smile' ? 1.6 : 0.48;
          if (data.abilityState === 'blink') {
            data.entityHidden = true;
            enemy.visible = false;
            if (messageElement) messageElement.textContent = 'O Demônio da Fumaça desapareceu. Prepare-se para a investida!';
          } else if (data.abilityState === 'smokeBurst') {
            if (messageElement) messageElement.textContent = 'O Demônio da Fumaça prepara uma rajada sombria!';
          } else if (data.abilityState === 'smokeCloud') {
            if (messageElement) messageElement.textContent = 'O Demônio da Fumaça prepara uma nuvem sombria no chão!';
          } else {
            data.smileIllusions = null;
            if (messageElement) messageElement.textContent = 'O Sorriso! Encontre a face verdadeira!';
          }
        }

        if (data.abilityState === 'smokeBurst') {
          direction.multiplyScalar(0.25);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            const projectileCount = 1 + Math.min(3, Math.floor((data.bossRank - 1) / 2));
            for (let projectileIndex = 0; projectileIndex < projectileCount; projectileIndex++) {
              const offset = (projectileIndex - (projectileCount - 1) / 2) * 0.8;
              spawnEnemyProjectile(
                enemy.position.clone().add(new THREE.Vector3(offset, 0, 0)),
                0x40364b,
                1.5 * data.bossDamageMultiplier,
                0.68,
                true,
                'entity-smoke'
              );
            }
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 4, 6);
          }
        } else if (data.abilityState === 'blink') {
          direction.set(0, 0, 0);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            let escapeDirection = new THREE.Vector3().subVectors(enemy.position, player.position).setY(0);
            if (escapeDirection.lengthSq() < 0.01) escapeDirection.set(Math.random() - 0.5, 0, Math.random() - 0.5);
            escapeDirection.normalize();
            enemy.position.set(player.position.x + escapeDirection.x * 9, data.groundY, player.position.z + escapeDirection.z * 9);
            enemy.visible = true;
            data.entityHidden = false;
            data.dashDirection = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0).normalize();
            data.abilityState = 'entityDash';
            data.abilityPhaseTimer = 0.72;
            if (messageElement) messageElement.textContent = 'O Demônio da Fumaça reapareceu e está atravessando a arena!';
          }
        } else if (data.abilityState === 'entityDash') {
          direction.copy(data.dashDirection).multiplyScalar(4.5);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 5, 8);
          }
        } else if (data.abilityState === 'smokeCloud') {
          direction.multiplyScalar(0.2);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            createEntitySmokeCloud(
              player.position,
              3.6 + Math.min(3, (data.bossRank - 1) * 0.35),
              data.bossDamageMultiplier
            );
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 5, 7);
          }
        } else if (data.abilityState === 'smile') {
          direction.multiplyScalar(0.05);
          data.abilityPhaseTimer -= delta;
          if (!data.smileIllusions) {
            const realIndex = Math.floor(Math.random() * 5);
            data.smileIllusions = [];
            for (let illusionIndex = 0; illusionIndex < 5; illusionIndex++) {
              const angle = (illusionIndex / 5) * Math.PI * 2;
              const position = player.position.clone().add(new THREE.Vector3(Math.cos(angle) * 5.2, 1.2, Math.sin(angle) * 5.2));
              const sprite = createEntitySmileIllusion(position, illusionIndex === realIndex);
              if (sprite) data.smileIllusions.push(sprite);
            }
          }
          for (const illusion of data.smileIllusions) {
            illusion.material.opacity = illusion.userData.isReal
              ? 0.78 + Math.sin(performance.now() * 0.012) * 0.2
              : 0.18 + Math.sin(performance.now() * 0.008 + illusion.position.x) * 0.08;
          }
          if (data.abilityPhaseTimer <= 0) {
            const realIllusion = data.smileIllusions.find((sprite) => sprite.userData.isReal);
            if (realIllusion) {
              spawnEnemyProjectile(
                realIllusion.position,
                0x40364b,
                2.1 * data.bossDamageMultiplier,
                0.74,
                true,
                'entity-smoke'
              );
            }
            clearEntitySmileIllusions(enemy);
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 5, 7);
          }
        } else {
          direction.multiplyScalar(distanceToPlayer > 12 ? 0.58 : distanceToPlayer < 8 ? -0.35 : 0.08);
        }
      } else if (data.type === 'parasiteBoss') {
        const healthRatio = Math.max(0, data.health / data.maxHealth);
        const aggression = 0.72 + healthRatio * 0.28;
        data.abilityTimer -= delta;
        if (data.abilityState === 'idle' && data.abilityTimer <= 0) {
          const roll = Math.random();
          if (roll < 0.28) {
            data.abilityState = 'charge';
            data.abilityPhaseTimer = 0.78;
            data.dashDirection = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0).normalize();
            if (messageElement) messageElement.textContent = 'O Hospedeiro rasteja em uma investida!';
          } else if (roll < 0.56) {
            const parasiteLimit = Math.min(24, 8 + data.bossRank * 2);
            const availableSlots = Math.max(0, parasiteLimit - activeParasiteCount());
            const maxReleaseCount = Math.min(6, data.bossRank);
            const releaseCount = Math.min(1 + Math.floor(Math.random() * maxReleaseCount), availableSlots);
            for (let n = 0; n < releaseCount; n++) spawnParasite(enemy.position);
            if (releaseCount > 0) {
              playOneShot(localGameSounds.parasite, 0.9);
              if (messageElement) messageElement.textContent = `O Hospedeiro liberou ${releaseCount} parasita(s)!`;
            } else if (messageElement) {
              messageElement.textContent = `Há ${parasiteLimit} parasitas ativos; elimine alguns para impedir novas liberações!`;
            }
            data.abilityTimer = getBossAbilityDelay(data, 5, 7) * aggression;
          } else if (roll < 0.8) {
            data.abilityState = 'spit';
            data.abilityPhaseTimer = 0.32;
            if (messageElement) messageElement.textContent = 'O Hospedeiro prepara uma cusparada!';
          } else {
            const targetZombie = findNearestInfectableZombie(enemy.position, 14);
            if (targetZombie && infectZombieWithParasite(targetZombie)) {
              if (messageElement) messageElement.textContent = 'O Hospedeiro infectou um zumbi próximo!';
            }
            data.abilityTimer = getBossAbilityDelay(data, 5, 7) * aggression;
          }
        }

        if (data.abilityState === 'charge') {
          direction.copy(data.dashDirection || direction).multiplyScalar(2.6);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 5, 7) * aggression;
          }
        } else if (data.abilityState === 'spit') {
          direction.multiplyScalar(0.25);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            const projectile = spawnEnemyProjectile(
              enemy.position,
              0xd64b4b,
              data.bossDamageMultiplier,
              0.78,
              true,
              'host-spit'
            );
            projectile.userData.life = 2.6;
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 5, 7) * aggression;
          }
        } else if (data.abilityState === 'idle') {
          direction.multiplyScalar(0.75);
        }
      } else if (data.type === 'bloater') {
        direction.normalize();
        if (distanceToPlayer < 3.2) {
          applyDamageToEnemy(enemy, i, data.health);
          continue;
        }
      } else if (data.type === 'shooter') {
        // Atirador: persegue até uma área limitada, tenta ficar entre 18 e 32
        // metros e se movimenta de lado enquanto espera o próximo disparo.
        data.shootTimer -= delta;
        data.strafeTimer -= delta;

        if (data.strafeTimer <= 0) {
          data.strafeSign = Math.random() > 0.5 ? 1 : -1;
          data.strafeTimer = 1.4 + Math.random() * 1.8;
        }

        if (distanceToPlayer > 60) {
          direction.multiplyScalar(0.95);
        } else if (distanceToPlayer > 28) {
          direction.multiplyScalar(0.58);
        } else if (distanceToPlayer < 18) {
          direction.multiplyScalar(-0.42);
        } else {
          direction.multiplyScalar(0.10);
        }

        // Nunca deixa o atirador caminhar contra a borda do mapa.
        const edgeLimit = 168;
        if (Math.abs(enemy.position.x) > edgeLimit || Math.abs(enemy.position.z) > edgeLimit) {
          const toCenter = new THREE.Vector3(-enemy.position.x, 0, -enemy.position.z).normalize();
          direction.add(toCenter.multiplyScalar(2.2)).normalize();
        }

        if (distanceToPlayer >= 22 && distanceToPlayer <= 100 && data.shootTimer <= 0) {
          spawnEnemyProjectile(enemy.position, 0x7cff2e, 1, 0.48, true, 'acid');
          data.shootTimer = data.shootCooldown;
          if (messageElement) messageElement.textContent = 'Um zumbi atirador abriu fogo!';
        }
      } else if (data.type === 'electrician') {
        data.abilityTimer -= delta;
        const lowHealth = data.health / data.maxHealth < 0.3;
        const maxElectricCharges = 2 + data.bossRank;

        if (data.abilityState === 'idle' && data.abilityTimer <= 0) {
          const chargeChance = Math.min(0.72, 0.34 + data.bossRank * 0.04);
          if (electricCharges.length < maxElectricCharges && Math.random() < chargeChance) {
            data.abilityState = 'charge';
            data.abilityPhaseTimer = 0.38;
            data.nextAbilityCooldown = lowHealth
              ? getBossAbilityDelay(data, 3.2, 4.2)
              : getBossAbilityDelay(data, 5.2, 6.6);
            if (messageElement) messageElement.textContent = 'RAIO DO CÉU: observe o círculo marcado e saia dele!';
          } else {
            data.abilityState = 'shock';
            data.abilityPhaseTimer = 0.12;
            data.nextAbilityCooldown = getBossAbilityDelay(data, 1.8, 2.6);
            if (messageElement) messageElement.textContent = 'A mochila do Eletricista começa a faiscar!';
          }
        }

        if (data.abilityState === 'charge') {
          direction.multiplyScalar(0.1);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            const towardPlayer = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0).normalize();
            const chargePosition = player.position.clone().addScaledVector(towardPlayer, -2.1);
            chargePosition.x = Math.max(-155, Math.min(155, chargePosition.x));
            chargePosition.z = Math.max(-155, Math.min(155, chargePosition.z));
            placeElectricCharge(chargePosition, enemy.uuid, data.bossRank, data.bossDamageMultiplier);
            data.abilityState = 'idle';
            data.abilityTimer = data.nextAbilityCooldown;
            if (messageElement) messageElement.textContent = 'RAIO DO CÉU MARCADO! Saia do círculo antes da queda!';
          }
        } else if (data.abilityState === 'shock') {
          direction.multiplyScalar(0.12);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            fireElectricShock(enemy);
            data.abilityState = 'idle';
            data.abilityTimer = data.nextAbilityCooldown;
          }
        } else if (distanceToPlayer < 6) {
          direction.multiplyScalar(-0.5);
        } else if (distanceToPlayer > 15) {
          direction.multiplyScalar(0.65);
        } else {
          direction.multiplyScalar(0.18);
        }
      } else if (data.type === 'necromancer') {
        direction.normalize();
        data.abilityTimer -= delta;

        if (data.abilityState === 'idle' && distanceToPlayer < 11) {
          data.abilityState = 'retreat';
          data.abilityPhaseTimer = 1.15;
          if (messageElement) messageElement.textContent = 'O Necromante recua e invoca proteção!';
          const summoned = summonNecromancerMinions(enemy);
          if (summoned > 0) {
            data.summonsUsed += 1;
            if (messageElement) messageElement.textContent = `O Necromante recua e invoca ${summoned} protetor(es)!`;
          } else if (messageElement) {
            messageElement.textContent = 'O Necromante recua; seus invocados protegem a arena!';
          }
        } else if (data.abilityState === 'idle' && data.abilityTimer <= 0) {
          const canSummon = countNecromancerMinions() < getNecromancerMinionLimit(enemy);
          const summonChance = Math.min(0.68, 0.28 + data.bossRank * 0.04);
          if (canSummon && Math.random() < summonChance) {
            data.abilityState = 'summon';
          } else {
            data.abilityState = 'projectile';
            data.abilityPhaseTimer = 0.35;
          }
        }

        if (data.abilityState === 'summon') {
          const summoned = summonNecromancerMinions(enemy);
          if (summoned > 0) {
            data.summonsUsed += 1;
            if (messageElement) messageElement.textContent = `O Necromante invocou ${summoned} zumbi(s) e esqueletos!`;
          } else if (messageElement) {
            messageElement.textContent = 'O limite de invocados do Necromante foi atingido!';
          }
          data.abilityState = 'idle';
          data.abilityTimer = getBossAbilityDelay(data, 4.5, 7);
        } else if (data.abilityState === 'projectile') {
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            playOneShot(localGameSounds.bossMagic, 0.9);
            spawnEnemyProjectile(
              enemy.position,
              0x65ff83,
              1.5 * data.bossDamageMultiplier,
              0.58,
              true,
              'necromancer'
            );
            if (messageElement) messageElement.textContent = 'O Necromante lançou energia necromântica!';
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 2.4, 3.6);
          }
        } else if (data.abilityState === 'retreat') {
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0 || distanceToPlayer >= 18) {
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, 1.2, 2.2);
          }
          direction.multiplyScalar(-1);
          const closeToEdge = Math.abs(enemy.position.x) > 145 || Math.abs(enemy.position.z) > 145;
          if (closeToEdge) {
            direction.add(new THREE.Vector3(-enemy.position.x, 0, -enemy.position.z).normalize().multiplyScalar(2.8));
          }
          direction.normalize().multiplyScalar(2.4);
        } else if (distanceToPlayer < 16) {
          direction.multiplyScalar(-1.25);
        } else if (distanceToPlayer > 34) {
          direction.multiplyScalar(0.42);
        } else {
          const strafe = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(data.strafeSign);
          direction.copy(strafe).multiplyScalar(0.28);
        }
        if (Math.abs(enemy.position.x) > 145 || Math.abs(enemy.position.z) > 145) {
          direction.add(new THREE.Vector3(-enemy.position.x, 0, -enemy.position.z).normalize().multiplyScalar(2.2));
        }
      } else if (data.type === 'wolf') {
        if (data.bossRank >= 3 && !data.wolfTransformed && data.health / data.maxHealth <= 0.5) {
          data.wolfTransformed = true;
          updateBossHealthDisplay();
          data.speed *= 1.3;
          data.bossDamageMultiplier *= 1.25;
          if (data.sprite) {
            if (enemyTextures.werewolf) {
              data.sprite.material.map = enemyTextures.werewolf;
              data.sprite.material.needsUpdate = true;
            }
            data.sprite.material.color.setHex(0xffffff);
            data.spriteBaseScale.multiplyScalar(1.3);
          }
          const aura = new THREE.PointLight(0xff2638, 2.2, 12);
          aura.position.y = 1.8;
          enemy.add(aura);
          spawnForestBurst(enemy.position, 70, 0xff293a);
          if (messageElement) messageElement.textContent = 'O LOBO INFERNAL se transformou em LOBISOMEM!';
        }
        direction.normalize();
        data.abilityTimer -= delta;
        if (data.preyMarkTimer > 0 && data.preyMarkIndicator) {
          data.preyMarkIndicator.position.set(player.position.x, -1.34, player.position.z);
          data.preyMarkIndicator.material.opacity = 0.55 + Math.sin(performance.now() * 0.012) * 0.25;
        } else if (data.preyMarkIndicator) {
          scene.remove(data.preyMarkIndicator);
          data.preyMarkIndicator.geometry.dispose();
          data.preyMarkIndicator.material.dispose();
          data.preyMarkIndicator = null;
        }
        updateWolfBloodTrails(data, delta);
        if (data.wolfSummonPendingTimer > 0) {
          data.wolfSummonPendingTimer -= delta;
          if (data.wolfSummonPendingTimer <= 0) {
            const spawned = spawnBossWolvesFromEdge(enemy, data.pendingWolfSummonCount || 2);
            if (spawned > 0 && messageElement) messageElement.textContent = `${spawned} lobo(s) entraram correndo pela borda da arena!`;
            data.pendingWolfSummonCount = 0;
          }
        }

        const frenzy = data.health / data.maxHealth < (data.wolfTransformed ? 0.6 : 0.3);
        const nearbyPack = enemies.filter((other) =>
          other.userData.alive &&
          other.userData.type === 'wolf_minion' &&
          other.userData.summonedByWolfBoss &&
          other.position.distanceTo(enemy.position) < 28
        );
        const startHowl = (packAttack = false) => {
          data.abilityState = packAttack ? 'packHowl' : 'roar';
          data.abilityPhaseTimer = frenzy ? 0.58 : packAttack ? 1.05 : 1.15;
          showWolfPreyMark(data, frenzy ? 5.5 : 7);
          const livingWolves = countBossWolves();
          const extraWolves = Math.min(5, data.bossRank - 1);
          data.pendingWolfSummonCount = (livingWolves === 0 ? 2 : 2 + Math.floor(Math.random() * 2)) + extraWolves;
          data.wolfSummonPendingTimer = frenzy ? 0.8 : 1.2;
          if (packAttack) {
            for (const wolf of nearbyPack) {
              wolf.userData.packState = 'circle';
              wolf.userData.packStateTimer = data.abilityPhaseTimer;
            }
            if (messageElement) messageElement.textContent = 'A matilha cerca você! Prepare-se para a investida!';
          } else {
            for (const wolf of enemies) {
              if (wolf.userData.type !== 'wolf_minion' || !wolf.userData.alive) continue;
              wolf.userData.wolfSpeedBoostTimer = Math.max(wolf.userData.wolfSpeedBoostTimer, frenzy ? 4.5 : 6);
            }
            if (messageElement) messageElement.textContent = 'O lobo uiva: VOCÊ É A PRESA. A matilha está caçando!';
          }
          playOneShot(packAttack ? localGameSounds.wolfPack : localGameSounds.wolfHowl, 1.0);
        };

        if (data.abilityState === 'idle' && data.abilityTimer <= 0) {
          if (nearbyPack.length >= 3) {
            startHowl(true);
          } else if (distanceToPlayer < 5 && Math.random() < 0.7) {
            data.abilityState = 'retreat';
            data.abilityPhaseTimer = 0.42;
            if (messageElement) messageElement.textContent = 'O lobo salta para trás e chama a matilha!';
          } else if (Math.random() < (frenzy ? 0.55 : 0.42)) {
            data.abilityState = 'dash';
            data.abilityPhaseTimer = frenzy ? 0.58 : 0.72;
            data.dashDirection = new THREE.Vector3().subVectors(player.position, enemy.position).setY(0).normalize();
            data.dashStartPosition = enemy.position.clone();
            playOneShot(localGameSounds.wolfDash, 0.9);
            if (messageElement) messageElement.textContent = 'O lobo dispara em um dash de caça!';
          } else {
            startHowl();
          }
        }

        if (data.abilityState === 'roar' || data.abilityState === 'packHowl') {
          direction.multiplyScalar(0.04);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            if (data.abilityState === 'packHowl') {
              for (const wolf of nearbyPack) {
                if (wolf.userData.alive) {
                  wolf.userData.packState = 'charge';
                  wolf.userData.packStateTimer = 1.35;
                }
              }
            }
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, frenzy ? 4 : 6, frenzy ? 6 : 9);
          }
        } else if (data.abilityState === 'dash') {
          direction.copy(data.dashDirection || direction).multiplyScalar(
            data.wolfTransformed ? (frenzy ? 4.8 : 4.0) : frenzy ? 3.8 : 3.0
          );
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            createWolfBloodTrail(data, data.dashStartPosition || enemy.position, enemy.position);
            data.abilityState = 'idle';
            data.abilityTimer = getBossAbilityDelay(data, frenzy ? 4 : 6, frenzy ? 6 : 9);
          }
        } else if (data.abilityState === 'retreat') {
          direction.multiplyScalar(-2.2);
          data.abilityPhaseTimer -= delta;
          if (data.abilityPhaseTimer <= 0) {
            startHowl();
            data.abilityPhaseTimer = frenzy ? 0.5 : 0.8;
          }
        } else {
          direction.multiplyScalar(frenzy ? 1.18 : 1.0);
        }
      }
      const nextEnemyPosition = enemy.position.clone().addScaledVector(direction, speed);
      if (data.type !== 'jumper' || !data.jumping) {
        resolveStaticCollisions(nextEnemyPosition, data.type === 'tank' ? 1.15 : 0.8);
      }
      enemy.position.copy(nextEnemyPosition);
    }

    if (enemy.userData.healthGroup) {
      const cameraPosition = new THREE.Vector3();
      camera.getWorldPosition(cameraPosition);
      enemy.userData.healthGroup.lookAt(cameraPosition);
      enemy.userData.healthGroup.rotateX(-Math.PI / 8);
    }

    if (data.type !== 'jumper' && !data.entityHidden && enemy.position.distanceTo(player.position) < (data.type === 'entity' ? 2.7 : 1.9)) {
      data.hitCooldown = (data.hitCooldown || 0) - delta;
      if (data.hitCooldown === undefined || data.hitCooldown <= 0) {
        const baseDamage = bossEnemyTypes.has(data.type)
          ? data.type === 'electrician' ? 1 : 2
          : 1;
        damagePlayer(baseDamage * (data.bossDamageMultiplier || 1));
        if (data.type === 'boss') playOneShot(localGameSounds.bruteAttack, 0.85);
        data.hitCooldown = 1.0;
        // empurra o zumbi um pouco pra trás em vez de matá-lo no toque
        const knockback = new THREE.Vector3().subVectors(enemy.position, player.position).setY(0).normalize();
        enemy.position.addScaledVector(knockback, 1.6);
      }
    }

    const boundaryPad = 170;
    if (data.type === 'parasite' || data.infectedParasite) {
      enemy.position.x = Math.max(-boundaryPad, Math.min(boundaryPad, enemy.position.x));
      enemy.position.z = Math.max(-boundaryPad, Math.min(boundaryPad, enemy.position.z));
    } else if (Math.abs(enemy.position.x) > boundaryPad || Math.abs(enemy.position.z) > boundaryPad) {
      scene.remove(enemy);
      enemies.splice(i, 1);
      continue;
    }

    if (data.sprite && data.spriteBaseScale) {
      const moved = Math.hypot(enemy.position.x - previousX, enemy.position.z - previousZ) > 0.002;
      const heavy = data.type === 'tank' || bossEnemyTypes.has(data.type);
      data.walkPhase += delta * (moved ? (heavy ? 4.2 : 8) : 2);
      const stride = Math.sin(data.walkPhase);
      const step = data.type === 'jumper' && data.jumping ? 0 : moved ? Math.abs(stride) : Math.abs(stride) * 0.18;
      enemy.position.y = data.groundY + (data.type === 'jumper' ? data.jumpHeight : data.type === 'entity' ? 0.2 + Math.sin(performance.now() * 0.002 + data.walkPhase) * 0.16 : 0) + step * (heavy ? 0.035 : 0.055);
      data.sprite.scale.set(
        data.spriteBaseScale.x * (1 + step * 0.035),
        data.spriteBaseScale.y * (1 - step * 0.018),
        data.spriteBaseScale.z
      );
      data.sprite.material.rotation = moved ? stride * (heavy ? 0.018 : 0.035) : stride * 0.008;
    }
    if (data.jumpShadow) {
      data.jumpShadow.position.y = -data.jumpHeight + 0.025;
      const shadowScale = Math.max(0.42, 1 - data.jumpHeight * 0.08);
      data.jumpShadow.scale.set(1.25 * shadowScale, 0.72 * shadowScale, 1);
      data.jumpShadow.material.opacity = Math.max(0.2, 0.58 - data.jumpHeight * 0.045);
    }
  }
}

function playDamageSound() {
  const now = performance.now();
  if (now - lastDamageFeedbackAt < 420) return;
  lastDamageFeedbackAt = now;

  // Tenta o áudio incorporado primeiro. Se o navegador bloquear, usa um
  // efeito WebAudio curto para garantir que exista feedback sonoro.
  try {
    if (damageSoundElement && damageSoundElement.src) {
      damageSoundElement.currentTime = 0;
      damageSoundElement.volume = Math.min(1, soundVolume * effectsVolume * 0.90);
      const p = damageSoundElement.play();
      if (p && typeof p.catch === 'function') p.catch(() => playDamageWebAudio());
      return;
    }
  } catch (e) {}
  playDamageWebAudio();
}

function playDamageWebAudio() {
  try {
    const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, soundVolume * effectsVolume * 0.09), t + 0.012);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    master.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(155, t);
    osc.frequency.exponentialRampToValueAtTime(78, t + 0.28);
    osc.connect(master);
    osc.start(t);
    osc.stop(t + 0.34);

    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(105, t);
    osc2.frequency.exponentialRampToValueAtTime(62, t + 0.26);
    g2.gain.value = 0.35;
    osc2.connect(g2).connect(master);
    osc2.start(t);
    osc2.stop(t + 0.3);
  } catch (e) {}
}

function showDamageEffect() {
  if (!damageVignetteElement) return;
  const now = performance.now();
  // Não reinicia o efeito a cada frame/contato contínuo.
  if (now - lastDamageFeedbackAt > 120) return;
  damageEffectUntil = Math.min(Math.max(damageEffectUntil, now) + 2000, now + 10000);
  if (!damageVignetteElement.classList.contains('active')) {
    damageVignetteElement.classList.add('active');
  }
  clearTimeout(damageEffectTimer);
  damageEffectTimer = setTimeout(() => {
    if (performance.now() >= damageEffectUntil) {
      damageVignetteElement.classList.remove('active');
    }
  }, 2050);
}

function showHealEffect() {
  if (!healVignetteElement) return;
  healVignetteElement.classList.remove('active');
  void healVignetteElement.offsetWidth;
  healVignetteElement.classList.add('active');
}

function damagePlayer(amount) {
  const oldHealth = playerHealth;
  playerHealth = Math.max(0, playerHealth - amount);
  if (playerHealth >= oldHealth) return;
  updateHealthDisplay();
  playDamageSound();
  showDamageEffect();
  showGameNotification('Você foi atingido!', 'damage');
  if (playerHealth <= 0) endGame();
}

function endGame() {
  gameOver = true;
  controlsEnabled = false;
  document.exitPointerLock?.();
  stopAudio(matchMusic);
  playOneShot(youDiedSound, 1);
  if (gameoverScoreElement) gameoverScoreElement.textContent = `Pontuação final: ${score}`;
  bestWave = Math.max(bestWave, currentWave);
  localStorage.setItem('forestBestWave', String(bestWave));
  if (gameoverWaveElement) gameoverWaveElement.textContent = `Onda alcançada: ${currentWave}`;
  if (gameoverBestElement) gameoverBestElement.textContent = `Recorde: ${bestWave}`;
  gameOverElement?.classList.remove('hidden');
}

function jumpPlayer() {
  if (!playerGrounded || playerStunTimer > 0 || !gameStarted || paused || gameOver) return;
  playerVerticalVelocity = playerJumpStrength;
  playerGrounded = false;
}

/* ---------- Movimento ---------- */
function updatePlayer(delta) {
  const stunned = playerStunTimer > 0;
  playerStunTimer = Math.max(0, playerStunTimer - delta);
  const keyboardMoving = !stunned && (keys.w || keys.a || keys.s || keys.d);
  const touchMoving = !stunned && (Math.abs(touchMoveVector.x) > 0.01 || Math.abs(touchMoveVector.z) > 0.01);
  isSprinting = (keys.shift || touchSprintHeld) && (keyboardMoving || touchMoving) && !isReloading;
  const sprintMultiplier = isSprinting ? 1.7 : 1;
  const speed = 12 * delta * moveSpeedMultiplier * sprintMultiplier;
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(player.quaternion).setY(0).normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(player.quaternion).setY(0).normalize();
  const movement = new THREE.Vector3();

  if (!stunned && keys.w) movement.add(forward);
  if (!stunned && keys.s) movement.add(forward.clone().negate());
  if (!stunned && keys.a) movement.add(right.clone().negate());
  if (!stunned && keys.d) movement.add(right);

  if (touchMoving) {
    movement.add(forward.clone().multiplyScalar(-touchMoveVector.z));
    movement.add(right.clone().multiplyScalar(touchMoveVector.x));
  }

  if (movement.lengthSq() > 0) {
    movement.normalize().multiplyScalar(speed);
    const nextPlayerPosition = player.position.clone().add(movement);
    resolveStaticCollisions(nextPlayerPosition, 0.72);
    player.position.copy(nextPlayerPosition);
  }

  // Física simples do pulo.
  playerVerticalVelocity -= playerGravity * delta;
  player.position.y += playerVerticalVelocity * delta;

  if (player.position.y <= 0) {
    player.position.y = 0;
    playerVerticalVelocity = 0;
    playerGrounded = true;
  }

  const boundary = 158;
  player.position.x = THREE.MathUtils.clamp(player.position.x, -boundary, boundary);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -boundary, boundary);
}

/* ---------- Menus ---------- */
function showScreen(el) { el?.classList.remove('hidden'); }
function hideScreen(el) { el?.classList.add('hidden'); }

const bossChoiceElement = document.getElementById('boss-choice-screen');
document.getElementById('buff-damage')?.addEventListener('click', () => applyBossBuff('damage'));
document.getElementById('buff-health')?.addEventListener('click', () => applyBossBuff('health'));
document.getElementById('buff-speed')?.addEventListener('click', () => applyBossBuff('speed'));

function triggerBossChoice() {
  paused = true;
  document.exitPointerLock?.();
  showScreen(bossChoiceElement);
}

function applyBossBuff(kind) {
  if (kind === 'damage') {
    damageMultiplier *= 1.15;
    if (messageElement) messageElement.textContent = 'Fúria ativada: +15% de dano!';
  } else if (kind === 'health') {
    maxPlayerHealth = Math.min(MAX_PLAYER_HEALTH, maxPlayerHealth + 2);
    playerHealth = maxPlayerHealth;
    updateHealthDisplay();
    if (messageElement) messageElement.textContent = 'Fortaleza ativada: +2 de vida máxima, vida restaurada!';
  } else if (kind === 'speed') {
    moveSpeedMultiplier *= 1.15;
    if (messageElement) messageElement.textContent = 'Ímpeto ativado: +15% de velocidade!';
  }
  hideScreen(bossChoiceElement);
  paused = false;
  enablePointerLock();
}

function openSettings(fromMenu) {
  settingsOpenedFromMenu = fromMenu;
  showScreen(settingsMenuElement);
  resumeButton?.classList.toggle('hidden', fromMenu);
  restartButton?.classList.toggle('hidden', fromMenu);
  if (fromMenu) {
    hideScreen(mainMenuElement);
  } else {
    paused = true;
    document.exitPointerLock?.();
    if (messageElement) messageElement.textContent = 'Configurações abertas. Ajuste sensibilidade e volume.';
  }
}

function closeSettings() {
  hideScreen(settingsMenuElement);
  if (settingsOpenedFromMenu) {
    showScreen(mainMenuElement);
  } else {
    paused = false;
    if (messageElement) messageElement.textContent = 'Jogo retomado.';
    enablePointerLock();
  }
}

function resumeGame() {
  settingsOpenedFromMenu = false;
  hideScreen(settingsMenuElement);
  hideScreen(shopMenuElement);
  paused = false;
  if (messageElement) messageElement.textContent = 'Jogo retomado.';
  enablePointerLock();
}

function togglePause() {
  if (!gameStarted || gameOver) return;
  if (settingsMenuElement.classList.contains('hidden')) {
    openSettings(false);
  } else {
    closeSettings();
  }
}

function openShopMenu() {
  if (!gameStarted || gameOver) return;
  paused = true;
  document.body.classList.add('shop-open');
  document.exitPointerLock?.();
  updateShopButtons();
  showScreen(shopMenuElement);
  matchMusic.pause();
  tryPlay(shopMusic);
  if (messageElement) messageElement.textContent = 'Loja aberta. Escolha melhorias e confira a sucata disponível.';
}

function closeShopMenu(resumeGame = true) {
  document.body.classList.remove('shop-open');
  hideScreen(shopMenuElement);
  stopAudio(shopMusic);
  if (resumeGame) {
    paused = false;
    if (gameStarted && !gameOver) {
      tryPlay(matchMusic);
      enablePointerLock();
    }
  }
}

function enablePointerLock() {
  renderer.domElement.requestPointerLock?.();
}

function startGame() {
  gameStarted = true;
  hideScreen(mainMenuElement);
  showScreen(gameUiElement);
  hideScreen(gameOverElement);
  stopAudio(menuMusic);
  matchMusicTrackIndex = 0;
  matchMusic.src = matchMusicTracks[matchMusicTrackIndex];
  matchMusic.load();
  matchMusic.currentTime = 0;
  tryPlay(matchMusic);
  tryPlay(localGameSounds.campfire);
  resetGame();
  enablePointerLock();
}

function resetGame() {
  score = 0;
  scrap = 20;
  gameOver = false;
  itemSpawnTimer = 0;
  nextItemAt = 42;
  mimicGreatswordDropped = false;
  vestLevel = 0;
  reloadPerkLevel = 0;
  lifestealLevel = 0;
  reloadDuration = 1.6;
  maxPlayerHealth = STARTING_PLAYER_HEALTH;
  playerHealth = maxPlayerHealth;
  paused = false;
  currentWave = 1;
  resetBossOrder();
  reserveAmmoByWeapon.pistol = 24;
  reserveAmmoByWeapon.shotgun = 0;
  reserveAmmoByWeapon.shotgun12 = 0;
  reserveAmmoByWeapon.smg = 0;
  reserveAmmoByWeapon.rifle = 0;
  reserveAmmoByWeapon.grenadeLauncher = 0;
  damageMultiplier = 1;
  moveSpeedMultiplier = 1;
  unlockedWeapons.clear();
  unlockedWeapons.add('pistol');
  unlockedWeapons.add('knife');
  weaponAmmo.pistol = weaponDefs.pistol.clipSize;
  weaponAmmo.knife = 999;
  weaponAmmo.shotgun = 0;
  weaponAmmo.smg = 0;
  weaponAmmo.rifle = 0;
  weaponAmmo.grenadeLauncher = 0;
  weaponAmmo.doomSword = 999;
  weaponAmmo.greatsword = 999;
  currentWeaponId = 'pistol';
  questAccepted = false;
  questDone = false;
  questKills = 0;
  questEliteKills = 0;
  scientistQuestAccepted = false;
  scientistQuestDone = false;
  scientistQuestKills = 0;
  frogDead = false;
  weaponAttackTimer = 0;
  weaponSpecialCooldownTimer = 0;
  removeSpecialActors();
  spawnDoomguy();
  spawnSecretFrog();
  ammo = weaponAmmo.pistol;
  fireCooldownTimer = 0;
  camera.remove(playerGun);
  playerGun = createWeaponMesh('pistol');
  camera.add(playerGun);
  updateShopButtons();

  playerHealth = maxPlayerHealth;
  isReloading = false;
  reloadTimer = 0;
  pendingReloadAmount = 0;
  reloadingWeaponId = null;
  spawnInterval = 1.4;
  spawnTimer = 0;
  enemiesThisWave = 0;
  enemiesToSpawnThisWave = 0;
  bossThisWave = false;
  bossSpawned = false;

  bullets.forEach((b) => scene.remove(b));
  grenadeProjectiles.forEach((grenade) => {
    scene.remove(grenade);
    grenade.geometry.dispose();
    grenade.material.dispose();
  });
  enemies.forEach((e) => scene.remove(e));
  pickups.forEach((p) => scene.remove(p));
  chests.forEach((chest) => {
    scene.remove(chest.sprite);
    chest.sprite.material.dispose();
  });
  chestSmokeEffects.forEach((cloud) => {
    scene.remove(cloud);
    cloud.traverse((part) => {
      part.geometry?.dispose();
      part.material?.dispose();
    });
  });
  enemyProjectiles.forEach((p) => scene.remove(p));
  acidPuddles.forEach((p) => scene.remove(p));
  electricCharges.forEach((charge) => {
    scene.remove(charge);
    charge.traverse((part) => {
      if (part.geometry) part.geometry.dispose();
      if (part.material) {
        if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
        else part.material.dispose();
      }
    });
  });
  electricDetonations.forEach((effect) => {
    scene.remove(effect.group);
    effect.group.traverse((part) => {
      if (part.geometry) part.geometry.dispose();
      if (part.material) {
        if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
        else part.material.dispose();
      }
    });
  });
  electricBolts.forEach((effect) => {
    scene.remove(effect.mesh);
    effect.mesh.geometry.dispose();
    effect.mesh.material.dispose();
  });
  bullets.length = 0;
  grenadeProjectiles.length = 0;
  enemies.length = 0;
  pickups.length = 0;
  chests.length = 0;
  chestSmokeEffects.length = 0;
  enemyProjectiles.length = 0;
  acidPuddles.length = 0;
  electricCharges.length = 0;
  electricDetonations.length = 0;
  electricBolts.length = 0;
  updateBossHealthDisplay();

  player.position.set(0, 0, 0);
  playerVerticalVelocity = 0;
  playerGrounded = true;
  playerStunTimer = 0;
  hideScreen(settingsMenuElement);
  hideScreen(shopMenuElement);
  hideScreen(gameOverElement);

  updateHealthDisplay();
  updateAmmoDisplay();
  updateScrapDisplay();
  startWave();
  if (scoreElement) scoreElement.textContent = 'Pontuação: 0';
  if (messageElement) messageElement.textContent = 'Zumbis chegando! Sobreviva o máximo possível.';
}

/* ---------- Eventos de UI ---------- */
playButton?.addEventListener('click', startGame);
openSettingsFromMenuButton?.addEventListener('click', () => openSettings(true));
openCityMapButton?.addEventListener('click', () => { window.location.href = 'missao-zumbi-3d-cidade.html'; });
resumeButton?.addEventListener('click', resumeGame);
restartButton?.addEventListener('click', () => { closeSettings(); resetGame(); });
closeShopButton?.addEventListener('click', closeShopMenu);
gameoverRestartButton?.addEventListener('click', () => { hideScreen(gameOverElement); startGame(); });

/* autoplay só é permitido pelo navegador após uma interação do usuário —
   tenta tocar a música do menu assim que a pessoa interagir pela 1ª vez,
   mas só se o menu principal ainda estiver visível (evita tocar por cima da partida) */
tryPlay(menuMusic);
document.addEventListener('pointerdown', function unlockMenuMusic() {
  if (!mainMenuElement.classList.contains('hidden')) tryPlay(menuMusic);
  document.removeEventListener('pointerdown', unlockMenuMusic);
}, { once: true });

/* ---------- Fogueira aprimorada: chama em camadas, brasas e luz pulsante ---------- */
const enhancedFireFlames = [];
const enhancedEmbers = [];
const enhancedFireLights = [];

function buildEnhancedFire() {
  const flameMaterials = [
    new THREE.MeshBasicMaterial({ color: 0xff4a18, transparent: true, opacity: 0.72, blending: THREE.AdditiveBlending, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: 0xff9d22, transparent: true, opacity: 0.78, blending: THREE.AdditiveBlending, depthWrite: false }),
    new THREE.MeshBasicMaterial({ color: 0xffe38a, transparent: true, opacity: 0.88, blending: THREE.AdditiveBlending, depthWrite: false })
  ];
  const flameSizes = [[0.48,1.35],[0.34,1.05],[0.24,0.82],[0.19,0.66]];
  flameSizes.forEach((size, i) => {
    const flame = new THREE.Mesh(new THREE.ConeGeometry(size[0], size[1], 8), flameMaterials[i % flameMaterials.length]);
    flame.position.set((Math.random()-0.5)*0.28, 0.35 + size[1]*0.48, (Math.random()-0.5)*0.28);
    flame.rotation.z = (Math.random()-0.5)*0.28;
    flame.userData = { baseScaleX: 1, phase: Math.random()*Math.PI*2, speed: 3.0 + Math.random()*2.2 };
    campfireGroup.add(flame);
    enhancedFireFlames.push(flame);
  });

  for (let i = 0; i < 24; i++) {
    const ember = new THREE.Mesh(
      new THREE.SphereGeometry(0.025 + Math.random()*0.025, 5, 5),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0xffe08a : 0xff6a1a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
    );
    ember.position.set((Math.random()-0.5)*0.7, 0.35 + Math.random()*0.35, (Math.random()-0.5)*0.7);
    ember.userData = { life: Math.random(), phase: Math.random()*Math.PI*2, speed: 0.35 + Math.random()*0.7 };
    campfireGroup.add(ember);
    enhancedEmbers.push(ember);
  }

  for (const data of [
    { color: 0xff5a20, intensity: 1.7, distance: 15, y: 0.7 },
    { color: 0xffb13b, intensity: 0.8, distance: 8, y: 1.5 }
  ]) {
    const light = new THREE.PointLight(data.color, data.intensity, data.distance, 2);
    light.position.y = data.y;
    campfireGroup.add(light);
    enhancedFireLights.push(light);
  }
}

function updateEnhancedFire(t) {
  for (const flame of enhancedFireFlames) {
    const pulse = 1 + Math.sin(t * flame.userData.speed + flame.userData.phase) * 0.12;
    flame.scale.set(0.9 + pulse*0.12, pulse, 0.9 + pulse*0.12);
    flame.rotation.z += 0.002;
  }
  for (const ember of enhancedEmbers) {
    ember.userData.life += 0.012;
    if (ember.userData.life > 1) {
      ember.userData.life = 0;
      ember.position.set((Math.random()-0.5)*0.7, 0.35 + Math.random()*0.25, (Math.random()-0.5)*0.7);
    }
    ember.position.y += 0.012 * ember.userData.speed;
    ember.position.x += Math.sin(t*2 + ember.userData.phase) * 0.002;
    ember.material.opacity = Math.max(0, 0.85 - ember.userData.life*0.9);
  }
  const pulse = 1 + Math.sin(t*7.5)*0.12 + Math.sin(t*13.1)*0.06;
  if (enhancedFireLights[0]) enhancedFireLights[0].intensity = 1.65 * pulse;
  if (enhancedFireLights[1]) enhancedFireLights[1].intensity = 0.78 * (1 + Math.sin(t*9.2)*0.15);
}

buildEnhancedFire();

/* ---------- Entradas ---------- */
renderer.domElement.addEventListener('click', () => {
  if (gameStarted && !gameOver && !controlsEnabled) enablePointerLock();
});

document.addEventListener('pointerlockchange', () => {
  controlsEnabled = document.pointerLockElement === renderer.domElement;
  if (!controlsEnabled && gameStarted && !gameOver && !paused) {
    paused = true;
    pauseOpenedByPointerUnlock = true;
    openSettings(false);
    setTimeout(() => { pauseOpenedByPointerUnlock = false; }, 150);
  }
});

renderer.domElement.addEventListener('mousemove', (event) => {
  if (!controlsEnabled || gameOver || paused) return;
  yaw -= event.movementX * pointerSensitivity;
  pitch -= event.movementY * pointerSensitivity;
  pitch = THREE.MathUtils.clamp(pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
  player.rotation.y = yaw;
  camera.rotation.x = pitch;
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') event.preventDefault();
  if (event.code === 'KeyW') keys.w = true;
  if (event.code === 'KeyA') keys.a = true;
  if (event.code === 'KeyS') keys.s = true;
  if (event.code === 'KeyD') keys.d = true;
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') keys.shift = true;
  if (event.code === 'KeyR' && gameStarted && !gameOver) reloadWeapon();
  if (event.code === 'KeyR' && gameOver) { hideScreen(gameOverElement); startGame(); }
  if (event.code === 'KeyF' && gameStarted && !gameOver && !paused) interactWithChest();
  if (event.code === 'KeyE' && gameStarted && !gameOver) {
    if (!shopMenuElement.classList.contains('hidden')) closeShopMenu();
    else if (!paused) openShopMenu();
  }
  if (event.code === 'Digit1') switchWeapon('knife');
  if (event.code === 'Digit2') switchWeapon('pistol');
  if (event.code === 'Digit4') switchWeapon('shotgun');
  if (event.code === 'Digit5') switchWeapon('smg');
  if (event.code === 'Digit6') switchWeapon('rifle');
  if (event.code === 'Digit3') switchWeapon('shotgun12');
  if (event.code === 'Digit7') switchWeapon('grenadeLauncher');
  if (event.code === 'Digit8') switchWeapon('doomSword');
  if (event.code === 'Digit9') switchWeapon('greatsword');
  if (event.code === 'Escape') {
    event.preventDefault();
    if (pauseOpenedByPointerUnlock) {
      pauseOpenedByPointerUnlock = false;
      return;
    }
    if (!shopMenuElement.classList.contains('hidden')) {
      closeShopMenu(false);
      openSettings(false);
    } else {
      togglePause();
    }
  }
  if (event.code === 'Space' && gameStarted && !paused && !gameOver) {
    jumpPlayer();
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (event.code === 'KeyW') keys.w = false;
  if (event.code === 'KeyA') keys.a = false;
  if (event.code === 'KeyS') keys.s = false;
  if (event.code === 'KeyD') keys.d = false;
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') keys.shift = false;
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (!gameStarted || paused || gameOver) return;

  // Botão direito: liga/desliga a mira.
  if (event.button === 2) {
    if (currentWeaponId === 'doomSword') {
      doomAreaAttack();
      event.preventDefault();
      return;
    }
    if (currentWeaponId === 'greatsword') {
      castGreatswordWave();
      event.preventDefault();
      return;
    }
    aiming = !aiming;
    document.body.classList.toggle('aiming', aiming);
    camera.fov = aiming ? aimFov : normalFov;
    camera.updateProjectionMatrix();
    event.preventDefault();
    return;
  }

  // Botão esquerdo: atira normalmente, inclusive enquanto está mirando.
  if (event.button === 0) {
    mouseHeld = true;
    shoot();
  }
});

window.addEventListener('pointerup', (event) => {
  if (event.button === 0) mouseHeld = false;
});

renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());
window.addEventListener('blur', () => {
  mouseHeld = false;
  aiming = false;
  document.body.classList.remove('aiming');
  camera.fov = normalFov;
  camera.updateProjectionMatrix();
});


/* ---------- Controles touch (celular) ---------- */
if (isTouchDevice) {
  document.body.classList.add('touch-mode');

  const joystickZone = document.getElementById('touch-joystick-zone');
  const joystickKnob = document.getElementById('touch-joystick-knob');
  const lookZone = document.getElementById('touch-look-zone');
  const fireButton = document.getElementById('touch-fire-button');
  const specialButton = document.getElementById('touch-special-button');
  const reloadButton = document.getElementById('touch-reload-button');
  const sprintButton = document.getElementById('touch-sprint-button');
  const shopButton = document.getElementById('touch-shop-button');
  const menuButton = document.getElementById('touch-menu-button');
  const chestButton = document.getElementById('touch-chest-button');

  chestButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameStarted && !gameOver && !paused) interactWithChest();
  }, { passive: false });

  let joystickTouchId = null;
  const joystickRadius = 55;

  joystickZone?.addEventListener('touchstart', (e) => {
    if (joystickTouchId !== null) return;
    const touch = e.changedTouches[0];
    joystickTouchId = touch.identifier;
    e.preventDefault();
  }, { passive: false });

  joystickZone?.addEventListener('touchmove', (e) => {
    for (const touch of e.changedTouches) {
      if (touch.identifier !== joystickTouchId) continue;
      const rect = joystickZone.getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      let dx = touch.clientX - originX;
      let dy = touch.clientY - originY;
      const dist = Math.min(joystickRadius, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * dist;
      dy = Math.sin(angle) * dist;
      touchMoveVector.x = dx / joystickRadius;
      touchMoveVector.z = dy / joystickRadius;
      if (joystickKnob) joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
      e.preventDefault();
    }
  }, { passive: false });

  function releaseJoystick(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier !== joystickTouchId) continue;
      joystickTouchId = null;
      touchMoveVector.x = 0;
      touchMoveVector.z = 0;
      if (joystickKnob) joystickKnob.style.transform = 'translate(0px, 0px)';
    }
  }
  joystickZone?.addEventListener('touchend', releaseJoystick);
  joystickZone?.addEventListener('touchcancel', releaseJoystick);

  let lookTouchId = null;
  let lastLookX = 0;
  let lastLookY = 0;
  const touchLookSensitivity = 0.0042;

  lookZone?.addEventListener('touchstart', (e) => {
    if (lookTouchId !== null) return;
    const touch = e.changedTouches[0];
    lookTouchId = touch.identifier;
    lastLookX = touch.clientX;
    lastLookY = touch.clientY;
    e.preventDefault();
  }, { passive: false });

  lookZone?.addEventListener('touchmove', (e) => {
    if (paused || gameOver || !controlsEnabled) return;
    for (const touch of e.changedTouches) {
      if (touch.identifier !== lookTouchId) continue;
      const dx = touch.clientX - lastLookX;
      const dy = touch.clientY - lastLookY;
      lastLookX = touch.clientX;
      lastLookY = touch.clientY;
      yaw -= dx * touchLookSensitivity * (pointerSensitivity / 0.0024);
      pitch -= dy * touchLookSensitivity * (pointerSensitivity / 0.0024);
      pitch = THREE.MathUtils.clamp(pitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
      player.rotation.y = yaw;
      camera.rotation.x = pitch;
      e.preventDefault();
    }
  }, { passive: false });

  function releaseLook(e) {
    for (const touch of e.changedTouches) {
      if (touch.identifier === lookTouchId) lookTouchId = null;
    }
  }
  lookZone?.addEventListener('touchend', releaseLook);
  lookZone?.addEventListener('touchcancel', releaseLook);

  fireButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    mouseHeld = true;
    if (gameStarted && !paused && !gameOver) shoot();
  }, { passive: false });
  fireButton?.addEventListener('touchend', () => { mouseHeld = false; });
  fireButton?.addEventListener('touchcancel', () => { mouseHeld = false; });

  specialButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    doomAreaAttack();
  }, { passive: false });

  reloadButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameStarted && !gameOver) reloadWeapon();
  }, { passive: false });

  sprintButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchSprintHeld = true;
    sprintButton.classList.add('active');
  }, { passive: false });

  const releaseSprint = () => {
    touchSprintHeld = false;
    sprintButton?.classList.remove('active');
  };
  sprintButton?.addEventListener('touchend', releaseSprint);
  sprintButton?.addEventListener('touchcancel', releaseSprint);

  shopButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameStarted && !gameOver && !paused) openShopMenu();
  }, { passive: false });

  menuButton?.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!shopMenuElement.classList.contains('hidden')) {
      closeShopMenu();
    } else {
      togglePause();
    }
  }, { passive: false });

  document.querySelectorAll('.touch-weapon-btn').forEach((btn) => {
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      switchWeapon(btn.dataset.weapon);
    }, { passive: false });
  });
}

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
});

const crosshair = document.createElement('div');
crosshair.id = 'crosshair';
document.body.appendChild(crosshair);

const reloadBarUI = document.createElement('div');
reloadBarUI.id = 'reload-bar-ui';
reloadBarUI.innerHTML = '<div id="reload-bar-fill"></div>';
document.body.appendChild(reloadBarUI);
const reloadBarFill = document.getElementById('reload-bar-fill');

function updateReloadBar() {
  if (!reloadBarUI || !reloadBarFill) return;
  if (!isReloading) {
    reloadBarUI.classList.remove('show');
    reloadBarFill.style.width = '0%';
    return;
  }
  const progress = Math.max(0, Math.min(1, reloadTimer / Math.max(0.01, reloadDuration)));
  reloadBarUI.classList.add('show');
  reloadBarFill.style.width = `${progress * 100}%`;
}


function updateMuzzleFlashes(delta) {
  for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
    const flash = muzzleFlashes[i];
    flash.life -= delta;
    const ratio = Math.max(0, flash.life / flash.maxLife);
    flash.light.intensity = 3.2 * ratio;
    flash.sprite.material.opacity = 0.95 * ratio;
    flash.sprite.scale.setScalar(0.55 * (1 + (1 - ratio) * 0.8));
    if (flash.life <= 0) {
      camera.remove(flash.light);
      camera.remove(flash.sprite);
      muzzleFlashes.splice(i, 1);
    }
  }
}

/* ---------- Ambiente vivo (roda sempre, até no menu) ---------- */
function updateAmbience(elapsed, delta) {
  const activeFlame = campfireGroup.userData.flameSprite || flameMesh;
  activeFlame.scale.y = (campfireGroup.userData.flameSprite ? 2.0 : 1) * (1 + Math.sin(elapsed * 14) * 0.12);
  activeFlame.scale.x = (campfireGroup.userData.flameSprite ? 1.6 : 1) * (1 + Math.cos(elapsed * 11) * 0.08);
  fireLight.intensity = 1.4 + Math.sin(elapsed * 18) * 0.35 + Math.random() * 0.1;

  for (const firefly of fireflies) {
    const d = firefly.userData;
    firefly.position.x = d.baseX + Math.sin(elapsed * d.speed + d.phase) * 2.2;
    firefly.position.z = d.baseZ + Math.cos(elapsed * d.speed * 0.8 + d.phase) * 2.2;
    firefly.position.y = 0.8 + Math.sin(elapsed * d.speed * 1.4 + d.phase) * 0.6;
    firefly.material.opacity = 0.5 + Math.sin(elapsed * 3 + d.phase) * 0.35;
  }

  for (const bush of decoBushes.children) {
    bush.rotation.z = Math.sin(elapsed * 0.6 + bush.userData.phase) * 0.05;
  }
}

/* ---------- Loop principal ---------- */
const clock = new THREE.Clock();


/* ---------- Conteúdo especial da Floresta: Doomguy, Espada Doom e sapo secreto ---------- */
let doomguyNpc = null, scientistNpc = null, questAccepted = false, questDone = false, questKills = 0, questEliteKills = 0;
let scientistQuestAccepted = false, scientistQuestDone = false, scientistQuestKills = 0;
let secretFrog = null, frogDead = false;
const QUEST_TARGET = 35;
const QUEST_ELITE_TARGET = 2;
const QUEST_ELITE_TYPES = new Set(['boss', 'wolf', 'necromancer', 'parasiteBoss', 'electrician']);
const SCIENTIST_APPEAR_WAVE = 14;
const SCIENTIST_QUEST_TARGET = 50;
function spawnDoomguy() {
  if (doomguyNpc) return;
  doomguyNpc = new THREE.Group();
  const material = new THREE.SpriteMaterial({ map: doomguyTexture, color: doomguyTexture ? 0xffffff : 0x7fbf55, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material); sprite.scale.set(3.2, 4.2, 1); sprite.position.y = 2.1; doomguyNpc.add(sprite);
  doomguyNpc.position.set(doomguyClearing.x - 9, -1.5, doomguyClearing.z - 9); scene.add(doomguyNpc);
}
function spawnScientist() {
  if (scientistNpc) return;
  scientistNpc = new THREE.Group();
  const material = new THREE.SpriteMaterial({ map: soldierTexture, color: soldierTexture ? 0xffffff : 0x8fef4d, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.0, 4.0, 1);
  sprite.position.y = 2;
  scientistNpc.add(sprite);
  scientistNpc.position.set(-17.5, -1.5, 22);
  scene.add(scientistNpc);
}
function removeSpecialActors() {
  if (doomguyNpc) { scene.remove(doomguyNpc); doomguyNpc = null; }
  if (scientistNpc) { scene.remove(scientistNpc); scientistNpc = null; }
  if (secretFrog) { scene.remove(secretFrog); secretFrog = null; }
}
function npcNear() { return !!doomguyNpc && doomguyNpc.position.distanceTo(player.position) <= 7.5; }
function scientistNear() { return !!scientistNpc && scientistNpc.position.distanceTo(player.position) <= 7.5; }
function frogNear() { return !!secretFrog && !frogDead && secretFrog.position.distanceTo(player.position) <= 7.5; }
function refreshNpcUI() {
  const prompt = document.getElementById('npc-prompt'); if (!prompt) return;
  const nearbyNpcs = [];
  if (npcNear() && !questDone) nearbyNpcs.push({ name: 'Doom Guy', distance: doomguyNpc.position.distanceTo(player.position) });
  if (scientistNear()) nearbyNpcs.push({ name: 'Soldado', distance: scientistNpc.position.distanceTo(player.position) });
  if (frogNear()) nearbyNpcs.push({ name: 'Sapo', prompt: 'Pressione Q para ouvir o sapo', distance: secretFrog.position.distanceTo(player.position) });
  nearbyNpcs.sort((a, b) => a.distance - b.distance);
  prompt.textContent = nearbyNpcs.length
    ? nearbyNpcs[0].prompt || `Pressione Q para falar com ${nearbyNpcs[0].name}`
    : '';
  prompt.classList.toggle('show', nearbyNpcs.length > 0);
}
function closeNpcDialog() {
  document.getElementById('npc-dialog').classList.remove('show');
  document.getElementById('npc-dialog-choices').replaceChildren();
  document.getElementById('npc-dialog-action').style.display = '';
  paused = false;
  enablePointerLock();
}
function showNpcChoices(title, text, options) {
  const dialog = document.getElementById('npc-dialog');
  const choices = document.getElementById('npc-dialog-choices');
  document.getElementById('npc-dialog-title').textContent = title;
  document.getElementById('npc-dialog-text').textContent = text;
  document.getElementById('npc-dialog-action').style.display = 'none';
  choices.replaceChildren();
  for (const option of options) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = option.label;
    button.addEventListener('click', option.onSelect);
    choices.append(button);
  }
  dialog.classList.add('show');
  paused = true;
  document.exitPointerLock?.();
}
function talkNpc() {
  const nearbyActors = [];
  if (npcNear() && !questDone) nearbyActors.push({ kind: 'doomguy', distance: doomguyNpc.position.distanceTo(player.position) });
  if (scientistNear()) nearbyActors.push({ kind: 'scientist', distance: scientistNpc.position.distanceTo(player.position) });
  if (frogNear()) nearbyActors.push({ kind: 'frog', distance: secretFrog.position.distanceTo(player.position) });
  nearbyActors.sort((a, b) => a.distance - b.distance);
  if (nearbyActors[0]?.kind === 'frog') {
    talkToFrog();
    return;
  }
  if (nearbyActors[0]?.kind === 'scientist') {
    talkScientist();
    return;
  }
  if (nearbyActors[0]?.kind !== 'doomguy') return;
  document.getElementById('npc-dialog-choices').replaceChildren();
  document.getElementById('npc-dialog-action').style.display = '';
  const dialog = document.getElementById('npc-dialog');
  const title = document.getElementById('npc-dialog-title');
  const text = document.getElementById('npc-dialog-text');
  const button = document.getElementById('npc-dialog-action');
  document.getElementById('npc-dialog-choices').replaceChildren();
  button.style.display = '';
  document.getElementById('npc-dialog-choices').replaceChildren();
  button.style.display = '';
  dialog.classList.add('show');
  paused = true;
  document.exitPointerLock?.();
  if (!questAccepted) {
    title.textContent = 'SINAL FRACO // DOOM GUY';
    text.textContent = 'Doom Guy: "Você chegou longe. A mata ainda não percebeu. Há uma infestação crescendo aqui: derrube 35 infectados e os dois alfas que comandam as hordas. Quando o último cair, a Espada Doom é sua. Até lá, não desperdice munição nem confiança."';
    button.textContent = 'Aceitar o contrato';
  } else if (!questDone) {
    title.textContent = 'CONTRATO ATIVO // SETOR DA FLORESTA';
    text.textContent = `Doom Guy: "O rádio ainda está aberto. ${Math.min(questKills, QUEST_TARGET)} de ${QUEST_TARGET} infectados e ${Math.min(questEliteKills, QUEST_ELITE_TARGET)} de ${QUEST_ELITE_TARGET} alfas abatidos. Os alfas aparecem nas ondas de chefe. Termine o serviço; eu seguro este posto."`;
    button.textContent = 'Voltar à missão';
  } else {
    title.textContent = 'CONTRATO CUMPRIDO // RECOMPENSA LIBERADA';
    text.textContent = 'Doom Guy: "O silêncio voltou a esta clareira. Você não fugiu quando os alfas apareceram — isso vale mais que munição. A Espada Doom agora é sua. Tecla 8 para equipar; botão direito desfere o golpe em área."';
    button.textContent = 'Fechar';
  }
}
function talkScientist() {
  if (!scientistNear()) return;
  if (!scientistQuestAccepted) {
    showNpcChoices('PATRULHA // SOLDADO', 'Soldado: "O carro ainda segura a posição, mas não por muito tempo. Antes que pergunte: sim, estou procurando alguém capaz de abrir caminho. O que quer saber?"', [
      { label: 'O que aconteceu com o carro?', onSelect: () => showNpcChoices('O COMBOIO // SOLDADO', 'Soldado: "A horda nos cercou na estrada. O motor morreu antes de chegarmos ao posto; fiquei para proteger o equipamento e esperar reforços que nunca vieram."', [
        { label: 'E agora, o que você precisa?', onSelect: () => talkScientist() },
        { label: 'Encerrar conversa', onSelect: closeNpcDialog },
      ]) },
      { label: 'Qual é a missão?', onSelect: () => showNpcChoices('PEDIDO DE APOIO // SOLDADO', 'Soldado: "Derrube 50 zumbis, qualquer tipo. Preciso que a área fique segura. Se conseguir, entrego meu lança-granadas — ele pode mudar o rumo de uma horda."', [
        { label: 'Aceitar missão', onSelect: () => {
          scientistQuestAccepted = true;
          refreshNpcUI();
          showNpcChoices('MISSÃO ACEITA // 50 ELIMINAÇÕES', 'Soldado: "Fechado. Cada infectado conta. Volte quando chegar a 50; vou guardar o lança-granadas para você."', [
            { label: 'Perguntar sobre o lança-granadas', onSelect: () => showNpcChoices('EQUIPAMENTO // SOLDADO', 'Soldado: "É um lança-granadas de uso militar. Mire no meio de um grupo para aproveitar a explosão; vou deixar munição junto com a arma."', [
              { label: 'Encerrar conversa', onSelect: closeNpcDialog },
            ]) },
            { label: 'Encerrar conversa', onSelect: closeNpcDialog },
          ]);
        } },
        { label: 'Por que 50?', onSelect: () => showNpcChoices('A SITUAÇÃO // SOLDADO', 'Soldado: "Menos que isso e a estrada continua tomada. Não precisa limpar a floresta inteira, mas preciso de espaço para tirar o equipamento daqui."', [
          { label: 'Aceitar missão', onSelect: () => {
            scientistQuestAccepted = true;
            refreshNpcUI();
            showNpcChoices('MISSÃO ACEITA // 50 ELIMINAÇÕES', 'Soldado: "Fechado. Cada infectado conta. Volte quando chegar a 50; vou guardar o lança-granadas para você."', [
              { label: 'Encerrar conversa', onSelect: closeNpcDialog },
            ]);
          } },
          { label: 'Voltar', onSelect: () => talkScientist() },
        ]) },
        { label: 'Voltar', onSelect: () => talkScientist() },
      ]) },
      { label: 'Encerrar conversa', onSelect: closeNpcDialog },
    ]);
    return;
  }

  if (!scientistQuestDone) {
    showNpcChoices('MISSÃO ATIVA // SOLDADO', `Soldado: "Já eliminou ${Math.min(scientistQuestKills, SCIENTIST_QUEST_TARGET)} de ${SCIENTIST_QUEST_TARGET}. Continue. O lança-granadas fica reservado para você."`, [
      { label: 'Como funciona o lança-granadas?', onSelect: () => showNpcChoices('EQUIPAMENTO // SOLDADO', 'Soldado: "Dispara granadas explosivas. Mire no meio de um grupo para aproveitar o dano em área e não esqueça de recarregar."', [
        { label: 'Voltar', onSelect: () => talkScientist() },
        { label: 'Encerrar conversa', onSelect: closeNpcDialog },
      ]) },
      { label: 'Encerrar conversa', onSelect: closeNpcDialog },
    ]);
    return;
  }

  showNpcChoices('MISSÃO CONCLUÍDA // SOLDADO', 'Soldado: "Você cumpriu sua parte. O lança-granadas é seu; pressione 7 para equipá-lo. Use-o com cuidado — cada granada explode em área."', [
    { label: 'Encerrar conversa', onSelect: closeNpcDialog },
  ]);
}
function completeNpcQuest() {
  if (questDone || !questAccepted || questKills < QUEST_TARGET || questEliteKills < QUEST_ELITE_TARGET) return;
  questDone = true;
  unlockedWeapons.add('doomSword');
  weaponAmmo.doomSword = 999;
  const title = document.getElementById('npc-dialog-title');
  const text = document.getElementById('npc-dialog-text');
  const button = document.getElementById('npc-dialog-action');
  title.textContent = 'CONTRATO CUMPRIDO // RECOMPENSA LIBERADA';
  text.textContent = 'Doom Guy: "O silêncio voltou a esta clareira. Você não fugiu quando os alfas apareceram — isso vale mais que munição. A Espada Doom agora é sua. Tecla 8 para equipar; botão direito desfere o golpe em área."';
  button.textContent = 'Fechar';
  document.getElementById('npc-dialog').classList.add('show');
  paused = true;
  document.exitPointerLock?.();
  refreshNpcUI();
}
function completeScientistQuest() {
  if (scientistQuestDone || !scientistQuestAccepted || scientistQuestKills < SCIENTIST_QUEST_TARGET) return;
  scientistQuestDone = true;
  unlockedWeapons.add('grenadeLauncher');
  weaponAmmo.grenadeLauncher = weaponDefs.grenadeLauncher.clipSize;
  reserveAmmoByWeapon.grenadeLauncher = 0;
  showNpcChoices('MISSÃO CONCLUÍDA // SOLDADO', 'Soldado: "Você cumpriu sua parte. O lança-granadas é seu; pressione 7 para equipá-lo. Use-o com cuidado — cada granada explode em área."', [
    { label: 'Encerrar conversa', onSelect: closeNpcDialog },
  ]);
  if (messageElement) messageElement.textContent = 'RECOMPENSA: lança-granadas desbloqueado! Pressione 7 para equipar.';
  refreshNpcUI();
}
document.getElementById('npc-dialog-action')?.addEventListener('click', () => {
  document.getElementById('npc-dialog-choices').replaceChildren();
  document.getElementById('npc-dialog-action').style.display = '';
  if (!questAccepted) {
    questAccepted = true;
    document.getElementById('npc-dialog-title').textContent = 'CONTRATO ACEITO // BOA CAÇADA';
    document.getElementById('npc-dialog-text').textContent = 'Doom Guy: "Certo. Não confunda barulho com progresso: as hordas são numerosas, mas os alfas é que mantêm a mata unida. Continue caçando e volte quando tiver concluído o contrato."';
    document.getElementById('npc-dialog-action').textContent = 'Começar a caçada';
    refreshNpcUI();
  } else closeNpcDialog();
});
window.addEventListener('keydown', (event) => { if (!event.repeat && event.key.toLowerCase() === 'q' && gameStarted && !gameOver) { if (document.getElementById('npc-dialog').classList.contains('show')) closeNpcDialog(); else talkNpc(); } });
function spawnSecretFrog() {
  if (secretFrog || frogDead) return; secretFrog = new THREE.Group();
  secretFrog.userData.health = 12;
  const material = new THREE.SpriteMaterial({ map: frogTexture, color: frogTexture ? 0xffffff : 0x53b84d, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material); sprite.scale.set(0.9, 0.64, 1); sprite.position.y = -1.0; secretFrog.add(sprite); secretFrog.position.set(8.0, 0, 11.8); scene.add(secretFrog);
  if (messageElement) messageElement.textContent = 'Algo minúsculo apareceu perto da fogueira...';
}
function talkToFrog() {
  if (!frogNear()) return;
  playOneShot(localGameSounds.frogInteract, 1);
}
function damageSecretFrog(damage) {
  if (!secretFrog || frogDead) return false;
  secretFrog.userData.health -= damage;
  if (secretFrog.userData.health > 0) return true;
  const deathPosition = secretFrog.position.clone();
  deathPosition.y -= 1;
  frogDead = true;
  scene.remove(secretFrog);
  secretFrog = null;
  playOneShot(localGameSounds.frogDeath, 1);
  spawnForestBurst(deathPosition, 14, 0x9b1717);
  refreshNpcUI();
  return true;
}
function doomAreaAttack() {
  if (currentWeaponId !== 'doomSword' || weaponSpecialCooldownTimer > 0 || !gameStarted || paused || gameOver) return;
  weaponSpecialCooldownTimer = weaponDefs.doomSword.fireCooldown;
  weaponAttackDuration = 0.9;
  weaponAttackTimer = weaponAttackDuration;
  weaponRecoil += 0.12;
  playOneShot(knifeSwingSound, 1);
  const origin = player.position.clone();
  let hit = false;
  spawnDoomCrater(origin);
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].userData.alive && enemies[i].position.distanceTo(origin) <= 7.2) {
      applyDamageToEnemy(enemies[i], i, weaponDefs.doomSword.specialDamage * damageMultiplier);
      hit = true;
    }
  }
  if (secretFrog && !frogDead && secretFrog.position.distanceTo(origin) <= 7.2) {
    damageSecretFrog(weaponDefs.doomSword.specialDamage * damageMultiplier);
    hit = true;
  }
  spawnForestBurst(origin, 36, 0xff7538);
  spawnForestBurst(origin, 16, 0xb8ff63);
  if (messageElement) messageElement.textContent = hit ? 'Espada Doom: impacto em área!' : 'Espada Doom: nenhum alvo próximo.';
}
function createGreatswordEnergyBlade() {
  const blade = new THREE.Group();
  const silhouette = new THREE.Shape();
  silhouette.moveTo(-3.5, -0.8);
  silhouette.bezierCurveTo(-3.7, 0.55, -1.9, 1.95, 0, 2.15);
  silhouette.bezierCurveTo(1.9, 1.95, 3.7, 0.55, 3.5, -0.8);
  silhouette.bezierCurveTo(2.3, -0.05, 1.05, 0.35, 0, 0.45);
  silhouette.bezierCurveTo(-1.05, 0.35, -2.3, -0.05, -3.5, -0.8);

  const addBladeMesh = (geometry, color, opacity, blending = THREE.AdditiveBlending) => {
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      blending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    material.userData.baseOpacity = opacity;
    const mesh = new THREE.Mesh(geometry, material);
    blade.add(mesh);
    return mesh;
  };
  const addBladeEdge = (curve, radius, color, opacity) => {
    addBladeMesh(new THREE.TubeGeometry(curve, 36, radius, 8, false), color, opacity);
  };

  addBladeMesh(new THREE.ShapeGeometry(silhouette, 24), 0x04c9c2, 0.48);

  const core = addBladeMesh(new THREE.ShapeGeometry(silhouette, 24), 0x76fff0, 0.62);
  core.scale.set(0.72, 0.68, 1);

  const leftEdge = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-3.5, -0.8, 0),
    new THREE.Vector3(-3.7, 0.55, 0),
    new THREE.Vector3(0, 2.15, 0)
  );
  const rightEdge = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(0, 2.15, 0),
    new THREE.Vector3(3.7, 0.55, 0),
    new THREE.Vector3(3.5, -0.8, 0)
  );
  const innerEdge = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(3.5, -0.8, 0.02),
    new THREE.Vector3(0, 0.45, 0.02),
    new THREE.Vector3(-3.5, -0.8, 0.02)
  );
  addBladeEdge(leftEdge, 0.16, 0x00d9ff, 0.38);
  addBladeEdge(rightEdge, 0.16, 0x00d9ff, 0.38);
  addBladeEdge(leftEdge, 0.055, 0xc8ffff, 0.96);
  addBladeEdge(rightEdge, 0.055, 0xc8ffff, 0.96);
  addBladeEdge(innerEdge, 0.045, 0x45fff0, 0.82);
  return blade;
}

function castGreatswordWave() {
  if (currentWeaponId !== 'greatsword' || weaponSpecialCooldownTimer > 0 || !gameStarted || paused) return;
  weaponSpecialCooldownTimer = weaponDefs.greatsword.fireCooldown;
  weaponAttackDuration = 1.0;
  weaponAttackTimer = weaponAttackDuration;
  weaponRecoil += 0.10;
  playOneShot(localGameSounds.greatswordMagic, 1);
  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3();
  camera.getWorldPosition(origin);
  camera.getWorldDirection(direction).normalize();
  const wave = createGreatswordEnergyBlade();
  wave.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
  wave.position.copy(origin).add(direction.clone().multiplyScalar(1.2));
  wave.userData = {
    velocity: direction,
    speed: 28,
    damage: 22 * damageMultiplier,
    specialWave: true,
    range: 82,
    travelled: 0,
    hitEnemies: new Set()
  };
  scene.add(wave);
  bullets.push(wave);
  if (messageElement) messageElement.textContent = 'Greatsword: lâmina de energia ciano lançada!';
}
function animate() {
  refreshNpcUI();
  const delta = Math.min(clock.getDelta(), 0.1);
  updateAmbientFireflyPoints(clock.elapsedTime);
  updateAmbience(clock.elapsedTime, delta);
  updateCampfireSparks(clock.elapsedTime, delta);
  updateCampfireSmoke(clock.elapsedTime, delta);
  updateEnhancedFire(clock.elapsedTime);

  if (gameStarted && !gameOver && !paused) {
    if (fireCooldownTimer > 0) fireCooldownTimer = Math.max(0, fireCooldownTimer - delta);
    if (weaponSpecialCooldownTimer > 0) weaponSpecialCooldownTimer = Math.max(0, weaponSpecialCooldownTimer - delta);
    if (mouseHeld && weaponDefs[currentWeaponId].auto && fireCooldownTimer <= 0) shoot();
    if (
      currentWeaponId === 'grenadeLauncher' &&
      ammo <= 0 &&
      getCurrentReserveAmmo() > 0 &&
      !isReloading &&
      !(keys.shift && (keys.w || keys.a || keys.s || keys.d))
    ) {
      reloadWeapon();
    }

    if (isReloading) {
      reloadTimer += delta;
      if (reloadTimer >= reloadDuration) {
        const reloadWeaponId = reloadingWeaponId;
        if (reloadWeaponId === currentWeaponId) {
          ammo = Math.min(weaponDefs[reloadWeaponId].clipSize, ammo + pendingReloadAmount);
          weaponAmmo[reloadWeaponId] = ammo;
          reserveAmmoByWeapon[reloadWeaponId] = Math.max(0, reserveAmmoByWeapon[reloadWeaponId] - pendingReloadAmount);
        }
        pendingReloadAmount = 0;
        isReloading = false;
        reloadingWeaponId = null;
        if (messageElement) messageElement.textContent = 'Recarregado!';
        updateAmmoDisplay();
      }
    }
    updateReloadBar();

    updatePlayer(delta);
    animateWeapon(delta);
    updateBullets(delta);
    updateGrenadeProjectiles(delta);
    updateEnemies(delta);
    applyPendingExplosionDamage();
    updatePickups(delta);
    updateChests(delta);
    updateChestSmoke(delta);
    updateTimedItems(delta);
    const nearbyChest = getNearbyChest();
    document.getElementById('forest-chest-prompt')?.classList.toggle('visible', Boolean(nearbyChest));
    document.getElementById('touch-chest-button')?.classList.toggle('visible', Boolean(nearbyChest));
    drawForestMinimap();
    updateMuzzleFlashes(delta);
    updateEnemyProjectiles(delta);
    updateAcidPuddles(delta);
    updateEntitySmokeClouds(delta);
    updateEntityBlastEffects(delta);
    updateElectricHazards(delta);

    const canSpawnRegular = enemiesThisWave < enemiesToSpawnThisWave;
    const canSpawnBoss = bossThisWave && !bossSpawned && enemiesThisWave >= enemiesToSpawnThisWave && enemies.length < maxActiveEnemies;

    spawnTimer += delta;
    if (spawnTimer > spawnInterval && (canSpawnRegular || canSpawnBoss)) {
      if (canSpawnRegular) {
        spawnEnemy(getWaveEnemyType(currentWave));
        enemiesThisWave += 1;
      } else if (canSpawnBoss) {
        spawnEnemy(currentBossType);
        bossSpawned = true;
      }
      spawnTimer = 0;
    }

    const waveComplete = enemiesThisWave >= enemiesToSpawnThisWave && (!bossThisWave || bossSpawned) && enemies.length === 0;
    if (waveComplete) {
      const waveReward = 8 + Math.min(12, Math.floor(currentWave / 2));
      scrap += waveReward;
      updateScrapDisplay();
      currentWave += 1;
      startWave();
      if (messageElement) messageElement.textContent += ` +${waveReward} sucata pela onda anterior.`;
    }
  }

  updateWeaponAbilityIndicators();
  updateForestParticles(delta);
  updateNecromancerDeathEffects(delta);
  updateDoomCraterEffects(delta);
  updateExplosionEffects(delta);
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

  