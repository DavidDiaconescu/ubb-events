package ro.ubb.events.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import ro.ubb.events.dto.auth.LoginRequest;
import ro.ubb.events.dto.auth.LoginResponse;
import ro.ubb.events.dto.user.CreateUserRequest;
import ro.ubb.events.dto.user.UserResponse;
import ro.ubb.events.security.AppUserPrincipal;
import ro.ubb.events.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    /**
     * UC-01: self-registration, with the same rules as an admin-created account: domain and password
     * rules are validated on {@link CreateUserRequest}, normalization and uniqueness (BR-28) in UserService.
     */
    public UserResponse register(CreateUserRequest request) {
        return userService.create(request);
    }

    /**
     * UC-02: throws BadCredentialsException (401) or DisabledException (403) on failure.
     */
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password()));
        AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();

        JwtService.IssuedToken token = jwtService.issue(principal);
        return LoginResponse.bearer(token.value(), token.expiresAt(), userService.findById(principal.id()));
    }

    public UserResponse currentUser(Long userId) {
        return userService.findById(userId);
    }
}
