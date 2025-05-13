import { ensureValidAccessToken } from "./auth";
import { QuickBooksExpense } from "../types";

/**
 * Construye la URL base para las llamadas a la API de QuickBooks
 */
const getApiBaseUrl = (
  companyId: string,
  isSandbox: boolean = true
): string => {
  const environment = isSandbox ? "sandbox" : "production";
  return `https://${environment}-quickbooks.api.intuit.com/v3/company/${companyId}`;
};

/**
 * Obtiene la lista de gastos desde QuickBooks
 */
export const fetchExpenses = async (
  companyId: string,
  fromDate?: string, // formato: 'YYYY-MM-DD'
  isSandbox: boolean = true
): Promise<QuickBooksExpense[]> => {
  const accessToken = await ensureValidAccessToken(companyId);

  if (!accessToken) {
    throw new Error("No hay un token de acceso válido");
  }

  const baseUrl = getApiBaseUrl(companyId, isSandbox);

  try {
    // Primero consultamos Purchase (compras)
    const purchasesUrl = `${baseUrl}/query`;
    let query = "SELECT * FROM Purchase";

    // Si se proporciona una fecha, filtrar por ella
    if (fromDate) {
      query += ` WHERE MetaData.LastUpdatedTime >= '${fromDate}'`;
    }

    const purchasesResponse = await fetch(
      `${purchasesUrl}?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!purchasesResponse.ok) {
      const errorData = await purchasesResponse.json();
      throw new Error(`Error al obtener compras: ${JSON.stringify(errorData)}`);
    }

    const purchasesData = await purchasesResponse.json();
    const purchases = purchasesData.QueryResponse.Purchase || [];

    // Ahora consultamos Bill (facturas de gastos)
    const billsUrl = `${baseUrl}/query`;
    let billsQuery = "SELECT * FROM Bill";

    if (fromDate) {
      billsQuery += ` WHERE MetaData.LastUpdatedTime >= '${fromDate}'`;
    }

    const billsResponse = await fetch(
      `${billsUrl}?query=${encodeURIComponent(billsQuery)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!billsResponse.ok) {
      const errorData = await billsResponse.json();
      throw new Error(
        `Error al obtener facturas: ${JSON.stringify(errorData)}`
      );
    }

    const billsData = await billsResponse.json();
    const bills = billsData.QueryResponse.Bill || [];

    // Transformamos los datos a nuestro formato QuickBooksExpense
    const allExpenses: QuickBooksExpense[] = [
      ...mapPurchasesToExpenses(purchases),
      ...mapBillsToExpenses(bills),
    ];

    return allExpenses;
  } catch (error: any) {
    console.error("Error al obtener gastos de QuickBooks:", error);
    throw new Error(`Error al obtener gastos: ${error.message}`);
  }
};

/**
 * Mapea compras de QuickBooks a nuestro formato de gastos
 */
const mapPurchasesToExpenses = (purchases: any[]): QuickBooksExpense[] => {
  return purchases.map((purchase) => {
    return {
      id: `qb-purchase-${purchase.Id}`,
      date: purchase.TxnDate,
      description:
        purchase.PrivateNote || `Compra #${purchase.DocNumber || purchase.Id}`,
      amount: purchase.TotalAmt,
      currency: purchase.CurrencyRef?.value || "USD",
      category: purchase.AccountRef?.name,
      supplier: purchase.EntityRef?.name,
      notes: purchase.PrivateNote,
      paymentMethod: purchase.PaymentType,
      sourceId: purchase.Id,
      sourceSystem: "quickbooks",
      rawData: purchase,
    };
  });
};

/**
 * Mapea facturas de gastos de QuickBooks a nuestro formato de gastos
 */
const mapBillsToExpenses = (bills: any[]): QuickBooksExpense[] => {
  return bills.map((bill) => {
    return {
      id: `qb-bill-${bill.Id}`,
      date: bill.TxnDate,
      description: bill.PrivateNote || `Factura #${bill.DocNumber || bill.Id}`,
      amount: bill.TotalAmt,
      currency: bill.CurrencyRef?.value || "USD",
      category: bill.APAccountRef?.name,
      supplier: bill.VendorRef?.name,
      notes: bill.PrivateNote,
      paymentMethod: "Factura",
      sourceId: bill.Id,
      sourceSystem: "quickbooks",
      rawData: bill,
    };
  });
};

/**
 * Obtiene los detalles de un gasto específico
 */
export const fetchExpenseById = async (
  companyId: string,
  expenseId: string,
  expenseType: "purchase" | "bill",
  isSandbox: boolean = true
): Promise<QuickBooksExpense | null> => {
  const accessToken = await ensureValidAccessToken(companyId);

  if (!accessToken) {
    throw new Error("No hay un token de acceso válido");
  }

  const baseUrl = getApiBaseUrl(companyId, isSandbox);

  try {
    // Extraer el ID real (sin el prefijo)
    const realId = expenseId.includes("-")
      ? expenseId.split("-").pop()
      : expenseId;

    if (!realId) {
      throw new Error(`ID de gasto inválido: ${expenseId}`);
    }

    const endpoint = expenseType === "purchase" ? "purchase" : "bill";
    const url = `${baseUrl}/${endpoint}/${realId}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json();
      throw new Error(
        `Error al obtener detalles del gasto: ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const item = data[endpoint.charAt(0).toUpperCase() + endpoint.slice(1)];

    if (!item) {
      return null;
    }

    // Mapear el resultado según el tipo de gasto
    if (expenseType === "purchase") {
      return mapPurchasesToExpenses([item])[0];
    } else {
      return mapBillsToExpenses([item])[0];
    }
  } catch (error: any) {
    console.error(`Error al obtener detalles del gasto ${expenseId}:`, error);
    throw new Error(`Error al obtener detalles del gasto: ${error.message}`);
  }
};
