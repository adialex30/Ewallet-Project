package com.vois.simpleewalletsystem.config;

import com.midtrans.Config;
import com.midtrans.ConfigFactory;
import com.midtrans.service.MidtransCoreApi;
import com.midtrans.service.MidtransSnapApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MidtransConfig {

    @Value("${midtrans.server-key}")
    private String serverKey;

    @Value("${midtrans.client-key}")
    private String clientKey;

    @Value("${midtrans.is-production:false}")
    private boolean isProduction;

    private Config buildConfig() {
        return Config.builder()
                .setServerKey(serverKey)
                .setClientKey(clientKey)
                .setIsProduction(isProduction)
                .build();
    }

    @Bean
    public MidtransSnapApi midtransSnapApi() {
        return new ConfigFactory(buildConfig()).getSnapApi();
    }

    @Bean
    public MidtransCoreApi midtransCoreApi() {
        return new ConfigFactory(buildConfig()).getCoreApi();
    }
}
