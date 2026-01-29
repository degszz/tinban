export default {
  config: {
    // Idiomas disponibles en el admin
    locales: ['es', 'en'],
    
    // Traducciones personalizadas
    translations: {
      es: {
        // ==== TRADUCCIONES PARA LOS MENÚS LATERALES ====
        'content-manager.containers.List.Bid': 'Oferta',
        'content-manager.containers.List.Credit Request': 'Solicitud de Crédito',
        'content-manager.containers.List.User': 'Usuario',
        'content-manager.containers.List.WhatsApp Messages': 'Mensajes de WhatsApp',
        'content-manager.containers.List.Home Page': 'Página de Inicio',
        'content-manager.containers.List.Nosotros': 'Nosotros',
        
        // ==== TRADUCCIONES PARA SINGLE TYPES ====
        'content-manager.containers.Edit.information': 'Información',
        
        // ==== TRADUCCIONES PARA HEADERS DE TABLA ====
        'content-manager.components.DynamicTable.relation-loaded': '{number} relaciones cargadas',
        'content-manager.components.DynamicTable.relation-more': 'Y {number} más',
        
        // ==== BOTONES Y FILTROS ====
        'app.components.Button.filter': 'Filtros',
        'content-manager.components.FiltersPickWrapper.PluginHeader.title': 'Filtros',
        'content-manager.components.Filters.button.apply': 'Aplicar',
        'content-manager.components.Filters.button.clear': 'Limpiar',
        
        // ==== CAMPOS DE BÚSQUEDA ====
        'content-manager.components.Search.placeholder': 'Buscar...',
        
        // ==== ENCABEZADOS DE COLUMNAS PERSONALIZADOS ====
        // Estos son los más importantes para tu caso
        'content-manager.containers.ListPage.table-headers.id': 'ID',
        'content-manager.containers.ListPage.table-headers.createdAt': 'FECHA CREACIÓN',
        'content-manager.containers.ListPage.table-headers.updatedAt': 'FECHA ACTUALIZACIÓN',
        'content-manager.containers.ListPage.table-headers.publishedAt': 'FECHA PUBLICACIÓN',
        
        // ==== NOMBRES DE CAMPOS PERSONALIZADOS ====
        // Aquí defines cómo se llaman tus campos
        'content-manager.components.FieldItem.auction_title': 'TÍTULO DE SUBASTA',
        'content-manager.components.FieldItem.user': 'USUARIO',
        'content-manager.components.FieldItem.amount': 'MONTO',
        
        // ==== PÁGINA DE INICIO ====
        'app.components.HomePage.welcome': 'Bienvenido a Strapi',
        'app.components.HomePage.welcomeBlock.content': 'Estamos felices de tenerte como miembro de la comunidad.',
        
        // ==== SETTINGS ====
        'Settings.application.title': 'Configuración de la aplicación',
        'Settings.global': 'Configuración global',
        
        // ==== CONTENT MANAGER - ENCABEZADOS GENERALES ====
        'content-manager.components.TableHeader.sort': 'Ordenar por {label}',
        'content-manager.containers.ListPage.table-headers': 'Encabezados de tabla',
        
        // ==== ACCIONES COMUNES ====
        'app.components.Button.save': 'Guardar',
        'app.components.Button.cancel': 'Cancelar',
        'app.components.Button.delete': 'Eliminar',
        'app.components.Button.edit': 'Editar',
        'app.components.Button.create': 'Crear',
        'app.components.Button.add': 'Añadir',
        
        // ==== MENSAJES DEL SISTEMA ====
        'notification.success.saved': 'Guardado exitosamente',
        'notification.success.deleted': 'Eliminado exitosamente',
        'notification.error': 'Ha ocurrido un error',
        
        // ==== PAGINACIÓN ====
        'components.PageFooter.select': 'entradas por página',
        'components.pagination.go-to': 'Ir a la página {page}',
        
        // ==== FILTROS AVANZADOS ====
        'content-manager.components.Filters.add': 'Añadir filtro',
        'content-manager.components.Filters.hide': 'Ocultar filtros',
        'content-manager.components.Filters.show': 'Mostrar filtros',
      },
      
      en: {
        // ==== ENGLISH TRANSLATIONS ====
        'content-manager.containers.List.Bid': 'Bid',
        'content-manager.containers.List.Credit Request': 'Credit Request',
        'content-manager.containers.List.User': 'User',
        'content-manager.containers.List.WhatsApp Messages': 'WhatsApp Messages',
        'content-manager.containers.List.Home Page': 'Home Page',
        'content-manager.containers.List.Nosotros': 'About Us',
        
        'app.components.Button.filter': 'Filters',
        'content-manager.components.FiltersPickWrapper.PluginHeader.title': 'Filters',
        'content-manager.components.Filters.button.apply': 'Apply',
        'content-manager.components.Filters.button.clear': 'Clear',
        
        'content-manager.components.Search.placeholder': 'Search...',
        
        'content-manager.containers.ListPage.table-headers.id': 'ID',
        'content-manager.containers.ListPage.table-headers.createdAt': 'CREATED AT',
        'content-manager.containers.ListPage.table-headers.updatedAt': 'UPDATED AT',
        'content-manager.containers.ListPage.table-headers.publishedAt': 'PUBLISHED AT',
        
        'content-manager.components.FieldItem.auction_title': 'AUCTION TITLE',
        'content-manager.components.FieldItem.user': 'USER',
        'content-manager.components.FieldItem.amount': 'AMOUNT',
        
        'app.components.HomePage.welcome': 'Welcome to Strapi',
        'app.components.HomePage.welcomeBlock.content': 'We are happy to have you as a member of the community.',
        
        'Settings.application.title': 'Application settings',
        'Settings.global': 'Global settings',
        
        'app.components.Button.save': 'Save',
        'app.components.Button.cancel': 'Cancel',
        'app.components.Button.delete': 'Delete',
        'app.components.Button.edit': 'Edit',
        'app.components.Button.create': 'Create',
        'app.components.Button.add': 'Add',
        
        'notification.success.saved': 'Saved successfully',
        'notification.success.deleted': 'Deleted successfully',
        'notification.error': 'An error occurred',
        
        'components.PageFooter.select': 'entries per page',
        'components.pagination.go-to': 'Go to page {page}',
        
        'content-manager.components.Filters.add': 'Add filter',
        'content-manager.components.Filters.hide': 'Hide filters',
        'content-manager.components.Filters.show': 'Show filters',
      }
    },
  },
  
  bootstrap(app: any) {
    console.log('✅ Admin customization loaded successfully');
    console.log('🌍 Available locales:', ['es', 'en', 'pt']);
  },
};