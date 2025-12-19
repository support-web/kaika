/**
 * 金運開花の扉 - JavaScript
 * 四柱推命計算ロジック、DOM操作、LINE連携
 */

// =====================================================
// 設定・定数
// =====================================================

// LINE公式アカウントID
const LINE_ID = '@042rsqoj';

// LINE友だち追加URL
const LINE_ADD_FRIEND_URL = `https://line.me/R/ti/p/${LINE_ID}`;

// 十干（日干）データ
const JIKKAN_DATA = [
    {
        id: 1,
        name: '甲',
        reading: 'Kinoe',
        character: '大樹のゾウ',
        emoji: '🐘',
        catchcopy: '大器晩成の実業家',
        fortuneStyle: 'どっしり構えて時間をかけ、巨万の富を築く',
        fortuneTip: '長期視点で投資の勉強を始める'
    },
    {
        id: 2,
        name: '乙',
        reading: 'Kinoto',
        character: '蔦のウサギ',
        emoji: '🐰',
        catchcopy: '愛され人脈富豪',
        fortuneStyle: '人との縁とネットワークが富を運んでくる',
        fortuneTip: '交流会やコミュニティに参加する'
    },
    {
        id: 3,
        name: '丙',
        reading: 'Hinoe',
        character: '太陽のライオン',
        emoji: '🦁',
        catchcopy: 'カリスマ主役',
        fortuneStyle: '圧倒的な存在感と人気で注目を集めて稼ぐ',
        fortuneTip: 'SNSで自分の想いを発信する'
    },
    {
        id: 4,
        name: '丁',
        reading: 'Hinoto',
        character: '灯火のフクロウ',
        emoji: '🦉',
        catchcopy: '知的戦略家',
        fortuneStyle: '鋭い洞察力と専門スキルで賢く稼ぐ',
        fortuneTip: '資格取得や専門知識を深める'
    },
    {
        id: 5,
        name: '戊',
        reading: 'Tsuchinoe',
        character: '岩山のクマ',
        emoji: '🐻',
        catchcopy: '不動産王',
        fortuneStyle: '信頼と実績を積み上げ、動かない資産を得る',
        fortuneTip: '貯蓄と不動産情報の収集'
    },
    {
        id: 6,
        name: '己',
        reading: 'Tsuchinoto',
        character: '畑のワンちゃん',
        emoji: '🐕',
        catchcopy: '育成のマエストロ',
        fortuneStyle: '人を育て、育むことで感謝対価を得る',
        fortuneTip: '後輩や部下の育成に力を入れる'
    },
    {
        id: 7,
        name: '庚',
        reading: 'Kanoe',
        character: '鋼のチーター',
        emoji: '🐆',
        catchcopy: '一攫千金ハンター',
        fortuneStyle: 'スピードと決断力で短期的に大きく当てる',
        fortuneTip: '直感を信じて即断即決する'
    },
    {
        id: 8,
        name: '辛',
        reading: 'Kanoto',
        character: '宝石のクジャク',
        emoji: '🦚',
        catchcopy: '高貴なブランド人',
        fortuneStyle: '自身の美学とセンスを高単価で提供する',
        fortuneTip: '身の回りの品を上質なものにする'
    },
    {
        id: 9,
        name: '壬',
        reading: 'Mizunoe',
        character: '大海のクジラ',
        emoji: '🐋',
        catchcopy: 'グローバル冒険家',
        fortuneStyle: '時代の波に乗り、大きな流通や海外で稼ぐ',
        fortuneTip: '海外情報やトレンドをチェックする'
    },
    {
        id: 10,
        name: '癸',
        reading: 'Mizunoto',
        character: '癒やしのイルカ',
        emoji: '🐬',
        catchcopy: '奉仕の参謀',
        fortuneStyle: '悩み解決と深い優しさで感謝される',
        fortuneTip: '寄付やボランティア活動を行う'
    }
];

// 現在の診断結果を保持
let currentResult = null;

// =====================================================
// デバイス判定
// =====================================================

/**
 * PCかどうかを判定
 * @returns {boolean}
 */
function isPC() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipod|android.*mobile|windows.*phone|mobile/.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/.test(userAgent);
    return !isMobile && !isTablet;
}

// =====================================================
// 四柱推命計算ロジック
// =====================================================

/**
 * 日干を計算する
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {number} day - 日
 * @returns {number} - 日干インデックス (0-9)
 */
function calculateNikkan(year, month, day) {
    // 基準日: 1900年1月31日
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(year, month - 1, day);

    // 基準日からの経過日数を計算
    const diffTime = targetDate.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 日干支番号（60周期）から日干（10周期）を計算
    // 1900年1月31日は「庚」（日干インデックス6）
    let nikkanIndex = (diffDays + 6) % 10;

    // 負の値への対応
    if (nikkanIndex < 0) {
        nikkanIndex += 10;
    }

    return nikkanIndex;
}

/**
 * 日干インデックスから十干データを取得
 * @param {number} index - 日干インデックス (0-9)
 * @returns {Object} - 十干データ
 */
function getNikkanData(index) {
    return JIKKAN_DATA[index];
}

// =====================================================
// DOM操作
// =====================================================

// DOM要素
let elements = {};

/**
 * 初期化
 */
function init() {
    // DOM要素を取得
    elements = {
        doorOverlay: document.getElementById('doorOverlay'),
        openDoorBtn: document.getElementById('openDoorBtn'),
        mainContent: document.getElementById('mainContent'),
        formSection: document.getElementById('form'),
        form: document.getElementById('fortuneForm'),
        birthYear: document.getElementById('birthYear'),
        birthMonth: document.getElementById('birthMonth'),
        birthDay: document.getElementById('birthDay'),
        resultSection: document.getElementById('result'),
        characterImage: document.getElementById('characterImage'),
        typeName: document.getElementById('typeName'),
        typeCatchcopy: document.getElementById('typeCatchcopy'),
        fortuneStyle: document.getElementById('fortuneStyle'),
        fortuneTip: document.getElementById('fortuneTip'),
        lineButton: document.getElementById('lineButton'),
        showQrButton: document.getElementById('showQrButton'),
        retryButton: document.getElementById('retryButton'),
        qrModal: document.getElementById('qrModal'),
        closeModal: document.getElementById('closeModal'),
        qrCode: document.getElementById('qrCode'),
        messagePreview: document.getElementById('messagePreview'),
        copyMessage: document.getElementById('copyMessage')
    };

    // セレクトボックスを初期化
    initSelectBoxes();

    // イベントリスナーを設定
    setupEventListeners();
}

/**
 * セレクトボックスを初期化
 */
function initSelectBoxes() {
    // 年（1950〜2010年）
    for (let year = 2010; year >= 1950; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = `${year}年`;
        elements.birthYear.appendChild(option);
    }

    // 月（1〜12月）
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = `${month}月`;
        elements.birthMonth.appendChild(option);
    }

    // 日（1〜31日）
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = `${day}日`;
        elements.birthDay.appendChild(option);
    }
}

/**
 * イベントリスナーを設定
 */
function setupEventListeners() {
    // 扉を開くボタン
    elements.openDoorBtn.addEventListener('click', handleDoorOpen);

    // フォーム送信
    elements.form.addEventListener('submit', handleFormSubmit);

    // 再診断ボタン
    elements.retryButton.addEventListener('click', handleRetry);

    // PC用: QRコード表示ボタン
    if (elements.showQrButton) {
        elements.showQrButton.addEventListener('click', handleShowQr);
    }

    // モーダル閉じる
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeQrModal);
    }

    // モーダル外クリックで閉じる
    if (elements.qrModal) {
        elements.qrModal.addEventListener('click', (e) => {
            if (e.target === elements.qrModal) {
                closeQrModal();
            }
        });
    }

    // メッセージコピーボタン
    if (elements.copyMessage) {
        elements.copyMessage.addEventListener('click', handleCopyMessage);
    }

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.qrModal.classList.contains('active')) {
            closeQrModal();
        }
    });
}

/**
 * 扉を開くアニメーション
 */
function handleDoorOpen() {
    // 扉を開くクラスを追加
    elements.doorOverlay.classList.add('opened');

    // アニメーション完了後に扉を非表示
    setTimeout(() => {
        elements.doorOverlay.classList.add('hidden');
    }, 1500);
}

/**
 * フォーム送信処理
 * @param {Event} e - イベント
 */
function handleFormSubmit(e) {
    e.preventDefault();

    // 入力値を取得
    const year = parseInt(elements.birthYear.value);
    const month = parseInt(elements.birthMonth.value);
    const day = parseInt(elements.birthDay.value);

    // バリデーション
    if (!year || !month || !day) {
        alert('生年月日を選択してください。');
        return;
    }

    // 日付の妥当性チェック
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
        alert('有効な日付を入力してください。');
        return;
    }

    // 日干を計算
    const nikkanIndex = calculateNikkan(year, month, day);
    const nikkanData = getNikkanData(nikkanIndex);

    // 結果を保存
    currentResult = {
        data: nikkanData,
        year: year,
        month: month,
        day: day
    };

    // 結果を表示
    displayResult(nikkanData, year, month, day);
}

/**
 * 診断結果を表示
 * @param {Object} data - 十干データ
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {number} day - 日
 */
function displayResult(data, year, month, day) {
    // キャラクター画像（絵文字で代用）
    elements.characterImage.textContent = data.emoji;

    // タイプ名
    elements.typeName.textContent = `【${data.character}】タイプ`;

    // キャッチコピー
    elements.typeCatchcopy.textContent = data.catchcopy;

    // 金運スタイル
    elements.fortuneStyle.textContent = data.fortuneStyle;

    // 金運開花のタネ
    elements.fortuneTip.textContent = data.fortuneTip;

    // スマホ用: LINEリンクを生成
    const lineUrl = generateLineUrl(data, year, month, day);
    elements.lineButton.href = lineUrl;

    // フォームを非表示、結果を表示
    elements.formSection.style.display = 'none';
    elements.resultSection.style.display = 'block';

    // 結果セクションの先頭へスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * LINE送信用URLを生成
 * @param {Object} data - 十干データ
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {number} day - 日
 * @returns {string} - LINE URL
 */
function generateLineUrl(data, year, month, day) {
    const text = generateMessageText(data, year, month, day);
    const encodedText = encodeURIComponent(text);
    return `https://line.me/R/oaMessage/${LINE_ID}/?text=${encodedText}`;
}

/**
 * メッセージテキストを生成
 * @param {Object} data - 十干データ
 * @param {number} year - 年
 * @param {number} month - 月
 * @param {number} day - 日
 * @returns {string} - メッセージテキスト
 */
function generateMessageText(data, year, month, day) {
    return `診断結果：【${data.character}】
生年月日：${year}年${month}月${day}日

金運開花の秘訣を詳しく教えてください！`;
}

/**
 * PC用: QRコードモーダルを表示
 */
function handleShowQr() {
    if (!currentResult) return;

    const { data, year, month, day } = currentResult;

    // メッセージプレビューを表示
    const messageText = generateMessageText(data, year, month, day);
    elements.messagePreview.textContent = messageText;

    // QRコードを生成
    elements.qrCode.innerHTML = '';

    // QRCodeライブラリが読み込まれているか確認
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(LINE_ADD_FRIEND_URL, {
            width: 200,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        }, (error, canvas) => {
            if (error) {
                console.error('QRコード生成エラー:', error);
                elements.qrCode.innerHTML = '<p style="color: #666;">QRコードの生成に失敗しました</p>';
                return;
            }
            elements.qrCode.appendChild(canvas);
        });
    } else {
        // フォールバック: QRコードAPIを使用
        const qrImg = document.createElement('img');
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(LINE_ADD_FRIEND_URL)}`;
        qrImg.alt = 'LINE QRコード';
        qrImg.style.width = '200px';
        qrImg.style.height = '200px';
        elements.qrCode.appendChild(qrImg);
    }

    // モーダルを表示
    elements.qrModal.classList.add('active');

    // コピーボタンのリセット
    elements.copyMessage.textContent = 'メッセージをコピー';
    elements.copyMessage.classList.remove('copied');
}

/**
 * QRコードモーダルを閉じる
 */
function closeQrModal() {
    elements.qrModal.classList.remove('active');
}

/**
 * メッセージをクリップボードにコピー
 */
async function handleCopyMessage() {
    if (!currentResult) return;

    const { data, year, month, day } = currentResult;
    const messageText = generateMessageText(data, year, month, day);

    try {
        await navigator.clipboard.writeText(messageText);
        elements.copyMessage.textContent = 'コピーしました！';
        elements.copyMessage.classList.add('copied');

        // 3秒後に元に戻す
        setTimeout(() => {
            elements.copyMessage.textContent = 'メッセージをコピー';
            elements.copyMessage.classList.remove('copied');
        }, 3000);
    } catch (err) {
        // フォールバック: execCommandを使用
        const textarea = document.createElement('textarea');
        textarea.value = messageText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            elements.copyMessage.textContent = 'コピーしました！';
            elements.copyMessage.classList.add('copied');

            setTimeout(() => {
                elements.copyMessage.textContent = 'メッセージをコピー';
                elements.copyMessage.classList.remove('copied');
            }, 3000);
        } catch (e) {
            alert('コピーに失敗しました。手動でコピーしてください。');
        }

        document.body.removeChild(textarea);
    }
}

/**
 * 再診断処理
 */
function handleRetry() {
    // フォームをリセット
    elements.form.reset();

    // 結果を非表示、フォームを表示
    elements.resultSection.style.display = 'none';
    elements.formSection.style.display = 'flex';

    // 現在の結果をクリア
    currentResult = null;

    // ページ上部へスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =====================================================
// 初期化実行
// =====================================================
document.addEventListener('DOMContentLoaded', init);
