// --- Database (Mock Supermarket & Food Data) ---
const STORES = [
  { id: 'store-a', name: 'スーパーA（豊洲店）', lat: 35.6550, lng: 139.7960, city: '東京都江東区', flyerUrl: '#' },
  { id: 'store-b', name: 'スーパーB（錦糸町店）', lat: 35.6960, lng: 139.8140, city: '東京都墨田区', flyerUrl: '#' },
  { id: 'store-c', name: 'スーパーC（勝どき店）', lat: 35.6590, lng: 139.7750, city: '東京都中央区', flyerUrl: '#' }
];
let nearbyStores = [];
let nearbyStoreSearchStatus = 'idle';
let nearbyStoreSearchError = '';
let nearbyStoreSearchGeneration = 0;
let nominatimRequestQueue = Promise.resolve();
const NEARBY_STORES_STORAGE_KEY = 'fresh_save_nearby_stores';
const NEARBY_STORES_SEARCH_RADIUS_KM = 10;
const NEARBY_STORES_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const ITEMS = [
  {
    id: 1,
    name: 'キャベツ（1玉）',
    category: '野菜',
    storeId: 'store-a',
    price: 128,
    arrivalDate: '本日 9:00入荷',
    origin: '愛知県産',
    freshness: 5,
    img: 'assets/cabbage.jpg',
    description: 'みずみずしく葉のハリが抜群です。傷みもなく今が一番おいしい状態です！'
  },
  {
    id: 2,
    name: '国産 豚肉（300g）',
    category: 'お肉',
    storeId: 'store-b',
    price: 358,
    arrivalDate: '本日 8:30入荷',
    origin: '国産',
    freshness: 4,
    img: 'assets/pork.jpg',
    description: '発色が良く脂肪とのバランスが最適。本日加工済みの新鮮お肉です。'
  },
  {
    id: 3,
    name: 'にんじん（3本）',
    category: '野菜',
    storeId: 'store-b',
    price: 98,
    arrivalDate: '本日 10:00入荷',
    origin: '千葉県産',
    freshness: 4,
    img: 'assets/carrot.jpg',
    description: '甘みが強く色ツヤも良好です。煮物やスープにピッタリ！'
  },
  {
    id: 4,
    name: 'ほうれん草',
    category: '野菜',
    storeId: 'store-c',
    price: 158,
    arrivalDate: '本日 8:30入荷',
    origin: '埼玉県産',
    freshness: 5,
    img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80',
    description: 'シャキシャキ感があり葉先までピシッとしています。おひたしにおすすめ。'
  },
  {
    id: 5,
    name: '完熟トマト（4個）',
    category: '野菜',
    storeId: 'store-a',
    price: 198,
    arrivalDate: '本日 9:15入荷',
    origin: '熊本県産',
    freshness: 5,
    img: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80',
    description: '真っ赤に熟した高糖度トマト。サラダの主役にどうぞ。'
  },
  {
    id: 6,
    name: '玉ねぎ（3個）',
    category: '野菜',
    storeId: 'store-a',
    price: 178,
    arrivalDate: '本日 9:30入荷',
    origin: '北海道産',
    freshness: 5,
    img: 'assets/onion.jpg',
    description: '身が締まっていて甘みのある玉ねぎです。炒め物やカレーにおすすめ。'
  },
  {
    id: 7,
    name: 'じゃがいも（4個）',
    category: '野菜',
    storeId: 'store-c',
    price: 198,
    arrivalDate: '本日 9:20入荷',
    origin: '北海道産',
    freshness: 4,
    img: 'assets/potato.jpg',
    description: 'ほくほく食感のじゃがいもです。煮込み料理やポテトサラダにどうぞ。'
  },
  {
    id: 8,
    name: 'きゅうり（3本）',
    category: '野菜',
    storeId: 'store-a',
    price: 158,
    arrivalDate: '本日 10:00入荷',
    origin: '千葉県産',
    freshness: 5,
    img: 'assets/cucumber.jpg',
    description: 'みずみずしく歯ごたえのよいきゅうりです。サラダや漬物にぴったり。'
  },
  {
    id: 9,
    name: 'ブロッコリー（1株）',
    category: '野菜',
    storeId: 'store-c',
    price: 198,
    arrivalDate: '本日 8:50入荷',
    origin: '埼玉県産',
    freshness: 5,
    img: 'assets/broccoli.jpg',
    description: 'つぼみがぎゅっと詰まったブロッコリーです。サラダや炒め物におすすめ。'
  },
  {
    id: 10,
    name: 'なす（3本）',
    category: '野菜',
    storeId: 'store-a',
    price: 188,
    arrivalDate: '本日 9:40入荷',
    origin: '栃木県産',
    freshness: 4,
    img: 'assets/eggplant.jpg',
    description: '皮にツヤがあり、果肉もやわらかななすです。焼きなすや麻婆なすに。'
  },
  {
    id: 11,
    name: '鶏むね肉（300g）',
    category: 'お肉',
    storeId: 'store-a',
    price: 298,
    arrivalDate: '本日 9:10入荷',
    origin: '国産',
    freshness: 5,
    img: 'assets/chicken-breast.jpg',
    description: '国産の鶏むね肉です。蒸し料理やチキンソテーなど幅広く使えます。'
  },
  {
    id: 12,
    name: '鶏もも肉（300g）',
    category: 'お肉',
    storeId: 'store-c',
    price: 398,
    arrivalDate: '本日 8:45入荷',
    origin: '国産',
    freshness: 5,
    img: 'assets/chicken-thighs.jpg',
    description: 'ほどよく脂がのった国産鶏もも肉です。唐揚げや照り焼きにおすすめ。'
  },
  {
    id: 13,
    name: '牛こま切れ肉（200g）',
    category: 'お肉',
    storeId: 'store-a',
    price: 498,
    arrivalDate: '本日 9:00入荷',
    origin: '国産',
    freshness: 4,
    img: 'assets/beef.jpg',
    description: '炒め物や肉じゃがに使いやすい国産牛こま切れ肉です。'
  },
  {
    id: 14,
    name: '豚ひき肉（300g）',
    category: 'お肉',
    storeId: 'store-c',
    price: 328,
    arrivalDate: '本日 9:15入荷',
    origin: '国産',
    freshness: 4,
    img: 'assets/ground-meat.jpg',
    description: '使いやすい国産豚ひき肉です。餃子やそぼろ、炒め物にどうぞ。'
  },
  {
    id: 15,
    name: '合いびき肉（300g）',
    category: 'お肉',
    storeId: 'store-a',
    price: 398,
    arrivalDate: '本日 9:25入荷',
    origin: '国産',
    freshness: 4,
    img: 'assets/ground-beef.jpg',
    description: 'ハンバーグやミートソースに便利な国産合いびき肉です。'
  }
];

const DEMO_POSTS = [
  {
    time: '本日 9:00 更新',
    text: '地元の農家さんから新鮮なキャベツとトマトが届きました！特にキャベツは葉が柔らかく甘みがあります。売り場の最新写真をご確認ください！',
    likes: 24,
    comments: [
      { user: '近所のアラカルト', text: 'キャベツ買いました！すごく新鮮でした。' }
    ]
  },
  {
    time: '本日 8:45 更新',
    text: '本日のタイムセール！特選豚肉パックがお買い得です。色ツヤ抜群の状態でカットしたてを陳列しております。',
    likes: 18,
    comments: []
  }
];

// --- Application State ---
let userLocation = {
  lat: 35.6580, // Default: Koto-ku Toyosu
  lng: 139.7900,
  addressName: '東京都江東区（豊洲付近）',
  isGPS: false
};

let userPlaceProfile = {
  homeAddress: '',
  shoppingArea: '',
  shoppingAreaDetail: ''
};

let currentFilterRadius = 3.0; // km
let currentCategory = 'all';
let cart = []; // Array of item IDs
let customItems = [];
const CUSTOM_ITEMS_STORAGE_KEY = 'fresh_save_custom_items';
const CART_STORAGE_KEY = 'fresh_save_cart';
const SHOPPING_PROGRESS_STORAGE_KEY = 'fresh_save_shopping_progress';
const PURCHASE_HISTORY_STORAGE_KEY = 'fresh_save_purchase_events';
const LEGACY_PURCHASE_HISTORY_STORAGE_KEY = 'fresh_save_purchase_history';
const FREQUENT_ITEMS_STORAGE_KEY = 'fresh_save_frequent_items';
const STORE_BRANCH_PREFERENCES_KEY = 'fresh_save_store_branch_preferences';
const ITEM_STORE_PREFERENCES_KEY = 'fresh_save_item_store_preferences';
const STORE_PRICES_STORAGE_KEY = 'fresh_save_store_prices';
const PLACE_PROFILE_STORAGE_KEY = 'fresh_save_place_profile';
const PLACE_SEARCH_CACHE_KEY = 'fresh_save_place_search_cache';
const PLACE_SEARCH_LAST_REQUEST_KEY = 'fresh_save_place_search_last_request';
const PLACE_SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
let purchasePlanMode = 'cheapest';
let singleStoreId = null;
let shoppingProgress = {};
let purchaseHistory = [];
let frequentItems = [];
let selectedStoreBranches = {};
let selectedItemStores = {};
let cartFilter = 'active';
let showAllFrequentItems = false;
let showAllPurchaseHistory = false;
let savedStorePrices = {};
let selectedGeocodedPlace = null;

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadSavedLocation();
  loadNearbyStoresCache();
  loadStoreBranchPreferences();
  loadItemStorePreferences();
  loadShoppingState();
  loadPurchaseHistory();
  loadSavedStorePrices();
  loadCustomItems();
  renderCatalogItemOptions();
  renderHomeRecommendations();
  renderItemList();
  renderPosts();
  updateCartUI();
  renderNearbyStoreSummary();

  // Auto show location check modal if first time
  if (!localStorage.getItem('fresh_save_loc')) {
    openLocationModal();
  }
});

// --- Navigation Controller ---
function navTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');

  const navIndex = ['home', 'search', 'list', 'posts', 'mypage'].indexOf(pageId);
  if (navIndex !== -1) {
    document.querySelectorAll('.nav-item')[navIndex].classList.add('active');
  }

  window.scrollTo(0, 0);
}

// --- Geolocation & Location Logic ---
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // km
}

function getAllStores() {
  return STORES.concat(nearbyStores);
}

const STORE_BRANDS = [
  ['まいばすけっと', 'まいばすけっと'],
  ['マイバスケット', 'まいばすけっと'],
  ['イオン', 'イオン'],
  ['AEON', 'イオン'],
  ['イトーヨーカドー', 'イトーヨーカドー'],
  ['ヨークマート', 'ヨークマート'],
  ['ヨークフーズ', 'ヨークマート'],
  ['トライアル', 'トライアル'],
  ['TRIAL', 'トライアル'],
  ['ベルクス', 'ベルクス'],
  ['ベルク', 'ベルク'],
  ['ヤオヒロ', 'ヤオヒロ'],
  ['業務スーパー', '業務スーパー'],
  ['コープ', 'コープ'],
  ['COOP', 'コープ'],
  ['生鮮市場TOP', '生鮮市場TOP'],
  ['TAIRAYA', 'TAIRAYA'],
  ['いなげや', 'いなげや'],
  ['東武ストア', '東武ストア'],
  ['ベイシア', 'ベイシア'],
  ['ヤオコー', 'ヤオコー'],
  ['マルエツ', 'マルエツ'],
  ['ロピア', 'ロピア'],
  ['西友', '西友'],
  ['ライフ', 'ライフ'],
  ['オーケー', 'オーケー'],
  ['サミット', 'サミット'],
  ['フードスクエア', 'カスミ'],
  ['カスミ', 'カスミ'],
  ['マックスバリュ', 'マックスバリュ'],
  ['アコレ', 'アコレ'],
  ['スーパーバリュー', 'スーパーバリュー'],
  ['とりせん', 'とりせん']
];

function getStoreBrandKey(store) {
  const normalizedName = store.name.normalize('NFKC').toLocaleLowerCase('ja-JP');
  const match = STORE_BRANDS.find(([alias]) =>
    normalizedName.includes(alias.normalize('NFKC').toLocaleLowerCase('ja-JP'))
  );
  return match?.[1] || normalizeItemName(store.name);
}

function getStoreBrandName(store) {
  const brandKey = getStoreBrandKey(store);
  return STORE_BRANDS.find(([, brand]) => brand === brandKey)?.[1] || store.name;
}

function getStoreAddressLabel(store) {
  if (typeof store.city !== 'string') return '住所情報なし';
  if (!store.city.includes(',')) return store.city;
  const parts = store.city.split(',').map(part => part.trim()).filter(Boolean).slice(1);
  const locality = parts.filter(part =>
    !/日本|〒?\d{3}-?\d{4}|都$|道$|府$|県$/.test(part) &&
    !/通り|街道|道路|県道|市道|線$/.test(part)
  );
  return locality.slice(0, 2).join('・') || parts.slice(0, 2).join('・') || '住所情報なし';
}

function getStoreGroups(stores = getAllStores()) {
  const groups = new Map();
  stores.forEach(store => {
    const brandKey = getStoreBrandKey(store);
    if (!groups.has(brandKey)) groups.set(brandKey, []);
    groups.get(brandKey).push(store);
  });
  return Array.from(groups, ([brandKey, branches]) => ({
    brandKey,
    brandName: getStoreBrandName(branches[0]),
    branches: branches.sort((a, b) =>
      calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
      calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
    )
  })).sort((a, b) =>
    calculateDistance(userLocation.lat, userLocation.lng, a.branches[0].lat, a.branches[0].lng) -
    calculateDistance(userLocation.lat, userLocation.lng, b.branches[0].lat, b.branches[0].lng)
  );
}

function getStoreBranchChoices() {
  let stores = getAllStores().filter(store =>
    Number(getStoreDistance(store.id).distKm) <= getActiveDistanceRadius()
  );
  if (!stores.length) stores = getAllStores();
  return getStoreGroups(stores).map(group =>
    group.branches.find(store => store.id === selectedStoreBranches[group.brandKey]) || group.branches[0]
  );
}

function selectStoreBranch(storeId) {
  const store = getAllStores().find(entry => entry.id === storeId);
  if (!store) throw new Error(`Unknown store: ${storeId}`);
  selectedStoreBranches[getStoreBrandKey(store)] = storeId;
  if (purchasePlanMode === 'single') singleStoreId = storeId;
  localStorage.setItem(STORE_BRANCH_PREFERENCES_KEY, JSON.stringify(selectedStoreBranches));
  renderNearbyStoreSummary();
  renderCatalogItemOptions();
  renderHomeRecommendations();
  renderItemList();
  renderPosts();
  renderCartAndAIPlan();
}

function loadStoreBranchPreferences() {
  try {
    const savedPreferences = JSON.parse(localStorage.getItem(STORE_BRANCH_PREFERENCES_KEY) || '{}');
    selectedStoreBranches = savedPreferences && typeof savedPreferences === 'object' && !Array.isArray(savedPreferences)
      ? Object.fromEntries(Object.entries(savedPreferences).filter(([brandKey, storeId]) =>
        typeof brandKey === 'string' && typeof storeId === 'string' &&
        getAllStores().some(store => store.id === storeId && getStoreBrandKey(store) === brandKey)
      ))
      : {};
  } catch (error) {
    console.error('店舗の選択設定を読み込めませんでした。', error);
    selectedStoreBranches = {};
  }
}

function loadItemStorePreferences() {
  try {
    const savedPreferences = JSON.parse(localStorage.getItem(ITEM_STORE_PREFERENCES_KEY) || '{}');
    selectedItemStores = savedPreferences && typeof savedPreferences === 'object' && !Array.isArray(savedPreferences)
      ? Object.fromEntries(Object.entries(savedPreferences).filter(([itemId, storeId]) =>
        ITEMS.some(item => String(item.id) === itemId) &&
        typeof storeId === 'string' &&
        getAllStores().some(store => store.id === storeId)
      ))
      : {};
  } catch (error) {
    console.error('商品ごとの店舗選択を読み込めませんでした。', error);
    selectedItemStores = {};
  }
}

function getRecommendedItems(items) {
  return [...items].sort((a, b) =>
    getCheapestItemOffer(a).price - getCheapestItemOffer(b).price ||
    b.freshness - a.freshness
  );
}

function getActiveDistanceRadius() {
  return currentFilterRadius === 999 ? NEARBY_STORES_SEARCH_RADIUS_KM : currentFilterRadius;
}

function getLocationCacheKey(location = userLocation) {
  return `${Number(location.lat).toFixed(4)},${Number(location.lng).toFixed(4)}`;
}

function loadNearbyStoresCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(NEARBY_STORES_STORAGE_KEY) || 'null');
    if (!cache || cache.locationKey !== getLocationCacheKey() || !Array.isArray(cache.stores)) {
      nearbyStores = [];
      nearbyStoreSearchStatus = 'idle';
      return null;
    }

    nearbyStores = cache.stores.filter(store =>
      typeof store.id === 'string' &&
      store.id.startsWith('osm-') &&
      typeof store.name === 'string' &&
      Number.isFinite(store.lat) &&
      Number.isFinite(store.lng)
    );
    nearbyStoreSearchStatus = 'loaded';
    nearbyStoreSearchError = '';
    return cache;
  } catch (error) {
    console.error('近隣スーパーの保存データを読み込めませんでした。', error);
    nearbyStores = [];
    nearbyStoreSearchStatus = 'idle';
    return null;
  }
}

async function refreshNearbyStores(force = false) {
  const generation = ++nearbyStoreSearchGeneration;
  const locationKey = getLocationCacheKey();
  const cache = loadNearbyStoresCache();
  if (cache && !force && Date.now() - Number(cache.fetchedAt) < NEARBY_STORES_CACHE_TTL_MS) {
    renderNearbyStoreSummary();
    return;
  }
  if (!force) {
    nearbyStoreSearchStatus = cache ? 'loaded' : 'idle';
    renderNearbyStoreSummary();
    return;
  }

  nearbyStoreSearchStatus = 'loading';
  nearbyStoreSearchError = '';
  renderNearbyStoreSummary();

  try {
    const stores = await fetchNearbySupermarkets();
    if (generation !== nearbyStoreSearchGeneration || locationKey !== getLocationCacheKey()) return;
    nearbyStores = stores;
    nearbyStoreSearchStatus = 'loaded';
    const resultCache = {
      locationKey,
      fetchedAt: Date.now(),
      stores
    };
    localStorage.setItem(NEARBY_STORES_STORAGE_KEY, JSON.stringify(resultCache));
    renderCatalogItemOptions();
    renderHomeRecommendations();
    renderItemList();
    renderPosts();
    renderCartAndAIPlan();
  } catch (error) {
    if (generation !== nearbyStoreSearchGeneration || locationKey !== getLocationCacheKey()) return;
    console.error('近隣スーパーの検索に失敗しました。', error);
    nearbyStoreSearchStatus = 'error';
    nearbyStoreSearchError = error.message;
  }
  renderNearbyStoreSummary();
}

async function fetchNearbySupermarkets() {
  await waitForNominatimRequestSlot();
  const latOffset = NEARBY_STORES_SEARCH_RADIUS_KM / 111.32;
  const lngOffset = NEARBY_STORES_SEARCH_RADIUS_KM / (111.32 * Math.cos(userLocation.lat * Math.PI / 180));
  const url = new URL(PLACE_SEARCH_ENDPOINT);
  url.search = new URLSearchParams({
    q: 'supermarket',
    format: 'jsonv2',
    limit: '40',
    countrycodes: 'jp',
    'accept-language': 'ja',
    viewbox: [
      userLocation.lng - lngOffset,
      userLocation.lat + latOffset,
      userLocation.lng + lngOffset,
      userLocation.lat - latOffset
    ].join(','),
    bounded: '1'
  }).toString();

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`地図検索サービスが ${response.status} を返しました。`);
  }
  const results = await response.json();
  if (!Array.isArray(results)) {
    throw new Error('地図検索サービスから不正な応答がありました。');
  }
  return parseNearbySupermarkets(results);
}

async function waitForNominatimRequestSlot() {
  const requestSlot = nominatimRequestQueue.then(async () => {
    const lastRequestAt = Number(localStorage.getItem(PLACE_SEARCH_LAST_REQUEST_KEY) || 0);
    const delay = Math.max(0, 1100 - (Date.now() - lastRequestAt));
    if (delay) await new Promise(resolve => setTimeout(resolve, delay));
    localStorage.setItem(PLACE_SEARCH_LAST_REQUEST_KEY, String(Date.now()));
  });
  nominatimRequestQueue = requestSlot.catch(() => {});
  await requestSlot;
}

function parseNearbySupermarkets(results) {
  const uniqueStores = new Map();
  results.forEach(result => {
    if (!result || typeof result.display_name !== 'string') return;
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    if (result.category !== 'shop' || result.type !== 'supermarket' ||
        !result.osm_type || !result.osm_id || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (calculateDistance(userLocation.lat, userLocation.lng, lat, lng) > NEARBY_STORES_SEARCH_RADIUS_KM) return;
    const store = {
      id: `osm-${result.osm_type}-${result.osm_id}`,
      name: (typeof result.name === 'string' && result.name.trim())
        ? result.name.trim()
        : result.display_name.split(',')[0].trim() || '名称未登録のスーパー',
      lat,
      lng,
      city: result.display_name,
      flyerUrl: '#',
      source: 'OpenStreetMap'
    };
    uniqueStores.set(store.id, store);
  });
  return Array.from(uniqueStores.values()).sort((a, b) =>
    calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
    calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
  );
}

function renderNearbyStoreSummary() {
  const container = document.getElementById('nearby-store-summary');
  if (!container) return;
  const searchInput = document.getElementById('nearby-store-search');
  const openSummary = document.getElementById('nearby-store-open-summary');
  if (searchInput) searchInput.hidden = nearbyStores.length === 0;
  document.querySelectorAll('.radius-btn').forEach(button => {
    button.classList.toggle('active', Number(button.dataset.radius) === currentFilterRadius);
  });

  if (nearbyStoreSearchStatus === 'loading') {
    if (openSummary) openSummary.textContent = '近くの店舗を検索しています';
    container.innerHTML = '近くのスーパーを地図から検索しています…';
    return;
  }
  if (nearbyStoreSearchStatus === 'error') {
    if (openSummary) openSummary.textContent = '検索できませんでした。タップして再試行';
    container.innerHTML = `近くのスーパーを検索できませんでした。通信を確認して再試行してください。<br><button type="button" onclick="refreshNearbyStores(true)">再試行</button>`;
    return;
  }
  if (nearbyStoreSearchStatus === 'idle') {
    if (openSummary) openSummary.textContent = '近くのスーパーを検索';
    container.innerHTML = `近隣スーパー情報をまだ読み込んでいません（最大${NEARBY_STORES_SEARCH_RADIUS_KM}km）。<button type="button" onclick="refreshNearbyStores(true)">近くのスーパーを検索</button>`;
    return;
  }
  if (nearbyStores.length === 0) {
    if (openSummary) openSummary.textContent = 'このエリアの店舗情報はありません';
    container.innerHTML = `この地点のスーパー情報はまだ見つかっていません。地図に未登録の店舗がある場合もあります。<br><button type="button" onclick="refreshNearbyStores(true)">再検索</button>`;
    return;
  }

  const sortedStores = nearbyStores.map(store => ({
    store,
    ...getStoreDistance(store.id)
  }));
  const withinRadius = sortedStores.filter(entry => parseFloat(entry.distKm) <= getActiveDistanceRadius());
  const closest = sortedStores[0];
  const rangeLabel = currentFilterRadius === 999 ? `${NEARBY_STORES_SEARCH_RADIUS_KM}km以内` : `${currentFilterRadius}km以内`;
  if (!withinRadius.length) {
    if (openSummary) openSummary.textContent = `この範囲に店舗なし・最寄り${closest.distKm}km`;
    container.innerHTML = `検索地点から${rangeLabel}にスーパーが見つかりません。最寄りは「${escapeHTML(closest.store.name)}」（${closest.distKm}km）です。<br><small>地図データのため、未登録の店舗がある場合があります。</small><br><button type="button" onclick="refreshNearbyStores(true)">再検索</button>`;
    return;
  }

  const query = normalizeItemName(searchInput?.value || '');
  const filteredGroups = getStoreGroups(withinRadius.map(entry => entry.store)).filter(group =>
    !query || normalizeItemName(group.brandName).includes(query) ||
      group.branches.some(store =>
        normalizeItemName(store.name).includes(query) ||
        normalizeItemName(store.city || '').includes(query) ||
        normalizeItemName(getStoreAddressLabel(store)).includes(query)
      )
  );
  const groupsToRender = query ? filteredGroups : filteredGroups.slice(0, 5);
  const groupCards = groupsToRender.map(renderStoreBrandCard).join('');
  const hasMoreGroups = !query && filteredGroups.length > 5;
  const visibleStoreCount = filteredGroups.reduce((count, group) => count + group.branches.length, 0);
  if (openSummary) {
    openSummary.textContent = query
      ? `${visibleStoreCount}店舗・${rangeLabel}`
      : `${withinRadius.length}店舗・${rangeLabel}`;
  }
  container.innerHTML = `
    <div class="store-search-summary"><b>${rangeLabel}・${visibleStoreCount}店舗</b><span>${filteredGroups.length}系列</span></div>
    <small class="store-branch-note">支店を選ぶと価格比較に反映されます。</small>
    <div class="store-brand-list">${groupCards || '<p class="store-search-empty">検索に一致する店舗がありません。</p>'}</div>
    ${hasMoreGroups ? `<details class="nearby-store-details"><summary>ほか${filteredGroups.length - 5}系列を表示</summary><div class="store-brand-list">${filteredGroups.slice(5).map(renderStoreBrandCard).join('')}</div></details>` : ''}
    <small>店舗地図情報：<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a></small>
    <button type="button" onclick="refreshNearbyStores(true)">近くのスーパーを更新</button>
  `;
}

function renderStoreBrandCard(group) {
  const preferredStoreId = selectedStoreBranches[group.brandKey];
  const selectedBranch = group.branches.find(store => store.id === preferredStoreId) || group.branches[0];
  const { distKm } = getStoreDistance(selectedBranch.id);
  const branchOptions = group.branches.map(store => {
    const distance = getStoreDistance(store.id).distKm;
    return `<option value="${store.id}" ${store.id === selectedBranch.id ? 'selected' : ''}>${escapeHTML(store.name)}・${escapeHTML(getStoreAddressLabel(store))}・${distance}km</option>`;
  }).join('');
  const branchName = normalizeItemName(selectedBranch.name) === normalizeItemName(group.brandName)
    ? ''
    : `${escapeHTML(selectedBranch.name)}・`;
  return `
    <article class="store-brand-card">
      <div class="store-brand-card-main">
        <b>${escapeHTML(group.brandName)}</b>
        <span>${branchName}${escapeHTML(getStoreAddressLabel(selectedBranch))}・${distKm}km</span>
      </div>
      ${group.branches.length > 1
        ? `<label class="store-branch-picker"><span>${group.branches.length}店舗から選択</span><select aria-label="${escapeHTML(group.brandName)}の支店を選択" onchange="selectStoreBranch(this.value)">${branchOptions}</select></label>`
        : `<button type="button" class="store-branch-picker single-branch" onclick="selectStoreBranch('${selectedBranch.id}')">この店舗で価格を見る</button>`
      }
    </article>
  `;
}

function getStoreDistance(storeId) {
  const store = getAllStores().find(s => s.id === storeId);
  if (!store) return { distKm: 0, walkMin: 0 };
  const dist = calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng);
  const walkMin = Math.ceil(dist * 12); // ~80m/min
  return { distKm: dist.toFixed(1), walkMin: walkMin };
}

function getItemPrices(item) {
  return getAllStores().map((store, index) => {
    const variation = ((item.id * 3 + index * 2) % 5) - 2;
    const samplePrice = store.id === item.storeId
      ? item.price
      : Math.max(10, item.price + variation * 10);
    const savedPrice = savedStorePrices[item.id]?.[store.id];
    return {
      store,
      price: savedPrice?.price ?? samplePrice,
      updatedAt: savedPrice?.updatedAt ?? null,
      isUserEntered: Boolean(savedPrice)
    };
  }).sort((a, b) => a.price - b.price || a.store.id.localeCompare(b.store.id));
}

function getAvailableItemPrices(item) {
  const candidates = getItemPrices(item).filter(({ store }) => {
    const { distKm } = getStoreDistance(store.id);
    return parseFloat(distKm) <= getActiveDistanceRadius();
  });
  const byBrand = new Map();
  candidates.forEach(offer => {
    const brandKey = getStoreBrandKey(offer.store);
    const selectedStoreId = selectedStoreBranches[brandKey];
    const existing = byBrand.get(brandKey);
    const offerDistance = calculateDistance(userLocation.lat, userLocation.lng, offer.store.lat, offer.store.lng);
    const existingDistance = existing
      ? calculateDistance(userLocation.lat, userLocation.lng, existing.store.lat, existing.store.lng)
      : Infinity;
    if (!existing ||
        (offer.store.id === selectedStoreId && existing.store.id !== selectedStoreId) ||
        (existing.store.id !== selectedStoreId &&
          offerDistance < existingDistance)) {
      byBrand.set(brandKey, offer);
    }
  });
  return Array.from(byBrand.values()).sort((a, b) =>
    a.price - b.price ||
    calculateDistance(userLocation.lat, userLocation.lng, a.store.lat, a.store.lng) -
      calculateDistance(userLocation.lat, userLocation.lng, b.store.lat, b.store.lng)
  );
}

function getItemPriceAtStore(item, storeId) {
  return getItemPrices(item).find(offer => offer.store.id === storeId);
}

function getCheapestItemOffer(item) {
  return getAvailableItemPrices(item)[0] || getItemPrices(item)[0];
}

function getSelectedItemOffer(item) {
  const offers = getAvailableItemPrices(item);
  const selectedStoreId = selectedItemStores[String(item.id)];
  return offers.find(offer => offer.store.id === selectedStoreId) || offers[0] || getCheapestItemOffer(item);
}

function getDemoStoreFreshness(item, store) {
  const seed = `${item.id}:${store.id}`.split('').reduce((value, character) =>
    (value * 31 + character.charCodeAt(0)) | 0, 7);
  return 3 + Math.abs(seed % 3);
}

function renderItemPriceComparisons(item) {
  const offers = getAvailableItemPrices(item);
  const renderOffers = visibleOffers => visibleOffers.map(({ store, price, isUserEntered }) => {
    const branchAddress = store.source === 'OpenStreetMap'
      ? `・${escapeHTML(getStoreAddressLabel(store))}`
      : '';
    const freshness = getDemoStoreFreshness(item, store);
    return `<span class="price-comparison-chip">${escapeHTML(store.name.split('（')[0])}${branchAddress} ￥${price}（${isUserEntered ? '入力' : 'サンプル'}）・鮮度デモ${freshness}/5</span>`;
  }).join('');
  const visibleOffers = offers.slice(0, 3);
  const otherOffers = offers.slice(3);
  return renderOffers(visibleOffers) + (otherOffers.length
    ? `<details class="price-comparison-more" onclick="event.stopPropagation()"><summary>ほか${otherOffers.length}店舗の価格を見る</summary><div class="price-comparison-list">${renderOffers(otherOffers)}</div></details>`
    : '');
}

function isItemPurchased(key) {
  return Boolean(shoppingProgress[key]?.purchased);
}

function getItemQuantity(key) {
  const quantity = Number(shoppingProgress[key]?.quantity);
  return Number.isInteger(quantity) && quantity >= 1 && quantity <= 99 ? quantity : 1;
}

function saveShoppingState() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  localStorage.setItem(SHOPPING_PROGRESS_STORAGE_KEY, JSON.stringify(shoppingProgress));
}

function loadShoppingState() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    const savedProgress = JSON.parse(localStorage.getItem(SHOPPING_PROGRESS_STORAGE_KEY) || '{}');
    cart = Array.isArray(savedCart)
      ? savedCart.filter(id => ITEMS.some(item => item.id === id))
      : [];
    shoppingProgress = savedProgress && typeof savedProgress === 'object' && !Array.isArray(savedProgress)
      ? savedProgress
      : {};
  } catch (error) {
    console.error('買い物リストの状態を読み込めませんでした。', error);
    cart = [];
    shoppingProgress = {};
  }
}

function loadPurchaseHistory() {
  try {
    const savedFrequentItems = localStorage.getItem(FREQUENT_ITEMS_STORAGE_KEY);
    if (savedFrequentItems === null) {
      const oldHistory = JSON.parse(localStorage.getItem(LEGACY_PURCHASE_HISTORY_STORAGE_KEY) || '[]');
      frequentItems = Array.isArray(oldHistory)
        ? oldHistory.filter(entry => entry && typeof entry.name === 'string').map(entry => ({
          key: typeof entry.key === 'string' ? entry.key : `custom:${normalizeItemName(entry.name)}`,
          name: entry.name.trim(),
          catalogItemId: Number.isInteger(entry.catalogItemId) &&
            ITEMS.some(item => item.id === entry.catalogItemId) ? entry.catalogItemId : null
        })).filter(entry => entry.name)
        : [];
      saveFrequentItems();
    } else {
      const parsedFrequentItems = JSON.parse(savedFrequentItems);
      frequentItems = Array.isArray(parsedFrequentItems)
        ? parsedFrequentItems.filter(entry =>
          entry && typeof entry.key === 'string' &&
          typeof entry.name === 'string' && entry.name.trim()
        ).map(entry => ({
          key: entry.key,
          name: entry.name.trim(),
          catalogItemId: Number.isInteger(entry.catalogItemId) &&
            ITEMS.some(item => item.id === entry.catalogItemId) ? entry.catalogItemId : null
        }))
        : [];
    }

    const savedHistory = JSON.parse(localStorage.getItem(PURCHASE_HISTORY_STORAGE_KEY) || '[]');
    purchaseHistory = Array.isArray(savedHistory)
      ? savedHistory.filter(entry =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.name === 'string' &&
        entry.name.trim() &&
        typeof entry.purchasedAt === 'string' &&
        Number.isFinite(Date.parse(entry.purchasedAt))
      ).map(entry => ({
        name: entry.name.trim(),
        catalogItemId: Number.isInteger(entry.catalogItemId) &&
          ITEMS.some(item => item.id === entry.catalogItemId) ? entry.catalogItemId : null,
        id: entry.id,
        purchasedAt: entry.purchasedAt,
        key: typeof entry.key === 'string' ? entry.key : ''
      })).sort((a, b) => Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt)).slice(0, 100)
      : [];
  } catch (error) {
    console.error('購入履歴またはよく買うものを読み込めませんでした。', error);
    purchaseHistory = [];
    frequentItems = [];
  }
}

function savePurchaseHistory() {
  localStorage.setItem(PURCHASE_HISTORY_STORAGE_KEY, JSON.stringify(purchaseHistory));
}

function saveFrequentItems() {
  localStorage.setItem(FREQUENT_ITEMS_STORAGE_KEY, JSON.stringify(frequentItems));
}

function recordPurchase(key) {
  const catalogId = key.startsWith('catalog:') ? Number(key.slice('catalog:'.length)) : null;
  const customId = key.startsWith('custom:') ? key.slice('custom:'.length) : null;
  const item = Number.isInteger(catalogId) ? ITEMS.find(entry => entry.id === catalogId) : null;
  const customItem = customId ? customItems.find(entry => entry.id === customId) : null;
  const name = item?.name || customItem?.name;
  if (!name) return;

  const catalogItemId = item?.id || customItem?.catalogItemId || null;
  const historyKey = catalogItemId
    ? `catalog:${catalogItemId}`
    : `custom:${normalizeItemName(name)}`;
  purchaseHistory.unshift({
    id: crypto.randomUUID(),
    key: historyKey,
    name,
    catalogItemId,
    purchasedAt: new Date().toISOString()
  });
  purchaseHistory = purchaseHistory.slice(0, 100);
  savePurchaseHistory();
}

function loadSavedStorePrices() {
  try {
    const savedPrices = JSON.parse(localStorage.getItem(STORE_PRICES_STORAGE_KEY) || '{}');
    savedStorePrices = {};
    if (savedPrices && typeof savedPrices === 'object' && !Array.isArray(savedPrices)) {
      Object.entries(savedPrices).forEach(([itemId, storePrices]) => {
        const item = ITEMS.find(entry => entry.id === Number(itemId));
        if (!item || !storePrices || typeof storePrices !== 'object' || Array.isArray(storePrices)) return;
        Object.entries(storePrices).forEach(([storeId, savedPrice]) => {
          const price = Number(savedPrice?.price);
          const knownStoreId = getAllStores().some(store => store.id === storeId);
          const cachedMapStoreId = /^osm-(node|way|relation)-\d+$/.test(storeId);
          if ((knownStoreId || cachedMapStoreId) && Number.isInteger(price) && price > 0) {
            if (!savedStorePrices[item.id]) savedStorePrices[item.id] = {};
            savedStorePrices[item.id][storeId] = {
              price,
              updatedAt: typeof savedPrice.updatedAt === 'string' ? savedPrice.updatedAt : ''
            };
          }
        });
      });
    }
  } catch (error) {
    console.error('保存済み価格を読み込めませんでした。', error);
    savedStorePrices = {};
  }
}

function saveStorePrices() {
  localStorage.setItem(STORE_PRICES_STORAGE_KEY, JSON.stringify(savedStorePrices));
}

function setStorePrice(itemId, storeId, value) {
  const item = ITEMS.find(entry => entry.id === itemId);
  const store = getAllStores().find(entry => entry.id === storeId);
  const price = Number(value);
  if (!item || !store || !Number.isInteger(price) || price < 1) {
    alert('価格は1円以上の整数で入力してください。');
    return;
  }

  if (!savedStorePrices[itemId]) savedStorePrices[itemId] = {};
  savedStorePrices[itemId][storeId] = { price, updatedAt: new Date().toISOString() };
  saveStorePrices();
  renderCatalogItemOptions();
  renderHomeRecommendations();
  renderItemList();
  renderCartAndAIPlan();
  openDetail(itemId);
}

function resetStorePrice(itemId, storeId) {
  if (savedStorePrices[itemId]) {
    delete savedStorePrices[itemId][storeId];
    if (Object.keys(savedStorePrices[itemId]).length === 0) delete savedStorePrices[itemId];
  }
  saveStorePrices();
  renderCatalogItemOptions();
  renderHomeRecommendations();
  renderItemList();
  renderCartAndAIPlan();
  openDetail(itemId);
}

function updateHeaderLocationDisplay() {
  const headerBtn = document.getElementById('header-location-text');
  const mypageText = document.getElementById('mypage-location-info');
  const mypagePlaceText = document.getElementById('mypage-place-info');
  const homeShoppingArea = document.getElementById('home-shopping-area');
  const homeLocationSummary = document.getElementById('home-location-summary');

  const icon = userLocation.isGPS ? '<i class="fa-solid fa-location-arrow"></i>' : '<i class="fa-solid fa-location-dot"></i>';
  const text = `${userLocation.addressName} (半径${currentFilterRadius === 999 ? '10km以内' : currentFilterRadius + 'km'})`;

  headerBtn.innerHTML = text;
  if (homeShoppingArea) {
    homeShoppingArea.textContent = userLocation.addressName || '未設定';
  }
  if (homeLocationSummary) {
    homeLocationSummary.textContent = userPlaceProfile.homeAddress
      ? `お住まい：${userPlaceProfile.homeAddress}`
      : 'このエリアを近くのお店検索に使います。';
  }
  if (mypageText) {
    mypageText.innerHTML = `${icon} <b>${userLocation.addressName}</b><br><span style="color:#666; font-size:0.8rem;">（方式: ${userLocation.isGPS ? 'GPS高精度取得' : '地名検索'}）</span>`;
  }
  if (mypagePlaceText) {
    mypagePlaceText.textContent = [
      userPlaceProfile.homeAddress ? `住んでいる場所：${userPlaceProfile.homeAddress}` : '',
      `買い物エリア：${userLocation.addressName}`
    ].filter(Boolean).join(' / ') || '住んでいる場所・普段の買い物エリアは未登録です。';
  }
}

function requestGPSLocation() {
  if (!navigator.geolocation) {
    alert("お使いのブラウザは位置情報をサポートしていません。");
    return;
  }

  savePlaceProfileFromInputs();
  document.getElementById('header-location-text').innerText = "GPS取得中...";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        addressName: '現在地（GPS指定）',
        isGPS: true
      };
      saveLocationState();
      closeLocationModal();
      refreshAllViews();
      refreshNearbyStores(true);
    },
    (error) => {
      alert("位置情報の取得に失敗しました。買い物エリアを検索して設定してください。");
      updateHeaderLocationDisplay();
    }
  );
}

async function searchShoppingArea() {
  const query = document.getElementById('shopping-area-input').value.trim();
  const status = document.getElementById('place-search-status');
  const resultsSelect = document.getElementById('place-search-results');
  const saveButton = document.getElementById('save-shopping-area-button');
  const searchButton = document.getElementById('search-shopping-area-button');
  const input = document.getElementById('shopping-area-input');
  selectedGeocodedPlace = null;
  saveButton.disabled = true;
  resultsSelect.disabled = true;
  resultsSelect.innerHTML = '<option value="">場所を検索しています...</option>';

  if (!query) {
    resultsSelect.innerHTML = '<option value="">買い物エリアを入力してください</option>';
    status.textContent = '市区町村名や駅名などを入力してください。';
    return;
  }

  searchButton.disabled = true;
  input.disabled = true;
  status.textContent = '入力した買い物エリアだけを地名検索に送信します…';
  try {
    const results = await findGeocodedPlaces(query);
    if (results.length === 0) {
      resultsSelect.innerHTML = '<option value="">該当する場所が見つかりません</option>';
      status.textContent = '場所が見つかりませんでした。市区町村名や駅名を含めてお試しください。';
      return;
    }

    resultsSelect.innerHTML = results.map((place, index) =>
      `<option value="${index}">${escapeHTML(place.display_name)}</option>`
    ).join('');
    resultsSelect.disabled = false;
    selectedGeocodedPlace = results[0];
    saveButton.disabled = false;
    status.textContent = '検索結果を確認してから「選んだ場所を検索地点に設定」を押してください。';
    resultsSelect.onchange = () => {
      const selectedIndex = Number(resultsSelect.value);
      selectedGeocodedPlace = results[selectedIndex] || null;
      saveButton.disabled = !selectedGeocodedPlace;
    };
  } catch (error) {
    console.error('買い物エリアの地名検索に失敗しました。', error);
    resultsSelect.innerHTML = '<option value="">検索できませんでした</option>';
    status.textContent = '地名検索に失敗しました。通信状態を確認して、もう一度お試しください。';
  } finally {
    searchButton.disabled = false;
    input.disabled = false;
  }
}

function invalidateShoppingAreaSearch() {
  selectedGeocodedPlace = null;
  document.getElementById('place-search-results').disabled = true;
  document.getElementById('place-search-results').innerHTML = '<option value="">入力内容を変更しました。再検索してください</option>';
  document.getElementById('save-shopping-area-button').disabled = true;
  document.getElementById('place-search-status').textContent = '';
}

async function findGeocodedPlaces(query) {
  const cache = loadPlaceSearchCache();
  const cacheKey = query.normalize('NFKC').toLocaleLowerCase('ja-JP');
  if (Array.isArray(cache[cacheKey])) return cache[cacheKey];

  await waitForNominatimRequestSlot();

  const url = new URL(PLACE_SEARCH_ENDPOINT);
  url.search = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'jp',
    'accept-language': 'ja'
  }).toString();

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`地名検索サービスが ${response.status} を返しました。`);
  }
  const places = await response.json();
  if (!Array.isArray(places)) {
    throw new Error('地名検索サービスから不正な応答がありました。');
  }

  const validPlaces = places.filter(place =>
    typeof place.display_name === 'string' &&
    Number.isFinite(Number(place.lat)) &&
    Number.isFinite(Number(place.lon))
  ).map(place => ({
    display_name: place.display_name,
    lat: Number(place.lat),
    lng: Number(place.lon)
  }));
  cache[cacheKey] = validPlaces;
  localStorage.setItem(PLACE_SEARCH_CACHE_KEY, JSON.stringify(cache));
  return validPlaces;
}

function loadPlaceSearchCache() {
  try {
    const cache = JSON.parse(localStorage.getItem(PLACE_SEARCH_CACHE_KEY) || '{}');
    if (!cache || typeof cache !== 'object' || Array.isArray(cache)) return {};
    return Object.fromEntries(Object.entries(cache).filter(([, places]) =>
      Array.isArray(places) && places.every(place =>
        typeof place.display_name === 'string' &&
        Number.isFinite(place.lat) &&
        Number.isFinite(place.lng)
      )
    ));
  } catch (error) {
    console.error('地名検索のキャッシュを読み込めませんでした。', error);
    return {};
  }
}

function saveManualArea() {
  if (!selectedGeocodedPlace) {
    document.getElementById('place-search-status').textContent = '先に買い物エリアを検索し、候補を選択してください。';
    return;
  }

  userPlaceProfile = {
    homeAddress: document.getElementById('home-address-input').value.trim(),
    shoppingArea: document.getElementById('shopping-area-input').value.trim()
  };
  localStorage.setItem(PLACE_PROFILE_STORAGE_KEY, JSON.stringify(userPlaceProfile));
  userLocation = {
    lat: selectedGeocodedPlace.lat,
    lng: selectedGeocodedPlace.lng,
    addressName: userPlaceProfile.shoppingArea,
    isGPS: false
  };

  saveLocationState();
  selectedGeocodedPlace = null;
  closeLocationModal();
  refreshAllViews();
  refreshNearbyStores(true);
}

function savePlaceProfileFromInputs() {
  userPlaceProfile = {
    homeAddress: document.getElementById('home-address-input').value.trim(),
    shoppingArea: document.getElementById('shopping-area-input').value.trim()
  };
  localStorage.setItem(PLACE_PROFILE_STORAGE_KEY, JSON.stringify(userPlaceProfile));
}

function saveLocationState() {
  localStorage.setItem('fresh_save_loc', JSON.stringify(userLocation));
}

function loadSavedLocation() {
  const saved = localStorage.getItem('fresh_save_loc');
  if (saved) {
    userLocation = JSON.parse(saved);
  }
  const savedProfile = localStorage.getItem(PLACE_PROFILE_STORAGE_KEY);
  if (savedProfile) {
    try {
      const profile = JSON.parse(savedProfile);
      if (profile && typeof profile === 'object') {
        const savedShoppingArea = typeof profile.shoppingArea === 'string' ? profile.shoppingArea : '';
        userPlaceProfile = {
          homeAddress: typeof profile.homeAddress === 'string' ? profile.homeAddress : '',
          shoppingArea: typeof profile.shoppingAreaDetail === 'string' && profile.shoppingAreaDetail
            ? profile.shoppingAreaDetail
            : savedShoppingArea
        };
      }
    } catch (error) {
      console.error('登録した場所を読み込めませんでした。', error);
    }
  }
  updateHeaderLocationDisplay();
}

function loadLocationForm() {
  document.getElementById('home-address-input').value = userPlaceProfile.homeAddress;
  document.getElementById('shopping-area-input').value = userPlaceProfile.shoppingArea;
  document.getElementById('shopping-area-input').disabled = false;
  selectedGeocodedPlace = null;
  document.getElementById('search-shopping-area-button').disabled = false;
  const resultsSelect = document.getElementById('place-search-results');
  resultsSelect.disabled = true;
  resultsSelect.innerHTML = '<option value="">先に買い物エリアを検索してください</option>';
  document.getElementById('place-search-status').textContent = '';
  document.getElementById('save-shopping-area-button').disabled = true;
}

function updateHomeCartSummary(itemCount) {
  const summary = document.getElementById('home-cart-summary');
  if (summary) {
    summary.innerHTML = itemCount > 0
      ? `未購入 ${itemCount}点 <i class="fa-solid fa-chevron-right"></i>`
      : 'リストは空です <i class="fa-solid fa-chevron-right"></i>';
  }
}

function setSearchRadius(radiusKm) {
  currentFilterRadius = radiusKm;
  document.querySelectorAll('.radius-btn').forEach(button => {
    const buttonRadius = Number(button.dataset.radius);
    button.classList.toggle('active', buttonRadius === radiusKm);
  });
  updateHeaderLocationDisplay();
  renderNearbyStoreSummary();
  renderItemList();
  renderPosts();
}

function refreshAllViews() {
  updateHeaderLocationDisplay();
  renderNearbyStoreSummary();
  renderHomeRecommendations();
  renderItemList();
  renderPosts();
  renderCartAndAIPlan();
}

// --- Render Helper Functions ---
function getStarsHTML(count) {
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < count ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
  }
  return stars;
}

function renderItemRecommendations(item, offer, detail = false) {
  const { distKm, walkMin } = getStoreDistance(offer.store.id);
  return `
    <div class="item-recommendations ${detail ? 'item-recommendations-detail' : ''}">
      <div class="item-recommendation price-recommendation">
        <span class="item-recommendation-label">価格重視のおすすめ</span>
        <b>${offer.isUserEntered ? '記録価格' : '参考最安'} ￥${offer.price}</b>
        <small>${escapeHTML(offer.store.name)}・${escapeHTML(getStoreAddressLabel(offer.store))}・徒歩${walkMin}分（${distKm}km）</small>
      </div>
      <div class="item-recommendation freshness-recommendation">
        <span class="item-recommendation-label">鮮度重視のおすすめ</span>
        <b><span class="freshness-stars">${getStarsHTML(item.freshness)}</span> ${item.freshness}/5</b>
        <small>商品単位の評価です。店舗ごとの鮮度情報はありません。</small>
      </div>
    </div>
  `;
}

// Render Page 1 Recommendations
function renderHomeRecommendations() {
  const container = document.getElementById('home-recommendations');
  const filtered = getRecommendedItems(ITEMS.filter(item => {
    return getAvailableItemPrices(item).length > 0;
  })).slice(0, 3);

  if (filtered.length === 0) {
    container.innerHTML = '<p style="grid-column: span 3; font-size: 0.8rem; color: #888; text-align:center; padding:10px;">指定範囲内に該当する食材がありません。</p>';
    return;
  }

  container.innerHTML = filtered.map(item => {
    const cheapestOffer = getCheapestItemOffer(item);
    return `
      <div class="card" onclick="openDetail(${item.id})">
        <img src="${item.img}" alt="${item.name}">
        <div class="card-body">
          <div class="card-title">${item.name}</div>
          ${renderItemRecommendations(item, cheapestOffer)}
        </div>
      </div>
    `;
  }).join('');
}

// Render Page 2 Item List
function renderItemList() {
  const container = document.getElementById('search-item-list');
  const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';

  const filtered = getRecommendedItems(ITEMS.filter(item => {
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchVal) ||
      getItemPrices(item).some(({ store }) => store.name.toLowerCase().includes(searchVal));
    const matchesDistance = getAvailableItemPrices(item).length > 0;

    return matchesCategory && matchesSearch && matchesDistance;
  }));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 40px 10px; color:var(--text-light);">
        <i class="fa-solid fa-basket-shopping" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i>
        <p>該当する食材が見つかりませんでした。<br>検索距離範囲（km）を広げてお試しください。</p>
      </div>`;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const availableOffers = getAvailableItemPrices(item);
    const cheapestOffer = availableOffers[0];
    const { distKm, walkMin } = getStoreDistance(cheapestOffer.store.id);

    return `
      <div class="item-card-horizontal" onclick="openDetail(${item.id})">
        <img src="${item.img}" alt="${item.name}">
        <div class="item-info">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <span class="card-title">${item.name}</span>
              <span class="item-badge-fresh">${item.arrivalDate.split(' ')[0]}</span>
            </div>
            <div class="card-store">${cheapestOffer.store.name}・${getStoreAddressLabel(cheapestOffer.store)}・<i class="fa-solid fa-person-walking"></i> 徒歩${walkMin}分(${distKm}km)</div>
          </div>
          ${renderItemRecommendations(item, cheapestOffer)}
          <div class="price-comparison-list">${renderItemPriceComparisons(item)}</div>
        </div>
      </div>
    `;
  }).join('');
}

function filterCategory(cat, btnElem) {
  currentCategory = cat;
  document.querySelectorAll('.filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btnElem) btnElem.classList.add('active');
  renderItemList();
}

function filterItems() {
  renderItemList();
}

// Render Page 3 Item Detail
function openDetail(itemId) {
  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const availableOffers = getAvailableItemPrices(item);
  const cheapestOffer = availableOffers[0] || getCheapestItemOffer(item);
  const container = document.getElementById('detail-content');
  const priceEditorWasOpen = Boolean(container.querySelector('.price-editor[open]'));

  const inCart = cart.includes(item.id);
  const comparisonRows = availableOffers.map(({ store, price, isUserEntered }) => {
    const { distKm, walkMin } = getStoreDistance(store.id);
    const isCheapest = store.id === cheapestOffer.store.id;
    const freshness = getDemoStoreFreshness(item, store);
    const selected = selectedItemStores[String(item.id)] === store.id;
    return `<div class="price-comparison-row ${isCheapest ? 'cheapest' : ''} ${selected ? 'selected-store' : ''}">
      <div class="price-comparison-store-info">
        <b>${escapeHTML(store.name)}${store.source === 'OpenStreetMap' ? `・${escapeHTML(getStoreAddressLabel(store))}` : ''}${isCheapest ? '・価格おすすめ' : ''}${isUserEntered ? '' : '・サンプル'}</b>
        <small class="store-freshness-demo"><span class="freshness-stars">${getStarsHTML(freshness)}</span> 鮮度デモ ${freshness}/5</small>
      </div>
      <div class="price-comparison-store-actions">
        <span>￥${price} <small>徒歩${walkMin}分（${distKm}km）</small></span>
        <button type="button" class="store-select-button" ${selected ? 'disabled aria-pressed="true"' : `onclick="setItemStore(${item.id}, '${store.id}')" aria-pressed="false"`}>${selected ? '選択中' : 'この店舗を選ぶ'}</button>
      </div>
    </div>`;
  });
  const visibleComparisonRows = comparisonRows.slice(0, 3).join('');
  const otherComparisonRows = comparisonRows.slice(3);
  const priceRows = getItemPrices(item).map(({ store, price, updatedAt, isUserEntered }) => {
    const { distKm, walkMin } = getStoreDistance(store.id);
    const withinRange = parseFloat(distKm) <= currentFilterRadius;
    const hasUpdateTime = updatedAt && !Number.isNaN(Date.parse(updatedAt));
    const priceStatus = isUserEntered
      ? `入力価格${hasUpdateTime ? `・更新 ${new Date(updatedAt).toLocaleString('ja-JP')}` : ''}`
      : 'サンプル価格';
    return `
      <div class="price-editor-row ${withinRange ? '' : 'outside-range'}">
        <label for="price-${item.id}-${store.id}">${escapeHTML(store.name)}・${escapeHTML(getStoreAddressLabel(store))}
          <small>${withinRange ? `徒歩${walkMin}分（${distKm}km）` : `検索範囲外・${distKm}km`}</small>
        </label>
        <div class="price-editor-controls">
          <span>￥</span>
          <input id="price-${item.id}-${store.id}" type="number" min="1" step="1" value="${price}" aria-label="${escapeHTML(store.name)}の${escapeHTML(item.name)}の価格">
          <button type="button" onclick="setStorePrice(${item.id}, '${store.id}', this.parentElement.querySelector('input').value)">保存</button>
          ${isUserEntered ? `<button type="button" class="price-reset-btn" onclick="resetStorePrice(${item.id}, '${store.id}')">サンプルに戻す</button>` : ''}
        </div>
        <small class="price-editor-status">${priceStatus}</small>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <h2 style="font-size:1.2rem; margin-bottom:10px; font-weight:700;">${item.name} の詳細</h2>
    <img src="${item.img}" class="detail-img" alt="${item.name}">

    <div class="info-card">
      ${renderItemRecommendations(item, cheapestOffer, true)}
      <p class="price-data-note">価格はサンプルまたは入力情報です。店舗ごとの「鮮度デモ」は画面確認用の仮データで、実際の商品の状態や店舗の評価ではありません。実際の鮮度は店頭でご確認ください。</p>
      <div class="price-comparison-list price-comparison-detail">
        ${visibleComparisonRows}
        ${otherComparisonRows.length ? `<details class="price-comparison-more"><summary>ほか${otherComparisonRows.length}店舗の価格を見る</summary>${otherComparisonRows.join('')}</details>` : ''}
      </div>
      <details class="price-editor">
        <summary>店舗ごとの価格を入力・更新</summary>
        <p class="price-editor-note">入力した価格はこのブラウザーに保存されます。他の人には共有されません。</p>
        ${priceRows}
      </details>
      <div style="font-size:0.85rem; color:var(--text-dark); margin-top:4px;">
        <b>入荷情報：</b> ${item.arrivalDate} ／ 産地: ${item.origin}
      </div>
    </div>

    <!-- Freshness Info Box (Poster Element 3) -->
    <div class="info-card" style="background: #f0fdf4; border-color: #bbf7d0;">
      <h3 style="font-size:0.9rem; color:#166534; margin-bottom:6px;"><i class="fa-solid fa-eye"></i> スーパーが投稿した最新写真＆状態</h3>
      <p style="font-size:0.82rem; color:#15803d; line-height:1.4;">${item.description}</p>
    </div>

    <button class="btn ${inCart ? 'btn-secondary' : 'btn-primary'}" onclick="toggleCart(${item.id})">
      <i class="fa-solid ${inCart ? 'fa-check' : 'fa-cart-plus'}"></i>
      ${inCart ? '買い物リストから削除' : 'この食材を買い物リストに追加'}
    </button>
  `;
  if (priceEditorWasOpen) container.querySelector('.price-editor').open = true;

  navTo('detail');
}

// --- Cart & AI Optimization Plan Logic ---
function toggleCart(itemId) {
  const index = cart.indexOf(itemId);
  if (index > -1) {
    cart.splice(index, 1);
    delete shoppingProgress[`catalog:${itemId}`];
  } else {
    cart.push(itemId);
    shoppingProgress[`catalog:${itemId}`] = { quantity: 1, purchased: false };
  }
  saveShoppingState();
  updateCartUI();
  openDetail(itemId); // Refresh detail view state
}

function clearCart() {
  cart = [];
  shoppingProgress = {};
  customItems = [];
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(SHOPPING_PROGRESS_STORAGE_KEY);
  localStorage.removeItem(CUSTOM_ITEMS_STORAGE_KEY);
  updateCartUI();
}

function addCustomItem(event) {
  event.preventDefault();
  const input = document.getElementById('custom-item-name');
  const name = input.value.trim();
  if (!name) {
    alert('買いたいものの名前を入力してください。');
    input.focus();
    return;
  }

  const catalogItem = findCatalogItem(name);
  const customItem = { id: crypto.randomUUID(), name, catalogItemId: catalogItem?.id ?? null };
  customItems.push(customItem);
  shoppingProgress[`custom:${customItem.id}`] = { quantity: 1, purchased: false };
  saveCustomItems();
  saveShoppingState();
  input.value = '';
  updateCartUI();
  input.focus();
}

function removeCustomItem(itemIndex) {
  const [removedItem] = customItems.splice(itemIndex, 1);
  if (removedItem) delete shoppingProgress[`custom:${removedItem.id}`];
  saveCustomItems();
  saveShoppingState();
  updateCartUI();
}

function loadCustomItems() {
  const savedItems = localStorage.getItem(CUSTOM_ITEMS_STORAGE_KEY);
  if (!savedItems) return;

  try {
    const parsedItems = JSON.parse(savedItems);
    if (Array.isArray(parsedItems)) {
      customItems = parsedItems.filter(item =>
        item &&
        typeof item.name === 'string' &&
        item.name.trim()
      ).map((item, index) => {
        const catalogItem = ITEMS.find(catalogEntry => catalogEntry.id === item.catalogItemId);
        const matchedItem = catalogItem || findCatalogItem(item.name);
        return {
          id: typeof item.id === 'string' ? item.id : `legacy-${index}`,
          name: item.name.trim(),
          catalogItemId: matchedItem?.id ?? null
        };
      });
      saveCustomItems();
    }
  } catch (error) {
    console.error('買い物リストの読み込みに失敗しました。', error);
  }
}

function saveCustomItems() {
  localStorage.setItem(CUSTOM_ITEMS_STORAGE_KEY, JSON.stringify(customItems));
}

function renderCatalogItemOptions() {
  const options = document.getElementById('catalog-item-options');
  options.innerHTML = ITEMS.map(item => {
    const { store, price } = getCheapestItemOffer(item);
    return `<option value="${escapeHTML(item.name)}" label="${escapeHTML(item.category)}・最安￥${price} ${escapeHTML(store.name)}"></option>`;
  }).join('');
}

function findCatalogItem(name) {
  const normalizedName = normalizeItemName(name);
  if (!normalizedName) return null;

  const exactMatch = ITEMS.find(item => normalizeItemName(item.name) === normalizedName);
  if (exactMatch) return exactMatch;
  if (normalizedName.length < 2) return null;

  const matches = ITEMS.filter(item => normalizeItemName(item.name).includes(normalizedName));
  return matches.length === 1 ? matches[0] : null;
}

function normalizeItemName(name) {
  return name.normalize('NFKC').toLowerCase().replace(/[\s・（）()]/g, '');
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const itemCount = [
    ...cart.map(id => `catalog:${id}`),
    ...customItems.map(item => `custom:${item.id}`)
  ].reduce((count, key) => count + (isItemPurchased(key) ? 0 : getItemQuantity(key)), 0);
  updateHomeCartSummary(itemCount);
  if (itemCount > 0) {
    badge.innerText = itemCount;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
  renderCartAndAIPlan();
}

function getCartEntries() {
  const selectedItems = ITEMS.filter(item => cart.includes(item.id)).map(item => ({
    name: item.name,
    item,
    progressKey: `catalog:${item.id}`,
    removeButton: `<button class="cart-remove-btn" aria-label="${escapeHTML(item.name)}を削除" onclick="toggleCart(${item.id})"><i class="fa-solid fa-trash"></i></button>`
  }));
  const customEntries = customItems.map((item, index) => ({
    name: item.name,
    item: ITEMS.find(catalogItem => catalogItem.id === item.catalogItemId),
    progressKey: `custom:${item.id}`,
    removeButton: `<button class="cart-remove-btn" aria-label="${escapeHTML(item.name)}を削除" onclick="removeCustomItem(${index})"><i class="fa-solid fa-trash"></i></button>`
  }));
  return selectedItems.concat(customEntries);
}

function renderCartProgress() {
  const entries = getCartEntries();
  const activeCount = entries.reduce((count, entry) =>
    count + (isItemPurchased(entry.progressKey) ? 0 : getItemQuantity(entry.progressKey)), 0);
  const purchasedCount = entries.reduce((count, entry) =>
    count + (isItemPurchased(entry.progressKey) ? getItemQuantity(entry.progressKey) : 0), 0);
  const progress = document.getElementById('cart-progress');
  if (progress) {
    const total = activeCount + purchasedCount;
    progress.innerHTML = total
      ? `<span>未購入 <b>${activeCount}</b> 点</span><span>購入済み <b>${purchasedCount}</b> 点</span>`
      : '買い物リストは空です';
  }

  document.querySelectorAll('.cart-view-filter').forEach(button => {
    const filter = button.dataset.cartFilter;
    const count = filter === 'active' ? activeCount
      : filter === 'purchased' ? purchasedCount
        : activeCount + purchasedCount;
    const label = filter === 'active' ? '未購入' : filter === 'purchased' ? '購入済み' : 'すべて';
    button.textContent = `${label} ${count}`;
    button.classList.toggle('active', filter === cartFilter);
    button.setAttribute('aria-pressed', String(filter === cartFilter));
  });
}

function getSortedPurchaseHistory() {
  return [...purchaseHistory].sort((a, b) =>
    Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt)
  );
}

function renderPurchaseHistory() {
  renderFrequentItems();
  const section = document.getElementById('purchase-history-section');
  const list = document.getElementById('purchase-history-list');
  if (!section || !list) return;
  const history = getSortedPurchaseHistory();
  section.hidden = history.length === 0;
  if (!history.length) return;

  const query = normalizeItemName(document.getElementById('purchase-history-search')?.value || '');
  const filteredHistory = history.map((entry, index) => ({ entry, index })).filter(({ entry }) =>
    !query || normalizeItemName(entry.name).includes(query)
  );
  const visibleHistory = showAllPurchaseHistory || query ? filteredHistory : filteredHistory.slice(0, 5);
  list.innerHTML = visibleHistory.map(({ entry, index }) => {
    const isFrequent = frequentItems.some(item => item.key === entry.key);
    return `
      <article class="purchase-history-row">
        <div class="purchase-history-item">
          <b>${escapeHTML(entry.name)}</b>
          <time datetime="${escapeHTML(entry.purchasedAt)}">${new Date(entry.purchasedAt).toLocaleString('ja-JP', {
            month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })}</time>
        </div>
        <div class="purchase-history-actions">
          <button type="button" onclick="addHistoryItemToCart(${index})">リストに追加</button>
          ${isFrequent
            ? '<span class="history-favorited">よく買うに登録済み</span>'
            : `<button type="button" class="history-favorite-button" onclick="addHistoryItemToFrequent(${index})">☆ よく買うに追加</button>`
          }
        </div>
      </article>
    `;
  }).join('');
  const historyToggle = document.getElementById('purchase-history-toggle');
  historyToggle.hidden = query.length > 0 || history.length <= 5;
  historyToggle.textContent = showAllPurchaseHistory ? '閉じる' : `すべて見る（${history.length}）`;
  if (filteredHistory.length === 0) {
    list.innerHTML = '<p class="purchase-history-empty">一致する購入履歴はありません。</p>';
  }
}

function renderFrequentItems() {
  const section = document.getElementById('frequent-items-section');
  const list = document.getElementById('frequent-items-list');
  if (!section || !list) return;
  section.hidden = frequentItems.length === 0;
  if (!frequentItems.length) return;

  const visibleItems = showAllFrequentItems ? frequentItems : frequentItems.slice(0, 6);
  list.innerHTML = visibleItems.map((entry, index) => {
    const alreadyAdded = entry.catalogItemId
      ? (cart.includes(entry.catalogItemId) && !isItemPurchased(`catalog:${entry.catalogItemId}`)) ||
        customItems.some(item =>
          (item.catalogItemId === entry.catalogItemId ||
            normalizeItemName(item.name) === normalizeItemName(entry.name)) &&
          !isItemPurchased(`custom:${item.id}`)
        )
      : customItems.some(item =>
        normalizeItemName(item.name) === normalizeItemName(entry.name) &&
        !isItemPurchased(`custom:${item.id}`)
      );
    return `
      <article class="repeat-item-card">
        <div class="repeat-item-info"><b>${escapeHTML(entry.name)}</b></div>
        <button type="button" onclick="addFrequentItemToCart(${index})" ${alreadyAdded ? 'disabled' : ''}>
          ${alreadyAdded ? '追加済み' : '<i class="fa-solid fa-plus"></i> 追加'}
        </button>
        <button type="button" class="frequent-remove-button" aria-label="${escapeHTML(entry.name)}をよく買うものから削除" onclick="removeFrequentItem(${index})">×</button>
      </article>
    `;
  }).join('');
  const toggle = document.getElementById('frequent-items-toggle');
  toggle.hidden = frequentItems.length <= 6;
  toggle.textContent = showAllFrequentItems ? '閉じる' : `すべて（${frequentItems.length}）`;
}

function togglePurchaseHistory() {
  showAllPurchaseHistory = !showAllPurchaseHistory;
  renderPurchaseHistory();
}

function toggleFrequentItems() {
  showAllFrequentItems = !showAllFrequentItems;
  renderFrequentItems();
}

function addPurchaseToCart(entry) {
  if (entry.catalogItemId && ITEMS.some(item => item.id === entry.catalogItemId)) {
    const existingCustomItem = customItems.find(item =>
      item.catalogItemId === entry.catalogItemId ||
      normalizeItemName(item.name) === normalizeItemName(entry.name)
    );
    if (existingCustomItem) {
      shoppingProgress[`custom:${existingCustomItem.id}`] = {
        ...shoppingProgress[`custom:${existingCustomItem.id}`],
        quantity: getItemQuantity(`custom:${existingCustomItem.id}`),
        purchased: false
      };
    } else if (!cart.includes(entry.catalogItemId)) {
      cart.push(entry.catalogItemId);
      shoppingProgress[`catalog:${entry.catalogItemId}`] = { quantity: 1, purchased: false };
    } else {
      shoppingProgress[`catalog:${entry.catalogItemId}`] = {
        ...shoppingProgress[`catalog:${entry.catalogItemId}`],
        quantity: getItemQuantity(`catalog:${entry.catalogItemId}`),
        purchased: false
      };
    }
  } else {
    const existingItem = customItems.find(item =>
      normalizeItemName(item.name) === normalizeItemName(entry.name)
    );
    if (existingItem) {
      shoppingProgress[`custom:${existingItem.id}`] = {
        ...shoppingProgress[`custom:${existingItem.id}`],
        quantity: getItemQuantity(`custom:${existingItem.id}`),
        purchased: false
      };
    } else {
      const customItem = { id: crypto.randomUUID(), name: entry.name, catalogItemId: null };
      customItems.push(customItem);
      shoppingProgress[`custom:${customItem.id}`] = { quantity: 1, purchased: false };
      saveCustomItems();
    }
  }
  saveShoppingState();
  updateCartUI();
}

function addHistoryItemToCart(historyIndex) {
  const entry = getSortedPurchaseHistory()[historyIndex];
  if (entry) addPurchaseToCart(entry);
}

function addFrequentItemToCart(itemIndex) {
  const entry = frequentItems[itemIndex];
  if (entry) addPurchaseToCart(entry);
}

function addHistoryItemToFrequent(historyIndex) {
  const entry = getSortedPurchaseHistory()[historyIndex];
  if (!entry || frequentItems.some(item => item.key === entry.key)) return;
  frequentItems.unshift({
    key: entry.key,
    name: entry.name,
    catalogItemId: entry.catalogItemId
  });
  saveFrequentItems();
  renderCartAndAIPlan();
}

function removeFrequentItem(itemIndex) {
  if (!frequentItems[itemIndex]) return;
  frequentItems.splice(itemIndex, 1);
  saveFrequentItems();
  renderCartAndAIPlan();
}

function setCartFilter(filter) {
  if (!['active', 'all', 'purchased'].includes(filter)) return;
  cartFilter = filter;
  renderCartAndAIPlan();
}

function renderCartAndAIPlan() {
  const listContainer = document.getElementById('cart-item-list');
  const aiPlanBox = document.getElementById('ai-plan-content');
  renderCartProgress();
  renderPurchaseHistory();

  if (cart.length === 0 && customItems.length === 0) {
    listContainer.innerHTML = '<p style="text-align:center; padding:30px; color:var(--text-light); font-size:0.85rem;">買い物リストは空です。<br>上の入力欄・よく買うもの・検索から追加できます。</p>';
    aiPlanBox.innerHTML = 'リストに商品を追加すると、価格のおすすめや「1店舗で買う」「商品ごとに店舗を選ぶ」プランを確認できます。';
    return;
  }

  const cartEntries = getCartEntries();
  const selectedItems = ITEMS.filter(item => cart.includes(item.id));
  const customEntries = cartEntries.filter(entry => entry.progressKey.startsWith('custom:'));
  const remainingPlanItems = new Map();
  const addRemainingPlanItem = (item, key) => {
    if (!item || isItemPurchased(key)) return;
    const existing = remainingPlanItems.get(item.id);
    remainingPlanItems.set(item.id, {
      ...item,
      quantity: (existing?.quantity || 0) + getItemQuantity(key)
    });
  };
  selectedItems.forEach(item => {
    addRemainingPlanItem(item, `catalog:${item.id}`);
  });
  customEntries.forEach(entry => {
    addRemainingPlanItem(entry.item, entry.progressKey);
  });
  const planItems = Array.from(remainingPlanItems.values());
  const storeBranchChoices = getStoreBranchChoices();
  const displayStoreId = purchasePlanMode === 'single'
    ? (storeBranchChoices.find(store => store.id === singleStoreId) || storeBranchChoices[0])?.id
    : null;
  const visibleCartEntries = cartEntries.filter(entry =>
    cartFilter === 'all' ||
    (cartFilter === 'purchased' ? isItemPurchased(entry.progressKey) : !isItemPurchased(entry.progressKey))
  ).filter(entry => {
    const searchInput = document.getElementById('cart-search-input');
    const query = normalizeItemName(searchInput?.value || '');
    return !query || normalizeItemName(entry.name).includes(query);
  });

  const categories = new Map();
  visibleCartEntries.forEach(entry => {
    const category = entry.item?.category || 'その他';
    if (!categories.has(category)) categories.set(category, []);
    categories.get(category).push(entry);
  });

  listContainer.innerHTML = categories.size === 0
    ? `<p class="cart-filter-empty">${document.getElementById('cart-search-input')?.value.trim()
      ? '検索条件に合う商品がありません。'
      : cartFilter === 'purchased' ? '購入済みの商品はまだありません。' : '未購入の商品はありません。よく買うものや検索から追加できます。'}</p>`
    : Array.from(categories, ([category, entries]) => {
    const stores = new Map();
    const unmatchedEntries = [];
    entries.forEach(entry => {
      if (entry.item) {
        const offer = displayStoreId
          ? getItemPriceAtStore(entry.item, displayStoreId)
          : purchasePlanMode === 'choose'
            ? getSelectedItemOffer(entry.item)
            : getCheapestItemOffer(entry.item);
        if (!stores.has(offer.store.id)) stores.set(offer.store.id, []);
        stores.get(offer.store.id).push(entry);
      } else {
        unmatchedEntries.push(entry);
      }
    });

    const storeGroupsHTML = purchasePlanMode === 'single'
      ? entries.map(entry => renderCartEntry(entry, displayStoreId)).join('')
      : Array.from(stores, ([storeId, storeEntries]) => {
      const store = getAllStores().find(entry => entry.id === storeId);
      const storeItemsHTML = storeEntries.map(entry => renderCartEntry(entry, storeId)).join('');
      return `
        <div class="cart-store-group">
          <div class="cart-store-heading"><i class="fa-solid fa-store"></i> ${purchasePlanMode === 'choose' ? '選択中' : '価格のおすすめ'}：${escapeHTML(store.name)}・${escapeHTML(getStoreAddressLabel(store))}</div>
          ${storeItemsHTML}
        </div>
      `;
      }).join('');

    return `
      <section class="cart-category-group">
        <h3 class="cart-category-heading">${escapeHTML(category)}</h3>
        ${storeGroupsHTML}
        ${unmatchedEntries.map(entry => renderCartEntry(entry)).join('')}
      </section>
    `;
  }).join('');

  if (planItems.length === 0) {
    const hasCatalogItems = selectedItems.length > 0 || customEntries.some(entry => entry.item);
    const hasUnmatchedCustomItems = customEntries.some(entry => !entry.item && !isItemPurchased(entry.progressKey));
    if (hasCatalogItems && !hasUnmatchedCustomItems) {
      aiPlanBox.innerHTML = 'リストの商品はすべて購入済みです。未購入の商品がある場合はチェックを外すと、買い物プランに再表示されます。';
    } else if (hasCatalogItems) {
      aiPlanBox.innerHTML = '検索一覧の商品は購入済みです。価格情報がない手入力の商品は買い物プランの対象外です。';
    } else {
      aiPlanBox.innerHTML = '自分で追加した商品は、店舗や価格の情報がないため購入プランの対象外です。検索から追加した食材のプランはここに表示されます。';
    }
    return;
  }

  const storeGroups = {};
  let totalPrice = 0;

  planItems.forEach(item => {
    const offer = purchasePlanMode === 'single'
      ? getItemPriceAtStore(item, displayStoreId)
      : purchasePlanMode === 'choose'
        ? getSelectedItemOffer(item)
        : getCheapestItemOffer(item);
    totalPrice += offer.price * item.quantity;
    if (!storeGroups[offer.store.id]) {
      storeGroups[offer.store.id] = [];
    }
    storeGroups[offer.store.id].push({ ...item, selectedPrice: offer.price });
  });

  const storeIds = Object.keys(storeGroups);
  const planControls = `
    <p class="plan-mode-prompt">どんな買い方にしますか？</p>
    <div class="purchase-plan-options" role="group" aria-label="買い物プラン">
      <button type="button" class="purchase-plan-option ${purchasePlanMode === 'cheapest' ? 'active' : ''}" aria-pressed="${purchasePlanMode === 'cheapest'}" onclick="setPurchasePlanMode('cheapest')">
        <span class="purchase-plan-option-title"><i class="fa-solid fa-tags"></i> 価格のおすすめ</span>
        <span class="purchase-plan-option-description">商品ごとに価格の安い店を提案。複数店舗になる場合があります。</span>
      </button>
      <button type="button" class="purchase-plan-option ${purchasePlanMode === 'single' ? 'active' : ''}" aria-pressed="${purchasePlanMode === 'single'}" onclick="setPurchasePlanMode('single')">
        <span class="purchase-plan-option-title"><i class="fa-solid fa-store"></i> 1店舗にまとめる</span>
        <span class="purchase-plan-option-description">スーパーを1店選び、そこで揃える場合の価格を表示。</span>
      </button>
      <button type="button" class="purchase-plan-option ${purchasePlanMode === 'choose' ? 'active' : ''}" aria-pressed="${purchasePlanMode === 'choose'}" onclick="setPurchasePlanMode('choose')">
        <span class="purchase-plan-option-title"><i class="fa-solid fa-hand-pointer"></i> 商品ごとに選ぶ</span>
        <span class="purchase-plan-option-description">各商品で行きたいスーパーを指定。組み合わせは自由です。</span>
      </button>
    </div>
    <p class="plan-price-note">${purchasePlanMode === 'choose'
      ? '各商品の「購入するスーパー」から選んでください。選択は保存されます。'
      : purchasePlanMode === 'single'
        ? '選んだスーパーの距離・商品別価格・合計目安を表示します。'
        : '価格のおすすめを表示中です。行く店舗は「商品ごとに選ぶ」から変更できます。'
    } 価格はサンプルまたは入力情報です。</p>
    <p class="plan-note">鮮度デモは仮データです。実際の商品の状態は店頭でご確認ください。</p>
  `;

  if (purchasePlanMode === 'single') {
    const selectedStore = getAllStores().find(store => store.id === displayStoreId);
    if (!selectedStore) {
      aiPlanBox.innerHTML = `${planControls}<p class="plan-note">選択できる店舗がありません。買い物エリアを設定して近くのスーパーを検索してください。</p>`;
      return;
    }
    const selectedStoreItems = planItems.map(item => ({
      item,
      price: getItemPriceAtStore(item, selectedStore.id).price,
      quantity: item.quantity
    }));
    const selectedStoreTotal = selectedStoreItems.reduce((sum, entry) => sum + entry.price * entry.quantity, 0);
    const { distKm, walkMin } = getStoreDistance(selectedStore.id);
    const nearbySingleStoreChoices = getAllStores()
      .filter(store => Number(getStoreDistance(store.id).distKm) <= getActiveDistanceRadius())
      .sort((a, b) =>
        calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) -
        calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng)
      );
    const singleStoreChoices = nearbySingleStoreChoices.length ? nearbySingleStoreChoices : getAllStores();
    const optionsHTML = singleStoreChoices.map(store => `
      <option value="${store.id}" ${store.id === selectedStore.id ? 'selected' : ''}>${escapeHTML(store.name)}・${escapeHTML(getStoreAddressLabel(store))}・${getStoreDistance(store.id).distKm}km</option>
    `).join('');
    const knownItemsHTML = selectedStoreItems.length
      ? selectedStoreItems.map(({ item, price, quantity }) => `
        <li>
          <span>${escapeHTML(item.name)} <small>× ${quantity}</small></span>
          <b>￥${price * quantity}</b>
        </li>
      `).join('')
      : '<li>この店舗で価格が登録された商品はありません。</li>';

    aiPlanBox.innerHTML = `
      ${planControls}
      <section class="single-store-picker-card" aria-label="まとめ買いするスーパー">
        <div class="single-store-picker-heading">
          <span class="single-store-icon"><i class="fa-solid fa-store"></i></span>
          <div>
            <b>まとめ買いするスーパー</b>
            <small>1店舗で揃える場合の価格を確認できます</small>
          </div>
        </div>
        <div class="single-store-current">
          <b>${escapeHTML(selectedStore.name)}</b>
          <span>${escapeHTML(getStoreAddressLabel(selectedStore))}</span>
          <span class="single-store-distance"><i class="fa-solid fa-person-walking"></i> 徒歩${walkMin}分・${distKm}km</span>
        </div>
        <label class="single-store-select-label" for="single-store-select">スーパーを変更</label>
        <select id="single-store-select" class="single-store-select" onchange="setSingleStore(this.value)">${optionsHTML}</select>
      </section>
      <div class="single-store-estimate">
        <div class="single-store-total">
          <span>この店舗で買う場合の合計目安</span>
          <b>￥${selectedStoreTotal}</b>
        </div>
        <p class="single-store-summary">価格未登録の商品はサンプル価格で計算しています。実際の価格・在庫は店頭でご確認ください。</p>
        <div class="plan-confirmed-title">買うもの <span>${selectedStoreItems.length}点</span></div>
        <ul class="single-store-item-list">${knownItemsHTML}</ul>
      </div>
    ` + (customItems.some(item => !item.catalogItemId)
      ? '<p class="plan-note">検索一覧にない手入力の商品は、店舗・価格情報がありません。</p>'
      : '');
    return;
  }

  let planHTML = '';
  if (storeIds.length === 1) {
    const store = getAllStores().find(s => s.id === storeIds[0]);
    const { distKm, walkMin } = getStoreDistance(store.id);

    planHTML = `
      <p class="plan-recommendation">
        ✨ <b>${purchasePlanMode === 'choose' ? '選択した商品は' : '価格のおすすめは'}「${escapeHTML(store.name)}・${escapeHTML(getStoreAddressLabel(store))}」です。</b>
      </p>
      <div class="plan-details">
        ・この店舗で買う場合の合計目安: <b>￥${totalPrice}</b><br>
        ・現在地から<b>徒歩${walkMin}分 (約${distKm}km)</b>
      </div>
    `;
  } else {
    // Multi-store route proposal
    let storeDetails = storeIds.map(id => {
      const store = getAllStores().find(s => s.id === id);
      const { walkMin } = getStoreDistance(id);
      const itemNames = storeGroups[id].map(item => `${item.name} × ${item.quantity}（￥${item.selectedPrice * item.quantity}）`).join('、');
      return `・<b>${escapeHTML(store.name)}・${escapeHTML(getStoreAddressLabel(store))}</b> (徒歩${walkMin}分): ${escapeHTML(itemNames)}`;
    }).join('<br>');

    planHTML = `
      <p class="plan-recommendation">
        🛒 <b>${purchasePlanMode === 'choose'
          ? `選んだ店舗は${storeIds.length}店舗です。`
          : `価格のおすすめは${storeIds.length}店舗に分かれます。`
        }</b>
      </p>
      <div class="plan-details">
        ${storeDetails}<br>
        <hr>
        <b>合計の目安: ￥${totalPrice}</b>
      </div>
    `;
  }

  aiPlanBox.innerHTML = planControls + planHTML + (customItems.some(item => !item.catalogItemId)
    ? '<p style="font-size:0.75rem; color:var(--text-light); margin-top:8px;">検索一覧にない手入力の商品は、店舗・価格の情報がないためプランに含まれていません。</p>'
    : '');
}

function setPurchasePlanMode(mode) {
  if (!['cheapest', 'single', 'choose'].includes(mode)) return;
  purchasePlanMode = mode;
  renderCartAndAIPlan();
}

function setSingleStore(storeId) {
  const store = getAllStores().find(entry => entry.id === storeId);
  if (!store) {
    throw new Error(`Unknown store: ${storeId}`);
  }
  singleStoreId = storeId;
  selectedStoreBranches[getStoreBrandKey(store)] = storeId;
  localStorage.setItem(STORE_BRANCH_PREFERENCES_KEY, JSON.stringify(selectedStoreBranches));
  renderNearbyStoreSummary();
  renderCatalogItemOptions();
  renderHomeRecommendations();
  renderItemList();
  renderCartAndAIPlan();
}

function setItemStore(itemId, storeId) {
  const item = ITEMS.find(entry => entry.id === itemId);
  if (!item) throw new Error(`Unknown item: ${itemId}`);
  const offers = getAvailableItemPrices(item);
  const choices = offers.length ? offers : getItemPrices(item);
  if (!choices.some(offer => offer.store.id === storeId)) {
    throw new Error(`Store ${storeId} does not have a selectable offer for item ${itemId}`);
  }
  selectedItemStores[String(itemId)] = storeId;
  localStorage.setItem(ITEM_STORE_PREFERENCES_KEY, JSON.stringify(selectedItemStores));
  const detailPage = document.getElementById('page-detail');
  if (detailPage?.classList.contains('active')) {
    const scrollPosition = window.scrollY;
    openDetail(itemId);
    window.scrollTo(0, scrollPosition);
  }
  renderCartAndAIPlan();
}

function renderCartEntry(entry, storeId) {
  const offer = entry.item ? getItemPriceAtStore(entry.item, storeId) : null;
  const storeInfo = entry.item
    ? `${purchasePlanMode === 'single' ? '選択した店舗' : purchasePlanMode === 'choose' ? '選択中' : 'おすすめ'}：${escapeHTML(getAllStores().find(store => store.id === storeId).name)}・${escapeHTML(getStoreAddressLabel(getAllStores().find(store => store.id === storeId)))}・￥${offer.price}${offer.isUserEntered ? '' : '（サンプル）'}`
    : '検索一覧に該当商品なし';
  const storeChoices = purchasePlanMode === 'choose' && entry.item
    ? (getAvailableItemPrices(entry.item).length ? getAvailableItemPrices(entry.item) : getItemPrices(entry.item))
      .map(itemOffer => {
        const freshness = getDemoStoreFreshness(entry.item, itemOffer.store);
        return `<option value="${itemOffer.store.id}" ${itemOffer.store.id === storeId ? 'selected' : ''}>${escapeHTML(itemOffer.store.name)}・${escapeHTML(getStoreAddressLabel(itemOffer.store))} ￥${itemOffer.price}${itemOffer.isUserEntered ? '' : '（参考）'}・鮮度デモ${freshness}/5</option>`;
      })
      .join('')
    : '';
  const purchased = isItemPurchased(entry.progressKey);
  return `
    <div class="cart-item-row ${purchased ? 'purchased' : ''}">
      <div>
        <div class="cart-item-name">${escapeHTML(entry.name)}</div>
        <div class="cart-item-store">${storeInfo}</div>
        ${storeChoices ? `<label class="cart-item-store-choice-label" for="item-store-${entry.item.id}">購入するスーパー</label><select id="item-store-${entry.item.id}" class="cart-item-store-choice" aria-label="${escapeHTML(entry.name)}の購入店舗" onchange="setItemStore(${entry.item.id}, this.value)">${storeChoices}</select>` : ''}
        <div class="cart-item-actions">
          <label class="purchased-control">
            <input type="checkbox" ${purchased ? 'checked' : ''} onchange="setItemPurchased('${entry.progressKey}', this.checked)">
            買った
          </label>
          <label class="quantity-control">
            個数
            <input type="number" min="1" max="99" value="${getItemQuantity(entry.progressKey)}" onchange="setItemQuantity('${entry.progressKey}', this.value)" aria-label="${escapeHTML(entry.name)}の個数">
          </label>
        </div>
      </div>
      ${entry.removeButton}
    </div>
  `;
}

function setItemPurchased(key, purchased) {
  const wasPurchased = isItemPurchased(key);
  shoppingProgress[key] = { ...shoppingProgress[key], quantity: getItemQuantity(key), purchased };
  if (purchased && !wasPurchased) recordPurchase(key);
  saveShoppingState();
  updateCartUI();
}

function setItemQuantity(key, value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    alert('個数は1〜99の整数で入力してください。');
    updateCartUI();
    return;
  }
  shoppingProgress[key] = { ...shoppingProgress[key], quantity, purchased: isItemPurchased(key) };
  saveShoppingState();
  updateCartUI();
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

// Render Page 5 Supermarket Posts
function renderPosts() {
  const container = document.getElementById('posts-container');
  const stores = nearbyStores
    .map(store => ({ store, ...getStoreDistance(store.id) }))
    .filter(({ distKm }) => Number(distKm) <= getActiveDistanceRadius())
    .sort((a, b) => Number(a.distKm) - Number(b.distKm))
    .slice(0, DEMO_POSTS.length);
  if (!stores.length) {
    container.innerHTML = '<p class="posts-empty">設定したエリアの近隣スーパー情報がまだありません。「検索・一覧」で近くのスーパーを更新してください。</p>';
    return;
  }

  container.innerHTML = stores.map(({ store, distKm, walkMin }, index) => {
    const post = DEMO_POSTS[index];
    return `
      <div class="post-card">
        <div class="post-header">
          <div class="store-avatar"><i class="fa-solid fa-store"></i></div>
          <div>
            <div style="font-weight:bold; font-size:0.85rem;">${escapeHTML(store.name)}</div>
            <div style="font-size:0.7rem; color:var(--text-light);">${escapeHTML(getStoreAddressLabel(store))} ・ 徒歩${walkMin}分 (${distKm}km)</div>
            <span class="demo-post-badge">デモ投稿</span>
          </div>
        </div>
        <div style="padding:0 12px 10px 12px; font-size:0.85rem; line-height:1.4;">
          ${post.text}
        </div>
        <div class="post-actions">
          <span><i class="fa-regular fa-heart"></i> いいね ${post.likes}</span>
          <span><i class="fa-regular fa-comment"></i> コメント ${post.comments.length}</span>
        </div>
        ${post.comments.length > 0 ? `
          <div class="comment-box">
            <b>${post.comments[0].user}:</b>${post.comments[0].text}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// --- Modal Handlers ---
function openLocationModal() {
  loadLocationForm();
  document.getElementById('location-modal').classList.add('active');
}

function openNearbyStoresModal() {
  const modal = document.getElementById('nearby-stores-modal');
  modal.classList.add('active');
  document.getElementById('nearby-store-search')?.focus();
  if (nearbyStoreSearchStatus === 'idle') refreshNearbyStores(true);
}

function closeNearbyStoresModal() {
  document.getElementById('nearby-stores-modal').classList.remove('active');
  document.querySelector('.nearby-store-open')?.focus();
}

function closeLocationModal() {
  document.getElementById('location-modal').classList.remove('active');
}

function openGuideModal() {
  document.getElementById('guide-modal').classList.add('active');
}

function closeGuideModal() {
  document.getElementById('guide-modal').classList.remove('active');
}