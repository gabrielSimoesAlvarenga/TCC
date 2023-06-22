/*
Modos:
1- Normal
2- Amarelo Piscante
3- Sensor 

Estados:
1- 1Vd - 2Vm
2- 1Am - 2Vm
3- 1Vm - 2Vm
4- 1Vm - 2Vd
5- 1Vm - 2Am
6- 1Vm - 2Vm
*/

#include <EEPROM.h>

#define ruaP 8
#define ruaS 9

#define pin1Vm 10
#define pin1Am 11
#define pin1Vd 12

#define pin2Vm 5
#define pin2Am 6
#define pin2Vd 7


int delayP = 30;    //tempo de luz verde rua principal e vermelha secundaria 15 sec
int delayS = 20;    //tempo de luz vermelho rua principal e verde secundaria 10 sec

#define delayFixoP 44;    //tempo de luz verde rua principal e vermelha secundaria 22 sec
#define delayFixoS 24; //tempo de luz vermelho rua principal e verde secundaria 12 sec

#define delayVAm 10;   //tempo de luz amarela 4 sec
#define tempoVm 4;    //tempo de vermelho simultâneo 1 segundo

int commaIndex;

int tempoP;
int tempoS;

boolean flag = 0;
boolean flag2 =0;

byte modo;
byte estado;

byte modoAnt;
byte estadoAnt;

byte startMode;
byte pisca;
int delayControl;
int cicloSemaforo;
int countRuaP;
int countRuaS; 

String comando;
char serialBuff;
String comandoValStart;
String comandoValEnd;

void imprimir(){
    Serial.print(countRuaP);
    Serial.print("/");
    Serial.print(countRuaS);
    Serial.print("/");
    Serial.print(estado);
    Serial.print("/");
    Serial.println(modo);
}
void sensorRuaP(){
  if(digitalRead(ruaP))flag = 1;

  if(!digitalRead(ruaP) && flag){
    flag = 0;
    countRuaP +=1;
      imprimir();
    }
}

void sensorRuaS(){
  if(digitalRead(ruaS))flag2 = 1;

  if(!digitalRead(ruaS) && flag2){
    flag2 = 0;
    countRuaS +=1;
      imprimir();
    }
}

void comandos(){
  if (comando != "") {  //Modos
      if ((comando.substring(0,1) == "M") || (comando.substring(0,1) == "m")) {  
        //Normal
        if (comando.substring(1,2) == "1") { modo = 1; }  
        //Amarelo Piscante
        if (comando.substring(1,2) == "2") { modo = 2; }  
        //automatico
        if (comando.substring(1,2) == "3") { modo = 3; }    
        
        cicloSemaforo = 0;
        delayControl = 50;
        estadoAnt = 99; //Força a execução
      }

      if (commaIndex != -1) { // Se a vírgula for encontrada
        // Obtém a primeira parte da string
        comandoValStart = comando.substring(0, commaIndex); 
        // Obtém a segunda parte da string
        comandoValEnd = comando.substring(commaIndex + 1); 
        // Converte a primeira parte em um número inteiro
        delayP = comandoValStart.toInt(); 
        // Converte a segunda parte em um número inteiro
        delayS = comandoValEnd.toInt(); 
        delayP = delayP*2;
        delayS = delayS*2;
        
        // zerar contagem dos veiculos da rua para a proxima hora. 
        countRuaP = 0;
        countRuaS = 0;
        
      }
      
      if (comando.substring(0,1) == "*") {  //Muda o estado do semáforo
        if(modo == 3){
          estado++;
          
          if (estado > 6) { 
            estado = 1; 
          }        
            imprimir();
            delayControl = 50; //Força a execução imediata
         }   
      }
        comando = "";
    }
}

void estados(){
          if (estado != estadoAnt) {
            switch (estado) {
               case 1: //1Vd - 2Vm
                    digitalWrite(pin1Vm, LOW);
                    digitalWrite(pin1Am, LOW);
                    digitalWrite(pin2Vd, LOW);
                    digitalWrite(pin2Am, LOW);
                  
                    digitalWrite(pin1Vd, HIGH);                 
                    digitalWrite(pin2Vm, HIGH);                   
                    break;
               case 2: //1Am - 2Vm
                    digitalWrite(pin1Vd, LOW);
                    digitalWrite(pin1Am, HIGH);                          
                    break;
               case 3: //1Vm - 2Vm
                    digitalWrite(pin1Am, LOW);
                    digitalWrite(pin1Vm, HIGH);
                    break;
               case 4: //1Vm - 2Vd antigo 3
                    digitalWrite(pin2Vm, LOW);
                    digitalWrite(pin2Vd, HIGH);                 
                    break;
               case 5: //1Vm - 2Am antigo 4
                    digitalWrite(pin2Vd, LOW);
                    digitalWrite(pin2Am, HIGH);                 
                    break;
               case 6: // 1Vm - 2Vm 
                    digitalWrite(pin2Am, LOW);
                    digitalWrite(pin2Vm, HIGH);
                    break;
                    
            }
  
            estadoAnt = estado;
        }
}
void modos (){
  if ((modo == 1) || (modo == 3)) { //Modo Automático ou Manual
    
    if(modo == 3){
        tempoP = delayP;
        tempoS = delayS;
    } else{
      tempoP = delayFixoP;
      tempoS = delayFixoS;
    }
        if (modo != modoAnt) { //Inicia o estado para quando o modo for alterado para normal (também é executado quando iniciado)
           
           cicloSemaforo = 0;
           imprimir();
        } 

        if (cicloSemaforo > 0) { //Conta os ciclos para mudar de fase
           cicloSemaforo--;
        } else { 

           if (modo == modoAnt) { //Inicia o estado para quando o modo for alterado para normal (também é executado quando iniciado)
                 estado++;
                 if (estado > 6) { estado = 1; }           
              imprimir();
           }
           //Atualiza o tempo do ciclo
           velocidade();    
        }
        //Processa o Estado
        estados();
    }
    if (modo == 2) { //Modo Piscante
       alerta();
       if(modo != modoAnt){
        imprimir();
       }
    }
}
void alerta(){
  digitalWrite(pin1Vm, LOW);
  digitalWrite(pin1Vd, LOW);
  digitalWrite(pin2Vm, LOW);
  digitalWrite(pin2Vd, LOW);
  
   if (pisca == 0) {
    digitalWrite(pin1Am, LOW);
    digitalWrite(pin2Am, LOW);
    pisca = 1;
    
    } else {
      digitalWrite(pin1Am, HIGH);
      digitalWrite(pin2Am, HIGH);
      pisca = 0;
      }
}

void velocidade(){
  if((estado == 2)||(estado == 5)){
    //tempo menor para luz amarela
      cicloSemaforo = delayVAm; 
  } if((estado == 3)|| (estado == 6)){
    cicloSemaforo = tempoVm;
  }else { if (estado == 1) {
    cicloSemaforo = tempoP;   
    } if(estado == 4){
      cicloSemaforo = tempoS;
      }  
  }     
}

void setup() {
  
  pinMode(pin1Vm, OUTPUT); //Pino Vermelho  - Semaforo 1
  pinMode(pin1Am, OUTPUT); //Pino Amarelo   - Semaforo 1
  pinMode(pin1Vd, OUTPUT); //Pino Verde     - Semaforo 1

  pinMode(pin2Vm, OUTPUT); //Pino Vermelho - Semaforo 2
  pinMode(pin2Am, OUTPUT); //Pino Amarelo  - Semaforo 2
  pinMode(pin2Vd, OUTPUT); //Pino Verde    - Semaforo 2

  //Lê modo de inicio e grava o próximo modo de inicio na EEPROM
  startMode = EEPROM.read(0);
  if (startMode == 0){
     EEPROM.write(0, 1);
  } else { 
     EEPROM.write(0, 0);
  }


  //Inicia as variaveis
  modo   = startMode + 1;
  estado = 1; 
  pisca  = 0;
  delayControl = 0;
  cicloSemaforo = 0;
  countRuaP = 0;
  countRuaS = 0;

  modoAnt = 99; //Força a primeira execução
  estadoAnt = 99; //Força a primeira execução

  comando = "";
  
  Serial.begin(9600);
}

void loop() {
  //Executa 49 ciclos sem atividade, porém recebendo comandos.
  //executadas apenas no ciclo 50.
  if (delayControl < 49) {  
      while (Serial.available() > 0) {
        serialBuff = Serial.read();
        comando = comando + serialBuff;
        commaIndex = comando.indexOf(';');
        }
      comandos();
      sensorRuaP();
      sensorRuaS();
      delayControl++; 
  } else {
    modos();
    delayControl = 0;
    modoAnt = modo;    
    }
    delay(10);
}
