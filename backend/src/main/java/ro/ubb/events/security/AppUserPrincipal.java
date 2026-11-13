package ro.ubb.events.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import ro.ubb.events.domain.entity.User;
import ro.ubb.events.domain.enums.GlobalRole;

import java.util.Collection;
import java.util.List;

/**
 * The authenticated user as seen by Spring Security during login.
 */
public record AppUserPrincipal(Long id, String email, String passwordHash, GlobalRole role, boolean enabled)
        implements UserDetails {

    public static AppUserPrincipal from(User user) {
        return new AppUserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash(),
                user.getGlobalRole(), user.isEnabled());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
