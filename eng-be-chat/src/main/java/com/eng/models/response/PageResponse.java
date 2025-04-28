package com.eng.models.response;

import lombok.Data;

import java.util.List;

@Data
public class PageResponse<T> {

    private int page;

    private int size;

    private long total;

    private List<T> data;

    private String __typename;

}