// Configuring the Articles module
angular.module('bottles').run(['Menus',
  function (Menus) {
    // Add the bottles dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Bottles',
      state: 'bottles',
      type: 'dropdown'
    });

    // Add the dropdown list item
    Menus.addSubMenuItem('topbar', 'bottles', {
      title: 'List bottles',
      state: 'bottles.list'
    });

    // Add the dropdown create item
    Menus.addSubMenuItem('topbar', 'bottles', {
      title: 'Create bottle',
      state: 'bottles.create',
      roles:['superAdmin']
    });
    Menus.addSubMenuItem('topbar', 'bottles', {
      title: 'Drink type',
      state: 'drinkType.list',
      roles:['superAdmin']
    });
  }
]);
