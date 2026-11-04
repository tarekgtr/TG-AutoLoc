package dz.tgautoloc.auth;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import org.junit.jupiter.api.Test;

class LoginAttemptServiceTest {

    private static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T10:00:00Z");

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }
    }

    private final MutableClock clock = new MutableClock();
    private final LoginAttemptService service = new LoginAttemptService(3, Duration.ofMinutes(15), clock);

    @Test
    void locksUsernameAfterMaxFailures() {
        service.recordFailure("Admin", "1.1.1.1");
        service.recordFailure("admin", "2.2.2.2");
        assertThat(service.isBlocked("admin", "3.3.3.3")).isFalse();
        service.recordFailure("ADMIN ", "4.4.4.4");
        assertThat(service.isBlocked("admin", "5.5.5.5")).isTrue();
    }

    @Test
    void lockExpires() {
        for (int i = 0; i < 3; i++) {
            service.recordFailure("admin", "1.1.1.1");
        }
        clock.now = clock.now.plus(Duration.ofMinutes(16));
        assertThat(service.isBlocked("admin", "1.1.1.1")).isFalse();
    }

    @Test
    void locksIpTryingManyUsernames() {
        for (int i = 0; i < 12; i++) {
            service.recordFailure("user" + i, "9.9.9.9");
        }
        assertThat(service.isBlocked("someone-else", "9.9.9.9")).isTrue();
        assertThat(service.isBlocked("someone-else", "8.8.8.8")).isFalse();
    }

    @Test
    void successResetsCounters() {
        service.recordFailure("admin", "1.1.1.1");
        service.recordFailure("admin", "1.1.1.1");
        service.recordSuccess("admin", "1.1.1.1");
        service.recordFailure("admin", "1.1.1.1");
        assertThat(service.isBlocked("admin", "1.1.1.1")).isFalse();
    }
}
