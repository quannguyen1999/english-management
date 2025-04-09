package com.eng.repositories;

import com.eng.entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    /**
     * Finds a user by their username.
     * @param userName The username of the user to find.
     * @return The user with the given username.
     */
    User findByUsername(String userName);

    /**
     * Finds a user by their email.
     * @param email The email of the user to find.
     * @return The user with the given email.
     */
    User findByEmail(String email);

    /**
     * Finds a list of users by their IDs and returns their IDs and usernames.
     * @param uuids The list of IDs of the users to find.
     * @return A list of objects containing the user IDs and usernames.
     */
    @Query("SELECT u.id, u.username FROM User u WHERE u.id IN :uuids")
    List<Object[]> findUserIdAndUsernameByIds(@Param("uuids") List<UUID> uuids);

    /**
     * Searches for users by keyword with pagination.
     * @param keyword The keyword to search for.
     * @param pageRequest The page request containing page number and size.
     * @return A page of users matching the keyword.
     */
    @Query("SELECT p FROM User p WHERE " +
            "LOWER(p.username) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<User> searchUsers(@Param("keyword") String keyword, PageRequest pageRequest);

    /**
     * Finds a user by their username.
     * @param username The username of the user to find.
     * @return The user with the given username.
     */
    User findUserByUsername(String username);

}
