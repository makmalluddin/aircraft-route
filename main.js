        async function fetchData() {
            try {
                const response = await fetch('http://localhost:3000/data');
                const data = await response.json();
                console.log('Data fetched:', data); 
                return data;
            } catch (error) {
                console.error('Error fetching data:', error);
                return [];
            }
        }

        async function displayData() {
            const data = await fetchData();

            if (!data || data.length === 0) {
                console.error('No data available.');
                return;
            }

            const map = L.map('map').setView([data[0].latitude, data[0].longitude], 10);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const markers = {};
            const colors = new Map();
            const colorPalette = chroma.scale(['red', 'green', 'blue']).mode('lch').colors(50);
            let colorIndex = 0;

            const legend = document.getElementById('legend');
            const updateLegend = () => {
                legend.innerHTML = '<strong>Legend</strong><br>';
                colors.forEach((color, callsign) => {
                    legend.innerHTML += `<span style="background-color:${color};width:10px;height:10px;display:inline-block;margin-right:5px;"></span>${callsign}<br>`;
                });
            };

            let index = 0;
            const intervalId = setInterval(() => {
                if (index < data.length) {
                    const item = data[index];
                    const { Callsign, latitude, longitude, Heading } = item;

                    if (!colors.has(Callsign)) {
                        colors.set(Callsign, colorPalette[colorIndex % colorPalette.length]);
                        colorIndex++;
                        updateLegend();
                    }

                    const color = colors.get(Callsign);

                    if (markers[Callsign]) {
                        map.removeLayer(markers[Callsign]);
                    }

                    const planeIcon = L.icon({
                        iconUrl: 'pesawat.png',
                        iconSize: [60, 60],
                        iconAnchor: [25, 25],
                        popupAnchor: [0, -25]
                    });
                    
                    const planeMarker = new L.marker([latitude, longitude], { 
                        icon: planeIcon,
                        rotationAngle: Heading,
                        rotationOrigin: 'center'
                    }).addTo(map);

                    planeMarker.on('click', function() {
                        displayInfoBox(Callsign, longitude, latitude, Heading);
                    });

                    markers[Callsign] = planeMarker;

                    index++;
                } else {
                    clearInterval(intervalId);
                }
            }, 0.1); // Adjust the interval time as needed
        }

        function displayInfoBox(Callsign, longitude, latitude, Heading) {
            const infoBox = document.getElementById('info-box');
            const infoContent = document.getElementById('info-content');

            infoContent.innerHTML = `
                <p>Callsign: ${Callsign}</p>
                <p>Longitude: ${longitude}</p>
                <p>Latitude: ${latitude}</p>
                <p>Heading: ${Heading}</p>
            `;

            infoBox.classList.remove('hidden');
        }

        document.getElementById('close-info-box').addEventListener('click', () => {
            const infoBox = document.getElementById('info-box');
            infoBox.classList.add('hidden');
        });

        displayData();