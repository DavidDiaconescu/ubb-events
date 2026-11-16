package ro.ubb.events;

import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.Organization;
import ro.ubb.events.domain.entity.Registration;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.EventCategory;
import ro.ubb.events.domain.enums.EventStatus;
import ro.ubb.events.domain.enums.GlobalRole;
import ro.ubb.events.domain.enums.OrgStatus;
import ro.ubb.events.domain.enums.RegistrationStatus;
import ro.ubb.events.domain.enums.Visibility;

import java.time.Duration;
import java.time.Instant;

/**
 * Builders for entities used by the unit tests (no database involved).
 */
public final class TestData {

    private TestData() {
    }

    public static User user(long id) {
        User user = new User();
        user.setId(id);
        user.setEmail("user" + id + "@stud.ubbcluj.ro");
        user.setFirstName("First" + id);
        user.setLastName("Last" + id);
        user.setFaculty("FMI");
        user.setStudyYear(2);
        user.setGlobalRole(GlobalRole.USER);
        user.setEnabled(true);
        return user;
    }

    public static Organization organization(long id) {
        Organization organization = new Organization();
        organization.setId(id);
        organization.setName("Organization " + id);
        organization.setDescription("Description");
        organization.setContactEmail("org" + id + "@example.com");
        organization.setStatus(OrgStatus.ACTIVE);
        return organization;
    }

    /**
     * A PUBLISHED, PUBLIC event whose registration period is open: it started an hour ago,
     * closes tomorrow, and the event itself takes place in two days.
     */
    public static Event openEvent(long id, int capacity) {
        Instant now = Instant.now();
        Event event = new Event();
        event.setId(id);
        event.setOrganization(organization(1));
        event.setCreatedBy(user(100));
        event.setTitle("Event " + id);
        event.setDescription("Description");
        event.setCategory(EventCategory.WORKSHOP);
        event.setStartTime(now.plus(Duration.ofDays(2)));
        event.setEndTime(now.plus(Duration.ofDays(2)).plus(Duration.ofHours(3)));
        event.setCapacity(capacity);
        event.setRegistrationOpensAt(now.minus(Duration.ofHours(1)));
        event.setRegistrationClosesAt(now.plus(Duration.ofDays(1)));
        event.setVisibility(Visibility.PUBLIC);
        event.setStatus(EventStatus.PUBLISHED);
        event.setVersion(0L);
        return event;
    }

    public static Event eventWithStatus(long id, EventStatus status) {
        Event event = openEvent(id, 10);
        event.setStatus(status);
        return event;
    }

    public static Registration registration(long id, Event event, User user, RegistrationStatus status) {
        Registration registration = new Registration();
        registration.setId(id);
        registration.setEvent(event);
        registration.setUser(user);
        registration.setStatus(status);
        registration.setCheckInCode("UBB-TEST-" + id);
        registration.setRegisteredAt(Instant.now());
        registration.setLateCancellation(false);
        return registration;
    }
}
