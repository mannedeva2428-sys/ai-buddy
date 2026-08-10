"""
Live Weather Utility Service
Fetches real-time weather data and forecasts using the free wttr.in weather API.
"""
import re
from datetime import datetime
from typing import Dict, Any, Optional
import httpx


def extract_city(prompt: str) -> str:
    """
    Extract city name from user prompt.
    Examples:
        "weather in Tokyo" -> "Tokyo"
        "what's the weather forecast for London today" -> "London"
        "Delhi weather" -> "Delhi"
        "weather" -> "Bangalore"
    """
    cleaned = prompt.strip()
    
    # Check "weather in/for/at/of <city>"
    match = re.search(r'weather\s+(?:in|for|at|of)\s+([a-zA-Z\s,]+)', cleaned, re.IGNORECASE)
    if match:
        city = match.group(1).strip()
        # Remove trailing words like "today", "tomorrow", "forecast", "now", "?"
        city = re.sub(r'\b(today|tomorrow|forecast|now|please)\b', '', city, flags=re.IGNORECASE).strip()
        if city:
            return city
            
    # Check "<city> weather"
    match = re.search(r'([a-zA-Z\s,]+)\s+weather', cleaned, re.IGNORECASE)
    if match:
        city = match.group(1).strip()
        city = re.sub(r'\b(what|whats|what\'s|how|is|the|show|me|tell|me|get)\b', '', city, flags=re.IGNORECASE).strip()
        if city:
            return city

    return "Bangalore"


def _simplify_condition(raw_cond: str) -> str:
    """Map raw condition description to standard simple text for icons."""
    raw = raw_cond.lower()
    if "sun" in raw or "clear" in raw:
        return "Sunny"
    if "rain" in raw or "drizzle" in raw or "shower" in raw:
        return "Rainy"
    if "snow" in raw or "sleet" in raw or "ice" in raw:
        return "Snowy"
    if "thunder" in raw or "storm" in raw:
        return "Thunderstorm"
    if "cloud" in raw or "overcast" in raw:
        return "Cloudy"
    return raw_cond.title().strip()


def get_fallback_weather(city: str = "Bangalore") -> Dict[str, Any]:
    """Fallback weather data if offline or network request fails."""
    return {
        "city": city.title(),
        "country": "India",
        "temp_celsius": 26,
        "condition": "Mostly Sunny",
        "humidity_percent": 64,
        "high_temp": 28,
        "low_temp": 21,
        "forecast": [
            {"day": "Mon", "temp": 24, "condition": "Sunny"},
            {"day": "Tue", "temp": 26, "condition": "Sunny"},
            {"day": "Wed", "temp": 23, "condition": "Cloudy"},
            {"day": "Thu", "temp": 25, "condition": "Sunny"},
            {"day": "Fri", "temp": 22, "condition": "Cloudy"},
        ],
    }


async def fetch_real_weather(city: str = "Bangalore") -> Dict[str, Any]:
    """
    Fetch live weather data from wttr.in for specified city.
    """
    target_city = city.strip() if city and city.strip() else "Bangalore"
    url = f"https://wttr.in/{target_city}?format=j1"
    
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            res = await client.get(url)
            if res.status_code != 200:
                return get_fallback_weather(target_city)
            
            data = res.json()
            current = data.get("current_condition", [{}])[0]
            nearest = data.get("nearest_area", [{}])[0]
            weather_days = data.get("weather", [])

            resolved_city = target_city.title()
            if nearest.get("areaName"):
                resolved_city = nearest["areaName"][0].get("value", target_city.title())
                
            resolved_country = ""
            if nearest.get("country"):
                resolved_country = nearest["country"][0].get("value", "")

            temp_c = int(current.get("temp_C", 26))
            condition_raw = current.get("weatherDesc", [{}])[0].get("value", "Sunny").strip()
            condition = _simplify_condition(condition_raw)
            humidity = int(current.get("humidity", 64))

            high_temp = temp_c + 3
            low_temp = temp_c - 4
            if weather_days:
                high_temp = int(weather_days[0].get("maxtempC", high_temp))
                low_temp = int(weather_days[0].get("mintempC", low_temp))

            forecast_items = []
            for day_data in weather_days[:5]:
                date_str = day_data.get("date", "")
                try:
                    dt = datetime.strptime(date_str, "%Y-%m-%d")
                    day_name = dt.strftime("%a")
                except Exception:
                    day_name = "Day"

                max_t = int(day_data.get("maxtempC", temp_c))
                min_t = int(day_data.get("mintempC", temp_c))
                avg_t = (max_t + min_t) // 2

                hourly = day_data.get("hourly", [{}])
                mid_hour = hourly[len(hourly) // 2] if hourly else {}
                day_cond_raw = mid_hour.get("weatherDesc", [{}])[0].get("value", "Sunny")
                day_cond = _simplify_condition(day_cond_raw)

                forecast_items.append({
                    "day": day_name,
                    "temp": avg_t,
                    "condition": day_cond
                })

            return {
                "city": resolved_city,
                "country": resolved_country,
                "temp_celsius": temp_c,
                "condition": condition,
                "humidity_percent": humidity,
                "high_temp": high_temp,
                "low_temp": low_temp,
                "forecast": forecast_items,
            }
    except Exception as err:
        print(f"Weather API error: {err}")
        return get_fallback_weather(target_city)


def format_weather_text(weather: Dict[str, Any]) -> str:
    """Format weather dict into natural language for AI Voice Assistant."""
    city = weather.get("city", "Bangalore")
    country = f", {weather['country']}" if weather.get("country") else ""
    temp = weather.get("temp_celsius", 26)
    condition = weather.get("condition", "Sunny")
    high = weather.get("high_temp", 28)
    low = weather.get("low_temp", 21)
    humidity = weather.get("humidity_percent", 64)

    lines = [
        f"🌤️ Weather Forecast for {city}{country}:\n",
        f"• Temperature: {temp}°C ({condition})",
        f"• High / Low: {high}°C / {low}°C",
        f"• Humidity: {humidity}%"
    ]

    forecast = weather.get("forecast", [])
    if forecast:
        lines.append("\n📅 5-Day Outlook:")
        for item in forecast[:5]:
            lines.append(f"  • {item['day']}: {item['temp']}°C ({item['condition']})")

    return "\n".join(lines)
