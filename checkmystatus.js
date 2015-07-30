(function() {
  'use strict';

  function performTests() {
    var sites = [{
        sitename: 'Google+',
        type: 'desktop',
        slow: {
          url: 'https://plus.google.com/people/find'
        },
        fast: {
          url: 'https://www.google.com/404!'
        },
        minimum_delta: 700
      },
      {
      sitename: 'Google+ (mobile)',
        type: 'mobile',
        slow: {
          url: 'https://plus.google.com/app/basic/people/find?sview=7'
        },
        fast: {
          url: 'https://www.google.com/404!'
        },
        minimum_delta: 500
      },
      {
        sitename: 'LinkedIn',
        type: 'desktop',
        slow: {
          url: 'https://www.linkedin.com/vsearch/f?type=all'
        },
        fast: {
          url: 'https://www.linkedin.com/404!'
        },
        minimum_delta: 900
      },
      {
        sitename: 'LinkedIn (mobile)',
        type: 'mobile',
        slow: {
          url: 'https://www.linkedin.com/vsearch/f?type=all'
        },
        fast: {
          url: 'https://www.linkedin.com/404!'
        },
        minimum_delta: 700
      },
      {
        sitename: 'Facebook',
        type: 'desktop',
        slow: {
          url: 'https://www.facebook.com/?sk=h_nor'
        },
        fast: {
          url: 'https://www.facebook.com/?sk=1'
        },
        minimum_delta: 600
      }, {
        sitename: 'Twitter (unreliable)',
        type: 'desktop',
        slow: {
          url: 'https://twitter.com/i/users/recommendations?limit=300'
        },
        fast: {
          url: 'https://twitter.com/404!'
        },
        minimum_delta: 300
      },
      {
        sitename: 'Wikipedia (en)',
        type: 'desktop',
        slow: {
          url: 'https://en.wikipedia.org/wiki/Special:Watchlist'
        },
        fast: {
          url: 'https://en.wikipedia.org/w/404!'
        },
        minimum_delta: 600
      }
    ];
    var q = new SyncLoader(sites);
    q.loadSites(function reportSite(site) {
      var report = document.getElementById('report');
      if (!report) throw new Error('Reporting element "report" does not exist.');
      var html = '';
      var status =
        site.slow.loadtime - site.fast.loadtime > site.minimum_delta ?
        '<span class="in">logged in</span>' : '<span class="out">logged out</span>';
      html += '<tr valign="top"><td>' + site.sitename + '</td><td>' + status + '</td>';
      html += '<td class="tiny">';
      html += link(site.slow.url) + ' (slow for logged in users) loaded in ' +
        site.slow.loadtime.toFixed(2) + 'ms.</br>';
      html += link(site.fast.url) + ' (fast for logged in users) loaded in ' +
        site.fast.loadtime.toFixed(2) + 'ms.</br>';
      html += 'We consider a user logged in if the difference between' +
        ' the two exceeds ' + site.minimum_delta + ' ms.';
      html += '</td></tr>';
      report.innerHTML += html;
    });
  }

  function link(url) {
    return '<a href="' + url + '">' + url + '</a>';
  }

  function SyncLoader(sites) {
    this.sites = sites;
    this.queue = [];
    this.busy = false;
    this.loadSite = function(site, callback) {
      if (!this.busy) {
        this.busy = true;
        var urlObj = site.slow.loadtime ? site.fast : site.slow;
        urlObj.start = performance.now();
        var ti = document.createElement('script');
        ti.type = 'text/javascript';
        var self = this;
        var finish = function() {
          urlObj.finish = performance.now();
          urlObj.loadtime = urlObj.finish - urlObj.start;
          self.busy = false;
          if (site.fast.loadtime) { // Done for this site, report
            callback(site);
            if (self.queue.length) {
              self.loadSite(self.queue.shift(), callback);
            }
          } else // Need to re-run to get second measurement
            self.loadSite(site, callback);
        };
        window.onerror = finish; // fires in Firefox
        ti.onerror = finish; // fires in Chrome
        ti.src = urlObj.url;
        document.body.appendChild(ti);

      } else // Queue up unless we're still on the same site
      if (this.queue.indexOf(site) === -1)
        this.queue.push(site);
    };
    this.loadSites = function(callback) {
      var self = this;
      this.sites.forEach(function(site) {
        if((!isMobile.any && site.type === 'desktop') || (isMobile.any && site.type === 'mobile'))
        self.loadSite(site, callback);
      });
    };
  }
  performTests();
})();
