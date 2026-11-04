package dz.tgautoloc.car;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SlugsTest {

    @Test
    void buildsSlugFromBrandModelAndId() {
        assertThat(Slugs.forCar("Seat", "Ibiza", 123)).isEqualTo("seat-ibiza-123");
        assertThat(Slugs.forCar("Citroën", "C3 Aircross", 7)).isEqualTo("citroen-c3-aircross-7");
        assertThat(Slugs.forCar("  Mercedes-Benz ", "Classe A (W177)", 9)).isEqualTo("mercedes-benz-classe-a-w177-9");
    }

    @Test
    void fallsBackWhenNothingSlugifiable() {
        assertThat(Slugs.forCar("رينو", "كليو", 4)).isEqualTo("car-4");
    }

    @Test
    void capsLength() {
        String slug = Slugs.forCar("a".repeat(100), "b".repeat(100), 1);
        assertThat(slug.length()).isLessThanOrEqualTo(122);
        assertThat(slug).endsWith("-1").doesNotContain("--");
    }

    @Test
    void extractsTrailingId() {
        assertThat(Slugs.extractId("seat-ibiza-123")).contains(123L);
        assertThat(Slugs.extractId("peugeot-208-45")).contains(45L);
        assertThat(Slugs.extractId("42")).contains(42L);
        assertThat(Slugs.extractId("seat-ibiza")).isEmpty();
        assertThat(Slugs.extractId("../etc/passwd")).isEmpty();
        assertThat(Slugs.extractId(null)).isEmpty();
    }
}
