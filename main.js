import { detecIcon, detecType, setStorage } from "./helpers.js";

const form = document.querySelector("form");
const list = document.querySelector("ul");

form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

let map;
let coords = [];
let notes = JSON.parse(localStorage.getItem("notes")) || [];
let layerGroup = [];
// Konum bilgisini alır.
navigator.geolocation.getCurrentPosition(
  loadMap,
  console.log("Kullanıcı kabul edilmedi.")
);
// Haritaya tıklandığında çalışır.
function onMapClick(e) {
  // Form alanının görünürlüğünü aktifleştirir.
  form.style.display = "flex";
  coords = [e.latlng.lat, e.latlng.lng];
}
// Konum bilgisine göre sayfada haritayı gösterme
function loadMap(e) {
  map = new L.map("map").setView([e.coords.latitude, e.coords.longitude], 10);
  L.control;
  // Haritanın görünümü
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  // Haritadaki imleçlerin tutulduğu katman
  layerGroup = L.layerGroup().addTo(map);
  // Localden gelen notes dizisini listeme
  renderNoteList(notes);
  // Haritada tıklanma olayı
  map.on("click", onMapClick);
}
// Ekrana marker basma
function renderMarker(item){
  // imleçlerin olduğu katmana popup ekleyip, marker oluşturur
  L.marker(item.coords, {icon: detecIcon(item.status)})
  .addTo(layerGroup)
  .bindPopup(`${item.desc}`);
}
// Form gönderme işlemi
function handleSubmit(e) {
  e.preventDefault();
  const desc = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;
  // notes dizisine Ekleme işlemi
  notes.push({ id: new Date().getTime(), desc, date, status, coords });
  // Localstorage güncelleme
  setStorage(notes);
  // notes dizisini listeler.
  renderNoteList(notes);
  form.style.display = "none";
  // Ekleme işleminden sonra formu temizler
  e.target[0].value = "";
  e.target[1].value = "";
  e.target[2].value = "";
}

function renderNoteList(item) {
  list.innerHTML = "";
  // Markers siler.
  layerGroup.clearLayers();
  item.forEach((item) => {
    const listElement = document.createElement("li");
    listElement.dataset.id = item.id;
    listElement.innerHTML = `
    <div>
        <p>${item.desc}</p>
        <p><span>Tarih: </span>${item.date}</p>
        <p><span>Durum: </span>${detecType(item.status)}</p>
    </div>
    <i class="bi bi-x" id="delete"></i>
    <i class="bi bi-airplane-fill" id="fly"></i>
        `;
    // Listeyi tersten sıralar.
    list.insertAdjacentElement("afterbegin", listElement);
    // Haritada marker basma
    renderMarker(item);
  });
}

function handleClick(e){
  console.log(e.target.id);
  // Güncellenecek elemanın id'sini bulma
  const id = e.target.parentElement.dataset.id;
  console.log(notes)
  if(e.target.id === "delete"){
    console.log("tıklandı");
    // Filtre ile tıklanan elemanı diziden kaldırır.
    notes = notes.filter((note) => note.id != id)
    console.log(notes)
    // Localstorage güncelleme
    setStorage(notes);
    // Lİsteyi güncellemek için
    renderNoteList(notes);
  }
  if(e.target.id === "fly"){
    const note =  notes.find((note) => note.id == id);
    map.flyTo(note.coords);
  }
  
}