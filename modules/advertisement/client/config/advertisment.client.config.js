// Configuring the Articles module
angular.module('advertisement').run(['Menus',
  function (Menus) {
    // Add the bottles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Advertisement',
      state: 'advertisement',
      type: 'dropdown',
      roles:['superAdmin']
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'advertisement', {
      title: 'List adverstisment',
      state: 'advertisement.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'advertisement', {
      title: 'Upload advertisement',
      state: 'advertisement.create'
    });
  }
]);
