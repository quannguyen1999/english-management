package com.eng.models.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldNameConstants;

import java.util.List;

@FieldNameConstants
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommonPageInfo<T> {

    public Integer page;

    public Integer size;

    public Long total;

    public List<T> data;

    public String __typename;

}
