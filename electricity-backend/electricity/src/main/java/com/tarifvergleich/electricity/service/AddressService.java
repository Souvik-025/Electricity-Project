package com.tarifvergleich.electricity.service;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;
import java.util.function.Predicate;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.tarifvergleich.electricity.dto.GeoapifyFeatureResponse;
import com.tarifvergleich.electricity.dto.GeoapifyResponse;
import com.tarifvergleich.electricity.exception.InternalServerException;

@Service
public class AddressService {

	private final RestClient geoApi;
	private final String apiKey;

	public AddressService(@Qualifier("geoapifyClient") RestClient geoApi,
			@Value("${api.geoapify.apikey}") String apiKey) {
		this.geoApi = geoApi;
		this.apiKey = apiKey;
	}

	public Map<String, Object> getCitiesByZip(String zip) {

		if (zip == null || zip.isEmpty())
			throw new InternalServerException("Zip code not found", HttpStatus.BAD_REQUEST);

		GeoapifyResponse resp = geoApi.get().uri(uriBuilder -> {
			uriBuilder.path("/v1/geocode/search");

			uriBuilder.queryParam("postcode", zip);
			uriBuilder.queryParam("country", "germany");
			uriBuilder.queryParam("format", "json");
			uriBuilder.queryParam("apiKey", apiKey);

			return uriBuilder.build();
		}).retrieve().onStatus(HttpStatusCode::isError, (request, response) -> {
			throw new InternalServerException("Location api response error", HttpStatus.BAD_REQUEST);
		}).body(GeoapifyResponse.class);

		return Map.of("res", true, "data", resp.results().stream().filter(distinctByKey(res -> res.city()))
				.map(res -> Map.of("city", res.city(), "city_id", res.placeId())).distinct().toList());
	}
	
	public Map<String, Object> getStreetsByCity(String placeId) {

	    if (placeId == null || placeId.isEmpty()) {
	        throw new InternalServerException("Place ID is required", HttpStatus.BAD_REQUEST);
	    }

	    GeoapifyFeatureResponse resp = geoApi.get().uri(uriBuilder -> {
	        uriBuilder.path("/v2/places");
	        
	        uriBuilder.queryParam("categories", "building,commercial");
	        uriBuilder.queryParam("filter", "place:" + placeId);
	        uriBuilder.queryParam("apiKey", apiKey);
	        uriBuilder.queryParam("limit", "500"); // Use 50 as a safe standard limit
	        
	        URI url = uriBuilder.build();
	        System.out.println("Requesting Geoapify URL: " + url);
	        return url;
	    }).retrieve().onStatus(HttpStatusCode::isError, (request, response) -> {
	        throw new InternalServerException("Location api response error", HttpStatus.BAD_REQUEST);
	    }).body(GeoapifyFeatureResponse.class);
	    
	    if (resp == null || resp.features() == null) {
	        return Map.of("res", true, "data", List.of());
	    }

	    AtomicInteger index = new AtomicInteger(1);

	    List<Map<String, Object>> streetData = resp.features().stream()
	        .map(feature -> {
	            String street = (feature.properties() != null && feature.properties().street() != null) 
	                          ? feature.properties().street() 
	                          : "Unknown Street";
	            
	            return Map.<String, Object>of(
	                "street", street, 
	                "street_id", index.getAndIncrement()
	            );
	        })
	        .filter(m -> !"Unknown Street".equals(m.get("street")))
	        .filter(distinctByKey(m -> m.get("street")))
	        .sorted((a,b) -> a.get("street").toString().compareTo(b.get("street").toString()))
	        .toList();

	    return Map.of("res", true, "data", streetData);
	}
	
	
	public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
	    Set<Object> seen = ConcurrentHashMap.newKeySet();
	    return t -> seen.add(keyExtractor.apply(t));
	}
}
