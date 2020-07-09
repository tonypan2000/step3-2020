/**
 * Add the searched organizations by keyword
 */
function searchOrgs(page) {
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
  removeOrgs();
  const keyword = document.getElementById('keyword').value;
  const qs = '/sql?' + updateQueryString('keyword', keyword) + '&' + updateQueryString('page', pageElement.innerText);
  addTitle(keyword);
  addPagination();
  addOrgs(qs);
}

function addPagination() {
  document.getElementById('pagination').style.display = 'inline-block';
}

function addOrgs(qs) {
  fetch(qs).then(response => response.json()).then(text => {
    console.log(text);
    const orgsContainer = document.getElementById('existing-organizations');
    text.forEach(entry => {
      orgsContainer.appendChild(getOrgAsHtmlDescription(entry));
    });
  });
}

function removeOrgs() {
  // remove previously displayed similar organizations
  var existingOrgs = document.getElementById('existing-organizations');
  while (existingOrgs.firstChild) {
    existingOrgs.removeChild(existingOrgs.firstChild);
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
function getOrgAsHtmlDescription(org) {
  const orgElement = document.createElement('li');
  const nameElement = document.createElement('a');
  nameElement.setAttribute('href', 'https://' + org.link);
  nameElement.setAttribute('target', '_blank');
  nameElement.innerText = org.name;
  orgElement.appendChild(nameElement);
  const aboutElement = document.createElement('p');
  aboutElement.innerText = org.about;
  orgElement.appendChild(aboutElement);
  const neighborElement = document.createElement('p');
  neighborElement.innerText = 'Like this: ' + org.neighbor1 + ', ' + org.neighbor2 + ', ' + org.neighbor3 + ', ' + org.neighbor4;
  orgElement.appendChild(neighborElement);
  return orgElement;
}

function addListener() {
  const inputBox = document.getElementById('keyword');
  inputBox.addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        searchOrgs(0);
      }
  });
}

function addTitle(keyword) {
  const element = document.getElementById('results-title');
  element.innerText = 'Results for [' + keyword + ']: ';
}

function getClassifications() {
  const qs = '/data';
  const classDiv = document.getElementById("classifications");
  fetch(qs).then(response => response.json()).then(tree => {
    console.log(tree);
    tree.roots.forEach(root=> {
      classDiv.appendChild(addToClassTree(tree, root, root));
    });
    var toggler = document.getElementsByClassName("caret");
    var i;
    for (i = 0; i < toggler.length; i++) {
      toggler[i].addEventListener('click', function() {
        this.parentElement.querySelector('.nested').classList.toggle("active");
        this.classList.toggle("caret-down");
      });
    }
  }); 
}

function addToClassTree(tree, parent, classPath) {
  const parentElem = document.createElement('li');
  parentElem.setAttribute('value', classPath);
  if (!(tree[parent].length === 0)) {
    parentElem.innerHTML += '<span class=\"caret\">' + parent + '</span>';
    const nested = document.createElement('ul');
    nested.setAttribute('class', 'nested');
    tree[parent].forEach(child => nested.appendChild(addToClassTree(tree, child, classPath + "/" + child)));
    parentElem.appendChild(nested);
  } else {
    parentElem.innerText = parent;
    parentElem.addEventListener('click', function() {
      const pageElement = document.getElementById('current-page');
      const qs = '/sql?' + updateQueryString('keyword', classPath) + '&' + updateQueryString('page', pageElement.innerText);
      removeOrgs();
      addTitle(classPath);
      addPagination();
      addOrgs(qs);
    });
  }
  return parentElem;
}

function setUpPrototype() {
  addListener();
  getClassifications();
}
