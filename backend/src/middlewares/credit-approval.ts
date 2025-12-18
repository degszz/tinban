export default (config, { strapi }) => {
  return async (ctx, next) => {
    // Interceptar actualizaciones de credit-request desde Content Manager
    const isCreditRequestUpdate = 
      ctx.request.url.includes('/content-manager/collection-types/api::credit-request.credit-request') &&
      ctx.request.method === 'PUT';

    if (isCreditRequestUpdate) {
      console.log('🔧 MIDDLEWARE CREDIT-APPROVAL - Interceptando UPDATE');
      console.log('📥 URL:', ctx.request.url);
      console.log('📥 Body:', JSON.stringify(ctx.request.body, null, 2));

      const body = ctx.request.body;

      // Si se está cambiando a approved
      if (body.status === 'approved') {
        console.log('✅ Detectado cambio a APPROVED');

        // Obtener el documentId de la URL
        const urlParts = ctx.request.url.split('/');
        const documentIdIndex = urlParts.findIndex(part => part === 'api::credit-request.credit-request') + 1;
        const documentId = urlParts[documentIdIndex]?.split('?')[0];

        console.log('📄 Document ID extraído:', documentId);

        if (!documentId) {
          console.log('❌ No se pudo extraer documentId');
          await next();
          return;
        }

        try {
          // Ejecutar el update normal primero
          await next();

          // Si el update fue exitoso (200 o 201)
          if (ctx.response.status === 200 || ctx.response.status === 201) {
            console.log('✅ Update exitoso, ejecutando lógica de aprobación');

            // Buscar la solicitud actualizada
            const creditRequests = await strapi.db.query('api::credit-request.credit-request').findMany({
              where: { documentId },
              populate: ['user'],
            });

            const creditRequest = creditRequests[0];

            console.log('📋 Solicitud encontrada:', creditRequest ? 'SÍ' : 'NO');

            if (!creditRequest) {
              console.log('❌ No se encontró la solicitud con documentId:', documentId);
              return;
            }

            if (!creditRequest.user) {
              console.log('❌ La solicitud no tiene usuario asociado');
              return;
            }

            const userId = creditRequest.user.id || creditRequest.user;
            const amount = creditRequest.amount;

            console.log('👤 Usuario ID:', userId);
            console.log('💰 Monto a agregar:', amount);

            // Obtener usuario con créditos actuales
            const user = await strapi.entityService.findOne(
              'plugin::users-permissions.user',
              userId,
              { fields: ['id', 'username', 'credits'] }
            );

            console.log('👤 Usuario obtenido:', user);

            const currentCredits = (user as any)?.credits || 0;
            const newCredits = currentCredits + amount;

            console.log(`💵 Créditos: ${currentCredits} + ${amount} = ${newCredits}`);

            // Actualizar créditos
            // @ts-ignore
            await strapi.entityService.update(
              'plugin::users-permissions.user',
              userId,
              {
                data: { credits: newCredits },
              }
            );

            console.log('✅ Créditos actualizados exitosamente');
            strapi.log.info(`✅ Credit-request APROBADA: Usuario ${userId} (${(user as any)?.username}) ahora tiene ${newCredits} créditos`);
          } else {
            console.log('⚠️ Update no fue exitoso, status:', ctx.response.status);
          }
        } catch (error) {
          console.error('❌ Error en middleware credit-approval:', error);
          strapi.log.error('Error en middleware credit-approval:', error);
        }
      } else {
        console.log('ℹ️ Status no es approved, continuando normalmente. Status:', body.status);
        await next();
      }
    } else {
      // No es una actualización de credit-request, continuar normalmente
      await next();
    }
  };
};
