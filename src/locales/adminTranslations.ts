export type AdminLocale = 'ru' | 'de' | 'en';

export const ADMIN_TRANSLATIONS: Record<AdminLocale, Record<string, string>> = {
  ru: {
    // Auth Page
    wms_title: "WMS Управление Складом",
    erp_subtitle: "ZAMLUXURY Enterprise ERP",
    login_label: "Выберите роль пользователя и введите пароль",
    admin_role_info: "Роль Администратора (Полный доступ):",
    employee_role_info: "Роль Сотрудника (Ограниченный):",
    password_placeholder: "Введите пароль...",
    wrong_password: "Неверный пароль. Пожалуйста, попробуйте еще раз.",
    btn_login: "Войти в систему",
    btn_back_to_shop: "Назад в магазин",

    // General Banners / Alerts
    barcode_scanned: "Штрихкод успешно отсканирован: {name} ({color})",
    barcode_not_found: "Штрихкод отсканирован ({ean}), но соответствующий товар в системе не найден.",
    invalid_stock_values: "Пожалуйста, введите корректные значения запасов.",
    stock_update_success: "Запас успешно скорректирован! ({reason})",
    stock_update_error: "Ошибка при обновлении запасов.",
    order_already_cancelled: "Этот заказ уже был отменен.",
    order_cancel_confirm: "Вы действительно хотите отменить заказ #{orderNumber} и вернуть товары на склад (+ {qty} шт.)?",
    order_cancel_success: "Заказ #{orderNumber} отменен. Запасы возвращены на склад!",
    order_cancel_error: "Ошибка при отмене заказа.",
    export_success: "Данные успешно экспортированы!",
    export_error: "Ошибка при экспорте данных.",
    import_success: "Успешно импортировано запасов для {count} товаров!",
    import_success_msg: "Обновлено вариантов товаров: {count}.",
    import_error: "В файле импорта не найдено подходящих товаров или SKU.",
    import_error_msg: "Не найдено подходящих кодов SKU или EAN.",
    import_read_error: "Ошибка при чтении CSV-файла.",
    import_format_error: "Не удалось прочитать формат файла.",
    import_invalid_file: "Пожалуйста, загрузите корректный CSV-файл.",
    low_stock_limit_changed: "Лимит предупреждений изменен на {val} шт.",

    // Header & Navigation
    user_role_admin: "Администратор",
    user_role_employee: "Сотрудник склада",
    secure_access: "Безопасный доступ к системе",
    scanner_active: "Сканер: АКТИВЕН",
    scanner_silent: "Сканер: БЕЗЗВУЧНЫЙ",
    shop_view: "Вид магазина",
    logout: "Выйти",
    main_menu: "Главное меню",
    tab_dashboard: "Панель управления",
    tab_inventory: "Склад",
    tab_orders: "Заказы",
    tab_history: "История изменений",
    tab_stats: "Статистика",
    tab_settings: "Настройки",

    // Tab 1: Dashboard - Stats Cards
    stat_total_value: "Общая стоимость запасов",
    stat_variants_count: "8 вариантов • {count} шт.",
    stat_revenue_today: "Выручка (Сегодня)",
    stat_orders_today: "{count} зак. сегодня",
    stat_low_stock: "Низкие запасы",
    stat_low_stock_limit: "Лимит: < {limit} шт.",
    stat_out_of_stock: "Нет на складе",
    stat_restock_now: "Срочно пополнить!",

    // Tab 1: Dashboard - Alarms
    critical_alarms: "Критические оповещения (<{limit})",
    action_required: "Требуется действие",
    everything_healthy: "Все запасы в порядке!",
    no_low_stock_currently: "В настоящее время нет товаров с низким уровнем запасов.",
    btn_restock_ten: "+10 Пополнить",

    // Tab 1: Dashboard - Logs
    latest_activities: "Последние операции на складе",
    btn_all_logs: "Все логи",
    no_logs_yet: "Записи в журнале отсутствуют.",
    changed_by: "Изменено:",

    // Tab 1: Dashboard - Scanner Simulator
    scanner_simulator: "Симулятор ручного сканера",
    scanner_sim_subtitle: "Симулируйте сканирование EAN-кода на кабельной катушке для мгновенного отображения запасов.",
    scan_btn_label: "Скан {sku}",

    // Tab 2: Inventory List
    search_placeholder: "Поиск по названию продукта, SKU, EAN или штрихкоду...",
    filter_all_types: "Все типы кабелей",
    filter_cable_3g15: "Кабель 3G1.5 мм²",
    filter_cable_3g25: "Кабель 3G2.5 мм²",
    filter_cable_5g25: "Кабель 5G2.5 мм²",
    filter_all_stock: "Все уровни запасов",
    filter_stock_healthy: "В норме (достаточно)",
    filter_stock_low: "Низкий уровень",
    filter_stock_out: "Нет в наличии",
    no_variants_found: "Не найдено вариантов товаров для выбранных фильтров.",
    status_healthy: "В норме",
    status_low: "Низкий запас",
    status_out: "Нет в наличии",
    col_stock_level: "Запас на складе",
    col_sold_level: "Продано",
    unit_pcs: "шт.",
    btn_edit_qty: "Количество",

    // Tab 2: Edit Quantity Modal
    modal_edit_title: "Подтвердить изменение запасов",
    modal_field_stock: "Установить запас на складе",
    modal_field_sold: "Установить продажи",
    modal_field_reason: "Причина корректировки",
    reason_manual: "Ручная корректировка",
    reason_restock: "Пополнение запасов / Поставка",
    reason_return: "Возврат",
    modal_warning_audit: "⚠️ Каждое изменение запасов полностью записывается в аудиторский журнал изменений с указанием вашего имени пользователя, времени и причины.",
    btn_cancel: "Отмена",
    btn_save: "Сохранить",

    // Tab 3: Orders List
    orders_title: "Оплата и заказы (в реальном времени)",
    orders_subtitle: "Отменяйте заказы клиентов, чтобы автоматически вернуть товары на склад.",
    tbl_order_number: "№ заказа",
    tbl_date: "Дата",
    tbl_customer: "Клиент",
    tbl_qty: "Кол-во",
    tbl_total: "Сумма",
    tbl_status: "Статус",
    tbl_action: "Действие",
    no_orders_yet: "Заказов пока не зарегистрировано.",
    status_paid: "Оплачен",
    status_cancelled: "Отменен",
    btn_details: "Детали",

    // Tab 3: Order Details Modal
    order_details_title: "Данные заказа: {orderNumber}",
    customer_label: "Получатель",
    system_interface: "Интерфейс",
    payment_method: "Способ оплаты:",
    customer_email: "E-Mail:",
    customer_phone: "Тел:",
    not_provided: "Не указан",
    purchased_items: "Купленные товары",
    property_color: "Цвет:",
    property_length: "Длина:",
    total_with_vat: "Итоговая сумма (вкл. НДС)",
    btn_cancel_order: "Отменить заказ и вернуть товары на склад",
    order_already_restored: "Заказ отменен, товары возвращены на склад",
    only_admins_can_cancel: "🔒 Только администраторы могут отменять заказы.",

    // Tab 4: Audit Logs
    audit_title: "База ревизий и аудит-логи",
    audit_subtitle: "Полный, защищенный от изменений журнал всех складских движений.",
    tbl_timestamp: "Время",
    tbl_product: "Товар",
    tbl_variant: "Вариант",
    tbl_change: "Изменение",
    tbl_stock_diff: "Запас Было → Стало",
    tbl_reason: "Причина",
    tbl_user: "Пользователь",
    no_activities_yet: "История складских операций пуста.",
    log_sale: "Продажа",
    log_restock: "Поставка",
    log_return: "Возврат",

    // Tab 5: Stats & Analytics
    stats_bestselling: "Самые продаваемые товары (по вариантам)",
    stats_sold_count: "{count} продано",
    stats_distribution: "Сравнение текущих запасов",
    stats_turnover_title: "Оборачиваемость запасов (неходовые товары)",
    stats_turnover_subtitle: "Варианты с большими запасами при низких продажах. Связывают лишний капитал.",
    turnover_slow: "Неходовой товар",
    turnover_fast: "Ходовой товар",
    turnover_ratio: "Коэффициент оборачиваемости:",

    // Tab 6: Import & Export CSV
    import_export_title: "Импорт и экспорт данных запасов",
    import_export_subtitle: "Автоматизируйте ведение запасов путем сверки CSV-данных в формате Excel.",
    csv_drop_zone_title: "Перетащите сюда таблицу CSV",
    csv_drop_zone_subtitle: "или нажмите для ручного выбора файла на компьютере",
    btn_select_file: "Выбрать файл",
    csv_spec_title: "💡 Спецификация формата CSV (заголовки и столбцы):",
    csv_spec_subtitle: "Файл должен быть в следующем формате (разделитель - запятая или точка с запятой):",
    btn_export_csv: "Экспортировать запасы в CSV",
    settings_title: "Системные настройки и лимиты",
    settings_low_stock_label: "Установить лимит для предупреждения «Низкий запас»",

    // Language switcher tooltip
    lang_switcher: "Язык интерфейса"
  },
  de: {
    // Auth Page
    wms_title: "WMS Lagerverwaltung",
    erp_subtitle: "ZAMLUXURY Enterprise ERP",
    login_label: "Benutzerrolle wählen & Passwort eingeben",
    admin_role_info: "Admin-Rolle (Voller Zugriff):",
    employee_role_info: "Mitarbeiter-Rolle (Eingeschränkt):",
    password_placeholder: "Passwort eingeben...",
    wrong_password: "Falsches Passwort. Bitte versuchen Sie es erneut.",
    btn_login: "System Anmelden",
    btn_back_to_shop: "Zurück zum Shop",

    // General Banners / Alerts
    barcode_scanned: "Barcode erfolgreich gescannt: {name} ({color})",
    barcode_not_found: "Barcode gescannt ({ean}), aber kein passendes Produkt im System gefunden.",
    invalid_stock_values: "Bitte geben Sie gültige Bestandswerte ein.",
    stock_update_success: "Lagerbestand erfolgreich angepasst! ({reason})",
    stock_update_error: "Fehler beim Aktualisieren des Lagerbestands.",
    order_already_cancelled: "Diese Bestellung wurde bereits storniert.",
    order_cancel_confirm: "Möchten Sie die Bestellung #{orderNumber} wirklich stornieren und den Lagerbestand (+ {qty} Einheiten) zurückbuchen?",
    order_cancel_success: "Bestellung #{orderNumber} storniert. Lagerbestand zurückgebucht!",
    order_cancel_error: "Fehler beim Stornieren der Bestellung.",
    export_success: "Daten erfolgreich exportiert!",
    export_error: "Fehler beim Exportieren der Daten.",
    import_success: "{count} Bestände erfolgreich importiert!",
    import_success_msg: "{count} Produkt-Varianten wurden aktualisiert.",
    import_error: "Keine passenden Produkte/SKUs im Import-Dokument gefunden.",
    import_error_msg: "Keine passenden SKU/EAN Codes gefunden.",
    import_read_error: "Fehler beim Einlesen der CSV-Datei.",
    import_format_error: "Dateiformat konnte nicht gelesen werden.",
    import_invalid_file: "Bitte laden Sie eine gültige CSV-Datei hoch.",
    low_stock_limit_changed: "Grenzwert für Warnungen auf {val} Stk. geändert.",

    // Header & Navigation
    user_role_admin: "Administrator",
    user_role_employee: "Lager-Mitarbeiter",
    secure_access: "Sicherer Systemzugriff",
    scanner_active: "Scanner: AKTIV",
    scanner_silent: "Scanner: STUMM",
    shop_view: "Shop-Ansicht",
    logout: "Abmelden",
    main_menu: "Hauptmenü",
    tab_dashboard: "Dashboard",
    tab_inventory: "Bestand",
    tab_orders: "Bestellungen",
    tab_history: "Verlauf (Logs)",
    tab_stats: "Statistik",
    tab_settings: "Konfiguration",

    // Tab 1: Dashboard - Stats Cards
    stat_total_value: "Gesamtbestand Wert",
    stat_variants_count: "8 Varianten • {count} Stück",
    stat_revenue_today: "Umsatz (Heute)",
    stat_orders_today: "{count} Bestellungen heute",
    stat_low_stock: "Niedriger Bestand",
    stat_low_stock_limit: "Grenze: < {limit} Einheiten",
    stat_out_of_stock: "Ausverkauft",
    stat_restock_now: "Bestand sofort aufüllen!",

    // Tab 1: Dashboard - Alarms
    critical_alarms: "Kritische Alarme (<{limit})",
    action_required: "Aktion erforderlich",
    everything_healthy: "Alles gesund!",
    no_low_stock_currently: "Aktuell liegen keine niedrigen Bestände vor.",
    btn_restock_ten: "+10 Aufbuchen",

    // Tab 1: Dashboard - Logs
    latest_activities: "Letzte Lageraktivitäten",
    btn_all_logs: "Alle Logs",
    no_logs_yet: "Noch keine Logbucheinträge vorhanden.",
    changed_by: "Geändert von:",

    // Tab 1: Dashboard - Scanner Simulator
    scanner_simulator: "Hand-Scanner Simulator",
    scanner_sim_subtitle: "Simulieren Sie das Scannen eines EAN-Codes auf der Kabeltrommel, um den Bestand sofort aufzurufen.",
    scan_btn_label: "Scan {sku}",

    // Tab 2: Inventory List
    search_placeholder: "Suche nach Produktname, SKU, EAN oder Barcode...",
    filter_all_types: "Alle Kabeltypen",
    filter_cable_3g15: "3G1.5 mm² Kabel",
    filter_cable_3g25: "3G2.5 mm² Kabel",
    filter_cable_5g25: "5G2.5 mm² Kabel",
    filter_all_stock: "Alle Bestände",
    filter_stock_healthy: "Gesund (Ausreichend)",
    filter_stock_low: "Niedriger Bestand",
    filter_stock_out: "Ausverkauft",
    no_variants_found: "Keine Produkt-Varianten für die gewählten Filter gefunden.",
    status_healthy: "Gesund",
    status_low: "Niedriger Bestand",
    status_out: "Ausverkauft",
    col_stock_level: "Lagerbestand",
    col_sold_level: "Verkauft",
    unit_pcs: "Stk.",
    btn_edit_qty: "Menge editieren",

    // Tab 2: Edit Quantity Modal
    modal_edit_title: "Bestandsänderung bestätigen",
    modal_field_stock: "Lagerbestand einstellen",
    modal_field_sold: "Verkaufsanzahl einstellen",
    modal_field_reason: "Grund der Anpassung",
    reason_manual: "Manuelle Anpassung",
    reason_restock: "Nachbestellung / Restock",
    reason_return: "Retoure / Rückgabe",
    modal_warning_audit: "⚠️ Jede Bestandsänderung wird lückenlos in der Revisionsdatenbank (Audit Logs) mit Ihrem Benutzernamen, Uhrzeit und dem Grund gespeichert.",
    btn_cancel: "Abbrechen",
    btn_save: "Speichern",

    // Tab 3: Orders List
    orders_title: "Zahlungen & Bestellungen (Echtzeit)",
    orders_subtitle: "Stornieren Sie Kundenbestellungen, um den Lagerbestand automatisch wieder einzubuchen.",
    tbl_order_number: "Bestell-Nr.",
    tbl_date: "Datum",
    tbl_customer: "Kunde",
    tbl_qty: "Menge",
    tbl_total: "Gesamtsumme",
    tbl_status: "Status",
    tbl_action: "Aktion",
    no_orders_yet: "Bisher wurden keine Bestellungen registriert.",
    status_paid: "Bezahlt",
    status_cancelled: "Storniert",
    btn_details: "Details",

    // Tab 3: Order Details Modal
    order_details_title: "Bestelldaten: {orderNumber}",
    customer_label: "Empfänger",
    system_interface: "Schnittstelle",
    payment_method: "Zahlungsweise:",
    customer_email: "E-Mail:",
    customer_phone: "Tel:",
    not_provided: "Nicht angegeben",
    purchased_items: "Gekaufte Artikel",
    property_color: "Eigenschaft:",
    property_length: "Länge:",
    total_with_vat: "Gesamtsumme inkl. MwSt.",
    btn_cancel_order: "Bestellung stornieren & Bestand zurückbuchen",
    order_already_restored: "Bestellung storniert & zurückgebucht",
    only_admins_can_cancel: "🔒 Nur Administratoren können Bestellungen stornieren.",

    // Tab 4: Audit Logs
    audit_title: "Revisionsdatenbank & Audit Logs",
    audit_subtitle: "Vollständiger revisionssicherer Tätigkeitsnachweis aller Lagerbewegungen.",
    tbl_timestamp: "Zeitstempel",
    tbl_product: "Produkt",
    tbl_variant: "Variante",
    tbl_change: "Veränderung",
    tbl_stock_diff: "Bestand Alt → Neu",
    tbl_reason: "Grund",
    tbl_user: "Benutzer",
    no_activities_yet: "Es wurden bisher keine Lageraktivitäten protokolliert.",
    log_sale: "Verkauf",
    log_restock: "Restock",
    log_return: "Retoure",

    // Tab 5: Stats & Analytics
    stats_bestselling: "Meistverkaufte Produkte (Variantenebene)",
    stats_sold_count: "{count} verkauft",
    stats_distribution: "Aktueller Lagerbestand im Vergleich",
    stats_turnover_title: "Lagerumschlagshäufigkeit (Slow-Moving Stock)",
    stats_turnover_subtitle: "Varianten mit hohen Lagerbeständen bei niedrigen Verkaufszahlen. Binden unnötiges Kapital.",
    turnover_slow: "Ladenhüter",
    turnover_fast: "Schnelldreher",
    turnover_ratio: "Umschlags-Verhältnis:",

    // Tab 6: Import & Export CSV
    import_export_title: "Bestandsdaten Import & Export",
    import_export_subtitle: "Automatisieren Sie die Lagerbestandspflege per CSV-Datenabgleich im Excel-Format.",
    csv_drop_zone_title: "CSV-Tabelle hier hineinziehen",
    csv_drop_zone_subtitle: "oder klicken Sie, um die Datei manuell auf Ihrem Computer auszuwählen",
    btn_select_file: "Datei auswählen",
    csv_spec_title: "💡 CSV-Format Spezifikation (Header & Spalten):",
    csv_spec_subtitle: "Die Datei muss folgendes Format aufweisen (Komma- oder Semikolon-separiert):",
    btn_export_csv: "Bestand als CSV exportieren",
    settings_title: "Systemeinstellungen & Grenzwerte",
    settings_low_stock_label: "Grenzwert für Warnung \"Niedriger Bestand\" einstellen",

    // Language switcher tooltip
    lang_switcher: "Sprache"
  },
  en: {
    // Auth Page
    wms_title: "WMS Inventory Management",
    erp_subtitle: "ZAMLUXURY Enterprise ERP",
    login_label: "Select User Role & Enter Password",
    admin_role_info: "Admin Role (Full Access):",
    employee_role_info: "Employee Role (Restricted):",
    password_placeholder: "Enter password...",
    wrong_password: "Wrong password. Please try again.",
    btn_login: "Log In",
    btn_back_to_shop: "Back to Shop",

    // General Banners / Alerts
    barcode_scanned: "Barcode scanned successfully: {name} ({color})",
    barcode_not_found: "Barcode scanned ({ean}), but no matching product found in system.",
    invalid_stock_values: "Please enter valid stock values.",
    stock_update_success: "Inventory stock adjusted successfully! ({reason})",
    stock_update_error: "Error updating inventory stock.",
    order_already_cancelled: "This order has already been cancelled.",
    order_cancel_confirm: "Are you sure you want to cancel order #{orderNumber} and restock items (+ {qty} units)?",
    order_cancel_success: "Order #{orderNumber} cancelled. Inventory restocked!",
    order_cancel_error: "Error cancelling order.",
    export_success: "Data successfully exported!",
    export_error: "Error exporting data.",
    import_success: "{count} stocks successfully imported!",
    import_success_msg: "{count} product variants have been updated.",
    import_error: "No matching products/SKUs found in the import document.",
    import_error_msg: "No matching SKU/EAN codes found.",
    import_read_error: "Error reading the CSV file.",
    import_format_error: "File format could not be read.",
    import_invalid_file: "Please upload a valid CSV file.",
    low_stock_limit_changed: "Alert threshold changed to {val} pcs.",

    // Header & Navigation
    user_role_admin: "Administrator",
    user_role_employee: "Warehouse Employee",
    secure_access: "Secure System Access",
    scanner_active: "Scanner: ACTIVE",
    scanner_silent: "Scanner: MUTED",
    shop_view: "Shop View",
    logout: "Log Out",
    main_menu: "Main Menu",
    tab_dashboard: "Dashboard",
    tab_inventory: "Stock",
    tab_orders: "Orders",
    tab_history: "Audit Logs",
    tab_stats: "Statistics",
    tab_settings: "Configuration",

    // Tab 1: Dashboard - Stats Cards
    stat_total_value: "Total Stock Value",
    stat_variants_count: "8 variants • {count} pcs",
    stat_revenue_today: "Revenue (Today)",
    stat_orders_today: "{count} orders today",
    stat_low_stock: "Low Stock Items",
    stat_low_stock_limit: "Limit: < {limit} units",
    stat_out_of_stock: "Out of Stock",
    stat_restock_now: "Restock immediately!",

    // Tab 1: Dashboard - Alarms
    critical_alarms: "Critical Alerts (<{limit})",
    action_required: "Action Required",
    everything_healthy: "Everything is healthy!",
    no_low_stock_currently: "There are currently no low-stock products.",
    btn_restock_ten: "+10 Restock",

    // Tab 1: Dashboard - Logs
    latest_activities: "Recent Stock Activities",
    btn_all_logs: "All Logs",
    no_logs_yet: "No activity logs available.",
    changed_by: "Changed by:",

    // Tab 1: Dashboard - Scanner Simulator
    scanner_simulator: "Handheld Scanner Simulator",
    scanner_sim_subtitle: "Simulate scanning an EAN barcode on a cable spool to quickly pull up stock levels.",
    scan_btn_label: "Scan {sku}",

    // Tab 2: Inventory List
    search_placeholder: "Search for product name, SKU, EAN or barcode...",
    filter_all_types: "All Cable Types",
    filter_cable_3g15: "3G1.5 mm² Cable",
    filter_cable_3g25: "3G2.5 mm² Cable",
    filter_cable_5g25: "5G2.5 mm² Cable",
    filter_all_stock: "All Stock Levels",
    filter_stock_healthy: "Healthy (Sufficient)",
    filter_stock_low: "Low Stock",
    filter_stock_out: "Out of Stock",
    no_variants_found: "No product variants found matching the selected filters.",
    status_healthy: "Healthy",
    status_low: "Low Stock",
    status_out: "Out of Stock",
    col_stock_level: "Stock Level",
    col_sold_level: "Sold",
    unit_pcs: "pcs",
    btn_edit_qty: "Edit Qty",

    // Tab 2: Edit Quantity Modal
    modal_edit_title: "Confirm Stock Adjustment",
    modal_field_stock: "Set Warehouse Stock",
    modal_field_sold: "Set Sold Qty",
    modal_field_reason: "Reason for Adjustment",
    reason_manual: "Manual Adjustment",
    reason_restock: "Reorder / Restock",
    reason_return: "Return / Refund",
    modal_warning_audit: "⚠️ Every stock change is recorded in full inside the audit database with your username, timestamp and reason.",
    btn_cancel: "Cancel",
    btn_save: "Save",

    // Tab 3: Orders List
    orders_title: "Payments & Orders (Real-time)",
    orders_subtitle: "Cancel customer orders to automatically restock items back to the warehouse.",
    tbl_order_number: "Order No.",
    tbl_date: "Date",
    tbl_customer: "Customer",
    tbl_qty: "Qty",
    tbl_total: "Total",
    tbl_status: "Status",
    tbl_action: "Action",
    no_orders_yet: "No orders have been registered yet.",
    status_paid: "Paid",
    status_cancelled: "Cancelled",
    btn_details: "Details",

    // Tab 3: Order Details Modal
    order_details_title: "Order Details: {orderNumber}",
    customer_label: "Recipient",
    system_interface: "System Interface",
    payment_method: "Payment Method:",
    customer_email: "E-Mail:",
    customer_phone: "Phone:",
    not_provided: "Not provided",
    purchased_items: "Purchased Items",
    property_color: "Color:",
    property_length: "Length:",
    total_with_vat: "Total sum incl. VAT",
    btn_cancel_order: "Cancel Order & Refund Stock",
    order_already_restored: "Order cancelled & items restocked",
    only_admins_can_cancel: "🔒 Only Administrators can cancel orders.",

    // Tab 4: Audit Logs
    audit_title: "Revision Database & Audit Logs",
    audit_subtitle: "Complete revision-secure audit history of all inventory movements.",
    tbl_timestamp: "Timestamp",
    tbl_product: "Product",
    tbl_variant: "Variant",
    tbl_change: "Change",
    tbl_stock_diff: "Stock Prev → New",
    tbl_reason: "Reason",
    tbl_user: "User",
    no_activities_yet: "No inventory activities have been logged yet.",
    log_sale: "Sale",
    log_restock: "Restock",
    log_return: "Return",

    // Tab 5: Stats & Analytics
    stats_bestselling: "Best Selling Products (by Variant)",
    stats_sold_count: "{count} sold",
    stats_distribution: "Current Inventory Comparison",
    stats_turnover_title: "Inventory Turnover (Slow-Moving Stock)",
    stats_turnover_subtitle: "Variants with high stocks and low sales which tie up unnecessary capital.",
    turnover_slow: "Slow Mover",
    turnover_fast: "Fast Mover",
    turnover_ratio: "Turnover Ratio:",

    // Tab 6: Import & Export CSV
    import_export_title: "Inventory Import & Export",
    import_export_subtitle: "Automate inventory maintenance using CSV data matching in Excel format.",
    csv_drop_zone_title: "Drag and drop CSV table here",
    csv_drop_zone_subtitle: "or click to select file manually on your computer",
    btn_select_file: "Select File",
    csv_spec_title: "💡 CSV Format Specification (Header & Columns):",
    csv_spec_subtitle: "The file must have the following format (comma or semicolon separated):",
    btn_export_csv: "Export Inventory as CSV",
    settings_title: "System Settings & Thresholds",
    settings_low_stock_label: "Set low stock warning threshold threshold",

    // Language switcher tooltip
    lang_switcher: "Language"
  }
};

export function translate(locale: AdminLocale, key: string, params?: Record<string, string | number>): string {
  const dictionary = ADMIN_TRANSLATIONS[locale] || ADMIN_TRANSLATIONS['ru'];
  let text = dictionary[key] || ADMIN_TRANSLATIONS['ru'][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
    });
  }
  return text;
}

export function formatAdminDate(locale: AdminLocale, firebaseTimestamp: any): string {
  if (!firebaseTimestamp) return '--:--';
  const date = firebaseTimestamp.toDate ? firebaseTimestamp.toDate() : new Date(firebaseTimestamp);
  
  const localeStr = locale === 'ru' ? 'ru-RU' : locale === 'de' ? 'de-DE' : 'en-US';
  return date.toLocaleString(localeStr, {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

