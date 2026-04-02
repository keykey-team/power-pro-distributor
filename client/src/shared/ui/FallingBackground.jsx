'use client'; 

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function FallingBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="falling-images"
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,   
        },
        background: {
          color: "transparent", 
        },
        particles: {
          number: {
            value: 20, 
          },
          shape: {
            type: "image",
            options: {
              image: [
                { src: "/img/bg/chok1.png", width: 56, height: 56 },
                { src: "/img/bg/chok2.png", width: 56, height: 56 },
                { src: "/img/bg/nuts1.png", width: 56, height: 56 },
                { src: "/img/bg/nuts2.png", width: 56, height: 56 },
                { src: "/img/bg/cocon.png", width: 56, height: 56 },
                { src: "/img/bg/strowb.png", width: 56, height: 80 },
                { src: "/img/bg/nuts3.png", width: 56, height: 80 },
              ],
            },
          },
          opacity: {
            value: 0.8,
          },
          size: {
            value: { min: 50, max: 100 },
          },
          move: {
            enable: true,
            speed: 3,            
            direction: "bottom", 
            straight: false,     
            outModes: {
              default: "out",    
            },
          },
          rotate: {
            value: { min: 0, max: 360 },
            animation: {
              enable: true,
              speed: 5, 
            }
          }
        },
        detectRetina: true,
        
       
        responsive: [
          {
            maxWidth: 768, 
            options: {
              particles: {
                size: {
                 
                  value: { min: 20, max: 45 }, 
                },
                number: {
                  
                  value: 12, 
                }
              }
            }
          }
        ]
      
      }}
    />
  );
}