/**
 * Add the searched organizations by keyword
 */
function searchOrgs(page, key) {
  const pageElement = document.getElementById('current-page');
  // -1 for prev page and -2 for next page
  if (page === -1) {
    if (pageElement.innerText > 0) {
      pageElement.innerText--;
    }
  } else if (page === -2) {
    pageElement.innerText++;
  } else {
    pageElement.innerText = page;
  }
  removeChildren('existing-organizations');
  var keyword = key;
  if (key === undefined) {
    keyword = document.getElementById('keyword').value;
  }
  if (keyword === '') {
    const url = new URL(window.location.href);
    keyword = url.searchParams.get('keyword');
  }
  console.log(page, keyword)
  const qs = '/sql?' + updateQueryString('keyword', keyword) + '&' + updateQueryString('page', pageElement.innerText);
  addTitle(keyword);
  addOrgs(qs, 1);
}

function indexPageSearch() {
  const keyword = document.getElementById('keyword').value;
  redirectKeyword(keyword);
}

function addPagination(count) {
  document.getElementById('pagination').style.display = 'inline-block';
  if (count) {
    removeChildren('pagination-list');
    const paginationElement = document.getElementById('pagination-list');
    const pages = count / 10 + 1;
    for (var i = 1; i <= pages; i++) {
      var pageElement = document.createElement('li');
      pageElement.onclick = function() { searchOrgs(i - 1); };
      pageElement.innerText = i;
      paginationElement.appendChild(pageElement);
    }
  }
}

function addOrgs(qs, results) {
  fetch(qs).then(response => response.json()).then(text => {
    const count = text[0];
    addPagination(count);
    const data = text[1];
    const orgsContainer = document.getElementById('existing-organizations');
    data.forEach(entry => {
      orgsContainer.appendChild(getOrgAsHtmlDescription(entry, results));
    });
  });
}
 
function removeChildren(id) {
  // remove previously displayed similar organizations
  var existingChildren = document.getElementById(id);
  while (existingChildren.firstChild) {
    existingChildren.removeChild(existingChildren.firstChild);
  }
}
 
/**
 * Returns an updated URL search param
 */
function updateQueryString(key, value) {
  var searchParams = new URLSearchParams();
  searchParams.append(key, value);
  return searchParams;
}
 
/**
 * Creates list element from org
 */
function getOrgAsHtmlDescription(org, results) {
  const orgElement = document.createElement('div');
  orgElement.setAttribute("class", "mdc-card");
//org name
  const nameElement = document.createElement('a');
  nameElement.setAttribute("id", "org-name");
  nameElement.setAttribute('href', 'https://' + org.link);
  nameElement.setAttribute('target', '_blank');
  nameElement.innerText = org.name;
  orgElement.appendChild(nameElement);
//about
  const aboutElement = document.createElement('p');
  aboutElement.setAttribute("id", "about");
  aboutElement.innerText = org.about;
  orgElement.appendChild(aboutElement);
  // like this in chip format
  const neighborElement = document.createElement('p');
  neighborElement.setAttribute('id', 'like-this');
  neighborElement.innerText = 'Like this: ';
  const chipElement = document.createElement("div");
  chipElement.setAttribute("class", "mdc-chip-set");
  const org1 = document.createElement("span");
  org1.setAttribute("class", "mdc-chip");
  neighborElement.appendChild(org1);
  const org2 = document.createElement("span");
  org2.setAttribute("class", "mdc-chip");
  neighborElement.appendChild(org2);
  const org3 = document.createElement("span");
  org3.setAttribute("class", "mdc-chip");
  neighborElement.appendChild(org3);
  const org4 = document.createElement("span");
  org4.setAttribute("class", "mdc-chip");
  neighborElement.appendChild(org4);

  // TODO: get actual neighboring org id number from CloudSQLManager.java
  org1.appendChild(getNeighborElement(org.neighbor1_id, org.neighbor1));
  org2.appendChild(getNeighborElement(org.neighbor2_id, org.neighbor2));
  org3.appendChild(getNeighborElement(org.neighbor3_id, org.neighbor3));
  org4.appendChild(getNeighborElement(org.neighbor4_id, org.neighbor4));
  orgElement.appendChild(neighborElement);

  const ratingElement = document.createElement('div');
  ratingElement.setAttribute('class', 'rating-element');
  ratingElement.innerText = "Do you like this organization? ";
  // const upvoteElement = document.createElement('button');
  // upvoteElement.innerText = 'Good';
  const upvoteElement = document.createElement('span');
  upvoteElement.setAttribute('class', 'material-icons rating')
  upvoteElement.innerText = 'thumb_up';

  upvoteElement.onclick = function() { redirectRating(1, org.id); }
  ratingElement.appendChild(upvoteElement);
  // const downvoteElement = document.createElement('button');
  // downvoteElement.innerText = 'Bad';
  const downvoteElement = document.createElement('span');
  downvoteElement.setAttribute('class', 'material-icons rating')
  downvoteElement.innerText = 'thumb_down';
  downvoteElement.onclick = function() { redirectRating(0, org.id); }
  ratingElement.appendChild(downvoteElement);
  orgElement.appendChild(ratingElement);

  // make the whole list element clickable and take user to organization.html pasing id as parameter
  if (results) {
    orgElement.onclick = function() { redirectId(org.id); }
  }
  return orgElement;
}

function getNeighborElement(neighborId, neighborName) {
  const element = document.createElement('a');
  const qs = updateQueryString('id', neighborId);
  const redirect = '/organization.html?' + qs;
  element.setAttribute('href', redirect);
  element.innerText = neighborName + ', ';
  return element;
}

/**
 * Redirects user to organization.html
 */
function redirectId(id) {
  const qs = updateQueryString('id', id);
  const redirect = '/organization.html?' + qs;
  window.location = redirect;
}

function redirectRating(up, id) {
  var rating = 'rating=good';
  if (!up) {
    rating = 'rating=bad';
  }
  const params = rating + '&id=' + id;
  fetch('/rating?' + params, {method: 'POST'}).then(response => response.text()).then(message => {
    alert(message);
  });
  event.stopPropagation();
}

function redirectKeyword(keyword) {
  const qs = updateQueryString('keyword', keyword);
  const redirect = '/results.html?' + qs;
  window.location = redirect;
}
 
function addListener() {
  const inputBox = document.getElementById('keyword');
  inputBox.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        const keyword = document.getElementById('keyword').value;
        searchOrgs(0, keyword);
        closeSearch();
      }
  });
}

function addIndexListener() {
  const inputBox = document.getElementById('keyword');
  inputBox.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        indexPageSearch();
      }
  });
}
 
function addTitle(keyword) {
  const element = document.getElementById('results-title');
  element.innerText = 'Results for [' + keyword + ']: ';
}

/**
 * Send request to server for classifications
 */
function getClassifications() {
  const qs = '/data';
  const rootNavMenu = createNewNavDrawer();
  fetch(qs).then(response => response.json()).then(tree => {
    tree.roots.forEach(root=> {
      rootNavMenu.firstChild.firstChild.appendChild(addToClassTree(tree, root, root));
    });
    rootNavMenu.setAttribute('class', 'mdc-drawer');
    rootNavMenu.firstChild.firstChild.firstChild.setAttribute('aria-current', 'page');
    document.getElementById('roots').appendChild(rootNavMenu);
  }); 
}

/**
 * Creater Container for new layer of nav tree
 */
function createNewNavDrawer() {
  const asideElem = document.createElement('aside');
  asideElem.setAttribute('class', 'mdc-drawer--dismissible');
  const divElem = document.createElement('div');
  divElem.setAttribute('class', 'mdc-drawer__content');
  const navElem = document.createElement('nav');
  navElem.setAttribute('class', 'mdc-list');
  divElem.appendChild(navElem);
  asideElem.appendChild(divElem);
  return asideElem;
}

/**
 * Create a single node for distinct category
 */
function createNavItem(parent, classPath) {
  const parentElem = document.createElement('a');
  parentElem.setAttribute('value', classPath);
  parentElem.href = '#';
  parentElem.setAttribute('class', 'mdc-list-item mdc-list-item');
  const span1 = document.createElement('span');
  span1.setAttribute('class', 'mdc-list-item__ripple');
  const span2 = document.createElement('span');
  span2.setAttribute('class', 'mdc-list-item__text');
  span2.innerText = parent;
  const icon = document.createElement('i');
  icon.setAttribute('class', 'material-icons mdc-list-item__graphic');
  icon.innerText = 'chevron_right';
  parentElem.appendChild(span1);
  parentElem.appendChild(icon);
  parentElem.appendChild(span2);
  parentElem.style.position = 'relative';
  return parentElem;
}

/**
 * Recursive creation of tree from single root category
 */
function addToClassTree(tree, parent, classPath) {
  const pathElem = createNavItem(parent, classPath);  

  if (tree[parent].length !== 0) {
    const nested = createNewNavDrawer();
    nested.firstChild.firstChild.style.marginLeft = pathElem.offsetLeft + 30 + 'px';
    tree[parent].forEach(child => nested.firstChild.firstChild.appendChild(addToClassTree(tree, child, classPath + '/' + child)));
    pathElem.appendChild(nested);
  } 
  //Event for opening accordion
  pathElem.addEventListener('mouseover',navItemActivate);
  //Event for making query
  pathElem.addEventListener('click', function() {
    const pageElement = document.getElementById('current-page');
    if (!pageElement) {
      redirectKeyword(classPath);
    } else {
      const qs = '/sql?' + updateQueryString('keyword', classPath) + '&' + updateQueryString('page', pageElement.innerText);
      removeChildren('existing-organizations');
      addTitle(classPath);
      addPagination();
      addOrgs(qs, 1);
    }
  });

  return pathElem;
}

/**
 * Open accordion, close any other paths on current level
 */
function navItemActivate() {
  this.firstChild.nextSibling.innerText = 'expand_more';
  const navMenu = this.parentNode;
  navMenu.childNodes.forEach(child => child.dispatchEvent(new CustomEvent('close')));
  this.addEventListener('click', navItemDeactivate);
  this.addEventListener('close', navItemDeactivate);
  this.removeEventListener('mouseover', navItemActivate);
  const nextPath = this.nextSibling;
  const targetLayer = this.lastChild.firstChild.firstChild;
  navMenu.insertBefore(targetLayer, nextPath); 
}

/**
 * Close accordion, close any paths in decending levels
 */
function navItemDeactivate() {
  this.firstChild.nextSibling.innerText = 'chevron_right';
  this.childNodes.forEach(child => child.dispatchEvent(new CustomEvent('close')));
  const navMenu = this.parentNode;
  const nextPath = this.nextSibling;
  this.lastChild.firstChild.appendChild(nextPath);
  this.addEventListener('mouseover', navItemActivate);
  this.removeEventListener('click', navItemDeactivate);
  this.removeEventListener('close', navItemDeactivate);
}

function setUpResults() {
  addListener();
  getClassifications();
  getResults();
  getLoginStatus();
}

function setUpDetailsPage() {
  addListener();
  getClassifications();
  loadOrg();
  getLoginStatus();
}

function loadOrg() {
  const url = new URL(window.location.href);
  const id = url.searchParams.get('id');
  const qs = '/org?' + updateQueryString('id', id);
  addOrgs(qs, 0);
}

function getResults() {
  const url = new URL(window.location.href);
  const keyword = url.searchParams.get('keyword');
  if (keyword) {
    searchOrgs(0, keyword);
  }
}

function setUpIndexpage() {
  addIndexListener();
  getClassifications();
  getLoginStatus();
}

function setUpAboutPage(){
  addIndexListener();
  getLoginStatus();
}

/**
 * Fetches the login status of user
 * if logged in, display logout button
 * if logged out, display button redirect to login page
 */
function getLoginStatus() {
  return fetch('/login').then(response => response.text()).then(link => {
    // if user is logged in, server sends the logout link
    if (link.includes('logout')) {
      // is logged in 
      const statusElement = document.getElementById('login-status');
      statusElement.innerText = 'Hello!  ';
      const logoutElement = document.getElementById('login-link');
      logoutElement.href = link;
      logoutElement.innerText = 'Logout';
      const loginIcon = document.getElementById('loginIcon')
      loginIcon.href = link;

    } else {
      // is logged out
      const statusElement = document.getElementById('login-status');
      const loginElement = document.getElementById('login-link');
      loginElement.href = link;
      loginElement.innerText = 'Login';
      const loginIcon = document.getElementById('loginIcon')
      loginIcon.href = link;
    }
  });
}

/**  Open the search box */
function openSearch() {
  document.getElementById("myOverlay").style.display = "block";
}

/** Close the search box */
function closeSearch() {
  document.getElementById("myOverlay").style.display = "none";
}
