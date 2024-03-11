import "maplibre-gl/dist/maplibre-gl.css";
import type { FillLayer, GeoJSONSourceRaw } from "react-map-gl/maplibre";

import { Feature, FeatureCollection, Point } from "geojson";
import maplibregl from "maplibre-gl";
import {
  Children,
  FC,
  ReactNode,
  isValidElement,
  useEffect,
  useState,
} from "react";
import MapGL, {
  Layer,
  Marker,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre";

const layerStyle: FillLayer = {
  id: "my-data",
  type: "fill",
  source: "my-data",
  paint: {
    //geojson shape
    // {"type":"Feature","properties":{"seccional":14,"stroke":"#555555","stroke-width":2,"stroke-opacity":1,"fill":"#7ddeb9","fill-opacity":0.5}
    "fill-color": ["coalesce", ["get", "fill"], "#000000"], // obtiene el valor de la propiedad 'fill' del GeoJSON, o usa '#000000' por defecto
    "fill-opacity": ["coalesce", ["get", "fill-opacity"], 1], // obtiene el valor de la propiedad 'fill-opacity' del GeoJSON, o usa '1' por defecto
    "fill-outline-color": ["coalesce", ["get", "stroke"], "#FFFFFF"], // obtiene el valor de la propiedad 'stroke' del GeoJSON, o usa '#FFFFFF' por defecto
  },
};

interface CapaProps {
  data: GeoJSONSourceRaw;
  id: string;
}

export type PuntoForma = "square" | "circle";
export type PuntoOnClick = (
  data: PuntoProps["data"],
  id: PuntoProps["id"]
) => void;

type PuntoProperties = {
  properties?: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    size?: number;
    shape?: PuntoForma;
  };
};
type PuntoData = Feature<Point> & PuntoProperties;
interface PuntoProps {
  data: PuntoData;
  onClick?: PuntoOnClick;
  id: string;
}
interface PuntoRawProps {
  data: {
    properties?: {
      title: string;
      description?: string;
      icon?: string;
      color?: string;
      size?: number;
      shape?: PuntoForma;
    };
    coordinates: number[];
  };
  id: string;
  onClick?: PuntoOnClick;
}
interface PuntosProps {
  data: FeatureCollection<Point>;
  onClick?: PuntoOnClick;
  icon?: string | JSX.Element;
  id: string;
}

interface MapaProps {
  children: ReactNode;
  maxBounds?: maplibregl.LngLatBoundsLike;
  style?: React.CSSProperties;
  onClick?: (feature: Feature) => void;
}

type CapaType = FC<CapaProps>;
type PuntoType = FC<PuntoProps>;
type PuntoRawType = FC<PuntoRawProps>;
type PuntosType = FC<PuntosProps>;
interface MapaType extends FC<MapaProps> {
  Capa: CapaType;
  Punto: PuntoType;
  RawPunto: PuntoRawType;
  Puntos: PuntosType;
}

const Capa: CapaType = ({ data, id }) => {
  return (
    <Source id={id} type="geojson" data={data}>
      <Layer {...layerStyle} id={id} />
    </Source>
  );
};

const Mark = ({
  size,
  color = "green",
  shape = "square",
}: {
  size: number;
  color: string | undefined;
  shape: "square" | "circle";
}) => {
  const [hover, setHover] = useState(false);
  const sizeState = hover ? size * 2 : size;

  const mark =
    shape === "square" ? (
      <rect width={size} height={size} fill={color} />
    ) : (
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#grad1)" />
    );
  return (
    <svg
      width={sizeState}
      height={sizeState}
      viewBox="0 0 24 24"
      fill="none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <defs>
        <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#fafafa", stopOpacity: 0.1 }}
          />
        </radialGradient>
      </defs>
      {mark}
    </svg>
  );
};

const Punto: PuntoType = ({ data, id, onClick }) => {
  const { properties, geometry } = data;

  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick(data, id);
    }
  };
  const iconIsString = typeof properties?.icon === "string";
  const iconIsJsx = isValidElement(properties?.icon);
  const thereIsIcon = iconIsString || iconIsJsx;
  const icon = iconIsString ? (
    <img src={properties?.icon} alt={properties?.title} />
  ) : iconIsJsx ? (
    properties?.icon
  ) : null;

  return (
    <Marker
      key={id}
      longitude={geometry.coordinates[0]}
      latitude={geometry.coordinates[1]}
      anchor="center"
      onClick={handleClick}
    >
      {thereIsIcon ? (
        icon
      ) : (
        <Mark
          size={properties?.size || 24}
          color={properties?.color}
          shape={properties?.shape || "circle"}
        />
      )}
    </Marker>
  );
};

const RawPunto: PuntoRawType = ({ data, id, onClick }) => {
  const { properties, coordinates } = data;
  const formatedData = {
    type: "Feature",
    properties: {
      ...properties,
    },
    geometry: {
      type: "Point",
      coordinates,
    },
  };

  return <Punto data={formatedData as PuntoData} id={id} onClick={onClick} />;
};

const Puntos: PuntosType = ({ data, onClick, icon }) => {
  const { features } = data;
  return (
    <>
      {features.map((punto, index) => (
        <Punto
          key={index}
          data={
            {
              ...punto,
              properties: { ...punto.properties, icon },
            } as PuntoProps["data"]
          }
          id={`${index}`}
          onClick={onClick}
        />
      ))}
    </>
  );
};

export const Mapa: MapaType = ({ children, maxBounds, style, onClick }) => {
  const [interactiveLayerIds, setInteractiveLayerIds] = useState<string[]>([]);
  const initialViewState = {
    longitude: -57.9531703,
    latitude: -34.9205082,
    zoom: 10,
  };
  const handleClick = (event: maplibregl.MapLayerMouseEvent) => {
    const { features } = event;
    if (features && features.length > 0) {
      if (onClick) {
        onClick(features[0]);
      }
    }
  };

  useEffect(() => {
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        const { id } = child.props;
        if (id) {
          setInteractiveLayerIds((prev) => [...prev, id]);
        }
      }
    });
  }, [children]);

  return (
    <MapGL
      initialViewState={initialViewState}
      mapLib={maplibregl}
      onClick={handleClick}
      attributionControl={false}
      maxBounds={
        maxBounds || [
          //Toda la argentina, menos la antartida
          [-75.5, -59],
          [-53, -20],
        ]
      }
      interactiveLayerIds={interactiveLayerIds}
      style={{ width: "100vh", height: "100vh", ...style }}
      mapStyle={
        "https://api.maptiler.com/maps/streets-v2-dark/style.json?key=mbYudMpq0GPmefmvociH"
      }
    >
      {children}
      <NavigationControl position="top-right" />
    </MapGL>
  );
};

Mapa.Capa = Capa;
Mapa.Punto = Punto;
Mapa.RawPunto = RawPunto;
Mapa.Puntos = Puntos;
