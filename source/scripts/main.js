const $ = (selector) => {
    const element = document.querySelector(selector);
    element.cssText = (styles) => {
        element.style.cssText = styles;
    };
    element.cssDisplayNone = () => {
        element.style.display = "none";
    };
    element.cssDisplayBlock = () => {
        element.style.display = "block";
    };
    element.cssDisplayFlex = () => {
        element.style.display = "flex";
    };
    element.on = (eventName, callback) => {
        element.addEventListener(eventName, callback);
    };
    return element;
};
const $$ = selector => document.querySelectorAll(selector);
const { ipcRenderer } = require('electron');

class OkkiBrowser {

    generateUUID = () => {
        let dt = new Date().getTime();
        const uuid = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    headerHeight = () => {
        const headerElement = $('header');
        const headerHeight = headerElement.offsetHeight;
        $("#webview-container").cssText(`width: 100%;height: calc(100% - ${headerHeight}px);position: absolute;top: ${headerHeight}px;left: 0;`);
    }

    createTab = () => {
        $("#url-input").value = "";
        const tabCount = this.generateUUID();
        $$('.nav-link').forEach(link => link.classList.remove('active'));
        const newTab = document.createElement('li');
        newTab.classList.add('nav-item');
        newTab.classList.add('tab-list');
        newTab.innerHTML = `<a class="nav-link active d-flex gap-2" href="#" data-tab-id="${tabCount}" data-url=""><span class="truncate-tab">Новая вкладка</span> <span class="tab-close hoverEffect">&times;</span></a>`;
        tabList.insertBefore(newTab, $('#add-tab').parentNode);

        const newWebview = document.createElement('webview');
        newWebview.src = "welcome.html";
        newWebview.setAttribute('data-tab-id', tabCount);
        $$('webview').forEach(webview => webview.style.display = 'none');
        newWebview.style.display = 'flex';
        $('#webview-container').appendChild(newWebview);

        newTab.querySelector('.nav-link').addEventListener('click', (event) => okki.switchTab(event));
        newTab.querySelector('.tab-close').addEventListener('click', (event) => {
            this.closeTab(event);
        });
        okki.headerHeight();
    }

    closeTab = (event) => {
        event.stopPropagation();
        const tabId = event.target.parentElement.getAttribute('data-tab-id');
        this.removeTab(tabId);
    }


    removeTab = (tabId) => {
        const tab = $(`[data-tab-id="${tabId}"]`).parentNode;
        const webview = $(`webview[data-tab-id="${tabId}"]`);
        const list = $('.nav-tabs');

        tab.remove();
        webview.remove();

        if (list) {
            const listItems = list.querySelectorAll('li.tab-list');

            if (listItems.length > 0) {
                const lastItem = listItems[listItems.length - 1];
                const lastLink = lastItem.querySelector('a');

                if (lastLink) {
                    const lastWebview = lastItem.querySelector('a').getAttribute("data-tab-id");
                    $(`webview[data-tab-id="${lastWebview}"]`).cssDisplayFlex();
                    lastLink.classList.add("active");
                } else {
                    console.error('Не найден элемент <a> в последнем элементе <li.tab-list>.');
                }
            } else {
                console.error('Не найдены элементы <li.tab-list> в списке.');
            }
        } else {
            console.error('Не найден элемент с классом .nav-tabs.');
        }

        okki.headerHeight();
    }

    switchTab = (event) => {
        event.preventDefault();
        const selectedTabId = event.srcElement.parentElement.getAttribute('data-tab-id');
        if (selectedTabId === null) return;

        $$('.nav-link').forEach(link => link.classList.remove('active'));
        console.log(event.srcElement.parentElement);
        event.srcElement.parentElement.classList.add('active');

        const getUrl = event.srcElement.parentElement.getAttribute("data-url");

        $("#url-input").value = getUrl;

        $$('webview').forEach(webview => webview.style.display = 'none');
        $(`webview[data-tab-id="${selectedTabId}"]`).cssDisplayFlex();
        webview = $(`webview[data-tab-id="${selectedTabId}"]`);
        okki.headerHeight();
    }

    getActiveWebviewId = () => {
        const getId = $(".nav-link.active").getAttribute("data-tab-id");
        return getId;
    }

    filterHTML = (htmlString, query) => {
        // Создаем временный контейнер для парсинга HTML
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString.trim();
    
        // Выбираем только нужные элементы
        let filteredElements = tempDiv.querySelectorAll(query);
    
        // Создаем массив для сохранения их в виде строк
        let filteredHTML = [];
        filteredElements.forEach(element => {
            filteredHTML.push(element.outerHTML);
        });
    
        // Возвращаем строку с отфильтрованными элементами
        return filteredHTML.join('');
    }

    removeAllAttributes = (html, prefix) => {
        const url = new URL(prefix);

        // Изменяем путь на требуемый
        url.pathname = '/';

        // Получаем окончательный URL
        const resultUrl = url.href;
        let doc = new DOMParser().parseFromString(html, 'text/html');
        let elements = doc.getElementsByTagName('*');

        for (let i = 0; i < elements.length; i++) {
            let element = elements[i];
            if (element.hasAttribute('src')) {
                let currentSrc = element.getAttribute('src');
                const result = this.isValidUrl(currentSrc)?currentSrc:resultUrl + currentSrc;
                while (element.attributes.length > 0) {
                    element.removeAttribute(element.attributes[0].name);
                }
                element.setAttribute('src', result);
                element.setAttribute('style', "width:200px;height:auto;");
                element.setAttribute('class', "my-4");
            } else {
                while (element.attributes.length > 0) {
                    element.removeAttribute(element.attributes[0].name);
                }
            }
        }

        return doc.documentElement.outerHTML;
    }

    isValidUrl = (urlString) => {
        try {
            var url = new URL(urlString);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (_) {
            return false;
        }
    }

}

const okki = new OkkiBrowser();

$("button#changeTheme").on("click", () => {
    const theme = $("body").getAttribute("data-bs-theme");
    if (theme === "light") {
        $("#darkTheme").cssDisplayNone();
        $("#lightTheme").cssDisplayBlock();
        $("body").setAttribute("data-bs-theme", "dark");
    } else {
        $("#darkTheme").cssDisplayBlock();
        $("#lightTheme").cssDisplayNone();
        $("body").setAttribute("data-bs-theme", "light")
    }
});
let webview = $(`webview[data-tab-id="okki13242342342342"]`);;
$('#url-input').on('keydown', (event) => {
    if (event.key === 'Enter') {
        $("div#preloader").cssDisplayBlock();
        const url = event.target.value;

        // Находим активный элемент с классом .nav-link
        const activeNavLink = $('.nav-link.active');
        const newTitle = $('.nav-link.active > span.truncate-tab');

        if (activeNavLink) {
            // Получаем значение атрибута data-tab-id
            const tab_id = activeNavLink.getAttribute("data-tab-id");

            // Находим элемент webview с соответствующим data-tab-id и устанавливаем src
            webview = $(`webview[data-tab-id="${tab_id}"]`);

            if (webview) {
                webview.src = "http://" + url;
                webview.on('did-finish-load', (event) => {
                    $("div#preloader").cssDisplayNone();
                    newTitle.innerText = webview.getTitle();
                    newTitle.title = webview.getTitle();
                    okki.headerHeight();
                });
                webview.on('did-navigate', (event) => {
                    $('#url-input').value = event.url;
                    activeNavLink.setAttribute("data-url", event.url);
                    newTitle.innerText = webview.getTitle();
                    newTitle.title = webview.getTitle();
                    okki.headerHeight();
                });
                webview.on('did-navigate-in-page', (event) => {
                    $('#url-input').value = event.url;
                    activeNavLink.setAttribute("data-url", event.url);
                    newTitle.innerText = webview.getTitle();
                    newTitle.title = webview.getTitle();
                    okki.headerHeight();
                });

            }
        }
    }
    okki.headerHeight();
});
$('#back-history').on('click', () => {
    if (webview.canGoBack()) {
        webview.goBack();
    }
});
$('#forward-history').on('click', () => {
    if (webview.canGoForward()) {
        webview.goForward();
    }
});
$('#reload-page').on('click', () => {
    $("div#preloader").cssDisplayBlock();
    webview.reload();
    okki.getActiveWebviewId();
});
webview.on('dom-ready', () => {
    webview.on('will-navigate', (event) => {
        $("div#preloader").cssDisplayBlock();
    });
});
webview.on('did-finish-load', () => {
    $("div#preloader").cssDisplayNone();
});

window.addEventListener("load", () => okki.headerHeight());

// tab

$('#add-tab').on('click', (event) => {
    event.preventDefault();
    okki.createTab();
});

$$('.nav-link').forEach(link => {
    if (link.id !== 'add-tab') {
        link.addEventListener('click', (event) => okki.switchTab(event));
    }
});

$$('.tab-close').forEach(closeButton => {
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const tabId = event.target.parentElement.getAttribute('data-tab-id');
        okki.removeTab(tabId);
    });
});

// Пример для удаления табов:
document.addEventListener('keydown', (event) => {
    if (event.key === 'd' && event.ctrlKey) { // Ctrl + D для удаления текущей вкладки
        const activeTab = $('.nav-link.active');
        if (activeTab && activeTab.getAttribute('data-tab-id')) {
            const activeTabId = activeTab.getAttribute('data-tab-id');
            okki.removeTab(activeTabId);
        }
    }
});

$('#minimize-window').on('click', () => {
    ipcRenderer.send('minimize-window');
    okki.headerHeight();
});

$('#maximize-window').on('click', () => {
    ipcRenderer.send('maximize-window');
    okki.headerHeight();
});

$('#close-window').on('click', () => {
    ipcRenderer.send('close-window');
});

window.addEventListener('resize', function (event) {
    okki.headerHeight();
}, true);

$('#generateQR').on('click', async () => {
    $('#qrcode').src = "";
    const text = $("#url-input").value;
    if (text) {
        const result = await ipcRenderer.invoke('generate-qrcode', text);
        if (result.success) {
            $('#qrcode').src = result.url;
        } else {
            console.error(result.error);
        }
    }
});

$("#generateReadText").on("click", async () => {
    const url = $("#url-input").value;
    const getWebviewId = okki.getActiveWebviewId();
    const webview = $(`webview[data-tab-id="${getWebviewId}"]`); // Получаем DOM элемент webview

    if (webview) {
        // Используем promise для ожидания завершения загрузки
        if (webview.isLoading()) {
            await new Promise((resolve) => {
                webview.addEventListener('did-finish-load', resolve, { once: true });
            });
        }

        webview.executeJavaScript('document.documentElement.outerHTML').then((html) => {
            const cleaned = okki.removeAllAttributes(html,url);
            const filter = okki.filterHTML(cleaned,"h1, h2, h3, h4, h5, h6, p, img");
            $("#readTextHTML").innerHTML = filter;
        }).catch((error) => {
            console.error('Failed to execute JavaScript in webview:', error);
        });
    } else {
        console.error('Webview element not found');
    }
});




