package com.eng.validators;

import com.eng.models.request.UserRequest;
import com.eng.repositories.UserRepository;
import com.eng.utils.SecurityUtil;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.util.ObjectUtils;
import org.springframework.util.StringUtils;

import static com.eng.constants.MessageErrors.*;

@AllArgsConstructor
@Component
public class UserValidator extends  CommonValidator{

    private static final Integer NAME_SIZE = 5;

    private final UserRepository userRepository;

    public void validateCreate(UserRequest userRequest) {
        checkEmpty().accept(userRequest, USER_INVALID);
        validateCheckUserName(userRequest.getUsername());
        if (ObjectUtils.isEmpty(SecurityUtil.getDetails())) {
            validateCheckPassword(userRequest.getPassword());
        }
        validateCheckEmail(userRequest.getEmail());
    }

    public void validateUpdate(UserRequest userRequest) {
        checkEmpty().accept(userRequest, USER_INVALID);
        if (StringUtils.hasLength(userRequest.getUsername())) {
            checkCondition().accept(userRequest.getUsername().length() < NAME_SIZE, USER_NAME_INVALID);
            checkCondition().accept(ObjectUtils.isEmpty(userRepository.findByUsername(userRequest.getUsername())), USER_NOT_EXISTS);
        }
        if (StringUtils.hasLength(userRequest.getEmail())) {
            checkCondition().accept(!ObjectUtils.isEmpty(userRepository.findByEmail(userRequest.getEmail())), USER_EMAIL_EXISTS);
        }
    }

    private void validateCheckUserName(String name) {
        checkEmpty().accept(name, USER_NAME_INVALID);
        checkCondition().accept(name.length() < NAME_SIZE, USER_NAME_INVALID);
        checkCondition().accept(!ObjectUtils.isEmpty(userRepository.findByUsername(name)), USER_NAME_EXISTS);
    }

    private void validateCheckEmail(String email) {
        checkEmpty().accept(email, USER_EMAIL_INVALID);
        checkCondition().accept(!ObjectUtils.isEmpty(userRepository.findByEmail(email)), USER_EMAIL_EXISTS);
    }

    private void validateCheckPassword(String password) {
        checkEmpty().accept(password, USER_PASSWORD_INVALID);
        checkCondition().accept(!password.matches(PASSWORD_REGEX), USER_PASSWORD_INVALID);
    }


}
