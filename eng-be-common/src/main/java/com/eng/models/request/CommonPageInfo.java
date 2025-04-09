package com.eng.models.request;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldNameConstants;

import java.util.List;

@FieldNameConstants
@Builder
@Data
public class CommonPageInfo<T> {

    public Integer page;

    public Integer size;

    public Long total;

    public List<T> data;

    public String __typename;

}
