/**
 * Compact URL codec: tries site templates + ha.mr (ASCII / denser ASCII),
 * keeps the shortest UTF-8 payload. Classic script for file://.
 * Load after alphabets.js and compress.js.
 *
 * Payload modes:
 *   %…  site template (e.g. %y + YouTube video id)
 *   ^…  ha.mr with dense alphabet
 *   else ha.mr with standard ASCII alphabet
 */
var UrlCodec = (function () {
  "use strict";

  var SITE_PREFIX = "%";
  var DENSE_PREFIX = "^";

  var SITES = [
    {
      tag: "y",
      label: "YouTube watch",
      match: function (rest) {
        var m = /^(?:www\.)?youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (id) {
        return "https://www.youtube.com/watch?v=" + id;
      }
    },
    {
      tag: "b",
      label: "youtu.be",
      match: function (rest) {
        var m = /^youtu\.be\/([A-Za-z0-9_-]{6,})$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (id) {
        return "https://youtu.be/" + id;
      }
    },
    {
      tag: "s",
      label: "YouTube Shorts",
      match: function (rest) {
        var m = /^(?:www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (id) {
        return "https://www.youtube.com/shorts/" + id;
      }
    },
    {
      tag: "v",
      label: "Vimeo",
      match: function (rest) {
        var m = /^(?:www\.)?vimeo\.com\/(\d{6,})$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (id) {
        return "https://vimeo.com/" + id;
      }
    },
    {
      tag: "x",
      label: "X status",
      match: function (rest) {
        var m = /^(?:www\.)?(?:twitter|x)\.com\/[^/]+\/status\/(\d+)$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (id) {
        return "https://x.com/i/status/" + id;
      }
    },
    {
      tag: "r",
      label: "Reddit",
      match: function (rest) {
        var m = /^(?:www\.)?reddit\.com\/(?:r\/[^/]+\/)?comments\/([A-Za-z0-9]+)(?:\/[^?]*)?$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (id) {
        return "https://www.reddit.com/comments/" + id;
      }
    },
    {
      tag: "g",
      label: "GitHub repo",
      match: function (rest) {
        var m = /^(?:www\.)?github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/?$/i.exec(rest);
        return m ? m[1] : null;
      },
      expand: function (slug) {
        return "https://github.com/" + slug;
      }
    },
    {
      tag: "w",
      label: "Wikipedia",
      match: function (rest) {
        var m = /^(?:([a-z]{2})\.)?wikipedia\.org\/wiki\/([^?#]+)$/i.exec(rest);
        if (!m) return null;
        var lang = (m[1] || "en").toLowerCase();
        return lang + "/" + m[2];
      },
      expand: function (payload) {
        var i = payload.indexOf("/");
        if (i < 1) return "https://en.wikipedia.org/wiki/" + payload;
        return (
          "https://" +
          payload.slice(0, i) +
          ".wikipedia.org/wiki/" +
          payload.slice(i + 1)
        );
      }
    }
  ];

  var siteByTag = Object.create(null);
  var si;
  for (si = 0; si < SITES.length; si++) {
    siteByTag[SITES[si].tag] = SITES[si];
  }

  function utf8Bytes(s) {
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(s).length;
    }
    return unescape(encodeURIComponent(s)).length;
  }

  function stripForMatch(url) {
    return url.replace(/^https:\/\//i, "").replace(/^http:\/\//i, "");
  }

  function normalize(value) {
    var trimmed = String(value || "").trim();
    if (!trimmed) return null;
    if (!/^https?:\/\//i.test(trimmed)) trimmed = "https://" + trimmed;
    try {
      var u = new URL(trimmed);
      if (u.protocol !== "http:" && u.protocol !== "https:") return null;
      if (u.username || u.password) return null;
      return u.href;
    } catch (e) {
      return null;
    }
  }

  function trySites(longUrl) {
    var rest = stripForMatch(longUrl);
    var http = /^http:\/\//i.test(longUrl);
    var i, site, packed, payload;
    var out = [];

    for (i = 0; i < SITES.length; i++) {
      site = SITES[i];
      packed = site.match(rest);
      if (packed == null || packed === "") continue;
      /* ~ marks http (rare); kept outside site tag */
      payload = SITE_PREFIX + (http ? "~" : "") + site.tag + packed;
      out.push({
        payload: payload,
        via: site.label + " template",
        bytes: utf8Bytes(payload)
      });
    }
    return out;
  }

  function tryHamr(longUrl, alphabet, prefix, label) {
    var body = compress(longUrl, alphabet);
    var payload = prefix + body;
    return {
      payload: payload,
      via: label,
      bytes: utf8Bytes(payload)
    };
  }

  function compressUrl(longUrl) {
    var candidates = [];
    var i, best;

    candidates.push.apply(candidates, trySites(longUrl));
    candidates.push(
      tryHamr(longUrl, outputAlphabetASCII, "", "ha.mr ASCII")
    );
    candidates.push(
      tryHamr(longUrl, outputAlphabetDense, DENSE_PREFIX, "ha.mr dense ASCII")
    );

    best = candidates[0];
    for (i = 1; i < candidates.length; i++) {
      if (candidates[i].bytes < best.bytes) best = candidates[i];
      else if (
        candidates[i].bytes === best.bytes &&
        candidates[i].payload.length < best.payload.length
      ) {
        best = candidates[i];
      }
    }

    return {
      payload: best.payload,
      via: best.via,
      bytes: best.bytes,
      candidates: candidates
    };
  }

  function expand(payload) {
    var raw = String(payload || "").replace(/ /g, "");
    if (!raw) return null;

    try {
      if (raw.charAt(0) === SITE_PREFIX) {
        return expandSite(raw.slice(1));
      }
      if (raw.charAt(0) === DENSE_PREFIX) {
        return decompress(raw.slice(1), outputAlphabetDense);
      }
      return decompress(raw, outputAlphabetASCII);
    } catch (e) {
      return null;
    }
  }

  function expandSite(body) {
    var http = false;
    if (body.charAt(0) === "~") {
      http = true;
      body = body.slice(1);
    }
    if (body.length < 2) return null;
    var tag = body.charAt(0);
    var site = siteByTag[tag];
    if (!site) return null;
    var target = site.expand(body.slice(1));
    if (http) target = target.replace(/^https:\/\//i, "http://");
    return target;
  }

  return {
    normalize: normalize,
    compress: compressUrl,
    expand: expand,
    listSites: function () {
      return SITES.map(function (s) {
        return { tag: s.tag, label: s.label };
      });
    }
  };
})();
