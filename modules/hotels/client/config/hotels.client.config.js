// Configuring the Hotels module
angular.module('hotels').run(['Menus',
  function (Menus) {
    // Add the hotels dropdown item
    Menus.addMenuItem('topbar', {
      title: 'Hotels',
      state: 'hotels.list',
      // type: 'dropdown'
    });

    // // Add the dropdown list item
    // Menus.addSubMenuItem('topbar', 'hotels', {
    //   title: 'List hotels',
    //   state: 'hotels.list'
    // });

    
    // // Add the dropdown create item
    // Menus.addSubMenuItem('topbar', 'hotels', {
    //   title: 'Create hotel',
    //   state: 'hotels.create',
    //   roles:['superAdmin']
    // });
  }
]);
