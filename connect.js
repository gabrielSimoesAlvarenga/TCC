var socket = io();

//conecta com o banco de dados
(function () {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyDH0GsmPwX87Kwxir6Np72E109LTRaUuWs",
    authDomain: "semaforointeligentetcc.firebaseapp.com",
    databaseURL: "https://semaforointeligentetcc.firebaseio.com",
    projectId: "semaforointeligentetcc",
    storageBucket: "semaforointeligentetcc.appspot.com",
    messagingSenderId: "240286157695",
    appId: "1:240286157695:web:0148848b6af0db48a5a84a",
    measurementId: "G-5XLVDVMLHQ",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
})();

const dados_database = {};

(function () {
  let id = false;

  // veiculos por hora que são contatos no sensor
  function tempoVerde(veiculosP, veiculosS) {
    // 525 * o comprimento da rua
    const fluxoSaturacao = 525 * 8;
    //calcular taxa de ocupação. fluxo de veiculos por hora divido pelo fluxo de saturação
    const yiP = veiculosP / fluxoSaturacao;
    const yiS = veiculosS / fluxoSaturacao;
    //soma das maiores taxas de ocupação
    const Y = yiP + yiS;
    //Calculo tempo de ciclo
    const tp = 1.8 + 1.8 + 2 * 1;
    //calculo de tempo de ciclo
    const tco = (1.5 * tp + 5) / (1 - Y);
    //calculo de tempo de verde efetivo de cada semaforo
    var tvefP = yiP * ((tco - tp) / Y);
    var tvefS = yiS * ((tco - tp) / Y);
    //verde minimo caso valor seja inferior a 10.
    if (tvefP < 10) {
      tvefP = 10;
    }
    if (tvefS < 10) {
      tvefS = 10;
    }

    console.log("Tempo Verde", tvefP, tvefS);
    return { tempoVerdeP: Math.round(tvefP), tempoVerdeS: Math.round(tvefS) };
  }

  function create(ruaP, ruaS) {
    const date = new Date();
    const day = date.getDate();
    const hour = date.getHours();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const currentDate = `${day}-${month}-${year}`;
    console.log("set: ", currentDate);

    const semaforo = {
      ruaP: ruaP,
      ruaS: ruaS,
      tempoVerdeP: 0,
      tempoVerdeS: 0,
    };

    if (!id) {
      id = firebase.database().ref().child("dados-semaforo").push().key;
      console.log(id);
    }

    let updates = {};
    const semaforoUpdate = { ...semaforo, ...tempoVerde(ruaP, ruaS) };
    updates[`/dados-semaforo/${currentDate}/${hour}:00`] = semaforoUpdate;

    let semaforo_ref = firebase.database().ref();

    semaforo_ref
      .update(updates)
      .then(function () {
        return { success: true, message: "banco criado" };
      })
      .catch(function () {
        return { success: false, message: "falhou:" };
      });
  }

  function formatarData(data) {
    const dia = String(data.getDate()); //.padStart(2, "0");
    const mes = String(data.getMonth() + 1); //.padStart(2, "0");
    const ano = data.getFullYear();
    return `${dia}-${mes}-${ano}`;
  }

  function formatarHora(data) {
    const hora = String(data.getHours());
    return `${hora}:00`;
  }

  //função que faz a leitura no banco e retorna os dados
  function read() {
    const hoje = new Date();
    const semanaPassada = new Date();
    semanaPassada.setDate(hoje.getDate() - 7); // -7 para pegar os dados da semana passada.

    var semaforo_ref = firebase
      .database()
      .ref("/dados-semaforo/" + formatarData(semanaPassada));
    semaforo_ref
      .orderByKey()
      .equalTo(formatarHora(hoje))
      .once("value")
      .then(function (snapshot) {
        var data = snapshot.val();

        window.tempoP = data[formatarHora(hoje)].tempoVerdeP;
        window.tempoS = data[formatarHora(hoje)].tempoVerdeS;

        console.log(data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  function update() {}

  function del() {
    if (!id) return { success: false, message: "invalido" };

    let semaforo_ref = firebase
      .database()
      .ref(`/dados-semaforo/${currentDate}/${hour}:00`);
    semaforo_ref
      .remove()
      .then(function () {
        return { success: true, message: "banco removido" };
      })
      .catch(function () {
        return { success: false, message: "falhou:" };
      });
  }

  dados_database.new = create;
  dados_database.update = update;
  dados_database.read = read;
  dados_database.remove = del;
})();
