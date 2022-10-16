const APP_VERSION = "1.0.0";

const xhr = function(method, url, data={}, query={}, headers={}) {
  url = `https://malaysiaapi-arma7x.koyeb.app/proxy?url=${encodeURIComponent(url)}`;
  return new Promise((resolve, reject) => {
    var xhttp = new XMLHttpRequest();
    var _url = new URL(url);
    for (var y in query) {
      _url.searchParams.set(y, query[y]);
    }
    url = _url.origin + _url.pathname + '?' + _url.searchParams.toString();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status >= 200 && this.status <= 299) {
          try {
            const response = JSON.parse(xhttp.response);
            resolve({ raw: xhttp, response: response});
          } catch (e) {
            resolve({ raw: xhttp, response: xhttp.responseText});
          }
        } else {
          try {
            const response = JSON.parse(xhttp.response);
            reject({ raw: xhttp, response: response});
          } catch (e) {
            reject({ raw: xhttp, response: xhttp.responseText});
          }
        }
      }
    };
    xhttp.open(method, url, true);
    for (var x in headers) {
      xhttp.setRequestHeader(x, headers[x]);
    }
    if (Object.keys(data).length > 0) {
      xhttp.send(JSON.stringify(data));
    } else {
      xhttp.send();
    }
  });
}

const poetdb = {
  authors: () => {
    return xhr('GET', 'https://poetrydb.org/author');
  },
  author: (name) => {
    return xhr('GET', `https://poetrydb.org/author/${encodeURIComponent(name)}`);
  },
}

const misc = {
  advice: () => {
    return xhr('GET', 'https://api.adviceslip.com/advice');
  },
  quote: () => {
    return xhr('GET', 'https://api.quotable.io/random');
  },
  inspiration: () => {
    return xhr('GET', 'https://inspiration.goprogram.ai/');
  }
}

window.addEventListener("load", function() {

  const dummy = new Kai({
    name: '_dummy_',
    data: {
      title: '_dummy_'
    },
    verticalNavClass: '.dummyNav',
    templateUrl: document.location.origin + '/templates/dummy.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {},
    softKeyText: { left: 'L2', center: 'C2', right: 'R2' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
    },
    dPadNavListener: {
      arrowUp: function() {
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        this.navigateListNav(1);
      }
    }
  });

  const state = new KaiState({});

  const ttsSetting = new Kai({
    name: '_dummy_',
    data: {
      title: '_dummy_'
    },
    verticalNavClass: '.dummyNav',
    templateUrl: document.location.origin + '/templates/ttsSetting.html',
    mounted: function() {},
    unmounted: function() {},
    methods: {},
    softKeyText: { left: 'L2', center: 'C2', right: 'R2' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
    },
    dPadNavListener: {
      arrowUp: function() {
        if (this.verticalNavIndex <= 0)
          return
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        const listNav = document.querySelectorAll(this.verticalNavClass);
        if (this.verticalNavIndex === listNav.length - 1)
          return
        this.navigateListNav(1);
      },
    }
  });

  const changelogs = new Kai({
    name: 'changelogs',
    data: {
      title: 'changelogs'
    },
    templateUrl: document.location.origin + '/templates/changelogs.html',
    mounted: function() {
      this.$router.setHeaderTitle('Changelogs');
    },
    unmounted: function() {},
    methods: {},
    softKeyText: { left: '', center: '', right: '' },
    softKeyListener: {
      left: function() {},
      center: function() {},
      right: function() {}
    }
  });

  const readerPage = function($router, data) {
    $router.push(
      new Kai({
        name: 'readerPage',
        data: {
          title: 'readerPage',
          data: data
        },
        //verticalNavClass: '.dummyNav',
        templateUrl: document.location.origin + '/templates/poem.html',
        mounted: function() {
          this.$router.setHeaderTitle(data.title);
        },
        unmounted: function() {},
        methods: {},
        softKeyText: { left: '', center: '', right: '' },
        softKeyListener: {
          left: function() {},
          center: function() {},
          right: function() {}
        },
      })
    );
  }

  const authorPage = function($router, name, data) {
    $router.push(
      new Kai({
        name: 'authorPage',
        data: {
          title: 'authorPage',
          source: data,
          filtered: data
        },
        verticalNavClass: '.poemNav',
        templateUrl: document.location.origin + '/templates/authorPage.html',
        mounted: function() {
          this.$router.setHeaderTitle(name);
        },
        unmounted: function() {},
        methods: {
          search: function(keyword) {
            this.verticalNavIndex = -1;
            if (keyword == null || keyword == '' || keyword.length == 0) {
              this.setData({ filtered: this.data.source });
              return;
            }
            const result = this.data.source.filter(poem => poem.title.toLowerCase().indexOf(keyword.toLowerCase()) >= 0);
            this.setData({ filtered: result });
          },
        },
        softKeyText: { left: 'Search', center: 'READ', right: 'Back' },
        softKeyListener: {
          left: function() {
            const searchDialog = Kai.createDialog('Search', '<div><input id="search-input" placeholder="Enter your keyword" class="kui-input" type="text" /></div>', null, '', undefined, '', undefined, '', undefined, undefined, this.$router);
            searchDialog.mounted = () => {
              setTimeout(() => {
                setTimeout(() => {
                  this.$router.setSoftKeyText('Cancel' , '', 'Go');
                }, 103);
                const SEARCH_INPUT = document.getElementById('search-input');
                if (!SEARCH_INPUT) {
                  return;
                }
                SEARCH_INPUT.focus();
                SEARCH_INPUT.addEventListener('keydown', (evt) => {
                  switch (evt.key) {
                    case 'Backspace':
                    case 'EndCall':
                      if (document.activeElement.value.length === 0) {
                        this.$router.hideBottomSheet();
                        setTimeout(() => {
                          //this.methods.renderSoftKeyLCR();
                          SEARCH_INPUT.blur();
                        }, 100);
                      }
                      break
                    case 'SoftRight':
                      this.$router.hideBottomSheet();
                      setTimeout(() => {
                        //this.methods.renderSoftKeyLCR();
                        SEARCH_INPUT.blur();
                        this.methods.search(SEARCH_INPUT.value);
                      }, 100);
                      break
                    case 'SoftLeft':
                      this.$router.hideBottomSheet();
                      setTimeout(() => {
                        //this.methods.renderSoftKeyLCR();
                        SEARCH_INPUT.blur();
                      }, 100);
                      break
                  }
                });
              });
            }
            searchDialog.dPadNavListener = {
              arrowUp: function() {
                const SEARCH_INPUT = document.getElementById('search-input');
                SEARCH_INPUT.focus();
              },
              arrowDown: function() {
                const SEARCH_INPUT = document.getElementById('search-input');
                SEARCH_INPUT.focus();
              }
            }
            this.$router.showBottomSheet(searchDialog);
          },
          center: function() {
            if (this.verticalNavIndex > -1 && this.data.filtered.length > 0) {
              const data = this.data.filtered[this.verticalNavIndex];
              data.text = data.lines.join("\r\n\r\n");
              readerPage($router, data);
            }
          },
          right: function() {
            $router.pop();
          }
        },
        dPadNavListener: {
          arrowUp: function() {
            if (this.verticalNavIndex <= 0)
              return
            this.navigateListNav(-1);
          },
          arrowDown: function() {
            const listNav = document.querySelectorAll(this.verticalNavClass);
            if (this.verticalNavIndex === listNav.length - 1)
              return
            this.navigateListNav(1);
          },
        }
      })
    );
  }

  const Home = new Kai({
    name: 'home',
    data: {
      title: 'home',
      authors: [],
      filtered: [],
    },
    verticalNavClass: '.homeNav',
    components: [],
    templateUrl: document.location.origin + '/templates/home.html',
    mounted: function() {
      this.$router.setHeaderTitle('PoetryDB');
      const CURRENT_VERSION = window.localStorage.getItem('APP_VERSION');
      if (APP_VERSION != CURRENT_VERSION) {
        this.$router.showToast(`Updated to version ${APP_VERSION}`);
        this.$router.push('changelogs');
        window.localStorage.setItem('APP_VERSION', APP_VERSION);
        return;
      }
      if (this.data.authors.length === 0) {
        this.$router.showLoading();
        poetdb.authors()
        .then((data) => {
          if (data.response.authors) {
            data.response.authors.forEach((name, idx) => {
              data.response.authors[idx] = {};
              data.response.authors[idx].name = name;
            });
            this.setData({
              authors: data.response.authors,
              filtered: data.response.authors,
            });
          }
        })
        .catch(() => {
          this.$router.showToast('Error');
        })
        .finally(() => {
          this.$router.hideLoading();
        });
      }
    },
    unmounted: function() {

    },
    methods: {
      search: function(keyword) {
        this.verticalNavIndex = -1;
        if (keyword == null || keyword == '' || keyword.length == 0) {
          this.setData({ filtered: this.data.authors });
          return;
        }
        const result = this.data.authors.filter(author => author.name.toLowerCase().indexOf(keyword.toLowerCase()) >= 0);
        this.setData({ filtered: result });
      },
      getAuthor: function(author) {
        this.$router.showLoading();
        poetdb.author(author.name)
        .then((data) => {
          console.log(data.response);
          authorPage(this.$router, author.name, data.response);
        })
        .catch((err) => {
          console.log(err);
          this.$router.showToast('Error');
        })
        .finally(() => {
          this.$router.hideLoading();
        });
      },
    },
    softKeyText: { left: 'Menu', center: 'SELECT', right: 'Search' },
    softKeyListener: {
      left: function() {
        var menu = [
          {'text': 'Random Advice'},
          {'text': 'Random Quote'},
          {'text': 'Inspiration Quote'},
          // {'text': 'Text-to-Speech Setting'},
          {'text': 'Changelogs'},
          {'text': 'Exit'},
        ]
        this.$router.showOptionMenu('Menu', menu, 'SELECT', (selected) => {
          if (selected.text === 'Random Advice' || selected.text === 'Random Quote' || selected.text === 'Inspiration Quote') {
            this.$router.showLoading();
            var req;
            if (selected.text === 'Random Advice') {
              req = misc.advice();
            } else if (selected.text === 'Random Quote') {
              req = misc.quote();
            } else if (selected.text === 'Inspiration Quote') {
              req = misc.inspiration();
            }
            req.then((data) => {
              var title = selected.text;
              var content;
              if (selected.text === 'Random Advice') {
                content = `${data.response.slip.advice}`;
              } else if (selected.text === 'Random Quote') {
                content = `${data.response.content}<br><b>-${data.response.author}</b>`;
              } else if (selected.text === 'Inspiration Quote') {
                content = `${data.response.quote}<br><b>-${data.response.author}</b>`;
              }
              this.$router.showDialog( title, content, null, 'Close', () => {}, ' ', () => {}, ' ', () => {}, () => {});
            })
            .finally(() => {
              this.$router.hideLoading();
            });
          } else if (selected.text === 'Changelogs') {
            this.$router.push('changelogs');
          } else if (selected.text == 'Text-to-Speech Setting') {
            this.$router.push('ttsSetting');
          } else if (selected.text === 'Exit') {
            window.close();
          }
        }, () => {});
      },
      center: function() {
        if (this.verticalNavIndex > -1 && this.data.filtered.length > 0) {
          this.methods.getAuthor(this.data.filtered[this.verticalNavIndex]);
        }
      },
      right: function() {
        const searchDialog = Kai.createDialog('Search', '<div><input id="search-input" placeholder="Enter your keyword" class="kui-input" type="text" /></div>', null, '', undefined, '', undefined, '', undefined, undefined, this.$router);
        searchDialog.mounted = () => {
          setTimeout(() => {
            setTimeout(() => {
              this.$router.setSoftKeyText('Cancel' , '', 'Go');
            }, 103);
            const SEARCH_INPUT = document.getElementById('search-input');
            if (!SEARCH_INPUT) {
              return;
            }
            SEARCH_INPUT.focus();
            SEARCH_INPUT.addEventListener('keydown', (evt) => {
              switch (evt.key) {
                case 'Backspace':
                case 'EndCall':
                  if (document.activeElement.value.length === 0) {
                    this.$router.hideBottomSheet();
                    setTimeout(() => {
                      //this.methods.renderSoftKeyLCR();
                      SEARCH_INPUT.blur();
                    }, 100);
                  }
                  break
                case 'SoftRight':
                  this.$router.hideBottomSheet();
                  setTimeout(() => {
                    //this.methods.renderSoftKeyLCR();
                    SEARCH_INPUT.blur();
                    this.methods.search(SEARCH_INPUT.value);
                  }, 100);
                  break
                case 'SoftLeft':
                  this.$router.hideBottomSheet();
                  setTimeout(() => {
                    //this.methods.renderSoftKeyLCR();
                    SEARCH_INPUT.blur();
                  }, 100);
                  break
              }
            });
          });
        }
        searchDialog.dPadNavListener = {
          arrowUp: function() {
            const SEARCH_INPUT = document.getElementById('search-input');
            SEARCH_INPUT.focus();
          },
          arrowDown: function() {
            const SEARCH_INPUT = document.getElementById('search-input');
            SEARCH_INPUT.focus();
          }
        }
        this.$router.showBottomSheet(searchDialog);
      }
    },
    dPadNavListener: {
      arrowUp: function() {
        if (this.verticalNavIndex <= 0)
          return
        this.navigateListNav(-1);
      },
      arrowDown: function() {
        const listNav = document.querySelectorAll(this.verticalNavClass);
        if (this.verticalNavIndex === listNav.length - 1)
          return
        this.navigateListNav(1);
      },
    }
  });

  const router = new KaiRouter({
    title: 'PoetryDB',
    routes: {
      'index' : {
        name: 'Home',
        component: Home
      },
      'ttsSetting' : {
        name: 'ttsSetting',
        component: ttsSetting
      },
      'changelogs' : {
        name: 'changelogs',
        component: changelogs
      }
    }
  });

  const app = new Kai({
    name: '_APP_',
    data: {},
    templateUrl: document.location.origin + '/templates/template.html',
    mounted: function() {},
    unmounted: function() {},
    router,
    state
  });

  try {
    app.mount('app');
  } catch(e) {
    console.log(e);
  }

  function displayKaiAds() {
    var display = true;
    if (window['kaiadstimer'] == null) {
      window['kaiadstimer'] = new Date();
    } else {
      var now = new Date();
      if ((now - window['kaiadstimer']) < 300000) {
        display = false;
      } else {
        window['kaiadstimer'] = now;
      }
    }
    console.log('Display Ads:', display);
    if (!display)
      return;
    getKaiAd({
      publisher: 'ac3140f7-08d6-46d9-aa6f-d861720fba66',
      app: 'poetry-db',
      slot: 'kaios',
      onerror: err => console.error(err),
      onready: ad => {
        ad.call('display')
        ad.on('close', () => {
          app.$router.hideBottomSheet();
          document.body.style.position = '';
        });
        ad.on('display', () => {
          app.$router.hideBottomSheet();
          document.body.style.position = '';
        });
      }
    })
  }

  displayKaiAds();

  document.addEventListener('visibilitychange', function(ev) {
    if (document.visibilityState === 'visible') {
      displayKaiAds();
    }
  });
});
