/**
 * Enumerare pentru tipurile de permisiuni contabile
 */
export enum AccountingPermission {
  // Permisiuni generale
  VIEW_DASHBOARD = "view_dashboard",
  
  // Permisiuni pentru facturi
  VIEW_INVOICES = "view_invoices",
  CREATE_INVOICE = "create_invoice",
  EDIT_INVOICE = "edit_invoice",
  DELETE_INVOICE = "delete_invoice",
  APPROVE_INVOICE = "approve_invoice",
  
  // Permisiuni pentru tranzacții
  VIEW_TRANSACTIONS = "view_transactions",
  CREATE_TRANSACTION = "create_transaction",
  EDIT_TRANSACTION = "edit_transaction",
  DELETE_TRANSACTION = "delete_transaction",
  APPROVE_TRANSACTION = "approve_transaction",
  
  // Permisiuni pentru rapoarte
  VIEW_REPORTS = "view_reports",
  CREATE_REPORT = "create_report",
  EXPORT_REPORTS = "export_reports",
  
  // Permisiuni administrative
  MANAGE_SETTINGS = "manage_settings",
  MANAGE_PERMISSIONS = "manage_permissions",
  VIEW_SENSITIVE_DATA = "view_sensitive_data",
}

/**
 * Funcție pentru a obține permisiunile bazate pe roluri
 * @param isAdmin - Dacă utilizatorul este admin
 * @param isAccountant - Dacă utilizatorul este contabil
 */
export function getAccountingPermissions(isAdmin: boolean, isAccountant: boolean): Set<AccountingPermission> {
  const permissions = new Set<AccountingPermission>();
  
  // Permisiuni de bază pentru contabili
  if (isAccountant || isAdmin) {
    permissions.add(AccountingPermission.VIEW_DASHBOARD);
    
    // Facturi
    permissions.add(AccountingPermission.VIEW_INVOICES);
    permissions.add(AccountingPermission.CREATE_INVOICE);
    permissions.add(AccountingPermission.EDIT_INVOICE);
    
    // Tranzacții
    permissions.add(AccountingPermission.VIEW_TRANSACTIONS);
    permissions.add(AccountingPermission.CREATE_TRANSACTION);
    permissions.add(AccountingPermission.EDIT_TRANSACTION);
    
    // Rapoarte
    permissions.add(AccountingPermission.VIEW_REPORTS);
    permissions.add(AccountingPermission.CREATE_REPORT);
    permissions.add(AccountingPermission.EXPORT_REPORTS);
  }
  
  // Permisiuni exclusive pentru administratori
  if (isAdmin) {
    // Facturi
    permissions.add(AccountingPermission.DELETE_INVOICE);
    permissions.add(AccountingPermission.APPROVE_INVOICE);
    
    // Tranzacții
    permissions.add(AccountingPermission.DELETE_TRANSACTION);
    permissions.add(AccountingPermission.APPROVE_TRANSACTION);
    
    // Administrative
    permissions.add(AccountingPermission.MANAGE_SETTINGS);
    permissions.add(AccountingPermission.MANAGE_PERMISSIONS);
    permissions.add(AccountingPermission.VIEW_SENSITIVE_DATA);
  }
  
  return permissions;
}

/**
 * Funcție pentru a verifica dacă un utilizator are o permisiune specifică
 * @param permissions - Setul de permisiuni al utilizatorului
 * @param permission - Permisiunea care trebuie verificată
 */
export function hasPermission(
  permissions: Set<AccountingPermission>, 
  permission: AccountingPermission
): boolean {
  return permissions.has(permission);
}