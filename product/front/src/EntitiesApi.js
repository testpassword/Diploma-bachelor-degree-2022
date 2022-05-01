class EntitiesApi {

    static idKey = null
    static idBuffer = null
    static #rootUrl = process.env.REACT_APP_HOST_URL

    static get(entityUrl, ids = [], isSync = false) {
        /* Это наглядный пример плохого дизайна: изначально когда я писал api для бекенда, я предполагал, что в теле GET
        запроса будет передаваться json-массив с id нужных элементов и пустой массив, если клиент хочет получить все элементы.
        На этапе создания фронтенда я вспомнил, что по спецификации HTTP передавать тело с GET не рекомендуется, а fetch()
        и вовсе это запрещает. Т.к. кардинально менять api бэка не хотелось, решил костыльно передавать json-массив как
        параметр запроса. */
        const url = this.#rootUrl + entityUrl + "?=" + new URLSearchParams({ "ids":  JSON.stringify({ selectedIds: ids }) })
        if (isSync) {
            const req = new XMLHttpRequest()
            req.open("GET", url, false)
            req.send()
            return req.responseText
        } else {
            const req = { method: "GET", mode: "cors" }
            return fetch(url, req)
        }
    }

    static post(entityUrl, idField, item) {
        const req = {
            method: "POST",
            mode: "cors",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                [idField]: null,
                ...item
            })
        }
        return fetch(this.#rootUrl + entityUrl, req)
    }

    static put(entityUrl, item) {
        const req = {
            method: "PUT",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
        }
        return fetch(this.#rootUrl + entityUrl, req)
    }

    static delete(entityUrl, ids) {
        const req = {
            method: "DELETE",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ droppedIds: ids })
        }
        return fetch(this.#rootUrl + entityUrl, req)
    }
}

export default EntitiesApi