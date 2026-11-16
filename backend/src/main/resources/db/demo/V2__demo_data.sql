-- Demo data for local development (same accounts and events as the former frontend mock).
-- Every demo account has the password: Parola123
-- Loaded only when db/demo is in spring.flyway.locations (see application.properties).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO users (id, email, first_name, last_name, faculty, study_year, global_role, enabled, created_at, password_hash) VALUES
    (1, 'ana.popescu@ubbcluj.ro', 'Ana', 'Popescu', 'Faculty of Mathematics and Computer Science', 4, 'ADMIN', true, '2026-09-01T08:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (2, 'mihai.ionescu@stud.ubbcluj.ro', 'Mihai', 'Ionescu', 'Faculty of Mathematics and Computer Science', 3, 'USER', true, '2026-09-02T08:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (3, 'ioana.rus@stud.ubbcluj.ro', 'Ioana', 'Rus', 'Faculty of Environmental Science and Engineering', 2, 'USER', true, '2026-09-02T09:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (4, 'andrei.pop@stud.ubbcluj.ro', 'Andrei', 'Pop', 'Faculty of Mathematics and Computer Science', 2, 'USER', true, '2026-09-03T10:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (5, 'maria.campean@stud.ubbcluj.ro', 'Maria', 'Câmpean', 'Faculty of Economics and Business Administration', 1, 'USER', true, '2026-09-04T11:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (6, 'elena.moldovan@stud.ubbcluj.ro', 'Elena', 'Moldovan', 'Faculty of Letters', 3, 'USER', true, '2026-09-04T12:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (7, 'radu.muresan@stud.ubbcluj.ro', 'Radu', 'Mureșan', 'Faculty of Law', 2, 'USER', true, '2026-09-05T08:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (8, 'bianca.toma@stud.ubbcluj.ro', 'Bianca', 'Toma', 'Faculty of Psychology and Educational Sciences', 1, 'USER', true, '2026-09-05T09:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (9, 'vlad.stan@stud.ubbcluj.ro', 'Vlad', 'Stan', 'Faculty of Mathematics and Computer Science', 3, 'USER', true, '2026-09-06T08:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (10, 'diana.lazar@stud.ubbcluj.ro', 'Diana', 'Lazăr', 'Faculty of European Studies', 2, 'USER', true, '2026-09-06T09:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (11, 'paul.rusu@stud.ubbcluj.ro', 'Paul', 'Rusu', 'Faculty of Physics', 4, 'USER', true, '2026-09-07T08:00:00Z', crypt('Parola123', gen_salt('bf', 10))),
    (12, 'sara.nagy@stud.ubbcluj.ro', 'Sara', 'Nagy', 'Faculty of Biology and Geology', 1, 'USER', true, '2026-09-07T09:00:00Z', crypt('Parola123', gen_salt('bf', 10)));

INSERT INTO organizations (id, name, description, logo_url, contact_email, status, created_at) VALUES
    (1, 'UBB Tech Society', 'A community of students passionate about software, data and hardware. We run hands-on workshops, hackathons and talks with industry speakers.', NULL, 'contact@ubbtech.example', 'ACTIVE', '2026-09-01T08:00:00Z'),
    (2, 'Green Campus Initiative', 'Student volunteers working towards a more sustainable university: clean-up days, recycling campaigns and talks about climate.', NULL, 'hello@greencampus.example', 'ACTIVE', '2026-09-01T09:00:00Z'),
    (3, 'UBB Debate Club', 'We train critical thinking and public speaking through weekly debates, workshops and inter-university tournaments.', NULL, 'debate@ubbdebate.example', 'ACTIVE', '2026-09-01T10:00:00Z'),
    (4, 'Erasmus Student Circle', 'Helping international and Erasmus students feel at home in Cluj-Napoca through social and cultural events.', NULL, 'erasmus.circle@example.com', 'SUSPENDED', '2026-09-01T11:00:00Z');

INSERT INTO memberships (id, user_id, organization_id, role, joined_at, active) VALUES
    (1, 2, 1, 'COORDINATOR', '2026-09-02T08:00:00Z', true),
    (2, 4, 1, 'MEMBER', '2026-09-10T08:00:00Z', true),
    (3, 9, 1, 'MEMBER', '2026-09-11T08:00:00Z', true),
    (4, 3, 2, 'COORDINATOR', '2026-09-02T09:00:00Z', true),
    (5, 7, 2, 'MEMBER', '2026-09-12T08:00:00Z', true),
    (6, 12, 2, 'MEMBER', '2026-09-13T08:00:00Z', true),
    (7, 6, 3, 'COORDINATOR', '2026-09-04T12:00:00Z', true),
    (8, 7, 3, 'MEMBER', '2026-09-14T08:00:00Z', true),
    (9, 10, 4, 'COORDINATOR', '2026-09-06T09:00:00Z', true);

INSERT INTO venues (id, name, address, max_capacity, online) VALUES
    (1, 'Aula Magna', 'Str. Mihail Kogălniceanu 1, Cluj-Napoca', 400, false),
    (2, 'FMI – Room 2/I', 'Str. Mihail Kogălniceanu 1, Cluj-Napoca', 60, false),
    (3, 'Student Hub', 'Str. Avram Iancu 19, Cluj-Napoca', 120, false),
    (4, 'Online (Microsoft Teams)', NULL, NULL, true),
    (5, 'Central Park', 'Parcul Central, Cluj-Napoca', NULL, false);

INSERT INTO events (id, organization_id, venue_id, created_by_id, title, description, category, start_time, end_time, capacity, registration_opens_at, registration_closes_at, visibility, status, cancellation_reason, version, created_at) VALUES
    (1, 1, 2, 2, 'Intro to Spring Boot Workshop', 'Build your first REST API with Spring Boot in three hours. We cover controllers, services, persistence with JPA and testing. Bring a laptop with JDK 21 installed.', 'WORKSHOP', '2026-11-20T16:00:00Z', '2026-11-20T19:00:00Z', 40, '2026-11-01T08:00:00Z', '2026-11-19T20:00:00Z', 'PUBLIC', 'PUBLISHED', NULL, 3, '2026-10-20T08:00:00Z'),
    (2, 1, 3, 2, 'AI in Education – Round Table', 'An open discussion between students and teaching staff about how generative AI changes learning and assessment. Seats are limited to keep the discussion personal.', 'CONFERENCE', '2026-12-03T08:00:00Z', '2026-12-03T11:00:00Z', 4, '2026-11-05T08:00:00Z', '2026-12-01T20:00:00Z', 'PUBLIC', 'PUBLISHED', NULL, 2, '2026-10-25T08:00:00Z'),
    (3, 2, 5, 3, 'Campus Clean-up Day', 'Join our volunteers for a morning of cleaning the Central Park area. Gloves, bags and snacks are provided. Open to members of Green Campus Initiative.', 'SOCIAL', '2026-11-22T08:00:00Z', '2026-11-22T12:00:00Z', 25, '2026-11-01T08:00:00Z', '2026-11-21T18:00:00Z', 'MEMBERS_ONLY', 'PUBLISHED', NULL, 2, '2026-10-22T08:00:00Z'),
    (4, 3, 3, 6, 'Autumn Debate Cup', 'Our yearly British Parliamentary tournament for beginners and experienced debaters. Teams of two, five preliminary rounds and a grand final.', 'COMPETITION', '2026-11-14T07:00:00Z', '2026-11-14T15:00:00Z', 16, '2026-10-20T08:00:00Z', '2026-11-10T20:00:00Z', 'PUBLIC', 'REGISTRATION_CLOSED', NULL, 4, '2026-10-10T08:00:00Z'),
    (5, 1, 1, 2, 'Hackathon Kickoff 2026', '24 hours, teams of four, one theme announced at the start. Mentors from local companies, food and prizes included.', 'COMPETITION', '2026-12-12T08:00:00Z', '2026-12-13T16:00:00Z', 120, '2026-11-20T08:00:00Z', '2026-12-10T20:00:00Z', 'PUBLIC', 'PENDING_APPROVAL', NULL, 1, '2026-11-08T08:00:00Z'),
    (6, 2, 4, 3, 'Zero-Waste Campus Talk', 'How can a university of 45,000 students reduce its waste? Guests from the city''s sustainability office share data and ideas.', 'CONFERENCE', '2027-01-15T16:00:00Z', '2027-01-15T17:30:00Z', 200, '2026-12-15T08:00:00Z', '2027-01-14T20:00:00Z', 'PUBLIC', 'DRAFT', NULL, 0, '2026-11-10T08:00:00Z'),
    (7, 1, 2, 2, 'Git & GitHub Training', 'Version control from zero: commits, branches, merges, pull requests and resolving conflicts, with plenty of exercises.', 'TRAINING', '2026-10-15T15:00:00Z', '2026-10-15T18:00:00Z', 30, '2026-10-01T08:00:00Z', '2026-10-14T20:00:00Z', 'PUBLIC', 'FINISHED', NULL, 6, '2026-09-20T08:00:00Z'),
    (8, 3, 3, 6, 'Board Games Night', 'A relaxed evening of strategy and party games. Meet the club members and bring your favourite game!', 'SOCIAL', '2026-11-18T17:00:00Z', '2026-11-18T21:00:00Z', 30, '2026-11-01T08:00:00Z', '2026-11-17T20:00:00Z', 'PUBLIC', 'CANCELLED', 'The venue is unavailable that evening. We will announce a new date soon.', 4, '2026-10-28T08:00:00Z'),
    (9, 3, 2, 6, 'Public Speaking Workshop', 'Practical techniques for structuring a speech, managing stage fright and using your voice. Short exercises in small groups.', 'WORKSHOP', '2026-12-05T10:00:00Z', '2026-12-05T13:00:00Z', 20, '2026-11-15T08:00:00Z', '2026-12-04T20:00:00Z', 'PUBLIC', 'APPROVED', NULL, 2, '2026-11-02T08:00:00Z'),
    (10, 2, 3, 3, 'Halloween Social', 'Costumes, music and a pumpkin carving contest.', 'SOCIAL', '2026-10-31T17:00:00Z', '2026-10-31T22:00:00Z', 80, '2026-10-15T08:00:00Z', '2026-10-30T20:00:00Z', 'PUBLIC', 'ARCHIVED', NULL, 7, '2026-10-05T08:00:00Z'),
    (11, 1, 4, 2, 'Career Fair Prep Session', 'CV review, LinkedIn tips and mock interviews ahead of the university career fair.', 'TRAINING', '2026-11-12T14:00:00Z', '2026-11-12T16:00:00Z', 100, '2026-11-01T08:00:00Z', '2026-11-12T12:00:00Z', 'PUBLIC', 'ONGOING', NULL, 5, '2026-10-26T08:00:00Z');

INSERT INTO event_organizers (id, event_id, user_id, role) VALUES
    (1, 1, 2, 'LEAD'),
    (2, 1, 9, 'ORGANIZER'),
    (3, 2, 2, 'LEAD'),
    (4, 3, 3, 'LEAD'),
    (5, 3, 7, 'ORGANIZER'),
    (6, 4, 6, 'LEAD'),
    (7, 5, 2, 'LEAD'),
    (8, 5, 9, 'ORGANIZER'),
    (9, 6, 3, 'LEAD'),
    (10, 7, 2, 'LEAD'),
    (11, 8, 6, 'LEAD'),
    (12, 9, 6, 'LEAD'),
    (13, 10, 3, 'LEAD'),
    (14, 11, 2, 'LEAD');

INSERT INTO registrations (id, event_id, user_id, status, waitlist_position, check_in_code, registered_at, checked_in_at, late_cancellation) VALUES
    (1, 1, 4, 'CONFIRMED', NULL, 'UBB-7K2Q-41', '2026-11-02T10:12:00Z', NULL, false),
    (2, 1, 7, 'CONFIRMED', NULL, 'UBB-9DX3-17', '2026-11-03T09:40:00Z', NULL, false),
    (3, 1, 8, 'CONFIRMED', NULL, 'UBB-2MF8-63', '2026-11-04T15:02:00Z', NULL, false),
    (4, 1, 10, 'CONFIRMED', NULL, 'UBB-5TR1-08', '2026-11-05T11:20:00Z', NULL, false),
    (5, 1, 12, 'CANCELLED', NULL, 'UBB-3HN6-92', '2026-11-05T12:00:00Z', NULL, false),
    (6, 2, 4, 'CONFIRMED', NULL, 'UBB-8PL4-25', '2026-11-05T08:05:00Z', NULL, false),
    (7, 2, 9, 'CONFIRMED', NULL, 'UBB-1QW7-54', '2026-11-05T08:10:00Z', NULL, false),
    (8, 2, 7, 'CONFIRMED', NULL, 'UBB-6ZC2-71', '2026-11-05T09:30:00Z', NULL, false),
    (9, 2, 12, 'CONFIRMED', NULL, 'UBB-4VB9-36', '2026-11-06T13:45:00Z', NULL, false),
    (10, 2, 8, 'WAITLISTED', 1, 'UBB-0GE5-89', '2026-11-07T17:15:00Z', NULL, false),
    (11, 3, 7, 'CONFIRMED', NULL, 'UBB-3JS8-12', '2026-11-02T08:30:00Z', NULL, false),
    (12, 3, 12, 'CONFIRMED', NULL, 'UBB-7YA1-47', '2026-11-03T08:30:00Z', NULL, false),
    (13, 4, 7, 'CONFIRMED', NULL, 'UBB-2KD6-58', '2026-10-21T10:00:00Z', NULL, false),
    (14, 4, 4, 'CONFIRMED', NULL, 'UBB-9FM3-20', '2026-10-22T10:00:00Z', NULL, false),
    (15, 4, 11, 'CONFIRMED', NULL, 'UBB-5RX7-83', '2026-10-23T10:00:00Z', NULL, false),
    (16, 7, 4, 'ATTENDED', NULL, 'UBB-1NT4-66', '2026-10-02T10:00:00Z', '2026-10-15T14:52:00Z', false),
    (17, 7, 9, 'ATTENDED', NULL, 'UBB-8WQ2-31', '2026-10-02T11:00:00Z', '2026-10-15T14:55:00Z', false),
    (18, 7, 5, 'ATTENDED', NULL, 'UBB-6EH9-04', '2026-10-03T12:00:00Z', '2026-10-15T15:01:00Z', false),
    (19, 7, 11, 'ATTENDED', NULL, 'UBB-4CU5-77', '2026-10-04T12:00:00Z', '2026-10-15T15:03:00Z', false),
    (20, 7, 8, 'ABSENT', NULL, 'UBB-0LP1-95', '2026-10-05T12:00:00Z', NULL, false),
    (21, 8, 4, 'CANCELLED_BY_ORGANIZER', NULL, 'UBB-7SG3-50', '2026-11-02T18:00:00Z', NULL, false),
    (22, 11, 4, 'CONFIRMED', NULL, 'UBB-3BV8-29', '2026-11-03T10:00:00Z', NULL, false),
    (23, 11, 5, 'CONFIRMED', NULL, 'UBB-5XN2-61', '2026-11-04T10:00:00Z', NULL, false),
    (24, 11, 10, 'ATTENDED', NULL, 'UBB-2AT6-13', '2026-11-05T10:00:00Z', '2026-11-12T13:58:00Z', false);

INSERT INTO tasks (id, event_id, assignee_id, title, description, due_date, status) VALUES
    (1, 1, 2, 'Book the projector and microphones', NULL, '2026-11-15', 'DONE'),
    (2, 1, 9, 'Prepare the starter repository', 'A Maven project with the exercises in separate branches.', '2026-11-18', 'IN_PROGRESS'),
    (3, 1, 2, 'Send the reminder announcement', NULL, '2026-11-19', 'TODO'),
    (4, 5, 2, 'Contact sponsors', 'At least three companies for mentoring and prizes.', '2026-11-30', 'IN_PROGRESS'),
    (5, 5, 9, 'Draft the competition rules', NULL, '2026-11-25', 'TODO'),
    (6, 3, 7, 'Order gloves and garbage bags', NULL, '2026-11-20', 'TODO');

INSERT INTO announcements (id, event_id, author_id, title, content, audience, sent_at) VALUES
    (1, 1, 2, 'Bring your laptop', 'Please install JDK 21 and IntelliJ IDEA (Community is fine) before the workshop. We will send the starter repository the day before.', 'ALL_REGISTERED', '2026-11-10T12:00:00Z'),
    (2, 4, 6, 'Team draw published', 'The team pairings and the room allocation for the first round are now on the club notice board. Please arrive by 9:30.', 'CONFIRMED_ONLY', '2026-11-11T16:00:00Z'),
    (3, 11, 2, 'Meeting link', 'We are live! Join the Teams meeting from the link sent to your university e-mail.', 'ALL_REGISTERED', '2026-11-12T13:55:00Z');

INSERT INTO notifications (id, recipient_id, event_id, type, channel, message, read, created_at) VALUES
    (1, 4, 1, 'REGISTRATION_CONFIRMED', 'IN_APP', 'Your registration for ''Intro to Spring Boot Workshop'' is confirmed.', true, '2026-11-02T10:12:00Z'),
    (2, 4, 2, 'REGISTRATION_CONFIRMED', 'IN_APP', 'Your registration for ''AI in Education – Round Table'' is confirmed.', true, '2026-11-05T08:05:00Z'),
    (3, 4, 8, 'EVENT_CANCELLED', 'IN_APP', 'The event ''Board Games Night'' was cancelled. Reason: The venue is unavailable that evening. We will announce a new date soon.', false, '2026-11-09T09:00:00Z'),
    (4, 4, 1, 'ANNOUNCEMENT', 'IN_APP', 'New announcement for ''Intro to Spring Boot Workshop'': Bring your laptop', false, '2026-11-10T12:00:00Z'),
    (5, 4, 11, 'ANNOUNCEMENT', 'IN_APP', 'New announcement for ''Career Fair Prep Session'': Meeting link', false, '2026-11-12T13:55:00Z'),
    (6, 1, 5, 'APPROVAL_REQUEST', 'IN_APP', 'The event ''Hackathon Kickoff 2026'' is waiting for approval.', false, '2026-11-08T08:30:00Z'),
    (7, 6, 9, 'APPROVAL_RESULT', 'IN_APP', 'Your event ''Public Speaking Workshop'' was approved.', false, '2026-11-06T10:00:00Z'),
    (8, 9, 1, 'TASK_ASSIGNED', 'IN_APP', 'You were assigned the task ''Prepare the starter repository''.', false, '2026-11-06T12:00:00Z');

INSERT INTO feedback (id, event_id, user_id, rating, comment, anonymous, submitted_at) VALUES
    (1, 7, 9, 5, 'Very practical, the branching exercises were great.', false, '2026-10-16T09:00:00Z'),
    (2, 7, 11, 4, 'Good pace. A bit more time for merge conflicts would help.', true, '2026-10-16T18:30:00Z');

SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval(pg_get_serial_sequence('organizations', 'id'), (SELECT COALESCE(MAX(id), 1) FROM organizations));
SELECT setval(pg_get_serial_sequence('memberships', 'id'), (SELECT COALESCE(MAX(id), 1) FROM memberships));
SELECT setval(pg_get_serial_sequence('venues', 'id'), (SELECT COALESCE(MAX(id), 1) FROM venues));
SELECT setval(pg_get_serial_sequence('events', 'id'), (SELECT COALESCE(MAX(id), 1) FROM events));
SELECT setval(pg_get_serial_sequence('event_organizers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM event_organizers));
SELECT setval(pg_get_serial_sequence('registrations', 'id'), (SELECT COALESCE(MAX(id), 1) FROM registrations));
SELECT setval(pg_get_serial_sequence('tasks', 'id'), (SELECT COALESCE(MAX(id), 1) FROM tasks));
SELECT setval(pg_get_serial_sequence('announcements', 'id'), (SELECT COALESCE(MAX(id), 1) FROM announcements));
SELECT setval(pg_get_serial_sequence('notifications', 'id'), (SELECT COALESCE(MAX(id), 1) FROM notifications));
SELECT setval(pg_get_serial_sequence('feedback', 'id'), (SELECT COALESCE(MAX(id), 1) FROM feedback));
