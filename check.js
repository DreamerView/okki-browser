function filterHTML(htmlString) {
    // Создаем временный контейнер для парсинга HTML
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString.trim();

    // Выбираем только нужные элементы
    let filteredElements = tempDiv.querySelectorAll('h1, p, img');

    // Создаем массив для сохранения их в виде строк
    let filteredHTML = [];
    filteredElements.forEach(element => {
        filteredHTML.push(element.outerHTML);
    });

    // Возвращаем строку с отфильтрованными элементами
    return filteredHTML.join('');
}

// Пример использования:
let htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello</h1>
    <p>World</p>
    <img src="logo.png" alt="">
</body>
</html>`;

let filteredHTML = filterHTML(htmlCode);
console.log(filteredHTML);