import { Document, Page } from 'react-pdf';
import { HelpBox } from '../styles/DashboardComponents.styled';
import React, { useEffect, useRef, useState, useMemo } from "react";
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ug1 from  '../../userGuides/Userguide1.jpg'
import ug2 from  '../../userGuides/Userguide2.jpg'
import ug3 from  '../../userGuides/Userguide3.jpg'
import ug4 from  '../../userGuides/Userguide4.jpg'


/**
 * 
 * @param props onClose function, open state variable 
 * @returns Help guide popup
 */
export function HelpGuide(props){
    const { onClose, value: valueProp, open, ...other } = props;

      const handleClose = () => {
        onClose('i');
      };

    return (
          <HelpBox
            onClose={handleClose}
            open={open}
            PaperProps={{
                style: {
                  minHeight: '80vh', 
                  minWidth: '55vw'
                },
              }}
          >
            <DialogTitle sx={{ m: 0, p: 2 , textAlign:'center',fontSize:'30px',fontFamily:'Palanquin Dark'}}>
             Help
            </DialogTitle>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent>
           <div style={{textAlign: 'center'}}>
            <img src={getGuide()} style={{ width: '100%' }}/> 
           </div>
            </DialogContent>
            <DialogActions>
            </DialogActions>
          </HelpBox>
      )

    function getGuide(){
        const ct =  JSON.parse(localStorage.getItem("currentTheme"));

        if(ct===null){
            return ug2
        }else{
            if (ct.name==='green') {
                return ug2
            }if (ct.name==='blue') {
                return ug1
            }if (ct.name==='dark') {
                return ug3
            }if (ct.name==='highcon') {
                return ug4
            }
        }
    }



};