import type { AppState } from "./types";

/**
 * Initial demo data. Dates are fixed (around November 2026, times in UTC) so the server
 * and the browser always render the same values.
 *
 * Demo accounts:
 *  - Ana Popescu      -> platform administrator
 *  - Mihai Ionescu    -> coordinator of UBB Tech Society
 *  - Ioana Rus        -> coordinator of Green Campus Initiative
 *  - Elena Moldovan   -> coordinator of UBB Debate Club
 *  - Andrei Pop       -> student, member of UBB Tech Society
 *  - Maria Câmpean    -> student, not a member of any organization
 */
export function createSeedState(): AppState {
  return {
    currentUserId: null,

    users: [
      { id: 1, email: "ana.popescu@ubbcluj.ro", firstName: "Ana", lastName: "Popescu", faculty: "Faculty of Mathematics and Computer Science", studyYear: 4, globalRole: "ADMIN", enabled: true, createdAt: "2026-09-01T08:00:00Z" },
      { id: 2, email: "mihai.ionescu@stud.ubbcluj.ro", firstName: "Mihai", lastName: "Ionescu", faculty: "Faculty of Mathematics and Computer Science", studyYear: 3, globalRole: "USER", enabled: true, createdAt: "2026-09-02T08:00:00Z" },
      { id: 3, email: "ioana.rus@stud.ubbcluj.ro", firstName: "Ioana", lastName: "Rus", faculty: "Faculty of Environmental Science and Engineering", studyYear: 2, globalRole: "USER", enabled: true, createdAt: "2026-09-02T09:00:00Z" },
      { id: 4, email: "andrei.pop@stud.ubbcluj.ro", firstName: "Andrei", lastName: "Pop", faculty: "Faculty of Mathematics and Computer Science", studyYear: 2, globalRole: "USER", enabled: true, createdAt: "2026-09-03T10:00:00Z" },
      { id: 5, email: "maria.campean@stud.ubbcluj.ro", firstName: "Maria", lastName: "Câmpean", faculty: "Faculty of Economics and Business Administration", studyYear: 1, globalRole: "USER", enabled: true, createdAt: "2026-09-04T11:00:00Z" },
      { id: 6, email: "elena.moldovan@stud.ubbcluj.ro", firstName: "Elena", lastName: "Moldovan", faculty: "Faculty of Letters", studyYear: 3, globalRole: "USER", enabled: true, createdAt: "2026-09-04T12:00:00Z" },
      { id: 7, email: "radu.muresan@stud.ubbcluj.ro", firstName: "Radu", lastName: "Mureșan", faculty: "Faculty of Law", studyYear: 2, globalRole: "USER", enabled: true, createdAt: "2026-09-05T08:00:00Z" },
      { id: 8, email: "bianca.toma@stud.ubbcluj.ro", firstName: "Bianca", lastName: "Toma", faculty: "Faculty of Psychology and Educational Sciences", studyYear: 1, globalRole: "USER", enabled: true, createdAt: "2026-09-05T09:00:00Z" },
      { id: 9, email: "vlad.stan@stud.ubbcluj.ro", firstName: "Vlad", lastName: "Stan", faculty: "Faculty of Mathematics and Computer Science", studyYear: 3, globalRole: "USER", enabled: true, createdAt: "2026-09-06T08:00:00Z" },
      { id: 10, email: "diana.lazar@stud.ubbcluj.ro", firstName: "Diana", lastName: "Lazăr", faculty: "Faculty of European Studies", studyYear: 2, globalRole: "USER", enabled: true, createdAt: "2026-09-06T09:00:00Z" },
      { id: 11, email: "paul.rusu@stud.ubbcluj.ro", firstName: "Paul", lastName: "Rusu", faculty: "Faculty of Physics", studyYear: 4, globalRole: "USER", enabled: true, createdAt: "2026-09-07T08:00:00Z" },
      { id: 12, email: "sara.nagy@stud.ubbcluj.ro", firstName: "Sara", lastName: "Nagy", faculty: "Faculty of Biology and Geology", studyYear: 1, globalRole: "USER", enabled: true, createdAt: "2026-09-07T09:00:00Z" },
    ],

    organizations: [
      { id: 1, name: "UBB Tech Society", description: "A community of students passionate about software, data and hardware. We run hands-on workshops, hackathons and talks with industry speakers.", logoUrl: null, contactEmail: "contact@ubbtech.example", status: "ACTIVE", createdAt: "2026-09-01T08:00:00Z" },
      { id: 2, name: "Green Campus Initiative", description: "Student volunteers working towards a more sustainable university: clean-up days, recycling campaigns and talks about climate.", logoUrl: null, contactEmail: "hello@greencampus.example", status: "ACTIVE", createdAt: "2026-09-01T09:00:00Z" },
      { id: 3, name: "UBB Debate Club", description: "We train critical thinking and public speaking through weekly debates, workshops and inter-university tournaments.", logoUrl: null, contactEmail: "debate@ubbdebate.example", status: "ACTIVE", createdAt: "2026-09-01T10:00:00Z" },
      { id: 4, name: "Erasmus Student Circle", description: "Helping international and Erasmus students feel at home in Cluj-Napoca through social and cultural events.", logoUrl: null, contactEmail: "erasmus.circle@example.com", status: "SUSPENDED", createdAt: "2026-09-01T11:00:00Z" },
    ],

    memberships: [
      { id: 1, userId: 2, organizationId: 1, role: "COORDINATOR", joinedAt: "2026-09-02T08:00:00Z", active: true },
      { id: 2, userId: 4, organizationId: 1, role: "MEMBER", joinedAt: "2026-09-10T08:00:00Z", active: true },
      { id: 3, userId: 9, organizationId: 1, role: "MEMBER", joinedAt: "2026-09-11T08:00:00Z", active: true },
      { id: 4, userId: 3, organizationId: 2, role: "COORDINATOR", joinedAt: "2026-09-02T09:00:00Z", active: true },
      { id: 5, userId: 7, organizationId: 2, role: "MEMBER", joinedAt: "2026-09-12T08:00:00Z", active: true },
      { id: 6, userId: 12, organizationId: 2, role: "MEMBER", joinedAt: "2026-09-13T08:00:00Z", active: true },
      { id: 7, userId: 6, organizationId: 3, role: "COORDINATOR", joinedAt: "2026-09-04T12:00:00Z", active: true },
      { id: 8, userId: 7, organizationId: 3, role: "MEMBER", joinedAt: "2026-09-14T08:00:00Z", active: true },
      { id: 9, userId: 10, organizationId: 4, role: "COORDINATOR", joinedAt: "2026-09-06T09:00:00Z", active: true },
    ],

    venues: [
      { id: 1, name: "Aula Magna", address: "Str. Mihail Kogălniceanu 1, Cluj-Napoca", maxCapacity: 400, online: false },
      { id: 2, name: "FMI – Room 2/I", address: "Str. Mihail Kogălniceanu 1, Cluj-Napoca", maxCapacity: 60, online: false },
      { id: 3, name: "Student Hub", address: "Str. Avram Iancu 19, Cluj-Napoca", maxCapacity: 120, online: false },
      { id: 4, name: "Online (Microsoft Teams)", address: null, maxCapacity: null, online: true },
      { id: 5, name: "Central Park", address: "Parcul Central, Cluj-Napoca", maxCapacity: null, online: false },
    ],

    events: [
      { id: 1, organizationId: 1, venueId: 2, createdById: 2, title: "Intro to Spring Boot Workshop", description: "Build your first REST API with Spring Boot in three hours. We cover controllers, services, persistence with JPA and testing. Bring a laptop with JDK 21 installed.", category: "WORKSHOP", startTime: "2026-11-20T16:00:00Z", endTime: "2026-11-20T19:00:00Z", capacity: 40, registrationOpensAt: "2026-11-01T08:00:00Z", registrationClosesAt: "2026-11-19T20:00:00Z", visibility: "PUBLIC", status: "PUBLISHED", cancellationReason: null, version: 3, createdAt: "2026-10-20T08:00:00Z" },
      { id: 2, organizationId: 1, venueId: 3, createdById: 2, title: "AI in Education – Round Table", description: "An open discussion between students and teaching staff about how generative AI changes learning and assessment. Seats are limited to keep the discussion personal.", category: "CONFERENCE", startTime: "2026-12-03T08:00:00Z", endTime: "2026-12-03T11:00:00Z", capacity: 4, registrationOpensAt: "2026-11-05T08:00:00Z", registrationClosesAt: "2026-12-01T20:00:00Z", visibility: "PUBLIC", status: "PUBLISHED", cancellationReason: null, version: 2, createdAt: "2026-10-25T08:00:00Z" },
      { id: 3, organizationId: 2, venueId: 5, createdById: 3, title: "Campus Clean-up Day", description: "Join our volunteers for a morning of cleaning the Central Park area. Gloves, bags and snacks are provided. Open to members of Green Campus Initiative.", category: "SOCIAL", startTime: "2026-11-22T08:00:00Z", endTime: "2026-11-22T12:00:00Z", capacity: 25, registrationOpensAt: "2026-11-01T08:00:00Z", registrationClosesAt: "2026-11-21T18:00:00Z", visibility: "MEMBERS_ONLY", status: "PUBLISHED", cancellationReason: null, version: 2, createdAt: "2026-10-22T08:00:00Z" },
      { id: 4, organizationId: 3, venueId: 3, createdById: 6, title: "Autumn Debate Cup", description: "Our yearly British Parliamentary tournament for beginners and experienced debaters. Teams of two, five preliminary rounds and a grand final.", category: "COMPETITION", startTime: "2026-11-14T07:00:00Z", endTime: "2026-11-14T15:00:00Z", capacity: 16, registrationOpensAt: "2026-10-20T08:00:00Z", registrationClosesAt: "2026-11-10T20:00:00Z", visibility: "PUBLIC", status: "REGISTRATION_CLOSED", cancellationReason: null, version: 4, createdAt: "2026-10-10T08:00:00Z" },
      { id: 5, organizationId: 1, venueId: 1, createdById: 2, title: "Hackathon Kickoff 2026", description: "24 hours, teams of four, one theme announced at the start. Mentors from local companies, food and prizes included.", category: "COMPETITION", startTime: "2026-12-12T08:00:00Z", endTime: "2026-12-13T16:00:00Z", capacity: 120, registrationOpensAt: "2026-11-20T08:00:00Z", registrationClosesAt: "2026-12-10T20:00:00Z", visibility: "PUBLIC", status: "PENDING_APPROVAL", cancellationReason: null, version: 1, createdAt: "2026-11-08T08:00:00Z" },
      { id: 6, organizationId: 2, venueId: 4, createdById: 3, title: "Zero-Waste Campus Talk", description: "How can a university of 45,000 students reduce its waste? Guests from the city's sustainability office share data and ideas.", category: "CONFERENCE", startTime: "2027-01-15T16:00:00Z", endTime: "2027-01-15T17:30:00Z", capacity: 200, registrationOpensAt: "2026-12-15T08:00:00Z", registrationClosesAt: "2027-01-14T20:00:00Z", visibility: "PUBLIC", status: "DRAFT", cancellationReason: null, version: 0, createdAt: "2026-11-10T08:00:00Z" },
      { id: 7, organizationId: 1, venueId: 2, createdById: 2, title: "Git & GitHub Training", description: "Version control from zero: commits, branches, merges, pull requests and resolving conflicts, with plenty of exercises.", category: "TRAINING", startTime: "2026-10-15T15:00:00Z", endTime: "2026-10-15T18:00:00Z", capacity: 30, registrationOpensAt: "2026-10-01T08:00:00Z", registrationClosesAt: "2026-10-14T20:00:00Z", visibility: "PUBLIC", status: "FINISHED", cancellationReason: null, version: 6, createdAt: "2026-09-20T08:00:00Z" },
      { id: 8, organizationId: 3, venueId: 3, createdById: 6, title: "Board Games Night", description: "A relaxed evening of strategy and party games. Meet the club members and bring your favourite game!", category: "SOCIAL", startTime: "2026-11-18T17:00:00Z", endTime: "2026-11-18T21:00:00Z", capacity: 30, registrationOpensAt: "2026-11-01T08:00:00Z", registrationClosesAt: "2026-11-17T20:00:00Z", visibility: "PUBLIC", status: "CANCELLED", cancellationReason: "The venue is unavailable that evening. We will announce a new date soon.", version: 4, createdAt: "2026-10-28T08:00:00Z" },
      { id: 9, organizationId: 3, venueId: 2, createdById: 6, title: "Public Speaking Workshop", description: "Practical techniques for structuring a speech, managing stage fright and using your voice. Short exercises in small groups.", category: "WORKSHOP", startTime: "2026-12-05T10:00:00Z", endTime: "2026-12-05T13:00:00Z", capacity: 20, registrationOpensAt: "2026-11-15T08:00:00Z", registrationClosesAt: "2026-12-04T20:00:00Z", visibility: "PUBLIC", status: "APPROVED", cancellationReason: null, version: 2, createdAt: "2026-11-02T08:00:00Z" },
      { id: 10, organizationId: 2, venueId: 3, createdById: 3, title: "Halloween Social", description: "Costumes, music and a pumpkin carving contest.", category: "SOCIAL", startTime: "2026-10-31T17:00:00Z", endTime: "2026-10-31T22:00:00Z", capacity: 80, registrationOpensAt: "2026-10-15T08:00:00Z", registrationClosesAt: "2026-10-30T20:00:00Z", visibility: "PUBLIC", status: "ARCHIVED", cancellationReason: null, version: 7, createdAt: "2026-10-05T08:00:00Z" },
      { id: 11, organizationId: 1, venueId: 4, createdById: 2, title: "Career Fair Prep Session", description: "CV review, LinkedIn tips and mock interviews ahead of the university career fair.", category: "TRAINING", startTime: "2026-11-12T14:00:00Z", endTime: "2026-11-12T16:00:00Z", capacity: 100, registrationOpensAt: "2026-11-01T08:00:00Z", registrationClosesAt: "2026-11-12T12:00:00Z", visibility: "PUBLIC", status: "ONGOING", cancellationReason: null, version: 5, createdAt: "2026-10-26T08:00:00Z" },
    ],

    eventOrganizers: [
      { id: 1, eventId: 1, userId: 2, role: "LEAD" },
      { id: 2, eventId: 1, userId: 9, role: "ORGANIZER" },
      { id: 3, eventId: 2, userId: 2, role: "LEAD" },
      { id: 4, eventId: 3, userId: 3, role: "LEAD" },
      { id: 5, eventId: 3, userId: 7, role: "ORGANIZER" },
      { id: 6, eventId: 4, userId: 6, role: "LEAD" },
      { id: 7, eventId: 5, userId: 2, role: "LEAD" },
      { id: 8, eventId: 5, userId: 9, role: "ORGANIZER" },
      { id: 9, eventId: 6, userId: 3, role: "LEAD" },
      { id: 10, eventId: 7, userId: 2, role: "LEAD" },
      { id: 11, eventId: 8, userId: 6, role: "LEAD" },
      { id: 12, eventId: 9, userId: 6, role: "LEAD" },
      { id: 13, eventId: 10, userId: 3, role: "LEAD" },
      { id: 14, eventId: 11, userId: 2, role: "LEAD" },
    ],

    registrations: [
      // Intro to Spring Boot Workshop
      { id: 1, eventId: 1, userId: 4, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-7K2Q-41", registeredAt: "2026-11-02T10:12:00Z", checkedInAt: null, lateCancellation: false },
      { id: 2, eventId: 1, userId: 7, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-9DX3-17", registeredAt: "2026-11-03T09:40:00Z", checkedInAt: null, lateCancellation: false },
      { id: 3, eventId: 1, userId: 8, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-2MF8-63", registeredAt: "2026-11-04T15:02:00Z", checkedInAt: null, lateCancellation: false },
      { id: 4, eventId: 1, userId: 10, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-5TR1-08", registeredAt: "2026-11-05T11:20:00Z", checkedInAt: null, lateCancellation: false },
      { id: 5, eventId: 1, userId: 12, status: "CANCELLED", waitlistPosition: null, checkInCode: "UBB-3HN6-92", registeredAt: "2026-11-05T12:00:00Z", checkedInAt: null, lateCancellation: false },
      // AI in Education – full, with a waitlist
      { id: 6, eventId: 2, userId: 4, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-8PL4-25", registeredAt: "2026-11-05T08:05:00Z", checkedInAt: null, lateCancellation: false },
      { id: 7, eventId: 2, userId: 9, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-1QW7-54", registeredAt: "2026-11-05T08:10:00Z", checkedInAt: null, lateCancellation: false },
      { id: 8, eventId: 2, userId: 7, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-6ZC2-71", registeredAt: "2026-11-05T09:30:00Z", checkedInAt: null, lateCancellation: false },
      { id: 9, eventId: 2, userId: 12, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-4VB9-36", registeredAt: "2026-11-06T13:45:00Z", checkedInAt: null, lateCancellation: false },
      { id: 10, eventId: 2, userId: 8, status: "WAITLISTED", waitlistPosition: 1, checkInCode: "UBB-0GE5-89", registeredAt: "2026-11-07T17:15:00Z", checkedInAt: null, lateCancellation: false },
      // Campus Clean-up Day (members only)
      { id: 11, eventId: 3, userId: 7, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-3JS8-12", registeredAt: "2026-11-02T08:30:00Z", checkedInAt: null, lateCancellation: false },
      { id: 12, eventId: 3, userId: 12, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-7YA1-47", registeredAt: "2026-11-03T08:30:00Z", checkedInAt: null, lateCancellation: false },
      // Autumn Debate Cup
      { id: 13, eventId: 4, userId: 7, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-2KD6-58", registeredAt: "2026-10-21T10:00:00Z", checkedInAt: null, lateCancellation: false },
      { id: 14, eventId: 4, userId: 4, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-9FM3-20", registeredAt: "2026-10-22T10:00:00Z", checkedInAt: null, lateCancellation: false },
      { id: 15, eventId: 4, userId: 11, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-5RX7-83", registeredAt: "2026-10-23T10:00:00Z", checkedInAt: null, lateCancellation: false },
      // Git & GitHub Training (finished)
      { id: 16, eventId: 7, userId: 4, status: "ATTENDED", waitlistPosition: null, checkInCode: "UBB-1NT4-66", registeredAt: "2026-10-02T10:00:00Z", checkedInAt: "2026-10-15T14:52:00Z", lateCancellation: false },
      { id: 17, eventId: 7, userId: 9, status: "ATTENDED", waitlistPosition: null, checkInCode: "UBB-8WQ2-31", registeredAt: "2026-10-02T11:00:00Z", checkedInAt: "2026-10-15T14:55:00Z", lateCancellation: false },
      { id: 18, eventId: 7, userId: 5, status: "ATTENDED", waitlistPosition: null, checkInCode: "UBB-6EH9-04", registeredAt: "2026-10-03T12:00:00Z", checkedInAt: "2026-10-15T15:01:00Z", lateCancellation: false },
      { id: 19, eventId: 7, userId: 11, status: "ATTENDED", waitlistPosition: null, checkInCode: "UBB-4CU5-77", registeredAt: "2026-10-04T12:00:00Z", checkedInAt: "2026-10-15T15:03:00Z", lateCancellation: false },
      { id: 20, eventId: 7, userId: 8, status: "ABSENT", waitlistPosition: null, checkInCode: "UBB-0LP1-95", registeredAt: "2026-10-05T12:00:00Z", checkedInAt: null, lateCancellation: false },
      // Board Games Night (cancelled by the organizers)
      { id: 21, eventId: 8, userId: 4, status: "CANCELLED_BY_ORGANIZER", waitlistPosition: null, checkInCode: "UBB-7SG3-50", registeredAt: "2026-11-02T18:00:00Z", checkedInAt: null, lateCancellation: false },
      // Career Fair Prep Session (ongoing)
      { id: 22, eventId: 11, userId: 4, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-3BV8-29", registeredAt: "2026-11-03T10:00:00Z", checkedInAt: null, lateCancellation: false },
      { id: 23, eventId: 11, userId: 5, status: "CONFIRMED", waitlistPosition: null, checkInCode: "UBB-5XN2-61", registeredAt: "2026-11-04T10:00:00Z", checkedInAt: null, lateCancellation: false },
      { id: 24, eventId: 11, userId: 10, status: "ATTENDED", waitlistPosition: null, checkInCode: "UBB-2AT6-13", registeredAt: "2026-11-05T10:00:00Z", checkedInAt: "2026-11-12T13:58:00Z", lateCancellation: false },
    ],

    tasks: [
      { id: 1, eventId: 1, assigneeId: 2, title: "Book the projector and microphones", description: null, dueDate: "2026-11-15", status: "DONE" },
      { id: 2, eventId: 1, assigneeId: 9, title: "Prepare the starter repository", description: "A Maven project with the exercises in separate branches.", dueDate: "2026-11-18", status: "IN_PROGRESS" },
      { id: 3, eventId: 1, assigneeId: 2, title: "Send the reminder announcement", description: null, dueDate: "2026-11-19", status: "TODO" },
      { id: 4, eventId: 5, assigneeId: 2, title: "Contact sponsors", description: "At least three companies for mentoring and prizes.", dueDate: "2026-11-30", status: "IN_PROGRESS" },
      { id: 5, eventId: 5, assigneeId: 9, title: "Draft the competition rules", description: null, dueDate: "2026-11-25", status: "TODO" },
      { id: 6, eventId: 3, assigneeId: 7, title: "Order gloves and garbage bags", description: null, dueDate: "2026-11-20", status: "TODO" },
    ],

    announcements: [
      { id: 1, eventId: 1, authorId: 2, title: "Bring your laptop", content: "Please install JDK 21 and IntelliJ IDEA (Community is fine) before the workshop. We will send the starter repository the day before.", audience: "ALL_REGISTERED", sentAt: "2026-11-10T12:00:00Z" },
      { id: 2, eventId: 4, authorId: 6, title: "Team draw published", content: "The team pairings and the room allocation for the first round are now on the club notice board. Please arrive by 9:30.", audience: "CONFIRMED_ONLY", sentAt: "2026-11-11T16:00:00Z" },
      { id: 3, eventId: 11, authorId: 2, title: "Meeting link", content: "We are live! Join the Teams meeting from the link sent to your university e-mail.", audience: "ALL_REGISTERED", sentAt: "2026-11-12T13:55:00Z" },
    ],

    notifications: [
      { id: 1, recipientId: 4, eventId: 1, type: "REGISTRATION_CONFIRMED", channel: "IN_APP", message: "Your registration for 'Intro to Spring Boot Workshop' is confirmed.", read: true, createdAt: "2026-11-02T10:12:00Z" },
      { id: 2, recipientId: 4, eventId: 2, type: "REGISTRATION_CONFIRMED", channel: "IN_APP", message: "Your registration for 'AI in Education – Round Table' is confirmed.", read: true, createdAt: "2026-11-05T08:05:00Z" },
      { id: 3, recipientId: 4, eventId: 8, type: "EVENT_CANCELLED", channel: "IN_APP", message: "The event 'Board Games Night' was cancelled. Reason: The venue is unavailable that evening. We will announce a new date soon.", read: false, createdAt: "2026-11-09T09:00:00Z" },
      { id: 4, recipientId: 4, eventId: 1, type: "ANNOUNCEMENT", channel: "IN_APP", message: "New announcement for 'Intro to Spring Boot Workshop': Bring your laptop", read: false, createdAt: "2026-11-10T12:00:00Z" },
      { id: 5, recipientId: 4, eventId: 11, type: "ANNOUNCEMENT", channel: "IN_APP", message: "New announcement for 'Career Fair Prep Session': Meeting link", read: false, createdAt: "2026-11-12T13:55:00Z" },
      { id: 6, recipientId: 1, eventId: 5, type: "APPROVAL_REQUEST", channel: "IN_APP", message: "The event 'Hackathon Kickoff 2026' is waiting for approval.", read: false, createdAt: "2026-11-08T08:30:00Z" },
      { id: 7, recipientId: 6, eventId: 9, type: "APPROVAL_RESULT", channel: "IN_APP", message: "Your event 'Public Speaking Workshop' was approved.", read: false, createdAt: "2026-11-06T10:00:00Z" },
      { id: 8, recipientId: 9, eventId: 1, type: "TASK_ASSIGNED", channel: "IN_APP", message: "You were assigned the task 'Prepare the starter repository'.", read: false, createdAt: "2026-11-06T12:00:00Z" },
    ],

    feedback: [
      { id: 1, eventId: 7, userId: 9, rating: 5, comment: "Very practical, the branching exercises were great.", anonymous: false, submittedAt: "2026-10-16T09:00:00Z" },
      { id: 2, eventId: 7, userId: 11, rating: 4, comment: "Good pace. A bit more time for merge conflicts would help.", anonymous: true, submittedAt: "2026-10-16T18:30:00Z" },
    ],
  };
}
