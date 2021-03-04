const axios = require('axios')
const cheerio = require('cheerio')
const url = 'https://de.store.thesims3.com'

async function fetchContent() {
    axios.get(`${url}/dailyDeal.html`)
        .then(response => parseBody(response.data))
        .catch(error => console.error(error))

    /* const fs = require('fs')
    fs.readFile('dailyDeal.html', 'utf8', (err, data) => {
        if (err) {
            console.error(error)
            return
        }
        parseBody(data)
    }) */
}

async function parseBody(body) {
    const $ = cheerio.load(body)
    const current = getCurrent($)
    const upcoming = getUpcoming($)

    const response = {
        current: await current,
        upcoming: await upcoming
    }

    console.log(response)
}

async function getCurrent($) {
    const mainpod = $('.mainpod')
    const thumbnailUrl = mainpod.find('.img img').attr('src')
    const title = mainpod.find('.mainpodDesc > a')
    const description = title.next('div').find('p')
    const productUrl = `${url}${description.find('a').attr('href')}`
    const titleText = title.text()
    const descriptionText = description.text()
        .replace('Objekt anzeigen>', '')
        .replace(/(\n|\t)/gm, '')
        .trim()
        .slice(0, -3)
        .trim()
    
    return {
        thumbnail: thumbnailUrl,
        title: titleText,
        description: descriptionText,
        url: productUrl
    }
}

async function getUpcoming($) {
    const upcoming = $('.newwrprstr').find('.DealsBoxs > .upcming')
    const parsed = upcoming.find('.ddindbox')
        .toArray()
        .map(box => parseUpcoming($(box)))

    return [
        await parsed[0],
        await parsed[1]
    ]
}

async function parseUpcoming(box) {
    const thumbnailUrl = box.find('img').attr('src')
    const contentBox = box.find('div').last()
    const title = contentBox.find('a').text()
    const description = contentBox.find('p').text().trim()
    const productUrl = `${url}${contentBox.find('a').attr('href')}`
    
    return {
        thumbnail: thumbnailUrl,
        title: title,
        description: description,
        url: productUrl
    }
}

fetchContent()