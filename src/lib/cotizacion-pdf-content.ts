import type { TipoServicioCotizacion } from "@/lib/cotizacion-types";

export type CotizacionPdfContent = {
  documentCode: string;
  title: string;
  subtitle: string;
  nitLabel: string;
  paragraphs: [string, string];
  pricingNote: string;
};

const commonInstitutionalIntroduction =
  "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de esterilización institucional con vapor de Sterinova, orientado a atender requerimientos de esterilización de productos compatibles con este método, especialmente en situaciones de contingencia. Nuestro servicio busca brindar una solución oportuna y confiable, de acuerdo con las necesidades y condiciones particulares de cada cliente.";

const serviceContent: Record<TipoServicioCotizacion, CotizacionPdfContent> = {
  INDUSTRIAL_ETO: {
    documentCode: "R-CM-07-1",
    title: "ESTERILIZACIÓN INDUSTRIAL",
    subtitle: "Cotización de Servicios",
    nitLabel: "NIT / C.C. / C.E. / OTRO",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de esterilización industrial con Óxido de Etileno (EtO) de Sterinova, dirigido al procesamiento de productos que requieren este método de esterilización. Nuestro servicio está orientado a brindar soluciones confiables y adaptadas a las características y necesidades de cada producto y proceso.",
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Precios antes de IVA (19%).",
  },
  INSTITUCIONAL_ETO: {
    documentCode: "R-CM-07-2",
    title: "ESTERILIZACIÓN INSTITUCIONAL EtO",
    subtitle: "Cotización de Servicios",
    nitLabel: "NIT / C.C. / C.E. / OTRO:",
    paragraphs: [
      commonInstitutionalIntroduction,
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Precios antes de IVA (19%).",
  },
  INSTITUCIONAL_VAPOR: {
    documentCode: "R-CM-07-3",
    title: "ESTERILIZACIÓN INSTITUCIONAL VAPOR",
    subtitle: "Cotización de Servicios",
    nitLabel: "NIT / C.C. / C.E. / OTRO:",
    paragraphs: [
      commonInstitutionalIntroduction,
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Precios antes de IVA (19%).",
  },
  INSUMOS: {
    documentCode: "R-CM-07-4",
    title: "VENTA DE INSUMOS",
    subtitle: "Cotización de insumos",
    nitLabel: "NIT / C.C. / C.E. / OTRO:",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente a la línea de venta de insumos de Sterinova, especializada en soluciones para procesos de esterilización y monitoreo.",
      "A continuación, presentamos los productos y condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Adicionar el valor del IVA (19%).",
  },
  LAVANDERIA: {
    documentCode: "R-CM-07-5",
    title: "LAVANDERIA DOTACIÓN FARMACÉUTICA",
    subtitle: "Cotización de Servicios",
    nitLabel: "NIT / C.C. / C.E. / OTRO:",
    paragraphs: [
      "En atención a su solicitud, nos permitimos presentar nuestra cotización correspondiente al servicio de lavandería de dotación farmacéutica de Sterinova, orientado al lavado y acondicionamiento de prendas y elementos utilizados en ambientes farmacéuticos y áreas que requieren condiciones especiales de procesamiento.",
      "A continuación, presentamos el alcance del servicio y las condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Precios antes de IVA (19%)",
  },
  FARMACEUTICO: {
    documentCode: "",
    title: "COTIZACIÓN FARMACÉUTICA",
    subtitle: "Cotización",
    nitLabel: "NIT / C.C. / C.E. / OTRO:",
    paragraphs: [
      "En atención a su solicitud, presentamos esta cotización para los productos y servicios farmacéuticos descritos en el detalle.",
      "A continuación, presentamos los conceptos y las condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Precios antes de IVA (19%).",
  },
  FABRICANTE: {
    documentCode: "",
    title: "COTIZACIÓN PARA FABRICANTE",
    subtitle: "Cotización",
    nitLabel: "NIT / C.C. / C.E. / OTRO:",
    paragraphs: [
      "En atención a su solicitud, presentamos esta cotización para los productos y servicios descritos en el detalle.",
      "A continuación, presentamos los conceptos y las condiciones comerciales correspondientes a su solicitud.",
    ],
    pricingNote: "Precios antes de IVA (19%).",
  },
};

export function getCotizacionPdfContent(
  tipoServicio: TipoServicioCotizacion,
): CotizacionPdfContent {
  return serviceContent[tipoServicio];
}
