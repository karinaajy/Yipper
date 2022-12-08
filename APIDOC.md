# Yipper API Documentation
The Yipper API provides information about all endpoints.

## End Point 1: Get all yip data or yip data matching a given search term.
**Request Format:** `/yipper/yips`

**Query Parameters:** `search` (optional)

**Request Type (both requests):** `GET`

**Returned Data Format:** JSON

**Description 1:** If the `search` parameter is not included in the request, the service would get the `id`, `name`, `yip`, `hashtag`, `likes` and `date` from the `yips` table and outputs JSON containing the information in the order of `date`s in descending order (Pass the `date` into the `DATETIME()` function in the ordering statement).

**Example Request 1:** `/yipper/yips`

**Example Response 1:** (abbreviated)
```json
{
  "yips":[
    {
      "id": 25,
      "name": "Mister Fluffers",
      "yip": "It is sooooo fluffy I am gonna die",
      "hashtag": "fluff",
      "likes": 6,
      "date": "2020-07-07 03:48:28"
    },
    {
      "id": 24,
      "name": "Sir Barks a Lot",
      "yip": "Imagine if my name was sir barks a lot and I was meowing all day haha",
      "hashtag": "clown",
      "likes": 6,
      "date": "2020-07-06 00:55:08"
    },
    ...
  ]
}
```

**Description 2:** If the `search` parameter is included in the request, the service would respond with all the `id`s of the `yip`s matching the term passed in the `search` query parameter (ordered by the `id`s). A "match" would be any `yip` that has the `search` term in _any_ position meaning that the term "if" should match any  `yip` containing the words "if", "iframe" or "sniff" (as an example, not exhaustive, more matches are possible). The search should _not_ look in `hashtag`s.

**Example Request 2:** `/yipper/yips?search=if`

**Example Response 2:**
```json
{
  "yips" : [
    {
      "id": 8
    },
    {
      "id": 24
    }
  ]
}
```

**Error Handling:**

- Possible 500 (Internal Server Error) errors (plain text): 
  - For any possible internal server error, error is returned with the message: `An error occurred on the server. Try again later.`


## Endpoint 2: Get yip data for a designated user
**Request Format:** `/yipper/user/:user`

**Query Parameters:** none.

**Request Type:** `GET`

**Returned Data Format:** JSON

**Description:** The service would get the `name`, `yip`, `hashtag` and `date` for all the yips for a designated `user` ordered by the `date` in descending order (Pass the `date` into the `DATETIME()` function in the ordering statement). The `user` should be taken exactly as passed in the request.

**Example Request:** `/yipper/user/Chewbarka`

**Example Response:**
```json
[
  {
    "name": "Chewbarka",
    "yip": "chewy or soft cookies. I chew them all",
    "hashtag": "largebrain",
    "date": "2020-07-09 22:26:38",
  },
  {
    "name": "Chewbarka",
    "yip": "Every snack you make every meal you bake every bite you take... I will be watching you.",
    "hashtag": "foodie",
    "date": "2019-06-28 23:22:21"
  }
]
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If the user in request params does not exits in database, an error is returned with: `Yikes. User does not exist.`

- Possible 500 (Internal Server Error) errors (plain text): 
  - For any possible internal server error, error is returned with the message: `An error occurred on the server. Try again later.`

## Endpoint 3: Update the likes for a designated yip
**Request Format:** `/yipper/likes`

**Body Parameters:** `id`

**Request Type:** `POST`

**Returned Data Format:** plain text

**Description:** The service would update the `likes` for a yip (the yip the service is updating is determined by the `id` passed through the body) by incrementing the current value by 1 and responding with the new value.

**Example Request:** `/yipper/likes`

**Example Response:**
```
8
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing id in request body, an error is returned with the message: `Missing one or more of the required params.`
  - If the id in request body does not exits in database, an error is returned with: `Yikes. ID does not exist.`

- Possible 500 (Internal Server Error) errors (plain text): 
  - For any possible internal server error, error is returned with the message: `An error occurred on the server. Try again later.`



## Endpoint 4: Add a new yip
**Request Format:** `/yipper/new`

**Body Parameters:** `name` and `full`

**Request Type:** `POST`

**Returned Data Format:** JSON

**Description:** The service would add the new Yip information to the database and send back and output the JSON with the `id`, `name`, `yip`, `hashtag`, `likes` and `date`. 

**Example Request:** `/yipper/new`

**Example Response:**
```json
{
  "id": 528,
  "name": "Chewbarka",
  "yip": "love to yip allllll day long",
  "hashtag": "coolkids",
  "likes": 0,
  "date": "2020-09-09 18:16:18"
}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If missing name, yip or hashtag in request body, an error is returned with the message: `Missing one or more of the required params.`
  - If the name in request body does not exits in database, an error is returned with: `Yikes. User does not exist.`

- Possible 500 (Internal Server Error) errors (plain text): 
  - For any possible internal server error, error is returned with the message: `An error occurred on the server. Try again later.`
