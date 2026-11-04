package dz.tgautoloc.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import dz.tgautoloc.config.SecurityProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Brute-force protection for the admin login. Failed attempts are counted per username and
 * per client IP; once a key reaches the limit it is locked for the configured duration.
 * The IP limit is higher so that a shared NAT address does not lock out an admin immediately.
 * State is in-memory (single backend instance); use a shared store if you scale horizontally.
 */
@Service
public class LoginAttemptService {

    private static final int IP_MULTIPLIER = 4;

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();
    private final int maxAttempts;
    private final Duration lockDuration;
    private final Clock clock;

    @Autowired
    public LoginAttemptService(SecurityProperties properties) {
        this(properties.login().maxAttempts(), properties.login().lockDuration(), Clock.systemUTC());
    }

    LoginAttemptService(int maxAttempts, Duration lockDuration, Clock clock) {
        this.maxAttempts = maxAttempts;
        this.lockDuration = lockDuration;
        this.clock = clock;
    }

    private record Attempts(int failures, Instant windowStart) {
    }

    public boolean isBlocked(String username, String ip) {
        return reachedLimit(userKey(username), maxAttempts) || reachedLimit(ipKey(ip), maxAttempts * IP_MULTIPLIER);
    }

    public void recordFailure(String username, String ip) {
        increment(userKey(username));
        increment(ipKey(ip));
    }

    public void recordSuccess(String username, String ip) {
        attempts.remove(userKey(username));
        attempts.remove(ipKey(ip));
    }

    @Scheduled(fixedDelay = 600_000)
    void purgeExpired() {
        Instant now = clock.instant();
        attempts.entrySet().removeIf(e -> expired(e.getValue(), now));
    }

    private boolean reachedLimit(String key, int limit) {
        Attempts a = attempts.get(key);
        return a != null && !expired(a, clock.instant()) && a.failures() >= limit;
    }

    private void increment(String key) {
        Instant now = clock.instant();
        attempts.compute(key, (k, a) -> a == null || expired(a, now) ? new Attempts(1, now) : new Attempts(a.failures() + 1, now));
    }

    private boolean expired(Attempts a, Instant now) {
        return a.windowStart().plus(lockDuration).isBefore(now);
    }

    private static String userKey(String username) {
        return "u:" + (username == null ? "" : username.trim().toLowerCase(Locale.ROOT));
    }

    private static String ipKey(String ip) {
        return "ip:" + ip;
    }
}
