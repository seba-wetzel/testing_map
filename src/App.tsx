import { Feature } from "geojson";
import type { PuntoForma, PuntoOnClick } from "./Map";
import { Mapa } from "./Map";
import geoComisarias from "./geo/comisarias-la-plata.geojson?raw";
import geoSeccionales from "./geo/jusrisdicciones-la_plata.geojson?raw";
const seccionales = JSON.parse(geoSeccionales);
const comisarias = JSON.parse(geoComisarias);

const App = () => {
  const handleClick = (feature: Feature) => {
    console.log(feature);
  };
  const comisaria = {
    coordinates: [-58.0365926, -34.90889071],

    properties: {
      icon: "./pin.png",
      shape: "square" as PuntoForma,
      title: "Comisaria",
      description: "Comisaria 1ra",
      color: "blue",
      Dependencia: "Comisaría",
      Organismo: "Ministerio de Seguridad",
      Nombre: "SUBCRIA.GORINA",
      Dirección: "140 BIS ENTRE 492 Y 501",
      Partido: "La Plata",
      Teléfono: "2214848037",
      Representa: "",
    },
  };

  const puntoHandlerClick: PuntoOnClick = (data, id) => {
    console.info(data, id);
  };
  return (
    <>
      <h1>My App</h1>
      <Mapa
        onClick={handleClick}
        maxBounds={[
          [-58.29, -35.24],
          [-57.75, -34.83],
        ]}
        style={{ width: "1600px", height: "90vh", borderRadius: "10px" }}
      >
        <Mapa.Capa data={seccionales} id="my-data" />
        <Mapa.Puntos
          data={comisarias}
          id="my-data-1"
          icon={<img src="./estacion_policia.png" alt="pin" height={24} />}
          onClick={puntoHandlerClick}
        />
        <Mapa.RawPunto
          data={comisaria}
          id="comisaria"
          onClick={puntoHandlerClick}
        />
      </Mapa>
    </>
  );
};

export default App;
