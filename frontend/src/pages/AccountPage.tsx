import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { fetchMyRequests, type TrackedRequest } from "../lib/api";
import { useAuth } from "../providers/AuthProvider";

export function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const [requests, setRequests] = useState<TrackedRequest[]>([]);
  useEffect(() => { if (user) void fetchMyRequests().then((result) => setRequests(result.items)); }, [user]);
  if (loading) return null;
  if (!user) return <div className="shell py-16 text-bone"><Link to="/auth" className="underline">Sign in to view your account.</Link></div>;
  return (
    <>
      <PageHeader title={`Welcome, ${user.name}`} intro={user.offerNote ?? "Your print request history."} />
      <div className="shell py-12">
        <button onClick={() => void signOut()} className="mb-6 rounded-full border border-bone/20 px-4 py-2 text-sm text-bone">Sign out</button>
        <div className="grid gap-4">
          {requests.map((request) => <Link key={request.code} to={`/track?code=${encodeURIComponent(request.code)}`} className="rounded-2xl border border-bone/15 bg-forest-900/55 p-5 text-bone"><strong>{request.code}</strong><span className="mx-3 text-bone/50">{request.service}</span><span className="text-sand">{request.status}</span></Link>)}
          {!requests.length ? <p className="text-bone/60">No requests yet. <Link to="/request" className="underline">Start a request.</Link></p> : null}
        </div>
      </div>
    </>
  );
}
