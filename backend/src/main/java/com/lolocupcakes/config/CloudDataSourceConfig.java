package com.lolocupcakes.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class CloudDataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(CloudDataSourceConfig.class);

    @Bean
    @Primary
    public DataSource dataSource(DataSourceProperties properties) {
        String dbUrl = System.getenv("DATABASE_URL");
        if (StringUtils.hasText(dbUrl) && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                log.info("Detected Cloud DATABASE_URL, adapting for JDBC...");
                URI uri = new URI(dbUrl);
                String userInfo = uri.getUserInfo();
                String username = properties.getUsername();
                String password = properties.getPassword();

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String query = uri.getQuery();

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(host)
                        .append(":")
                        .append(port)
                        .append(path);

                if (StringUtils.hasText(query)) {
                    jdbcUrl.append("?").append(query);
                } else if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equalsIgnoreCase(host)) {
                    jdbcUrl.append("?sslmode=require");
                }

                log.info("Connecting to cloud JDBC: jdbc:postgresql://{}:{}{}", host, port, path);

                HikariDataSource dataSource = new HikariDataSource();
                dataSource.setDriverClassName("org.postgresql.Driver");
                dataSource.setJdbcUrl(jdbcUrl.toString());
                dataSource.setUsername(username);
                dataSource.setPassword(password);
                dataSource.setMaximumPoolSize(10);
                dataSource.setMinimumIdle(2);
                return dataSource;
            } catch (Exception e) {
                log.error("Failed to parse DATABASE_URL, falling back to standard properties: {}", e.getMessage());
            }
        }

        return properties.initializeDataSourceBuilder().type(HikariDataSource.class).build();
    }
}
