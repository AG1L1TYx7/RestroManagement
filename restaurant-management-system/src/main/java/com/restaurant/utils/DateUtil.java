package com.restaurant.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtil {
    
    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");
    public static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    public static final DateTimeFormatter DISPLAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy");
    public static final DateTimeFormatter DISPLAY_DATETIME_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

    public static String formatDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_FORMATTER) : "";
    }

    public static String formatTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(TIME_FORMATTER) : "";
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATETIME_FORMATTER) : "";
    }

    public static String formatDisplayDate(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DISPLAY_DATE_FORMATTER) : "";
    }

    public static String formatDisplayDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DISPLAY_DATETIME_FORMATTER) : "";
    }

    public static LocalDateTime parseDate(String dateString) {
        try {
            return LocalDateTime.parse(dateString + " 00:00:00", DATETIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    public static LocalDateTime parseDateTime(String dateTimeString) {
        try {
            return LocalDateTime.parse(dateTimeString, DATETIME_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    public static long daysBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.DAYS.between(start, end);
    }

    public static long hoursBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.HOURS.between(start, end);
    }

    public static long minutesBetween(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return 0;
        return ChronoUnit.MINUTES.between(start, end);
    }

    public static boolean isToday(LocalDateTime dateTime) {
        if (dateTime == null) return false;
        LocalDateTime now = LocalDateTime.now();
        return dateTime.toLocalDate().equals(now.toLocalDate());
    }

    public static boolean isFuture(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(LocalDateTime.now());
    }

    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }

    public static LocalDateTime startOfDay(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.truncatedTo(ChronoUnit.DAYS) : null;
    }

    public static LocalDateTime endOfDay(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.truncatedTo(ChronoUnit.DAYS).plusDays(1).minusNanos(1) : null;
    }

    public static String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";
        
        long minutes = minutesBetween(dateTime, LocalDateTime.now());
        
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minutes ago";
        
        long hours = minutes / 60;
        if (hours < 24) return hours + " hours ago";
        
        long days = hours / 24;
        if (days < 30) return days + " days ago";
        
        long months = days / 30;
        if (months < 12) return months + " months ago";
        
        long years = days / 365;
        return years + " years ago";
    }
}
