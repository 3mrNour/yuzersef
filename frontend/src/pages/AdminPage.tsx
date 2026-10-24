import {
  ArrowClockwise,
  ArrowUpRight,
  CheckCircle,
  CircleNotch,
  DownloadSimple,
  EnvelopeSimple,
  FileImage,
  Key,
  LockKey,
  PhoneCall,
  SignOut,
  Sparkle,
  UserList,
  WarningCircle,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  fetchAdminContacts,
  fetchAdminRequests,
  fetchAdminSummary,
  fetchAdminPrintSettings,
  fetchAdminPortfolio,
  createAdminPortfolioItem,
  updateAdminPortfolioItem,
  deleteAdminPortfolioItem,
  updateAdminItemPlacement,
  updateAdminRequestStatus,
  updateAdminPrintSettings,
  type AdminContact,
  type AdminRequest,
  type AdminSummary,
  type PrintPlacement,
  type RequestStatus,
  type PrintPlacementSettings,
  type PrintPlacementProfile,
  type PortfolioItem,
} from "../lib/api";
import type { ServiceSlug } from "../content";
import type { Studio3DZone } from "../features/studio/studio3d";
import { cn } from "../lib/cn";
import { buttonClass } from "../lib/styles";
import { useLanguage } from "../providers/LanguageProvider";

const KEY_STORAGE = "yuzersef.adminKey";
const statuses: RequestStatus[] = ["received", "review", "confirmed", "closed"];
const serviceNames: Record<ServiceSlug, { ar: string; en: string }> = {
  clothing: { ar: "ملابس", en: "Clothing" },
  mugs: { ar: "مجات", en: "Mugs" },
  caps: { ar: "كابات", en: "Caps" },
  stickers: { ar: "ستيكرز", en: "Stickers" },
  cases: { ar: "جرابات", en: "Phone cases" },
};
const placementOptions: Array<{ value: PrintPlacement; label: { ar: string; en: string } }> = [
  { value: "front", label: { ar: "الأمام", en: "Front" } },
  { value: "back", label: { ar: "الخلف", en: "Back" } },
  { value: "left-sleeve", label: { ar: "الكم الأيسر", en: "Left sleeve" } },
  { value: "right-sleeve", label: { ar: "الكم الأيمن", en: "Right sleeve" } },
  { value: "custom", label: { ar: "موضع مخصص", en: "Custom placement" } },
];

function statusLabel(status: RequestStatus, lang: "ar" | "en"): string {
  const labels = {
    received: { ar: "وصل جديد", en: "Received" },
    review: { ar: "قيد المراجعة", en: "Under review" },
    confirmed: { ar: "تم التأكيد", en: "Confirmed" },
    closed: { ar: "مغلق", en: "Closed" },
  };
  return labels[status][lang];
}

function placementLabel(value: PrintPlacement | undefined, lang: "ar" | "en"): string {
  const match = placementOptions.find((option) => option.value === value) ?? placementOptions[0];
  return match.label[lang];
}

function dateLabel(value: string | null, lang: "ar" | "en"): string {
  if (!value) return lang === "ar" ? "لا يوجد" : "None yet";
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusClasses(status: RequestStatus): string {
  switch (status) {
    case "received":
      return "border-sand/40 bg-sand/10 text-sand";
    case "review":
      return "border-sand/40 bg-sand/10 text-sand";
    case "confirmed":
      return "border-[#8de5b3]/30 bg-[#8de5b3]/10 text-[#b7f1cf]";
    case "closed":
      return "border-bone/30 bg-bone/10 text-bone";
    default:
      return "border-bone/20 bg-bone/5 text-bone";
  }
}

export function AdminPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [key, setKey] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? "");
  const [keyInput, setKeyInput] = useState("");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [requestPage, setRequestPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const [requestPages, setRequestPages] = useState(1);
  const [contactPages, setContactPages] = useState(1);
  const [requestFilter, setRequestFilter] = useState<RequestStatus | "all">("all");
  const [section, setSection] = useState<"requests" | "contacts" | "settings" | "portfolio">("requests");
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioSaving, setPortfolioSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");

  const copy = useMemo(
    () =>
      ar
        ? {
            title: "لوحة الإدارة",
            subtitle: "مراجعة الطلبات ورسائل العملاء والإشراف على التنفيذ بوضوح كامل.",
            keyTitle: "تسجيل دخول الإدارة",
            keyHint: "استخدم مفتاح الإدارة للوصول إلى لوحة التشغيل.",
            keyPlaceholder: "مفتاح الإدارة",
            enter: "دخول آمن",
            logout: "تسجيل الخروج",
            requests: "الطلبات",
            contacts: "الرسائل",
            all: "الكل",
            refresh: "تحديث",
            totalRequests: "إجمالي الطلبات",
            totalContacts: "رسائل التواصل",
            latestRequest: "آخر طلب",
            latestContact: "آخر رسالة",
            pieces: "قطعة",
            phone: "واتساب",
            special: "طلب خاص",
            noItems: "لا توجد بيانات حتى الآن.",
            previous: "السابق",
            next: "التالي",
            unauthorized: "المفتاح غير صحيح أو انتهت الجلسة.",
            genericError: "حصلت مشكلة أثناء تحميل البيانات.",
            status: "الحالة",
            design: "التصميم",
            preview: "معاينة",
            details: "تفاصيل الطلب",
            customer: "العميل",
            itemDetails: "تفاصيل القطع",
            placement: "موضع الطباعة",
            download: "تحميل التصميم",
            updateStatus: "تحديث الحالة",
            notes: "ملاحظات العميل",
            noDesign: "لا توجد صورة تصميم مرفقة.",
            noSelection: "اختر طلبًا من القائمة لعرض التفاصيل.",
            settings: "إعدادات الطباعة",
            settingsIntro: "حدد مواضع الطباعة المتاحة لكل نوع منتج قبل استقبال الطلبات.",
            saveSettings: "حفظ الإعدادات",
            settingsSaved: "تم حفظ إعدادات مواضع الطباعة.",
            portfolio: "أعمالنا",
            portfolioIntro: "أضف وعدّل واحذف الأعمال الظاهرة في الصفحة الرئيسية.",
            duplicatePortfolioImage: "الصورة مستخدمة بالفعل. اختر صورة مختلفة قبل الحفظ.",
          }
        : {
            title: "Operations dashboard",
            subtitle: "Track incoming requests, customer messages, and production decisions clearly.",
            keyTitle: "Admin access",
            keyHint: "Use your admin access key to continue.",
            keyPlaceholder: "Admin access key",
            enter: "Secure sign in",
            logout: "Sign out",
            requests: "Requests",
            contacts: "Messages",
            all: "All",
            refresh: "Refresh",
            totalRequests: "Total requests",
            totalContacts: "Contact messages",
            latestRequest: "Latest request",
            latestContact: "Latest message",
            pieces: "pieces",
            phone: "WhatsApp",
            special: "Special request",
            noItems: "No records yet.",
            previous: "Previous",
            next: "Next",
            unauthorized: "The key is invalid or the session expired.",
            genericError: "Something went wrong while loading the dashboard.",
            status: "Status",
            design: "Design",
            preview: "Preview",
            details: "Request details",
            customer: "Customer",
            itemDetails: "Item details",
            placement: "Print placement",
            download: "Download design",
            updateStatus: "Update status",
            notes: "Customer notes",
            noDesign: "No uploaded design available.",
            noSelection: "Select a request from the list to view details.",
            settings: "Print settings",
            settingsIntro: "Choose which print positions customers can select for each product type.",
            saveSettings: "Save settings",
            settingsSaved: "Print position settings saved.",
            portfolio: "Portfolio",
            portfolioIntro: "Create, edit, and remove the work shown on the home page.",
            duplicatePortfolioImage: "That image is already used. Choose a different image before saving.",
          },
    [ar],
  );
  const [printSettings, setPrintSettings] = useState<PrintPlacementSettings | null>(null);
  const [printProfiles, setPrintProfiles] = useState<Record<string, PrintPlacementProfile>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedRequestId) ?? requests[0] ?? null,
    [requests, selectedRequestId],
  );

  const load = useCallback(async () => {
    if (!key) return;
    setLoading(true);
    setMessage("");
    try {
      const [nextSummary, nextRequests, nextContacts, nextPrintSettings, nextPortfolio] = await Promise.all([
        fetchAdminSummary(key),
        fetchAdminRequests(key, requestPage, requestFilter),
        fetchAdminContacts(key, contactPage),
        fetchAdminPrintSettings(key),
        fetchAdminPortfolio(key),
      ]);
      setSummary(nextSummary);
      setRequests(nextRequests.items);
      setRequestPages(Math.max(1, nextRequests.pages));
      setContacts(nextContacts.items);
      setContactPages(Math.max(1, nextContacts.pages));
      setPrintSettings(nextPrintSettings.placements);
      setPrintProfiles(nextPrintSettings.profiles);
      setPortfolioItems(nextPortfolio.items);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        sessionStorage.removeItem(KEY_STORAGE);
        setKey("");
        setMessage(copy.unauthorized);
      } else {
        setMessage(copy.genericError);
      }
    } finally {
      setLoading(false);
    }
  }, [contactPage, copy, key, requestFilter, requestPage]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (requests.length === 0) {
      setSelectedRequestId("");
      return;
    }
    if (!selectedRequestId || !requests.some((request) => request.id === selectedRequestId)) {
      setSelectedRequestId(requests[0].id);
    }
  }, [requests, selectedRequestId]);

  function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextKey = keyInput.trim();
    if (!nextKey) return;
    sessionStorage.setItem(KEY_STORAGE, nextKey);
    setKey(nextKey);
    setKeyInput("");
  }

  function signOut() {
    sessionStorage.removeItem(KEY_STORAGE);
    setKey("");
    setSummary(null);
    setRequests([]);
    setContacts([]);
    setSelectedRequestId("");
  }

  async function changeStatus(request: AdminRequest, status: RequestStatus) {
    if (status === request.status) return;
    setUpdatingId(request.id);
    try {
      await updateAdminRequestStatus(key, request.id, status);
      await load();
    } catch {
      setMessage(copy.genericError);
    } finally {
      setUpdatingId("");
    }
  }

  async function changePlacement(requestId: string, itemIndex: number, placement: PrintPlacement) {
    try {
      await updateAdminItemPlacement(key, requestId, itemIndex, placement);
      await load();
    } catch {
      setMessage(copy.genericError);
    }
  }

  function togglePrintPlacement(productId: string, placement: PrintPlacement) {
    setPrintProfiles((current) => {
      const profile = current[productId];
      if (!profile) return current;
      const placements = profile.placements.includes(placement)
        ? profile.placements.filter((value) => value !== placement)
        : [...profile.placements, placement];
      return placements.length ? { ...current, [productId]: { ...profile, placements } } : current;
    });
  }

  async function savePrintSettings() {
    if (!printSettings) return;
    setSettingsSaving(true);
    try {
      const result = await updateAdminPrintSettings(key, printSettings, printProfiles);
      setPrintSettings(result.placements);
      setPrintProfiles(result.profiles);
      setMessage(copy.settingsSaved);
    } catch {
      setMessage(copy.genericError);
    } finally {
      setSettingsSaving(false);
    }
  }

  async function savePortfolioItem(item: PortfolioItem) {
      setPortfolioSaving(true);
      try {
        if (item.id.startsWith("draft-")) {
          const { id: _draftId, ...newItem } = item;
          const result = await createAdminPortfolioItem(key, newItem);
          setPortfolioItems((current) => current.map((entry) => entry.id === item.id ? result.item : entry));
          return;
        }
        const result = await updateAdminPortfolioItem(key, item.id, item);
        setPortfolioItems((current) => current.map((entry) => entry.id === item.id ? result.item : entry));
      } catch (error) {
        setMessage(error instanceof ApiError && error.code === "duplicate_image"
          ? copy.duplicatePortfolioImage
          : copy.genericError);
      } finally {
        setPortfolioSaving(false);
      }
    }

  async function addPortfolioItem() {
      setPortfolioItems((current) => [
        ...current,
        {
          id: `draft-${Date.now()}`,
          category: "clothing",
          titleAr: "عمل جديد",
          titleEn: "New work",
          altAr: "صورة عمل جديد",
          altEn: "New portfolio work",
          image: "/mock/tshirt.jpg",
          sortOrder: current.length,
          active: true,
        },
      ]);
    }

  async function removePortfolioItem(id: string) {
      if (id.startsWith("draft-")) {
        setPortfolioItems((current) => current.filter((item) => item.id !== id));
        return;
      }
      setPortfolioSaving(true);
      try {
        await deleteAdminPortfolioItem(key, id);
        setPortfolioItems((current) => current.filter((item) => item.id !== id));
      } catch {
        setMessage(copy.genericError);
      } finally {
        setPortfolioSaving(false);
    }
  }

  if (!key) {
    return (
      <main className="min-h-screen bg-forest-950 px-5 py-12 text-bone" dir={ar ? "rtl" : "ltr"}>
        <div className="mx-auto grid max-w-5xl gap-6 pt-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-sand/25 bg-forest-900 p-6 sm:p-8">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-sand/30 bg-sand/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-sand">
              <Sparkle size={16} /> Yuzersef
            </div>
            <h1 className="text-3xl font-semibold text-bone md:text-5xl">{copy.keyTitle}</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-bone/75">{copy.keyHint}</p>
            <div className="mt-8 space-y-3 text-sm text-bone/70">
              <div className="flex items-center gap-3"><CheckCircle size={18} className="text-sand" /> {ar ? "إدارة الطلبات" : "Request operations"}</div>
              <div className="flex items-center gap-3"><CheckCircle size={18} className="text-sand" /> {ar ? "تحديث حالات التنفيذ" : "Status workflows"}</div>
              <div className="flex items-center gap-3"><CheckCircle size={18} className="text-sand" /> {ar ? "مراجعة ملفات التصميم" : "Design review"}</div>
            </div>
          </div>

          <form onSubmit={signIn} className="rounded-[32px] border border-bone/15 bg-forest-900 p-6 shadow-2xl shadow-black/25 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-sand/10 p-2 text-sand">
                <LockKey size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-bone/70">Secure access</p>
                <h2 className="mt-1 text-2xl text-bone">{copy.keyTitle}</h2>
              </div>
            </div>

            <label htmlFor="admin-key" className="mb-2 block text-sm font-medium text-bone">{copy.keyPlaceholder}</label>
            <div className="relative">
              <Key aria-hidden="true" size={18} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-bone/60" />
              <input
                id="admin-key"
                type="password"
                autoComplete="current-password"
                className="field ps-11"
                placeholder={copy.keyPlaceholder}
                value={keyInput}
                onChange={(event) => setKeyInput(event.target.value)}
              />
            </div>
            {message ? <p role="alert" className="mt-3 text-sm text-[#ffb0a1]">{message}</p> : null}
            <button type="submit" className={cn(buttonClass("primary"), "mt-6 w-full")}>
              <LockKey size={18} /> {copy.enter}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-forest-950 px-4 py-6 text-bone sm:px-6 lg:px-8" dir={ar ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[28px] border border-sand/15 bg-forest-900/80 p-5 shadow-2xl shadow-black/25 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-latin text-xs uppercase tracking-[0.2em] text-sand">Yuzersef / Admin</p>
              <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{copy.title}</h1>
              <p className="mt-2 text-sm text-bone/70">{copy.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void load()} className={cn(buttonClass("secondary"), "px-4")} disabled={loading}>
                <ArrowClockwise size={18} className={loading ? "animate-spin" : undefined} /> {copy.refresh}
              </button>
              <button type="button" onClick={signOut} className={cn(buttonClass("secondary"), "px-4")}>
                <SignOut size={18} /> {copy.logout}
              </button>
            </div>
          </div>
        </header>

        {message ? (
          <div role="alert" className="mt-5 flex items-center gap-2 rounded-[var(--radius-field)] border border-danger/30 bg-danger/10 p-4 text-sm text-bone">
            <WarningCircle size={18} className="text-danger" /> {message}
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: copy.totalRequests, value: summary?.totalRequests ?? 0, icon: UserList },
            { label: copy.totalContacts, value: summary?.totalContacts ?? 0, icon: EnvelopeSimple },
            { label: copy.latestRequest, value: summary?.latestRequestCode ?? "—", icon: CheckCircle },
            { label: copy.latestContact, value: dateLabel(summary?.latestContactAt ?? null, lang), icon: PhoneCall },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-[24px] border border-sand/15 bg-forest-900 p-5 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between gap-2">
                <Icon size={22} className="text-sand" />
                <span className="rounded-full border border-sand/20 bg-sand/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-bone/60">Live</span>
              </div>
              <p className="mt-5 text-xs uppercase tracking-[0.18em] text-bone/60">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-bone">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statuses.map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => {
                setSection("requests");
                setRequestFilter(status);
                setRequestPage(1);
              }}
              className={cn(
                "rounded-[22px] border p-4 text-start transition-all duration-200",
                requestFilter === status && section === "requests"
                  ? "border-sand/60 bg-sand/15 shadow-[0_12px_30px_rgba(234,192,140,0.16)]"
                  : "border-sand/15 bg-forest-900 hover:border-sand/50",
              )}
            >
              <p className="text-xs uppercase tracking-[0.16em] text-bone/60">{statusLabel(status, lang)}</p>
              <p className="mt-3 text-3xl font-semibold text-bone">{summary?.statuses[status] ?? 0}</p>
            </button>
          ))}
        </section>

        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-bone/10 pb-3">
          <button type="button" onClick={() => setSection("requests")} className={cn(buttonClass(section === "requests" ? "primary" : "secondary"), "px-5")}>
            <UserList size={18} /> {copy.requests}
          </button>
          <button type="button" onClick={() => setSection("contacts")} className={cn(buttonClass(section === "contacts" ? "primary" : "secondary"), "px-5")}>
            <EnvelopeSimple size={18} /> {copy.contacts}
          </button>
          <button type="button" onClick={() => setSection("settings")} className={cn(buttonClass(section === "settings" ? "primary" : "secondary"), "px-5")}>
            <Sparkle size={18} /> {copy.settings}
          </button>
          <button type="button" onClick={() => setSection("portfolio")} className={cn(buttonClass(section === "portfolio" ? "primary" : "secondary"), "px-5")}>
            <FileImage size={18} /> {copy.portfolio}
          </button>
          {section === "requests" ? (
            <select
              value={requestFilter}
              onChange={(event) => {
                setRequestFilter(event.target.value as RequestStatus | "all");
                setRequestPage(1);
              }}
              className="field ms-auto min-h-[44px] w-auto min-w-[170px] py-2"
              aria-label={copy.status}
            >
              <option value="all">{copy.all}</option>
              {statuses.map((status) => <option key={status} value={status}>{statusLabel(status, lang)}</option>)}
            </select>
          ) : null}
        </div>

        {section === "settings" ? (
          <PrintSettingsPanel
            settings={printSettings}
            profiles={printProfiles}
            copy={copy}
            lang={lang}
            saving={settingsSaving}
            onToggle={togglePrintPlacement}
            onSave={() => void savePrintSettings()}
          />
        ) : null}
        {section === "portfolio" ? (
          <PortfolioPanel items={portfolioItems} copy={copy} saving={portfolioSaving} onAdd={() => void addPortfolioItem()} onSave={(item) => void savePortfolioItem(item)} onDelete={(id) => void removePortfolioItem(id)} />
        ) : null}

        {section !== "settings" && section !== "portfolio" ? <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div>
            {loading && !summary ? (
              <div className="flex items-center justify-center gap-3 py-20 text-sm text-bone/65"><CircleNotch size={20} className="animate-spin text-sand" /> {copy.refresh}</div>
            ) : section === "requests" ? (
              <RequestTable
                requests={requests}
                lang={lang}
                copy={copy}
                selectedRequestId={selectedRequestId}
                updatingId={updatingId}
                onSelect={setSelectedRequestId}
                onStatusChange={changeStatus}
              />
            ) : (
              <ContactTable contacts={contacts} lang={lang} copy={copy} />
            )}
          </div>

          <RequestDetailPanel
            request={selectedRequest}
            keyValue={key}
            lang={lang}
            copy={copy}
            onStatusChange={changeStatus}
            onPlacementChange={changePlacement}
          />
        </div> : null}

        {section !== "settings" && section !== "portfolio" ? <Pagination page={section === "requests" ? requestPage : contactPage} pages={section === "requests" ? requestPages : contactPages} previous={copy.previous} next={copy.next} onChange={section === "requests" ? setRequestPage : setContactPage} /> : null}
      </div>
    </main>
  );
}

function RequestTable({
  requests,
  lang,
  copy,
  selectedRequestId,
  updatingId,
  onSelect,
  onStatusChange,
}: {
  requests: AdminRequest[];
  lang: "ar" | "en";
  copy: Record<string, string>;
  selectedRequestId: string;
  updatingId: string;
  onSelect: (id: string) => void;
  onStatusChange: (request: AdminRequest, status: RequestStatus) => void;
}) {
  return (
    <div className="grid gap-4">
      {requests.length ? requests.map((request) => (
        <article
          key={request.id}
          className={cn(
            "rounded-[26px] border p-5 transition-all duration-200",
            selectedRequestId === request.id
              ? "border-sand/50 bg-forest-900 shadow-[0_16px_40px_rgba(6,95,91,0.18)]"
              : "border-sand/15 bg-forest-900/80 hover:border-sand/40",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <button type="button" onClick={() => onSelect(request.id)} className="flex-1 text-start">
              <div className="flex items-center gap-3">
                <p dir="ltr" className="font-latin text-xl tracking-wide text-sand">{request.code}</p>
                <span className={cn("inline-flex rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em]", getStatusClasses(request.status))}>
                  {statusLabel(request.status, lang)}
                </span>
              </div>
              <p className="mt-2 text-sm text-bone">{request.name}</p>
              <p className="mt-1 text-xs text-bone/60">{dateLabel(request.createdAt, lang)} · {request.quantity} {copy.pieces}</p>
            </button>
            <select
              value={request.status}
              onChange={(event) => onStatusChange(request, event.target.value as RequestStatus)}
              disabled={updatingId === request.id}
              className="field min-h-[42px] w-auto min-w-[150px] py-2"
              aria-label={copy.status}
            >
              {statuses.map((status) => <option key={status} value={status}>{statusLabel(status, lang)}</option>)}
            </select>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-bone/70">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sand/15 bg-sand/10 px-2.5 py-1.5">
              <PhoneCall size={12} className="text-sand" />
              {request.phone}
            </span>
            {request.items?.length ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sand/15 bg-sand/10 px-2.5 py-1.5">
                <UserList size={12} className="text-sand" />
                {request.items.length} {copy.pieces}
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {request.items?.length ? request.items.slice(0, 3).map((item, index) => (
              <div key={`${request.id}-${index}`} className="rounded-[18px] border border-sand/15 bg-forest-950 p-3 text-xs text-bone/75">
                <p className="font-medium text-bone">{item.productName}</p>
                <p className="mt-1">{item.size} · {item.color} · {item.style}</p>
                {item.specialRequest ? <p className="mt-2 line-clamp-2 text-sand">{item.specialRequest}</p> : null}
              </div>
            )) : (
              <div className="rounded-[18px] border border-dashed border-sand/20 bg-forest-950 p-3 text-xs text-bone/65">
                {request.details || copy.noItems}
              </div>
            )}
          </div>
        </article>
      )) : <EmptyState text={copy.noItems} />}
    </div>
  );
}

function PortfolioPanel({
  items,
  copy,
  saving,
  onAdd,
  onSave,
  onDelete,
}: {
  items: PortfolioItem[];
  copy: Record<string, string>;
  saving: boolean;
  onAdd: () => void;
  onSave: (item: PortfolioItem) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <section className="mt-6 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/55 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bone/10 pb-5">
        <div><h2 className="text-2xl text-bone">{copy.portfolio}</h2><p className="mt-2 text-sm text-bone/60">{copy.portfolioIntro}</p></div>
        <button type="button" onClick={onAdd} disabled={saving} className={cn(buttonClass("primary"), "px-5")}><Sparkle size={18} /> {copy.add ?? "Add work"}</button>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {items.map((item) => <PortfolioEditor key={item.id} item={item} saving={saving} onSave={onSave} onDelete={onDelete} />)}
      </div>
    </section>
  );
}

function PortfolioEditor({ item, saving, onSave, onDelete }: { item: PortfolioItem; saving: boolean; onSave: (item: PortfolioItem) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState(item);
  useEffect(() => setDraft(item), [item]);
  const update = (field: keyof PortfolioItem, value: string | number | boolean) => setDraft((current) => ({ ...current, [field]: value }));
  return (
    <article className="rounded-[var(--radius-field)] border border-bone/10 bg-forest-950/45 p-4">
      <img src={draft.image} alt={draft.altEn} className="mb-4 aspect-[4/3] w-full rounded-xl object-cover" />
      <div className="grid gap-3 sm:grid-cols-2">
        {(["titleAr", "titleEn", "altAr", "altEn", "image"] as const).map((field) => (
          <label key={field} className={field === "image" ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs text-bone/55">{field}</span><input value={draft[field]} onChange={(event) => update(field, event.target.value)} className="field min-h-[42px] py-2" /></label>
        ))}
        <label><span className="mb-1 block text-xs text-bone/55">category</span><select value={draft.category} onChange={(event) => update("category", event.target.value)} className="field min-h-[42px] py-2"><option value="clothing">Clothing / ملابس</option><option value="mugs">Mugs / مجات</option><option value="caps">Caps / كابات</option><option value="stickers">Stickers / ستيكرز</option><option value="cases">Cases / جرابات</option></select></label>
        <label><span className="mb-1 block text-xs text-bone/55">sort order</span><input type="number" min="0" value={draft.sortOrder} onChange={(event) => update("sortOrder", Number(event.target.value))} className="field min-h-[42px] py-2" /></label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-bone/70"><input type="checkbox" checked={draft.active} onChange={(event) => update("active", event.target.checked)} /> Visible on home page</label>
      <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => onDelete(draft.id)} disabled={saving} className={cn(buttonClass("secondary"), "px-4 text-danger")}>Delete</button><button type="button" onClick={() => onSave(draft)} disabled={saving} className={cn(buttonClass("primary"), "px-4")}>Save</button></div>
    </article>
  );
}

function PrintSettingsPanel({
  settings,
  profiles,
  copy,
  lang,
  saving,
  onToggle,
  onSave,
}: {
  settings: PrintPlacementSettings | null;
  profiles: Record<string, PrintPlacementProfile>;
  copy: Record<string, string>;
  lang: "ar" | "en";
  saving: boolean;
  onToggle: (productId: string, placement: PrintPlacement) => void;
  onSave: () => void;
}) {
  return (
    <section className="mt-6 rounded-[var(--radius-card)] border border-bone/15 bg-forest-900/55 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-bone/10 pb-5">
        <div>
          <h2 className="text-2xl text-bone">{copy.settings}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bone/60">{copy.settingsIntro}</p>
        </div>
        <button type="button" onClick={onSave} disabled={!settings || saving} className={cn(buttonClass("primary"), "px-5")}>
          {saving ? <CircleNotch size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {copy.saveSettings}
        </button>
      </div>
      {settings ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Object.values(profiles).map((profile) => (
            <div key={profile.productId} className="rounded-[var(--radius-field)] border border-bone/10 bg-forest-950/45 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-bone">{profile.productName}</h3>
                  <p className="mt-1 text-xs text-bone/50">{serviceNames[profile.service][lang]}</p>
                </div>
                <span className="rounded-full border border-sand/25 bg-sand/10 px-2 py-1 text-[10px] text-sand">
                  {profile.placements.length} {lang === "ar" ? "مواضع متاحة" : "positions"}
                </span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-bone/60">{profile.guidance}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {placementOptions.map((option) => {
                  const enabled = profile.placements.includes(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => onToggle(profile.productId, option.value)}
                      aria-pressed={enabled}
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs transition-colors",
                        enabled
                          ? "border-sand/60 bg-sand/15 text-sand"
                          : "border-bone/15 bg-bone/5 text-bone/50 hover:border-bone/30 hover:text-bone",
                      )}
                    >
                      {option.label[lang]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-sm text-bone/60">{copy.refresh}</div>
      )}
    </section>
  );
}

function RequestDetailPanel({
  request,
  keyValue,
  lang,
  copy,
  onStatusChange,
  onPlacementChange,
}: {
  request: AdminRequest | null;
  keyValue: string;
  lang: "ar" | "en";
  copy: Record<string, string>;
  onStatusChange: (request: AdminRequest, status: RequestStatus) => void;
  onPlacementChange: (requestId: string, itemIndex: number, placement: PrintPlacement) => void;
}) {
  if (!request) {
    return (
      <aside className="rounded-[28px] border border-sand/15 bg-forest-900 p-6 text-sm text-bone/65">
        {copy.noSelection}
      </aside>
    );
  }

  const designUrl = request.designPreviewUrl || request.artworkUrl;
  const logoUrl = request.logoDataUrl;
  const studio3d = request.studio3d;

  return (
    <aside className="rounded-[28px] border border-sand/15 bg-forest-900 p-5 shadow-2xl shadow-black/25 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand/15 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-bone/50">{copy.details}</p>
          <p dir="ltr" className="mt-2 font-latin text-2xl text-sand">{request.code}</p>
        </div>
        <select
          value={request.status}
          onChange={(event) => onStatusChange(request, event.target.value as RequestStatus)}
          className="field min-h-[42px] w-auto min-w-[170px] py-2"
          aria-label={copy.updateStatus}
        >
          {statuses.map((status) => <option key={status} value={status}>{statusLabel(status, lang)}</option>)}
        </select>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] border border-sand/15 bg-forest-950 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-bone/55">{copy.customer}</p>
          <p className="mt-3 text-lg font-medium text-bone">{request.name}</p>
          <a href={`https://wa.me/2${request.phone}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm text-sand">
            <PhoneCall size={16} /> {request.phone}
          </a>
        </div>
        <div className="rounded-[20px] border border-sand/15 bg-forest-950 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-bone/55">{copy.preview}</p>
          <p className="mt-3 text-lg font-medium text-bone">{request.quantity} {copy.pieces}</p>
          <p className="mt-2 text-sm text-bone/70">{dateLabel(request.createdAt, lang)}</p>
        </div>
      </div>

      {designUrl ? (
        <div className="mt-5 rounded-[24px] border border-sand/15 bg-forest-950 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-sand">
              <FileImage size={18} /> {copy.design}
            </span>
            <a
              href={designUrl}
              target="_blank"
              rel="noreferrer"
              download={request.designFileName ?? `${request.code}.png`}
              className="inline-flex items-center gap-2 rounded-full border border-sand/25 bg-sand/10 px-3 py-1.5 text-xs text-bone"
            >
              <DownloadSimple size={14} /> {copy.download}
            </a>
          </div>
          <img src={designUrl} alt={copy.design} className="max-h-[260px] w-full rounded-[18px] border border-sand/15 bg-forest-950 object-contain" />
        </div>
      ) : (
        <div className="mt-5 rounded-[24px] border border-dashed border-sand/20 bg-forest-950 p-6 text-sm text-bone/60">
          {copy.noDesign}
        </div>
      )}

      {logoUrl ? (
        <div className="mt-5 rounded-[24px] border border-sand/20 bg-forest-950/55 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-sand">
              <FileImage size={18} /> {lang === "ar" ? "اللوجو الأصلي" : "Original uploaded logo"}
            </span>
            <a
              href={logoUrl}
              target="_blank"
              rel="noreferrer"
              download={`${request.code}-logo.png`}
              className="inline-flex items-center gap-2 rounded-full border border-sand/30 bg-sand/10 px-3 py-1.5 text-xs text-bone"
            >
              <DownloadSimple size={14} /> {copy.download}
            </a>
          </div>
          <img src={logoUrl} alt={lang === "ar" ? "اللوجو الأصلي" : "Original uploaded logo"} className="max-h-[180px] w-full rounded-[18px] border border-bone/10 bg-white object-contain p-3" />
          <p className="mt-2 text-xs text-bone/55">{request.designFileName ?? "Uploaded logo"}</p>
        </div>
      ) : null}

      {studio3d ? (
        <div className="mt-5 rounded-[24px] border border-sand/20 bg-forest-950/55 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm text-sand">
              <FileImage size={18} /> {lang === "ar" ? "معاينة الاستوديو ثلاثي الأبعاد" : "3D studio design"}
            </span>
            <a
              href={studio3d.sheetDataUrl}
              download={`${request.code}-3d-sheet.png`}
              className="inline-flex items-center gap-2 rounded-full border border-sand/30 bg-sand/10 px-3 py-1.5 text-xs text-bone"
            >
              <DownloadSimple size={14} /> {copy.download}
            </a>
          </div>
          <img
            src={studio3d.sheetDataUrl}
            alt={lang === "ar" ? "ورقة معاينة التصميم ثلاثي الأبعاد" : "3D design preview sheet"}
            className="w-full rounded-[18px] border border-bone/10 bg-forest-950 object-contain"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(Object.entries(studio3d.faces) as [Studio3DZone, { imageDataUrl: string }][]).map(([zone, face]) => (
              <a
                key={zone}
                href={face.imageDataUrl}
                download={`${request.code}-${zone}.png`}
                className="rounded-xl border border-bone/10 bg-forest-950 p-2"
              >
                <img src={face.imageDataUrl} alt={zone} className="aspect-video w-full object-contain" />
                <span className="mt-1 block text-center text-xs text-bone/60">{zone}</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {request.items?.length ? (
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[#f8f2eb]">{copy.itemDetails}</p>
            <span className="text-xs uppercase tracking-[0.18em] text-[#dfe8ef]/50">{request.items.length}</span>
          </div>
          <div className="space-y-3">
            {request.items.map((item, index) => (
              <div key={`${request.id}-${index}`} className="rounded-[20px] border border-sand/15 bg-forest-950 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#f8f2eb]">{item.productName}</p>
                    <p className="mt-1 text-xs text-[#dfe8ef]/65">{item.size} · {item.color} · {item.style}</p>
                  </div>
                  <span className="rounded-full border border-[#f0d9b2]/15 bg-[#f0d9b2]/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f0d9b2]">
                    {placementLabel(item.printPlacement, lang)}
                  </span>
                </div>

                <div className="mt-3">
                  <label className="mb-2 block text-xs uppercase tracking-[0.15em] text-[#dfe8ef]/55">{copy.placement}</label>
                  <select
                    value={item.printPlacement ?? "front"}
                    onChange={(event) => onPlacementChange(request.id, index, event.target.value as PrintPlacement)}
                    className="field min-h-[42px] w-full py-2"
                  >
                    {placementOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label[lang]}</option>
                    ))}
                  </select>
                </div>

                {item.specialRequest ? (
                  <p className="mt-3 rounded-[14px] border border-[#f0d9b2]/10 bg-[#f0d9b2]/5 p-2 text-xs leading-relaxed text-[#f8f2eb]">
                    {item.specialRequest}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {request.details ? (
        <div className="mt-5 rounded-[20px] border border-sand/15 bg-forest-950 p-4">
          <p className="text-sm font-medium text-[#f8f2eb]">{copy.notes}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#dfe8ef]/75">{request.details}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 text-xs text-[#dfe8ef]/55">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#f0d9b2]/10 bg-[#f0d9b2]/5 px-2.5 py-1.5">
          <ArrowUpRight size={12} className="text-[#f0d9b2]" />
          {request.service}
        </span>
        {keyValue ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f0d9b2]/10 bg-[#f0d9b2]/5 px-2.5 py-1.5">
            <LockKey size={12} className="text-[#f0d9b2]" />
        {lang === "ar" ? "مفتاح نشط" : "Active key"}
          </span>
        ) : null}
      </div>
    </aside>
  );
}

function ContactTable({ contacts, lang, copy }: { contacts: AdminContact[]; lang: "ar" | "en"; copy: Record<string, string> }) {
  return (
    <div className="mt-5 grid gap-4">
      {contacts.length ? contacts.map((contact) => (
        <article key={contact.id} className="rounded-[24px] border border-sand/15 bg-forest-900 p-5">
          <div className="flex flex-wrap justify-between gap-3">
            <div>
              <p className="font-medium text-[#f8f2eb]">{contact.name}</p>
              <a href={`https://wa.me/2${contact.phone}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm text-[#f0d9b2] underline underline-offset-2">{copy.phone}: {contact.phone}</a>
            </div>
            <time className="text-xs text-[#dfe8ef]/60">{dateLabel(contact.createdAt, lang)}</time>
          </div>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#dfe8ef]/75">{contact.message}</p>
        </article>
      )) : <EmptyState text={copy.noItems} />}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-[24px] border border-dashed border-sand/20 bg-forest-900 py-16 text-center text-sm text-bone/55">{text}</div>;
}

function Pagination({ page, pages, previous, next, onChange }: { page: number; pages: number; previous: string; next: string; onChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} className={cn(buttonClass("secondary"), "px-4 text-xs")}>{previous}</button>
      <span className="font-latin text-sm text-[#dfe8ef]/65">{page} / {pages}</span>
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} className={cn(buttonClass("secondary"), "px-4 text-xs")}>{next}</button>
    </div>
  );
}
