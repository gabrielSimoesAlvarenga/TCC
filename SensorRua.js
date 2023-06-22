
var socket=io();

socket.on('serial:data', data => {
    document.getElementById('countRuaPrincipal').value = data.ruaP;
    document.getElementById('countRuaTransversal').value = data.ruaS;
    document.getElementById('tempoPrincipal').value = window.tempoP;
    document.getElementById('tempoTransversal').value = window.tempoS;

    farol(data.estado, data.modo);
    ruaP = data.ruaP;
    ruaS = data.ruaS;
    
})

function gravar(){
    console.log('salvou no banco');
    dados_database.new(ruaP,ruaS);
}

function read(){
    console.log('pegou do banco');
    dados_database.read();
    const call = io();
    call.emit('enviarDados',window.tempoP, window.tempoS); 
}

//gravar no banco de hora em hora
setInterval(function() {
    gravar();
    read();
  },3600000 ); // 3600000 milissegundos equivalem a uma hora


function farol(estado,modo){
    var rua1;
    var rua2;
    if(modo == 2){
            rua1 ="img/semaforo/amarelo.png";
            rua2 ="img/semaforo/amarelo.png";
    }else{
    switch(estado){
        case "1":
            console.log("caso 1 - Rua P verde / rua S vermelho");
            rua1 ="img/semaforo/verde.png";
            rua2 ="img/semaforo/vermelho.png";
            break;
        case "2":
            console.log("caso 2 - Rua P amarelo / rua S vermelho");
            rua1 ="img/semaforo/amarelo.png";
            rua2 ="img/semaforo/vermelho.png";
            break;
        case "3":
            console.log("caso 3 - Rua P vermelho / rua S vermelho");
            rua1 ="img/semaforo/vermelho.png";
            rua2 ="img/semaforo/vermelho.png";
            break;
        case "4":
            console.log("caso 3 - Rua P vermelho / rua S verde");
            rua1 ="img/semaforo/vermelho.png";
            rua2 ="img/semaforo/verde.png";
            break;
        case "5": 
            console.log("case 4 - Rua P vermelho / rua S amarelo");
            rua1 ="img/semaforo/vermelho.png";
            rua2 ="img/semaforo/amarelo.png";
            break
        case "6":
            console.log("caso 6 - Rua P vermelho / rua S vermelho");
            rua1 ="img/semaforo/vermelho.png";
            rua2 ="img/semaforo/vermelho.png";
            break;
        } 
    }      
        document.getElementById('ruap').src =rua1;
        document.getElementById('ruas').src =rua2;
        
    
}
