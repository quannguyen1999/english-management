package com.eng.models.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * Description: Common fields for all entities
 */
@NoArgsConstructor
@AllArgsConstructor
@Data
public class CommonBaseResponse {

    private Date createAt;

    private Date updatedAt;

}
