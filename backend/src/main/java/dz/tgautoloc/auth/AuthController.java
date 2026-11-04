package dz.tgautoloc.auth;

import java.time.Instant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import dz.tgautoloc.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;
    private final LoginAttemptService loginAttempts;
    private final AdminUserRepository admins;

    public AuthController(AuthenticationManager authenticationManager, SecurityContextRepository securityContextRepository,
                          LoginAttemptService loginAttempts, AdminUserRepository admins) {
        this.authenticationManager = authenticationManager;
        this.securityContextRepository = securityContextRepository;
        this.loginAttempts = loginAttempts;
        this.admins = admins;
    }

    public record LoginRequest(@NotBlank(message = "required") @Size(max = 50, message = "too_long") String username,
                               @NotBlank(message = "required") @Size(max = 128, message = "too_long") String password) {
    }

    public record MeResponse(String username) {
    }

    @GetMapping("/csrf")
    @Operation(summary = "Issue the XSRF-TOKEN cookie", description = "Call before the first state-changing request; "
            + "send the cookie value back in the X-XSRF-TOKEN header.")
    public ResponseEntity<Void> csrf(CsrfToken token) {
        token.getToken(); // forces the deferred token to be generated and written as a cookie
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    @Transactional
    @Operation(summary = "Administrator login (starts a session cookie)")
    public MeResponse login(@Valid @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
        String ip = request.getRemoteAddr();
        if (loginAttempts.isBlocked(body.username(), ip)) {
            log.warn("Blocked login attempt for '{}' from {}", body.username(), ip);
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "too_many_attempts", "Too many failed attempts, try again later");
        }
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(body.username().trim(), body.password()));
        } catch (AuthenticationException e) {
            loginAttempts.recordFailure(body.username(), ip);
            log.warn("Failed login for '{}' from {}", body.username(), ip);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "invalid_credentials", "Invalid username or password");
        }
        loginAttempts.recordSuccess(body.username(), ip);

        // Prevent session fixation: never reuse a pre-login session.
        HttpSession existing = request.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }
        request.getSession(true);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        admins.findByUsernameIgnoreCase(auth.getName()).ifPresent(a -> a.setLastLoginAt(Instant.now()));
        log.info("Admin '{}' logged in from {}", auth.getName(), ip);
        return new MeResponse(auth.getName());
    }

    @GetMapping("/me")
    @Operation(summary = "Current administrator, or 401")
    public MeResponse me(Authentication authentication) {
        return new MeResponse(authentication.getName());
    }
}
