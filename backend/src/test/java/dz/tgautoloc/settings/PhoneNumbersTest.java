package dz.tgautoloc.settings;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class PhoneNumbersTest {

    @Test
    void convertsAlgerianNationalFormat() {
        assertThat(PhoneNumbers.normalize("0552 12 34 56")).contains("213552123456");
        assertThat(PhoneNumbers.normalize("05.52.12.34.56")).contains("213552123456");
    }

    @Test
    void keepsInternationalFormats() {
        assertThat(PhoneNumbers.normalize("+213 552 12 34 56")).contains("213552123456");
        assertThat(PhoneNumbers.normalize("00213552123456")).contains("213552123456");
        assertThat(PhoneNumbers.normalize("+33 6 12 34 56 78")).contains("33612345678");
    }

    @Test
    void blankMeansNotConfigured() {
        assertThat(PhoneNumbers.normalize(null)).isEmpty();
        assertThat(PhoneNumbers.normalize("  ")).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"abc", "123", "0552-12-34-56-78-90-12", "javascript:alert(1)", "055212345"})
    void rejectsInvalidNumbers(String input) {
        assertThatThrownBy(() -> PhoneNumbers.normalize(input)).isInstanceOf(IllegalArgumentException.class);
    }
}
