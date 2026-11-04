package dz.tgautoloc.settings;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Single-row table (id = 1) with the public contact details of the business. */
@Entity
@Table(name = "business_settings")
public class BusinessSettings {

    public static final short SINGLETON_ID = 1;

    @Id
    @JdbcTypeCode(SqlTypes.SMALLINT)
    private Short id = SINGLETON_ID;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "secondary_phone", length = 20)
    private String secondaryPhone;

    @Column(length = 120)
    private String email;

    @Column(name = "location_fr")
    private String locationFr;

    @Column(name = "location_ar")
    private String locationAr;

    @Column(name = "opening_hours_fr")
    private String openingHoursFr;

    @Column(name = "opening_hours_ar")
    private String openingHoursAr;

    @Column(name = "maps_url", length = 500)
    private String mapsUrl;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }

    public Short getId() {
        return id;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getSecondaryPhone() {
        return secondaryPhone;
    }

    public void setSecondaryPhone(String secondaryPhone) {
        this.secondaryPhone = secondaryPhone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLocationFr() {
        return locationFr;
    }

    public void setLocationFr(String locationFr) {
        this.locationFr = locationFr;
    }

    public String getLocationAr() {
        return locationAr;
    }

    public void setLocationAr(String locationAr) {
        this.locationAr = locationAr;
    }

    public String getOpeningHoursFr() {
        return openingHoursFr;
    }

    public void setOpeningHoursFr(String openingHoursFr) {
        this.openingHoursFr = openingHoursFr;
    }

    public String getOpeningHoursAr() {
        return openingHoursAr;
    }

    public void setOpeningHoursAr(String openingHoursAr) {
        this.openingHoursAr = openingHoursAr;
    }

    public String getMapsUrl() {
        return mapsUrl;
    }

    public void setMapsUrl(String mapsUrl) {
        this.mapsUrl = mapsUrl;
    }

    public String getFacebookUrl() {
        return facebookUrl;
    }

    public void setFacebookUrl(String facebookUrl) {
        this.facebookUrl = facebookUrl;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
