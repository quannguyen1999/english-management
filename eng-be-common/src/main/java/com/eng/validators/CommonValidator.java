package com.eng.validators;

import com.eng.constants.MessageErrors;
import com.eng.exceptions.BadRequestException;
import org.springframework.util.CollectionUtils;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.BiConsumer;
import java.util.function.Consumer;

import static com.eng.constants.MessageErrors.PAGE_INVALID;
import static com.eng.constants.MessageErrors.SIZE_INVALID;

/**
 * A utility class for common validation checks used throughout the application.
 * Provides reusable validation methods for checking empty values, UUIDs, numbers, lists, and more.
 */
class CommonValidator {

    private static final Integer MAX_SIZE_PAGE = 30;

    /**
     * Regular expression for validating email format
     */
    public static final String EMAIL_REGEX = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";

    /**
     * Regular expression for validating phone numbers
     */
    public static final String PHONE_REGEX = "^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$";

    /**
     * Date limit for validating birth dates
     */
    public static final Date BIRTHDAY_LIMIT = new Date(2023 - 1900, Calendar.JANUARY, 1);

    /**
     * Regular expression for validating passwords (must contain at least one digit, one lowercase, one uppercase, one special character, and be at least 8 characters long)
     */
    public static final String PASSWORD_REGEX = "(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}";

    /**
     * Validates if an input is empty.
     * Throws a BadRequestException if the input is empty or null.
     */
    static BiConsumer<Object, MessageErrors> checkEmpty() {
        return (input, messageError) -> {
            if (ObjectUtils.isEmpty(input) || (input instanceof String && !StringUtils.hasLength(input.toString()))) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates if a given string is a valid UUID.
     * Throws a BadRequestException if the UUID format is incorrect.
     */
    static BiConsumer<String, MessageErrors> checkUUID() {
        return (input, messageError) -> {
            try {
                UUID uuid = UUID.fromString(input); // Attempt to parse UUID
            } catch (IllegalArgumentException e) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates a condition.
     * If the condition is true, throws a BadRequestException.
     */
    static BiConsumer<Boolean, MessageErrors> checkCondition() {
        return (input, messageError) -> {
            if (input) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates if an object exists (is not null or empty).
     * Throws a BadRequestException if the object exists.
     */
    static BiConsumer<Object, MessageErrors> checkIsExists() {
        return (input, messageError) -> {
            if (!ObjectUtils.isEmpty(input)) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates if an object does not exist (is null or empty).
     * Throws a BadRequestException if the object does not exist.
     */
    static BiConsumer<Object, MessageErrors> checkIsNotExists() {
        return (input, messageError) -> {
            if (ObjectUtils.isEmpty(input)) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates a double value.
     * Throws a BadRequestException if the value is empty or negative.
     */
    static BiConsumer<Double, MessageErrors> checkDouble() {
        return (input, messageError) -> {
            checkEmpty().accept(input, messageError);
            if (input < 0) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates an integer value.
     * Throws a BadRequestException if the value is empty or negative.
     */
    static BiConsumer<Integer, MessageErrors> checkInteger() {
        return (input, messageError) -> {
            checkEmpty().accept(input, messageError);
            if (input < 0) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates a list.
     * Throws a BadRequestException if the list is empty or null.
     */
    static BiConsumer<List<String>, MessageErrors> checkList() {
        return (input, messageError) -> {
            if (CollectionUtils.isEmpty(input) || input.size() == 0) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Throws a BadRequestException with the given error message.
     */
    public static Consumer<MessageErrors> badRequest() {
        return messageErrors -> {
            throw new BadRequestException(messageErrors);
        };
    }

    /**
     * Validates if an integer is negative.
     * Throws a BadRequestException if the value is empty or negative.
     */
    static BiConsumer<Integer, MessageErrors> checkNegativeNumber() {
        return (input, messageError) -> {
            checkEmpty().accept(input, messageError);
            if (input < 0) {
                badRequest().accept(messageError);
            }
        };
    }

    /**
     * Validates pagination parameters.
     * Ensures page and size values are non-negative and within the maximum allowed range.
     *
     * @param page The page number.
     * @param size The size of each page.
     */
    public void validateGetList(Integer page, Integer size) {
        checkNegativeNumber().accept(page, PAGE_INVALID);
        checkNegativeNumber().accept(size, PAGE_INVALID);
        checkCondition().accept(page >= MAX_SIZE_PAGE, PAGE_INVALID);
        checkCondition().accept(size >= MAX_SIZE_PAGE, SIZE_INVALID);
    }
}
