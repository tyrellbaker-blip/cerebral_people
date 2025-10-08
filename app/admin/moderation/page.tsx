import { getContentDashboard, getReportsQueue } from "./actions";
import ModerationFilters from "./ModerationFilters";
import ContentDashboard from "./ContentDashboard";
import ReportsQueue from "./ReportsQueue";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{
    contentType?: "posts" | "comments" | "all";
    status?: string;
    authorId?: string;
    search?: string;
    timeframe?: "24h" | "7d" | "30d" | "all";
    reportStatus?: string;
    reportType?: string;
    view?: "content" | "reports";
  }>;
}) {
  const params = await searchParams;
  const {
    contentType = "all",
    status,
    authorId,
    search,
    timeframe = "24h",
    reportStatus = "OPEN",
    reportType,
    view = "content",
  } = params;

  // Fetch data based on view
  const contentData =
    view === "content"
      ? await getContentDashboard({
          contentType,
          status,
          authorId,
          search,
          timeframe,
        })
      : { posts: [], comments: [] };

  const reports =
    view === "reports"
      ? await getReportsQueue({
          status: reportStatus,
          subjectType: reportType,
        })
      : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">
          Community Moderation
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Review content, manage reports, and take moderation actions
        </p>
      </div>

      {/* View Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="flex -mb-px space-x-8">
          <a
            href="/admin/moderation?view=content"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              view === "content"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:border-neutral-300"
            }`}
          >
            Content Dashboard
          </a>
          <a
            href="/admin/moderation?view=reports"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              view === "reports"
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-ink-500 hover:text-ink-700 hover:border-neutral-300"
            }`}
          >
            Reports Queue
            {reports.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                {reports.length}
              </span>
            )}
          </a>
        </nav>
      </div>

      {/* Filters */}
      <ModerationFilters view={view} currentParams={params} />

      {/* Content Display */}
      {view === "content" ? (
        <ContentDashboard posts={contentData.posts} comments={contentData.comments} />
      ) : (
        <ReportsQueue reports={reports} />
      )}
    </div>
  );
}
