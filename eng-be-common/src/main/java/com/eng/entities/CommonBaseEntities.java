package com.eng.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Base entity class that provides common fields and functionality for all entities in the system.
 * This class uses JPA annotations to automatically manage creation and update timestamps.
 * 
 * Key features:
 * - Automatic timestamp management for create and update operations
 * - Uses Lombok annotations to reduce boilerplate code
 * - Implements JPA lifecycle callbacks for automatic date updates
 */
@NoArgsConstructor  // Generates a no-args constructor
@AllArgsConstructor // Generates a constructor with all fields
@Data              // Generates getters, setters, toString, equals, and hashCode methods
@MappedSuperclass  // This tells Hibernate to inherit fields in child entities
public class CommonBaseEntities {

    /**
     * Timestamp when the entity was created.
     * Automatically set when the entity is first persisted.
     */
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    /**
     * Timestamp when the entity was last updated.
     * Automatically updated whenever the entity is modified.
     */
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    /**
     * JPA lifecycle callback that is triggered before an entity is persisted.
     * Sets both createAt and updatedAt timestamps to the current time.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
    }

    /**
     * JPA lifecycle callback that is triggered before an entity is updated.
     * Updates the updatedAt timestamp to the current time.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
}
