# loggers
## A webapp for modifying spring-boot log levels on the fly.

Requirement:
1. A spring-boot application with actuators enabled
2. In the application properties: `management.endpoints.web.exposure.include`
must list `loggers` among the included endpoints.

Usage:
1. Enter the URL for the loggers endpoint in the appropriate text input at the
   top of the screen (for example: `http://example.com:8080/actuator/loggers`).
2. Click "Load". A table of classes (with loggers declared) and groups will
appear. This includes groups you have defined. (See:
[Spring Boot Logging documentation](https://docs.spring.io/spring-boot/reference/features/logging.html#features.logging.log-groups))
3. To change the log level for a class or package, click on the select menu to
its left, and choose the desired logging level. That package/class, and
everything under it in hierarchy, will change to the selected level.
4. To use the same level as the parent of the package/class, choose
`~inherited~` from the select menu.
