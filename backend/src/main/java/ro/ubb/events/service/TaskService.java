package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.Event;
import ro.ubb.events.domain.entity.Task;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.NotificationType;
import ro.ubb.events.domain.enums.TaskStatus;
import ro.ubb.events.dto.task.TaskRequest;
import ro.ubb.events.dto.task.TaskResponse;
import ro.ubb.events.exception.InvalidRequestException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.EventOrganizerRepository;
import ro.ubb.events.repository.EventRepository;
import ro.ubb.events.repository.TaskRepository;
import ro.ubb.events.repository.UserRepository;

import java.util.List;
import java.util.Objects;

/**
 * Tasks are internal to the organizing team: they can only be assigned to organizers of the event.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EventOrganizerRepository eventOrganizerRepository;
    private final NotificationService notificationService;

    public List<TaskResponse> findByEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResourceNotFoundException("Event", eventId);
        }
        return taskRepository.findAllByEventIdOrderByIdAsc(eventId).stream()
                .map(TaskResponse::from)
                .toList();
    }

    public List<TaskResponse> findByAssignee(Long assigneeId) {
        if (!userRepository.existsById(assigneeId)) {
            throw new ResourceNotFoundException("User", assigneeId);
        }
        return taskRepository.findAllByAssigneeIdOrderByIdAsc(assigneeId).stream()
                .map(TaskResponse::from)
                .toList();
    }

    public TaskResponse findById(Long id) {
        return TaskResponse.from(getTask(id));
    }

    @Transactional
    public TaskResponse create(Long eventId, TaskRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        User assignee = getOrganizerOfEvent(eventId, request.assigneeId());

        Task task = new Task();
        task.setEvent(event);
        applyDetails(task, request, assignee);
        task.setStatus(TaskStatus.TODO);
        Task savedTask = taskRepository.save(task);

        notifyAssignee(savedTask);
        return TaskResponse.from(savedTask);
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getTask(id);
        User assignee = getOrganizerOfEvent(task.getEvent().getId(), request.assigneeId());
        boolean assigneeChanged = !Objects.equals(task.getAssignee().getId(), assignee.getId());

        applyDetails(task, request, assignee);

        if (assigneeChanged) {
            notifyAssignee(task);
        }
        return TaskResponse.from(task);
    }

    @Transactional
    public TaskResponse updateStatus(Long id, TaskStatus status) {
        Task task = getTask(id);
        task.setStatus(status);
        return TaskResponse.from(task);
    }

    @Transactional
    public void delete(Long id) {
        taskRepository.delete(getTask(id));
    }

    private User getOrganizerOfEvent(Long eventId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!eventOrganizerRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new InvalidRequestException("Tasks can only be assigned to organizers of the event");
        }
        return user;
    }

    private void notifyAssignee(Task task) {
        notificationService.send(task.getAssignee(), task.getEvent(), NotificationType.TASK_ASSIGNED,
                "You were assigned the task '" + task.getTitle() + "'.");
    }

    private Task getTask(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }

    private static void applyDetails(Task task, TaskRequest request, User assignee) {
        task.setAssignee(assignee);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setDueDate(request.dueDate());
    }
}
