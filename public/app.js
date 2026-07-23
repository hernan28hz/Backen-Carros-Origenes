const STATUS_META = {
  AVAILABLE: { label: "Disponible", className: "available" },
  REGISTERED: { label: "En servicio", className: "service" },
  IN_MAINTENANCE: { label: "En mantenimiento", className: "maintenance" },
  OUT_OF_SERVICE: { label: "Fuera de servicio", className: "service" },
  SOLD: { label: "Vendido", className: "neutral" },
};

const APP_NAME = "GRUPO W LOGIST";
const STORAGE_KEYS = {
  token: "grupowlogist_token",
  user: "grupowlogist_user",
  legacyToken: "fleet_token",
  legacyUser: "fleet_user",
};
const PRIMARY_ADMIN_ID = "adminWlogit01";
const PRIMARY_ADMIN_IDS = [PRIMARY_ADMIN_ID, "admin-origenes-001"];
const PRIMARY_ADMIN_EMAILS = ["admin01@grupowlogist.com", "admin@grupowlogist.com", "admin@origenesfleet.com"];

const SIDEBAR_ICONS = {
  home: iconSvg(
    '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>'
  ),
  catalog: iconSvg(
    '<path d="M5 16l1.5-4.5A2 2 0 0 1 8.4 10h7.2a2 2 0 0 1 1.9 1.5L19 16"/><path d="M4 16h16v3a1 1 0 0 1-1 1h-1.5a1.5 1.5 0 0 1-1.5-1.5V18h-8v.5A1.5 1.5 0 0 1 6.5 20H5a1 1 0 0 1-1-1v-3Z"/><circle cx="7.5" cy="16.5" r="1"/><circle cx="16.5" cy="16.5" r="1"/>'
  ),
  login: iconSvg(
    '<path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/>'
  ),
  dashboard: iconSvg(
    '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>'
  ),
  operators: iconSvg(
    '<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
  ),
  profile: iconSvg(
    '<path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="8" r="4"/>'
  ),
  messages: iconSvg(
    '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"/><path d="M8 9h8"/><path d="M8 13h5"/>'
  ),
  finance: iconSvg(
    '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/>'
  ),
  logout: iconSvg(
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/>'
  ),
};

const SIDEBAR_LINKS = {
  PUBLIC: [
    { route: "/", label: "Inicio", icon: SIDEBAR_ICONS.home, matches: ["home"] },
    { route: "/catalogo", label: "Catalogo", icon: SIDEBAR_ICONS.catalog, matches: ["catalog"] },
    { route: "/login", label: "Iniciar sesion", icon: SIDEBAR_ICONS.login, matches: ["login"] },
  ],
  DIRECTOR: [
    { route: "/catalogo", label: "Catalogo", icon: SIDEBAR_ICONS.catalog, matches: ["catalog"] },
    { route: "/admin/operadores", label: "Usuarios", icon: SIDEBAR_ICONS.operators, matches: ["adminOperators"] },
    { route: "/perfil", label: "Perfil", icon: SIDEBAR_ICONS.profile, matches: ["profile"] },
  ],
  GERENTE: [
    { route: "/catalogo", label: "Catalogo", icon: SIDEBAR_ICONS.catalog, matches: ["catalog"] },
    { route: "/finanzas", label: "Finanzas", icon: SIDEBAR_ICONS.finance, matches: ["finance"] },
    { route: "/admin/operadores", label: "Usuarios", icon: SIDEBAR_ICONS.operators, matches: ["adminOperators"] },
    { route: "/perfil", label: "Perfil", icon: SIDEBAR_ICONS.profile, matches: ["profile"] },
  ],
  ADMIN: [
    { route: "/catalogo", label: "Catalogo", icon: SIDEBAR_ICONS.catalog, matches: ["catalog"] },
    { route: "/dashboard", label: "Panel", icon: SIDEBAR_ICONS.dashboard, matches: ["dashboard"] },
    { route: "/finanzas", label: "Finanzas", icon: SIDEBAR_ICONS.finance, matches: ["finance"] },
    { route: "/admin/operadores", label: "Usuarios", icon: SIDEBAR_ICONS.operators, matches: ["adminOperators"] },
    { route: "/admin/mensajes", label: "Mensajes", icon: SIDEBAR_ICONS.messages, matches: ["adminMessages"] },
    { route: "/perfil", label: "Perfil", icon: SIDEBAR_ICONS.profile, matches: ["profile"] },
  ],
};

const state = {
  token: localStorage.getItem(STORAGE_KEYS.token) || localStorage.getItem(STORAGE_KEYS.legacyToken) || "",
  user: readJson(STORAGE_KEYS.user) || readJson(STORAGE_KEYS.legacyUser),
  catalogVehicles: [],
  publicCatalogLoaded: false,
  publicCatalogLoadedAt: 0,
  publicCatalogError: "",
  privateVehicles: [],
  operators: [],
  administrators: [],
  financeRecords: [],
  financeSummary: { income: 0, expenses: 0, balance: 0, byType: {} },
  sidebarCollapsed: localStorage.getItem("sidebar_collapsed") === "true",
  mobileSidebarOpen: false,
  systemMessages: readJson("admin_system_messages") || [],
  apiHealthy: false,
  refreshTimers: {
    intervalId: null,
    visibilityTimeoutId: null,
  },
  refreshLocks: {
    publicCatalog: false,
    privateVehicles: false,
    operators: false,
    finance: false,
    activeView: false,
  },
  pullToRefresh: {
    startY: 0,
    distance: 0,
    armed: false,
    active: false,
    refreshing: false,
  },
  profileEmailCooldownTimer: null,
};

const elements = {
  appShell: document.getElementById("appShell"),
  loginForm: document.getElementById("loginForm"),
  publicStatusFilter: document.getElementById("publicStatusFilter"),
  refreshCatalogButton: document.getElementById("refreshCatalogButton"),
  publicCatalogGrid: document.getElementById("publicCatalogGrid"),
  catalogSummary: document.getElementById("catalogSummary"),
  catalogOverviewStats: document.getElementById("catalogOverviewStats"),
  catalogDonutChart: document.getElementById("catalogDonutChart"),
  catalogDonutTotal: document.getElementById("catalogDonutTotal"),
  catalogStatusViz: document.getElementById("catalogStatusViz"),
  homeSummary: document.getElementById("homeSummary"),
  homeCatalogPreview: document.getElementById("homeCatalogPreview"),
  homePublicCount: document.getElementById("homePublicCount"),
  homeApiMetric: document.getElementById("homeApiMetric"),
  apiStatusBadge: document.getElementById("apiStatusBadge"),
  authShortcutButton: document.getElementById("authShortcutButton"),
  mobileSidebarButton: document.getElementById("mobileSidebarButton"),
  mobileSidebarBackdrop: document.getElementById("mobileSidebarBackdrop"),
  sidebar: document.getElementById("sidebar"),
  sidebarNav: document.getElementById("sidebarNav"),
  sidebarRoleBadge: document.getElementById("sidebarRoleBadge"),
  sidebarUserCard: document.getElementById("sidebarUserCard"),
  sidebarUserAvatar: document.getElementById("sidebarUserAvatar"),
  sidebarUserName: document.getElementById("sidebarUserName"),
  sidebarUserMeta: document.getElementById("sidebarUserMeta"),
  sidebarLogoutButton: document.getElementById("sidebarLogoutButton"),
  sidebarToggleButton: document.getElementById("sidebarToggleButton"),
  sidebarBrandKicker: document.getElementById("sidebarBrandKicker"),
  sidebarBrandTitle: document.getElementById("sidebarBrandTitle"),
  sidebarSectionLabel: document.getElementById("sidebarSectionLabel"),
  topbarMenuButton: document.getElementById("topbarMenuButton"),
  pageKicker: document.getElementById("pageKicker"),
  pageTitle: document.getElementById("pageTitle"),
  dashboardVehiclesList: document.getElementById("dashboardVehiclesList"),
  privateStatusFilter: document.getElementById("privateStatusFilter"),
  refreshVehiclesButton: document.getElementById("refreshVehiclesButton"),
  privateVehiclesGrid: document.getElementById("privateVehiclesGrid"),
  vehicleRouteContent: document.getElementById("vehicleRouteContent"),
  refreshOperatorsButton: document.getElementById("refreshOperatorsButton"),
  operatorsList: document.getElementById("operatorsList"),
  administratorsSection: document.getElementById("administratorsSection"),
  administratorsList: document.getElementById("administratorsList"),
  userForm: document.getElementById("userForm"),
  vehicleForm: document.getElementById("vehicleForm"),
  profileContent: document.getElementById("profileContent"),
  adminMessagesList: document.getElementById("adminMessagesList"),
  clearAdminMessagesButton: document.getElementById("clearAdminMessagesButton"),
  financePage: document.getElementById("financePage"),
  financeForm: document.getElementById("financeForm"),
  financeList: document.getElementById("financeList"),
  financeSummary: document.getElementById("financeSummary"),
  refreshFinanceButton: document.getElementById("refreshFinanceButton"),
  publicVehicleCardTemplate: document.getElementById("publicVehicleCardTemplate"),
  privateVehicleItemTemplate: document.getElementById("privateVehicleItemTemplate"),
  operatorItemTemplate: document.getElementById("operatorItemTemplate"),
  loginPage: document.getElementById("loginPage"),
  homePage: document.getElementById("homePage"),
  catalogPage: document.getElementById("catalogPage"),
  dashboardPage: document.getElementById("dashboardPage"),
  adminVehiclesPage: document.getElementById("adminVehiclesPage"),
  vehiclePage: document.getElementById("vehiclePage"),
  adminOperatorsPage: document.getElementById("adminOperatorsPage"),
  profilePage: document.getElementById("profilePage"),
  adminMessagesPage: document.getElementById("adminMessagesPage"),
  actionsPanel: document.getElementById("actionsPanel"),
  toastContainer: document.getElementById("toastContainer"),
  pullToRefreshIndicator: document.getElementById("pullToRefreshIndicator"),
  pullToRefreshLabel: document.getElementById("pullToRefreshLabel"),
};

boot();

function boot() {
  bindEvents();
  applySidebarState();
  setupRealtimeRefresh();
  setupPullToRefresh();
  checkHealth();
  loadPublicCatalog();
  if (state.token && state.user) {
    loadPrivateData();
  }
  renderCurrentRoute();
}

function bindEvents() {
  document.addEventListener("click", handleDocumentClick);
  window.addEventListener("focus", handleWindowFocus);
  window.addEventListener("popstate", renderCurrentRoute);
  window.addEventListener("pageshow", handlePageShow);
  window.addEventListener("resize", handleWindowResize);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  elements.loginForm.addEventListener("submit", handleLogin);
  elements.publicStatusFilter.addEventListener("change", () => renderCurrentRoute());
  elements.refreshCatalogButton.addEventListener("click", () => loadPublicCatalog({ force: true }));
  elements.authShortcutButton.addEventListener("click", handleAuthShortcut);
  elements.sidebarLogoutButton.addEventListener("click", handleLogout);
  elements.sidebarToggleButton.addEventListener("click", toggleSidebar);
  elements.topbarMenuButton.addEventListener("click", toggleSidebar);
  elements.mobileSidebarButton.addEventListener("click", toggleMobileSidebar);
  elements.mobileSidebarBackdrop.addEventListener("click", closeMobileSidebar);
  elements.refreshVehiclesButton.addEventListener("click", loadPrivateVehicles);
  elements.refreshOperatorsButton.addEventListener("click", () => {
    Promise.all([loadOperators(), loadAdministrators()]);
  });
  elements.userForm.addEventListener("submit", handleCreateUser);
  elements.vehicleForm.addEventListener("submit", handleCreateVehicle);
  elements.refreshFinanceButton.addEventListener("click", () => loadFinanceData({ force: true }));
  elements.financeForm.addEventListener("submit", handleCreateFinanceRecord);
  elements.clearAdminMessagesButton.addEventListener("click", () => {
    state.systemMessages = [];
    persistMessages();
    renderAdminMessages();
  });
}

function handleDocumentClick(event) {
  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    navigate(routeButton.dataset.route);
    closeMobileSidebar();
    return;
  }

  const publicVehicleButton = event.target.closest("[data-public-vehicle]");
  if (publicVehicleButton) {
    const vehicleId = publicVehicleButton.dataset.publicVehicle;
    if (!state.token) {
      navigate("/login");
      closeMobileSidebar();
      pushToast("info", "Inicia sesion para ver el detalle del vehiculo.");
      return;
    }
    navigate(`/vehiculo/${vehicleId}`);
    return;
  }

  const privateVehicleButton = event.target.closest("[data-private-vehicle]");
  if (privateVehicleButton) {
    const vehicleId = privateVehicleButton.dataset.privateVehicle;
    navigate(`/vehiculo/${vehicleId}`);
    return;
  }

  const editVehicleButton = event.target.closest("[data-edit-vehicle]");
  if (editVehicleButton) {
    const vehicleId = editVehicleButton.dataset.editVehicle;
    if (!vehicleId) return;
    navigate(`/vehiculo/${vehicleId}/editar`);
    return;
  }

  const deleteVehicleButton = event.target.closest("[data-delete-vehicle]");
  if (deleteVehicleButton) {
    handleDeleteVehicle(deleteVehicleButton.dataset.deleteVehicle);
    return;
  }

  const deleteOperatorButton = event.target.closest("[data-delete-operator]");
  if (deleteOperatorButton) {
    handleDeleteOperator(deleteOperatorButton.dataset.deleteOperator);
    return;
  }

  const editUserButton = event.target.closest("[data-edit-user]");
  if (editUserButton) {
    handleEditUser(editUserButton.dataset.editUser);
    return;
  }

  const catalogMetricButton = event.target.closest("[data-catalog-status-filter]");
  if (catalogMetricButton) {
    applyCatalogStatusFilter(catalogMetricButton.dataset.catalogStatusFilter);
    return;
  }

  const editAdminButton = event.target.closest("[data-edit-admin]");
  if (editAdminButton) {
    handleEditAdministrator(editAdminButton.dataset.editAdmin);
  }

  const deleteAdminButton = event.target.closest("[data-delete-admin]");
  if (deleteAdminButton) {
    handleDeleteOperator(deleteAdminButton.dataset.deleteAdmin);
    return;
  }

  const deleteFinanceButton = event.target.closest("[data-delete-finance]");
  if (deleteFinanceButton) {
    handleDeleteFinanceRecord(deleteFinanceButton.dataset.deleteFinance);
    return;
  }

  const editFinanceButton = event.target.closest("[data-edit-finance]");
  if (editFinanceButton) {
    handleEditFinanceRecord(editFinanceButton.dataset.editFinance);
  }
}

function navigate(path, options = {}) {
  const resolvedPath = sanitizePath(path);
  if (resolvedPath === location.pathname && !options.force) {
    renderCurrentRoute();
    return;
  }

  const method = options.replace ? "replaceState" : "pushState";
  window.history[method]({}, "", resolvedPath);
  renderCurrentRoute();
}

function sanitizePath(path) {
  if (!path || path === "") return "/";
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
}

function resolveRoute(pathname) {
  const path = sanitizePath(pathname);

  if (path === "/") return { name: "home", access: "public" };
  if (path === "/login") return { name: "login", access: "public" };
  if (path === "/catalogo") return { name: "catalog", access: "public" };
  if (path === "/dashboard") return { name: "dashboard", access: "admin" };
  if (path === "/perfil") return { name: "profile", access: "auth" };
  if (path === "/admin/vehiculos") return { name: "legacyAdminVehicles", access: "public", redirectTo: "/catalogo" };
  if (path === "/admin/operadores") return { name: "adminOperators", access: "auth" };
  if (path === "/admin/mensajes") return { name: "adminMessages", access: "admin" };
  if (path === "/finanzas") return { name: "finance", access: "finance" };

  const vehicleEditMatch = path.match(/^\/vehiculo\/([^/]+)\/editar$/);
  if (vehicleEditMatch) return { name: "vehicleEdit", access: "auth", params: { id: vehicleEditMatch[1] } };

  const vehicleMatch = path.match(/^\/vehiculo\/([^/]+)$/);
  if (vehicleMatch) return { name: "vehicle", access: "auth", params: { id: vehicleMatch[1] } };

  return { name: "notFound", access: "public" };
}

function renderCurrentRoute() {
  const route = resolveRoute(location.pathname);
  const guardResult = enforceAccess(route);
  if (guardResult.redirected) return;

  const activeRoute = guardResult.route;
  const isAuthenticated = Boolean(state.token && state.user);
  renderSidebar(activeRoute.name);
  renderAppChrome(activeRoute.name);

  if (!isAuthenticated) {
    renderPublicRoute(activeRoute);
    return;
  }

  if (activeRoute.access === "public") {
    renderPublicRoute(activeRoute);
    return;
  }

  renderPrivateRoute(activeRoute);
}

function enforceAccess(route) {
  const isAuthenticated = Boolean(state.token && state.user);
  const role = state.user?.role;

  if (route.redirectTo) {
    navigate(route.redirectTo, { replace: true });
    return { redirected: true };
  }

  if (route.name === "notFound") {
    navigate(isAuthenticated ? getDefaultPrivateRoute() : "/", { replace: true });
    return { redirected: true };
  }

  if (isAuthenticated && route.name === "home") {
    navigate(getDefaultPrivateRoute(), { replace: true });
    return { redirected: true };
  }

  if (!isAuthenticated && route.access !== "public") {
    navigate("/login", { replace: true });
    return { redirected: true };
  }

  if (route.access === "admin" && role !== "ADMIN") {
    navigate(getDefaultPrivateRoute(), { replace: true });
    return { redirected: true };
  }

  if (route.access === "finance" && !canAccessFinance()) {
    navigate(getDefaultPrivateRoute(), { replace: true });
    return { redirected: true };
  }

  if (route.name === "vehicleEdit" && role !== "ADMIN") {
    navigate(route.params?.id ? `/vehiculo/${route.params.id}` : getDefaultPrivateRoute(), { replace: true });
    return { redirected: true };
  }

  return { redirected: false, route };
}

function renderPublicRoute(route) {
  hidePrivatePages();
  showOnlyPublicPage(route.name);
  if (elements.homeApiMetric) {
    elements.homeApiMetric.textContent = state.apiHealthy ? "Activa" : "Error";
  }
  if (elements.homePublicCount) {
    elements.homePublicCount.textContent = String(state.catalogVehicles.length);
  }

  if (route.name === "home") {
    const availableVehicles = state.catalogVehicles.filter((vehicle) => vehicle.currentStatus === "AVAILABLE");
    renderPublicVehicles(elements.homeCatalogPreview, availableVehicles.slice(0, 8), {
      loading: state.refreshLocks.publicCatalog && !state.publicCatalogLoaded,
      error: state.publicCatalogError,
      simple: true,
    });
  }

  if (route.name === "catalog") {
    const filter = elements.publicStatusFilter.value;
    const vehicles = state.catalogVehicles.filter((vehicle) => filter === "ALL" || vehicle.currentStatus === filter);
    renderCatalogOverview(state.catalogVehicles, filter);
    renderPublicVehicles(elements.publicCatalogGrid, vehicles, {
      loading: state.refreshLocks.publicCatalog && !state.publicCatalogLoaded,
      error: state.publicCatalogError,
    });
  }
}

function showOnlyPublicPage(pageName) {
  const publicPages = {
    home: elements.homePage,
    catalog: elements.catalogPage,
    login: elements.loginPage,
  };

  Object.entries(publicPages).forEach(([name, page]) => {
    page.classList.toggle("hidden", name !== pageName);
  });
}

function hidePublicPages() {
  [elements.homePage, elements.catalogPage, elements.loginPage].forEach((page) => page.classList.add("hidden"));
}

function renderAppChrome(routeName) {
  const titles = {
    home: { kicker: "Publico", title: "Inicio" },
    catalog: { kicker: "Publico", title: "Catalogo" },
    login: { kicker: "Acceso", title: "Iniciar sesion" },
    dashboard: { kicker: "Dashboard", title: "Panel principal" },
    adminVehicles: { kicker: "Administracion", title: "Gestion de vehiculos" },
    adminOperators: { kicker: "Administracion", title: "Gestion de Usuarios" },
    adminMessages: { kicker: "Administracion", title: "Mensajes del sistema" },
    finance: { kicker: "Finanzas", title: "Gestion financiera" },
    profile: { kicker: "Cuenta", title: "Perfil" },
    vehicle: { kicker: "Detalle", title: "Vehiculo" },
    vehicleEdit: { kicker: "Edicion", title: "Editar vehiculo" },
  };

  const titleInfo = titles[routeName] || titles.dashboard;
  elements.pageKicker.textContent = titleInfo.kicker;
  elements.pageTitle.textContent = titleInfo.title;
  setBadge(elements.sidebarRoleBadge, state.user?.role || "Visitante", state.user ? "info" : "neutral");
  setBadge(
    elements.apiStatusBadge,
    state.apiHealthy ? "API activa" : "API no disponible",
    state.apiHealthy ? "available" : "maintenance"
  );
  const isPublicRoute = ["home", "catalog", "login"].includes(routeName);
  const hideTopbarQuickActions = isPublicRoute || Boolean(state.user);
  elements.topbarMenuButton.classList.toggle("hidden", hideTopbarQuickActions);
  elements.authShortcutButton.classList.toggle("hidden", hideTopbarQuickActions);
  elements.sidebarLogoutButton.classList.toggle("hidden", !state.user);
  elements.authShortcutButton.textContent = state.user ? "Perfil" : "Iniciar sesion";
  elements.appShell.classList.toggle("public-topbar-minimal", isPublicRoute);
  elements.appShell.classList.toggle("public-route", isPublicRoute);
  elements.appShell.classList.toggle("home-route", routeName === "home");
  elements.appShell.classList.toggle("catalog-route", routeName === "catalog");
  elements.appShell.classList.toggle("login-route", routeName === "login");
  elements.sidebar.classList.toggle("authenticated", Boolean(state.user));
  elements.sidebarBrandKicker.textContent = state.user ? "Navegacion privada" : "Navegacion";
  elements.sidebarBrandTitle.textContent = state.user ? "Menu" : APP_NAME;
  elements.sidebarSectionLabel.textContent = state.user ? "Modulos" : "Explorar";
  renderSidebarUserBlock();
  syncMobileSidebarUI();
}

function renderSidebar(activeRouteName) {
  const links = (state.user ? SIDEBAR_LINKS[state.user.role] || [] : SIDEBAR_LINKS.PUBLIC).filter(
    (link) => link.route !== "/finanzas" || canAccessFinance()
  );
  elements.sidebarNav.innerHTML = links
    .map((link) => {
      const isActive = Array.isArray(link.matches) && link.matches.includes(activeRouteName);

      return `
        <button class="sidebar-link ${isActive ? "active" : ""}" type="button" data-route="${link.route}">
          <span class="sidebar-icon">${link.icon}</span>
          <span class="sidebar-label">${link.label}</span>
        </button>
      `;
    })
    .join("");
}

function renderSidebarUserBlock() {
  if (!state.user) {
    elements.sidebarUserCard.classList.add("hidden");
    elements.sidebarUserAvatar.textContent = "GW";
    elements.sidebarUserName.textContent = "Visitante";
    elements.sidebarUserMeta.textContent = "Navegacion publica";
    return;
  }

  elements.sidebarUserCard.classList.remove("hidden");
  elements.sidebarUserAvatar.textContent = initialsForName(state.user.name);
  elements.sidebarUserName.textContent = state.user.name;
  elements.sidebarUserMeta.textContent = state.user.email;
}

function renderPrivateRoute(route) {
  hidePublicPages();
  hidePrivatePages();

  if (route.name === "dashboard") {
    elements.dashboardPage.classList.remove("hidden");
    elements.actionsPanel.classList.toggle("hidden", state.user?.role !== "ADMIN");
    renderDashboard();
    return;
  }

  if (route.name === "adminVehicles") {
    elements.adminVehiclesPage.classList.remove("hidden");
    renderAdminVehiclesPage();
    return;
  }

  if (route.name === "vehicle") {
    elements.vehiclePage.classList.remove("hidden");
    renderVehicleRoute(route.params.id, { detailMode: "summary" });
    return;
  }

  if (route.name === "vehicleEdit") {
    elements.vehiclePage.classList.remove("hidden");
    renderVehicleRoute(route.params.id, { detailMode: "edit" });
    return;
  }

  if (route.name === "adminOperators") {
    elements.adminOperatorsPage.classList.remove("hidden");
    renderOperatorsPage();
    return;
  }

  if (route.name === "adminMessages") {
    elements.adminMessagesPage.classList.remove("hidden");
    renderAdminMessages();
    return;
  }

  if (route.name === "finance") {
    elements.financePage.classList.remove("hidden");
    renderFinancePage();
    return;
  }

  if (route.name === "profile") {
    elements.profilePage.classList.remove("hidden");
    renderProfilePage();
  }
}

function hidePrivatePages() {
  [
    elements.dashboardPage,
    elements.adminVehiclesPage,
    elements.vehiclePage,
    elements.adminOperatorsPage,
    elements.profilePage,
    elements.adminMessagesPage,
    elements.financePage,
    elements.actionsPanel,
  ].forEach((page) => page.classList.add("hidden"));
}

function handleAuthShortcut() {
  if (state.user) {
    navigate("/perfil");
    return;
  }
  navigate("/login");
}

async function checkHealth() {
  try {
    await apiFetch("/health", { auth: false });
    state.apiHealthy = true;
  } catch (_error) {
    state.apiHealthy = false;
  }
  renderCurrentRoute();
}

async function loadPublicCatalog(options = {}) {
  const { silent = false, force = false } = options;
  if (!force && state.publicCatalogLoaded && Date.now() - state.publicCatalogLoadedAt < 60000) {
    renderCurrentRoute();
    return;
  }
  if (state.refreshLocks.publicCatalog) return;
  state.refreshLocks.publicCatalog = true;
  state.publicCatalogError = "";
  renderCurrentRoute();

  try {
    state.catalogVehicles = await apiFetch("/catalog/vehicles", { auth: false, fresh: force });
    state.publicCatalogLoaded = true;
    state.publicCatalogLoadedAt = Date.now();
    renderCurrentRoute();
  } catch (error) {
    state.publicCatalogError = "No se pudieron cargar los vehiculos. Verifica que la API este activa.";
    if (!silent) {
      pushToast("error", error.message);
    }
  } finally {
    state.refreshLocks.publicCatalog = false;
  }
}

async function loadPrivateData() {
  if (!state.token) return;
  await Promise.all([loadCurrentUser(), loadPrivateVehicles(), loadOperators(), loadAdministrators(), loadFinanceData()]);
}

async function loadCurrentUser(options = {}) {
  const { silent = true } = options;
  if (!state.token) return;

  try {
    const user = await apiFetch("/users/me");
    state.user = user;
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
    renderCurrentRoute();
  } catch (error) {
    if (!silent) {
      pushToast("error", error.message);
    }
  }
}

async function loadPrivateVehicles(options = {}) {
  const { silent = false } = options;
  if (state.refreshLocks.privateVehicles) return;
  state.refreshLocks.privateVehicles = true;

  try {
    const vehicles = await apiFetch("/vehicles");
    state.privateVehicles = vehicles;
    renderCurrentRoute();
  } catch (error) {
    if (!silent) {
      pushToast("error", error.message);
    }
  } finally {
    state.refreshLocks.privateVehicles = false;
  }
}

async function loadOperators(options = {}) {
  const { silent = false } = options;
  if (!state.user) return;
  if (state.refreshLocks.operators) return;
  state.refreshLocks.operators = true;

  try {
    state.operators = await apiFetch("/users");
    renderCurrentRoute();
  } catch (error) {
    if (!silent) {
      pushToast("error", error.message);
    }
  } finally {
    state.refreshLocks.operators = false;
  }
}

async function loadAdministrators(options = {}) {
  const { silent = false } = options;
  if (!isPrimaryAdminUser()) {
    state.administrators = [];
    renderCurrentRoute();
    return;
  }

  try {
    state.administrators = await apiFetch("/admin/administrators");
    renderCurrentRoute();
  } catch (error) {
    if (!silent) {
      pushToast("error", error.message);
    }
  }
}

function setupRealtimeRefresh() {
  scheduleRefreshInterval();
}

function scheduleRefreshInterval() {
  clearInterval(state.refreshTimers.intervalId);
  state.refreshTimers.intervalId = window.setInterval(() => {
    refreshActiveView({ silent: true, reason: "interval" });
  }, 36000000); // 10 horas
}

function shouldRefreshCurrentRoute() {
  const route = resolveRoute(location.pathname);
  return route.name === "home" || route.name === "catalog";
}

function handleWindowFocus() {
  refreshActiveView({ silent: true, reason: "focus" });
}

function handlePageShow(event) {
  if (event.persisted) {
    refreshActiveView({ silent: true, reason: "bfcache" });
  }
}

function handleVisibilityChange() {
  clearTimeout(state.refreshTimers.visibilityTimeoutId);
  if (document.visibilityState !== "visible") return;

  state.refreshTimers.visibilityTimeoutId = window.setTimeout(() => {
    refreshActiveView({ silent: true, reason: "visible" });
  }, 250);
}

async function refreshActiveView(options = {}) {
  const { silent = false, reason = "manual" } = options;
  if (state.refreshLocks.activeView) return;
  if (!shouldRefreshCurrentRoute()) return;
  state.refreshLocks.activeView = true;

  try {
    const tasks = [loadPublicCatalog({ silent, force: reason === "manual" || reason === "pull" })];

    await Promise.all(tasks);

    if (!silent && reason === "pull") {
      pushToast("success", "Informacion actualizada.");
    }
  } finally {
    state.refreshLocks.activeView = false;
  }
}

function setupPullToRefresh() {
  window.addEventListener("touchstart", handlePullTouchStart, { passive: true });
  window.addEventListener("touchmove", handlePullTouchMove, { passive: true });
  window.addEventListener("touchend", handlePullTouchEnd, { passive: true });
  window.addEventListener("touchcancel", resetPullToRefresh, { passive: true });
}

function handlePullTouchStart(event) {
  if (!isMobileViewport() || state.mobileSidebarOpen || state.pullToRefresh.refreshing) return;
  if (window.scrollY > 0) return;

  state.pullToRefresh.startY = event.touches[0]?.clientY || 0;
  state.pullToRefresh.distance = 0;
  state.pullToRefresh.armed = true;
  state.pullToRefresh.active = true;
}

function handlePullTouchMove(event) {
  if (!state.pullToRefresh.active || !state.pullToRefresh.armed) return;

  const currentY = event.touches[0]?.clientY || 0;
  const rawDistance = currentY - state.pullToRefresh.startY;
  if (rawDistance <= 0) {
    resetPullToRefresh();
    return;
  }

  state.pullToRefresh.distance = Math.min(rawDistance, 110);
  renderPullToRefresh(state.pullToRefresh.distance);
}

async function handlePullTouchEnd() {
  if (!state.pullToRefresh.active) return;

  if (state.pullToRefresh.distance >= 72) {
    state.pullToRefresh.refreshing = true;
    renderPullToRefresh(state.pullToRefresh.distance, { refreshing: true });
    await refreshActiveView({ silent: false, reason: "pull" });
    state.pullToRefresh.refreshing = false;
  }

  resetPullToRefresh();
}

function renderPullToRefresh(distance, options = {}) {
  const { refreshing = false } = options;
  const indicator = elements.pullToRefreshIndicator;
  const label = elements.pullToRefreshLabel;
  if (!indicator || !label) return;

  const ready = distance >= 72;
  indicator.classList.add("visible");
  indicator.classList.toggle("ready", ready && !refreshing);
  indicator.classList.toggle("refreshing", refreshing);
  indicator.style.transform = `translate(-50%, ${Math.min(distance - 88, 18)}px)`;
  label.textContent = refreshing
    ? "Actualizando datos..."
    : ready
      ? "Suelta para actualizar"
      : "Desliza hacia abajo para actualizar";
}

function resetPullToRefresh() {
  const indicator = elements.pullToRefreshIndicator;
  if (indicator) {
    indicator.classList.remove("visible", "ready", "refreshing");
    indicator.style.transform = "translate(-50%, -88px)";
  }
  if (elements.pullToRefreshLabel) {
    elements.pullToRefreshLabel.textContent = "Desliza hacia abajo para actualizar";
  }

  state.pullToRefresh.startY = 0;
  state.pullToRefresh.distance = 0;
  state.pullToRefresh.armed = false;
  state.pullToRefresh.active = false;
}

function renderDashboard() {
  const vehicles = state.privateVehicles;
  renderDashboardVehicleCards(elements.dashboardVehiclesList, vehicles);
}

function renderAdminVehiclesPage() {
  const filter = elements.privateStatusFilter.value;
  const vehicles = state.privateVehicles.filter((vehicle) => filter === "ALL" || vehicle.currentStatus === filter);
  renderVehicleList(elements.privateVehiclesGrid, vehicles, "inventory");
}

async function renderVehicleRoute(vehicleId, options = {}) {
  await renderVehicleDetailIntoContainer(vehicleId, elements.vehicleRouteContent, options);
}

function renderOperatorsPage() {
  const canManageUsers = state.user?.role === "ADMIN";
  const createUserCard = elements.userForm.closest(".card");
  const userRoleSelect = elements.userForm.querySelector('[name="role"]');
  const adminRoleOption = userRoleSelect?.querySelector('option[value="ADMIN"]');
  if (createUserCard) {
    createUserCard.classList.toggle("hidden", !canManageUsers);
  }
  if (adminRoleOption) {
    adminRoleOption.disabled = !isPrimaryAdminUser();
  }

  elements.administratorsSection.classList.toggle("hidden", !isPrimaryAdminUser());

  if (!state.operators.length) {
    elements.operatorsList.innerHTML = '<div class="empty-panel">No hay usuarios registrados.</div>';
  } else {
    elements.operatorsList.innerHTML = state.operators
      .map(
        (user) => `
          <article class="list-card">
            <div class="list-card-main">
              <div class="avatar-chip operator-avatar">${escapeHtml(initialsForName(user.name))}</div>
              <div>
                <strong class="operator-name">${escapeHtml(user.name)}</strong>
                <span class="operator-email">${escapeHtml(user.email)} - ${escapeHtml(formatDate(user.createdAt))}</span>
              </div>
            </div>
            <div class="list-card-meta">
              <span class="status-pill info">${escapeHtml(user.role)}</span>
              <span class="status-pill ${user.isActive ? "available" : "maintenance"}">${user.isActive ? "Activo" : "Inactivo"}</span>
              ${
                canManageUsers
                  ? `
                    <button class="button button-secondary" type="button" data-edit-user="${escapeAttribute(user.id)}">Editar</button>
                    <button class="button button-ghost operator-delete-button" type="button" data-delete-operator="${escapeAttribute(user.id)}">Eliminar</button>
                  `
                  : ""
              }
            </div>
          </article>
        `
      )
      .join("");
  }

  if (!isPrimaryAdminUser()) {
    elements.administratorsList.innerHTML = "";
    return;
  }

  if (!state.administrators.length) {
    elements.administratorsList.innerHTML = '<div class="empty-panel">No hay administradores registrados.</div>';
    return;
  }

  elements.administratorsList.innerHTML = state.administrators
    .map(
      (admin) => `
        <article class="list-card">
          <div class="list-card-main">
            <div class="avatar-chip operator-avatar">${escapeHtml(initialsForName(admin.name))}</div>
            <div>
              <strong class="operator-name">${escapeHtml(admin.name)}</strong>
              <span class="operator-email">${escapeHtml(admin.email)} - ${escapeHtml(formatDate(admin.createdAt))}</span>
            </div>
          </div>
          <div class="list-card-meta">
            <span class="status-pill ${admin.isActive ? "available" : "maintenance"}">${admin.isActive ? "Activo" : "Inactivo"}</span>
            <button class="button button-secondary" type="button" data-edit-admin="${admin.id}">Editar</button>
            <button class="button button-ghost" type="button" data-delete-admin="${admin.id}">Eliminar</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderProfilePage() {
  const contactEmail = state.user.contactEmail || "";
  const pendingEmail = state.user.pendingContactEmail || "";
  const isVerified = Boolean(contactEmail && state.user.contactEmailVerified);
  const emailStatus = getProfileEmailStatus();
  const emailLabel = pendingEmail || contactEmail || "Sin correo registrado";
  const requestEmailValue = pendingEmail || contactEmail;

  elements.profileContent.innerHTML = `
    <article><strong>Nombre</strong><span>${escapeHtml(state.user.name)}</span></article>
    <article><strong>Usuario</strong><span>${escapeHtml(state.user.email)}</span></article>
    <article><strong>Rol</strong><span>${escapeHtml(state.user.role)}</span></article>
    <article><strong>Sesion</strong><span>Activa en esta aplicacion</span></article>
    <article class="profile-email-card">
      <div>
        <div class="profile-email-heading">
          <strong>Correo electronico</strong>
          <span class="status-pill ${emailStatus.className}">${emailStatus.label}</span>
        </div>
        <span>${escapeHtml(emailLabel)}</span>
      </div>
      <div class="profile-email-actions">
        <form id="profileEmailRequestForm" class="profile-email-form">
          <input name="contactEmail" type="email" value="${escapeHtml(requestEmailValue)}" placeholder="correo@empresa.com" required />
          <button id="profileEmailRequestButton" class="button button-primary" type="submit">${pendingEmail ? "Reenviar codigo" : isVerified ? "Cambiar correo" : "Enviar codigo"}</button>
        </form>
        ${
          pendingEmail
            ? `<form id="profileEmailConfirmForm" class="profile-email-form">
                <input name="code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="Codigo de 4 digitos" required />
                <button class="button button-secondary" type="submit">Verificar</button>
              </form>`
            : ""
        }
      </div>
    </article>
  `;

  const requestForm = document.getElementById("profileEmailRequestForm");
  if (requestForm) {
    requestForm.addEventListener("submit", handleRequestProfileEmailVerification);
  }
  const confirmForm = document.getElementById("profileEmailConfirmForm");
  if (confirmForm) {
    confirmForm.addEventListener("submit", handleConfirmProfileEmailVerification);
  }
  startProfileEmailCooldownTimer();
}

function getProfileEmailStatus() {
  if (state.user?.pendingContactEmail || (state.user?.contactEmail && !state.user?.contactEmailVerified)) {
    return { label: "Pendiente de verificacion", className: "service" };
  }

  if (state.user?.contactEmail && state.user?.contactEmailVerified) {
    return { label: "Verificado", className: "available" };
  }

  return { label: "Sin registrar", className: "neutral" };
}

function getProfileEmailCooldownSeconds() {
  if (!state.user?.emailVerificationLastSentAt) return 0;

  const lastSentAt = new Date(state.user.emailVerificationLastSentAt).getTime();
  if (Number.isNaN(lastSentAt)) return 0;

  return Math.max(0, Math.ceil((60000 - (Date.now() - lastSentAt)) / 1000));
}

function startProfileEmailCooldownTimer() {
  clearInterval(state.profileEmailCooldownTimer);

  const updateCooldown = () => {
    const requestButton = document.getElementById("profileEmailRequestButton");
    if (!requestButton) return;

    const seconds = getProfileEmailCooldownSeconds();
    requestButton.disabled = seconds > 0;

    if (seconds <= 0) {
      clearInterval(state.profileEmailCooldownTimer);
      state.profileEmailCooldownTimer = null;
    }
  };

  updateCooldown();
  if (getProfileEmailCooldownSeconds() > 0) {
    state.profileEmailCooldownTimer = window.setInterval(updateCooldown, 1000);
  }
}

function renderAdminMessages() {
  if (!state.systemMessages.length) {
    elements.adminMessagesList.innerHTML = '<div class="empty-panel">Todavia no hay mensajes registrados.</div>';
    return;
  }

  elements.adminMessagesList.innerHTML = state.systemMessages
    .map(
      (message) => `
        <article class="list-card">
          <div>
            <strong>${escapeHtml(message.title)}</strong>
            <div class="message-copy">${escapeHtml(message.description)}</div>
          </div>
          <div class="list-card-meta">
            <span class="status-pill ${message.type === "error" ? "maintenance" : message.type === "success" ? "available" : "info"}">${escapeHtml(message.type.toUpperCase())}</span>
            <span class="message-copy">${escapeHtml(formatDate(message.createdAt))}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderFinancePage() {
  renderFinanceVehicleOptions();
  renderFinanceSummary();
  renderFinanceRecords();
}

function renderFinanceVehicleOptions() {
  const select = elements.financeForm.querySelector('[name="vehicleId"]');
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = `
    <option value="">Sin vehiculo</option>
    ${state.privateVehicles
      .map(
        (vehicle) =>
          `<option value="${escapeAttribute(vehicle.id)}">${escapeHtml(`${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`)}</option>`
      )
      .join("")}
  `;
  select.value = currentValue;
}

function renderFinanceSummary() {
  const summary = state.financeSummary || { income: 0, expenses: 0, balance: 0 };
  elements.financeSummary.innerHTML = `
    <article class="stat-card">
      <span>Ingresos</span>
      <strong>${escapeHtml(formatMoney(summary.income || 0))}</strong>
    </article>
    <article class="stat-card">
      <span>Egresos y costos</span>
      <strong>${escapeHtml(formatMoney(summary.expenses || 0))}</strong>
    </article>
    <article class="stat-card">
      <span>Balance</span>
      <strong>${escapeHtml(formatMoney(summary.balance || 0))}</strong>
    </article>
  `;
}

function renderFinanceRecords() {
  if (!state.financeRecords.length) {
    elements.financeList.innerHTML = '<div class="empty-panel">Todavia no hay movimientos financieros registrados.</div>';
    return;
  }

  elements.financeList.innerHTML = state.financeRecords
    .map((record) => {
      const vehicleLabel = record.vehicle
        ? `${record.vehicle.plate} - ${record.vehicle.brand} ${record.vehicle.model}`
        : "Sin vehiculo asociado";
      return `
        <article class="list-card">
          <div>
            <strong>${escapeHtml(record.concept)}</strong>
            <div class="message-copy">${escapeHtml(`${getFinanceTypeLabel(record.type)} - ${vehicleLabel}`)}</div>
            <div class="message-copy">${escapeHtml(record.client || "Sin cliente")} - ${escapeHtml(formatCalendarDate(record.date))}</div>
          </div>
          <div class="list-card-meta">
            <span class="status-pill ${isFinanceIncome(record.type) ? "available" : "service"}">${escapeHtml(formatMoney(record.amount))}</span>
            <button class="button button-secondary" type="button" data-edit-finance="${escapeAttribute(record.id)}">Editar</button>
            <button class="button button-ghost" type="button" data-delete-finance="${escapeAttribute(record.id)}">Eliminar</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSummary(container, vehicles) {
  const counts = vehicles.reduce((accumulator, vehicle) => {
    accumulator[vehicle.currentStatus] = (accumulator[vehicle.currentStatus] || 0) + 1;
    return accumulator;
  }, {});

  const entries = Object.entries(counts);
  if (!entries.length) {
    container.innerHTML = '<div class="empty-panel">Sin datos para mostrar.</div>';
    return;
  }

  container.innerHTML = entries
    .map(([status, total]) => {
      const meta = getStatusMeta(status);
      return `
        <article class="stat-card">
          <span>${escapeHtml(meta.label)}</span>
          <strong>${total}</strong>
        </article>
      `;
    })
    .join("");
}

function renderPublicVehicles(container, vehicles, options = {}) {
  const { loading = false, error = "", simple = false } = options;
  if (loading) {
    container.innerHTML = '<div class="empty-panel">Cargando vehiculos...</div>';
    return;
  }

  if (error && !vehicles.length) {
    container.innerHTML = `<div class="empty-panel">${escapeHtml(error)}</div>`;
    return;
  }

  if (!vehicles.length) {
    container.innerHTML = '<div class="empty-panel">No hay vehiculos para mostrar.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  vehicles.forEach((vehicle) => {
    const card = elements.publicVehicleCardTemplate.content.cloneNode(true);
    const meta = getStatusMeta(vehicle.currentStatus);
    const image = card.querySelector(".vehicle-image");
    const plateElement = card.querySelector(".vehicle-plate");
    const operatorElement = card.querySelector(".vehicle-operator");
    const captionElement = card.querySelector(".vehicle-caption");
    const imageStatusBadge = card.querySelector(".vehicle-status-badge");
    card.querySelector(".vehicle-card-button").dataset.publicVehicle = vehicle.id;
    setVehicleImage(image, vehicle.photoUrl, vehicle.plate, {
      fallbackLabel: vehicle.plate,
      width: 480,
      widths: [320, 480, 640],
      sizes: "(max-width: 768px) calc(100vw - 28px), (max-width: 1024px) 50vw, 25vw",
    });
    card.querySelector(".vehicle-card").classList.toggle("vehicle-card-simple", simple);
    plateElement.textContent = vehicle.plate;
    plateElement.classList.toggle("hidden", simple);
    card.querySelector(".vehicle-model").textContent = `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() || "Modelo no disponible";
    operatorElement.textContent = vehicle.operatorName || "Operador no disponible";
    operatorElement.classList.toggle("hidden", simple);
    captionElement.textContent = simple ? "Clic para ver mas" : "Haz clic para ver mas";
    imageStatusBadge.classList.toggle("hidden", simple);
    setBadge(imageStatusBadge, meta.label, meta.className);
    setBadge(card.querySelector(".vehicle-card-status"), meta.label, meta.className);
    fragment.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function renderVehicleList(container, vehicles, mode) {
  if (!vehicles.length) {
    container.innerHTML = '<div class="empty-panel">No hay vehiculos disponibles.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  const canManageVehicles = state.user?.role === "ADMIN";
  vehicles.forEach((vehicle) => {
    const node = elements.privateVehicleItemTemplate.content.cloneNode(true);
    const publicMatch = state.catalogVehicles.find((item) => item.id === vehicle.id);
    const meta = getStatusMeta(vehicle.currentStatus);
    const operatorName = vehicle.assignedOperator || "Sin operador";
    const subtitle =
      mode === "inventory"
        ? `${vehicle.plate} - ${vehicle.year} - Operador: ${operatorName}`
        : `${vehicle.plate} - ${vehicle.year}`;
    const deleteButton = node.querySelector(".delete-button");
    const editInfoButton = node.querySelector(".edit-info-button");

    node.querySelector(".detail-button").dataset.privateVehicle = vehicle.id;
    if (editInfoButton) {
      editInfoButton.dataset.editVehicle = vehicle.id;
      editInfoButton.classList.toggle("hidden", !canManageVehicles);
    }
    setVehicleImage(node.querySelector(".list-card-thumb"), publicMatch?.photoUrl, vehicle.plate, {
      fallbackLabel: vehicle.plate,
      width: 160,
      widths: [160, 320],
      sizes: "64px",
    });
    node.querySelector(".list-card-title").textContent = `${vehicle.brand} ${vehicle.model}`;
    node.querySelector(".list-card-subtitle").textContent = subtitle;
    setBadge(node.querySelector(".list-card-status"), meta.label, meta.className);
    deleteButton.dataset.deleteVehicle = vehicle.id;
    deleteButton.classList.toggle("hidden", !canManageVehicles);

    fragment.appendChild(node);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function renderDashboardVehicleCards(container, vehicles) {
  if (!vehicles.length) {
    container.innerHTML = '<div class="empty-panel">No hay vehiculos disponibles.</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  const canManageVehicles = state.user?.role === "ADMIN";
  vehicles.forEach((vehicle) => {
    const publicMatch = state.catalogVehicles.find((item) => item.id === vehicle.id);
    const meta = getStatusMeta(vehicle.currentStatus);
    const operatorName = vehicle.assignedOperator || "Sin operador";
    const card = document.createElement("article");
    card.className = "dashboard-vehicle-card";
    card.innerHTML = `
      <div class="dashboard-vehicle-image-wrap">
        <img class="dashboard-vehicle-image" alt="Vehiculo ${escapeAttribute(vehicle.plate)}" width="420" height="260" loading="lazy" decoding="async" />
      </div>
      <div class="dashboard-vehicle-body">
        <div class="dashboard-vehicle-heading">
          <div class="dashboard-vehicle-title">
            <strong>${escapeHtml(vehicle.plate)}</strong>
            <span class="status-pill dashboard-vehicle-status ${meta.className}">${escapeHtml(meta.label)}</span>
          </div>
          <span class="dashboard-vehicle-year">${escapeHtml(String(vehicle.year || "Sin anio"))}</span>
        </div>
        <div class="dashboard-vehicle-copy">
          <span>${escapeHtml(`${vehicle.brand || ""} ${vehicle.model || ""}`.trim() || "Modelo no disponible")}</span>
          <small>${escapeHtml(operatorName)}</small>
        </div>
      </div>
      <div class="dashboard-vehicle-actions">
        <button class="button button-secondary detail-button" type="button" data-private-vehicle="${escapeAttribute(vehicle.id)}">Ver informacion</button>
        ${
          canManageVehicles
            ? `
              <button class="button button-primary edit-info-button" type="button" data-edit-vehicle="${escapeAttribute(vehicle.id)}">Editar informacion</button>
              <button class="button button-ghost delete-button" type="button" data-delete-vehicle="${escapeAttribute(vehicle.id)}">Eliminar</button>
            `
            : ""
        }
      </div>
    `;

    setVehicleImage(card.querySelector(".dashboard-vehicle-image"), publicMatch?.photoUrl, vehicle.plate, {
      fallbackLabel: vehicle.plate,
      width: 640,
      widths: [320, 480, 640, 960],
      sizes: "(max-width: 768px) calc(100vw - 56px), (max-width: 1200px) 50vw, 33vw",
    });
    fragment.appendChild(card);
  });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function applyCatalogStatusFilter(status) {
  if (!elements.publicStatusFilter || !status) return;
  elements.publicStatusFilter.value = status;
  renderCurrentRoute();
}

function renderCatalogOverview(vehicles, activeStatus = "ALL") {
  if (!elements.catalogOverviewStats || !elements.catalogStatusViz || !elements.catalogDonutChart || !elements.catalogDonutTotal) {
    return;
  }

  const total = vehicles.length;
  const statusEntries = [
    { status: "AVAILABLE", label: "Disponibles", total: 0, color: "#22c55e" },
    { status: "REGISTERED", label: "En servicio", total: 0, color: "#f59e0b" },
    { status: "IN_MAINTENANCE", label: "En mantenimiento", total: 0, color: "#ef4444" },
    { status: "OUT_OF_SERVICE", label: "Fuera de servicio", total: 0, color: "#f59e0b" },
    { status: "SOLD", label: "Vendidos", total: 0, color: "#9ca3af" },
  ].map((entry) => ({
    ...entry,
    total: vehicles.filter((vehicle) => vehicle.currentStatus === entry.status).length,
  }));

  elements.catalogOverviewStats.innerHTML = `
    ${statusEntries
      .map(
        (entry) => `
          <button
            class="catalog-mini-stat ${activeStatus === entry.status ? "active" : ""}"
            type="button"
            data-catalog-status-filter="${entry.status}"
            aria-pressed="${activeStatus === entry.status ? "true" : "false"}"
          >
            <strong>${escapeHtml(entry.label)}:</strong>
            <span>${entry.total}</span>
          </button>
        `
      )
      .join("")}
  `;

  const visibleStatusEntries = statusEntries.filter((entry) => entry.total > 0);

  const chartStops = buildDonutStops(visibleStatusEntries, total);
  elements.catalogDonutChart.style.setProperty(
    "--catalog-donut",
    chartStops || "conic-gradient(#e5e7eb 0deg 360deg)"
  );
  elements.catalogDonutTotal.textContent = String(total);

  elements.catalogStatusViz.innerHTML = visibleStatusEntries.length
    ? visibleStatusEntries
        .map((entry) => {
          const meta = getStatusMeta(entry.status);
          const percent = total ? Math.round((entry.total / total) * 100) : 0;
          return `
            <article class="catalog-status-item">
              <div class="catalog-status-head">
                <div class="catalog-status-label">
                  <span class="catalog-status-dot" style="background:${entry.color}"></span>
                  <strong>${escapeHtml(meta.label)}</strong>
                </div>
                <span>${entry.total}</span>
              </div>
              <div class="catalog-status-bar">
                <span style="width:${percent}%; background:${entry.color}"></span>
              </div>
            </article>
          `;
        })
        .join("")
    : '<div class="empty-panel">Sin datos para mostrar.</div>';
}

function buildDonutStops(entries, total) {
  if (!entries.length || !total) return "";

  let current = 0;
  return `conic-gradient(${entries
    .map((entry) => {
      const start = current;
      const slice = (entry.total / total) * 360;
      current += slice;
      return `${entry.color} ${start}deg ${current}deg`;
    })
    .join(", ")})`;
}

async function handleDeleteVehicle(vehicleId) {
  const vehicle = state.privateVehicles.find((item) => item.id === vehicleId);
  const label = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : "este vehiculo";
  if (!window.confirm(`Vas a eliminar ${label}. Esta accion no se puede deshacer.`)) {
    return;
  }

  try {
    await apiFetch(`/vehicles/${vehicleId}`, { method: "DELETE" });
    addSystemMessage("success", "Vehiculo eliminado", `${label} fue eliminado del inventario.`);
    pushToast("success", "Vehiculo eliminado correctamente.");
    await Promise.all([loadPublicCatalog({ force: true }), loadPrivateVehicles()]);
    renderCurrentRoute();
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al eliminar vehiculo", error.message);
  }
}

async function handleDeleteOperator(operatorId) {
  const operator =
    state.operators.find((item) => item.id === operatorId) || state.administrators.find((item) => item.id === operatorId);
  const label = operator ? `${operator.name} (${operator.email})` : "este usuario";
  if (!window.confirm(`Vas a eliminar ${label}. Esta accion no se puede deshacer.`)) {
    return;
  }

  try {
    await apiFetch(`/users/${operatorId}`, { method: "DELETE" });
    addSystemMessage("success", "Usuario eliminado", `${label} fue eliminado correctamente.`);
    pushToast("success", "Usuario eliminado correctamente.");
    await Promise.all([loadOperators(), loadAdministrators()]);
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al eliminar usuario", error.message);
  }
}

async function handleEditAdministrator(adminId) {
  const administrator = state.administrators.find((item) => item.id === adminId);
  if (!administrator) return;

  const nextName = window.prompt("Nombre del administrador", administrator.name);
  if (nextName === null) return;

  const nextIdentifier = window.prompt("Email o identificador del administrador", administrator.email);
  if (nextIdentifier === null) return;

  const nextPassword = window.prompt("Nueva contrasena (deja vacio para no cambiarla)", "");
  if (nextPassword === null) return;

  const trimmedName = nextName.trim();
  const trimmedIdentifier = nextIdentifier.trim();
  if (!trimmedName || !trimmedIdentifier) {
    pushToast("error", "Nombre y usuario son obligatorios.");
    return;
  }

  try {
    await apiFetch(`/users/${adminId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: trimmedName,
        identifier: trimmedIdentifier,
        ...(nextPassword.trim() ? { password: nextPassword.trim() } : {}),
      }),
    });

    addSystemMessage("success", "Administrador actualizado", `${trimmedName} fue actualizado correctamente.`);
    pushToast("success", "Administrador actualizado correctamente.");
    await loadAdministrators();
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al actualizar administrador", error.message);
  }
}

async function renderVehicleDetailIntoContainer(vehicleId, container, options = {}) {
  container.innerHTML = '<div class="empty-panel">Cargando detalle del vehiculo...</div>';

  try {
    const vehicle = await apiFetch(`/vehicles/${vehicleId}`);
    container.innerHTML = buildVehicleDetailMarkup(vehicle, options);
    attachVehicleDetailHandlers(container, vehicle, options);
  } catch (error) {
    container.innerHTML = `<div class="empty-panel">${escapeHtml(error.message)}</div>`;
  }
}

function buildVehicleDetailMarkup(vehicle, options = {}) {
  const detailMode = options.detailMode || "summary";
  const userRole = state.user?.role;
  const isAdmin = userRole === "ADMIN";
  const meta = getStatusMeta(vehicle.currentStatus);
  const latestPhoto = vehicle.photos?.[0]?.url || "";
  const creator = vehicle.createdBy ? `${vehicle.createdBy.name} (${vehicle.createdBy.role})` : "Sin dato";
  const assignedOperator = vehicle.assignedOperator || "Sin asignar";
  const observations = vehicle.observations || "Sin observaciones";
  const soatExpiry = vehicle.soatExpiry ? formatCalendarDate(vehicle.soatExpiry) : "No registrado";
  const tecnomecanicaExpiry = vehicle.tecnomecanicaExpiry ? formatCalendarDate(vehicle.tecnomecanicaExpiry) : "No registrado";
  const vehicleTaxExpiry = vehicle.vehicleTaxExpiry ? formatCalendarDate(vehicle.vehicleTaxExpiry) : "No registrado";
  const pendingProcedures = vehicle.pendingProcedures || "Sin tramites pendientes";
  const fines = vehicle.fines || "Sin multas registradas";
  const history = vehicle.statusHistory || [];
  const adminHistory = vehicle.adminHistory || [];
  const photos = vehicle.photos || [];
  const canEditDetails = isAdmin;
  const canViewAdminHistory = ["ADMIN", "DIRECTOR", "GERENTE"].includes(userRole);
  const complianceItems = [
    buildComplianceEntry("SOAT", vehicle.soatExpiry),
    buildComplianceEntry("Tecnomecanica", vehicle.tecnomecanicaExpiry),
    buildComplianceEntry("Impuesto vehicular", vehicle.vehicleTaxExpiry),
  ];
  const detailFormFields = `
        <label>
          <span>Operador asignado</span>
          <input name="assignedOperator" value="${escapeAttribute(vehicle.assignedOperator || "")}" placeholder="Nombre del operador" />
        </label>
        <label class="full-span">
          <span>Observaciones</span>
          <input name="observations" value="${escapeAttribute(vehicle.observations || "")}" placeholder="Notas administrativas del vehiculo" />
        </label>
        <label>
          <span>Vencimiento de SOAT</span>
          <input name="soatExpiry" type="date" value="${escapeAttribute(formatDateInputValue(vehicle.soatExpiry))}" />
        </label>
        <label>
          <span>Vencimiento Tecnomecanica</span>
          <input name="tecnomecanicaExpiry" type="date" value="${escapeAttribute(formatDateInputValue(vehicle.tecnomecanicaExpiry))}" />
        </label>
        <label>
          <span>Vencimiento Impuesto Vehicular</span>
          <input name="vehicleTaxExpiry" type="date" value="${escapeAttribute(formatDateInputValue(vehicle.vehicleTaxExpiry))}" />
        </label>
        <label class="full-span">
          <span>Tramites pendientes</span>
          <input name="pendingProcedures" value="${escapeAttribute(vehicle.pendingProcedures || "")}" placeholder="Ej: traspaso, levantamiento de prenda" />
        </label>
        <label class="full-span">
          <span>Multas</span>
          <input name="fines" value="${escapeAttribute(vehicle.fines || "")}" placeholder="Detalle de comparendos o saldo pendiente" />
        </label>
      `;
  return `
    <div class="vehicle-detail-layout detail-mode-${escapeAttribute(detailMode)}">
      <div class="vehicle-detail-head">
        <img ${vehicleImageAttributes(latestPhoto, vehicle.plate, {
          className: "vehicle-detail-image",
          width: 960,
          widths: [480, 640, 960, 1280],
          sizes: "(max-width: 768px) calc(100vw - 28px), 960px",
          loading: "eager",
        })} />
        <div>
          <p class="section-kicker">Vehiculo</p>
          <h3>${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)}</h3>
          <p class="message-copy">${escapeHtml(vehicle.plate)} • ${escapeHtml(String(vehicle.year))}</p>
          <span class="status-pill ${meta.className}">${escapeHtml(meta.label)}</span>
          ${
            canEditDetails && detailMode === "edit"
              ? `
                <form class="vehicle-status-inline" data-status-form="${vehicle.id}">
                  <label>
                    <span>Actualizar estado</span>
                    <select name="statusType">
                      ${Object.keys(STATUS_META)
                        .map((status) => `<option value="${status}" ${status === vehicle.currentStatus ? "selected" : ""}>${STATUS_META[status].label}</option>`)
                        .join("")}
                    </select>
                  </label>
                  <small>Se guarda automaticamente al cambiar.</small>
                </form>
              `
              : ""
          }
        </div>
      </div>

      <div class="detail-grid">
        ${renderDetailField("Marca", vehicle.brand)}
        ${renderDetailField("Modelo", vehicle.model)}
        ${renderDetailField("Anio", String(vehicle.year))}
        ${renderDetailField("VIN", vehicle.vin || "No registrado")}
        ${renderDetailField("Fecha de registro", formatDate(vehicle.createdAt))}
        ${renderDetailField("Creado por", creator)}
        ${renderDetailField("Operador asignado", assignedOperator)}
        ${renderDetailField("Vencimiento de SOAT", soatExpiry, complianceItems[0])}
        ${renderDetailField("Vencimiento Tecnomecanica", tecnomecanicaExpiry, complianceItems[1])}
        ${renderDetailField("Vencimiento Impuesto Vehicular", vehicleTaxExpiry, complianceItems[2])}
        ${renderDetailField("Tramites pendientes", pendingProcedures, { compact: false })}
        ${renderDetailField("Multas", fines, { compact: false })}
        ${renderDetailField("Observaciones", observations, { compact: false })}
      </div>

      ${
        canEditDetails
          ? `
            <div class="vehicle-admin-block">
              <div class="section-header">
                <div>
                  <p class="section-kicker">Administracion</p>
                  <h3>Datos del vehiculo</h3>
                </div>
              </div>
              <form class="form-grid" data-details-form="${vehicle.id}">
                ${detailFormFields}
                <button class="button button-primary full-span" type="submit">Guardar datos</button>
              </form>
            </div>
          `
          : ""
      }

      ${
        canEditDetails
          ? `
      <div class="vehicle-photo-upload-block">
        <div class="section-header">
          <div>
            <p class="section-kicker">Imagenes</p>
            <h3>Subir foto</h3>
          </div>
        </div>
        <form class="photo-form" data-photo-form="${vehicle.id}" enctype="multipart/form-data">
          <input name="photo" type="file" accept="image/*" required />
          <button class="button button-secondary" type="submit">Subir foto</button>
        </form>
      </div>
          `
          : ""
      }

      <div class="vehicle-gallery-block">
        <div class="section-header">
          <div>
            <p class="section-kicker">Galeria</p>
            <h3>Fotos guardadas</h3>
          </div>
        </div>
        <div class="photo-strip">
          ${
            photos.length
              ? photos
                  .map(
                    (photo) => `
                      <article class="photo-card">
                        <a class="photo-card-link" href="${escapeAttribute(photo.url)}" target="_blank" rel="noreferrer">
                          <img ${vehicleImageAttributes(photo.url, vehicle.plate, {
                            width: 320,
                            widths: [160, 320],
                            sizes: "132px",
                          })} />
                        </a>
                        <div class="photo-card-body">
                          <span>${escapeHtml(photo.description || photo.fileName)}</span>
                          ${
                            canEditDetails
                              ? `
                                <button
                                  class="button button-ghost photo-delete-button"
                                  type="button"
                                  data-delete-photo="${photo.id}"
                                >
                                  Eliminar foto
                                </button>
                              `
                              : ""
                          }
                        </div>
                      </article>
                    `
                  )
                  .join("")
              : '<div class="empty-panel">Todavia no hay fotos cargadas.</div>'
          }
        </div>
      </div>

      <div class="vehicle-status-history-block">
        <div class="section-header">
          <div>
            <p class="section-kicker">Historial</p>
            <h3>Movimientos recientes</h3>
          </div>
        </div>
        <div class="list-stack">
          ${
            history.length
              ? history
                  .map(
                    (item) => `
                      <article class="history-item">
                        <strong>${escapeHtml(getStatusMeta(item.statusType).label)}</strong>
                        <span>${escapeHtml(item.description || "Sin descripcion")} • ${escapeHtml(formatDate(item.createdAt || item.date))}</span>
                      </article>
                    `
                  )
                  .join("")
              : '<div class="empty-panel">Sin historial registrado.</div>'
          }
        </div>
      </div>

      ${
        canViewAdminHistory
          ? `
      <div class="vehicle-admin-history-block">
        <div class="section-header">
          <div>
            <p class="section-kicker">Auditoria</p>
            <h3>Cambios administrativos</h3>
          </div>
        </div>
        <div class="list-stack">
          ${
            adminHistory.length
              ? adminHistory
                  .map(
                    (item) => `
                      <article class="history-item admin-history-item">
                        <strong>${escapeHtml(item.field)}</strong>
                        <span>${escapeHtml(formatAdminHistoryChange(item))}</span>
                        <span class="history-meta">${escapeHtml(`${item.updatedBy?.name || "Usuario"} • ${formatDate(item.createdAt)}`)}</span>
                      </article>
                    `
                  )
                  .join("")
              : '<div class="empty-panel">Todavia no hay cambios administrativos registrados.</div>'
          }
        </div>
      </div>
          `
          : ""
      }

    </div>
  `;
}

function attachVehicleDetailHandlers(container, vehicle, options = {}) {
  const detailsForm = container.querySelector(`[data-details-form="${vehicle.id}"]`);
  const statusForm = container.querySelector(`[data-status-form="${vehicle.id}"]`);
  const photoForm = container.querySelector(`[data-photo-form="${vehicle.id}"]`);
  const deletePhotoButtons = container.querySelectorAll("[data-delete-photo]");

  if (detailsForm) {
    detailsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);

      try {
        await apiFetch(`/vehicles/${vehicle.id}/details`, {
          method: "PATCH",
          body: JSON.stringify({
            assignedOperator: emptyToUndefined(form.get("assignedOperator")),
            observations: emptyToUndefined(form.get("observations")),
            soatExpiry: dateInputToIsoString(form.get("soatExpiry")),
            tecnomecanicaExpiry: dateInputToIsoString(form.get("tecnomecanicaExpiry")),
            vehicleTaxExpiry: dateInputToIsoString(form.get("vehicleTaxExpiry")),
            pendingProcedures: emptyToUndefined(form.get("pendingProcedures")),
            fines: emptyToUndefined(form.get("fines")),
          }),
        });

        addSystemMessage("success", "Datos actualizados", `Se actualizaron los datos de ${vehicle.plate}.`);
        await Promise.all([loadPublicCatalog({ force: true }), loadPrivateVehicles()]);
        if (options.panelMode) {
          await renderVehicleDetailIntoContainer(vehicle.id, container, {
            panelMode: true,
            detailMode: options.detailMode || "summary",
          });
        } else {
          await renderVehicleRoute(vehicle.id, { detailMode: options.detailMode || "summary" });
        }
      } catch (error) {
        pushToast("error", error.message);
        addSystemMessage("error", "Fallo al actualizar datos", error.message);
      }
    });
  }

  if (statusForm) {
    const statusSelect = statusForm.querySelector('[name="statusType"]');
    if (statusSelect) {
      statusSelect.addEventListener("change", async () => {
        if (statusSelect.value === vehicle.currentStatus) return;
        statusSelect.disabled = true;

        try {
          await apiFetch(`/vehicles/${vehicle.id}/status`, {
            method: "PATCH",
            body: JSON.stringify({
              statusType: statusSelect.value,
            }),
          });

          addSystemMessage("success", "Estado actualizado", `Se actualizo el estado de ${vehicle.plate}.`);
          pushToast("success", "Estado actualizado automaticamente.");
          await Promise.all([loadPublicCatalog({ force: true }), loadPrivateVehicles()]);
          if (options.panelMode) {
            await renderVehicleDetailIntoContainer(vehicle.id, container, {
              panelMode: true,
              detailMode: options.detailMode || "summary",
            });
          } else {
            await renderVehicleRoute(vehicle.id, { detailMode: options.detailMode || "summary" });
          }
        } catch (error) {
          statusSelect.disabled = false;
          statusSelect.value = vehicle.currentStatus;
          pushToast("error", error.message);
          addSystemMessage("error", "Fallo al actualizar estado", error.message);
        }
      });
    }
  }

  if (photoForm) {
    photoForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const photoFile = form.get("photo");
      if (photoFile instanceof File && photoFile.size > 0) {
        form.set("photo", await optimizeImageFile(photoFile));
      }

      try {
        await apiFetch(`/vehicles/${vehicle.id}/photos`, {
          method: "POST",
          body: form,
          isMultipart: true,
        });

        addSystemMessage("success", "Foto cargada", `La galeria de ${vehicle.plate} fue actualizada.`);
        await Promise.all([loadPublicCatalog({ force: true }), loadPrivateVehicles()]);
        if (options.panelMode) {
          await renderVehicleDetailIntoContainer(vehicle.id, container, {
            panelMode: true,
            detailMode: options.detailMode || "summary",
          });
        } else {
          await renderVehicleRoute(vehicle.id, { detailMode: options.detailMode || "summary" });
        }
      } catch (error) {
        pushToast("error", error.message);
        addSystemMessage("error", "Fallo al subir foto", error.message);
      }
    });
  }

  deletePhotoButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const photoId = button.dataset.deletePhoto;
      if (!photoId) return;

      const confirmed = window.confirm("Esta foto se eliminara del vehiculo. Deseas continuar?");
      if (!confirmed) return;

      setButtonLoading(button, true, "Eliminando...");

      try {
        await apiFetch(`/vehicles/${vehicle.id}/photos/${photoId}`, {
          method: "DELETE",
        });

        addSystemMessage("success", "Foto eliminada", `Se elimino una imagen de ${vehicle.plate}.`);
        pushToast("success", "Foto eliminada correctamente.");
        await Promise.all([loadPublicCatalog({ force: true }), loadPrivateVehicles()]);
        if (options.panelMode) {
          await renderVehicleDetailIntoContainer(vehicle.id, container, {
            panelMode: true,
            detailMode: options.detailMode || "summary",
          });
        } else {
          await renderVehicleRoute(vehicle.id, { detailMode: options.detailMode || "summary" });
        }
      } catch (error) {
        setButtonLoading(button, false);
        pushToast("error", error.message);
        addSystemMessage("error", "Fallo al eliminar foto", error.message);
      }
    });
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);

  try {
    const response = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: String(form.get("identifier")).trim(),
        password: form.get("password"),
      }),
      auth: false,
    });

    state.token = response.token;
    state.user = response.user;
    localStorage.setItem(STORAGE_KEYS.token, state.token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
    localStorage.removeItem(STORAGE_KEYS.legacyToken);
    localStorage.removeItem(STORAGE_KEYS.legacyUser);
    addSystemMessage("success", "Sesion iniciada", `${state.user.name} entro como ${state.user.role}.`);
    await loadPrivateData();
    navigate(getDefaultPrivateRoute(), { replace: true });
    pushToast("success", "Sesion iniciada correctamente.");
  } catch (_error) {
    pushToast("error", "Usuario o contrasena incorrectos");
  }
}

function handleLogout() {
  state.token = "";
  state.user = null;
  state.privateVehicles = [];
  state.operators = [];
  state.administrators = [];
  state.financeRecords = [];
  state.financeSummary = { income: 0, expenses: 0, balance: 0, byType: {} };
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
  localStorage.removeItem(STORAGE_KEYS.legacyToken);
  localStorage.removeItem(STORAGE_KEYS.legacyUser);
  closeMobileSidebar();
  navigate("/", { replace: true });
  pushToast("info", "Sesion cerrada.");
}

async function handleCreateUser(event) {
  event.preventDefault();
  if (state.user?.role !== "ADMIN") return;

  const formElement = event.currentTarget;
  const form = new FormData(formElement);

  try {
    const user = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify({
        name: String(form.get("name")).trim(),
        identifier: String(form.get("identifier")).trim(),
        password: String(form.get("password")),
        role: String(form.get("role")),
      }),
    });

    formElement.reset();
    addSystemMessage("success", "Usuario creado", `${user.name} fue registrado como ${user.role}.`);
    pushToast("success", "Usuario creado correctamente.");
    await Promise.all([loadOperators(), loadAdministrators()]);
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al crear usuario", error.message);
  }
}

async function handleRequestProfileEmailVerification(event) {
  event.preventDefault();
  if (!state.token) return;

  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const submitButton = formElement.querySelector('button[type="submit"]');

  setButtonLoading(submitButton, true, "Enviando...");

  try {
    const response = await apiFetch("/users/me/email-verification/request", {
      method: "POST",
      body: JSON.stringify({
        contactEmail: String(form.get("contactEmail") || "").trim(),
      }),
    });

    state.user = response.user;
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
    renderCurrentRoute();
    pushToast("success", response.message || "Codigo enviado correctamente.");
  } catch (error) {
    setButtonLoading(submitButton, false);
    pushToast("error", error.message);
  }
}

async function handleConfirmProfileEmailVerification(event) {
  event.preventDefault();
  if (!state.token) return;

  const formElement = event.currentTarget;
  const form = new FormData(formElement);
  const submitButton = formElement.querySelector('button[type="submit"]');

  setButtonLoading(submitButton, true, "Verificando...");

  try {
    const response = await apiFetch("/users/me/email-verification/confirm", {
      method: "POST",
      body: JSON.stringify({
        code: String(form.get("code") || "").trim(),
      }),
    });

    state.user = response.user;
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
    renderCurrentRoute();
    pushToast("success", response.message || "Correo verificado correctamente.");
  } catch (error) {
    setButtonLoading(submitButton, false);
    pushToast("error", error.message);
  }
}

async function handleCreateVehicle(event) {
  event.preventDefault();
  if (!state.token || state.user?.role !== "ADMIN") return;

  const formElement = event.currentTarget;
  const form = new FormData(formElement);

  setFormBusy(formElement, true, "Guardando vehiculo...");

  try {
    const createdVehicle = await apiFetch("/vehicles", {
      method: "POST",
      body: JSON.stringify({
        plate: String(form.get("plate")).trim(),
        vin: emptyToUndefined(form.get("vin")),
        brand: String(form.get("brand")).trim(),
        model: String(form.get("model")).trim(),
        assignedOperator: emptyToUndefined(form.get("assignedOperator")),
        year: Number(form.get("year")),
        currentStatus: emptyToUndefined(form.get("currentStatus")),
      }),
    });

    const photoFile = form.get("photo");
    if (photoFile instanceof File && photoFile.size > 0) {
      const optimizedPhotoFile = await optimizeImageFile(photoFile);
      const photoForm = new FormData();
      photoForm.append("photo", optimizedPhotoFile);

      await apiFetch(`/vehicles/${createdVehicle.id}/photos`, {
        method: "POST",
        body: photoForm,
        isMultipart: true,
      });
    }

    formElement.reset();
    formElement.querySelector('[name="year"]').value = "2024";
    addSystemMessage(
      "success",
      "Vehiculo creado",
      photoFile instanceof File && photoFile.size > 0
        ? "La nueva unidad se agrego al inventario con su imagen."
        : "La nueva unidad se agrego al inventario."
    );
    pushToast(
      "success",
      photoFile instanceof File && photoFile.size > 0
        ? "Vehiculo e imagen guardados correctamente."
        : "Vehiculo creado correctamente."
    );
    await Promise.all([loadPublicCatalog({ force: true }), loadPrivateVehicles()]);
    if (state.user.role === "ADMIN") {
      navigate("/dashboard");
    }
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al crear vehiculo", error.message);
  } finally {
    setFormBusy(formElement, false);
  }
}

async function handleCreateFinanceRecord(event) {
  event.preventDefault();
  if (!canAccessFinance()) return;

  const formElement = event.currentTarget;
  const form = new FormData(formElement);

  setFormBusy(formElement, true, "Guardando movimiento...");

  try {
    const dateValue = String(form.get("date") || "");
    await apiFetch("/finance", {
      method: "POST",
      body: JSON.stringify({
        type: String(form.get("type")),
        concept: String(form.get("concept")).trim(),
        amount: Number(form.get("amount")),
        date: dateInputToIsoString(dateValue),
        client: emptyToUndefined(form.get("client")),
        vehicleId: emptyToUndefined(form.get("vehicleId")),
        observations: emptyToUndefined(form.get("observations")),
        costPerKm: emptyToUndefined(form.get("costPerKm")),
        averageFreight: emptyToUndefined(form.get("averageFreight")),
        associatedCosts: emptyToUndefined(form.get("associatedCosts")),
      }),
    });

    formElement.reset();
    addSystemMessage("success", "Movimiento financiero creado", "El registro fue guardado correctamente.");
    pushToast("success", "Movimiento financiero guardado.");
    await loadFinanceData({ force: true });
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al guardar movimiento financiero", error.message);
  } finally {
    setFormBusy(formElement, false);
  }
}

async function handleDeleteFinanceRecord(recordId) {
  if (!canAccessFinance()) return;

  const record = state.financeRecords.find((item) => item.id === recordId);
  const label = record ? record.concept : "este movimiento";
  if (!window.confirm(`Vas a eliminar ${label}. Esta accion no se puede deshacer.`)) {
    return;
  }

  try {
    await apiFetch(`/finance/${recordId}`, { method: "DELETE" });
    addSystemMessage("success", "Movimiento financiero eliminado", `${label} fue eliminado correctamente.`);
    pushToast("success", "Movimiento financiero eliminado.");
    await loadFinanceData({ force: true });
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al eliminar movimiento financiero", error.message);
  }
}

async function handleEditFinanceRecord(recordId) {
  if (!canAccessFinance()) return;

  const record = state.financeRecords.find((item) => item.id === recordId);
  if (!record) return;

  const nextType = window.prompt(
    "Tipo (INGRESO, EGRESO, FLETE, COMPRA_VEHICULO, VENTA_VEHICULO, COSTO_OPERATIVO, MANTENIMIENTO)",
    record.type
  );
  if (nextType === null) return;

  const nextConcept = window.prompt("Concepto", record.concept);
  if (nextConcept === null) return;

  const nextAmount = window.prompt("Valor", String(record.amount || 0));
  if (nextAmount === null) return;

  const nextDate = window.prompt("Fecha (YYYY-MM-DD)", formatDateInputValue(record.date));
  if (nextDate === null) return;

  const normalizedType = nextType.trim().toUpperCase();
  const normalizedAmount = Number(nextAmount);
  if (
    !["INGRESO", "EGRESO", "FLETE", "COMPRA_VEHICULO", "VENTA_VEHICULO", "COSTO_OPERATIVO", "MANTENIMIENTO"].includes(
      normalizedType
    ) ||
    !nextConcept.trim() ||
    Number.isNaN(normalizedAmount)
  ) {
    pushToast("error", "Tipo, concepto y valor deben ser validos.");
    return;
  }

  try {
    await apiFetch(`/finance/${recordId}`, {
      method: "PATCH",
      body: JSON.stringify({
        type: normalizedType,
        concept: nextConcept.trim(),
        amount: normalizedAmount,
        date: dateInputToIsoString(nextDate),
      }),
    });

    addSystemMessage("success", "Movimiento financiero actualizado", `${nextConcept.trim()} fue actualizado correctamente.`);
    pushToast("success", "Movimiento financiero actualizado.");
    await loadFinanceData({ force: true });
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al actualizar movimiento financiero", error.message);
  }
}

function setFormBusy(formElement, isBusy, buttonLabel = "Procesando...") {
  const controls = formElement.querySelectorAll("input, select, textarea, button");
  controls.forEach((control) => {
    control.disabled = isBusy;
  });

  const submitButton = formElement.querySelector('button[type="submit"]');
  if (submitButton) {
    setButtonLoading(submitButton, isBusy, buttonLabel);
  }
}

function setButtonLoading(button, isLoading, loadingText) {
  if (!button) return;

  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent.trim();
  }

  if (isLoading) {
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    button.innerHTML = `<span class="button-spinner" aria-hidden="true"></span><span>${escapeHtml(loadingText)}</span>`;
    return;
  }

  button.classList.remove("is-loading");
  button.removeAttribute("aria-busy");
  button.textContent = button.dataset.defaultLabel;
}

async function optimizeImageFile(file) {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 350 * 1024) {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await canvasToBlob(canvas, "image/webp", 0.82) || await canvasToBlob(canvas, "image/jpeg", 0.82);
    if (!blob || blob.size >= file.size) return file;

    const extension = blob.type === "image/webp" ? "webp" : "jpg";
    const optimizedName = file.name.replace(/\.[^.]+$/, `.${extension}`);
    return new File([blob], optimizedName, { type: blob.type, lastModified: Date.now() });
  } catch (_error) {
    return file;
  }
}

async function handleEditUser(userId) {
  const user = state.operators.find((item) => item.id === userId);
  if (!user || state.user?.role !== "ADMIN") return;

  const nextName = window.prompt("Nombre del usuario", user.name);
  if (nextName === null) return;

  const nextIdentifier = window.prompt("Email o identificador del usuario", user.email);
  if (nextIdentifier === null) return;

  const nextRole = window.prompt("Rol del usuario (DIRECTOR o GERENTE)", user.role);
  if (nextRole === null) return;

  const nextPassword = window.prompt("Nueva contrasena (deja vacio para no cambiarla)", "");
  if (nextPassword === null) return;

  const trimmedName = nextName.trim();
  const trimmedIdentifier = nextIdentifier.trim();
  const normalizedRole = nextRole.trim().toUpperCase();
  if (!trimmedName || !trimmedIdentifier || !["DIRECTOR", "GERENTE"].includes(normalizedRole)) {
    pushToast("error", "Nombre, usuario y rol valido son obligatorios.");
    return;
  }

  try {
    await apiFetch(`/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: trimmedName,
        identifier: trimmedIdentifier,
        role: normalizedRole,
        ...(nextPassword.trim() ? { password: nextPassword.trim() } : {}),
      }),
    });

    addSystemMessage("success", "Usuario actualizado", `${trimmedName} fue actualizado correctamente.`);
    pushToast("success", "Usuario actualizado correctamente.");
    await loadOperators();
  } catch (error) {
    pushToast("error", error.message);
    addSystemMessage("error", "Fallo al actualizar usuario", error.message);
  }
}

async function loadFinanceData(options = {}) {
  const { silent = false } = options;
  if (!canAccessFinance()) return;
  if (state.refreshLocks.finance) return;
  state.refreshLocks.finance = true;

  try {
    const [records, summary] = await Promise.all([apiFetch("/finance"), apiFetch("/finance/summary")]);
    state.financeRecords = records;
    state.financeSummary = summary;
    renderCurrentRoute();
  } catch (error) {
    if (!silent) {
      pushToast("error", error.message);
    }
  } finally {
    state.refreshLocks.finance = false;
  }
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

function toggleSidebar() {
  if (isMobileViewport() && !state.mobileSidebarOpen) {
    state.mobileSidebarOpen = true;
  }
  state.sidebarCollapsed = !state.sidebarCollapsed;
  localStorage.setItem("sidebar_collapsed", String(state.sidebarCollapsed));
  applySidebarState();
}

function applySidebarState() {
  elements.sidebar.classList.toggle("collapsed", state.sidebarCollapsed);
  elements.sidebarToggleButton.setAttribute("aria-label", state.sidebarCollapsed ? "Expandir menu" : "Colapsar menu");
  elements.sidebarLogoutButton.innerHTML = state.sidebarCollapsed
    ? SIDEBAR_ICONS.logout
    : `${SIDEBAR_ICONS.logout}<span>Cerrar sesion</span>`;
  syncMobileSidebarUI();
}

function toggleMobileSidebar() {
  if (state.mobileSidebarOpen) {
    closeMobileSidebar();
    return;
  }

  state.mobileSidebarOpen = true;
  if (isMobileViewport() && !state.sidebarCollapsed) {
    state.sidebarCollapsed = true;
    localStorage.setItem("sidebar_collapsed", "true");
  }
  applySidebarState();
}

function closeMobileSidebar() {
  if (!state.mobileSidebarOpen) return;
  state.mobileSidebarOpen = false;
  syncMobileSidebarUI();
}

function handleWindowResize() {
  if (!isMobileViewport()) {
    state.mobileSidebarOpen = false;
  }
  syncMobileSidebarUI();
}

function syncMobileSidebarUI() {
  const isMobile = isMobileViewport();
  elements.appShell.classList.toggle("mobile-sidebar-open", isMobile && state.mobileSidebarOpen);
  elements.sidebar.classList.toggle("mobile-open", isMobile && state.mobileSidebarOpen);
  elements.mobileSidebarBackdrop.classList.toggle("hidden", !(isMobile && state.mobileSidebarOpen));
  elements.mobileSidebarButton.classList.toggle("hidden", !isMobile);
  elements.mobileSidebarButton.setAttribute("aria-label", isMobile && state.mobileSidebarOpen ? "Cerrar menu" : "Abrir menu");
  elements.mobileSidebarButton.innerHTML = isMobile && state.mobileSidebarOpen
    ? '<span class="mobile-sidebar-button-icon">×</span>'
    : '<span class="mobile-sidebar-button-icon">☰</span>';
  document.body.classList.toggle("mobile-sidebar-open", isMobile && state.mobileSidebarOpen);
}

function isMobileViewport() {
  return window.innerWidth <= 768;
}

function setBadge(element, label, badgeClass) {
  element.textContent = label;
  element.className = `status-pill ${badgeClass}`;
}

function getStatusMeta(status) {
  return STATUS_META[status] || { label: status, className: "neutral" };
}

function pushToast(type, message) {
  const toast = document.createElement("article");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  elements.toastContainer.prepend(toast);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function addSystemMessage(type, title, description) {
  state.systemMessages.unshift({
    type,
    title,
    description,
    createdAt: new Date().toISOString(),
  });
  state.systemMessages = state.systemMessages.slice(0, 40);
  persistMessages();
  if (resolveRoute(location.pathname).name === "adminMessages") {
    renderAdminMessages();
  }
}

function persistMessages() {
  localStorage.setItem("admin_system_messages", JSON.stringify(state.systemMessages));
}

async function apiFetch(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    isMultipart = false,
    fresh = false,
  } = options;

  const headers = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  if (auth && state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const requestUrl = method === "GET" && fresh ? appendFreshQuery(path) : path;
  const response = await fetch(requestUrl, {
    method,
    headers,
    body,
    cache: method === "GET" && !fresh ? "default" : "no-store",
    credentials: "same-origin",
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(buildErrorMessage(data));
  }
  return data;
}

function appendFreshQuery(path) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}_ts=${Date.now()}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return {};
}

function buildErrorMessage(data) {
  if (!data || typeof data !== "object") {
    return "La solicitud fallo.";
  }

  if (Array.isArray(data.details) && data.details.length) {
    return `${data.message}: ${data.details.map((detail) => `${detail.path} ${detail.message}`).join(", ")}`;
  }

  return data.message || "La solicitud fallo.";
}

function isVehicleUploadUrl(url) {
  return typeof url === "string" && url.startsWith("/uploads/vehicles/");
}

function vehicleImageUrl(url, width) {
  if (!isVehicleUploadUrl(url)) return url;

  try {
    const fileName = decodeURIComponent(url.split("/").pop() || "");
    return `/images/vehicles/${encodeURIComponent(fileName)}?w=${width}`;
  } catch (_error) {
    return url;
  }
}

function vehicleImageSrcSet(url, widths) {
  if (!isVehicleUploadUrl(url)) return "";
  return widths.map((width) => `${vehicleImageUrl(url, width)} ${width}w`).join(", ");
}

function setVehicleImage(image, url, plate, options = {}) {
  const {
    fallbackLabel = plate,
    width = 480,
    widths = [320, 480, 640],
    sizes = "100vw",
  } = options;
  const source = url || placeholderImage(fallbackLabel);

  image.src = vehicleImageUrl(source, width);
  image.alt = `Vehiculo ${plate}`;

  const srcset = vehicleImageSrcSet(source, widths);
  if (srcset) {
    image.srcset = srcset;
    image.sizes = sizes;
  } else {
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
  }
}

function vehicleImageAttributes(url, plate, options = {}) {
  const {
    width = 960,
    widths = [480, 640, 960, 1280],
    sizes = "100vw",
    className = "",
    loading = "lazy",
  } = options;
  const source = url || placeholderImage(plate);
  const src = vehicleImageUrl(source, width);
  const srcset = vehicleImageSrcSet(source, widths);
  const srcsetAttribute = srcset ? ` srcset="${escapeAttribute(srcset)}" sizes="${escapeAttribute(sizes)}"` : "";
  const classAttribute = className ? ` class="${escapeAttribute(className)}"` : "";

  return `src="${escapeAttribute(src)}"${srcsetAttribute}${classAttribute} alt="Vehiculo ${escapeAttribute(
    plate
  )}" loading="${escapeAttribute(loading)}" decoding="async"`;
}

function placeholderImage(label) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#ffffff" />
      <rect width="600" height="400" fill="url(#placeholderGlow)" opacity="0.82" />
      <defs>
        <radialGradient id="placeholderGlow" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="58%" stop-color="#2db5e8" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#1f7ae0" stop-opacity="0.08" />
        </radialGradient>
      </defs>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#1f7ae0" font-family="Arial, sans-serif" font-size="42">${escapeHtml(label)}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function formatDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderDetailField(label, value, options = {}) {
  const toneClass = options.tone ? ` detail-row-${options.tone}` : "";
  const compactClass = options.compact === false ? " detail-row-wide" : "";

  return `
    <article class="detail-row${compactClass}${toneClass}">
      <strong>${escapeHtml(label)}:</strong>
      <span>${escapeHtml(value)}</span>
    </article>
  `;
}

function buildComplianceEntry(label, value) {
  if (!value) {
    return {
      label,
      tone: "neutral",
      message: "No registrado",
    };
  }

  const today = new Date();
  const currentUtcDate = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const expiryDate = new Date(value);
  const expiryUtcDate = Date.UTC(expiryDate.getUTCFullYear(), expiryDate.getUTCMonth(), expiryDate.getUTCDate());
  const dayDifference = Math.round((expiryUtcDate - currentUtcDate) / 86400000);

  if (dayDifference < 0) {
    return {
      label,
      tone: "danger",
      message: `Vencido hace ${Math.abs(dayDifference)} dia${Math.abs(dayDifference) === 1 ? "" : "s"}`,
    };
  }

  if (dayDifference <= 30) {
    return {
      label,
      tone: "warning",
      message: `Vence en ${dayDifference} dia${dayDifference === 1 ? "" : "s"}`,
    };
  }

  return {
    label,
    tone: "success",
    message: "Vigente",
  };
}

function formatHistoryValue(value) {
  return value || "Sin dato";
}

function formatAdminHistoryChange(item) {
  return `${formatHistoryValue(item.oldValue)} -> ${formatHistoryValue(item.newValue)}`;
}

function formatCalendarDate(value) {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Sin fecha";
  }

  return date.toLocaleDateString("es-CO", {
    dateStyle: "medium",
    timeZone: "UTC",
  });
}

function formatDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function dateInputToIsoString(value) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return undefined;
  }

  return new Date(`${normalized}T00:00:00.000Z`).toISOString();
}

function initialsForName(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function emptyToUndefined(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized : undefined;
}

function canAccessFinance() {
  return state.user?.role === "GERENTE" || isPrimaryAdminUser();
}

function getDefaultPrivateRoute() {
  if (canAccessFinance() && state.user?.role === "GERENTE") {
    return "/finanzas";
  }

  if (state.user?.role === "ADMIN") {
    return "/dashboard";
  }

  return "/catalogo";
}

function isFinanceIncome(type) {
  return ["INGRESO", "FLETE", "VENTA_VEHICULO"].includes(type);
}

function getFinanceTypeLabel(type) {
  const labels = {
    INGRESO: "Ingreso",
    EGRESO: "Egreso",
    FLETE: "Flete",
    COMPRA_VEHICULO: "Compra de vehiculo",
    VENTA_VEHICULO: "Venta de vehiculo",
    COSTO_OPERATIVO: "Costo operativo",
    MANTENIMIENTO: "Mantenimiento",
  };

  return labels[type] || type;
}

function formatMoney(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function readJson(key) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (_error) {
    return null;
  }
}

function isPrimaryAdminUser() {
  return PRIMARY_ADMIN_IDS.includes(state.user?.id) && PRIMARY_ADMIN_EMAILS.includes(String(state.user?.email || "").toLowerCase());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function iconSvg(paths) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
