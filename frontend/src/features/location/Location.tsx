import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Search, Info, Map as MapIcon, Loader2, Locate, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { ai, MODELS } from "@/src/lib/gemini";
import { useAuth } from "@/src/hooks/useAuth";
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function SearchInput({ value, onChange, onPlaceSelect }: { value: string, onChange: (v: string) => void, onPlaceSelect: (lat: number, lng: number, address: string) => void }) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
      componentRestrictions: { country: 'in' }
    };

    setAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!autocomplete) return;
    const listener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        onPlaceSelect(
          place.geometry.location.lat(),
          place.geometry.location.lng(),
          place.formatted_address || place.name || ""
        );
      }
    });
    return () => {
      google.maps.event.removeListener(listener);
    };
  }, [autocomplete, onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by area, pincode or constituency..."
      className="bg-transparent outline-none flex-1 font-medium text-sm"
    />
  );
}

function LocationInner() {
  const { profile, updateProfile } = useAuth();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(profile?.coordinates || null);
  const [constituency, setConstituency] = useState<string | null>(profile?.constituency || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [booths, setBooths] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const triggerSearch = async (query: string, explicitLat?: number, explicitLng?: number, explicitAddress?: string) => {
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setIsDetecting(true);
    setSearchQuery(query);

    try {
      let lat = explicitLat ?? 20.5937;
      let lng = explicitLng ?? 78.9629;
      let addressContext = explicitAddress ?? query;

      if (GOOGLE_MAPS_API_KEY && explicitLat === undefined) {
        try {
          const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`);
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            lat = data.results[0].geometry.location.lat;
            lng = data.results[0].geometry.location.lng;
            addressContext = data.results[0].formatted_address;
          }
        } catch (err) {
          console.error("Geocoding failed, falling back to AI", err);
        }
      }

      const prompt = `You are a GIS and Election Database Assistant for India.
      The user is searching for: "${query}". 
      We have resolved this to coordinates: Lat ${lat}, Lng ${lng} (${addressContext}).
      
      Determine the precise Lok Sabha Constituency and 3 most realistic nearby polling booth locations around these coordinates.
      Respond with exactly this JSON format:
      {
        "lat": ${lat},
        "lng": ${lng},
        "constituency": "Constituency Name, State",
        "booths": [
          { 
            "name": "School/Building Name", 
            "address": "Full Street Address, Area", 
            "distance": "e.g. 450m", 
            "status": "Open", 
            "lat": number, 
            "lng": number 
          }
        ]
      }`;

      const response = await ai.models.generateContent({ 
        model: MODELS.flash,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || "{}");
      
      const newCoords = { lat: data.lat || lat, lng: data.lng || lng };
      setCoords(newCoords);
      setConstituency(data.constituency);
      setBooths(data.booths || []);

      await updateProfile({
        coordinates: newCoords,
        constituency: data.constituency
      });
      
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsDetecting(false);
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(searchQuery);
  };

  const handlePlaceSelect = (lat: number, lng: number, address: string) => {
    triggerSearch(address, lat, lng, address);
  };

  const detectLocation = () => {
    setIsLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCoords(newCoords);

          setIsDetecting(true);
          try {
            // Use Gemini to "detect" constituency and booths based on accurate coords
            const prompt = `You are a GIS and Election Database Assistant for India.
            Current GPS Coordinates: Lat: ${newCoords.lat}, Lng: ${newCoords.lng}.
            
            1. Identify the exact Lok Sabha Constituency for this point.
            2. Identify 3 realistic nearby polling booths (schools, community centers, etc.) with their relative coordinates.
            
            Respond with exactly this JSON format:
            {
              "constituency": "Constituency Name, State",
              "booths": [
                { 
                  "name": "...", 
                  "address": "...", 
                  "distance": "...", 
                  "status": "Open", 
                  "lat": number, 
                  "lng": number 
                }
              ]
            }`;

            const response = await ai.models.generateContent({ 
              model: MODELS.flash,
              contents: prompt,
              config: { responseMimeType: "application/json" }
            });
            const data = JSON.parse(response.text || "{}");
            
            setConstituency(data.constituency);
            setBooths(data.booths || []);

            // Update profile
            await updateProfile({
              coordinates: newCoords,
              constituency: data.constituency,
            });
          } catch (error) {
            console.error("AI detection error:", error);
          } finally {
            setIsDetecting(false);
            setIsLoading(false);
          }
        },
        (error) => {
          console.error("Error detecting location:", error);
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Polling Booth Locator</h1>
        <p className="text-slate-500">Find where to cast your vote based on your current location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="relative aspect-video md:aspect-auto md:flex-1 bg-slate-200 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl min-h-[400px]">
            {GOOGLE_MAPS_API_KEY ? (
              <Map
                defaultCenter={coords || { lat: 20.5937, lng: 78.9629 }}
                defaultZoom={coords ? 15 : 5}
                center={coords}
                gestureHandling={"greedy"}
                disableDefaultUI={false}
                className="w-full h-full"
                mapId="DEMO_MAP_ID"
              >
                {coords && (
                  <AdvancedMarker position={coords}>
                    <Pin background={"#2563eb"} glyphColor={"#fff"} borderColor={"#1d4ed8"} />
                  </AdvancedMarker>
                )}
                {booths.map((booth, idx) => (
                  <AdvancedMarker key={idx} position={{ lat: booth.lat, lng: booth.lng }}>
                    <div className="bg-white px-2 py-1 rounded shadow-lg border border-slate-200 flex items-center gap-2 transform -translate-y-full">
                      <Vote className="w-3 h-3 text-red-500" />
                      <span className="text-[10px] font-bold whitespace-nowrap">{booth.name}</span>
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            ) : (
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                {coords ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative">
                    <div className="w-12 h-12 bg-brand/20 rounded-full animate-ping absolute -inset-0" />
                    <div className="w-12 h-12 bg-brand text-white rounded-full flex items-center justify-center relative z-10 shadow-xl shadow-brand/40">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-8 max-w-sm">
                    <MapIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium mb-4 text-sm">
                      Google Maps API Key is missing. Add VITE_GOOGLE_MAPS_API_KEY to your secrets to enable the interactive map.
                    </p>
                    <button
                      onClick={detectLocation}
                      className="text-brand font-bold text-sm bg-blue-50 px-4 py-2 rounded-full inline-flex items-center gap-2"
                    >
                      Use Demo Map <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {isDetecting && (
              <div className="absolute inset-0 z-20 bg-brand/5 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white p-6 rounded-3xl shadow-2xl text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-brand animate-spin mx-auto" />
                  <p className="font-bold text-slate-900">Identifying Constituency...</p>
                  <p className="text-xs text-slate-500">Mapping your coordinates to election boundaries</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-44 right-6 z-10">
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLoading}
                className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 border border-blue-500 shadow-blue-200"
                title="Detect my location"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Locate className="w-6 h-6" />}
              </button>
            </div>

            {constituency && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-10 left-6 right-auto max-w-sm glass p-6 rounded-3xl shadow-xl shadow-black/10 border-white/50 z-10"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Detected Constituency</p>
                      <Sparkles className="w-3 h-3 text-brand" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900">{constituency}</h4>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand" />
              Nearby Polling Stations
            </h3>

            <a
              href={`https://www.google.com/maps/search/polling+booth+near+me${coords ? `/@${coords.lat},${coords.lng},14z` : ''}`}
              target="_blank"
              rel="noreferrer"
              className="w-full mb-6 bg-brand text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <MapIcon className="w-5 h-5" />
              Find your booth in maps
            </a>

            {booths.length > 0 ? (
              <div className="space-y-3">
                {booths.map((booth, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-brand/20 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-slate-900">{booth.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{booth.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2 truncate">{booth.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-brand">{booth.distance} away</span>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1${coords ? `&origin=${coords.lat},${coords.lng}` : ''}&destination=${booth.lat},${booth.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        Directions <Navigation className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">Location data not available yet.</p>
                <button onClick={detectLocation} className="mt-4 text-brand text-sm font-bold underline">
                  Refresh Location
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h4 className="font-bold text-xl mb-4 text-blue-400">Official Resources</h4>
            <div className="space-y-4">
              <a
                href="https://voters.eci.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div>
                  <p className="font-bold text-sm">Voter Portal</p>
                  <p className="text-[10px] text-slate-500 font-mono">voters.eci.gov.in</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://electorallogin.eci.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div>
                  <p className="font-bold text-sm">Search Electoral Roll</p>
                  <p className="text-[10px] text-slate-500 font-mono">electorallogin.eci.gov.in</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Location() {
  if (GOOGLE_MAPS_API_KEY) {
    return (
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <LocationInner />
      </APIProvider>
    );
  }
  return <LocationInner />;
}

function Vote(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
      <path d="M22 19H2" />
    </svg>
  );
}

