package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.GlobalRole;
import ro.ubb.events.dto.user.CreateUserRequest;
import ro.ubb.events.dto.user.UpdateUserRequest;
import ro.ubb.events.dto.user.UserResponse;
import ro.ubb.events.exception.ConflictException;
import ro.ubb.events.exception.ResourceNotFoundException;
import ro.ubb.events.repository.UserRepository;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> findAll() {
        return userRepository.findAll(Sort.by("id")).stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse findById(Long id) {
        return UserResponse.from(getUser(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        // BR-28: the email address must be unique
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("A user with email " + email + " already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setFaculty(request.faculty());
        user.setStudyYear(request.studyYear());
        user.setGlobalRole(GlobalRole.USER);
        // TODO BR-28: accounts should be activated through a link sent to the institutional e-mail;
        //  until that flow exists, new accounts are enabled immediately.
        user.setEnabled(true);

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = getUser(id);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setFaculty(request.faculty());
        user.setStudyYear(request.studyYear());
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse setEnabled(Long id, boolean enabled) {
        User user = getUser(id);
        user.setEnabled(enabled);
        return UserResponse.from(user);
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    /**
     * Emails are stored in lower case so that uniqueness does not depend on letter case.
     */
    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
