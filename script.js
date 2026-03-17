// ============================================
// Tab switching functionality
// ============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// ============================================
// Layout toggle functionality - for individual tools
// ============================================
function initializeLayoutToggle(toggleBtnId, sectionId) {
    const layoutToggleBtn = document.getElementById(toggleBtnId);
    const section = document.getElementById(sectionId);
    
    // Skip if elements don't exist
    if (!layoutToggleBtn || !section) return;
    
    // Get the tool-section div inside the section
    const toolSection = section.querySelector('.tool-section');
    if (!toolSection) return;
    
    // Load layout preference from localStorage
    const savedLayout = localStorage.getItem(`toolLayout-${sectionId}`) || 'vertical';
    
    // Update button icon function
    function updateToggleButtonIcon(isHorizontal) {
        layoutToggleBtn.textContent = isHorizontal ? '⇅' : '⇄';
        layoutToggleBtn.title = isHorizontal ? '切換為垂直佈局' : '切換為水平佈局';
    }
    
    // Apply saved layout on page load
    if (savedLayout === 'horizontal') {
        toolSection.classList.add('layout-horizontal');
        updateToggleButtonIcon(true);
    } else {
        updateToggleButtonIcon(false);
    }
    
    // Add click event listener
    layoutToggleBtn.addEventListener('click', () => {
        toolSection.classList.toggle('layout-horizontal');
        
        // Save preference
        const isHorizontal = toolSection.classList.contains('layout-horizontal');
        localStorage.setItem(`toolLayout-${sectionId}`, isHorizontal ? 'horizontal' : 'vertical');
        
        // Update button icon
        updateToggleButtonIcon(isHorizontal);
    });
}

// Initialize layout toggles for each tool
initializeLayoutToggle('layout-toggle-btn', 'unicode');
initializeLayoutToggle('layout-toggle-btn-b64', 'base64');
initializeLayoutToggle('layout-toggle-btn-url', 'urlencode');
initializeLayoutToggle('layout-toggle-btn-json', 'json');

// ============================================
// Utility Functions
// ============================================

/**
 * Show notification message
 * @param {string} message - The message to show
 * @param {string} type - notification type: 'success' or 'error'
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = type === 'success' ? 'success-notification' : 'error-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (!text) {
        showNotification('沒有內容可複製', 'error');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showNotification('已複製到剪貼板！', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const tempTextarea = document.createElement('textarea');
        tempTextarea.value = text;
        document.body.appendChild(tempTextarea);
        tempTextarea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextarea);
        showNotification('已複製到剪貼板！', 'success');
    });
}

// ============================================
// Unicode Tool Functions
// ============================================

const textInput = document.getElementById('text-input');
const resultOutput = document.getElementById('result-output');
const copyInputBtn = document.getElementById('copy-input-btn');
const copyOutputBtn = document.getElementById('copy-output-btn');
const clearAllBtn = document.getElementById('clear-all-btn');

// Flag to prevent infinite loops during auto-conversion
let isUpdatingUnicodeFromInput = false;
let isUpdatingUnicodeFromOutput = false;

/**
 * Encode text to Unicode escape sequences
 * @param {string} text - The text to encode
 * @returns {string} - Unicode encoded string
 */
function encodeToUnicode(text) {
    try {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            result += '\\u' + ('0000' + charCode.toString(16)).slice(-4);
        }
        return result;
    } catch (error) {
        return '';
    }
}

/**
 * Decode Unicode escape sequences to text
 * @param {string} unicode - The Unicode encoded string
 * @returns {string} - Decoded text
 */
function decodeFromUnicode(unicode) {
    try {
        const unicodeRegex = /\\u([0-9a-fA-F]{4})/g;
        let result = '';
        let lastIndex = 0;
        let match;
        
        while ((match = unicodeRegex.exec(unicode)) !== null) {
            result += unicode.substring(lastIndex, match.index);
            const charCode = parseInt(match[1], 16);
            result += String.fromCharCode(charCode);
            lastIndex = match.index + match[0].length;
        }
        
        result += unicode.substring(lastIndex);
        return result;
    } catch (error) {
        return '';
    }
}

// Auto-conversion: when text-input changes, update result-output
if (textInput) {
    textInput.addEventListener('input', () => {
        if (isUpdatingUnicodeFromOutput) {
            return; // Prevent infinite loop
        }
        
        isUpdatingUnicodeFromInput = true;
        const text = textInput.value;
        
        if (text) {
            // Try to detect if input is Unicode or plain text
            if (/\\u[0-9a-fA-F]{4}/i.test(text)) {
                resultOutput.value = decodeFromUnicode(text);
            } else {
                resultOutput.value = encodeToUnicode(text);
            }
        } else {
            resultOutput.value = '';
        }
        
        isUpdatingUnicodeFromInput = false;
    });
}

// Auto-conversion: when result-output changes, update text-input
if (resultOutput) {
    resultOutput.addEventListener('input', () => {
        if (isUpdatingUnicodeFromInput) {
            return; // Prevent infinite loop
        }
        
        isUpdatingUnicodeFromOutput = true;
        const text = resultOutput.value;
        
        if (text) {
            if (/\\u[0-9a-fA-F]{4}/i.test(text)) {
                textInput.value = decodeFromUnicode(text);
            } else {
                textInput.value = encodeToUnicode(text);
            }
        } else {
            textInput.value = '';
        }
        
        isUpdatingUnicodeFromOutput = false;
    });
}

// Copy buttons
if (copyInputBtn) {
    copyInputBtn.addEventListener('click', () => {
        copyToClipboard(textInput.value);
    });
}

if (copyOutputBtn) {
    copyOutputBtn.addEventListener('click', () => {
        copyToClipboard(resultOutput.value);
    });
}

// Clear all button
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        textInput.value = '';
        resultOutput.value = '';
        textInput.focus();
    });
}

// ============================================
// Base64 Tool Functions
// ============================================

const base64Input = document.getElementById('base64-input');
const base64Output = document.getElementById('base64-output');
const copyBase64InputBtn = document.getElementById('copy-base64-input-btn');
const copyBase64OutputBtn = document.getElementById('copy-base64-output-btn');
const clearBase64AllBtn = document.getElementById('base64-clear-all-btn');

// Flag to prevent infinite loops during auto-conversion
let isUpdatingBase64FromInput = false;
let isUpdatingBase64FromOutput = false;

/**
 * Encode text to Base64
 * @param {string} text - The text to encode
 * @returns {string} - Base64 encoded string
 */
function encodeToBase64(text) {
    try {
        return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
        return '';
    }
}

/**
 * Decode Base64 to text
 * @param {string} base64 - The Base64 encoded string
 * @returns {string} - Decoded text
 */
function decodeFromBase64(base64) {
    try {
        return decodeURIComponent(escape(atob(base64)));
    } catch (error) {
        return '';
    }
}

/**
 * Check if a string is valid Base64
 * @param {string} str - The string to check
 * @returns {boolean} - True if valid Base64
 */
function isValidBase64(str) {
    try {
        if (str === '' || str.trim() === '') return false;
        return btoa(atob(str)) === str;
    } catch (error) {
        return false;
    }
}

// Auto-conversion: when base64-input changes, update base64-output
if (base64Input) {
    base64Input.addEventListener('input', () => {
        if (isUpdatingBase64FromOutput) {
            return; // Prevent infinite loop
        }
        
        isUpdatingBase64FromInput = true;
        const text = base64Input.value;
        
        if (text) {
            // Try to detect if input is Base64 or plain text
            if (isValidBase64(text)) {
                base64Output.value = decodeFromBase64(text);
            } else {
                base64Output.value = encodeToBase64(text);
            }
        } else {
            base64Output.value = '';
        }
        
        isUpdatingBase64FromInput = false;
    });
}

// Auto-conversion: when base64-output changes, update base64-input
if (base64Output) {
    base64Output.addEventListener('input', () => {
        if (isUpdatingBase64FromInput) {
            return; // Prevent infinite loop
        }
        
        isUpdatingBase64FromOutput = true;
        const text = base64Output.value;
        
        if (text) {
            if (isValidBase64(text)) {
                base64Input.value = decodeFromBase64(text);
            } else {
                base64Input.value = encodeToBase64(text);
            }
        } else {
            base64Input.value = '';
        }
        
        isUpdatingBase64FromOutput = false;
    });
}

// Copy buttons
if (copyBase64InputBtn) {
    copyBase64InputBtn.addEventListener('click', () => {
        copyToClipboard(base64Input.value);
    });
}

if (copyBase64OutputBtn) {
    copyBase64OutputBtn.addEventListener('click', () => {
        copyToClipboard(base64Output.value);
    });
}

// Clear all button
if (clearBase64AllBtn) {
    clearBase64AllBtn.addEventListener('click', () => {
        base64Input.value = '';
        base64Output.value = '';
        base64Input.focus();
    });
}

// ============================================
// URL Encode Tool Functions
// ============================================

const urlInput = document.getElementById('url-input');
const urlOutput = document.getElementById('url-output');
const copyUrlInputBtn = document.getElementById('copy-url-input-btn');
const copyUrlOutputBtn = document.getElementById('copy-url-output-btn');
const clearUrlAllBtn = document.getElementById('url-clear-all-btn');

// Flag to prevent infinite loops during auto-conversion
let isUpdatingUrlFromInput = false;
let isUpdatingUrlFromOutput = false;

/**
 * Encode text to URL encoded format
 * @param {string} text - The text to encode
 * @returns {string} - URL encoded string
 */
function encodeToUrlEncoded(text) {
    try {
        return encodeURIComponent(text);
    } catch (error) {
        return '';
    }
}

/**
 * Decode URL encoded text
 * @param {string} encoded - The URL encoded string
 * @returns {string} - Decoded text
 */
function decodeFromUrlEncoded(encoded) {
    try {
        return decodeURIComponent(encoded);
    } catch (error) {
        return '';
    }
}

/**
 * Check if a string is URL encoded
 * @param {string} str - The string to check
 * @returns {boolean} - True if likely URL encoded
 */
function isLikelyUrlEncoded(str) {
    // Check if string contains URL encoded patterns like %XX
    return /%[0-9A-Fa-f]{2}/.test(str);
}

// Auto-conversion: when url-input changes, update url-output
if (urlInput) {
    urlInput.addEventListener('input', () => {
        if (isUpdatingUrlFromOutput) {
            return; // Prevent infinite loop
        }
        
        isUpdatingUrlFromInput = true;
        const text = urlInput.value;
        
        if (text) {
            // Try to detect if input is URL encoded or plain text
            if (isLikelyUrlEncoded(text)) {
                urlOutput.value = decodeFromUrlEncoded(text);
            } else {
                urlOutput.value = encodeToUrlEncoded(text);
            }
        } else {
            urlOutput.value = '';
        }
        
        isUpdatingUrlFromInput = false;
    });
}

// Auto-conversion: when url-output changes, update url-input
if (urlOutput) {
    urlOutput.addEventListener('input', () => {
        if (isUpdatingUrlFromInput) {
            return; // Prevent infinite loop
        }
        
        isUpdatingUrlFromOutput = true;
        const text = urlOutput.value;
        
        if (text) {
            if (isLikelyUrlEncoded(text)) {
                urlInput.value = decodeFromUrlEncoded(text);
            } else {
                urlInput.value = encodeToUrlEncoded(text);
            }
        } else {
            urlInput.value = '';
        }
        
        isUpdatingUrlFromOutput = false;
    });
}

// Copy buttons
if (copyUrlInputBtn) {
    copyUrlInputBtn.addEventListener('click', () => {
        copyToClipboard(urlInput.value);
    });
}

if (copyUrlOutputBtn) {
    copyUrlOutputBtn.addEventListener('click', () => {
        copyToClipboard(urlOutput.value);
    });
}

// Clear all button
if (clearUrlAllBtn) {
    clearUrlAllBtn.addEventListener('click', () => {
        urlInput.value = '';
        urlOutput.value = '';
        urlInput.focus();
    });
}

// ============================================
// JSON Format Tool Functions
// ============================================

const jsonInput = document.getElementById('json-input');
const jsonOutput = document.getElementById('json-output');
const jsonFormatBtn = document.getElementById('json-format-btn');
const jsonCompressBtn = document.getElementById('json-compress-btn');
const jsonCopyBtn = document.getElementById('json-copy-btn');

/**
 * Format JSON string with indentation
 * @param {string} jsonStr - The JSON string to format
 * @returns {object} - {success: boolean, result: string, error: string}
 */
function formatJson(jsonStr) {
    try {
        if (!jsonStr || !jsonStr.trim()) {
            return {success: false, result: '', error: '請輸入 JSON 內容'};
        }
        
        const parsed = JSON.parse(jsonStr);
        const formatted = JSON.stringify(parsed, null, 2);
        return {success: true, result: formatted, error: ''};
    } catch (error) {
        return {success: false, result: '', error: 'JSON 格式錯誤: ' + error.message};
    }
}

/**
 * Compress JSON string (remove unnecessary whitespace)
 * @param {string} jsonStr - The JSON string to compress
 * @returns {object} - {success: boolean, result: string, error: string}
 */
function compressJson(jsonStr) {
    try {
        if (!jsonStr || !jsonStr.trim()) {
            return {success: false, result: '', error: '請輸入 JSON 內容'};
        }
        
        const parsed = JSON.parse(jsonStr);
        const compressed = JSON.stringify(parsed);
        return {success: true, result: compressed, error: ''};
    } catch (error) {
        return {success: false, result: '', error: 'JSON 格式錯誤: ' + error.message};
    }
}

/**
 * Display error message in output
 * @param {string} error - The error message
 */
function displayJsonError(error) {
    jsonOutput.value = '❌ ' + error;
    jsonOutput.classList.add('error');
}

/**
 * Display success message in output
 * @param {string} result - The result
 */
function displayJsonSuccess(result) {
    jsonOutput.value = result;
    jsonOutput.classList.remove('error');
}

// Format button
if (jsonFormatBtn) {
    jsonFormatBtn.addEventListener('click', () => {
        const result = formatJson(jsonInput.value);
        if (result.success) {
            displayJsonSuccess(result.result);
            showNotification('JSON 格式化成功！', 'success');
        } else {
            displayJsonError(result.error);
        }
    });
}

// Compress button
if (jsonCompressBtn) {
    jsonCompressBtn.addEventListener('click', () => {
        const result = compressJson(jsonInput.value);
        if (result.success) {
            displayJsonSuccess(result.result);
            showNotification('JSON 壓縮成功！', 'success');
        } else {
            displayJsonError(result.error);
        }
    });
}

// Copy button
if (jsonCopyBtn) {
    jsonCopyBtn.addEventListener('click', () => {
        copyToClipboard(jsonOutput.value);
    });
}
