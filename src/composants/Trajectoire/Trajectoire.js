//Composant qui affiche la trajectoire des gens en fonction

import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import "./trajectoire.css";


//Permet de dessiner le graphique
const Trajectoire = ({data})=>{
    const canvas = useRef(null);
    const [maxTime, setMaxTime] = useState(0);
    const [time,setTime] = useState(0);
    const [draw,setDraw] = useState({'graduation': false, 'traces':[]});
    
    //Définie la durée de trajectoire la plus longue et determine la durée finale
    const getMaxTime = ()=>{
        let listTimes = [];
        data.forEach((person,index)=>{
            let points = person.points;
            points.forEach((trajectoire)=>{
                listTimes.push(trajectoire.time)
            })
        })

        let reducer = (previous,current)=>{
            if(previous > current){
                return previous;
            }
            else{
                return current;
            }
        }

        setMaxTime(listTimes.reduce(reducer));
    }

    //Permet de différentier les différentes courbes
    let couleurs = ['#ff0000', '#40ce33','#3464d3','#9a34d1','#d3348e','#2d8ab5'];
    const drawtrajectoires = (canvas,currentTime)=>{
            let canvasWidth = canvas.clientWidth;
            let canvasHeight = canvas.clientHeight;

            let listX = [];
            let listY = [];
            //On détermine la valeur max de X et Y 
            data.forEach((person,index)=>{
                let points = person.points;
                points.forEach((trajectoire)=>{

                    listX.push(trajectoire.x)
                    listY.push(trajectoire.y)
                })
            })

            let reducer = (previous,current)=>{
                if(previous > current){
                    return previous;
                }
                else{
                    return current;
                }
            }

            let maxX = listX.reduce(reducer);
            let maxY = listY.reduce(reducer);
            let ctx = canvas.getContext('2d')
            let ratioX = canvasWidth/maxX;
            let ratioY = canvasHeight/maxY;
            ctx.lineWidth = 1;

            //Dessin des courbes et repères

            //Axe des X

            ctx.strokeStyle ='#afb3b5';
            ctx.beginPath();
            ctx.moveTo(10,10);
            ctx.lineTo(canvasWidth - 30,10);
            ctx.stroke();
            
            ctx.closePath();

            //Axe des Y 
            ctx.strokeStyle ='#afb3b5';
            ctx.beginPath();
            ctx.moveTo(10,10);
            ctx.lineTo(10, canvasHeight- 30);
            ctx.stroke();
            ctx.closePath();

            //Fleche des X 

            ctx.fillStyle ='#afb3b5';
            ctx.beginPath();
            ctx.moveTo(canvasWidth, 10);
            ctx.lineTo(canvasWidth-30, 0);
            ctx.lineTo(canvasWidth-30,20);
            ctx.lineTo(canvasWidth,10);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            //Fleche des Y 

            ctx.beginPath();
            ctx.moveTo(0,canvasHeight -30);
            ctx.lineTo(20,canvasHeight -30);
            ctx.lineTo(10,canvasHeight);
            ctx.moveTo(0,canvasHeight -30);
            ctx.stroke();
            ctx.fill();
            ctx.closePath();

            //nom axe x
            ctx.font = '16px Sans-Serif';
            ctx.fillText('x',canvasWidth-20,30);

            //nom axe y
            ctx.font = '16px Sans-Serif';
            ctx.fillText('y',40,630);
            
            //Graduation
            //x
            for(let i=0; i<maxX; i++){
                ctx.font = '12px Sans-Serif';
                ctx.fillText(i,10+i*ratioX,30);
            }

            //y
            for(let j=0; j<maxY; j++){
                ctx.font = '12px Sans-Serif';
                ctx.fillText(j,20,j*ratioY);
            }                  

            let nouveau = draw;
            nouveau.graduation = true;
            setDraw(nouveau);

        //Dessin des trajectoires
        
        data.forEach((person,index)=>{
            let nouveau = draw;
            let traces = nouveau.traces;
                ctx.beginPath();
                ctx.lineCap = "round";
                ctx.strokeStyle = couleurs[index];
                let trajectoire = person.points;
                trajectoire = trajectoire.sort((a, b)=> a.time - b.time);
                trajectoire.forEach((trajectoire,index)=>{
                    if(trajectoire.time<currentTime){  //Affiche ou non la trajectoire selon le temps en cours                         
                        let x = trajectoire.x;
                        let y = trajectoire.y;                                
                        if(index == 0){
                            ctx.moveTo(x*ratioX,y*ratioY)
                        }
                        ctx.lineTo(x*ratioX,y*ratioY);
                        ctx.arc(x*ratioX,y*ratioY, 5,0, Math.PI*2)
                        ctx.moveTo(x*ratioX,y*ratioY);
                        ctx.fillStyle = "#000000";
                        ctx.font = `10px Sans-serif`;
                        ctx.fillText(trajectoire.time,x*ratioX+10,y*ratioY+20);
                    }                      
                })
                ctx.stroke();    
                ctx.closePath();
                traces.push(person.id);    
                setDraw(nouveau);                                    
                })
    }

    //Permet de jouer l'animation
    let currentTime = 0;
    let timer = ()=>{ 
        let pas = maxTime/100;
        let timeout = setTimeout(()=>{
        drawtrajectoires(canvas.current,currentTime);         

        currentTime+= pas;
        setTime(currentTime)
        if(currentTime<=maxTime){            
            timer();
        }else{
            clearTimeout(timeout);
        }
        },100);
    }

    //Calcul de la vitesse moyenne 
    let vitesseMoyenne = (index) =>{
        let points = data[index].points;
        let xprec = 0;
        let yprec = 0;
        let vitesse = [];
        points.forEach((point,index)=>{   
            xprec = index == 0 ? 0 : points[index-1].x;
            yprec = index == 0 ? 0 : points[index-1].y; 
            let distance = Math.sqrt( Math.pow(point.x - xprec,2) + Math.pow(point.y - yprec,2))
            let deltavitesse = distance/point.time;
            vitesse.push(deltavitesse);
        })

        vitesse = parseFloat((vitesse.reduce((prev,current)=> prev+current))/(points.length)).toFixed(3);
        return vitesse;

    }
    let progression = time/maxTime*100 < 100 ? time/maxTime*100 : 100;   
    let tableau = data.map((personne,index)=>{
        return(<tr key={personne.id}>
            <td style={{'color':`${couleurs[index]}`}}>{personne.id}</td>
            <td>{vitesseMoyenne(index)}</td>
        </tr>);
    });
    
    //Au rendering de l'application
    useEffect(()=>{
        if(maxTime == 0){
            getMaxTime();            
        }else{
            timer();
        }
    },[maxTime]);
    return(<React.Fragment>
            <div className="canvasContainer">
                <canvas ref={canvas} width="800" height="640" id="planTrajectoires"></canvas>
            </div>
            <p>Temps</p>
            <div className="resultWrapper">
            <p className="progression" style={{color:'#ffffff',width:`${progression}%`,height:'30px'}}>
            {time}ms
            </p>
            <table className="resultat">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vitesse moyenne</th>
                    </tr>
                </thead>
                <tbody>
                    {tableau}
                </tbody>
            </table>
            </div>
            </React.Fragment>)
}

export default Trajectoire;

