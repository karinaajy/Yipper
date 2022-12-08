/**
 * Name: Jiayi Yang
 * Section: CSE 154 AE
 *
 * The client-side data and functions.
 * Handles all events on the page, fetches/posts data from/to the server-side.
 */
"use strict";

const baseUrl = 'http://localhost:3002';
const allYips = [];
const SUCCESS_CODE = 200;

window.onload = () => {
  setAllYips();

  document.getElementById('yip-btn').onclick = function() {
    openNewYipPage();
  };

  document.getElementById('search-btn').onclick = function() {
    setFilteredYips();
  };

  document.getElementById('home-btn').onclick = function() {
    openHomePage();
  };

  document.getElementById('search-term').oninput = function() {
    document.getElementById('search-btn').disabled = this.value.trim() === '';
  };

  document.querySelector('form button').onclick = (event) => {
    event.preventDefault();
    postNewYip();
  };
};

/** Fetches all yips from all users and display them on home page. */
function setAllYips() {
  fetch(baseUrl + '/yipper/yips')
    .then((res) => {
      if (res.status !== SUCCESS_CODE) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
      return res.json();
    })
    .then((res) => {
      allYips.push(...res.yips);
      for (let yip of res.yips) {
        let newYip = createYipCard(yip);
        document.getElementById('home').append(newYip);
      }
    })
    .catch(() => {
      handleFetchError();
    });
}

/** Fetches all yips filtered by search term and display them on the home page. */
function setFilteredYips() {
  let search = document.getElementById('search-term').value.trim();
  fetch(`${baseUrl}/yipper/yips?search=${search}`)
    .then((res) => {
      if (res.status !== SUCCESS_CODE) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
      return res.json();
    })
    .then((res) => {
      let filteredIds = res.yips.map((yip) => yip.id);
      for (let id of allYips.map((yip) => yip.id)) {
        if (filteredIds.includes(id)) {
          document.getElementById(id).classList.remove('hidden');
        } else {
          document.getElementById(id).classList.add('hidden');
        }
      }
      document.getElementById('user').classList.add('hidden');
      document.getElementById('new').classList.add('hidden');
      document.getElementById('home').classList.remove('hidden');
    })
    .catch(() => {
      handleFetchError();
    });
}

/** Show the new yip page, hide other pages and clear search input. */
function openNewYipPage() {
  document.getElementById('search-term').value = '';
  document.getElementById('search-btn').disabled = true;
  document.getElementById('user').classList.add('hidden');
  document.getElementById('home').classList.add('hidden');
  document.getElementById('new').classList.remove('hidden');
}

/** Show the home page, hide other pages, clear search input, and show all yips */
function openHomePage() {
  document.getElementById('search-term').value = '';
  document.getElementById('search-btn').disabled = true;
  document.getElementById('user').classList.add('hidden');
  document.getElementById('new').classList.add('hidden');
  document.getElementById('home').classList.remove('hidden');
  for (let yip of allYips) {
    document.getElementById(yip.id).classList.remove('hidden');
  }
}

/** Post a new yip, clear input and after 2 seconds, hide the yip page and show the home page */
function postNewYip() {
  let body = {
    name: document.getElementById('name').value.trim(),
    full: document.getElementById('yip').value.trim(),
  };
  fetch(`${baseUrl}/yipper/new`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  })
    .then((res) => {
      if (res.status !== SUCCESS_CODE) {
        return res.text().then((text) => {
          new Error(text);
        });
      }
      return res.json();
    })
    .then((data) => {
      setNewYip(data);
    })
    .catch(() => {
      handleFetchError();
    });
}


/**
 * Utility function to set new yip and show the home page.
 * @param {object} data - The new yip.
 */
function setNewYip(data) {
  allYips.push(data);
  let newYip = createYipCard(data);
  document.getElementById('home').prepend(newYip);
  document.querySelector('form button').disabled = true;
  document.getElementById('name').value = '';
  document.getElementById('yip').value = '';
  setTimeout(() => {
    document.getElementById('new').classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
    document.querySelector('form button').disabled = false;
  }, 2000);
}

/**
 * Utility function to get a clicked user's all yips and show the user page.
 * @param {string} name - The clicked user's name.
 */
function nameOnClick(name) {
  fetch(`${baseUrl}/yipper/user/${name}`)
    .then((res) => {
      if (res.status !== SUCCESS_CODE) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      }
      return res.json();

    })
    .then((yips) => {
      document.getElementById('search-term').value = '';
      document.getElementById('search-btn').disabled = true;
      removeAllChildNodes(document.getElementById('user'));
      let userYips = createUserYips(yips);
      document.getElementById('user').append(userYips);
      document.getElementById('home').classList.add('hidden');
      document.getElementById('user').classList.remove('hidden');
    })
    .catch(() => {
      handleFetchError();
    });
}

/**
 * Utility function to like a yip
 * - post request to increase the likes of clicked yip by one and update the page accordingly.
 * @param {object} event - The click event object.
 * @param {string} id - The clicked yip's id.
 */
function heartOnClick(event, id) {
  console.log('event: ', typeof event);
  fetch(`${baseUrl}/yipper/likes`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({id}),
  })
    .then((res) => {
      if (res.status !== SUCCESS_CODE) {
        return res.text().then((text) => {
          throw new Error(text);
        });
      } 
      return res.json();
    })
    .then((data) => {
      event.target.nextElementSibling.textContent = data;
    })
    .catch(() => {
      handleFetchError();
    });
}

/** Utility function to
 * - handle all fetch error
 * - display error message
 * - disable buttons and hide yipper data.
 * */
function handleFetchError() {
  document.getElementById('yipper-data').classList.add('hidden');
  document.getElementById('error').classList.remove('hidden');
  document.getElementById('search-btn').disabled = true;
  document.getElementById('home-btn').disabled = true;
  document.getElementById('yip-btn').disabled = true;
}

/** Utility function to remove all child nodes of a node. 
 * @param {Node} parent : The node to remove all children from.
*/
function removeAllChildNodes(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

/**
 * Utility function to create an yip's card html string with an yip object.
 * @param {object} yip - An yip object with id, name, yip(text), hashtag, date and likes.
 * @returns {string} Html string of this yip card.
 */
function createYipCard(yip) {
  let htmlString = `
    <article class='card' id='${yip.id}'>
      <img src='/img/${yip.name.toLowerCase().replaceAll(' ', '-')}.png'>
      <div>
        <p class='individual' onclick='nameOnClick("${yip.name}")'>${yip.name}</p>
        <p>${yip.yip} #${yip.hashtag}</p>
      </div>
      <div class='meta'>
        <p>${new Date(yip.date).toLocaleString()}</p>
        <div>
          <img src = '/img/heart.png' onclick='heartOnClick(event,"${yip.id}")'>
          <p>${yip.likes}</p>
        </div>
      </div>
    </article>
  `;
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

/**
 * Utility function to create an yip's card html string with an yip object.
 * @param {object} yip - An array of yip object with name, yip(text), hashtag, date and likes.
 * @returns {string} Html string of this user's yips.
 */
function createUserYips(yips) {
  let htmlString = `
    <article class='single'>
      <h2>Yips shared by ${yips[0].name}</h2>`;
  for (const [index, value] of yips.entries()) {
    htmlString += `<p> Yip ${index + 1}: ${value.yip} #${value.hashtag}</p>`;
  }
  htmlString += `</article>`;
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}
