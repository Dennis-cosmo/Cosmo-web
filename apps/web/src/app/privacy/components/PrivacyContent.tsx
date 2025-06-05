export function PrivacyContent() {
  return (
    <div className="text-white space-y-6">
      <p className="text-base text-white">
        Esta Política de Privacidad explica cómo Cosmo ("nosotros", "nuestro",
        "nos") recopila, utiliza, comparte y protege sus datos personales cuando
        utiliza nuestra plataforma, servicios o sitio web (en conjunto, los
        "Servicios"), de acuerdo con el Reglamento General de Protección de
        Datos (GDPR) y otras leyes de protección de datos de la UE aplicables.
      </p>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          1. Quiénes Somos
        </h2>
        <p className="text-base text-white">
          Cosmo es una plataforma fintech con sede en la Unión Europea, enfocada
          en permitir el acceso a finanzas sostenibles y verdes para bancos,
          inversores y empresas.
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Controlador: Cosmo (TransCircular UG)</li>
          <li>Dirección: Schumannstr. 27 60325 Frankfurt am Main</li>
          <li>Email de contacto: contact@simplycosmo.com</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          2. Qué Datos Recopilamos
        </h2>
        <p className="text-base mb-2 text-white">
          Recopilamos los siguientes tipos de datos, dependiendo de su uso de
          nuestros Servicios:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong className="text-white">Datos de Identificación:</strong>{" "}
            Nombre, dirección de correo electrónico, cargo, nombre de la
            empresa, número de teléfono
          </li>
          <li>
            <strong className="text-white">
              Datos de Inicio de Sesión y Cuenta:
            </strong>{" "}
            Nombre de usuario, contraseña, historial de inicio de sesión,
            registros de acceso
          </li>
          <li>
            <strong className="text-white">
              Información Financiera y Empresarial:
            </strong>{" "}
            Perfiles de instituciones, intereses de inversión, métricas ESG,
            documentación cargada
          </li>
          <li>
            <strong className="text-white">Datos Técnicos:</strong> Dirección
            IP, ID del dispositivo, tipo de navegador, cookies, análisis de uso
          </li>
          <li>
            <strong className="text-white">Comunicaciones:</strong> Mensajes,
            consultas de soporte, comentarios
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          3. Bases Legales para el Procesamiento
        </h2>
        <p className="text-base mb-2 text-white">
          Procesamos sus datos personales en las siguientes bases legales:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">
                  Propósito
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">
                  Base Legal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-4 py-2 text-sm">
                  Creación y acceso a la cuenta
                </td>
                <td className="px-4 py-2 text-sm">
                  Contrato (Art. 6(1)(b) GDPR)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">Comunicación y soporte</td>
                <td className="px-4 py-2 text-sm">
                  Interés Legítimo (Art. 6(1)(f))
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">
                  Marketing y boletines (con consentimiento)
                </td>
                <td className="px-4 py-2 text-sm">
                  Consentimiento (Art. 6(1)(a))
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">
                  Cumplimiento legal (ej. AML/KYC)
                </td>
                <td className="px-4 py-2 text-sm">
                  Obligación Legal (Art. 6(1)(c))
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">
                  Análisis y mejora de la plataforma
                </td>
                <td className="px-4 py-2 text-sm">Interés Legítimo</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          4. Cómo Utilizamos Sus Datos
        </h2>
        <p className="text-base mb-2 text-white">
          Utilizamos los datos personales para:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Proporcionar y mantener nuestra plataforma y Servicios</li>
          <li>
            Emparejar usuarios con oportunidades relevantes de finanzas verdes
          </li>
          <li>Realizar verificaciones de cumplimiento (ej. ESG, KYC/AML)</li>
          <li>
            Enviar actualizaciones de servicio y boletines (solo con
            consentimiento)
          </li>
          <li>Detectar fraudes y hacer cumplir los Términos de Servicio</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          5. Cómo Compartimos Sus Datos
        </h2>
        <p className="text-base mb-2 text-white">
          Podemos compartir sus datos con:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            Proveedores de Servicios: Alojamiento en la nube, servicios de
            correo electrónico, herramientas de análisis
          </li>
          <li>
            Contrapartes Financieras: Si está autorizado por usted, para
            emparejamiento de finanzas verdes
          </li>
          <li>
            Reguladores y Fuerzas del Orden: Cuando sea legalmente requerido
          </li>
          <li>
            Integraciones de Terceros: Solo si las activa (ej. proveedores de
            datos ESG)
          </li>
        </ul>
        <p className="text-base mt-2 text-white">
          Todos los procesadores están sujetos a Acuerdos de Procesamiento de
          Datos conformes con el Art. 28 GDPR.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          6. Transferencias Internacionales
        </h2>
        <p className="text-base mb-2 text-white">
          Si sus datos se transfieren fuera del Espacio Económico Europeo (EEE),
          nos aseguramos de que estén protegidos por:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Decisiones de Adecuación</li>
          <li>Cláusulas Contractuales Estándar (SCCs)</li>
          <li>Reglas Corporativas Vinculantes (BCRs) (cuando corresponda)</li>
        </ul>
        <p className="text-base mt-2 text-white">
          Puede solicitar una copia de las garantías relevantes contactándonos.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          7. Retención de Datos
        </h2>
        <p className="text-base mb-2 text-white">
          Conservamos sus datos solo durante el tiempo necesario para los fines
          establecidos en esta Política:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">
                  Tipo de Dato
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">
                  Período de Retención
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              <tr>
                <td className="px-4 py-2 text-sm">Datos de Cuenta</td>
                <td className="px-4 py-2 text-sm">
                  Hasta 7 años después del cierre
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">
                  Registros de Transacciones
                </td>
                <td className="px-4 py-2 text-sm">
                  Según lo requieran las leyes AML/KYC
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">Análisis y registros</td>
                <td className="px-4 py-2 text-sm">12-24 meses</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">Preferencias de marketing</td>
                <td className="px-4 py-2 text-sm">
                  Hasta que retire el consentimiento
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          8. Sus Derechos bajo GDPR
        </h2>
        <p className="text-base mb-2 text-white">
          Tiene los siguientes derechos bajo GDPR:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Acceso – Obtener una copia de sus datos</li>
          <li>Rectificación – Corregir datos inexactos o incompletos</li>
          <li>
            Supresión ("Derecho al Olvido") – Solicitar la eliminación de datos
          </li>
          <li>Restricción – Limitar cómo se procesan sus datos</li>
          <li>
            Portabilidad – Recibir datos en un formato estructurado y legible
            por máquina
          </li>
          <li>
            Oposición – Oponerse al procesamiento por motivos de interés
            legítimo
          </li>
          <li>
            Retirar Consentimiento – En cualquier momento, cuando corresponda
          </li>
        </ul>
        <p className="text-base mt-2 text-white">
          Para ejercer sus derechos, contacte a: contact@simplycosmo.com
        </p>
        <p className="text-base mt-2 text-white">
          También tiene derecho a presentar una queja ante su Autoridad de
          Protección de Datos local (DPA).
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          9. Cookies y Tecnologías de Seguimiento
        </h2>
        <p className="text-base mb-2 text-white">Utilizamos cookies para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Analizar el uso</li>
          <li>Mejorar el rendimiento de la plataforma</li>
          <li>Recordar preferencias de usuario</li>
        </ul>
        <p className="text-base mt-2 text-white">
          Puede gestionar las preferencias de cookies a través de nuestro Panel
          de Configuración de Cookies. Para más detalles, consulte nuestra
          Política de Cookies.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          10. Seguridad de Datos
        </h2>
        <p className="text-base mb-2 text-white">
          Implementamos medidas técnicas y organizativas (TOMs) para proteger
          sus datos personales, incluyendo:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cifrado de datos (en tránsito y en reposo)</li>
          <li>Autenticación multifactor (MFA)</li>
          <li>Control de acceso y registro de auditoría</li>
          <li>Evaluaciones de seguridad regulares y pruebas de penetración</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          11. Cambios en Esta Política
        </h2>
        <p className="text-base text-white">
          Podemos actualizar esta Política de Privacidad para reflejar cambios
          legales u operativos. Se le notificará sobre cambios materiales cuando
          sea requerido bajo GDPR.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-3">
          12. Contáctenos
        </h2>
        <p className="text-base mb-2 text-white">
          Para cualquier pregunta relacionada con la privacidad o para ejercer
          sus derechos, por favor contacte a:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Oficial de Protección de Datos (DPO)</li>
          <li>Email: contact@simplycosmo.com</li>
          <li>Dirección: Schumannstr. 27 60325 Frankfurt am Main</li>
        </ul>
      </section>
    </div>
  );
}
