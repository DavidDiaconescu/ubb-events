package ro.ubb.events.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.ubb.events.repository.UserRepository;
import ro.ubb.events.service.UserService;

/**
 * Loads users by e-mail for the login flow (UC-02).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) {
        return userRepository.findByEmail(UserService.normalizeEmail(email))
                .map(AppUserPrincipal::from)
                // Turned into BadCredentialsException by DaoAuthenticationProvider, so the
                // response does not reveal whether the account exists
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
