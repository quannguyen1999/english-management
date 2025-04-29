package com.eng.constant;

public class NameConstant {
    public static String getFullPath(String path) {
        return path + "/**";
    }

    public static final String REWRITE_REPLACEMENT = "/${segment}";

    public static String getSegment(String path) {
        return path + "/(?<segment>.*)";
    }
}
