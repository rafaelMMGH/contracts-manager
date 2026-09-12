import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { amountToWords } from './numberToWords'
import { formatContractDate } from './dates'

const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontFamily: 'Helvetica',
    fontSize: 9,
    lineHeight: 1.5,
    color: '#000',
  },
  title: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 10,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 7,
    textAlign: 'justify',
  },
  boldInline: {
    fontFamily: 'Helvetica-Bold',
  },
  signatureSection: {
    marginTop: 24,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  signatureBlock: {
    width: '40%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: '100%',
    marginTop: 30,
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 8,
    textAlign: 'center',
  },
  witnessTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginTop: 20,
    marginBottom: 4,
  },
})

interface ContractData {
  ownerName: string
  ownerAddress: string
  tenantName: string
  houseAddress: string
  houseType: string
  rentPrice: number
  depositPrice: number
  startDate: Date
  startDateDay: number
  deadline: number
  expirationDate: Date
  witnessName: string
  witness2Name: string
  signingDate: Date
}

function u(str: string | number): string {
  return String(str).toUpperCase()
}

export function ContractPDF({ data }: { data: ContractData }) {
  const rentWords = amountToWords(data.rentPrice)
  const depositWords = amountToWords(data.depositPrice)
  const startDateStr = formatContractDate(new Date(data.startDate))
  const expirationDateStr = formatContractDate(new Date(data.expirationDate))
  const signingDateStr = formatContractDate(new Date(data.signingDate))

  const houseTypeLabel =
    data.houseType === 'RESIDENTIAL' ? 'USO HABITACIONAL' : 'USO COMERCIAL'

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>CONTRATO DE ARRENDAMIENTO</Text>

        <Text style={styles.paragraph}>
          QUE CELEBRAN POR UNA PARTE LA{' '}
          <Text style={styles.boldInline}>{u(data.ownerName)}</Text>, A QUIEN EN LO SUCESIVO SE LE DENOMINARA "EL ARRENDADOR" Y POR LA OTRA PARTE LA{' '}
          <Text style={styles.boldInline}>{u(data.tenantName)}</Text>, A QUIEN EN LO SUCESIVO SE LE DENOMINARA "EL ARRENDATARIO", AMBAS PARTES ESTÁN DE ACUERDO POR LO CUAL SE SOMETEN A LAS SIGUIENTES DECLARACIONES Y CLAUSULAS.
        </Text>

        <Text style={styles.sectionTitle}>DECLARACIONES</Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>PRIMERA. -</Text>{' '}
          "EL ARRENDADOR" DECLARA SER UNA PERSONA FÍSICA Y PROPIETARIO DEL BIEN INMUEBLE UBICADO EN LA{' '}
          <Text style={styles.boldInline}>{u(data.houseAddress)}</Text>{' '}
          DE ESTA CIUDAD CAPITAL LO CUAL MANIFIESTA QUE CUENTA CON TODOS LOS DOCUMENTOS QUE ACREDITAN DICHA PROPIEDAD, Y QUE SE ENCUENTRA AL CORRIENTE EN TODOS LOS PAGOS FISCALES Y ES CONFORME EN DAR EN ARRENDAMIENTO DICHO BIEN PARA SER UTILIZADO ÚNICA Y EXCLUSIVAMENTE PARA{' '}
          <Text style={styles.boldInline}>{u(houseTypeLabel)}</Text>.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>SEGUNDA. -</Text>{' '}
          "EL ARRENDATARIO" MANIFIESTA SU DESEO DE CELEBRAR ESTE CONTRATO DE ARRENDAMIENTO CON "EL ARRENDADOR" Y RECIBE DICHO BIEN INMUEBLE CON LOS SERVICIOS BÁSICOS EN PERFECTAS CONDICIONES, LO CUAL DECLARA QUE PARA LOS EFECTOS LEGALES SU DOMICILIO SERÁ EL MISMO DEL BIEN INMUEBLE ARRENDADO.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>TERCERA. -</Text>{' '}
          COMO CONSECUENCIA DE LO ANTES EXPRESADO, LAS PARTES SON CONFORMES Y FORMALIZAN EL PRESENTE CONTRATO, AL TENOR DE LAS SIGUIENTES.
        </Text>

        <Text style={styles.sectionTitle}>CLÁUSULAS</Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>PRIMERA. -</Text>{' '}
          "EL ARRENDATARIO" PAGARÁ POR CONCEPTO DE RENTA POR UNA FRACCIÓN DE LA PROPIEDAD DESCRITA EN LAS DECLARACIONES PRIMERA DE ESTE CONTRATO, LA CANTIDAD DE{' '}
          <Text style={styles.boldInline}>${data.rentPrice.toLocaleString('es-MX')} ({u(rentWords)} 00/100 MONEDA NACIONAL)</Text>,{' '}
          MENSUALES EL DÍA <Text style={styles.boldInline}>{data.startDateDay}</Text> DE CADA MES, EN EL DOMICILIO DE "EL ARRENDADOR". UBICADO EN LA{' '}
          <Text style={styles.boldInline}>{u(data.ownerAddress)}</Text>{' '}
          DE ESTA CIUDAD CAPITAL.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>SEGUNDA.-</Text>{' '}
          "EL ARRENDATARIO" ENTREGA A "EL ARRENDADOR" PARA GARANTIZAR SU ESTANCIA EN LA PROPIEDAD ARRENDADA, SE LE RECIBE COMO DEPÓSITO LA CANTIDAD DE{' '}
          <Text style={styles.boldInline}>${data.depositPrice.toLocaleString('es-MX')} ({u(depositWords)} 00/100 MONEDA NACIONAL)</Text>,{' '}
          Y NO CAUSARÁ NINGÚN INTERÉS LEGAL, EL CUAL SERÁ DEVUELTO CUANDO "EL ARRENDATARIO" DESOCUPE LA PROPIEDAD, SIEMPRE Y CUANDO NO SE HAYA ATRASADO POR LOS SIGUIENTES CONCEPTOS DE RENTA, AGUA POTABLE, ENERGÍA ELÉCTRICA, ETC., ADEMÁS DE QUE LA PROPIEDAD ARRENDADA SE ENCUENTRE EN LAS MISMAS CONDICIONES QUE SE ENTREGÓ, TAN SOLO CON EL DESGASTE OCASIONADO POR SU USO NORMAL.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>TERCERA. -</Text>{' '}
          "EL ARRENDADOR" Y "EL ARRENDATARIO" DE COMÚN ACUERDO ESTIPULAN QUE EL PLAZO FORZOSO DE ARRENDAMIENTO DEL BIEN INMUEBLE SERÁ DE{' '}
          <Text style={styles.boldInline}>{data.deadline}</Text>{' '}
          MESES, Y EMPEZARÁ A CORRER A PARTIR DEL{' '}
          <Text style={styles.boldInline}>{u(startDateStr)}</Text>{' '}
          AL <Text style={styles.boldInline}>{u(expirationDateStr)}</Text>.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>CUARTA. -</Text>{' '}
          QUEDA ENTERADO DESDE ESTE MOMENTO QUE SE FIRMA EL PRESENTE CONTRATO Y SOBRE TODO ENTENDIDO "EL ARRENDATARIO" QUE AL TERMINAR EL PLAZO FORZOSO Y DEFINITIVO DE{' '}
          <Text style={styles.boldInline}>{data.deadline}</Text>{' '}
          MESES FIJADO POR "EL ARRENDADOR" Y "EL ARRENDATARIO" NO SE PODRÁ RENOVAR UN NUEVO CONTRATO, NI EXTENDERSE UN PLAZO ADICIONAL POR ASÍ CONVENIR A INTERESES DEL "ARRENDADOR"; ASÍ COMO NO SERÁ ACUMULABLE LA ANTIGÜEDAD DE CONTRATOS ANTERIORES. ESTANDO CONSCIENTE Y TOTALMENTE DE ACUERDO "EL ARRENDATARIO" EN QUE SE LE DÉ CUMPLIMIENTO A ESTA CLÁUSULA, Y DE NO ACATARSE A LO AQUÍ ESTIPULADO ACEPTA QUE SE EJECUTE LO QUE RESTA LA CLÁUSULA SEXTA DE ESTE CONTRATO SIN RESPONSABILIDAD PARA "EL ARRENDADOR".
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>QUINTA.-</Text>{' '}
          "EL ARRENDATARIO" RECIBE EL BIEN INMUEBLE, ASEADO, EN BUENAS CONDICIONES Y BAÑO, AL CORRIENTE EN TODOS LOS PAGOS POR CONCEPTO DE AGUA POTABLE, ENERGÍA ELÉCTRICA, PREDIAL., LO CUAL EN EL MOMENTO DE SU DESOCUPACIÓN SERÁ ENTREGADA DE LA MISMA FORMA, ENTREGANDO A "EL ARRENDADOR" LOS COMPROBANTES RECIENTES PAGADOS POR LOS CONCEPTOS DE AGUA POTABLE, ENERGÍA ELÉCTRICA, DE LO CONTRARIO SE TOMARÁ EL DEPÓSITO PARA REALIZAR DICHOS PAGOS Y MEJORAS POR AFECTAMIENTO QUE HAYA HECHO "EL ARRENDATARIO".
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>SEXTA.-</Text>{' '}
          QUEDA ABSOLUTAMENTE PROHIBIDO PARA "EL ARRENDATARIO", TRASPASAR, CEDER O SUBARRENDAR TODO O EN PARTES EL INMUEBLE ARRENDADO, NI CEDER O TRASPASAR LOS DERECHOS DERIVADOS DEL PRESENTE CONTRATO DE ARRENDAMIENTO, TAMPOCO PODRÁ HACER UN CAMBIO DE USO DEL ARRENDAMIENTO PARA EL QUE ESTÉ DESTINADO, ASÍ COMO QUEDA PROHIBIDO EL USO DE BEBIDAS ALCOHÓLICAS O ENERVANTES QUE AFECTEN LA SALUD, ASÍ COMO CUALQUIER ACCIDENTE, EL ÚNICO RESPONSABLE SEA EL "ARRENDATARIO" DESLINDANDO DE TODA CULPA AL "ARRENDADOR"; EN CASO DE HACERLO ESTE CONTRATO QUEDARÁ RESCINDIDO PARA LAS PARTES, DEBIENDO DESOCUPAR EL INMUEBLE, SIN NECESIDAD DE ACUDIR A UN JUICIO PARA LA TERMINACIÓN DE ESTE CONTRATO, Y EN EL CASO DE NO HACERLO "EL ARRENDATARIO" ACEPTA DA Y DA CONSENTIMIENTO Y LE OTORGA TODAS LAS FACULTADES HA "EL ARRENDADOR" PARA QUE INGRESE AL INMUEBLE Y PUEDA RETIRAR Y/O DESOCUPAR TODOS LOS ACTIVOS FIJOS Y TODO LO QUE EXISTAN EN EL INTERIOR DEL INMUEBLE, AUTORIZANDO "EL ARRENDATARIO" QUE DICHOS BIENES QUEDEN EN LA BANQUETA Y/O EN LA CALLE LO CUAL TODO LOS GASTOS PARA LLEVAR A CABO DICHA DESOCUPACIÓN TODO SERÁ CON CARGO Y COSTO PARA "EL ARRENDATARIO, SIN QUE "EL ARRENDADOR" INCURRA EN EL DELITO DE DESPOJO.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>SÉPTIMA. -</Text>{' '}
          SI POR NECESIDAD DE "EL ARRENDATARIO" DEBE HACER ALGUNA OBRA O REPARACIÓN TENDRÁ QUE REQUERIR EL PREVIO CONSENTIMIENTO DE "EL ARRENDADOR", DICHO CONSENTIMIENTO DEBERÁ SER DADO POR ESCRITO Y QUEDARÁ ÍNTEGRAMENTE A BENEFICIO DEL BIEN INMUEBLE ARRENDADO, LO CUAL NO PODRÁ "EL ARRENDATARIO" EN NINGÚN MOMENTO O CASO REALIZAR OBRA DE NINGUNA NATURALEZA SIN EL CONSENTIMIENTO Y EN LA FORMA EXPRESADA.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.boldInline}>OCTAVA. -</Text>{' '}
          "EL ARRENDATARIO" LE ESTÁ TOTAL Y EXPRESAMENTE PROHIBIDO INTRODUCIR Y USAR MATERIALES EXPLOSIVOS Y FLAMABLES Y TODO CUANTO PUEDA SER PELIGROSO PARA LA CONSERVACIÓN DEL BIEN INMUEBLE ARRENDADO EN EL INTERIOR OBJETO DE ESTE CONTRATO, OBLIGÁNDOSE A INDEMNIZAR A "EL ARRENDADOR" DE CUALQUIER DAÑO O DETERIORO CAUSADO POR SU CULPA O NEGLIGENCIA, COMPROMETIÉNDOSE A CONSERVAR EL CITADO INMUEBLE EN BUENAS CONDICIONES Y CON EL DETERIORO NORMAL.
        </Text>

        <Text style={styles.paragraph}>
          ESTE CONTRATO DE ARRENDAMIENTO SE EXTIENDE EN ORIGINAL Y COPIA Y SE FIRMA DE CONFORMIDAD POR LAS PARTES QUE AQUÍ INTERVIENEN, ENTERADOS DEL CONTENIDO Y ALCANCE DE TODAS Y CADA UNA DE LAS CLÁUSULAS ANTERIORES, AMBAS PARTES QUEDAN SOMETIDAS ANTE LAS AUTORIDADES JUDICIALES COMPETENTES DE ESTA CIUDAD EN CASO DE INCUMPLIMIENTO DE ALGUNA DE LAS CLÁUSULAS ANTERIORES FIRMAN POR ESTAR CONFORMES EN LA CIUDAD DE TUXTLA GUTIÉRREZ, CHIAPAS; A{' '}
          <Text style={styles.boldInline}>{u(signingDateStr)}</Text>.
        </Text>

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center' }}>"EL ARRENDADOR"</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>C. {u(data.ownerName)}</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9, textAlign: 'center' }}>"EL ARRENDATARIO"</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>C. {u(data.tenantName)}</Text>
            </View>
          </View>
        </View>

        {/* Witnesses */}
        <Text style={styles.witnessTitle}>TESTIGOS</Text>
        <View style={styles.signatureRow}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>C. {u(data.witnessName)}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>C. {u(data.witness2Name)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
