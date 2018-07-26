function mpld3_load_lib(url, callback) {
  var s = document.createElement('script');
  s.src = url;
  s.async = true;
  s.onreadystatechange = s.onload = callback;
  s.onerror = function () {
    console.warn('failed to load library ' + url);
  };
  document.getElementsByTagName('head')[0].appendChild(s);
}

mpld3_load_lib('https://mpld3.github.io/js/d3.v3.min.js', function () {
  mpld3_load_lib('https://mpld3.github.io/js/mpld3.v0.2.js', function () {

    mpld3.draw_figure('fig_el427345810798888193429725', {
      'axes': [{
        'xlim': [-1.6000000000000001, 0.0],
        'yscale': 'linear',
        'axesbg': '#EEEEEE',
        'texts': [{
          'v_baseline': 'auto',
          'h_anchor': 'middle',
          'color': '#000000',
          'text': 'Example scatter plot',
          'coordinates': 'axes',
          'zorder': 3,
          'alpha': 1,
          'fontsize': 20.0,
          'position': [0.5, 1.0144675925925926],
          'rotation': -0.0,
          'id': 'el33744851044752'
        }],
        'zoomable': true,
        'images': [],
        'xdomain': [-1.6000000000000001, 0.0],
        'ylim': [-0.20000000000000001, 0.60000000000000009],
        'paths': [],
        'sharey': [],
        'sharex': [],
        'axesbgalpha': null,
        'axes': [{
          'scale': 'linear',
          'tickformat': null,
          'grid': {
            'color': '#FFFFFF',
            'alpha': 1.0,
            'dasharray': '10,0',
            'gridOn': true
          },
          'fontsize': 10.0,
          'position': 'bottom',
          'nticks': 10,
          'tickvalues': null
        }, {
          'scale': 'linear',
          'tickformat': null,
          'grid': {
            'color': '#FFFFFF',
            'alpha': 1.0,
            'dasharray': '10,0',
            'gridOn': true
          },
          'fontsize': 10.0,
          'position': 'left',
          'nticks': 10,
          'tickvalues': null
        }],
        'lines': [],
        'markers': [],
        'id': 'el42734580982416',
        'ydomain': [-0.20000000000000001, 0.60000000000000009],
        'collections': [{
          'paths': [
            [
              [
                [0.0, -0.5],
                [0.13260155, -0.5],
                [0.25978993539242673, -0.44731684579412084],
                [0.3535533905932738, -0.3535533905932738],
                [0.44731684579412084, -0.25978993539242673],
                [0.5, -0.13260155],
                [0.5, 0.0],
                [0.5, 0.13260155],
                [0.44731684579412084, 0.25978993539242673],
                [0.3535533905932738, 0.3535533905932738],
                [0.25978993539242673, 0.44731684579412084],
                [0.13260155, 0.5],
                [0.0, 0.5],
                [-0.13260155, 0.5],
                [-0.25978993539242673, 0.44731684579412084],
                [-0.3535533905932738, 0.3535533905932738],
                [-0.44731684579412084, 0.25978993539242673],
                [-0.5, 0.13260155],
                [-0.5, 0.0],
                [-0.5, -0.13260155],
                [-0.44731684579412084, -0.25978993539242673],
                [-0.3535533905932738, -0.3535533905932738],
                [-0.25978993539242673, -0.44731684579412084],
                [-0.13260155, -0.5],
                [0.0, -0.5]
              ],
              ['M', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'Z']
            ]
          ],
          'edgecolors': ['#000000'],
          'edgewidths': [1.0],
          'offsets': 'data01',
          'yindex': 1,
          'id': 'el42734594226256',
          'pathtransforms': [
            [16.471582089328177, 0.0, 0.0, 16.471582089328177, 0.0, 0.0],
            [16.397903692710862, 0.0, 0.0, 16.397903692710862, 0.0, 0.0],
            [31.524176462589807, 0.0, 0.0, 31.524176462589807, 0.0, 0.0]
          ],
          'pathcoordinates': 'display',
          'offsetcoordinates': 'data',
          'zorder': 1,
          'xindex': 0,
          'alphas': [0.3],
          'facecolors': ['#00007F', '#7F0000', '#7CFF79']
        }],
        'xscale': 'linear',
        'bbox': [0.125, 0.125, 0.77500000000000002, 0.77500000000000002]
      }],
      'height': 320.0,
      'width': 600.0,
      'plugins': [],
      'data': {
        'data01': [
          [-0.580, 0.56],
          [-0.24, -0.11],
          [-1.50, 0.42]
        ]
      },
      'id': 'el42734581079888'
    });
  });
});
