var socket=io();
let counter = 2;
socket.on('serial:data', function(dataSerial){
    console.log(dataSerial);
    myChart.data.labels.push(counter);
    myChart.data.datasets.forEach(dataset =>{
        dataset.data.push(dataSerial.value);
    });
    counter = counter + 2;
    myChart.update();
});



var ctx = document.getElementById('grafico').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Serial'],
        datasets: [{
            label: 'Serial',
            data: [],
            backgroundColor: [
                'rgba(54, 162, 235, 0.2)',
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
}); 