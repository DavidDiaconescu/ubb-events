import { afterEach, describe, expect, it, vi } from "vitest";
import { setToken } from "./api";
import { getState, refreshState } from "./store";

const student = { id: 4, email: "andrei.pop@stud.ubbcluj.ro", firstName: "Andrei", lastName: "Pop", faculty: "FMI", studyYear: 2, globalRole: "USER", enabled: true, createdAt: "2026-09-01T00:00:00Z" };
const event = (id: number, organizationId: number) => ({ id, organizationId, status: "PUBLISHED" });

/** A fake backend: the student organizes event 2 only; the task list of any other event answers 403. */
function fakeBackend(requested: string[]) {
  const routes: Record<string, unknown> = {
    "/api/auth/me": student,
    "/api/events": [event(1, 10), event(2, 10)],
    "/api/organizations": [{ id: 10, name: "Org", status: "ACTIVE" }],
    "/api/venues": [],
    "/api/users": [student],
    "/api/users/4/notifications": [],
    "/api/users/4/tasks": [{ id: 7, eventId: 2, assigneeId: 4, title: "Mine", status: "TODO" }],
    "/api/organizations/10/memberships": [],
    "/api/events/1/organizers": [],
    "/api/events/2/organizers": [{ id: 1, eventId: 2, userId: 4, role: "ORGANIZER" }],
    "/api/events/2/tasks": [{ id: 7, eventId: 2, assigneeId: 4, title: "Mine", status: "TODO" }],
  };
  return vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    requested.push(path);
    if (path in routes) return new Response(JSON.stringify(routes[path]), { status: 200 });
    if (/^\/api\/events\/\d+\/(registrations|announcements|feedback)$/.test(path)) return new Response("[]", { status: 200 });
    return new Response(JSON.stringify({ detail: "Forbidden" }), { status: 403 });
  });
}

describe("refreshState", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setToken(null);
  });

  it("asks for the tasks of managed events only, so no request is rejected", async () => {
    const requested: string[] = [];
    vi.stubGlobal("fetch", fakeBackend(requested));
    setToken("token");

    await refreshState();

    expect(requested).toContain("/api/events/2/tasks");
    expect(requested).not.toContain("/api/events/1/tasks");
    expect(getState().currentUserId).toBe(4);
    // The task comes from both the event list and the assignee list, but is stored once.
    expect(getState().tasks.map((task) => task.id)).toEqual([7]);
  });
});
